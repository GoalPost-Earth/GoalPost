import { NextRequest, NextResponse } from 'next/server'
import { rateLimited } from '@/lib/auth/rate-limit'
import { verifyJWT } from '../utils'
import {
  clearAuthCookies,
  setAuthCookies,
  tryRefreshAccessToken,
} from '../refresh'

/**
 * Resolve a usable access token for the caller.
 *
 * Behaviour, in order:
 *   1. Cookie present + signature valid + not expired → return it (200).
 *   2. Cookie missing, expired, OR unverifiable (wrong-signature /
 *      malformed) → attempt to refresh using the HttpOnly refresh cookie.
 *      On success, set new cookies + return the new token (200). The
 *      caller never sees the in-between 401 — chained access-token →
 *      refresh-token round-trips were the dominant source of noisy 401s
 *      in the network panel for a still-logged-in user.
 *
 *      A wrong-signature access cookie is NOT treated as a "refuse to
 *      refresh" security signal. It is the expected state for every
 *      logged-in user after the server's `JWT_SECRET` rotates (or on a
 *      preview deploy carrying a different secret), and refusing to
 *      refresh wedged those users into an unrecoverable 401 storm: the
 *      cookie can never verify, the route never refreshes, and the client
 *      never logs out. Refusing also bought no security — an attacker
 *      with a forged access token but no valid refresh cookie simply omits
 *      the access cookie to reach this same refresh path. The real
 *      security boundary is the HttpOnly refresh token, validated below
 *      against the bcrypt hash in Neo4j; a forged access token cannot
 *      satisfy it.
 *   3. Refresh also fails (no refresh cookie / revoked / expired) → 401
 *      with `ERR_UNAUTHENTICATED`, and the stale auth cookies are CLEARED
 *      on the response. The session is genuinely over; clearing the
 *      unverifiable cookie stops the client from re-sending it on a loop,
 *      and the client clears local state + bounces to /auth/login.
 *
 * COST OF EACH PATH — measured on dev, 2026-09-13 (GOAL-375), warm Next
 * server, Neo4j Aura dev, 5 reps each, medians:
 *
 *   Path 1 (JWT signature check only)  ......................    9 ms
 *   Path 2 (refresh)                   ....................  ~980 ms
 *     └ bcryptjs compare, 12 rounds ....................  434 ms
 *     └ bcryptjs hash (rotation), 12 rounds ............  429 ms
 *     └ Neo4j read  (Person-by-indexed-id)  ............   12 ms
 *     └ Neo4j write (refresh-token rotation)  ..........  ~13 ms
 *
 * So the expensive path is ~91% bcrypt and ~2.5% Neo4j — bcryptjs is a pure-JS
 * implementation, so 12 rounds costs ~430 ms per operation with no native
 * acceleration. Path 1 must therefore stay the fast path: the JWT signature
 * check is ~100× cheaper than the bcrypt verification, and this route is hit
 * on every page load and every background poll. It already short-circuits
 * correctly — the bcrypt compare below runs ONLY when the access cookie is
 * missing, expired, or unverifiable — and it must stay that way.
 */
export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get('accessToken')?.value

  // Path 1: cookie present and fully valid → hand it straight back.
  if (accessToken) {
    try {
      // Returns the decoded payload; `exp` (unix seconds) goes back in the
      // body so the client can cache the bearer for its real remaining life
      // instead of re-asking every 60s (GOAL-375). Not a secret — it is a
      // claim of the token sitting in the same response.
      const decoded = verifyJWT(accessToken) as { exp?: number }
      return NextResponse.json({ accessToken, expiresAt: decoded?.exp })
    } catch {
      // Expired, wrong-signature, or malformed — fall through to refresh.
      // The refresh token (not this cookie) is the security boundary.
    }
  }

  // Path 2: no usable access cookie — try to refresh transparently.
  const refresh = await tryRefreshAccessToken(req)
  if (refresh.ok) {
    const response = NextResponse.json({
      accessToken: refresh.accessToken,
      expiresAt: refresh.expiresAt,
    })
    setAuthCookies(response, refresh)
    return response
  }

  if (refresh.code === 'ERR_RATE_LIMITED') {
    return rateLimited(refresh.retryAfter ?? 60)
  }

  // Path 3: refresh failed — the session is over. Clear the stale cookies
  // so a wedged client stops re-sending an access token that can never
  // verify, then signal the client to log out + redirect.
  const response = NextResponse.json(
    {
      error: refresh.message,
      code: 'ERR_UNAUTHENTICATED',
    },
    { status: 401 }
  )
  clearAuthCookies(response)
  return response
}
