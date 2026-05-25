import { NextRequest, NextResponse } from 'next/server'
import { getSession, initializeDB } from '../neo4j'
import { comparePassword, hashPassword, signJWT } from '../utils'
import { clientIp, rateLimit, rateLimited } from '@/lib/auth/rate-limit'

const ACCESS_TOKEN_TTL_SECONDS = 60 * 30
const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30

function unauthorized(code: string, message: string) {
  return NextResponse.json({ error: message, code }, { status: 401 })
}

// Refresh tokens are issued as `${userId}.${secret}`. The userId isn't secret
// — it identifies *who*; the secret proves it. Embedding it lets us do an
// indexed Person-by-id MATCH instead of bcrypt-scanning every user, which
// would be O(n) and unusable past a handful of accounts.
//
// Transport: HttpOnly cookie (preferred — auto-attached, immune to XSS) or
// JSON body on POST (fallback for clients that lost the cookie but still
// hold the token in localStorage). The URL query-param transport is
// intentionally NOT supported — query strings leak into server logs,
// browser history, and Referer headers, which is unacceptable for a
// 30-day credential.
async function handleRefresh(request: NextRequest) {
  // Per-IP burst — refresh is the credential-stuffing target after login
  // because a leaked refresh token is a 30-day credential. Same limit as
  // login so a flood pattern hits both endpoints at the same wall.
  const burst = await rateLimit({
    policy: 'auth-burst',
    key: `refresh-token:${clientIp(request)}`,
  })
  if (!burst.allowed) return rateLimited(burst.retryAfter)

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
    return unauthorized('ERR_NO_REFRESH_TOKEN', 'Refresh token is required')
  }

  const dotIdx = rawToken.indexOf('.')
  if (dotIdx <= 0 || dotIdx === rawToken.length - 1) {
    return unauthorized('ERR_INVALID_REFRESH_TOKEN', 'Invalid refresh token')
  }
  const userId = rawToken.slice(0, dotIdx)

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
      return unauthorized('ERR_INVALID_REFRESH_TOKEN', 'Invalid refresh token')
    }
    const user = result.records[0].get('user')

    if (user.refreshTokenRevoked || !user.refreshToken) {
      return unauthorized('ERR_INVALID_REFRESH_TOKEN', 'Refresh token revoked')
    }

    const nowSeconds = Math.floor(Date.now() / 1000)
    const exp =
      typeof user.refreshTokenExp === 'number'
        ? user.refreshTokenExp
        : Number(user.refreshTokenExp ?? 0)
    if (!exp || exp < nowSeconds) {
      return unauthorized('ERR_INVALID_REFRESH_TOKEN', 'Refresh token expired')
    }

    const matches = await comparePassword(rawToken, user.refreshToken)
    if (!matches) {
      return unauthorized('ERR_INVALID_REFRESH_TOKEN', 'Invalid refresh token')
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

    const response = NextResponse.json({
      accessToken: newAccessToken,
      refreshToken: newRawRefreshToken,
    })

    response.cookies.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: ACCESS_TOKEN_TTL_SECONDS,
      path: '/',
    })

    response.cookies.set('refreshToken', newRawRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_TTL_SECONDS,
      path: '/',
    })

    return response
  } catch (err) {
    console.error('Refresh token error:', err)
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500 }
    )
  } finally {
    await session.close()
  }
}

export async function GET(request: NextRequest) {
  return handleRefresh(request)
}

export async function POST(request: NextRequest) {
  return handleRefresh(request)
}
