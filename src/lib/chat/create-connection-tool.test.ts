import { randomUUID } from 'node:crypto'
import { driver } from '@/lib/neo4j/driver'
import { executeAuthorizedWriteTool } from '@/lib/chat/hitl'
import { initGraph } from '@/modules/graph'

/**
 * Integration test for the assistant "relationships" feature — the
 * create_connection branch of executeAuthorizedWriteTool, plus create_person
 * with a relationshipWhy. Both write a CONNECTED_TO edge carrying the why
 * (modeled undirected: MERGE (a)-[:CONNECTED_TO]-(b)). Verifies, against real
 * dev Neo4j (skips when unreachable):
 *
 *   - create_connection (you → person) writes ONE CONNECTED_TO edge with the why
 *   - re-running with no why preserves (coalesces) the existing why — idempotent
 *   - self-connection is refused
 *   - a person in a Space the user does NOT belong to cannot be connected
 *   - create_person with relationshipWhy attaches a CONNECTED_TO edge to the user
 *
 * Seed graph:
 *   user OWNS meSpace -> ctx -> HAS_PERSON friend (PersonPulse)
 *   outsider OWNS otherSpace -> otherCtx -> HAS_PERSON stranger (PersonPulse)
 * The user must be able to connect to `friend` but never to `stranger`.
 */

let neo4jAvailable = false
const testRunId = `it_${randomUUID().slice(0, 8)}`
const ids = {
  user: `test_user_${testRunId}`,
  outsider: `test_outsider_${testRunId}`,
  meSpace: `test_me_${testRunId}`,
  otherSpace: `test_other_${testRunId}`,
  ctx: `test_ctx_${testRunId}`,
  otherCtx: `test_otherctx_${testRunId}`,
  friend: `test_friend_${testRunId}`,
  stranger: `test_stranger_${testRunId}`,
}

beforeAll(async () => {
  try {
    const s = driver.session()
    await s.run('RETURN 1')
    await s.close()
    neo4jAvailable = true
  } catch {
    neo4jAvailable = false
  }
  if (!neo4jAvailable) return

  const session = driver.session()
  try {
    await session.run(
      `
      CREATE (u:Person:User {id: $userId, firstName: 'Test', lastName: 'Owner', name: 'Test Owner', createdAt: datetime()})
      CREATE (o:Person:User {id: $outsiderId, firstName: 'Out', lastName: 'Sider', name: 'Out Sider', createdAt: datetime()})
      CREATE (s:Space:MeSpace {id: $meSpace, name: 'Test MeSpace', visibility: 'PRIVATE', createdAt: datetime()})
      CREATE (os:Space:MeSpace {id: $otherSpace, name: 'Other MeSpace', visibility: 'PRIVATE', createdAt: datetime()})
      CREATE (c:FieldContext {id: $ctx, title: 'People', createdAt: datetime()})
      CREATE (oc:FieldContext {id: $otherCtx, title: 'Strangers', createdAt: datetime()})
      CREATE (f:Person:PersonPulse {id: $friend, firstName: 'Ashong', name: 'Ashong', createdAt: datetime()})
      CREATE (str:Person:PersonPulse {id: $stranger, firstName: 'Stranger', name: 'Stranger', createdAt: datetime()})
      CREATE (u)-[:OWNS]->(s)
      CREATE (o)-[:OWNS]->(os)
      CREATE (s)-[:HAS_CONTEXT]->(c)
      CREATE (os)-[:HAS_CONTEXT]->(oc)
      CREATE (c)-[:HAS_PERSON]->(f)
      CREATE (oc)-[:HAS_PERSON]->(str)
      `,
      {
        userId: ids.user,
        outsiderId: ids.outsider,
        meSpace: ids.meSpace,
        otherSpace: ids.otherSpace,
        ctx: ids.ctx,
        otherCtx: ids.otherCtx,
        friend: ids.friend,
        stranger: ids.stranger,
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
    // Logs created by the test users during this run.
    await session.run(
      `MATCH (log:Log)-[:CREATED_BY]->(u:Person) WHERE u.id IN [$userId, $outsiderId] DETACH DELETE log`,
      { userId: ids.user, outsiderId: ids.outsider }
    )
    // Any Person added to the test contexts via create_person (relationshipWhy run).
    await session.run(
      `MATCH (c:FieldContext)-[:HAS_PERSON]->(p:Person)
       WHERE c.id IN [$ctx, $otherCtx] DETACH DELETE p`,
      { ctx: ids.ctx, otherCtx: ids.otherCtx }
    )
    // Seed nodes (detaches the CONNECTED_TO edges too).
    await session.run(
      `
      MATCH (n)
      WHERE n.id IN [$userId, $outsiderId, $meSpace, $otherSpace, $ctx, $otherCtx, $friend, $stranger]
      DETACH DELETE n
      `,
      {
        userId: ids.user,
        outsiderId: ids.outsider,
        meSpace: ids.meSpace,
        otherSpace: ids.otherSpace,
        ctx: ids.ctx,
        otherCtx: ids.otherCtx,
        friend: ids.friend,
        stranger: ids.stranger,
      }
    )
  } finally {
    await session.close()
    await driver.close()
  }
})

const itIf = (cond: boolean) => (cond ? it : it.skip)

describe('executeAuthorizedWriteTool — create_connection (relationships)', () => {
  itIf(true)('connects the user to a person in their space, writing ONE CONNECTED_TO edge carrying the why + a Log', async () => {
    if (!neo4jAvailable) return
    const graph = await initGraph()

    const result = await executeAuthorizedWriteTool(graph, ids.user, 'create_connection', {
      toPersonId: ids.friend,
      toPersonName: 'Ashong',
      why: 'a wise friend',
    })
    expect(result.success).toBe(true)

    const session = driver.session()
    try {
      const rows = await session.run(
        `
        MATCH (u:Person {id: $userId})-[r:CONNECTED_TO]-(f:Person {id: $friend})
        RETURN count(r) AS edgeCount, head(collect(r.why)) AS why
        `,
        { userId: ids.user, friend: ids.friend }
      )
      expect(Number(rows.records[0].get('edgeCount'))).toBe(1)
      expect(rows.records[0].get('why')).toBe('a wise friend')

      // Activity logging is mandatory on assistant mutations (the GraphQL
      // resolver skips it; this path must not).
      const logRows = await session.run(
        `
        MATCH (log:Log)-[:CREATED_BY]->(u:Person {id: $userId})
        WHERE log.description CONTAINS 'Ashong'
        RETURN log.description AS description
        `,
        { userId: ids.user }
      )
      expect(logRows.records.length).toBeGreaterThanOrEqual(1)
      const description = String(logRows.records[0].get('description'))
      // Rule 1: no raw ids in the activity feed.
      expect(description).not.toContain(ids.friend)
      expect(description).not.toContain(ids.user)
    } finally {
      await session.close()
    }
  })

  itIf(true)('is idempotent on re-run: a second connect with no why coalesces (preserves) the existing why and does not duplicate the edge', async () => {
    if (!neo4jAvailable) return
    const graph = await initGraph()

    const result = await executeAuthorizedWriteTool(graph, ids.user, 'create_connection', {
      toPersonId: ids.friend,
      toPersonName: 'Ashong',
      // no why — must not wipe the existing 'a wise friend'
    })
    expect(result.success).toBe(true)

    const session = driver.session()
    try {
      const rows = await session.run(
        `
        MATCH (u:Person {id: $userId})-[r:CONNECTED_TO]-(f:Person {id: $friend})
        RETURN count(r) AS edgeCount, head(collect(r.why)) AS why
        `,
        { userId: ids.user, friend: ids.friend }
      )
      // MERGE keeps it to a single edge; coalesce keeps the why.
      expect(Number(rows.records[0].get('edgeCount'))).toBe(1)
      expect(rows.records[0].get('why')).toBe('a wise friend')
    } finally {
      await session.close()
    }
  })

  itIf(true)('refuses to connect a person to themselves (no edge written)', async () => {
    if (!neo4jAvailable) return
    const graph = await initGraph()

    const result = await executeAuthorizedWriteTool(graph, ids.user, 'create_connection', {
      fromPersonId: ids.friend,
      toPersonId: ids.friend,
      why: 'self',
    })
    expect(result.success).toBe(false)
    expect(String(result.message || '')).toMatch(/themselves|cannot connect/i)

    const session = driver.session()
    try {
      const rows = await session.run(
        `MATCH (f:Person {id: $friend})-[r:CONNECTED_TO]-(f) RETURN count(r) AS c`,
        { friend: ids.friend }
      )
      expect(Number(rows.records[0].get('c'))).toBe(0)
    } finally {
      await session.close()
    }
  })

  itIf(true)('refuses to connect a person in a Space the user is NOT a member of (no edge written)', async () => {
    if (!neo4jAvailable) return
    const graph = await initGraph()

    // `stranger` lives in the outsider's space; the test user owns/members neither.
    const result = await executeAuthorizedWriteTool(graph, ids.user, 'create_connection', {
      toPersonId: ids.stranger,
      toPersonName: 'Stranger',
      why: 'should be blocked',
    })
    expect(result.success).toBe(false)
    expect(String(result.message || '')).toMatch(/not found|do not have access|could not/i)

    const session = driver.session()
    try {
      const rows = await session.run(
        `MATCH (u:Person {id: $userId})-[r:CONNECTED_TO]-(s:Person {id: $stranger}) RETURN count(r) AS c`,
        { userId: ids.user, stranger: ids.stranger }
      )
      expect(Number(rows.records[0].get('c'))).toBe(0)
    } finally {
      await session.close()
    }
  })
})

describe('executeAuthorizedWriteTool — create_person with relationshipWhy', () => {
  itIf(true)('creates the person AND a CONNECTED_TO edge to the user carrying the relationshipWhy', async () => {
    if (!neo4jAvailable) return
    const graph = await initGraph()

    const result = await executeAuthorizedWriteTool(graph, ids.user, 'create_person', {
      firstName: 'Grace',
      lastName: 'Hopper',
      contextId: ids.ctx,
      contextTitle: 'People',
      relationshipWhy: 'a long-time collaborator',
      interests: 'compilers',
    })
    expect(result.success).toBe(true)
    expect((result as { connectedToYou?: boolean }).connectedToYou).toBe(true)
    const personId = (result as { personId?: string }).personId
    expect(typeof personId).toBe('string')

    const session = driver.session()
    try {
      const rows = await session.run(
        `
        MATCH (u:Person {id: $userId})-[r:CONNECTED_TO]-(p:Person {id: $personId})
        RETURN count(r) AS edgeCount, head(collect(r.why)) AS why, head(collect(r.interests)) AS interests
        `,
        { userId: ids.user, personId }
      )
      expect(Number(rows.records[0].get('edgeCount'))).toBe(1)
      expect(rows.records[0].get('why')).toBe('a long-time collaborator')
      expect(rows.records[0].get('interests')).toBe('compilers')
    } finally {
      await session.close()
    }
  })

  itIf(true)('creates the person with NO CONNECTED_TO edge when relationshipWhy is skipped (always-ask-but-skippable)', async () => {
    if (!neo4jAvailable) return
    const graph = await initGraph()

    const result = await executeAuthorizedWriteTool(graph, ids.user, 'create_person', {
      firstName: 'Unlinked',
      lastName: 'Person',
      contextId: ids.ctx,
      contextTitle: 'People',
      // no relationshipWhy — skipped
    })
    expect(result.success).toBe(true)
    expect((result as { connectedToYou?: boolean }).connectedToYou).toBe(false)
    const personId = (result as { personId?: string }).personId

    const session = driver.session()
    try {
      const rows = await session.run(
        `
        MATCH (p:Person {id: $personId})
        RETURN size([(p)-[:CONNECTED_TO]-(:Person) | 1]) AS connCount
        `,
        { personId }
      )
      expect(Number(rows.records[0].get('connCount'))).toBe(0)
    } finally {
      await session.close()
    }
  })
})
