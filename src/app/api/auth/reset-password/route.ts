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
    // First check if token exists at all
    const tokenCheck = await session.run(
      'MATCH (u:Person {resetToken: $token}) RETURN u.resetTokenExpires as expires',
      { token }
    )

    if (tokenCheck.records.length === 0) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }

    // Check if token is expired using Neo4j datetime comparison
    const expiryCheck = await session.run(
      'MATCH (u:Person {resetToken: $token}) ' +
        'RETURN u.resetTokenExpires > datetime() as isValid',
      { token }
    )

    if (!expiryCheck.records[0].get('isValid')) {
      // Clean up expired token
      await session.run(
        'MATCH (u:Person {resetToken: $token}) SET u.resetToken = NULL, u.resetTokenExpires = NULL',
        { token }
      )
      return NextResponse.json({ error: 'Token has expired' }, { status: 400 })
    }

    // Token is valid, proceed with password reset
    await session.run(
      'MATCH (u:Person {resetToken: $token}) ' +
        'SET u.password = $password, u.resetToken = NULL, u.resetTokenExpires = NULL ' +
        'RETURN u',
      { token, password: await hashPassword(newPassword) }
    )

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
