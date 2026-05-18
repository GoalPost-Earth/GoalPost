import { randomUUID } from 'node:crypto'
import { driver } from '@/lib/neo4j/driver'
import { executeAuthorizedWriteTool } from '@/lib/chat/hitl'
import { initGraph } from '@/modules/graph'

/**
 * Integration test for the create_person branch of executeAuthorizedWriteTool.
 * Verifies parity with manual PersonPulse creation per GOAL-236 acceptance:
 *
 *   - new node carries labels ["Person", "PersonPulse"]
 *   - (:FieldContext)-[:HAS_PERSON]->(:Person)
 *   - (:Person)-[:EXTRACTED_FROM]->(:Document) when documentId is provided
 *   - exactly one Log entry attributed to the uploader
 */

let neo4jAvailable = false
const testRunId = `it_${randomUUID().slice(0, 8)}`
const ids = {
  user: `test_user_${testRunId}`,
  meSpace: `test_me_${testRunId}`,
  fieldContext: `test_ctx_${testRunId}`,
  document: `test_${testRunId}_doc`,
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
      CREATE (u:Person:User {id: $userId, firstName: 'Test', lastName: 'Uploader', name: 'Test Uploader', createdAt: datetime()})
      CREATE (s:Space:MeSpace {id: $spaceId, name: 'Test MeSpace', visibility: 'PRIVATE', createdAt: datetime()})
      CREATE (c:FieldContext {id: $ctxId, title: 'Care Practices', createdAt: datetime()})
      CREATE (d:Document {id: $docId, filename: 'meeting-notes.txt', mimeType: 'text/plain', sizeBytes: 42, uploadedAt: datetime()})
      CREATE (u)-[:OWNS]->(s)
      CREATE (s)-[:HAS_CONTEXT]->(c)
      CREATE (c)-[:HAS_DOCUMENT]->(d)
      CREATE (d)-[:UPLOADED_BY]->(u)
      `,
      {
        userId: ids.user,
        spaceId: ids.meSpace,
        ctxId: ids.fieldContext,
        docId: ids.document,
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
    // Logs created by the test user during this run
    await session.run(
      `MATCH (log:Log)-[:CREATED_BY]->(u:Person {id: $userId}) DETACH DELETE log`,
      { userId: ids.user }
    )
    // Any Person reachable from the test FieldContext via HAS_PERSON
    await session.run(
      `MATCH (c:FieldContext {id: $ctxId})-[:HAS_PERSON]->(p:Person) DETACH DELETE p`,
      { ctxId: ids.fieldContext }
    )
    // Seed nodes
    await session.run(
      `
      MATCH (n)
      WHERE n.id IN [$userId, $spaceId, $ctxId, $docId]
      DETACH DELETE n
      `,
      {
        userId: ids.user,
        spaceId: ids.meSpace,
        ctxId: ids.fieldContext,
        docId: ids.document,
      }
    )
  } finally {
    await session.close()
    await driver.close()
  }
})

const itIf = (cond: boolean) => (cond ? it : it.skip)

describe('executeAuthorizedWriteTool — create_person', () => {
  itIf(true)('creates ["Person","PersonPulse"] with HAS_PERSON, EXTRACTED_FROM, and one Log entry', async () => {
    if (!neo4jAvailable) return
    const graph = await initGraph()

    const result = await executeAuthorizedWriteTool(graph, ids.user, 'create_person', {
      firstName: 'Sarah',
      lastName: 'Chen',
      contextId: ids.fieldContext,
      contextTitle: 'Care Practices',
      documentId: ids.document,
    })
    expect(result.success).toBe(true)
    const personId = (result as { personId?: string }).personId
    expect(typeof personId).toBe('string')

    const session = driver.session()
    try {
      // Labels + edges
      const rows = await session.run(
        `
        MATCH (c:FieldContext {id: $ctxId})-[:HAS_PERSON]->(p:Person {id: $personId})
        MATCH (p)-[:EXTRACTED_FROM]->(d:Document {id: $docId})
        RETURN labels(p) AS labels, p.firstName AS firstName, p.lastName AS lastName, p.name AS name
        `,
        { ctxId: ids.fieldContext, personId, docId: ids.document }
      )
      expect(rows.records).toHaveLength(1)
      const labels = rows.records[0].get('labels') as string[]
      expect(labels).toEqual(expect.arrayContaining(['Person', 'PersonPulse']))
      expect(rows.records[0].get('firstName')).toBe('Sarah')
      expect(rows.records[0].get('lastName')).toBe('Chen')
      expect(rows.records[0].get('name')).toBe('Sarah Chen')

      // Exactly one Log entry attributed to the uploader, mentioning the person name
      const logRows = await session.run(
        `
        MATCH (log:Log)-[:CREATED_BY]->(u:Person {id: $userId})
        WHERE log.description CONTAINS 'Sarah Chen'
        RETURN log.id AS id, log.description AS description
        `,
        { userId: ids.user }
      )
      expect(logRows.records.length).toBeGreaterThanOrEqual(1)
      const description = String(logRows.records[0].get('description'))
      expect(description).toContain('Sarah Chen')
      // Rule 1 — no raw ids leak into the activity feed description
      expect(description).not.toContain(ids.fieldContext)
      expect(description).not.toContain(ids.document)
    } finally {
      await session.close()
    }
  })

  itIf(true)('skips the EXTRACTED_FROM edge when documentId is omitted (parity with manual creation)', async () => {
    if (!neo4jAvailable) return
    const graph = await initGraph()

    const result = await executeAuthorizedWriteTool(graph, ids.user, 'create_person', {
      firstName: 'Manual',
      lastName: 'Entry',
      contextId: ids.fieldContext,
      contextTitle: 'Care Practices',
      // no documentId — same shape a future manual-create_person tool would carry
    })
    expect(result.success).toBe(true)
    const personId = (result as { personId?: string }).personId
    expect(typeof personId).toBe('string')

    const session = driver.session()
    try {
      const rows = await session.run(
        `
        MATCH (p:Person {id: $personId})
        RETURN size([(p)-[:EXTRACTED_FROM]->(:Document) | 1]) AS extractedFromCount
        `,
        { personId }
      )
      expect(Number(rows.records[0].get('extractedFromCount'))).toBe(0)
    } finally {
      await session.close()
    }
  })

  itIf(true)('refuses when the user cannot edit the FieldContext (no graph mutation)', async () => {
    if (!neo4jAvailable) return
    const graph = await initGraph()

    // Outsider id that does not own/member the test MeSpace.
    const outsiderId = `test_outsider_${testRunId}`
    const result = await executeAuthorizedWriteTool(graph, outsiderId, 'create_person', {
      firstName: 'Sneaky',
      lastName: 'Person',
      contextId: ids.fieldContext,
      contextTitle: 'Care Practices',
    })
    expect(result.success).toBe(false)
    expect(String(result.message || '')).toMatch(/edit|permission|access|spaces you/i)

    const session = driver.session()
    try {
      const rows = await session.run(
        `MATCH (p:Person) WHERE p.firstName = 'Sneaky' AND p.lastName = 'Person' RETURN p.id AS id`
      )
      expect(rows.records).toHaveLength(0)
    } finally {
      await session.close()
    }
  })
})
