import { parseError } from '@/utils'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession, initializeDB } from '../neo4j'
import { comparePassword, parseRequestBody, signJWT } from '../utils'

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
      `MATCH (user:User {email: $email})
        RETURN user {
          id: user.id,
          hash: user.password,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
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

    const token = signJWT({ id, ...rest })

    return NextResponse.json(
      { user: { id, ...rest }, token, refreshToken: 'refreshme', returnTo },
      { status: 200 }
    )
  } catch (err) {
    return NextResponse.json({ error: parseError(err) }, { status: 500 })
  } finally {
    await session.close()
  }
}
