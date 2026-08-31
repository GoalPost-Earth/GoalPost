/**
 * GOAL-329 — re-invite branch of addSpaceMember / inviteToSpaceByEmail.
 *
 * The bug: WeSpace invite links reported "expired" for unregistered
 * invitees, and re-inviting them dead-ended on "This member is already
 * part of the space." The fix adds a re-invite branch: when the member
 * already exists in the space but is NOT yet a :User (pending
 * placeholder), the resolver re-mints a fresh 7-day token via
 * mintAndSendInvite, re-sends the invite email, and logs a
 * 'space_invite_resent' activity.
 *
 * These are pure unit tests — the neo4j Session is a hand-rolled fake
 * that captures every tx.run(query, params) so we can assert on the
 * token-stamp write without a database. Follows the mocking pattern in
 * ./space-membership-rate-limit.test.ts.
 *
 * Properties locked down here:
 *   1. Pending placeholder already in space → success:true, "fresh
 *      invite email has been sent", sendSpaceInviteEmail called once
 *      with a `${spaceId}.${uuid}` token, and a write stamped
 *      inviteTokenHash (sha256 of that exact token) + inviteTokenExpires
 *      (~7 days out) on the Person.
 *   2. Existing :User already in space → unchanged failure "already part
 *      of the space", no email, no token write.
 *   3. Pending placeholder but the email send fails → success:false with
 *      a "could not be sent" message — and the token WAS still stamped
 *      (the write happens before the send) AND the rotation was still
 *      logged (the stamp invalidates the previously emailed link, so the
 *      audit trail must record it even when delivery fails).
 */

// --- Module mocks (must be declared before importing the resolver) ---

jest.mock('@/lib/auth/rate-limit', () => ({
  rateLimit: jest.fn(),
}))

jest.mock('@/app/api/auth/utils', () => ({
  sendSpaceInviteEmail: jest.fn(),
  sendAddedToSpaceEmail: jest.fn(),
}))

jest.mock('@/lib/activity-logs/create-log', () => ({
  createLog: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('@/lib/notifications/create-notification', () => ({
  createNotification: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('@/lib/permissions/space-permissions', () => ({
  canManageMembers: jest.fn(),
  memberExistsInSpace: jest.fn(),
  isSpaceOwner: jest.fn().mockResolvedValue(false),
}))

import { rateLimit } from '@/lib/auth/rate-limit'
import {
  sendSpaceInviteEmail,
  sendAddedToSpaceEmail,
} from '@/app/api/auth/utils'
import { createLog } from '@/lib/activity-logs/create-log'
import {
  canManageMembers,
  memberExistsInSpace,
} from '@/lib/permissions/space-permissions'
// Real (unmocked) hash helper — the assertion "stored hash is sha256 of
// the emailed token" is only meaningful against the genuine primitive.
import { hashAuthToken } from '@/lib/auth/token-hash'
import { spaceMembershipResolvers } from './space-membership-resolver'

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

interface CapturedRun {
  query: string
  params: Record<string, unknown>
}

/** Fake neo4j Record: `.get(key)` reads from a plain map. */
function makeFakeRecord(map: Record<string, unknown>) {
  return { get: (key: string) => map[key] }
}

/**
 * Fake neo4j Session. executeRead pops results off a queue (one entry
 * per expected read, in call order); executeWrite always returns an
 * empty result. Every tx.run is captured with its query + params so
 * tests can assert on what would have hit the database.
 */
function makeFakeSession(
  readResults: Array<{ records: Array<{ get: (k: string) => unknown }> }>
) {
  const readQueue = [...readResults]
  const reads: CapturedRun[] = []
  const writes: CapturedRun[] = []

  const executeRead = jest.fn(
    async (work: (tx: { run: unknown }) => unknown) =>
      work({
        run: async (query: string, params: Record<string, unknown>) => {
          reads.push({ query, params })
          return readQueue.shift() ?? { records: [] }
        },
      })
  )
  const executeWrite = jest.fn(
    async (work: (tx: { run: unknown }) => unknown) =>
      work({
        run: async (query: string, params: Record<string, unknown>) => {
          writes.push({ query, params })
          // The token-stamp write RETURNs the matched Person's id so the
          // resolver can tell "stamped" from "raced to :User" — echo one
          // row back so the happy paths see a successful match.
          return { records: [makeFakeRecord({ id: params.memberId })] }
        },
      })
  )
  const close = jest.fn().mockResolvedValue(undefined)

  return {
    session: { executeRead, executeWrite, close },
    executeRead,
    executeWrite,
    close,
    reads,
    writes,
  }
}

function makeContext(sessionFactory: () => unknown) {
  return {
    jwt: { sub: 'u1', user: { id: 'u1', email: 'inviter@example.com' } },
    executionContext: { session: sessionFactory },
    clientIp: '203.0.113.7',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any
}

/** Preflight-read record for a Person already resolved by id. */
function preflightRecord({
  isExistingUser,
  email = 'invitee@example.com',
}: {
  isExistingUser: boolean
  email?: string | null
}) {
  return {
    records: [
      makeFakeRecord({
        memberEmail: email,
        isExistingUser,
        memberName: 'Kofi Mensah',
        spaceName: 'Community Garden',
        inviterName: 'Ama Owusu',
      }),
    ],
  }
}

describe('addSpaceMember — re-invite branch for pending invitees (GOAL-329)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(rateLimit as jest.Mock).mockResolvedValue({ allowed: true, retryAfter: 0 })
    ;(canManageMembers as jest.Mock).mockResolvedValue(true)
    ;(memberExistsInSpace as jest.Mock).mockResolvedValue(true)
    ;(sendSpaceInviteEmail as jest.Mock).mockResolvedValue({ ok: true })
    ;(sendAddedToSpaceEmail as jest.Mock).mockResolvedValue({ ok: true })
  })

  it('re-mints + re-sends the invite when a pending placeholder is already in the space', async () => {
    const { session, executeWrite, writes, close } = makeFakeSession([
      preflightRecord({ isExistingUser: false }),
    ])
    const before = Date.now()

    const result = await spaceMembershipResolvers.addSpaceMember(
      undefined as never,
      { spaceId: 'space-1', memberId: 'person-2', role: 'MEMBER' as never },
      makeContext(() => session)
    )

    const after = Date.now()

    // Success envelope with the re-invite message — NOT the old dead-end.
    expect(result.success).toBe(true)
    expect(result.message).toMatch(/fresh invite email has been sent/)
    expect(result.message).not.toMatch(/already part of the space/)

    // Exactly one invite email, carrying a `${spaceId}.${uuid}` token so
    // the accept handler can route to the right space.
    expect(sendSpaceInviteEmail).toHaveBeenCalledTimes(1)
    const emailArgs = (sendSpaceInviteEmail as jest.Mock).mock.calls[0][0]
    expect(emailArgs.to).toBe('invitee@example.com')
    expect(emailArgs.spaceName).toBe('Community Garden')
    expect(emailArgs.inviterName).toBe('Ama Owusu')
    expect(emailArgs.inviteToken).toMatch(/^space-1\.[0-9a-f-]{36}$/)

    // Exactly one write — the token stamp. No SpaceMembership CREATE, no
    // MeSpace→WeSpace conversion (membership already exists).
    expect(executeWrite).toHaveBeenCalledTimes(1)
    expect(writes).toHaveLength(1)
    const stamp = writes[0]
    expect(stamp.query).toMatch(/SET\s+p\.inviteTokenHash/)
    expect(stamp.query).toMatch(/inviteTokenExpires/)
    // The mint write carries the same NOT-:User guard as the accept
    // route's redemption lookup, closing the preflight→write race.
    expect(stamp.query).toMatch(/WHERE NOT p:User/)
    expect(stamp.params.memberId).toBe('person-2')

    // Hash-only storage: what's persisted is sha256(rawToken), never the
    // raw token itself.
    expect(stamp.params.inviteTokenHash).toBe(
      hashAuthToken(emailArgs.inviteToken)
    )
    expect(stamp.params.inviteTokenHash).not.toBe(emailArgs.inviteToken)

    // 7-day TTL (GOAL-329 widened it from 48h). Allow generous clock
    // slack around the call window.
    const expiresMs = Date.parse(stamp.params.inviteExpires as string)
    expect(expiresMs).toBeGreaterThanOrEqual(before + SEVEN_DAYS_MS - 5_000)
    expect(expiresMs).toBeLessThanOrEqual(after + SEVEN_DAYS_MS + 5_000)

    // Activity log records the resend, attributed to the inviter.
    expect(createLog).toHaveBeenCalledTimes(1)
    expect((createLog as jest.Mock).mock.calls[0][0]).toMatchObject({
      userId: 'u1',
      spaceId: 'space-1',
      metadata: expect.objectContaining({
        event: 'space_invite_resent',
        memberId: 'person-2',
      }),
    })

    // The wrong email for this audience must never fire.
    expect(sendAddedToSpaceEmail).not.toHaveBeenCalled()

    // Session hygiene: the resolver's finally block closes the session.
    expect(close).toHaveBeenCalled()
  })

  it('still fails with "already part of the space" for an existing :User — no email, no token write', async () => {
    const { session, executeWrite, writes } = makeFakeSession([
      preflightRecord({ isExistingUser: true }),
    ])

    const result = await spaceMembershipResolvers.addSpaceMember(
      undefined as never,
      { spaceId: 'space-1', memberId: 'person-2', role: 'MEMBER' as never },
      makeContext(() => session)
    )

    expect(result.success).toBe(false)
    expect(result.message).toBe('This member is already part of the space.')

    // The re-invite branch must be gated on NOT-a-:User. A registered
    // member re-add must not mint a token (that would overwrite a real
    // pending invite hash is impossible here, but a stray token on a
    // registered account is an account-takeover foothold).
    expect(sendSpaceInviteEmail).not.toHaveBeenCalled()
    expect(sendAddedToSpaceEmail).not.toHaveBeenCalled()
    expect(executeWrite).not.toHaveBeenCalled()
    expect(writes).toHaveLength(0)
    expect(createLog).not.toHaveBeenCalled()
  })

  it('reports failure when the re-invite email fails — but the token was already stamped', async () => {
    ;(sendSpaceInviteEmail as jest.Mock).mockResolvedValueOnce({ ok: false })
    const { session, executeWrite, writes } = makeFakeSession([
      preflightRecord({ isExistingUser: false }),
    ])

    const result = await spaceMembershipResolvers.addSpaceMember(
      undefined as never,
      { spaceId: 'space-1', memberId: 'person-2', role: 'MEMBER' as never },
      makeContext(() => session)
    )

    expect(result.success).toBe(false)
    expect(result.message).toMatch(/could not be sent/)

    // Write-before-send: even though the send failed, the fresh token
    // hash + expiry WERE stamped (latest-write-wins on the Person).
    expect(executeWrite).toHaveBeenCalledTimes(1)
    expect(writes[0].query).toMatch(/inviteTokenHash/)
    expect(writes[0].params.inviteTokenHash).toEqual(expect.any(String))
    expect(writes[0].params.inviteExpires).toEqual(expect.any(String))
    expect(executeWrite.mock.invocationCallOrder[0]).toBeLessThan(
      (sendSpaceInviteEmail as jest.Mock).mock.invocationCallOrder[0]
    )

    // The rotation invalidated the previously emailed link even though
    // delivery failed — that state change MUST still hit the audit
    // trail, with the delivery outcome recorded on the metadata.
    expect(createLog).toHaveBeenCalledTimes(1)
    expect((createLog as jest.Mock).mock.calls[0][0]).toMatchObject({
      metadata: expect.objectContaining({
        event: 'space_invite_resent',
        emailOk: false,
      }),
    })
  })

  it('returns the existing membership and logs its ACTUAL role on resend', async () => {
    // Read #1: preflight. Read #2: the existing-membership fetch.
    const { session } = makeFakeSession([
      preflightRecord({ isExistingUser: false }),
      {
        records: [
          makeFakeRecord({
            id: 'sm-1',
            role: 'GUEST',
            addedAt: '2026-08-10T00:00:00Z',
            personId: 'person-2',
            name: 'Kofi Mensah',
            email: 'invitee@example.com',
            personLabels: ['Person'],
          }),
        ],
      },
    ])

    const result = await spaceMembershipResolvers.addSpaceMember(
      undefined as never,
      // The admin asks for ADMIN — but a re-invite must NOT change the
      // pending membership's role, and the audit log must record the
      // role the membership actually holds.
      { spaceId: 'space-1', memberId: 'person-2', role: 'ADMIN' as never },
      makeContext(() => session)
    )

    expect(result.success).toBe(true)
    expect(result.membership).toMatchObject({
      id: 'sm-1',
      role: 'GUEST',
      member: [{ id: 'person-2', name: 'Kofi Mensah' }],
    })
    expect((createLog as jest.Mock).mock.calls[0][0].metadata).toMatchObject({
      event: 'space_invite_resent',
      role: 'GUEST',
    })
  })

  it('inviteToSpaceByEmail reaches the same re-invite branch for a pending placeholder', async () => {
    // Read #1: email→Person resolution finds the existing placeholder.
    // Read #2: the preflight for that Person (not a :User).
    const { session, executeWrite, writes } = makeFakeSession([
      { records: [makeFakeRecord({ id: 'person-2' })] },
      preflightRecord({ isExistingUser: false }),
    ])

    const result = await spaceMembershipResolvers.inviteToSpaceByEmail(
      undefined as never,
      { spaceId: 'space-9', email: 'Invitee@Example.com ', role: 'MEMBER' as never },
      makeContext(() => session)
    )

    expect(result.success).toBe(true)
    expect(result.message).toMatch(/fresh invite email has been sent/)

    // Same token contract as addSpaceMember — prefix is THIS space's id.
    expect(sendSpaceInviteEmail).toHaveBeenCalledTimes(1)
    const emailArgs = (sendSpaceInviteEmail as jest.Mock).mock.calls[0][0]
    expect(emailArgs.inviteToken).toMatch(/^space-9\.[0-9a-f-]{36}$/)

    // Only the token stamp was written — no placeholder CREATE (the
    // Person already existed), no membership CREATE.
    expect(executeWrite).toHaveBeenCalledTimes(1)
    expect(writes[0].query).toMatch(/inviteTokenHash/)
  })
})
