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
 */
export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get('accessToken')?.value

  // Path 1: cookie present and fully valid → hand it straight back.
  if (accessToken) {
    try {
      verifyJWT(accessToken)
      return NextResponse.json({ accessToken })
    } catch {
      // Expired, wrong-signature, or malformed — fall through to refresh.
      // The refresh token (not this cookie) is the security boundary.
    }
  }

  // Path 2: no usable access cookie — try to refresh transparently.
  const refresh = await tryRefreshAccessToken(req)
  if (refresh.ok) {
    const response = NextResponse.json({ accessToken: refresh.accessToken })
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
