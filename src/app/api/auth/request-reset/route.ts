import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { parseRequestBody, sendMail } from '../utils'
import { parseError } from '@/utils'
import { getSession, initializeDB } from '../neo4j'
import { hashAuthToken } from '@/lib/auth/token-hash'
import { clientIp, rateLimit, rateLimited } from '@/lib/auth/rate-limit'
import { normalizeEmail } from '@/lib/auth/normalize-email'

const resetPasswordSchema = z.object({
  email: z.string().email(),
})

export async function POST(req: NextRequest) {
  // Per-IP burst on top of the per-email policy below — guards against a
  // single attacker iterating through an email list from one IP. Both
  // policies must allow for the request to proceed.
  const burst = await rateLimit({
    policy: 'auth-burst',
    key: `request-reset:${clientIp(req)}`,
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
  const { email } = parseResult.data

  // Per-email reset-request policy — slows email-existence harvesting and
  // bulk-blast through info@goalpost.earth. Normalise (lowercase + trim)
  // so per-email keying isn't bypassed by casing tricks. Critically, this
  // check returns the SAME shape as the success path (always returns a
  // 201 envelope) so the rate-limit response itself isn't an oracle for
  // "this email exists." Instead we just no-op the email send + return
  // the normal success body.
  const normalizedEmail = normalizeEmail(email)
  const perEmail = await rateLimit({
    policy: 'reset-request',
    key: `reset-request:${normalizedEmail}`,
  })
  if (!perEmail.allowed) {
    // Pad the response so its timing matches the DB-roundtrip path (the
    // unindexed `:User` email scan is the dominant cost on the success
    // path). Without this jitter the rate-limited branch returns in
    // ~5ms while the success-but-no-such-email branch takes 20-80ms,
    // re-introducing the email-existence side-channel the silent-201
    // is meant to defeat.
    await new Promise((r) =>
      setTimeout(r, 30 + Math.floor(Math.random() * 30))
    )
    return NextResponse.json(
      { message: 'If the account exists, a reset link has been generated' },
      { status: 201 }
    )
  }

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
      { email: normalizedEmail, tokenHash, expiration }
    )

    if (result.records.length > 0) {
      // Send email with reset link
      const encodedEmail = encodeURIComponent(normalizedEmail)
      const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${token}&email=${encodedEmail}`

      if (process.env.NODE_ENV === 'development') {
        console.log('Reset link:', resetLink)
      }

      // sendMail never throws — it returns { ok, error }. Inspect it: a
      // Resend rejection (unverified `from` domain, missing/invalid
      // RESEND_API_KEY in the deployed env, etc.) is otherwise indistinguishable
      // from success and leaves no trace, which is exactly how a reset email can
      // silently never arrive while the user still sees the success message
      // (GOAL-250). Log server-side only — the HTTP response stays a constant
      // 201 so the outcome can't be used to enumerate accounts.
      const mailResult = await sendMail({
        from:
          process.env.NEXT_PUBLIC_EMAIL_FROM ||
          'Goalpost <info@goalpost.earth>',
        to: normalizedEmail,
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

      if (!mailResult.ok) {
        // Log the message only, not the raw error object — Resend SDK errors
        // can embed the request payload (incl. the recipient email / PII).
        const e = mailResult.error
        console.error(
          '[request-reset] reset email failed to send via Resend:',
          e instanceof Error ? e.message : 'unknown send error'
        )
      }
    } else if (process.env.NODE_ENV !== 'production') {
      // No :User matched this email. We still return the constant 201 to avoid
      // enumeration, but log it off-production so a dev/QA hitting GOAL-250 can
      // tell "no account for this email" apart from "send failed" above.
      console.info('[request-reset] no :User matched; no reset email sent')
    }
  } catch (err) {
    // Keep the response constant (no enumeration), but don't swallow silently —
    // an unexpected DB/send error must be visible in the server logs. Log the
    // message only to avoid writing PII embedded in a raw error object.
    console.error(
      '[request-reset] unexpected error generating reset:',
      err instanceof Error ? err.message : 'unknown error'
    )
  } finally {
    await session.close()
  }

  // Always return success
  return NextResponse.json(
    { message: 'If the account exists, a reset link has been generated' },
    { status: 201 }
  )
}
