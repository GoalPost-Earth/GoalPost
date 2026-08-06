import { randomUUID } from 'node:crypto'
import neo4j, { type Driver } from 'neo4j-driver'
import type { Context } from '@/config/types'
import { connectionMutations } from './connection-resolver'

/**
 * GOAL-320 — authorization gate on the `CONNECTED_TO` mutations.
 *
 * Before the fix, `createPersonConnection` / `updatePersonConnection` /
 * `deletePersonConnection` matched Persons purely on client-supplied
 * `fromPersonId` / `toPersonId` with NO authorization, so any authenticated
 * caller could MERGE an edge between any two Persons — and because
 * `relatedPeople` matches `CONNECTED_TO` undirected, a forged edge injected the
 * attacker into the victim's dashboard. The gate now lives entirely in the
 * Cypher WHERE clause (see the resolver header for the policy).
 *
 * ## Why this suite is an integration test against real Neo4j
 *
 * The gate IS the Cypher. A mocked session would only prove that we send some
 * string to the driver — it could not distinguish a correct predicate from one
 * that silently matches everything. So we drive the real dev Neo4j (env from
 * `DOTENV_CONFIG_PATH=./.env.local`), seed a fixture graph, and call the
 * exported resolver functions directly with a hand-built `Context`.
 *
 * ## Why this suite FAILS instead of skipping when Neo4j is absent
 *
 * The other `*.integration.test.ts` suites degrade to a no-op pass when the
 * env is missing. This one deliberately does NOT, and must not be "aligned"
 * back to that convention: these assertions ARE the proof the security gate
 * works. A run without `DOTENV_CONFIG_PATH` used to report a full green while
 * asserting nothing whatsoever about authorization — a vacuous pass on a
 * security suite is worse than no suite, because it reads as evidence. So
 * `beforeAll` throws, naming the missing variable(s), and every case fails
 * loudly rather than silently proving nothing.
 *
 * Run it with:
 *   npx cross-env DOTENV_CONFIG_PATH=./.env.local npx jest \
 *     src/lib/graphql/resolvers/connection-resolver.integration.test.ts
 *
 * ## Safety
 *
 * Every seeded id starts with the run-unique `goal320test_<runId>` prefix, and
 * `afterAll` sweeps the fixture with one labelled STARTS WITH match plus the
 * activity `Log` nodes attributed to the test Persons (Logs get generated ids,
 * so they can only be found via their CREATED_BY edge). Nothing pre-existing is
 * touched, and a failed run leaves nothing behind. `afterAll` also closes the
 * driver — a leaked driver hangs the whole suite with zero output.
 */

const runId = `goal320test_${randomUUID().slice(0, 8)}`

const ids = {
  // The caller: owns a MeSpace with one FieldContext holding pulseA + pulseB.
  caller: `${runId}_caller`,
  callerSpace: `${runId}_caller_space`,
  callerContext: `${runId}_caller_ctx`,
  pulseA: `${runId}_pulse_a`,
  pulseB: `${runId}_pulse_b`,
  // The forgery target: a real account with no relationship to the caller.
  victim: `${runId}_victim`,
  // A real account that shares a WeSpace with the caller. Co-membership must
  // NOT make a :User endpoint writable — that is the whole point of the rule.
  member: `${runId}_member`,
  weOwner: `${runId}_we_owner`,
  weSpace: `${runId}_we_space`,
  smCaller: `${runId}_sm_caller`,
  smMember: `${runId}_sm_member`,
  // A PersonPulse in a Space the caller has nothing to do with.
  strangerOwner: `${runId}_stranger_owner`,
  strangerSpace: `${runId}_stranger_space`,
  strangerContext: `${runId}_stranger_ctx`,
  strangerPulse: `${runId}_stranger_pulse`,
  // A WeSpace where the caller's membership is GUEST — view-only, so its
  // PersonPulses are visible but not writable.
  guestOwner: `${runId}_guest_owner`,
  guestSpace: `${runId}_guest_space`,
  guestContext: `${runId}_guest_ctx`,
  guestPulseA: `${runId}_guest_pulse_a`,
  guestPulseB: `${runId}_guest_pulse_b`,
  smGuestCaller: `${runId}_sm_guest_caller`,
  // A soft-deleted FieldContext on the caller's OWN MeSpace (GOAL-319).
  deletedContext: `${runId}_deleted_ctx`,
  deletedPulse: `${runId}_deleted_pulse`,
}

/**
 * Every node label the fixture seeds. The cleanup sweep is labelled with this
 * list so it seeks the per-label id indexes instead of running an unlabelled
 * AllNodesScan. Keep it in sync with the CREATE block below — a label seeded
 * but missing here leaks fixture nodes into the dev database.
 * (`:Log` is swept separately: Logs carry generated ids, not the run prefix.)
 */
const FIXTURE_LABELS = 'Person|Space|FieldContext|SpaceMembership'

let driver: Driver

/**
 * The resolver only reads `jwt.user.id` and `executionContext.session`, so we
 * build the narrowest possible Context. Passing `null` produces the
 * unauthenticated shape (`jwt: {}`) used by the no-JWT case.
 */
const contextFor = (callerId: string | null): Context =>
  ({
    jwt: callerId ? { user: { id: callerId } } : {},
    executionContext: { session: () => driver.session() },
  }) as unknown as Context

async function runCypher(query: string, params: Record<string, unknown> = {}) {
  const session = driver.session()
  try {
    return await session.run(query, params)
  } finally {
    await session.close()
  }
}

/** CONNECTED_TO edges between two Persons, in either direction. */
async function connectionCount(a: string, b: string): Promise<number> {
  const res = await runCypher(
    `MATCH (:Person {id: $a})-[r:CONNECTED_TO]-(:Person {id: $b})
     RETURN count(r) AS c`,
    { a, b }
  )
  return res.records[0].get('c').toNumber()
}

/** Read the stored properties off the (single) edge between two Persons. */
async function connectionProps(
  a: string,
  b: string
): Promise<{ why: string | null; interests: string | null } | null> {
  const res = await runCypher(
    `MATCH (:Person {id: $a})-[r:CONNECTED_TO]-(:Person {id: $b})
     RETURN r.why AS why, r.interests AS interests`,
    { a, b }
  )
  if (res.records.length === 0) return null
  return {
    why: res.records[0].get('why'),
    interests: res.records[0].get('interests'),
  }
}

/**
 * How many Spaces reach `pulseId` along `edge`. Used to prove the soft-delete
 * fixture is wired the way the test claims — a refusal is only meaningful if
 * the pulse really does hang off the caller's Space on the deleted edge and
 * only there. The relationship type cannot be parameterised in Cypher, so it
 * is interpolated from a closed union of two literals.
 */
async function spaceReachCount(
  pulseId: string,
  edge: 'HAS_CONTEXT' | 'HAS_DELETED_CONTEXT'
): Promise<number> {
  const res = await runCypher(
    `MATCH (:Person {id: $pulseId})<-[:HAS_PERSON]-(:FieldContext)<-[:${edge}]-(s:Space)
     RETURN count(DISTINCT s) AS c`,
    { pulseId }
  )
  return res.records[0].get('c').toNumber()
}

/** Activity Logs attributed to a Person via CREATED_BY. */
async function logCount(personId: string): Promise<number> {
  const res = await runCypher(
    `MATCH (:Log)-[:CREATED_BY]->(:Person {id: $personId}) RETURN count(*) AS c`,
    { personId }
  )
  return res.records[0].get('c').toNumber()
}

/** Seed a CONNECTED_TO edge directly, bypassing the resolver entirely. */
async function seedEdge(a: string, b: string, why: string): Promise<void> {
  await runCypher(
    `MATCH (a:Person {id: $a}), (b:Person {id: $b})
     MERGE (a)-[r:CONNECTED_TO]-(b)
     SET r.why = $why`,
    { a, b, why }
  )
}

/** Set the role on one seeded SpaceMembership. */
async function setMembershipRole(
  membershipId: string,
  role: 'ADMIN' | 'MEMBER' | 'GUEST'
): Promise<void> {
  await runCypher(
    `MATCH (sm:SpaceMembership {id: $membershipId}) SET sm.role = $role`,
    { membershipId, role }
  )
}

/**
 * A failure message must be safe to render to a member: no raw entity id, no
 * driver/Cypher internals (kb/07-ai-assistant-ux.md Rule 1). The run prefix
 * check catches ANY seeded id, including ones echoed as a substring.
 */
function expectMemberSafeMessage(message: string): void {
  expect(typeof message).toBe('string')
  expect(message.length).toBeGreaterThan(0)
  // No seeded id, in whole or in part.
  expect(message).not.toContain(runId)
  expect(message).not.toContain('goal320test')
  for (const id of Object.values(ids)) {
    expect(message).not.toContain(id)
  }
  // No driver status codes (`Neo.ClientError...`), no Cypher/label/keyword
  // fragments, no stack-trace tells.
  expect(message).not.toMatch(/Neo\./)
  expect(message).not.toMatch(/neo4j/i)
  expect(message).not.toMatch(/cypher/i)
  expect(message).not.toMatch(/\b(MATCH|MERGE|CONNECTED_TO|HAS_PERSON|FieldContext|PersonPulse)\b/)
  expect(message).not.toMatch(/\$\w+/) // no leaked query parameters
}

beforeAll(async () => {
  const uri = process.env.NEO4J_URI
  const username = process.env.NEO4J_USERNAME || process.env.NEO4J_USER
  const password = process.env.NEO4J_PASSWORD

  // Fail hard, never skip. See the header: a green run that asserted nothing
  // about the authorization gate is worse than a red one.
  const missing = [
    uri ? null : 'NEO4J_URI',
    username ? null : 'NEO4J_USERNAME (or NEO4J_USER)',
    password ? null : 'NEO4J_PASSWORD',
  ].filter((name): name is string => name !== null)

  if (missing.length > 0) {
    throw new Error(
      `GOAL-320 connection authorization suite requires a live Neo4j and refuses to skip — ` +
        `these assertions are the proof the gate works. Missing environment ` +
        `variable(s): ${missing.join(', ')}. Run it with: ` +
        `npx cross-env DOTENV_CONFIG_PATH=./.env.local npx jest ` +
        `src/lib/graphql/resolvers/connection-resolver.integration.test.ts`
    )
  }

  driver = neo4j.driver(uri!, neo4j.auth.basic(username!, password!))
  try {
    const s = driver.session()
    await s.run('RETURN 1')
    await s.close()
  } catch (error) {
    throw new Error(
      `GOAL-320 connection authorization suite could not reach Neo4j at the ` +
        `configured NEO4J_URI, and refuses to skip — these assertions are the ` +
        `proof the gate works. Underlying driver error: ` +
        `${error instanceof Error ? error.message : String(error)}`
    )
  }

  await runCypher(
    `
    // Caller: owns a MeSpace whose FieldContext holds two PersonPulses.
    CREATE (caller:Person:User {id: $caller, firstName: 'Cal', lastName: 'Ler', name: 'Cal Ler', createdAt: datetime()})
    CREATE (cs:Space:MeSpace {id: $callerSpace, name: 'Caller MeSpace', visibility: 'PRIVATE', createdAt: datetime()})
    CREATE (cctx:FieldContext {id: $callerContext, title: 'Caller People', createdAt: datetime()})
    CREATE (pa:Person:PersonPulse {id: $pulseA, firstName: 'Pulse', lastName: 'Aye', name: 'Pulse Aye', createdAt: datetime()})
    CREATE (pb:Person:PersonPulse {id: $pulseB, firstName: 'Pulse', lastName: 'Bee', name: 'Pulse Bee', createdAt: datetime()})
    CREATE (caller)-[:OWNS]->(cs)
    CREATE (cs)-[:HAS_CONTEXT]->(cctx)
    CREATE (cctx)-[:HAS_PERSON]->(pa)
    CREATE (cctx)-[:HAS_PERSON]->(pb)

    // Victim: a real account, entirely unrelated to the caller.
    CREATE (:Person:User {id: $victim, firstName: 'Vic', lastName: 'Tim', name: 'Vic Tim', createdAt: datetime()})

    // A WeSpace the caller and 'member' both belong to. Neither owns it, so
    // this exercises the HAS_MEMBER/IS_MEMBER branch of the writable predicate
    // while keeping 'member' a non-self :User endpoint.
    CREATE (member:Person:User {id: $member, firstName: 'Mem', lastName: 'Ber', name: 'Mem Ber', createdAt: datetime()})
    CREATE (weOwner:Person:User {id: $weOwner, firstName: 'We', lastName: 'Owner', name: 'We Owner', createdAt: datetime()})
    CREATE (ws:Space:WeSpace {id: $weSpace, name: 'Shared WeSpace', visibility: 'PRIVATE', createdAt: datetime()})
    CREATE (weOwner)-[:OWNS]->(ws)
    CREATE (ws)-[:HAS_MEMBER]->(:SpaceMembership {id: $smCaller, role: 'MEMBER', addedAt: datetime()})-[:IS_MEMBER]->(caller)
    CREATE (ws)-[:HAS_MEMBER]->(:SpaceMembership {id: $smMember, role: 'MEMBER', addedAt: datetime()})-[:IS_MEMBER]->(member)

    // A PersonPulse the caller has no reach to at all.
    CREATE (so:Person:User {id: $strangerOwner, firstName: 'Str', lastName: 'Owner', name: 'Str Owner', createdAt: datetime()})
    CREATE (ss:Space:MeSpace {id: $strangerSpace, name: 'Stranger MeSpace', visibility: 'PRIVATE', createdAt: datetime()})
    CREATE (sctx:FieldContext {id: $strangerContext, title: 'Stranger People', createdAt: datetime()})
    CREATE (sp:Person:PersonPulse {id: $strangerPulse, firstName: 'Stran', lastName: 'Ger', name: 'Stran Ger', createdAt: datetime()})
    CREATE (so)-[:OWNS]->(ss)
    CREATE (ss)-[:HAS_CONTEXT]->(sctx)
    CREATE (sctx)-[:HAS_PERSON]->(sp)

    // A WeSpace where the caller's membership is GUEST. Both PersonPulses live
    // in a live FieldContext the caller can SEE, so the only thing standing
    // between the caller and a write is the role filter itself. The role is
    // flipped to MEMBER in-place for the positive control.
    CREATE (go:Person:User {id: $guestOwner, firstName: 'Gue', lastName: 'Owner', name: 'Gue Owner', createdAt: datetime()})
    CREATE (gs:Space:WeSpace {id: $guestSpace, name: 'Guest WeSpace', visibility: 'PRIVATE', createdAt: datetime()})
    CREATE (gctx:FieldContext {id: $guestContext, title: 'Guest People', createdAt: datetime()})
    CREATE (gpa:Person:PersonPulse {id: $guestPulseA, firstName: 'Guest', lastName: 'Aye', name: 'Guest Aye', createdAt: datetime()})
    CREATE (gpb:Person:PersonPulse {id: $guestPulseB, firstName: 'Guest', lastName: 'Bee', name: 'Guest Bee', createdAt: datetime()})
    CREATE (go)-[:OWNS]->(gs)
    CREATE (gs)-[:HAS_CONTEXT]->(gctx)
    CREATE (gctx)-[:HAS_PERSON]->(gpa)
    CREATE (gctx)-[:HAS_PERSON]->(gpb)
    CREATE (gs)-[:HAS_MEMBER]->(:SpaceMembership {id: $smGuestCaller, role: 'GUEST', addedAt: datetime()})-[:IS_MEMBER]->(caller)

    // A soft-deleted FieldContext on the caller's OWN MeSpace: GOAL-319 deletes
    // by re-pointing HAS_CONTEXT to HAS_DELETED_CONTEXT and stamping deletedAt.
    // The pulse inside sits in a Space the caller OWNS, so ownership alone is
    // not what makes it unwritable — the traversal edge is.
    CREATE (dctx:FieldContext {id: $deletedContext, title: 'Deleted People', createdAt: datetime(), deletedAt: datetime()})
    CREATE (dp:Person:PersonPulse {id: $deletedPulse, firstName: 'Gone', lastName: 'Away', name: 'Gone Away', createdAt: datetime()})
    CREATE (cs)-[:HAS_DELETED_CONTEXT]->(dctx)
    CREATE (dctx)-[:HAS_PERSON]->(dp)
    `,
    ids
  )
}, 120_000)

afterAll(async () => {
  // The driver may never have been constructed (missing env → beforeAll threw
  // before this line).
  if (!driver) return
  try {
    // Logs first, then nodes: Logs carry generated ids and are only reachable
    // via CREATED_BY, so deleting the Persons first strands them as orphans.
    // Each sweep gets its OWN try/catch — sharing one would let a failure in
    // the Log sweep skip the node sweep entirely and leak the whole fixture.
    try {
      await runCypher(
        `MATCH (log:Log)-[:CREATED_BY]->(p:Person)
         WHERE p.id STARTS WITH $prefix
         DETACH DELETE log`,
        { prefix: runId }
      )
    } catch (error) {
      console.warn(
        `GOAL-320 cleanup: Log sweep failed for ${runId}, continuing to the node sweep`,
        error
      )
    }

    try {
      // Labelled so the planner seeks the per-label id indexes; an unlabelled
      // `MATCH (n) WHERE n.id STARTS WITH ...` is an AllNodesScan.
      // DETACH DELETE also removes every CONNECTED_TO edge we wrote.
      await runCypher(
        `MATCH (n:${FIXTURE_LABELS})
         WHERE n.id STARTS WITH $prefix
         DETACH DELETE n`,
        { prefix: runId }
      )
    } catch (error) {
      console.warn(
        `GOAL-320 cleanup: node sweep failed — fixture ${runId} may have leaked`,
        error
      )
    }
  } finally {
    // Non-negotiable: a leaked driver keeps the Node event loop alive and the
    // suite hangs with no output at all.
    await driver.close()
  }
}, 120_000)

describe('createPersonConnection — GOAL-320 authorization gate', () => {
  describe('when both endpoints are writable by the caller', () => {
    it('connects the caller to a PersonPulse in their own Space', async () => {
      const result = await connectionMutations.createPersonConnection(
        undefined as never,
        {
          fromPersonId: ids.caller,
          toPersonId: ids.pulseA,
          why: 'Met at the co-op',
          interests: 'mutual aid',
        },
        contextFor(ids.caller)
      )

      expect(result.success).toBe(true)
      expect(result.connection).toMatchObject({
        connectedPersonId: ids.pulseA,
        why: 'Met at the co-op',
        interests: 'mutual aid',
      })
      // The gate is only meaningful if the write actually landed.
      await expect(connectionCount(ids.caller, ids.pulseA)).resolves.toBe(1)
    })

    it('connects two OTHER people in the caller\'s Space (neither is the caller)', async () => {
      // This is the capability that must NOT regress: the person-detail UI and
      // the assistant's create_connection both connect two people the caller
      // knows, without the caller being an endpoint. `fromPersonId` is
      // legitimately not the JWT subject here.
      const result = await connectionMutations.createPersonConnection(
        undefined as never,
        {
          fromPersonId: ids.pulseA,
          toPersonId: ids.pulseB,
          why: 'They organise together',
          interests: 'housing',
        },
        contextFor(ids.caller)
      )

      expect(result.success).toBe(true)
      expect(result.connection).toMatchObject({
        connectedPersonId: ids.pulseB,
        why: 'They organise together',
      })
      await expect(connectionCount(ids.pulseA, ids.pulseB)).resolves.toBe(1)
    })
  })

  describe('when an endpoint is a :User the caller is not', () => {
    it('REFUSES to forge an edge onto an unrelated account, and writes nothing', async () => {
      // The core forgery from GOAL-320: the open Person directory resolves any
      // account id from an email, so the attacker knows `victim`. Pre-fix this
      // succeeded and injected the caller into the victim's people list.
      const result = await connectionMutations.createPersonConnection(
        undefined as never,
        {
          fromPersonId: ids.caller,
          toPersonId: ids.victim,
          why: 'We are close friends',
          interests: 'everything',
        },
        contextFor(ids.caller)
      )

      expect(result.success).toBe(false)
      expect(result.connection).toBeNull()
      expectMemberSafeMessage(result.message)
      await expect(connectionCount(ids.caller, ids.victim)).resolves.toBe(0)
    })

    it('REFUSES a co-member of a shared WeSpace (a :User is never writable)', async () => {
      // Sharing a Space grants reach to that Space's PersonPulses, NOT to the
      // real accounts inside it. An edge onto an account needs that account's
      // own action.
      const result = await connectionMutations.createPersonConnection(
        undefined as never,
        { fromPersonId: ids.caller, toPersonId: ids.member, why: 'Teammates' },
        contextFor(ids.caller)
      )

      expect(result.success).toBe(false)
      expect(result.connection).toBeNull()
      expectMemberSafeMessage(result.message)
      await expect(connectionCount(ids.caller, ids.member)).resolves.toBe(0)
    })
  })

  describe('when an endpoint is outside every Space the caller belongs to', () => {
    it('REFUSES a PersonPulse in a stranger\'s Space', async () => {
      const result = await connectionMutations.createPersonConnection(
        undefined as never,
        {
          fromPersonId: ids.caller,
          toPersonId: ids.strangerPulse,
          why: 'Never met',
        },
        contextFor(ids.caller)
      )

      expect(result.success).toBe(false)
      expect(result.connection).toBeNull()
      expectMemberSafeMessage(result.message)
      await expect(
        connectionCount(ids.caller, ids.strangerPulse)
      ).resolves.toBe(0)
    })
  })

  describe('when the caller is only a GUEST in the Space holding both endpoints', () => {
    // kb/02-user-roles.md: GUEST is view-only. `canEditContent`
    // (src/lib/permissions/space-permissions.ts) and `canEditContext`
    // (src/lib/chat/hitl.ts) both already require ADMIN/MEMBER, so the
    // membership branch of `writableEndpoint` filters on the same two roles.
    // These two cases are the regression guard for that filter.

    it('REFUSES the write — GUEST is view-only — and writes nothing', async () => {
      const result = await connectionMutations.createPersonConnection(
        undefined as never,
        {
          fromPersonId: ids.guestPulseA,
          toPersonId: ids.guestPulseB,
          why: 'Guests may not assert this',
          interests: 'none',
        },
        contextFor(ids.caller)
      )

      expect(result.success).toBe(false)
      expect(result.connection).toBeNull()
      expectMemberSafeMessage(result.message)
      await expect(
        connectionCount(ids.guestPulseA, ids.guestPulseB)
      ).resolves.toBe(0)
    })

    it('SUCCEEDS on the SAME fixture once that membership is MEMBER', async () => {
      // Positive control. Without it the GUEST case above could be passing for
      // any unrelated reason — a mistyped fixture id, a missing HAS_PERSON
      // edge, a Space wired to the wrong owner. Flipping ONLY `sm.role` and
      // getting the opposite answer is what proves the role filter is the
      // thing doing the refusing.
      await setMembershipRole(ids.smGuestCaller, 'MEMBER')
      try {
        const result = await connectionMutations.createPersonConnection(
          undefined as never,
          {
            fromPersonId: ids.guestPulseA,
            toPersonId: ids.guestPulseB,
            why: 'Members may assert this',
            interests: 'repair cafe',
          },
          contextFor(ids.caller)
        )

        expect(result.success).toBe(true)
        expect(result.connection).toMatchObject({
          connectedPersonId: ids.guestPulseB,
          why: 'Members may assert this',
        })
        await expect(
          connectionCount(ids.guestPulseA, ids.guestPulseB)
        ).resolves.toBe(1)
      } finally {
        // Restore, so the fixture stays what its name says regardless of how
        // this case exits.
        await setMembershipRole(ids.smGuestCaller, 'GUEST')
      }
    })
  })

  describe('when an endpoint is reachable only through a soft-deleted context', () => {
    it('REFUSES a PersonPulse behind HAS_DELETED_CONTEXT (GOAL-319), and writes nothing', async () => {
      // Fixture integrity first: the pulse must genuinely hang off the caller's
      // own Space, and ONLY along the deleted edge. Otherwise a refusal here
      // would prove nothing more than that the pulse is unreachable.
      await expect(
        spaceReachCount(ids.deletedPulse, 'HAS_DELETED_CONTEXT')
      ).resolves.toBe(1)
      await expect(
        spaceReachCount(ids.deletedPulse, 'HAS_CONTEXT')
      ).resolves.toBe(0)

      const result = await connectionMutations.createPersonConnection(
        undefined as never,
        {
          fromPersonId: ids.caller,
          toPersonId: ids.deletedPulse,
          why: 'Deleted contexts confer no reach',
        },
        contextFor(ids.caller)
      )

      expect(result.success).toBe(false)
      expect(result.connection).toBeNull()
      expectMemberSafeMessage(result.message)
      await expect(
        connectionCount(ids.caller, ids.deletedPulse)
      ).resolves.toBe(0)
    })
  })

  describe('when the request is malformed or unauthenticated', () => {
    it('REFUSES a self-connection (same id on both sides)', async () => {
      const result = await connectionMutations.createPersonConnection(
        undefined as never,
        { fromPersonId: ids.caller, toPersonId: ids.caller, why: 'Me' },
        contextFor(ids.caller)
      )

      expect(result.success).toBe(false)
      expect(result.connection).toBeNull()
      expectMemberSafeMessage(result.message)
      // A self-loop would render as the user being their own connection.
      await expect(connectionCount(ids.caller, ids.caller)).resolves.toBe(0)
    })

    it('REFUSES an unauthenticated caller and writes neither edge nor Log', async () => {
      const logsBefore = await logCount(ids.caller)

      const result = await connectionMutations.createPersonConnection(
        undefined as never,
        { fromPersonId: ids.caller, toPersonId: ids.pulseB, why: 'Anonymous' },
        contextFor(null)
      )

      expect(result.success).toBe(false)
      expect(result.connection).toBeNull()
      expectMemberSafeMessage(result.message)
      // Nothing written: no edge, and no activity attributed to anyone.
      await expect(connectionCount(ids.caller, ids.pulseB)).resolves.toBe(0)
      await expect(logCount(ids.caller)).resolves.toBe(logsBefore)
    })
  })
})

describe('updatePersonConnection / deletePersonConnection — GOAL-320 authorization gate', () => {
  describe('when the caller is an endpoint of the edge', () => {
    it('updates then deletes their own connection', async () => {
      const updated = await connectionMutations.updatePersonConnection(
        undefined as never,
        {
          fromPersonId: ids.caller,
          toPersonId: ids.pulseA,
          why: 'Actually met at the food bank',
          interests: 'food sovereignty',
        },
        contextFor(ids.caller)
      )
      expect(updated.success).toBe(true)
      await expect(connectionProps(ids.caller, ids.pulseA)).resolves.toEqual({
        why: 'Actually met at the food bank',
        interests: 'food sovereignty',
      })

      const deleted = await connectionMutations.deletePersonConnection(
        undefined as never,
        { fromPersonId: ids.caller, toPersonId: ids.pulseA },
        contextFor(ids.caller)
      )
      expect(deleted.success).toBe(true)
      await expect(connectionCount(ids.caller, ids.pulseA)).resolves.toBe(0)
    })
  })

  describe('when the caller is an endpoint of neither, but both are writable', () => {
    it('updates then deletes an edge between two people in their Space', async () => {
      const updated = await connectionMutations.updatePersonConnection(
        undefined as never,
        {
          fromPersonId: ids.pulseA,
          toPersonId: ids.pulseB,
          why: 'They co-founded the tool library',
          interests: 'repair',
        },
        contextFor(ids.caller)
      )
      expect(updated.success).toBe(true)
      await expect(connectionProps(ids.pulseA, ids.pulseB)).resolves.toEqual({
        why: 'They co-founded the tool library',
        interests: 'repair',
      })

      const deleted = await connectionMutations.deletePersonConnection(
        undefined as never,
        { fromPersonId: ids.pulseA, toPersonId: ids.pulseB },
        contextFor(ids.caller)
      )
      expect(deleted.success).toBe(true)
      await expect(connectionCount(ids.pulseA, ids.pulseB)).resolves.toBe(0)
    })
  })

  describe('when the edge is between two people outside the caller\'s reach', () => {
    it('REFUSES to update or delete it, and the edge survives', async () => {
      // Seeded directly in Cypher — the caller is neither an endpoint nor able
      // to write either endpoint, so both clauses of the gate must fail.
      await seedEdge(ids.victim, ids.strangerPulse, 'None of your business')
      await expect(
        connectionCount(ids.victim, ids.strangerPulse)
      ).resolves.toBe(1)

      const updated = await connectionMutations.updatePersonConnection(
        undefined as never,
        {
          fromPersonId: ids.victim,
          toPersonId: ids.strangerPulse,
          why: 'Tampered',
          interests: 'tampered',
        },
        contextFor(ids.caller)
      )
      expect(updated.success).toBe(false)
      expect(updated.connection).toBeNull()
      expectMemberSafeMessage(updated.message)

      const deleted = await connectionMutations.deletePersonConnection(
        undefined as never,
        { fromPersonId: ids.victim, toPersonId: ids.strangerPulse },
        contextFor(ids.caller)
      )
      expect(deleted.success).toBe(false)
      expectMemberSafeMessage(deleted.message)

      // Still there, and untouched — a failed update must not have written the
      // new properties before the gate rejected it.
      await expect(
        connectionCount(ids.victim, ids.strangerPulse)
      ).resolves.toBe(1)
      await expect(
        connectionProps(ids.victim, ids.strangerPulse)
      ).resolves.toEqual({
        why: 'None of your business',
        interests: null,
      })
    })
  })

  describe('when the caller is the subject of an edge they did not ask for', () => {
    it('lets them sever a pre-fix forged edge asserted about them', async () => {
      // Simulates an edge forged onto the caller before the gate existed: the
      // victim (from the caller's point of view, the forger) is not writable,
      // so only the caller-is-an-endpoint clause can carry this.
      await seedEdge(ids.victim, ids.caller, 'Forged before GOAL-320')
      await expect(connectionCount(ids.victim, ids.caller)).resolves.toBe(1)

      const deleted = await connectionMutations.deletePersonConnection(
        undefined as never,
        { fromPersonId: ids.victim, toPersonId: ids.caller },
        contextFor(ids.caller)
      )

      expect(deleted.success).toBe(true)
      await expect(connectionCount(ids.victim, ids.caller)).resolves.toBe(0)
    })
  })
})

describe('connection mutations — activity logging', () => {
  it('a successful create writes exactly ONE Log attributed to the caller', async () => {
    // Exactly one: the resolver must not fan out into multiple Logs. The
    // caller is a fixture node, so every Log on it comes from this suite —
    // a delta against the pre-call count isolates this one mutation.
    const before = await logCount(ids.caller)

    const result = await connectionMutations.createPersonConnection(
      undefined as never,
      { fromPersonId: ids.caller, toPersonId: ids.pulseB, why: 'Logged once' },
      contextFor(ids.caller)
    )
    expect(result.success).toBe(true)

    await expect(logCount(ids.caller)).resolves.toBe(before + 1)
  })

  it('a REFUSED create writes no Log at all', async () => {
    // A rejected write must be silent — a Log per failed forgery attempt would
    // both pollute the activity feed and confirm the target exists.
    const before = await logCount(ids.caller)

    const result = await connectionMutations.createPersonConnection(
      undefined as never,
      { fromPersonId: ids.caller, toPersonId: ids.victim, why: 'Still no' },
      contextFor(ids.caller)
    )
    expect(result.success).toBe(false)

    await expect(logCount(ids.caller)).resolves.toBe(before)
  })
})

describe('connection mutations — failure messages are member-safe', () => {
  it('never leaks a raw id or driver/Cypher internals on any refusal path', async () => {
    // Sweep every distinct refusal branch in one place, including the
    // missing-argument guards that the cases above do not reach.
    const messages: string[] = []
    const collect = (r: { message: string }) => messages.push(r.message)

    collect(
      await connectionMutations.createPersonConnection(
        undefined as never,
        { fromPersonId: ids.caller, toPersonId: ids.victim },
        contextFor(ids.caller)
      )
    )
    collect(
      await connectionMutations.createPersonConnection(
        undefined as never,
        { fromPersonId: '', toPersonId: ids.pulseA },
        contextFor(ids.caller)
      )
    )
    collect(
      await connectionMutations.createPersonConnection(
        undefined as never,
        { fromPersonId: ids.caller, toPersonId: ids.pulseA },
        contextFor(null)
      )
    )
    collect(
      await connectionMutations.createPersonConnection(
        undefined as never,
        { fromPersonId: ids.guestPulseA, toPersonId: ids.guestPulseB },
        contextFor(ids.caller)
      )
    )
    collect(
      await connectionMutations.createPersonConnection(
        undefined as never,
        { fromPersonId: ids.caller, toPersonId: ids.deletedPulse },
        contextFor(ids.caller)
      )
    )
    collect(
      await connectionMutations.updatePersonConnection(
        undefined as never,
        { fromPersonId: ids.caller, toPersonId: ids.strangerPulse },
        contextFor(ids.caller)
      )
    )
    collect(
      await connectionMutations.updatePersonConnection(
        undefined as never,
        { fromPersonId: ids.caller, toPersonId: '' },
        contextFor(ids.caller)
      )
    )
    collect(
      await connectionMutations.deletePersonConnection(
        undefined as never,
        { fromPersonId: ids.caller, toPersonId: ids.strangerPulse },
        contextFor(ids.caller)
      )
    )
    collect(
      await connectionMutations.deletePersonConnection(
        undefined as never,
        { fromPersonId: '', toPersonId: ids.pulseA },
        contextFor(ids.caller)
      )
    )
    collect(
      await connectionMutations.deletePersonConnection(
        undefined as never,
        { fromPersonId: ids.caller, toPersonId: ids.pulseA },
        contextFor(null)
      )
    )

    expect(messages).toHaveLength(10)
    for (const message of messages) {
      expectMemberSafeMessage(message)
    }
  })
})
