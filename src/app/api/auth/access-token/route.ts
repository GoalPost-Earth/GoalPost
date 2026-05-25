import { NextRequest, NextResponse } from 'next/server'
import { rateLimited } from '@/lib/auth/rate-limit'
import { verifyJWT } from '../utils'
import { setAuthCookies, tryRefreshAccessToken } from '../refresh'

/**
 * Resolve a usable access token for the caller.
 *
 * Behaviour, in order:
 *   1. Cookie present + signature valid + not expired → return it (200).
 *   2. Cookie missing OR expired → attempt to refresh using the HttpOnly
 *      refresh cookie. On success, set new cookies + return the new token
 *      (200). The caller never sees the in-between 401 — chained
 *      access-token → refresh-token round-trips were the dominant source of
 *      noisy 401s in the network panel for a still-logged-in user.
 *   3. Cookie present but signature invalid (tampered) → 401 with
 *      `ERR_INVALID_ACCESS_TOKEN`. Don't attempt refresh — a forged token
 *      is a security signal, not a "needs refresh" signal.
 *   4. Refresh also fails (no refresh cookie / revoked / expired) → 401
 *      with `ERR_UNAUTHENTICATED`. The session is genuinely over; the
 *      client should clear local state and bounce to /auth/login.
 */
export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get('accessToken')?.value

  // Path 1 / 3: cookie present.
  if (accessToken) {
    try {
      verifyJWT(accessToken)
      return NextResponse.json({ accessToken })
    } catch (err) {
      const isExpired =
        (err as { name?: string })?.name === 'TokenExpiredError'
      if (!isExpired) {
        // Tampered / wrong-signature / malformed — refusing to refresh.
        return NextResponse.json(
          {
            error: 'Invalid access token',
            code: 'ERR_INVALID_ACCESS_TOKEN',
          },
          { status: 401 }
        )
      }
      // Expired — fall through to refresh.
    }
  }

  // Path 2: cookie missing or expired — try to refresh transparently.
  const refresh = await tryRefreshAccessToken(req)
  if (refresh.ok) {
    const response = NextResponse.json({ accessToken: refresh.accessToken })
    setAuthCookies(response, refresh)
    return response
  }

  if (refresh.code === 'ERR_RATE_LIMITED') {
    return rateLimited(refresh.retryAfter ?? 60)
  }

  // Path 4: refresh failed — the session is over.
  return NextResponse.json(
    {
      error: refresh.message,
      code: 'ERR_UNAUTHENTICATED',
    },
    { status: 401 }
  )
}
