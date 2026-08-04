import { NextRequest, NextResponse } from 'next/server'
import { getSession, initializeDB } from '../neo4j'
import { resolveAuthenticatedUserId } from '../utils'
import { clearAuthCookies, resolveUserIdFromRefreshCookie } from '../refresh'
import { clientIp, rateLimit } from '@/lib/auth/rate-limit'

/**
 * POST /api/auth/logout — end the caller's own session (GOAL-323).
 *
 * Two things have to happen, and only the server can do either:
 *
 *   1. Expire the `accessToken` + `refreshToken` cookies — both HttpOnly, so
 *      the client physically cannot. See `clearAuthCookies`.
 *   2. Revoke `Person.refreshToken` so the 30-day credential can't keep
 *      minting fresh access tokens even if the cookie were exfiltrated.
 *      `tryRefreshAccessToken` honours `refreshTokenRevoked`, so this
 *      genuinely ends the session server-side.
 *
 * Authorization is self-service only (kb/02-user-roles.md — no Space roles
 * involved): the caller may only revoke the session they can prove they
 * hold. The identity comes from the signed access token, or failing that
 * from a bcrypt-verified refresh cookie — never from a client-supplied
 * email. Trusting a body field here would let any anonymous caller revoke
 * any user's session by address, which is a forced-logout DoS and an
 * account-existence oracle.
 *
 * No activity Log is written. `Log` requires a `LOGGED_FOR` edge to a
 * GoalPulse / ResourcePulse / FieldPulse (kb/05-data-entities.md) — a
 * session event has no pulse to point at, so the entity cannot represent
 * it. (Login and signup don't log either, for the same reason.)
 *
 * Accepted residual risks, out of scope per GOAL-323:
 *   - An access token exfiltrated before logout stays cryptographically
 *     valid until its 30-minute expiry. Killing that needs a denylist.
 *   - Subdomains are same-site, so a page on any `*.goalpost.earth` origin
 *     could force a logout with cookies attached. SameSite=Lax blocks true
 *     cross-site CSRF; the residual is annoyance-grade (victim logs back
 *     in — no disclosure, no privilege change), and an Origin allowlist
 *     fails in the wrong direction: a misconfigured origin would silently
 *     stop revoking sessions.
 */
export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })
  }

  // Expiring the caller's own cookies needs no authorization — a Set-Cookie
  // on this response can only affect the browser that made the request. Doing
  // it unconditionally means even a wedged client (unverifiable access cookie,
  // refresh cookie already dead) can always shed its credentials instead of
  // being stuck re-sending them. Revocation below is the part that's gated.
  const response = NextResponse.json(
    { success: true, message: 'Logged out successfully' },
    { status: 200 }
  )
  clearAuthCookies(response)

  try {
    // Preferred path: the signed access token. Cheap — a verify, no DB hit.
    let userId = resolveAuthenticatedUserId(req)

    // Fallback: access token lapsed but the refresh cookie is still live.
    // This branch does a bcrypt compare, so it gets an auth-burst budget of
    // its own (a separate key from /refresh-token's — a logout must not be
    // throttled by unrelated refresh traffic, and vice versa).
    //
    // The budget is only spent when there IS a refresh cookie to verify.
    // Charging for cookie-less requests would let anyone sharing an egress
    // IP — office NAT, shared wifi — burn the minute's budget with five
    // empty POSTs and silently suppress a real logout's revocation on that
    // IP, which is precisely the failure this route exists to prevent.
    //
    // Being throttled must NOT 429 the caller either: the cookies are
    // already expired above, and failing a logout closed would leave the
    // session alive — the worse outcome in both directions.
    if (!userId && req.cookies.get('refreshToken')?.value) {
      const burst = await rateLimit({
        policy: 'auth-burst',
        key: `logout:${clientIp(req)}`,
      })
      if (burst.allowed) {
        userId = await resolveUserIdFromRefreshCookie(req)
      }
    }

    if (!userId) {
      // Nothing to revoke — the caller couldn't prove they hold a session.
      return response
    }

    initializeDB()
    const session = getSession()
    try {
      await session.run(
        `MATCH (user:Person {id: $userId})
         SET user.refreshTokenRevoked = true,
             user.refreshToken = NULL,
             user.refreshTokenExp = 0
         RETURN user.id AS id`,
        { userId }
      )
    } finally {
      await session.close()
    }

    return response
  } catch (err) {
    // Revocation failed (Neo4j unreachable, etc.). Still hand back the
    // cookie-expiring headers — shedding the browser's credentials is the
    // bulk of the benefit and must not be lost to a DB blip. The status
    // stays 5xx so the failure is visible in monitoring rather than
    // silently reported as a clean logout. The raw error is logged
    // server-side only; the body is a fixed string so Neo4j/Cypher
    // internals never reach an unauthenticated caller.
    console.error('🚀 ~ logout/route.ts ~ revocation failed:', err)
    const failure = NextResponse.json(
      { error: 'Failed to fully end the session', code: 'ERR_LOGOUT_FAILED' },
      { status: 500 }
    )
    clearAuthCookies(failure)
    return failure
  }
}
