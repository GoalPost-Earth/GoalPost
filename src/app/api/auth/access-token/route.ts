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
 * COST OF EACH PATH — measured 2026-09-13 against the dev Aura instance,
 * medians of 20 reps (GOAL-375):
 *
 *   verifyJWT (HS256 signature check)          0.118 ms  ← path 1, whole cost
 *   Neo4j Person-by-id read (indexed MATCH)   14.1 ms
 *   bcrypt.compare, cost 12                  431.1 ms
 *   bcrypt.hash, cost 12 (rotation)          431.3 ms
 *   Neo4j rotation write                      14.8 ms
 *   -----------------------------------------------------
 *   path 1 total                               0.12 ms
 *   path 2 total                             891 ms       (~7500× path 1)
 *
 * The two bcrypt operations are 97% of a refresh; Neo4j is ~3%. That single
 * fact is why the fast path above matters so much and why it must stay
 * first: the bcrypt verify runs ONLY when the access cookie is missing,
 * expired or unverifiable — never on a call a valid cookie could answer.
 * (GOAL-323's logout route splits the same way, reaching for
 * `resolveUserIdFromRefreshCookie` only once the access token has lapsed.)
 *
 * It also explains the ticket's 0.4–2.1 s spread for this hop: a warm call
 * with a live cookie is path 1 and costs nothing measurable, while any call
 * landing on path 2 pays ~0.9 s of deliberate key-stretching that cannot be
 * optimised away without weakening the refresh credential. So GOAL-375
 * attacks WHEN the hop happens — in parallel with the page's JS via the
 * head bootstrap, and once per token lifetime rather than once per minute —
 * rather than what path 2 costs.
 */
export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get('accessToken')?.value

  // Path 1: cookie present and fully valid → hand it straight back.
  if (accessToken) {
    try {
      // `exp` comes back from the verify we were already doing, so the
      // client can size its token cache to the token's real lifetime
      // (GOAL-375) without this route doing any extra work.
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
