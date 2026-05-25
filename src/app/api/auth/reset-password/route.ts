import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { hashPassword, parseRequestBody } from '../utils'
import { parseError } from '@/utils'
import { getSession, initializeDB } from '../neo4j'
import { hashAuthToken } from '@/lib/auth/token-hash'
import { clientIp, rateLimit, rateLimited } from '@/lib/auth/rate-limit'

const resetPasswordSchema = z.object({
  token: z.string(),
  email: z.string().email().optional(),
  newPassword: z.string().min(8, 'Password must be at least 8 characters long'),
})

export async function POST(req: NextRequest) {
  const burst = await rateLimit({
    policy: 'auth-burst',
    key: `reset-password:${clientIp(req)}`,
  })
  if (!burst.allowed) return rateLimited(burst.retryAfter)

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
  // Only sha256(token) is stored on Person.resetTokenHash; hash the
  // submitted raw token and look up by the indexed hash so a database
  // read alone can't be turned into a credential.
  const tokenHash = hashAuthToken(token)
  try {
    // First check if token exists at all
    const tokenCheck = await session.run(
      'MATCH (u:Person:User {resetTokenHash: $tokenHash}) RETURN u.resetTokenExpires as expires',
      { tokenHash }
    )

    if (tokenCheck.records.length === 0) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }

    // Check if token is expired using Neo4j datetime comparison
    const expiryCheck = await session.run(
      'MATCH (u:Person:User {resetTokenHash: $tokenHash}) ' +
        'RETURN u.resetTokenExpires > datetime() as isValid',
      { tokenHash }
    )

    if (!expiryCheck.records[0].get('isValid')) {
      // Clean up expired token
      await session.run(
        'MATCH (u:Person:User {resetTokenHash: $tokenHash}) SET u.resetTokenHash = NULL, u.resetTokenExpires = NULL',
        { tokenHash }
      )
      return NextResponse.json({ error: 'Token has expired' }, { status: 400 })
    }

    // Token is valid, proceed with password reset
    await session.run(
      'MATCH (u:Person:User {resetTokenHash: $tokenHash}) ' +
        'SET u.password = $password, u.resetTokenHash = NULL, u.resetTokenExpires = NULL ' +
        'RETURN u',
      { tokenHash, password: await hashPassword(newPassword) }
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
