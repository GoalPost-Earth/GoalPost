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
 * Two-layer dedupe:
 *   1. In-flight promise — concurrent callers await the same fetch.
 *   2. Token cache keyed on the token's REAL lifetime — back-to-back
 *      callers reuse the token without hitting the network.
 *
 * GOAL-375 changed (2) from a flat 60s TTL to `exp − 60s`, decoded from
 * the JWT payload. The flat TTL meant every 60s-interval background poll
 * (NotificationPanel) paid a `/api/auth/access-token` round-trip while
 * the token it already held was good for another 29 minutes — ~5 hops
 * per idle 5-minute session, each one a cookie-verify hop the user waits
 * on. With the real lifetime the same session makes ≤1.
 *
 * GOAL-375 also added two ways to have a token BEFORE the first fetch:
 *   - `seedAccessToken()` — login / signup / refresh already hold the
 *     token at the moment they set the cookie, so they hand it straight
 *     to this cache and the first query after login makes no hop at all.
 *   - `window.__GP_AUTH_BOOT__` — an inline <script> in the document
 *     <head> (see src/app/layout.tsx) starts the access-token fetch while
 *     the page's JS is still downloading, so the hop overlaps hydration
 *     instead of queueing behind it. The first `getAccessToken()` call
 *     adopts that in-flight promise rather than issuing its own request.
 *
 * Caching a token for its real lifetime creates one hazard the flat 60s
 * TTL used to hide: if the session dies mid-lifetime (JWT_SECRET rotation,
 * an admin revoking the refresh token), this cache would keep handing out
 * a bearer the server rejects, and — because Apollo's `retryIf` skips 4xx
 * — nothing would re-enter `getAccessToken()` to discover it. The old 60s
 * TTL capped that blind spot at a minute. `handleUnauthenticatedResponse()`
 * replaces that safety net with a better one: the moment a caller is told
 * its bearer wasn't accepted, the cache is dropped and re-resolved, so a
 * dead session bounces to /auth/login on the spot instead of after a wait.
 *
 * The cache is module-scoped and lives in MEMORY ONLY — deliberately never
 * localStorage (kb/02 lists a legacy `token` key there; GOAL-375 does not
 * extend that surface, it removed the last writer). It resets on a full
 * page reload. `invalidateAccessTokenCache()` should be called from
 * login/logout flows so cross-session reuse can't happen.
 */

interface CachedToken {
  token: string
  expiresAt: number
}

// Used only when the token's `exp` can't be read (malformed payload, or a
// server that stops setting `exp`). Matches the pre-GOAL-375 behaviour, so
// the failure mode is "as slow as before", never "cached past expiry".
const FALLBACK_CACHE_TTL_MS = 60_000
// Retire the cached token a minute before it actually expires so a request
// that leaves the browser just under the wire still arrives with a valid
// bearer. This is scheduling only — the signature is never checked here;
// the server re-verifies every token it is handed.
const EXPIRY_SKEW_MS = 60_000
// Hard ceiling on how long any token is reused, whatever its `exp` says.
// Access tokens live 30 minutes (ACCESS_TOKEN_TTL_SECONDS), so this never
// binds in normal operation — it exists so a wrong-unit `exp` (milliseconds
// instead of seconds would read as ~55,000 years out) or a badly skewed
// client clock degrades to "re-fetch sooner than needed" rather than
// "cache a dead token for the life of the document".
const MAX_CACHE_TTL_MS = 30 * 60_000
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

/**
 * Read the `exp` claim out of a JWT payload for SCHEDULING ONLY.
 *
 * This is not a verification step and must never be treated as one — the
 * payload is base64, not a signature, so a forged token would decode just
 * as happily. All it decides is when this client stops reusing a token it
 * already has; the server verifies the signature on every request it is
 * actually sent. Returns null for anything that isn't a three-part JWT
 * with a numeric `exp`, and the caller falls back to the flat TTL.
 */
function decodeJwtExpiryMs(token: string): number | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    // `atob` implements forgiving-base64, so the unpadded base64url the
    // JWT spec mandates decodes once `-`/`_` are mapped back. Only `exp`
    // is read, so a mojibake'd name field (atob yields bytes, not UTF-8)
    // cannot affect the result.
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    ) as { exp?: unknown }
    if (typeof payload.exp !== 'number' || !Number.isFinite(payload.exp)) {
      return null
    }
    return payload.exp * 1000
  } catch {
    return null
  }
}

/**
 * When this client should stop reusing `token`: `exp − 60s`, or `now + 60s`
 * if the expiry is unreadable, capped at `MAX_CACHE_TTL_MS`. A token already
 * inside the skew window yields a past timestamp, so it is used for this
 * call and re-fetched on the next one rather than being cached into
 * invalidity.
 *
 * `expiresAtSeconds` (the server's own `exp`, echoed in the response body)
 * is preferred over decoding the payload here, so the scheduling decision
 * rests on the value the server actually signed.
 */
function cacheExpiryFor(token: string, expiresAtSeconds?: number): number {
  const now = Date.now()
  const expMs =
    typeof expiresAtSeconds === 'number' && Number.isFinite(expiresAtSeconds)
      ? expiresAtSeconds * 1000
      : decodeJwtExpiryMs(token)
  if (expMs === null) return now + FALLBACK_CACHE_TTL_MS
  return Math.min(expMs - EXPIRY_SKEW_MS, now + MAX_CACHE_TTL_MS)
}

/**
 * Shape parked on `window.__GP_AUTH_BOOT__` by the head <script> in
 * src/app/layout.tsx. `status` is the HTTP status so this module can apply
 * exactly the same session-expiry semantics it applies to its own fetch;
 * the whole promise resolves to null if the request never completed.
 */
type AuthBootResult = {
  status: number
  accessToken?: string
  expiresAt?: number
} | null

let bootConsumed = false

/**
 * Hand back the head-script's in-flight `/api/auth/access-token` promise,
 * exactly once, and clear the global.
 *
 * The clear is hygiene, not a security boundary — a promise is
 * multi-subscriber, so any script that ran before this point could already
 * have attached its own `.then`. It is not trying to be one: same-origin
 * script that can reach `window` can equally call the cookie-authenticated
 * `/api/auth/access-token` itself and get the same token. What the clear
 * does buy is that a later caller — or a post-login invalidation — can't
 * adopt a token minted for a session that has since been replaced.
 */
function takeAuthBoot(): Promise<AuthBootResult> | null {
  if (bootConsumed || typeof window === 'undefined') return null
  bootConsumed = true
  const holder = window as unknown as {
    __GP_AUTH_BOOT__?: Promise<AuthBootResult>
  }
  const boot = holder.__GP_AUTH_BOOT__
  delete holder.__GP_AUTH_BOOT__
  return boot ?? null
}

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

/** A token plus the server's own expiry for it, when it supplied one. */
type ResolvedToken = { token: string; expiresAt?: number }

/** Issue the request ourselves. Returns null for "no token right now". */
async function fetchTokenFromNetwork(): Promise<ResolvedToken | null> {
  try {
    // The access-token endpoint now auto-refreshes when the cookie is
    // missing, expired, OR unverifiable (wrong-signature / malformed), so
    // a single call is enough — no client-side chaining to
    // /api/auth/refresh-token. Any 401 here is therefore terminal: the
    // server already tried to refresh and the session is genuinely over.
    const res = await fetch('/api/auth/access-token', {
      credentials: 'include',
      // The 200 body carries a bearer token; it must never sit in a shared
      // or back-forward cache.
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

async function fetchTokenOnce(): Promise<ResolvedToken | null> {
  // The head <script> may already have this request in flight — started
  // during HTML parse, i.e. before the bundle that contains this module
  // had even downloaded. Adopting it is the whole point of GOAL-375: the
  // hop overlaps hydration instead of following it.
  const boot = takeAuthBoot()
  if (boot) {
    const result = await boot
    if (result) {
      if (result.status === 200 && typeof result.accessToken === 'string') {
        return result.accessToken
          ? { token: result.accessToken, expiresAt: result.expiresAt }
          : null
      }
      // 401 is terminal and 429 must not be retried into the rate limiter
      // it just tripped — both resolve here. Anything else (5xx, a proxy
      // error page) is transient, so fall through and let the module make
      // its own attempt rather than starting the whole page unauthenticated
      // on the strength of one bad response.
      if (result.status === 401) emitSessionExpired()
      if (result.status === 401 || result.status === 429) return null
    }
    // A boot that never completed (offline, aborted navigation) also falls
    // through. Note this is a fall-through, not a cancellation: the boot
    // request itself may still be in flight, so this is the one path on
    // which the page can make the request twice. That is the correct
    // trade — a duplicate GET beats a first render with no bearer.
  }

  return fetchTokenFromNetwork()
}

/**
 * Resolve a fresh access token. Concurrent callers share the in-flight
 * fetch; later callers reuse the cached token — for as long as the token
 * itself is actually valid — without re-fetching.
 */
export async function getAccessToken(): Promise<string | null> {
  const now = Date.now()
  if (cached && cached.expiresAt > now) return cached.token
  if (now < denyUntil) return null
  if (inflight) return inflight

  const promise = fetchTokenOnce().then((resolved) => {
    if (resolved) {
      cached = {
        token: resolved.token,
        expiresAt: cacheExpiryFor(resolved.token, resolved.expiresAt),
      }
      denyUntil = 0
      return resolved.token
    }
    cached = null
    denyUntil = Date.now() + NEGATIVE_CACHE_TTL_MS
    return null
  })
  inflight = promise
  try {
    return await promise
  } finally {
    if (inflight === promise) inflight = null
  }
}

/**
 * Seed the cache with a token the caller already holds.
 *
 * Login, signup and refresh all mint the access token and set it as an
 * HttpOnly cookie — and then, before GOAL-375, the very next GraphQL query
 * went and asked `/api/auth/access-token` for the token that had just been
 * handed to the page. This closes that loop: the response body carries the
 * same token as the cookie, so the first query after login goes out with a
 * bearer already attached and makes no round-trip.
 *
 * `expiresAtSeconds` is the server's epoch-seconds expiry; when absent the
 * expiry is read from the token itself. MEMORY ONLY — callers must not
 * persist the value (no localStorage, no logging).
 */
export function seedAccessToken(
  token: string,
  expiresAtSeconds?: number
): void {
  if (typeof token !== 'string' || !token) return
  cached = { token, expiresAt: cacheExpiryFor(token, expiresAtSeconds) }
  denyUntil = 0
  // A seed is always newer than anything the boot script could have
  // fetched, so drop that promise rather than let a later call adopt a
  // token minted for the session we just replaced.
  takeAuthBoot()
}

/** Drop the cached token. Call from login/logout flows. */
export function invalidateAccessTokenCache(): void {
  cached = null
  denyUntil = 0
  // Same reasoning as in `seedAccessToken`: a pending boot fetch belongs to
  // the session being torn down here, so it must not survive it.
  takeAuthBoot()
}

/**
 * Report that a request went out with this cache's bearer and came back
 * rejected. Drops the cached token and immediately re-resolves one.
 *
 * This is the safety net the flat 60s TTL used to provide by accident.
 * Caching for the token's real lifetime is the point of GOAL-375, but it
 * means a session that dies MID-lifetime — `JWT_SECRET` rotated, refresh
 * token revoked on a shared device — would otherwise keep being served a
 * bearer the server rejects for up to 29 minutes, with nothing to notice:
 * `/api/graphql` answers a bad bearer with HTTP 200 and an "Unauthenticated"
 * GraphQL error (it never 401s), and Apollo's `retryIf` skips 4xx, so
 * `getAccessToken()` is never re-entered.
 *
 * Re-resolving here turns that into an immediate, correct outcome:
 *   - the bearer was merely stale (secret rotation, but the refresh cookie
 *     is still good) → a fresh token is cached and the next request works;
 *   - the session is genuinely over → the 401 fires `session-expired`,
 *     and AppContext bounces to /auth/login with returnTo.
 *
 * Safe to call on every rejected request: `inflight` collapses concurrent
 * calls into one fetch, and the negative cache rate-limits a dead session
 * to one attempt per 3s rather than one per failed query.
 */
export function handleUnauthenticatedResponse(): void {
  invalidateAccessTokenCache()
  // Fire-and-forget: the caller is an error handler, not an awaiter. Errors
  // are already swallowed inside getAccessToken.
  void getAccessToken()
}

/** Build an `Authorization: Bearer` header (or {} if unauthenticated). */
export async function authorizationHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}
