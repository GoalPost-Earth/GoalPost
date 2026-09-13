import { NextRequest, NextResponse } from 'next/server'
import { rateLimited } from '@/lib/auth/rate-limit'
import { setAuthCookies, tryRefreshAccessToken } from '../refresh'

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
//
// Rate limiting (auth-burst 5/min/IP) lives inside `tryRefreshAccessToken`
// so /access-token's auto-refresh branch inherits the same throttle and
// can't be used to bypass the cap.
async function handleRefresh(request: NextRequest) {
  const result = await tryRefreshAccessToken(request)
  if (!result.ok) {
    if (result.code === 'ERR_RATE_LIMITED') {
      return rateLimited(result.retryAfter ?? 60)
    }
    const status = result.code === 'ERR_REFRESH_FAILED' ? 500 : 401
    return NextResponse.json(
      { error: result.message, code: result.code },
      { status }
    )
  }

  // `expiresAt` (unix seconds) rides along with the token so any caller can
  // cache the bearer for its real lifetime rather than re-asking every 60s
  // (GOAL-375). Not a secret — it describes the token in this same body, and
  // the cookie set just below. Nothing in `src/` calls this route today (the
  // access-token route refreshes internally and reads `expiresAt` straight
  // off `tryRefreshAccessToken`); the field is here so the three token-issuing
  // routes keep one response shape.
  const response = NextResponse.json({
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    expiresAt: result.expiresAt,
  })
  setAuthCookies(response, result)
  return response
}

export async function GET(request: NextRequest) {
  return handleRefresh(request)
}

export async function POST(request: NextRequest) {
  return handleRefresh(request)
}
