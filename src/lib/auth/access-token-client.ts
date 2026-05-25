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
 *   2. Short-TTL token cache — back-to-back callers reuse the token
 *      without hitting the network. 60s is well under the 30-minute
 *      access-token TTL, so the cache is always fresh enough.
 *
 * The cache is module-scoped and lives in the browser; it resets on a
 * full page reload. `invalidateAccessTokenCache()` should be called from
 * login/logout flows so cross-session reuse can't happen.
 */

interface CachedToken {
  token: string
  expiresAt: number
}

const CACHE_TTL_MS = 60_000

let inflight: Promise<string | null> | null = null
let cached: CachedToken | null = null

/**
 * Dispatched when `/api/auth/access-token` definitively reports the
 * caller is unauthenticated (`ERR_UNAUTHENTICATED` — refresh also
 * failed). `AppContext` listens via `onSessionExpired` and runs
 * `handleLogout()` to clear local state + redirect to /auth/login, so a
 * logged-in user whose refresh cookie expired/revoked gets logged out
 * cleanly instead of seeing a stream of 401s.
 *
 * Uses a module-private `EventTarget` rather than `window` so other
 * in-page scripts (including any future XSS) can't dispatch a forged
 * `gp:session-expired` event to force-logout the user from any tab.
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

async function fetchTokenOnce(): Promise<string | null> {
  try {
    // The access-token endpoint now auto-refreshes when the cookie is
    // missing or expired, so a single call is enough — no client-side
    // chaining to /api/auth/refresh-token. A 401 here means the session
    // is genuinely over (refresh also failed) and we should log out.
    const res = await fetch('/api/auth/access-token', {
      credentials: 'include',
    })
    if (res.ok) {
      const data = (await res.json()) as { accessToken?: string }
      if (typeof data.accessToken === 'string' && data.accessToken) {
        return data.accessToken
      }
      return null
    }
    if (res.status === 401) {
      const body = (await res.json().catch(() => ({}))) as { code?: string }
      if (body.code === 'ERR_UNAUTHENTICATED') {
        emitSessionExpired()
      }
    }
  } catch {
    // network blip — caller treats null as "unauthenticated for now"
  }
  return null
}

/**
 * Resolve a fresh access token. Concurrent callers share the in-flight
 * fetch; back-to-back callers within 60s reuse the cached token without
 * re-fetching.
 */
export async function getAccessToken(): Promise<string | null> {
  const now = Date.now()
  if (cached && cached.expiresAt > now) return cached.token
  if (inflight) return inflight

  const promise = fetchTokenOnce()
  inflight = promise
  try {
    const token = await promise
    if (token) {
      cached = { token, expiresAt: now + CACHE_TTL_MS }
    } else {
      cached = null
    }
    return token
  } finally {
    if (inflight === promise) inflight = null
  }
}

/** Drop the cached token. Call from login/logout flows. */
export function invalidateAccessTokenCache(): void {
  cached = null
}

/** Build an `Authorization: Bearer` header (or {} if unauthenticated). */
export async function authorizationHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}
