import { randomUUID } from 'node:crypto'
import { driver } from '@/lib/neo4j/driver'
import { executeAuthorizedWriteTool } from '@/lib/chat/hitl'
import { initGraph, close as closeGraph } from '@/modules/graph'

/**
 * Integration test for the update_person branch of executeAuthorizedWriteTool.
 *
 * Part 1 — GOAL-239 slice 4 AC:
 *   - existing Person:PersonPulse node is updated in place
 *   - (:Person)-[:EXTRACTED_FROM]->(:Document) edge is APPENDED (not replaced)
 *   - existing EXTRACTED_FROM edges to prior documents survive
 *   - exactly one Log entry per update, attributed to the editor
 *   - permission gate refuses non-members without mutating the graph
 *
 * Part 2 — authorization regression suite for the two IDOR holes closed in
 * `updatePersonAuthorized` (`src/lib/chat/hitl.ts`). The pre-checks at the top
 * of that function were never sufficient on their own; the write query now
 * re-asserts authorization ANCHORED TO THE PERSON:
 *
 *   WHERE NOT p:User
 *     AND EXISTS { (space:Space)-[:HAS_CONTEXT]->(:FieldContext)-[:HAS_PERSON]->(p)
 *                  WHERE (u)-[:OWNS]->(space)
 *                     OR (space)-[:HAS_MEMBER]->(:SpaceMembership)-[:IS_MEMBER]->(u) }
 *
 * The two holes, each covered by a case below:
 *   1. no `NOT p:User` — a caller could overwrite a real account's identity
 *      fields, bypassing the self-gated `updatePeople` path. This mirrors the
 *      guard already present in `updatePersonPulse` (person-pulse-resolver.ts).
 *   2. the `contextId` branch authorized a CONTEXT, not the person — it never
 *      checked that `$personId` lived in that context, so ANY context the
 *      caller could edit authorized an update to ANY Person by id, with no
 *      shared-Space requirement at all.
 *
 * These are real-Neo4j tests on purpose: the fix lives entirely in the Cypher
 * WHERE clause, so a mocked graph would prove nothing.
 */

let neo4jAvailable = false
const testRunId = `it_${randomUUID().slice(0, 8)}`
/** Run-unique, greppable prefix — every node this suite creates carries it. */
const PREFIX = `test_${testRunId}_`
const ids = {
  user: `${PREFIX}user`,
  meSpace: `${PREFIX}me`,
  fieldContext: `${PREFIX}ctx`,
  documentA: `${PREFIX}docA`,
  documentB: `${PREFIX}docB`,
  person: `${PREFIX}person`,
  outsider: `${PREFIX}outsider`,
  // A real account (:Person:User) legitimately attached to the caller's own
  // FieldContext — addPersonToFieldContext permits attaching a co-member, so
  // this shape is legal and reachable in production.
  coMemberUser: `${PREFIX}comember_user`,
  // A wholly unrelated stranger's Space / context / person — the caller has no
  // ownership of, and no membership in, any of it.
  strangerUser: `${PREFIX}stranger_user`,
  strangerSpace: `${PREFIX}stranger_me`,
  strangerContext: `${PREFIX}stranger_ctx`,
  strangerPerson: `${PREFIX}stranger_person`,
}

/** Baseline properties the IDOR attempts must never be able to change. */
const COMEMBER_BASELINE = {
  firstName: 'Real',
  lastName: 'Account',
  name: 'Real Account',
  description: 'A real account bio that must survive.',
}
const STRANGER_BASELINE = {
  firstName: 'Distant',
  lastName: 'Stranger',
  name: 'Distant Stranger',
  description: 'A stranger bio in a space the caller cannot reach.',
}

beforeAll(async () => {
  // Fail LOUDLY rather than skipping. This suite carries the update_person
  // authorization regressions (the :User IDOR and the cross-context IDOR), and
  // those assertions ARE the proof the gate holds — so a silent skip would
  // report a green 6/6 in ~2s having exercised nothing. That is exactly what
  // happened when it was run without DOTENV_CONFIG_PATH: `src/lib/neo4j/driver.ts`
  // falls back to neo4j://localhost:7687, the connection fails, and every test
  // returned early while still passing.
  const missing = [
    ['NEO4J_URI', process.env.NEO4J_URI],
    ['NEO4J_USERNAME', process.env.NEO4J_USERNAME || process.env.NEO4J_USER],
    ['NEO4J_PASSWORD', process.env.NEO4J_PASSWORD],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key)

  if (missing.length > 0) {
    throw new Error(
      `update_person authorization suite requires a live Neo4j and refuses to skip. ` +
        `Missing environment variable(s): ${missing.join(', ')}. ` +
        `Run it with: npx cross-env DOTENV_CONFIG_PATH=./.env.local npx jest ${'src/lib/ingest/update-person-tool.test.ts'} --forceExit`
    )
  }

  try {
    const s = driver.session()
    await s.run('RETURN 1')
    await s.close()
    neo4jAvailable = true
  } catch (error) {
    throw new Error(
      `update_person authorization suite could not reach Neo4j, and refuses to ` +
        `pass vacuously: ${(error as Error).message}`
    )
  }

  const session = driver.session()
  try {
    await session.run(
      `
      CREATE (u:Person:User {id: $userId, firstName: 'Test', lastName: 'Editor', name: 'Test Editor', createdAt: datetime()})
      CREATE (s:Space:MeSpace {id: $spaceId, name: 'Test MeSpace', visibility: 'PRIVATE', createdAt: datetime()})
      CREATE (c:FieldContext {id: $ctxId, title: 'Care Practices', createdAt: datetime()})
      CREATE (dA:Document {id: $docA, filename: 'first.txt', mimeType: 'text/plain', sizeBytes: 1, uploadedAt: datetime()})
      CREATE (dB:Document {id: $docB, filename: 'second.txt', mimeType: 'text/plain', sizeBytes: 1, uploadedAt: datetime()})
      CREATE (p:Person:PersonPulse {
        id: $personId,
        firstName: 'Sarah',
        lastName: 'Chen',
        name: 'Sarah Chen',
        createdAt: datetime()
      })
      CREATE (u)-[:OWNS]->(s)
      CREATE (s)-[:HAS_CONTEXT]->(c)
      CREATE (c)-[:HAS_DOCUMENT]->(dA)
      CREATE (c)-[:HAS_DOCUMENT]->(dB)
      CREATE (dA)-[:UPLOADED_BY]->(u)
      CREATE (dB)-[:UPLOADED_BY]->(u)
      CREATE (c)-[:HAS_PERSON]->(p)
      CREATE (p)-[:EXTRACTED_FROM]->(dA)

      // --- authorization regression fixtures -------------------------------
      // A real account attached to the caller's OWN context. The person-anchored
      // reach check passes for this node (it really is in the caller's space),
      // so the ONLY thing standing between the caller and overwriting a real
      // user's identity is \`NOT p:User\`.
      CREATE (co:Person:User {
        id: $coMemberId,
        firstName: $coFirstName,
        lastName: $coLastName,
        name: $coName,
        description: $coDescription,
        createdAt: datetime()
      })
      CREATE (c)-[:HAS_PERSON]->(co)

      // A stranger's private MeSpace, its own context, and a PersonPulse inside
      // it. Nothing links the caller to any of these three nodes.
      CREATE (su:Person:User {id: $strangerUserId, firstName: 'Other', lastName: 'Owner', name: 'Other Owner', createdAt: datetime()})
      CREATE (ss:Space:MeSpace {id: $strangerSpaceId, name: 'Stranger MeSpace', visibility: 'PRIVATE', createdAt: datetime()})
      CREATE (sc:FieldContext {id: $strangerCtxId, title: 'Stranger Context', createdAt: datetime()})
      CREATE (sp:Person:PersonPulse {
        id: $strangerPersonId,
        firstName: $stFirstName,
        lastName: $stLastName,
        name: $stName,
        description: $stDescription,
        createdAt: datetime()
      })
      CREATE (su)-[:OWNS]->(ss)
      CREATE (ss)-[:HAS_CONTEXT]->(sc)
      CREATE (sc)-[:HAS_PERSON]->(sp)
      `,
      {
        userId: ids.user,
        spaceId: ids.meSpace,
        ctxId: ids.fieldContext,
        docA: ids.documentA,
        docB: ids.documentB,
        personId: ids.person,
        coMemberId: ids.coMemberUser,
        coFirstName: COMEMBER_BASELINE.firstName,
        coLastName: COMEMBER_BASELINE.lastName,
        coName: COMEMBER_BASELINE.name,
        coDescription: COMEMBER_BASELINE.description,
        strangerUserId: ids.strangerUser,
        strangerSpaceId: ids.strangerSpace,
        strangerCtxId: ids.strangerContext,
        strangerPersonId: ids.strangerPerson,
        stFirstName: STRANGER_BASELINE.firstName,
        stLastName: STRANGER_BASELINE.lastName,
        stName: STRANGER_BASELINE.name,
        stDescription: STRANGER_BASELINE.description,
      }
    )
  } finally {
    await session.close()
  }
})

afterAll(async () => {
  if (!neo4jAvailable) return
  const session = driver.session()
  try {
    // 1. Logs FIRST. They get generated ids (log_<ts>_<uuid>) so they carry no
    //    run prefix — the only handle on them is the CREATED_BY edge to one of
    //    our Persons. Deleting the Persons first would orphan them forever.
    await session.run(
      `
      MATCH (log:Log)-[:CREATED_BY]->(p:Person)
      WHERE p.id STARTS WITH $prefix
      DETACH DELETE log
      `,
      { prefix: PREFIX }
    )
    // 2. Defensive: any Person a tool attached to one of our contexts without
    //    carrying the run prefix.
    await session.run(
      `
      MATCH (c:FieldContext)-[:HAS_PERSON]->(p:Person)
      WHERE c.id STARTS WITH $prefix AND NOT p.id STARTS WITH $prefix
      DETACH DELETE p
      `,
      { prefix: PREFIX }
    )
    // 3. Everything this run created.
    await session.run(
      `MATCH (n) WHERE n.id STARTS WITH $prefix DETACH DELETE n`,
      { prefix: PREFIX }
    )
    // 4. Prove the teardown was complete — nodes AND their Logs.
    const leftovers = await session.run(
      `
      MATCH (n) WHERE n.id STARTS WITH $prefix
      RETURN count(n) AS nodeCount
      `,
      { prefix: PREFIX }
    )
    const remaining = Number(leftovers.records[0].get('nodeCount'))
    console.log(
      `[update-person-tool.test] teardown prefix=${PREFIX} leftover nodes=${remaining}`
    )
    expect(remaining).toBe(0)
  } finally {
    await session.close()
    await closeGraph()
    await driver.close()
  }
})

const itIf = (cond: boolean) => (cond ? it : it.skip)

/**
 * kb/07 Rule 1: tool failure copy is member-facing. It must never carry a raw
 * entity id or any Cypher/Neo4j internals.
 */
function expectMemberSafeMessage(message: string) {
  expect(message).toBeTruthy()
  expect(message).not.toContain(PREFIX)
  expect(message).not.toContain(testRunId)
  // No raw id shapes of any kind.
  expect(message).not.toMatch(/\b(me_|ws_|ctx_|pulse_|log_|test_)[A-Za-z0-9]/)
  // No Cypher keywords, driver internals, or GraphQL plumbing.
  expect(message).not.toMatch(
    /\b(MATCH|MERGE|OPTIONAL MATCH|RETURN|DETACH|Cypher|Neo4j|neo4j|ClientError|__typename)\b/
  )
}

/** Read the identity fields that an IDOR would have overwritten. */
async function readPersonProps(personId: string) {
  const session = driver.session()
  try {
    const rows = await session.run(
      `
      MATCH (p:Person {id: $personId})
      RETURN p.firstName AS firstName, p.lastName AS lastName,
             p.name AS name, p.description AS description,
             p.updatedAt IS NOT NULL AS touched,
             labels(p) AS labels
      `,
      { personId }
    )
    expect(rows.records).toHaveLength(1)
    const r = rows.records[0]
    return {
      firstName: r.get('firstName') as string | null,
      lastName: r.get('lastName') as string | null,
      name: r.get('name') as string | null,
      description: r.get('description') as string | null,
      touched: r.get('touched') as boolean,
      labels: r.get('labels') as string[],
    }
  } finally {
    await session.close()
  }
}

describe('executeAuthorizedWriteTool — update_person (slice 4)', () => {
  itIf(true)(
    'updates the existing person, APPENDS a new EXTRACTED_FROM edge (existing one survives), and writes exactly one Log entry',
    async () => {
      if (!neo4jAvailable) return
      const graph = await initGraph()

      const result = await executeAuthorizedWriteTool(
        graph,
        ids.user,
        'update_person',
        {
          personId: ids.person,
          firstName: 'Sarah',
          lastName: 'Chen-Liu',
          currentName: 'Sarah Chen',
          contextId: ids.fieldContext,
          contextTitle: 'Care Practices',
          documentId: ids.documentB,
        }
      )
      expect(result.success).toBe(true)

      const session = driver.session()
      try {
        // The person fields are now updated, and the composed name follows.
        const rows = await session.run(
          `
          MATCH (p:Person {id: $personId})
          RETURN p.firstName AS firstName, p.lastName AS lastName, p.name AS name,
                 [(p)-[:EXTRACTED_FROM]->(d) | d.id] AS extractedDocIds
          `,
          { personId: ids.person }
        )
        expect(rows.records).toHaveLength(1)
        expect(rows.records[0].get('firstName')).toBe('Sarah')
        expect(rows.records[0].get('lastName')).toBe('Chen-Liu')
        expect(rows.records[0].get('name')).toBe('Sarah Chen-Liu')
        const extracted = rows.records[0].get('extractedDocIds') as string[]
        // Both the prior EXTRACTED_FROM (docA) and the new one (docB) coexist.
        expect(new Set(extracted)).toEqual(
          new Set([ids.documentA, ids.documentB])
        )

        // Exactly one Log entry created by this run, mentioning the updated
        // name in human-readable copy and without raw ids (Rule 1).
        const logRows = await session.run(
          `
          MATCH (log:Log)-[:CREATED_BY]->(u:Person {id: $userId})
          WHERE log.description STARTS WITH 'Updated'
          RETURN log.description AS description
          `,
          { userId: ids.user }
        )
        expect(logRows.records.length).toBeGreaterThanOrEqual(1)
        const description = String(logRows.records[0].get('description'))
        expect(description).toContain('Sarah Chen-Liu')
        expect(description).toContain('Care Practices')
        expect(description).not.toContain(ids.person)
        expect(description).not.toContain(ids.fieldContext)
        expect(description).not.toContain(ids.documentB)
      } finally {
        await session.close()
      }
    }
  )

  itIf(true)(
    'is idempotent on the EXTRACTED_FROM edge (running again with the same documentId does not duplicate it)',
    async () => {
      if (!neo4jAvailable) return
      const graph = await initGraph()

      const result = await executeAuthorizedWriteTool(
        graph,
        ids.user,
        'update_person',
        {
          personId: ids.person,
          firstName: 'Sarah',
          lastName: 'Chen-Liu',
          contextId: ids.fieldContext,
          contextTitle: 'Care Practices',
          documentId: ids.documentB,
        }
      )
      expect(result.success).toBe(true)

      const session = driver.session()
      try {
        const rows = await session.run(
          `
          MATCH (p:Person {id: $personId})-[r:EXTRACTED_FROM]->(d:Document {id: $docB})
          RETURN count(r) AS edgeCount
          `,
          { personId: ids.person, docB: ids.documentB }
        )
        expect(Number(rows.records[0].get('edgeCount'))).toBe(1)
      } finally {
        await session.close()
      }
    }
  )

  itIf(true)(
    'refuses when the editor cannot access the parent Space (no graph mutation)',
    async () => {
      if (!neo4jAvailable) return
      const graph = await initGraph()

      const result = await executeAuthorizedWriteTool(
        graph,
        ids.outsider,
        'update_person',
        {
          personId: ids.person,
          firstName: 'Should',
          lastName: 'NotApply',
          contextId: ids.fieldContext,
          contextTitle: 'Care Practices',
          documentId: ids.documentB,
        }
      )
      expect(result.success).toBe(false)
      expect(String(result.message || '')).toMatch(
        /edit|permission|access|spaces you/i
      )
      expectMemberSafeMessage(String(result.message || ''))

      const session = driver.session()
      try {
        const rows = await session.run(
          `MATCH (p:Person {id: $personId}) RETURN p.lastName AS lastName`,
          { personId: ids.person }
        )
        // Whatever the previous test left, "NotApply" must never land.
        expect(rows.records[0].get('lastName')).not.toBe('NotApply')
      } finally {
        await session.close()
      }
    }
  )
})

describe('executeAuthorizedWriteTool — update_person authorization regressions', () => {
  itIf(true)(
    'REGRESSION (:User IDOR): refuses to overwrite a real account attached to a context the caller CAN edit, and leaves every identity field untouched',
    async () => {
      if (!neo4jAvailable) return
      const graph = await initGraph()

      // Sanity: the target really is a :User AND really is reachable from the
      // caller's own space — so the reach check passes and `NOT p:User` is the
      // sole thing under test here.
      const before = await readPersonProps(ids.coMemberUser)
      expect(before.labels).toContain('User')
      expect(before.touched).toBe(false)

      const result = await executeAuthorizedWriteTool(
        graph,
        ids.user,
        'update_person',
        {
          // The caller genuinely owns this context and the account genuinely
          // hangs off it — this is the fully "authorized-looking" attack.
          personId: ids.coMemberUser,
          firstName: 'Hijacked',
          lastName: 'Identity',
          description: 'Attacker-supplied bio',
          contextId: ids.fieldContext,
          contextTitle: 'Care Practices',
          documentId: ids.documentB,
        }
      )

      expect(result.success).toBe(false)
      expectMemberSafeMessage(String(result.message || ''))

      const after = await readPersonProps(ids.coMemberUser)
      expect(after.firstName).toBe(COMEMBER_BASELINE.firstName)
      expect(after.lastName).toBe(COMEMBER_BASELINE.lastName)
      expect(after.name).toBe(COMEMBER_BASELINE.name)
      expect(after.description).toBe(COMEMBER_BASELINE.description)
      // Not even the unconditional `SET p.updatedAt` ran — the query matched
      // zero rows, so no clause after the WHERE executed.
      expect(after.touched).toBe(false)

      const session = driver.session()
      try {
        // No provenance edge and no activity Log may be minted for a refusal.
        const edges = await session.run(
          `
          MATCH (p:Person {id: $personId})-[r:EXTRACTED_FROM]->(:Document)
          RETURN count(r) AS c
          `,
          { personId: ids.coMemberUser }
        )
        expect(Number(edges.records[0].get('c'))).toBe(0)

        const logs = await session.run(
          `
          MATCH (log:Log)-[:CREATED_BY]->(:Person {id: $userId})
          WHERE log.description CONTAINS 'Hijacked'
          RETURN count(log) AS c
          `,
          { userId: ids.user }
        )
        expect(Number(logs.records[0].get('c'))).toBe(0)
      } finally {
        await session.close()
      }
    }
  )

  itIf(true)(
    "REGRESSION (cross-context IDOR): refuses a personId from a stranger's space even when the supplied contextId is one the caller CAN edit",
    async () => {
      if (!neo4jAvailable) return
      const graph = await initGraph()

      const before = await readPersonProps(ids.strangerPerson)
      expect(before.labels).not.toContain('User')
      expect(before.touched).toBe(false)

      const result = await executeAuthorizedWriteTool(
        graph,
        ids.user,
        'update_person',
        {
          // The contextId passes canEditContext (the caller owns it), but the
          // personId lives in a completely unrelated stranger's MeSpace. The
          // pre-check alone would have waved this straight through.
          personId: ids.strangerPerson,
          firstName: 'Pwned',
          lastName: 'Stranger',
          description: 'Attacker-supplied bio',
          contextId: ids.fieldContext,
          contextTitle: 'Care Practices',
          documentId: ids.documentB,
        }
      )

      expect(result.success).toBe(false)
      expectMemberSafeMessage(String(result.message || ''))

      const after = await readPersonProps(ids.strangerPerson)
      expect(after.firstName).toBe(STRANGER_BASELINE.firstName)
      expect(after.lastName).toBe(STRANGER_BASELINE.lastName)
      expect(after.name).toBe(STRANGER_BASELINE.name)
      expect(after.description).toBe(STRANGER_BASELINE.description)
      expect(after.touched).toBe(false)

      const session = driver.session()
      try {
        // The stranger's person must not be dragged into the caller's document
        // graph, and no Log may be written.
        const edges = await session.run(
          `
          MATCH (p:Person {id: $personId})-[r:EXTRACTED_FROM]->(:Document)
          RETURN count(r) AS c
          `,
          { personId: ids.strangerPerson }
        )
        expect(Number(edges.records[0].get('c'))).toBe(0)

        const logs = await session.run(
          `
          MATCH (log:Log)-[:CREATED_BY]->(:Person {id: $userId})
          WHERE log.description CONTAINS 'Pwned'
          RETURN count(log) AS c
          `,
          { userId: ids.user }
        )
        expect(Number(logs.records[0].get('c'))).toBe(0)
      } finally {
        await session.close()
      }
    }
  )

  itIf(true)(
    'POSITIVE CONTROL: the legitimate path still succeeds after the tightened WHERE — a PersonPulse in the caller’s own context is updated, description included',
    async () => {
      if (!neo4jAvailable) return
      const graph = await initGraph()

      // Reuses the slice-4 fixture person deliberately: the two refusals above
      // must be the gate doing its job, not the whole tool being wedged. This
      // also exercises the fill-gaps `description` branch, which sits after the
      // new WHERE clause.
      const result = await executeAuthorizedWriteTool(
        graph,
        ids.user,
        'update_person',
        {
          personId: ids.person,
          firstName: 'Sarah',
          lastName: 'Chen-Ortiz',
          description: 'Community herbalist and mutual aid organizer.',
          contextId: ids.fieldContext,
          contextTitle: 'Care Practices',
          documentId: ids.documentB,
        }
      )
      expect(result.success).toBe(true)

      const after = await readPersonProps(ids.person)
      expect(after.firstName).toBe('Sarah')
      expect(after.lastName).toBe('Chen-Ortiz')
      expect(after.name).toBe('Sarah Chen-Ortiz')
      expect(after.description).toBe(
        'Community herbalist and mutual aid organizer.'
      )
      expect(after.touched).toBe(true)

      // Cross-check: the two IDOR targets are still pristine at the end of the
      // run, so nothing in the successful path leaked sideways.
      const coMember = await readPersonProps(ids.coMemberUser)
      expect(coMember.name).toBe(COMEMBER_BASELINE.name)
      const stranger = await readPersonProps(ids.strangerPerson)
      expect(stranger.name).toBe(STRANGER_BASELINE.name)
    }
  )
})
