import { NextRequest, NextResponse } from 'next/server'
import { getSession, initializeDB } from './neo4j'
import { comparePassword, hashPassword, signJWT } from './utils'
import { clientIp, rateLimit } from '@/lib/auth/rate-limit'

export const ACCESS_TOKEN_TTL_SECONDS = 60 * 30
export const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30

export type RefreshResult =
  | {
      ok: true
      accessToken: string
      refreshToken: string
    }
  | {
      ok: false
      code:
        | 'ERR_NO_REFRESH_TOKEN'
        | 'ERR_INVALID_REFRESH_TOKEN'
        | 'ERR_REFRESH_FAILED'
        | 'ERR_RATE_LIMITED'
      message: string
      retryAfter?: number
    }

/**
 * Pull the Person id out of a raw refresh token. Tokens are minted as
 * `${userId}.${secret}` so we can do an indexed Person-by-id MATCH instead
 * of bcrypt-scanning every user — the prefix is a routing hint, never
 * proof. Callers MUST still verify possession against the stored hash.
 *
 * Returns null for anything that isn't the expected shape.
 */
function parseRefreshTokenUserId(rawToken: string): string | null {
  const dotIdx = rawToken.indexOf('.')
  if (dotIdx <= 0 || dotIdx === rawToken.length - 1) return null
  return rawToken.slice(0, dotIdx)
}

/**
 * Shared refresh-token logic, callable from both the `/api/auth/refresh-token`
 * route and from `/api/auth/access-token` (which auto-refreshes when the
 * access cookie is missing or expired so callers don't have to chain two
 * requests + their own retry logic).
 *
 * Reads the refresh token from the HttpOnly cookie first, then from the
 * JSON body (for clients that lost the cookie but still hold the token in
 * localStorage). Validates against the bcrypt-hashed `Person.refreshToken`
 * and checks `refreshTokenRevoked` / `refreshTokenExp`. On success rotates
 * the refresh token (single-use semantics — a leaked token has a short
 * window before the legitimate client rotates it out).
 *
 * The CALLER is responsible for actually setting the new cookies on the
 * response — this function just returns the freshly-minted token values
 * so both routes can decide their own response shape.
 */
export async function tryRefreshAccessToken(
  request: NextRequest
): Promise<RefreshResult> {
  // Rate limit lives HERE (not in route handlers) so both `/refresh-token`
  // and `/access-token`'s auto-refresh branch inherit the same throttle.
  // Without this, an attacker could bypass the burst limit by probing
  // /access-token instead — and the bcrypt compare below makes it a real
  // credential-stuffing surface, not just a DoS one.
  const burst = await rateLimit({
    policy: 'auth-burst',
    key: `refresh-token:${clientIp(request)}`,
  })
  if (!burst.allowed) {
    return {
      ok: false,
      code: 'ERR_RATE_LIMITED',
      message: 'Too many refresh attempts. Please try again shortly.',
      retryAfter: burst.retryAfter,
    }
  }

  const cookieToken = request.cookies.get('refreshToken')?.value

  let bodyToken: string | null = null
  if (
    request.method === 'POST' &&
    request.headers.get('content-type')?.includes('application/json')
  ) {
    try {
      const body = (await request.json()) as { refreshToken?: unknown }
      if (typeof body?.refreshToken === 'string') bodyToken = body.refreshToken
    } catch {
      // ignore; cookie path may still succeed
    }
  }

  const rawToken = (cookieToken || bodyToken || '').trim()
  if (!rawToken) {
    return {
      ok: false,
      code: 'ERR_NO_REFRESH_TOKEN',
      message: 'Refresh token is required',
    }
  }

  const userId = parseRefreshTokenUserId(rawToken)
  if (!userId) {
    return {
      ok: false,
      code: 'ERR_INVALID_REFRESH_TOKEN',
      message: 'Invalid refresh token',
    }
  }

  initializeDB()
  const session = getSession()

  try {
    const result = await session.run(
      `MATCH (user:Person {id: $userId})
       RETURN {
         id: user.id,
         email: user.email,
         firstName: user.firstName,
         lastName: user.lastName,
         roles: user.roles,
         refreshToken: user.refreshToken,
         refreshTokenExp: user.refreshTokenExp,
         refreshTokenRevoked: user.refreshTokenRevoked
       } AS user`,
      { userId }
    )

    if (result.records.length === 0) {
      return {
        ok: false,
        code: 'ERR_INVALID_REFRESH_TOKEN',
        message: 'Invalid refresh token',
      }
    }
    const user = result.records[0].get('user')

    if (user.refreshTokenRevoked || !user.refreshToken) {
      return {
        ok: false,
        code: 'ERR_INVALID_REFRESH_TOKEN',
        message: 'Refresh token revoked',
      }
    }

    const nowSeconds = Math.floor(Date.now() / 1000)
    const exp =
      typeof user.refreshTokenExp === 'number'
        ? user.refreshTokenExp
        : Number(user.refreshTokenExp ?? 0)
    if (!exp || exp < nowSeconds) {
      return {
        ok: false,
        code: 'ERR_INVALID_REFRESH_TOKEN',
        message: 'Refresh token expired',
      }
    }

    const matches = await comparePassword(rawToken, user.refreshToken)
    if (!matches) {
      return {
        ok: false,
        code: 'ERR_INVALID_REFRESH_TOKEN',
        message: 'Invalid refresh token',
      }
    }

    const newAccessToken = signJWT({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
      },
      expiresAt: nowSeconds + ACCESS_TOKEN_TTL_SECONDS,
    })

    // Rotate so a leaked refresh token has a single-use window before the
    // legitimate client refreshes it out from under the attacker.
    const newRawRefreshToken = `${user.id}.${crypto.randomUUID()}`
    const newHashedRefreshToken = await hashPassword(newRawRefreshToken)
    const newExp = nowSeconds + REFRESH_TOKEN_TTL_SECONDS

    await session.run(
      `MATCH (u:Person {id: $userId})
       SET u.refreshToken = $refreshToken,
           u.refreshTokenExp = $refreshTokenExp,
           u.refreshTokenRevoked = false
       RETURN u`,
      {
        userId: user.id,
        refreshToken: newHashedRefreshToken,
        refreshTokenExp: newExp,
      }
    )

    return {
      ok: true,
      accessToken: newAccessToken,
      refreshToken: newRawRefreshToken,
    }
  } catch (err) {
    console.error('Refresh token error:', err)
    return {
      ok: false,
      code: 'ERR_REFRESH_FAILED',
      message: 'Failed to refresh token',
    }
  } finally {
    await session.close()
  }
}

/**
 * Identify the Person a refresh cookie belongs to, without rotating or
 * minting anything. `/api/auth/logout` falls back to this when the access
 * token has already lapsed: the 30-minute access token expiring long before
 * the 30-day refresh token is exactly the case where revocation matters most
 * (user walks away from a shared machine, comes back, clicks "Log out").
 * Refusing to revoke there would leave the 30-day credential live.
 *
 * Proof of possession is the bcrypt comparison below, so a forged
 * `${userId}.` prefix identifies nobody.
 *
 * Deliberately does NOT check `refreshTokenRevoked` / `refreshTokenExp`: an
 * already-revoked or expired token still proves who the caller is, and
 * re-revoking is idempotent. Returns null on any failure — no refresh
 * cookie, malformed value, unknown Person, or hash mismatch.
 */
export async function resolveUserIdFromRefreshCookie(
  request: NextRequest
): Promise<string | null> {
  const rawToken = (request.cookies.get('refreshToken')?.value || '').trim()
  if (!rawToken) return null

  const userId = parseRefreshTokenUserId(rawToken)
  if (!userId) return null

  initializeDB()
  const session = getSession()

  try {
    const result = await session.run(
      `MATCH (user:Person {id: $userId})
       RETURN user.refreshToken AS refreshToken`,
      { userId }
    )
    if (result.records.length === 0) return null

    const hashedToken = result.records[0].get('refreshToken')
    if (typeof hashedToken !== 'string' || !hashedToken) return null

    return (await comparePassword(rawToken, hashedToken)) ? userId : null
  } catch (err) {
    console.error('Refresh cookie identification error:', err)
    return null
  } finally {
    await session.close()
  }
}

/** Set the standard accessToken + refreshToken cookies on a response. */
export function setAuthCookies(
  response: NextResponse,
  tokens: { accessToken: string; refreshToken: string }
): void {
  response.cookies.set('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: ACCESS_TOKEN_TTL_SECONDS,
    path: '/',
  })
  response.cookies.set('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: REFRESH_TOKEN_TTL_SECONDS,
    path: '/',
  })
}

/**
 * Expire both auth cookies on a response. Used when a session is
 * definitively over (refresh failed) so the browser stops re-sending an
 * access token that can never verify — the dominant cause of the 401
 * request storm a wedged client would otherwise generate. These are
 * HttpOnly, so client-side `document.cookie` clearing cannot reach them;
 * the server must expire them here. Attributes mirror `setAuthCookies` so
 * the browser matches and removes the right cookies. `/api/auth/logout`
 * also delegates here so cookie attributes have a single source of truth.
 */
export function clearAuthCookies(response: NextResponse): void {
  for (const name of ['accessToken', 'refreshToken'] as const) {
    response.cookies.set(name, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })
  }
}
