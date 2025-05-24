import { parseError } from '@/utils'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession, initializeDB } from '../neo4j'
import { parseRequestBody } from '../utils'

const logoutSchema = z.object({
  email: z.string().min(1, 'Refresh token required'),
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
    // Find user by refresh token and revoke it
    const result = await session.run(
      `MATCH (user:User {email: $email, refreshTokenRevoked: false})
       SET user.refreshTokenRevoked = true,
           user.refreshToken = NULL,
           user.refreshTokenExp = 0
       RETURN user`,
      { email }
    )

    if (result.records.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or already revoked refresh token' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: parseError(err) }, { status: 500 })
  } finally {
    await session.close()
  }
}
