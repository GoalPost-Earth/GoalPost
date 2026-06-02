/**
 * GOAL-249 — invite-blast wiring on the addSpaceMember resolver.
 *
 * The AC, verbatim: "21st mutation in 60min → GraphQLError code
 * RATE_LIMITED. No email sent, no token written, no activity log."
 *
 * This file tests the *wiring*, not the limiter itself (that lives in
 * rate-limit.test.ts). We mock `@/lib/auth/rate-limit` so the resolver
 * gets a deterministic `{ allowed: false, retryAfter: 1800 }` and then
 * assert three independent properties:
 *
 *   1. The resolver throws a GraphQLError with code 'RATE_LIMITED' and
 *      a user-facing message of the expected shape.
 *   2. NO Neo4j session was opened — the rejection must happen *before*
 *      `context.executionContext.session()` is called so a flood can't
 *      cost the DB pool a single connection.
 *   3. No email sent, no token written, no activity log. We assert this
 *      by mocking sendSpaceInviteEmail / sendAddedToSpaceEmail / createLog
 *      and verifying they were never called.
 *
 * The complementary happy-path test (allowed: true → resolver proceeds
 * normally) ensures we haven't broken the existing wiring.
 *
 * The resolver is a plain async function taking (parent, args, context),
 * so we can call it directly without standing up Yoga or HTTP.
 */

import { GraphQLError } from 'graphql'

// --- Module mocks (must be declared before importing the resolver) ---

// Rate limiter: the unit under test is *how the resolver reacts to a
// `{ allowed: false }` verdict*, so we mock the verdict directly.
jest.mock('@/lib/auth/rate-limit', () => ({
  rateLimit: jest.fn(),
}))

// Email senders: the AC says "no email sent" — assert via call count.
// Returning `{ ok: true }` keeps the happy-path test from blowing up
// when it does proceed past the rate-limit check.
jest.mock('@/app/api/auth/utils', () => ({
  sendSpaceInviteEmail: jest.fn().mockResolvedValue({ ok: true }),
  sendAddedToSpaceEmail: jest.fn().mockResolvedValue({ ok: true }),
}))

// Activity logger: the AC says "no activity log". Mocked so we can
// assert call count, and so we don't have to wire up a real Neo4j
// session to satisfy createLog's internal calls.
jest.mock('@/lib/activity-logs/create-log', () => ({
  createLog: jest.fn().mockResolvedValue(undefined),
}))

// Permission helpers: the happy path passes through these. Stub-and-
// allow so the happy-path test can reach the write phase, then assert
// on the session calls separately.
jest.mock('@/lib/permissions/space-permissions', () => ({
  canManageMembers: jest.fn().mockResolvedValue(true),
  memberExistsInSpace: jest.fn().mockResolvedValue(false),
  isSpaceOwner: jest.fn().mockResolvedValue(false),
}))

import { rateLimit } from '@/lib/auth/rate-limit'
import {
  sendSpaceInviteEmail,
  sendAddedToSpaceEmail,
} from '@/app/api/auth/utils'
import { createLog } from '@/lib/activity-logs/create-log'
import { spaceMembershipResolvers } from './space-membership-resolver'

// Tiny session factory that records every call so a test can later
// assert "no read happened" / "exactly one write happened". The shape
// mirrors the bits of neo4j-driver Session that the resolver uses
// (executeRead / executeWrite / close).
function makeRecordingSession() {
  const calls = {
    executeRead: jest.fn(),
    executeWrite: jest.fn(),
    close: jest.fn().mockResolvedValue(undefined),
  }
  return {
    calls,
    session: {
      executeRead: calls.executeRead,
      executeWrite: calls.executeWrite,
      close: calls.close,
    } as unknown,
  }
}

function makeContext({
  clientIp,
  sessionFactory,
}: {
  clientIp?: string
  sessionFactory: () => unknown
}) {
  // Only the keys the resolver reads. `jwt.user.id` is the inviter id
  // (required, else the resolver short-circuits with an auth error
  // *before* the rate-limit check fires — which is the wrong shape for
  // these tests).
  return {
    jwt: { sub: 'u1', user: { id: 'u1', email: 'inviter@example.com' } },
    auth: { jwt: { sub: 'u1', user: { id: 'u1', email: 'inviter@example.com' } } },
    executionContext: { session: sessionFactory },
    clientIp,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any
}

describe('addSpaceMember — invite-blast rate-limit wiring (GOAL-249)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('throws GraphQLError(code=RATE_LIMITED) when the limiter denies', async () => {
    // 1800s retryAfter ≈ 30 minutes, so the rendered message should say
    // "30 minutes". The resolver does Math.ceil(retryAfter/60) — useful
    // to lock down the rendering shape so we don't accidentally start
    // showing raw seconds to end users.
    ;(rateLimit as jest.Mock).mockResolvedValue({
      allowed: false,
      retryAfter: 1800,
    })

    const { calls, session } = makeRecordingSession()
    const sessionFactory = jest.fn(() => session)

    let caught: unknown
    try {
      await spaceMembershipResolvers.addSpaceMember(
        undefined as never,
        { spaceId: 'space-1', memberId: 'person-2', role: 'MEMBER' as never },
        makeContext({ clientIp: '203.0.113.99', sessionFactory })
      )
    } catch (e) {
      caught = e
    }

    // Shape contract: GraphQLError + code on extensions. Apollo + Yoga
    // both surface this verbatim to the client; UI code branches on
    // `extensions.code === 'RATE_LIMITED'` to render the "try again
    // later" banner without a magic string match on the message.
    expect(caught).toBeInstanceOf(GraphQLError)
    const err = caught as GraphQLError
    expect(err.extensions?.code).toBe('RATE_LIMITED')
    expect(err.extensions?.retryAfter).toBe(1800)
    expect(err.message).toMatch(/Invite limit reached/)
    // 1800s → 30 minutes, plural-aware ("minutes" not "minute"). If this
    // ever flips to "30 minute" the pluralisation regressed.
    expect(err.message).toMatch(/30 minutes/)

    // Resolver-as-firewall: the rejection must happen BEFORE the
    // resolver opens a Neo4j session. Otherwise a flood of denied
    // invites would still cost us a pool checkout per request.
    expect(sessionFactory).not.toHaveBeenCalled()
    expect(calls.executeRead).not.toHaveBeenCalled()
    expect(calls.executeWrite).not.toHaveBeenCalled()

    // No side effects whatsoever.
    expect(sendSpaceInviteEmail).not.toHaveBeenCalled()
    expect(sendAddedToSpaceEmail).not.toHaveBeenCalled()
    expect(createLog).not.toHaveBeenCalled()

    // The limiter is consulted with THREE keys (per-IP, per-target-space,
    // and per-inviting-user). ALL must allow for the request to proceed;
    // any one denying is sufficient to block. The per-space key survives IP
    // rotation by an attacker armed with residential proxies — they can
    // rotate where they're calling from, but not which space they're
    // targeting; the per-user key caps a single account across every space
    // it can manage.
    expect(rateLimit).toHaveBeenCalledWith({
      policy: 'invite-blast',
      key: 'invite-blast:ip:203.0.113.99',
    })
    expect(rateLimit).toHaveBeenCalledWith({
      policy: 'invite-blast',
      key: 'invite-blast:space:space-1',
    })
    // Third supplementary key: per-inviting-user. Caps a single (possibly
    // compromised) admin from blasting invites across every space they
    // own/administer, which the per-space key alone can't bound.
    expect(rateLimit).toHaveBeenCalledWith({
      policy: 'invite-blast',
      key: 'invite-blast:user:u1',
    })
  })

  it('singular "minute" when retryAfter rounds to 1 minute', async () => {
    // Edge case: 30s retry → Math.ceil(30/60) === 1, so the message
    // must say "1 minute" (singular). Tiny detail, but it's the
    // difference between a polished error string and a "1 minutes"
    // tell that something is template-stringed without care.
    ;(rateLimit as jest.Mock).mockResolvedValue({
      allowed: false,
      retryAfter: 30,
    })
    const { session } = makeRecordingSession()
    let caught: unknown
    try {
      await spaceMembershipResolvers.addSpaceMember(
        undefined as never,
        { spaceId: 'space-1', memberId: 'person-2', role: 'MEMBER' as never },
        makeContext({ clientIp: '203.0.113.99', sessionFactory: () => session })
      )
    } catch (e) {
      caught = e
    }
    expect(caught).toBeInstanceOf(GraphQLError)
    expect((caught as GraphQLError).message).toMatch(/1 minute\b/)
    expect((caught as GraphQLError).message).not.toMatch(/1 minutes/)
  })

  it('falls back to "unknown" IP key when context.clientIp is missing', async () => {
    // The Yoga context builder is best-effort about clientIp (see
    // src/config/types/index.ts comment). When it's missing — local
    // curl, unit tests, a stripped header — the resolver must still
    // apply a key so the limiter actually fires (rather than throwing
    // on undefined, or silently allowing every anonymous request).
    ;(rateLimit as jest.Mock).mockResolvedValue({
      allowed: false,
      retryAfter: 60,
    })
    const { session } = makeRecordingSession()
    try {
      await spaceMembershipResolvers.addSpaceMember(
        undefined as never,
        { spaceId: 'space-1', memberId: 'person-2', role: 'MEMBER' as never },
        makeContext({ clientIp: undefined, sessionFactory: () => session })
      )
    } catch {
      /* swallow — assertion is on the rateLimit call shape */
    }
    expect(rateLimit).toHaveBeenCalledWith({
      policy: 'invite-blast',
      key: 'invite-blast:ip:unknown',
    })
  })

  it('short-circuits BEFORE the rate-limit check when unauthenticated', async () => {
    // Authentication is the outermost gate. If a request arrives without
    // a JWT, the resolver returns the auth-required envelope without
    // even consulting the limiter — anonymous traffic should not
    // consume invite-blast quota for "anonymous", and shouldn't be
    // converted into a thrown GraphQLError either (the existing UX is a
    // soft `{ success: false, message: 'Authentication required...' }`).
    const { session } = makeRecordingSession()
    const ctx = {
      jwt: undefined,
      auth: undefined,
      executionContext: { session: () => session },
      clientIp: '203.0.113.99',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any

    const result = await spaceMembershipResolvers.addSpaceMember(
      undefined as never,
      { spaceId: 'space-1', memberId: 'person-2', role: 'MEMBER' as never },
      ctx
    )
    expect(result.success).toBe(false)
    expect(result.message).toMatch(/Authentication required/)
    expect(rateLimit).not.toHaveBeenCalled()
  })

  it('proceeds past the rate-limit check when allowed (happy path)', async () => {
    // Sanity check that the wiring doesn't hard-block all invites. We
    // don't care about the full membership-create flow here — just
    // that execution reaches the Neo4j session AND attempts at least
    // one DB op (i.e. didn't throw on the gate). The session's
    // executeRead is wired to reject with a controlled error so the
    // resolver's outer try/catch turns it into the generic envelope;
    // catching it confirms we went past rateLimit + reached the DB
    // boundary, which is the only thing the wiring is responsible for.
    ;(rateLimit as jest.Mock).mockResolvedValue({
      allowed: true,
      retryAfter: 0,
    })
    const { calls, session } = makeRecordingSession()
    calls.executeRead.mockRejectedValue(new Error('reached-db'))
    const sessionFactory = jest.fn(() => session)

    const result = await spaceMembershipResolvers.addSpaceMember(
      undefined as never,
      { spaceId: 'space-1', memberId: 'person-2', role: 'MEMBER' as never },
      makeContext({ clientIp: '203.0.113.50', sessionFactory })
    )
    expect(sessionFactory).toHaveBeenCalled()
    // canManageMembers is mocked to true (no executeRead), then the
    // resolver issues a preflight read — that's the executeRead we
    // intercepted.
    expect(calls.executeRead).toHaveBeenCalled()
    expect(result.success).toBe(false)
    // Three parallel limiter calls per addSpaceMember invocation: per-IP,
    // per-target-space, and per-inviting-user. See "throws GraphQLError"
    // test for rationale.
    expect(rateLimit).toHaveBeenCalledTimes(3)
  })
})
