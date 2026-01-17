import { parseError } from '@/utils'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession, initializeDB } from '../neo4j'
import {
  comparePassword,
  hashPassword,
  parseRequestBody,
  signJWT,
} from '../utils'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
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

  const parseResult = loginSchema.safeParse(body)

  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseError(parseResult.error) },
      { status: 400 }
    )
  }
  const { email, password } = parseResult.data

  initializeDB()
  const session = getSession()

  // Get returnTo param from the request URL
  const { searchParams } = new URL(req.url)
  const returnTo = searchParams.get('returnTo') || undefined

  try {
    const result = await session.run(
      `MATCH (user:Person {email: $email})
        RETURN user {
          id: user.id,
          hash: user.password,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles
        }`,
      { email }
    )

    if (result.records.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 400 }
      )
    }

    const { id, hash, ...rest } = result.records[0].get('user')
    const isValid = await comparePassword(password, hash)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 400 }
      )
    }

    const token = signJWT({
      user: { id, ...rest },
      expiresAt: Math.floor(Date.now() / 1000) + 60 * 30,
    })
    // Help me create an opaque refresh token
    const refreshToken = crypto.randomUUID()
    const hashedToken = await hashPassword(refreshToken)

    await session.run(
      `MATCH (user:Person {email: $email})
          SET user.refreshToken = $refreshToken,
              user.refreshTokenExp = $refreshTokenExp,
              user.refreshTokenRevoked = $refreshTokenRevoked
        RETURN user`,
      {
        email,
        refreshToken: hashedToken,
        refreshTokenExp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
        // 30 days
        refreshTokenRevoked: false,
      }
    )

    const response = NextResponse.json(
      {
        user: { id, ...rest },
        token,
        refreshToken,
        returnTo,
      },
      { status: 200 }
    )

    // Set secure cookie for middleware
    response.cookies.set('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 30, // 30 minutes
      path: '/',
    })

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })

    return response
  } catch (err) {
    console.error('🚀 ~ route.ts:112 ~ err:', err)
    return NextResponse.json({ error: parseError(err) }, { status: 500 })
  } finally {
    await session.close()
  }
}
