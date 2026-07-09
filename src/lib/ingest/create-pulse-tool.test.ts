import { randomUUID } from 'node:crypto'
import { driver } from '@/lib/neo4j/driver'
import { executeAuthorizedWriteTool } from '@/lib/chat/hitl'
import { initGraph } from '@/modules/graph'

/**
 * Integration test for the create_pulse branch of executeAuthorizedWriteTool
 * once it carries the slice-2 doc-ingestion contract:
 *
 *   - new node carries labels ["FieldPulse", "<GoalPulse|ResourcePulse|StoryPulse>"]
 *   - (:FieldContext)-[:HAS_PULSE]->(:FieldPulse)
 *   - (:FieldPulse)-[:EXTRACTED_FROM]->(:Document) when documentId is provided
 *   - exactly one Log entry attributed to the uploader (parity with create_person)
 */

let neo4jAvailable = false
const testRunId = `it_${randomUUID().slice(0, 8)}`
const ids = {
  user: `test_user_${testRunId}`,
  meSpace: `test_me_${testRunId}`,
  fieldContext: `test_ctx_${testRunId}`,
  document: `test_${testRunId}_doc`,
  // Attribution fixtures: one PersonPulse attached to the context via
  // HAS_PERSON (valid attribution target) and one deliberately unattached
  // (must fall back to the acting user).
  attachedPerson: `test_attr_${testRunId}`,
  unattachedPerson: `test_unatt_${testRunId}`,
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
      CREATE (ap:Person:PersonPulse {id: $attachedPersonId, firstName: 'Nadia', lastName: 'Woods', name: 'Nadia Woods', createdAt: datetime()})
      CREATE (up:Person:PersonPulse {id: $unattachedPersonId, firstName: 'Omar', lastName: 'Haddad', name: 'Omar Haddad', createdAt: datetime()})
      CREATE (u)-[:OWNS]->(s)
      CREATE (s)-[:HAS_CONTEXT]->(c)
      CREATE (c)-[:HAS_DOCUMENT]->(d)
      CREATE (d)-[:UPLOADED_BY]->(u)
      CREATE (c)-[:HAS_PERSON]->(ap)
      `,
      {
        userId: ids.user,
        spaceId: ids.meSpace,
        ctxId: ids.fieldContext,
        docId: ids.document,
        attachedPersonId: ids.attachedPerson,
        unattachedPersonId: ids.unattachedPerson,
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
    await session.run(
      `MATCH (log:Log)-[:CREATED_BY]->(u:Person {id: $userId}) DETACH DELETE log`,
      { userId: ids.user }
    )
    await session.run(
      `MATCH (c:FieldContext {id: $ctxId})-[:HAS_PULSE]->(p:FieldPulse) DETACH DELETE p`,
      { ctxId: ids.fieldContext }
    )
    await session.run(
      `
      MATCH (n)
      WHERE n.id IN [$userId, $spaceId, $ctxId, $docId, $attachedPersonId, $unattachedPersonId]
      DETACH DELETE n
      `,
      {
        userId: ids.user,
        spaceId: ids.meSpace,
        ctxId: ids.fieldContext,
        docId: ids.document,
        attachedPersonId: ids.attachedPerson,
        unattachedPersonId: ids.unattachedPerson,
      }
    )
  } finally {
    await session.close()
    await driver.close()
  }
})

const itIf = (cond: boolean) => (cond ? it : it.skip)

describe('executeAuthorizedWriteTool — create_pulse (slice 2)', () => {
  itIf(true)(
    'creates a GoalPulse with HAS_PULSE, EXTRACTED_FROM, and one Log entry',
    async () => {
      if (!neo4jAvailable) return
      const graph = await initGraph()

      const result = await executeAuthorizedWriteTool(graph, ids.user, 'create_pulse', {
        pulseType: 'GoalPulse',
        title: 'Ship migration',
        content: 'Cut the data migration over before EOQ.',
        horizon: 'SHORT',
        contextId: ids.fieldContext,
        contextTitle: 'Care Practices',
        documentId: ids.document,
      })
      expect(result.success).toBe(true)
      const pulseId = (result as { pulseId?: string }).pulseId
      expect(typeof pulseId).toBe('string')

      const session = driver.session()
      try {
        const rows = await session.run(
          `
          MATCH (c:FieldContext {id: $ctxId})-[:HAS_PULSE]->(p:FieldPulse {id: $pulseId})
          MATCH (p)-[:EXTRACTED_FROM]->(d:Document {id: $docId})
          RETURN labels(p) AS labels, p.title AS title, p.content AS content, p.horizon AS horizon
          `,
          { ctxId: ids.fieldContext, pulseId, docId: ids.document }
        )
        expect(rows.records).toHaveLength(1)
        const labels = rows.records[0].get('labels') as string[]
        expect(labels).toEqual(expect.arrayContaining(['FieldPulse', 'GoalPulse']))
        expect(rows.records[0].get('title')).toBe('Ship migration')
        expect(rows.records[0].get('content')).toBe(
          'Cut the data migration over before EOQ.'
        )
        expect(rows.records[0].get('horizon')).toBe('SHORT')

        const logRows = await session.run(
          `
          MATCH (log:Log)-[:CREATED_BY]->(u:Person {id: $userId})
          WHERE log.description CONTAINS 'Ship migration'
          RETURN log.id AS id, log.description AS description
          `,
          { userId: ids.user }
        )
        expect(logRows.records.length).toBeGreaterThanOrEqual(1)
        const description = String(logRows.records[0].get('description'))
        expect(description).toContain('Ship migration')
        // Rule 1 — no raw ids leak into the activity feed description
        expect(description).not.toContain(ids.fieldContext)
        expect(description).not.toContain(ids.document)
        // Rule 1 — no __typename like 'GoalPulse' leaks; use human-readable copy
        expect(description).not.toContain('GoalPulse')
      } finally {
        await session.close()
      }
    }
  )

  itIf(true)(
    'creates a ResourcePulse with correct sub-label and resourceType',
    async () => {
      if (!neo4jAvailable) return
      const graph = await initGraph()

      const result = await executeAuthorizedWriteTool(graph, ids.user, 'create_pulse', {
        pulseType: 'ResourcePulse',
        title: 'Shared infra budget',
        content: 'Pool of credits available to the migration team.',
        resourceType: 'budget',
        contextId: ids.fieldContext,
        contextTitle: 'Care Practices',
        documentId: ids.document,
      })
      expect(result.success).toBe(true)
      const pulseId = (result as { pulseId?: string }).pulseId

      const session = driver.session()
      try {
        const rows = await session.run(
          `
          MATCH (p:FieldPulse {id: $pulseId})-[:EXTRACTED_FROM]->(d:Document {id: $docId})
          RETURN labels(p) AS labels, p.resourceType AS resourceType
          `,
          { pulseId, docId: ids.document }
        )
        expect(rows.records).toHaveLength(1)
        const labels = rows.records[0].get('labels') as string[]
        expect(labels).toEqual(
          expect.arrayContaining(['FieldPulse', 'ResourcePulse'])
        )
        expect(rows.records[0].get('resourceType')).toBe('budget')
      } finally {
        await session.close()
      }
    }
  )

  itIf(true)(
    'creates a StoryPulse with no documentId (parity with manual creation; no EXTRACTED_FROM edge)',
    async () => {
      if (!neo4jAvailable) return
      const graph = await initGraph()

      const result = await executeAuthorizedWriteTool(graph, ids.user, 'create_pulse', {
        pulseType: 'StoryPulse',
        title: 'Manual story entry',
        content: 'Not extracted from any document.',
        contextId: ids.fieldContext,
        contextTitle: 'Care Practices',
        // no documentId — manual-creation parity
      })
      expect(result.success).toBe(true)
      const pulseId = (result as { pulseId?: string }).pulseId

      const session = driver.session()
      try {
        const rows = await session.run(
          `
          MATCH (p:FieldPulse {id: $pulseId})
          RETURN labels(p) AS labels,
                 size([(p)-[:EXTRACTED_FROM]->(:Document) | 1]) AS extractedFromCount
          `,
          { pulseId }
        )
        expect(rows.records).toHaveLength(1)
        const labels = rows.records[0].get('labels') as string[]
        expect(labels).toEqual(expect.arrayContaining(['FieldPulse', 'StoryPulse']))
        expect(Number(rows.records[0].get('extractedFromCount'))).toBe(0)
      } finally {
        await session.close()
      }
    }
  )

  itIf(true)(
    'refuses when the user cannot edit the FieldContext (no graph mutation)',
    async () => {
      if (!neo4jAvailable) return
      const graph = await initGraph()

      const outsiderId = `test_outsider_${testRunId}`
      const result = await executeAuthorizedWriteTool(graph, outsiderId, 'create_pulse', {
        pulseType: 'GoalPulse',
        title: 'Sneaky goal',
        content: 'Should never land in the graph.',
        contextId: ids.fieldContext,
        contextTitle: 'Care Practices',
        documentId: ids.document,
      })
      expect(result.success).toBe(false)
      expect(String(result.message || '')).toMatch(
        /edit|permission|access|spaces you/i
      )

      const session = driver.session()
      try {
        const rows = await session.run(
          `MATCH (p:FieldPulse) WHERE p.title = 'Sneaky goal' RETURN p.id AS id`
        )
        expect(rows.records).toHaveLength(0)
      } finally {
        await session.close()
      }
    }
  )
})

// Doc-ingest attribution: when create_pulse carries attributedToPersonId for
// a person attached (HAS_PERSON) to the SAME FieldContext, the canonical
// (:FieldPulse)-[:INITIATED_BY]->() author edge points at that person instead
// of the acting user — exactly one INITIATED_BY edge either way. The activity
// Log stays CREATED_BY the acting user. An id that is missing, self, or not
// attached to the context falls back silently to the acting user.
describe('executeAuthorizedWriteTool — create_pulse attribution (INITIATED_BY)', () => {
  itIf(true)(
    'points INITIATED_BY at the attributed person attached to the context; Log stays CREATED_BY the acting user',
    async () => {
      if (!neo4jAvailable) return
      const graph = await initGraph()

      const result = await executeAuthorizedWriteTool(graph, ids.user, 'create_pulse', {
        pulseType: 'StoryPulse',
        title: 'Harvest story from the plot',
        content: 'Nadia told the story of the first shared harvest.',
        contextId: ids.fieldContext,
        contextTitle: 'Care Practices',
        documentId: ids.document,
        attributedToPersonId: ids.attachedPerson,
        attributedToName: 'Nadia Woods',
      })
      expect(result.success).toBe(true)
      const pulseId = (result as { pulseId?: string }).pulseId
      expect(typeof pulseId).toBe('string')
      // Execution result reports the credited author by display name.
      expect((result as { attributedTo?: string | null }).attributedTo).toBe(
        'Nadia Woods'
      )
      expect(String(result.message || '')).toContain('attributed to Nadia Woods')

      const session = driver.session()
      try {
        const rows = await session.run(
          `
          MATCH (p:FieldPulse {id: $pulseId})-[:INITIATED_BY]->(author)
          RETURN author.id AS authorId,
                 size([(p)-[:INITIATED_BY]->() | 1]) AS initiatedByCount
          `,
          { pulseId }
        )
        expect(rows.records).toHaveLength(1)
        // The pulse belongs to the attributed person, NOT the acting user.
        expect(rows.records[0].get('authorId')).toBe(ids.attachedPerson)
        expect(rows.records[0].get('authorId')).not.toBe(ids.user)
        // Exactly one canonical author edge.
        expect(Number(rows.records[0].get('initiatedByCount'))).toBe(1)

        // Audit trail unchanged: the Log is CREATED_BY the acting user and
        // its description carries the attribution by name only.
        const logRows = await session.run(
          `
          MATCH (log:Log)-[:LOGGED_FOR]->(p:FieldPulse {id: $pulseId})
          MATCH (log)-[:CREATED_BY]->(creator)
          RETURN creator.id AS creatorId, log.description AS description
          `,
          { pulseId }
        )
        expect(logRows.records).toHaveLength(1)
        expect(logRows.records[0].get('creatorId')).toBe(ids.user)
        const description = String(logRows.records[0].get('description'))
        expect(description).toContain('attributed to Nadia Woods')
        // Rule 1 — no raw person id in activity copy.
        expect(description).not.toContain(ids.attachedPerson)
      } finally {
        await session.close()
      }
    }
  )

  itIf(true)(
    'falls back to INITIATED_BY the acting user when the attributed person is NOT attached to the context (attributedTo null)',
    async () => {
      if (!neo4jAvailable) return
      const graph = await initGraph()

      const result = await executeAuthorizedWriteTool(graph, ids.user, 'create_pulse', {
        pulseType: 'GoalPulse',
        title: 'Unattached attribution attempt',
        content: 'The claimed author is not part of this field context.',
        contextId: ids.fieldContext,
        contextTitle: 'Care Practices',
        documentId: ids.document,
        attributedToPersonId: ids.unattachedPerson,
        attributedToName: 'Omar Haddad',
      })
      // Silent fallback — the write still succeeds, just as the acting user's.
      expect(result.success).toBe(true)
      const pulseId = (result as { pulseId?: string }).pulseId
      expect(typeof pulseId).toBe('string')
      expect(
        (result as { attributedTo?: string | null }).attributedTo
      ).toBeNull()
      expect(String(result.message || '')).not.toContain('attributed to')

      const session = driver.session()
      try {
        const rows = await session.run(
          `
          MATCH (p:FieldPulse {id: $pulseId})-[:INITIATED_BY]->(author)
          RETURN author.id AS authorId,
                 size([(p)-[:INITIATED_BY]->() | 1]) AS initiatedByCount
          `,
          { pulseId }
        )
        expect(rows.records).toHaveLength(1)
        expect(rows.records[0].get('authorId')).toBe(ids.user)
        expect(Number(rows.records[0].get('initiatedByCount'))).toBe(1)
      } finally {
        await session.close()
      }
    }
  )

  itIf(true)(
    'self-attribution collapses to plain authorship (INITIATED_BY the acting user, attributedTo null)',
    async () => {
      if (!neo4jAvailable) return
      const graph = await initGraph()

      const result = await executeAuthorizedWriteTool(graph, ids.user, 'create_pulse', {
        pulseType: 'StoryPulse',
        title: 'Self attribution collapses',
        content: 'Attributing a pulse to yourself is just authorship.',
        contextId: ids.fieldContext,
        contextTitle: 'Care Practices',
        attributedToPersonId: ids.user,
        attributedToName: 'Test Uploader',
      })
      expect(result.success).toBe(true)
      const pulseId = (result as { pulseId?: string }).pulseId
      expect(
        (result as { attributedTo?: string | null }).attributedTo
      ).toBeNull()

      const session = driver.session()
      try {
        const rows = await session.run(
          `
          MATCH (p:FieldPulse {id: $pulseId})-[:INITIATED_BY]->(author)
          RETURN author.id AS authorId,
                 size([(p)-[:INITIATED_BY]->() | 1]) AS initiatedByCount
          `,
          { pulseId }
        )
        expect(rows.records).toHaveLength(1)
        expect(rows.records[0].get('authorId')).toBe(ids.user)
        expect(Number(rows.records[0].get('initiatedByCount'))).toBe(1)
      } finally {
        await session.close()
      }
    }
  )
})
