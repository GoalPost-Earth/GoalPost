import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '../utils'

export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get('accessToken')?.value

  if (!accessToken) {
    return NextResponse.json(
      { error: 'No access token found', code: 'ERR_NO_ACCESS_TOKEN' },
      { status: 401 }
    )
  }

  // verifyJWT throws on bad signature OR expiry. We need to distinguish
  // expired from invalid so the client's retry-via-refresh branch only
  // fires on expiry — a tampered token should bounce to login.
  try {
    verifyJWT(accessToken)
  } catch (err) {
    const isExpired = (err as { name?: string })?.name === 'TokenExpiredError'
    return NextResponse.json(
      {
        error: isExpired ? 'Access token expired' : 'Invalid access token',
        code: isExpired
          ? 'ERR_EXPIRED_ACCESS_TOKEN'
          : 'ERR_INVALID_ACCESS_TOKEN',
      },
      { status: 401 }
    )
  }

  return NextResponse.json({ accessToken })
}
