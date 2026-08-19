/**
 * GOAL-329 — invite/deep-link email URL construction.
 *
 * Root cause of the original bug: a stale localhost NEXT_PUBLIC_BASE_URL
 * leaked into emailed invite links, so invitees landed on a deployment
 * whose DB never minted their token — surfacing as "invite is invalid or
 * has expired" for every unregistered invitee. `baseUrl()` in
 * src/app/api/auth/utils.ts now delegates to `resolveAppBaseUrl()`
 * (src/lib/url/app-base-url.ts), which rejects localhost values and
 * falls back to VERCEL_PROJECT_PRODUCTION_URL.
 *
 * These tests exercise the real sendSpaceInviteEmail /
 * sendAddedToSpaceEmail with only the Resend client mocked, and assert
 * on the html payload handed to resend.emails.send.
 *
 * Env note: Next.js inlines NEXT_PUBLIC_* at build time in app code, but
 * under jest process.env is read live at call time, so flipping the vars
 * per-test is valid here. Originals are restored after every test.
 */

// jest.mock factories are hoisted above imports; only `mock`-prefixed
// out-of-scope variables may be referenced from inside one.
const mockEmailSend = jest.fn()

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: mockEmailSend },
  })),
}))

import { sendSpaceInviteEmail, sendAddedToSpaceEmail } from './utils'

const ENV_KEYS = ['NEXT_PUBLIC_BASE_URL', 'VERCEL_PROJECT_PRODUCTION_URL'] as const

describe('invite email URLs — hardened base-URL resolution (GOAL-329)', () => {
  let savedEnv: Partial<Record<(typeof ENV_KEYS)[number], string | undefined>>

  beforeEach(() => {
    savedEnv = {}
    for (const key of ENV_KEYS) {
      savedEnv[key] = process.env[key]
      delete process.env[key]
    }
    mockEmailSend.mockReset()
    mockEmailSend.mockResolvedValue({ data: { id: 'email_1' }, error: null })
  })

  afterEach(() => {
    for (const key of ENV_KEYS) {
      if (savedEnv[key] === undefined) delete process.env[key]
      else process.env[key] = savedEnv[key]
    }
  })

  async function sendInviteAndGetPayload() {
    const result = await sendSpaceInviteEmail({
      to: 'invitee@example.com',
      inviteToken: 'space-1.deadbeef-cafe-4321-8765-abcdef012345',
      spaceName: 'Community Garden',
      inviterName: 'Ama Owusu',
    })
    expect(result.ok).toBe(true)
    expect(mockEmailSend).toHaveBeenCalledTimes(1)
    return mockEmailSend.mock.calls[0][0] as {
      to: string
      subject: string
      html: string
      from: string
    }
  }

  it('uses the Vercel production host when NEXT_PUBLIC_BASE_URL is unset', async () => {
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'goalpost.example.vercel.app'

    const payload = await sendInviteAndGetPayload()

    expect(payload.html).toContain(
      'https://goalpost.example.vercel.app/auth/accept-invite?token='
    )
    // The exact token survives into the link (URL-safe chars, so
    // encodeURIComponent is a no-op here).
    expect(payload.html).toContain(
      'https://goalpost.example.vercel.app/auth/accept-invite?token=space-1.deadbeef-cafe-4321-8765-abcdef012345'
    )
    expect(payload.html).not.toContain('localhost')
  })

  it('rejects a localhost NEXT_PUBLIC_BASE_URL and falls back to the Vercel host', async () => {
    process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000'
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'goalpost.example.vercel.app'

    const payload = await sendInviteAndGetPayload()

    // THE GOAL-329 regression guard: a stale localhost base URL must
    // never leak into an emailed accept link.
    expect(payload.html).toContain(
      'https://goalpost.example.vercel.app/auth/accept-invite?token='
    )
    expect(payload.html).not.toContain('localhost:3000')
  })

  it('lets an explicit non-localhost NEXT_PUBLIC_BASE_URL win over the Vercel host', async () => {
    process.env.NEXT_PUBLIC_BASE_URL = 'https://goalpost.earth'
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'goalpost.example.vercel.app'

    const payload = await sendInviteAndGetPayload()

    expect(payload.html).toContain(
      'https://goalpost.earth/auth/accept-invite?token='
    )
    expect(payload.html).not.toContain('goalpost.example.vercel.app')
  })

  it('states the 7-day expiry in the invite copy (kept in sync with INVITE_TOKEN_TTL_MS)', async () => {
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'goalpost.example.vercel.app'

    const payload = await sendInviteAndGetPayload()

    expect(payload.html).toMatch(/expires in 7 days/)
    // The old 48-hour copy must be gone.
    expect(payload.html).not.toMatch(/48\s*hours?/i)
  })

  it('builds the added-to-space deep link from the same hardened base URL', async () => {
    process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000'
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'goalpost.example.vercel.app'

    const result = await sendAddedToSpaceEmail({
      to: 'member@example.com',
      spaceId: 'space-1',
      spaceName: 'Community Garden',
      inviterName: 'Ama Owusu',
    })

    expect(result.ok).toBe(true)
    expect(mockEmailSend).toHaveBeenCalledTimes(1)
    const payload = mockEmailSend.mock.calls[0][0] as { html: string }
    expect(payload.html).toContain(
      'https://goalpost.example.vercel.app/protected/dashboard/space/space-1'
    )
    expect(payload.html).not.toContain('localhost:3000')
  })
})
