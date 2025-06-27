import { Context } from '@/config/types'
import { sendMail } from '@/app/api/auth/utils'
import crypto from 'crypto'

export const inviteMutations = {
  invitePerson: async (
    _parent: never,
    _args: {
      personId: string
    },
    context: Context
  ) => {
    const session = context.executionContext.session()
    const { personId } = _args

    try {
      const result = await session.run(
        `
                MATCH (person:Person {id: $id})
                RETURN person
                `,
        { id: personId }
      )

      if (result.records.length === 0) {
        throw new Error('Person not found')
      }

      const person = result.records[0].get('person').properties
      const email = person.email
      if (!email) {
        throw new Error('Person does not have an email address')
      }

      // Generate a reset token for the new user
      const token = crypto.randomUUID()
      const expiration = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString() // 7 days

      // Create the reset password link
      const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`

      // Send invite email
      const [mailResult, inviteResult] = await Promise.all([
        sendMail({
          from:
            process.env.NEXT_PUBLIC_EMAIL_FROM ||
            'Goalpost <info@goalpost.earth>',
          to: email,
          subject: '🌼 You’re Invited to GoalPost! 🌈',
          html: `
          <div style="background: linear-gradient(135deg, #fdf6e3 0%, #ffe0ec 100%); padding: 40px 0;">
        <div style="max-width: 480px; margin: 0 auto; background: #fffbe7; border-radius: 18px; box-shadow: 0 4px 24px rgba(0,0,0,0.07); padding: 36px 32px; font-family: 'Segoe UI', 'Helvetica Neue', Arial, 'Liberation Sans', sans-serif; color: #4b3f2b;">
          <div style="text-align: center;">
        <div style="font-size: 48px; margin-bottom: 12px;">✌️🌻</div>
        <h1 style="font-size: 2.2em; margin: 0 0 12px; font-weight: 700; letter-spacing: 1px;">Welcome, Beautiful Soul!</h1>
        <p style="font-size: 1.15em; margin: 0 0 18px; color: #7d5c2e;">
          You’ve been invited to join <span style="font-weight: bold; color: #e67e22;">GoalPost</span> — a place where dreams blossom and journeys are shared.
        </p>
        <p style="font-size: 1.05em; margin: 0 0 24px; color: #8d6e3f;">
          We’re stoked to have your good vibes and energy with us. <br>
          Let’s grow, create, and celebrate together!
        </p>
        <a href="${resetLink}" style="display: inline-block; background: linear-gradient(90deg, #ffb347 0%, #ffcc33 100%); color: #4b3f2b; text-decoration: none; font-weight: bold; padding: 14px 36px; border-radius: 30px; font-size: 1.1em; box-shadow: 0 2px 8px rgba(255, 179, 71, 0.15); margin-bottom: 18px;">
          Set Your Password & Join Us
        </a>
        <p style="font-size: 0.98em; margin: 24px 0 0; color: #a1885c;">
          Looking forward to sharing with you,<br>
          GoalPost ✨
        </p>
          </div>
        </div>
          </div>
        `,
        }),
        session.run(
          `
          MATCH (person:Person {id: $id})
            SET person.inviteSent = true
            SET person.resetToken = $token
            SET person.resetTokenExpires = datetime($expiration)
            SET person:User
          RETURN person
          `,
          { id: personId, token, expiration }
        ),
      ])
      console.log('🚀 ~ invite-resolver.ts:63 ~ mailResult:', mailResult)

      if (!mailResult.ok) {
        throw new Error('Failed to send invite email')
      }

      return inviteResult.records[0].get('person').properties
    } catch (error) {
      console.error(error)
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'An unknown error occurred',
      }
    } finally {
      await session.close()
    }
  },
  cancelInvite: async (
    _parent: never,
    _args: {
      personId: string
    },
    context: Context
  ) => {
    const session = context.executionContext.session()
    const { personId } = _args

    try {
      const result = await session.run(
        `
                MATCH (user:Person {id: $id})
                  REMOVE user.inviteSent
                  REMOVE user:User
                RETURN user AS person
                `,
        { id: personId }
      )

      if (result.records.length === 0) {
        throw new Error('Person not found')
      }

      return result.records[0].get('person').properties
    } catch (error) {
      console.error(error)
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'An unknown error occurred',
      }
    } finally {
      await session.close()
    }
  },
}
