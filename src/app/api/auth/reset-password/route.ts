import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { hashPassword, parseRequestBody } from '../utils'
import { parseError } from '@/utils'
import { getSession, initializeDB } from '../neo4j'

const resetPasswordSchema = z.object({
  token: z.string(),
  email: z.string().email().optional(),
  newPassword: z.string().min(8, 'Password must be at least 8 characters long'),
})

export async function POST(req: NextRequest) {
  const parseResultBody = await parseRequestBody(req)
  if (!parseResultBody.ok) {
    return NextResponse.json(
      { error: parseResultBody.error },
      { status: parseResultBody.status }
    )
  }
  const body = parseResultBody.body

  const parseResult = resetPasswordSchema.safeParse(body)

  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseError(parseResult.error) },
      { status: 400 }
    )
  }

  const { token, newPassword } = parseResult.data

  initializeDB()
  const session = getSession()
  try {
    const result = await session.run(
      'MATCH (u:User {resetToken: $token}) ' +
        'WHERE u.resetTokenExpires > datetime() ' +
        'SET u.password = $password, u.resetToken = NULL, u.resetTokenExpires = NULL ' +
        'RETURN u',
      { token, password: await hashPassword(newPassword) }
    )

    if (result.records.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Password reset successfully' },
      { status: 200 }
    )
  } catch {
    // Swallow errors to avoid user enumeration
    return NextResponse.json(
      { error: 'An error occurred while resetting the password' },
      { status: 500 }
    )
  } finally {
    await session.close()
  }
}
