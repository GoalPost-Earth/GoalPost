'use client'

/**
 * Shared client-side helper for resolving a fresh access token.
 *
 * Without this, every caller that needs to attach `Authorization: Bearer`
 * (Apollo's authLink, the chat thread client, OnboardingContext, etc.)
 * independently hits `/api/auth/access-token` and, if that returns 401,
 * falls through to `/api/auth/refresh-token`. The refresh route ROTATES
 * the refresh token on every successful call — so when N components fire
 * in parallel after a cookie expiry (e.g. on a page mount that spawns
 * Apollo queries, focal-entity fetches, AND a thread-list refetch all at
 * once), only the FIRST refresh wins and the others race against the
 * now-rotated token and return 401. The user perceives this as the page
 * "logging them out at random" or as the threads sidebar showing 401s.
 *
 * Three layers (GOAL-375):
 *   1. Boot handoff — the root layout fires the very first
 *      `/api/auth/access-token` from a nonce'd inline `<script>` during HTML
 *      parse, so the hop overlaps the JS download + hydration instead of
 *      queueing behind them. The first caller here consumes that parked
 *      result instead of issuing its own fetch. See `access-token-boot.ts`.
 *   2. In-flight promise — concurrent callers await the same fetch.
 *   3. Token cache keyed on the token's REAL lifetime — valid until
 *      `exp − 60s`, decoded from the JWT payload client-side. This used to
 *      be a flat 60s, which meant a background poller (NotificationPanel,
 *      60s interval) paid the round-trip every single minute even though the
 *      token it already held was good for another 29. Measured on dev: 5
 *      calls in a 5-minute idle session → 1.
 *
 * The cache is module-scoped and lives in the browser; it resets on a
 * full page reload. `invalidateAccessTokenCache()` should be called from
 * login/logout flows so cross-session reuse can't happen.
 *
 * Nothing here is a security boundary. Decoding `exp` is SCHEDULING ONLY —
 * there is no signature check, and a client that lied to itself about the
 * expiry would simply hand a stale bearer to the server and get a 401. The
 * token is held in memory only and is never written to localStorage.
 */

import {
  ACCESS_TOKEN_BOOT_PROPERTY,
  type AccessTokenBootWindow,
} from './access-token-boot'

interface CachedToken {
  token: string
  /** Epoch ms after which this entry must be re-resolved. */
  expiresAt: number
}

/** Resolved token plus the expiry the server reported, if it did. */
interface ResolvedToken {
  token: string
  /** Unix SECONDS, straight from the route's JSON body. */
  expiresAt?: number
}

// Used only when a token's `exp` cannot be read (unparseable payload). Matches
// the flat TTL this module shipped with, so the degraded path is never worse
// than the old behaviour.
const FALLBACK_CACHE_TTL_MS = 60_000

// Retire a cached token this long before it actually expires, so a request
// that resolves its bearer and then spends a moment in Apollo's link chain
// can't arrive at the server with a token that lapsed in flight.
const EXPIRY_SKEW_MS = 60_000

// Floor for a computed cache lifetime. Without it, a token inside its final
// `EXPIRY_SKEW_MS` would compute an already-past expiry, so EVERY caller would
// miss the cache and re-fetch — and the server has nothing better to give,
// since the token is still valid and path 1 hands back the same one. That
// turned a ~60s window of each 30-minute cycle into a request per operation.
// Serving a bearer with a few seconds left is no worse than the flat 60s TTL
// this replaced: worst case one 401, then a refresh.
const MIN_CACHE_TTL_MS = 5_000
// Short negative-cache window. When a fetch resolves to "no token"
// (unauthenticated / network blip), back-to-back callers return null
// immediately for this long instead of each re-hitting the endpoint.
// This is what stops a dead session from snowballing into a request
// storm: Apollo's RetryLink + simultaneous re-renders would otherwise
// fire dozens of /api/auth/access-token calls per second while the
// session-expired redirect is still in flight. Kept short so a genuine
// transient blip recovers within a couple seconds.
const NEGATIVE_CACHE_TTL_MS = 3_000

let inflight: Promise<string | null> | null = null
let cached: CachedToken | null = null
let denyUntil = 0

// Session generation. Bumped by `invalidateAccessTokenCache` and
// `seedAccessToken`; captured by an in-flight resolve before it starts and
// re-checked before it writes back.
//
// Without this fence, a fetch begun under user A could land AFTER a same-tab
// swap to user B (login → `invalidateAccessTokenCache()` → `seedAccessToken(B)`)
// and overwrite B's cache with A's bearer — so B's GraphQL traffic would carry
// A's `$jwt.user.id` and resolve `@authorization` filters against A's Spaces.
// The race predates this module's exp-based cache, but that cache is exactly
// what makes it matter: a poisoned entry now survives until the token expires
// rather than 60 seconds. The same stale resolve could also null out B's
// freshly-seeded token and set the negative cache, sending B's first queries
// out with no bearer at all.
let sessionEpoch = 0

/**
 * Dispatched when `/api/auth/access-token` definitively reports the
 * caller is unauthenticated (`ERR_UNAUTHENTICATED` — refresh also
 * failed). `AppContext` listens via `onSessionExpired` and runs
 * `clearLocalSession()` to clear local state + redirect to /auth/login, so
 * a logged-in user whose refresh cookie expired/revoked gets logged out
 * cleanly instead of seeing a stream of 401s.
 *
 * Note this is deliberately the LOCAL cleanup, not the full `logout()`:
 * the 401 response already expired the auth cookies (`clearAuthCookies` in
 * `/api/auth/access-token`), and the refresh token that got us here is
 * revoked or expired — so a round-trip to `/api/auth/logout` would be a
 * request that can authenticate nothing.
 *
 * Uses a module-private `EventTarget` rather than `window` so other
 * in-page scripts (including any future XSS) can't dispatch a forged
 * `session-expired` event to force-logout the user from any tab.
 */
const sessionEventBus =
  typeof EventTarget !== 'undefined' ? new EventTarget() : null
const SESSION_EXPIRED_EVENT = 'session-expired'

function emitSessionExpired(): void {
  sessionEventBus?.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
}

export function onSessionExpired(handler: () => void): () => void {
  if (!sessionEventBus) return () => {}
  sessionEventBus.addEventListener(SESSION_EXPIRED_EVENT, handler)
  return () =>
    sessionEventBus.removeEventListener(SESSION_EXPIRED_EVENT, handler)
}

/**
 * Read the `exp` claim out of a JWT payload, in epoch ms.
 *
 * SCHEDULING ONLY — there is deliberately no signature verification here.
 * The client cannot verify a signature (it has no secret) and does not need
 * to: this value decides nothing but when to re-fetch. The server re-verifies
 * the signature on every request the token is attached to, so a tampered
 * `exp` costs the tamperer a 401, not access.
 *
 * Returns null for anything that isn't a decodable payload with a numeric
 * `exp`; callers fall back to `FALLBACK_CACHE_TTL_MS`.
 */
function decodeJwtExpMs(token: string): number | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    // base64url → base64. `atob` tolerates the missing padding.
    const bytes = Uint8Array.from(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/')),
      (c) => c.charCodeAt(0)
    )
    // Decode as UTF-8 — a name with a non-ASCII character in the payload
    // would otherwise come back as mojibake and fail JSON.parse.
    const exp = (
      JSON.parse(new TextDecoder().decode(bytes)) as { exp?: unknown }
    ).exp
    return typeof exp === 'number' && Number.isFinite(exp) ? exp * 1000 : null
  } catch {
    return null
  }
}

/**
 * Epoch-ms instant after which `token` should no longer be handed out: its
 * own expiry minus `EXPIRY_SKEW_MS`. MAY BE IN THE PAST — that is the signal
 * "this token is spent", which `resolveTokenOnce` uses to reject a boot
 * result that aged out while the tab sat open.
 *
 * Takes the EARLIER of the token's own `exp` and the `expiresAt` the auth
 * routes report in their JSON body. The two are computed independently on the
 * server — the routes read the clock themselves, while `signJWT` derives `exp`
 * from `expiresIn: '30m'` — so they agree today only because both read the
 * same second. Trusting the body alone would mean a future edit that reported
 * the wrong number (the refresh token's 30-day expiry, say) could pin a dead
 * bearer in cache for weeks. The JWT's own claim is ground truth and is always
 * in hand, so `min()` costs nothing and makes this immune to server drift.
 */
function usableUntilMs(token: string, expiresAtSeconds?: number): number {
  const reportedExpMs =
    typeof expiresAtSeconds === 'number' && Number.isFinite(expiresAtSeconds)
      ? expiresAtSeconds * 1000
      : null

  const candidates = [decodeJwtExpMs(token), reportedExpMs].filter(
    (v): v is number => v !== null
  )
  if (candidates.length === 0) return Date.now() + FALLBACK_CACHE_TTL_MS
  return Math.min(...candidates) - EXPIRY_SKEW_MS
}

/**
 * Consume the result the root layout's boot script parked on `window`.
 *
 * Consumed EXACTLY ONCE (the property is deleted on read) so a later cache
 * miss — 30 minutes into the session, say — re-resolves against the server
 * rather than replaying a long-dead boot response.
 */
function takeBootResult() {
  if (typeof window === 'undefined') return null
  const w = window as unknown as AccessTokenBootWindow
  const boot = w[ACCESS_TOKEN_BOOT_PROPERTY]
  if (!boot) return null
  delete w[ACCESS_TOKEN_BOOT_PROPERTY]
  return boot
}

async function fetchTokenOnce(): Promise<ResolvedToken | null> {
  try {
    // The access-token endpoint now auto-refreshes when the cookie is
    // missing, expired, OR unverifiable (wrong-signature / malformed), so
    // a single call is enough — no client-side chaining to
    // /api/auth/refresh-token. Any 401 here is therefore terminal: the
    // server already tried to refresh and the session is genuinely over.
    const res = await fetch('/api/auth/access-token', {
      credentials: 'include',
      // Never replay a bearer from the HTTP cache, however the route's
      // headers might change later. Mirrors the boot script.
      cache: 'no-store',
    })
    if (res.ok) {
      const data = (await res.json()) as {
        accessToken?: string
        expiresAt?: number
      }
      if (typeof data.accessToken === 'string' && data.accessToken) {
        return { token: data.accessToken, expiresAt: data.expiresAt }
      }
      return null
    }
    if (res.status === 401) {
      // Terminal — log out + redirect. Emit on ANY 401 (not just
      // ERR_UNAUTHENTICATED): the endpoint is authoritative now, so a 401
      // always means "session over." Emitting unconditionally also closes
      // the loop that produced the runaway 401 storm — without it, a
      // non-ERR_UNAUTHENTICATED 401 (e.g. a stale-secret cookie) left the
      // client spinning forever instead of bouncing to /auth/login.
      emitSessionExpired()
    }
  } catch {
    // network blip — caller treats null as "unauthenticated for now"
  }
  return null
}

/**
 * Resolve the token for this page load, preferring the boot script's
 * already-in-flight (or already-finished) fetch over a fresh one.
 */
async function resolveTokenOnce(): Promise<ResolvedToken | null> {
  const boot = takeBootResult()
  if (boot) {
    const result = await boot
    if (result.ok && result.accessToken) {
      // Guard against replaying a boot response from a tab that has been
      // sitting open longer than the token's 30-minute life: if it's already
      // spent, treat the boot as a miss and go ask again.
      if (usableUntilMs(result.accessToken, result.expiresAt) > Date.now()) {
        return { token: result.accessToken, expiresAt: result.expiresAt }
      }
    } else if (!result.ok && result.status === 401) {
      // Same contract as `fetchTokenOnce`: the route already tried to
      // refresh, so a 401 is terminal — log out + redirect.
      emitSessionExpired()
      return null
    } else if (!result.ok && result.status === 429) {
      // Throttled (GOAL-249). Retrying immediately from `fetchTokenOnce`
      // would just take a second slot from the same bucket, so report "no
      // token for now" and let the negative cache hold callers off.
      return null
    }
    // Anything else (a network blip during boot, an unexpected body, a
    // token that aged out) falls through to a normal fetch rather than
    // being reported as a dead session.
  }
  return fetchTokenOnce()
}

function cacheToken(token: string, expiresAtSeconds?: number): void {
  // Floored, unlike `usableUntilMs` itself: caching a past instant would make
  // every single caller miss and re-fetch for the token's last minute of life.
  const expiresAt = Math.max(
    usableUntilMs(token, expiresAtSeconds),
    Date.now() + MIN_CACHE_TTL_MS
  )
  cached = { token, expiresAt }
}

/**
 * Resolve a fresh access token. Concurrent callers share the in-flight
 * fetch; later callers reuse the cached token — for as long as that token is
 * actually valid — without re-fetching.
 */
export async function getAccessToken(): Promise<string | null> {
  const now = Date.now()
  if (cached && cached.expiresAt > now) return cached.token
  if (now < denyUntil) return null
  if (inflight) return inflight

  const startedEpoch = sessionEpoch
  const promise = (async () => {
    const result = await resolveTokenOnce()
    // The session changed under us (login, logout, session-expiry) while this
    // was in flight. Hand the token back to whoever is still awaiting THIS
    // promise, but do not write it into the cache that now belongs to a
    // different user.
    if (sessionEpoch !== startedEpoch) return result?.token ?? null
    if (result) {
      cacheToken(result.token, result.expiresAt)
      denyUntil = 0
      return result.token
    }
    cached = null
    denyUntil = Date.now() + NEGATIVE_CACHE_TTL_MS
    return null
  })()
  inflight = promise
  try {
    return await promise
  } finally {
    if (inflight === promise) inflight = null
  }
}

/**
 * Seed the cache with a token the client already holds — the one `/login` and
 * `/signup` now return in their JSON body alongside setting the HttpOnly
 * cookie (GOAL-375). Without this, the very first query after a sign-in paid
 * a `/api/auth/access-token` round-trip to be told a token the response had
 * just handed us.
 *
 * This cache is memory only, by design — nothing here writes the bearer to
 * localStorage. (`kb/02` documents a legacy `token` key that the login and
 * signup pages still write for `dashboard/import`; that write predates this
 * and is untouched, but nothing new is added to that surface.) A page reload
 * re-resolves via the boot script, which reads the HttpOnly cookie the
 * browser kept anyway.
 *
 * Call AFTER `setUser`, which invalidates the cache on every user swap.
 */
export function seedAccessToken(token: string, expiresAt?: number): void {
  if (!token) return
  // Fence first: a resolve still in flight from the previous session must not
  // land on top of the token we are about to seed.
  sessionEpoch++
  inflight = null
  cacheToken(token, expiresAt)
  denyUntil = 0
}

/** Drop the cached token. Call from login/logout flows. */
export function invalidateAccessTokenCache(): void {
  // Bump first so any in-flight resolve fails its epoch check and cannot
  // re-populate the cache we are clearing.
  sessionEpoch++
  inflight = null
  cached = null
  denyUntil = 0
  // Also drop any unconsumed boot result. It was fetched with the PREVIOUS
  // session's cookies, so replaying it after a user swap in the same tab
  // would hand user B a bearer minted for user A. Return value discarded —
  // this is called for the delete.
  takeBootResult()
}

/** Build an `Authorization: Bearer` header (or {} if unauthenticated). */
export async function authorizationHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}
