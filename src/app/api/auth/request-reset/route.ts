import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { parseRequestBody, sendMail } from '../utils'
import { parseError } from '@/utils'
import { getSession, initializeDB } from '../neo4j'
import { hashAuthToken } from '@/lib/auth/token-hash'

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

  // The raw token is what we email; only sha256(token) is persisted, so
  // a leak of the Person store alone cannot be used to reset accounts.
  const token = crypto.randomUUID()
  const tokenHash = hashAuthToken(token)
  const expiration = new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 mins

  try {
    // Scope to :User Persons only — a non-:User Person (e.g. a contact added
    // via addSpaceMember who never accepted) shouldn't be password-resettable
    // by anyone who can guess their email. The accept-invite flow is the
    // correct path to give them credentials.
    const result = await session.run(
      'MATCH (u:Person:User {email: $email}) ' +
        'SET u.resetTokenHash = $tokenHash, u.resetTokenExpires = datetime($expiration) ' +
        'RETURN u',
      { email, tokenHash, expiration }
    )

    if (result.records.length > 0) {
      // Send email with reset link
      const encodedEmail = encodeURIComponent(email)
      const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${token}&email=${encodedEmail}`

      if (process.env.NODE_ENV === 'development') {
        console.log('Reset link:', resetLink)
      }

      await sendMail({
        from:
          process.env.NEXT_PUBLIC_EMAIL_FROM ||
          'Goalpost <info@goalpost.earth>',
        to: email,
        subject: '🌻 Password Reset Request',
        html: `
        <div style="background: linear-gradient(135deg, #fdf6e3 0%, #ffe0ec 100%); padding: 40px 0;">
          <div style="max-width: 480px; margin: 0 auto; background: #fffbe7; border-radius: 18px; box-shadow: 0 4px 24px rgba(0,0,0,0.07); padding: 36px 32px; font-family: 'Segoe UI', 'Helvetica Neue', Arial, 'Liberation Sans', sans-serif; color: #4b3f2b;">
          <div style="text-align: center;">
            <div style="font-size: 48px; margin-bottom: 12px;">✌️🌻</div>
            <h1 style="font-size: 2.2em; margin: 0 0 12px; font-weight: 700; letter-spacing: 1px;">Welcome, Beautiful Soul!</h1>
            <p style="font-size: 1.15em; margin: 0 0 18px; color: #7d5c2e;">
            You’ve requested a password reset for <span style="font-weight: bold; color: #e67e22;">GoalPost</span>.
            </p>
            <p style="font-size: 1.05em; margin: 0 0 24px; color: #8d6e3f;">
            Click the button below to set a new password and continue your journey with us!
            </p>
            <a href="${resetLink}" style="display: inline-block; background: linear-gradient(90deg, #ffb347 0%, #ffcc33 100%); color: #4b3f2b; text-decoration: none; font-weight: bold; padding: 14px 36px; border-radius: 30px; font-size: 1.1em; box-shadow: 0 2px 8px rgba(255, 179, 71, 0.15); margin-bottom: 18px;">
            Set Your Password & Join Us
            </a>
            <p style="font-size: 0.98em; margin: 24px 0 0; color: #a1885c;">
            If you did not request this, you can safely ignore this email.<br>
            Looking forward to sharing with you,<br>
            GoalPost ✨
            </p>
          </div>
          </div>
        </div>
        `,
      })
    }
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
