import { parseError } from '@/utils'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession, initializeDB } from '../neo4j'
import { parseRequestBody } from '../utils'

const logoutSchema = z.object({
  email: z.string().min(1, 'Email required'),
})

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })
  }

  const parseResultBody = await parseRequestBody(req)
  if (!parseResultBody.ok) {
    return NextResponse.json(
      { error: parseResultBody.error },
      { status: parseResultBody.status }
    )
  }
  const body = parseResultBody.body

  const parseResult = logoutSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseError(parseResult.error) },
      { status: 400 }
    )
  }
  const { email } = parseResult.data

  initializeDB()
  const session = getSession()

  try {
    // Find user and revoke refresh token
    await session.run(
      `MATCH (user:Person {email: $email})
       SET user.refreshTokenRevoked = true,
           user.refreshToken = NULL,
           user.refreshTokenExp = 0
       RETURN user`,
      { email }
    )

    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    )

    // Clear auth cookies
    response.cookies.set('accessToken', '', {
      httpOnly: true,
      maxAge: 0,
      path: '/',
    })

    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      maxAge: 0,
      path: '/',
    })

    return response
  } catch (err) {
    console.error('🚀 ~ route.ts ~ err:', err)
    return NextResponse.json({ error: parseError(err) }, { status: 500 })
  } finally {
    await session.close()
  }
}
