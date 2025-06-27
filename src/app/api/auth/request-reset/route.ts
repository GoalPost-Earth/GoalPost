import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { parseRequestBody, sendMail } from '../utils'
import { parseError } from '@/utils'
import { getSession, initializeDB } from '../neo4j'

const resetPasswordSchema = z.object({
  email: z.string().email(),
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
  const { email } = parseResult.data

  initializeDB()
  const session = getSession()

  const token = crypto.randomUUID()
  const expiration = new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 mins

  try {
    await session.run(
      'MATCH (u:User {email: $email}) ' +
        'SET u.resetToken = $token, u.resetTokenExpires = datetime($expiration)',
      { email, token, expiration }
    )

    // Send email with reset link
    const encodedEmail = encodeURIComponent(email)
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${token}&email=${encodedEmail}`

    await sendMail({
      from:
        process.env.NEXT_PUBLIC_EMAIL_FROM || 'Goalpost <info@goalpost.earth>',
      to: email,
      subject: 'Password Reset Request',
      html: `<p>You requested a password reset. Click the link below to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p>`,
    })
  } catch {
    // Swallow errors to avoid user enumeration
  } finally {
    await session.close()
  }

  // Always return success
  return NextResponse.json(
    { message: 'If the account exists, a reset link has been generated' },
    { status: 201 }
  )
}
