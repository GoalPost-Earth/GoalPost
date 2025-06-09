import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  // Read the 'accessToken' cookie
  const accessToken = req.cookies.get('accessToken')?.value

  if (!accessToken) {
    return NextResponse.json(
      { error: 'No access token found' },
      { status: 401 }
    )
  }

  return NextResponse.json({ accessToken })
}
