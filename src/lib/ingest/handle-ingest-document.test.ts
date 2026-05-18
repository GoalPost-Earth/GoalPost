import { randomUUID } from 'node:crypto'
import { driver } from '@/lib/neo4j/driver'
import { createMemoryBlobStore } from './blob-store'
import { handleIngestDocument } from './handle-ingest-document'
import type { ExtractionModelClient } from './extraction-model-invoker'
import { executeAuthorizedWriteTool } from '@/lib/chat/hitl'
import { initGraph } from '@/modules/graph'

/**
 * Integration test for the doc-ingestion route orchestrator. Composes:
 * DocumentStorage → DocumentTextExtractor → FieldContextRoster →
 * ExtractionModelInvoker (mocked) → fresh ConversationThread + synthesized
 * assistant turn → optional executeAuthorizedWriteTool to simulate user
 * clicking Approve.
 */

let neo4jAvailable = false
const testRunId = `it_${randomUUID().slice(0, 8)}`
const ids = {
  user: `test_user_${testRunId}`,
  meSpace: `test_me_${testRunId}`,
  fieldContext: `test_ctx_${testRunId}`,
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
      CREATE (u)-[:OWNS]->(s)
      CREATE (s)-[:HAS_CONTEXT]->(c)
      `,
      { userId: ids.user, spaceId: ids.meSpace, ctxId: ids.fieldContext }
    )
  } finally {
    await session.close()
  }
})

afterAll(async () => {
  if (!neo4jAvailable) return
  const session = driver.session()
  try {
    // Logs, Documents, Persons, Turns, Threads attached to the test user/context
    await session.run(
      `MATCH (log:Log)-[:CREATED_BY]->(u:Person {id: $userId}) DETACH DELETE log`,
      { userId: ids.user }
    )
    await session.run(
      `MATCH (c:FieldContext {id: $ctxId})-[:HAS_DOCUMENT]->(d:Document) DETACH DELETE d`,
      { ctxId: ids.fieldContext }
    )
    await session.run(
      `MATCH (c:FieldContext {id: $ctxId})-[:HAS_PERSON]->(p:Person) DETACH DELETE p`,
      { ctxId: ids.fieldContext }
    )
    await session.run(
      `MATCH (u:Person {id: $userId})-[:HAS_THREAD]->(t:ConversationThread)
       OPTIONAL MATCH (t)-[:HAS_TURN]->(turn)
       DETACH DELETE turn, t`,
      { userId: ids.user }
    )
    await session.run(
      `MATCH (n) WHERE n.id IN [$userId, $spaceId, $ctxId] DETACH DELETE n`,
      { userId: ids.user, spaceId: ids.meSpace, ctxId: ids.fieldContext }
    )
  } finally {
    await session.close()
    await driver.close()
  }
})

const itIf = (cond: boolean) => (cond ? it : it.skip)

describe('handleIngestDocument — end-to-end orchestration (Slice 1)', () => {
  itIf(true)('happy path: txt upload → Document node + fresh thread titled "Ingest: <filename>" + synthesized assistant turn', async () => {
    if (!neo4jAvailable) return
    const blobStore = createMemoryBlobStore()
    const modelClient: ExtractionModelClient = async () => ({
      persons: [{ firstName: 'Sarah', lastName: 'Chen' }],
      assistantText: '',
    })

    const result = await handleIngestDocument(
      { driver, blobStore, modelClient },
      {
        currentUserId: ids.user,
        fieldContextId: ids.fieldContext,
        filename: 'meeting-notes.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('Sarah Chen led the migration.', 'utf8'),
        hint: null,
      }
    )

    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error('unreachable')
    expect(result.documentId.length).toBeGreaterThan(0)
    expect(result.threadId.length).toBeGreaterThan(0)
    expect(result.pendingApprovals).toHaveLength(1)
    expect(result.pendingApprovals[0].tool).toBe('create_person')

    const session = driver.session()
    try {
      // Document anchored
      const docRows = await session.run(
        `MATCH (c:FieldContext {id: $ctxId})-[:HAS_DOCUMENT]->(d:Document {id: $docId})-[:UPLOADED_BY]->(u:Person {id: $userId})
         RETURN d.filename AS filename`,
        { ctxId: ids.fieldContext, docId: result.documentId, userId: ids.user }
      )
      expect(docRows.records).toHaveLength(1)
      expect(docRows.records[0].get('filename')).toBe('meeting-notes.txt')

      // Fresh thread titled "Ingest: <filename>"
      const threadRows = await session.run(
        `MATCH (u:Person {id: $userId})-[:HAS_THREAD]->(t:ConversationThread {id: $threadId})
         RETURN t.title AS title`,
        { userId: ids.user, threadId: result.threadId }
      )
      expect(threadRows.records).toHaveLength(1)
      expect(threadRows.records[0].get('title')).toBe('Ingest: meeting-notes.txt')

      // Two turns: user (upload summary), assistant (synthesized)
      const turnRows = await session.run(
        `MATCH (t:ConversationThread {id: $threadId})-[:HAS_TURN]->(turn:ConversationTurn)
         RETURN turn.role AS role, turn.content AS content, turn.parts AS parts, turn.order AS order
         ORDER BY turn.order ASC`,
        { threadId: result.threadId }
      )
      expect(turnRows.records).toHaveLength(2)
      expect(turnRows.records[0].get('role')).toBe('user')
      expect(String(turnRows.records[0].get('content'))).toContain('meeting-notes.txt')
      expect(String(turnRows.records[0].get('content'))).not.toMatch(/[a-f0-9-]{36}/)

      expect(turnRows.records[1].get('role')).toBe('assistant')
      const parts = JSON.parse(turnRows.records[1].get('parts') as string) as Array<{
        type: string
        toolCallId?: string
        state?: string
        input?: unknown
        output?: { approvalHash?: string; approvalRequired?: boolean; tool?: string }
      }>
      // synthesized part is AI SDK v5 shape: tool-create_person, output-available
      const toolPart = parts.find((p) => p.type === 'tool-create_person')
      expect(toolPart).toBeDefined()
      expect(toolPart!.state).toBe('output-available')
      expect(toolPart!.output?.approvalRequired).toBe(true)
      expect(typeof toolPart!.output?.approvalHash).toBe('string')
    } finally {
      await session.close()
    }
  })

  itIf(true)('approving the synthesized tool call lands the PersonPulse with EXTRACTED_FROM to the Document', async () => {
    if (!neo4jAvailable) return
    const blobStore = createMemoryBlobStore()
    const modelClient: ExtractionModelClient = async () => ({
      persons: [{ firstName: 'Robert', lastName: 'Patel' }],
      assistantText: '',
    })

    const result = await handleIngestDocument(
      { driver, blobStore, modelClient },
      {
        currentUserId: ids.user,
        fieldContextId: ids.fieldContext,
        filename: 'roster.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('Robert Patel attended.'),
        hint: null,
      }
    )
    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error('unreachable')

    // Simulate user clicking Approve — runtime would call executeAuthorizedWriteTool
    // with the args carried by the pending approval.
    const pending = result.pendingApprovals[0]
    const graph = await initGraph()
    const execResult = await executeAuthorizedWriteTool(
      graph,
      ids.user,
      'create_person',
      pending.args
    )
    expect(execResult.success).toBe(true)

    const session = driver.session()
    try {
      const rows = await session.run(
        `
        MATCH (c:FieldContext {id: $ctxId})-[:HAS_PERSON]->(p:Person {firstName: 'Robert', lastName: 'Patel'})
        MATCH (p)-[:EXTRACTED_FROM]->(d:Document {id: $docId})
        RETURN p.id AS personId
        `,
        { ctxId: ids.fieldContext, docId: result.documentId }
      )
      expect(rows.records).toHaveLength(1)
    } finally {
      await session.close()
    }
  })

  itIf(true)('failure path: model error still synthesizes an assistant turn explaining the failure (no pre-staged tool calls)', async () => {
    if (!neo4jAvailable) return
    const blobStore = createMemoryBlobStore()
    const modelClient: ExtractionModelClient = async () => {
      throw new Error('rate limited')
    }

    const result = await handleIngestDocument(
      { driver, blobStore, modelClient },
      {
        currentUserId: ids.user,
        fieldContextId: ids.fieldContext,
        filename: 'broken.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('anything'),
        hint: null,
      }
    )
    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error('unreachable')
    expect(result.pendingApprovals).toHaveLength(0)

    const session = driver.session()
    try {
      // Document still persists
      const docRows = await session.run(
        `MATCH (d:Document {id: $docId}) RETURN d.filename AS filename`,
        { docId: result.documentId }
      )
      expect(docRows.records).toHaveLength(1)

      // Assistant turn carries a failure message, no tool-call parts
      const turnRows = await session.run(
        `MATCH (t:ConversationThread {id: $threadId})-[:HAS_TURN]->(turn:ConversationTurn {role: 'assistant'})
         RETURN turn.content AS content, turn.parts AS parts`,
        { threadId: result.threadId }
      )
      expect(turnRows.records).toHaveLength(1)
      expect(String(turnRows.records[0].get('content')).toLowerCase()).toContain('extraction failed')
      const parts = JSON.parse(turnRows.records[0].get('parts') as string) as Array<{ type: string }>
      const toolParts = parts.filter((p) => p.type.startsWith('tool-'))
      expect(toolParts).toHaveLength(0)
    } finally {
      await session.close()
    }
  })

  itIf(true)(
    'empty-result path: extraction returns zero entities → assistant turn carries "didn\'t find anything to extract" prose and no tool-call parts',
    async () => {
      if (!neo4jAvailable) return
      const blobStore = createMemoryBlobStore()
      const modelClient: ExtractionModelClient = async () => ({
        persons: [],
        pulses: [],
        assistantText: '',
      })

      const result = await handleIngestDocument(
        { driver, blobStore, modelClient },
        {
          currentUserId: ids.user,
          fieldContextId: ids.fieldContext,
          filename: 'silent.txt',
          mimeType: 'text/plain',
          buffer: Buffer.from('A short note with no people or actions.', 'utf8'),
          hint: null,
        }
      )

      expect(result.ok).toBe(true)
      if (!result.ok) throw new Error('unreachable')
      expect(result.pendingApprovals).toHaveLength(0)

      const session = driver.session()
      try {
        // Document persists even though nothing was extracted.
        const docRows = await session.run(
          `MATCH (d:Document {id: $docId}) RETURN d.filename AS filename`,
          { docId: result.documentId }
        )
        expect(docRows.records).toHaveLength(1)

        // Assistant turn lands with the empty-result message and zero
        // tool-call parts — the user's next action is "Re-extract" from the
        // Document list, never a Retry button inside this thread.
        const turnRows = await session.run(
          `MATCH (t:ConversationThread {id: $threadId})-[:HAS_TURN]->(turn:ConversationTurn {role: 'assistant'})
           RETURN turn.content AS content, turn.parts AS parts`,
          { threadId: result.threadId }
        )
        expect(turnRows.records).toHaveLength(1)
        const content = String(turnRows.records[0].get('content')).toLowerCase()
        expect(content).toContain("didn't find anything to extract")
        const parts = JSON.parse(
          turnRows.records[0].get('parts') as string
        ) as Array<{ type: string }>
        const toolParts = parts.filter((p) => p.type.startsWith('tool-'))
        expect(toolParts).toHaveLength(0)
      } finally {
        await session.close()
      }
    }
  )

  itIf(true)('rejects upload when uploader cannot edit the parent Space', async () => {
    if (!neo4jAvailable) return
    const blobStore = createMemoryBlobStore()
    const modelClient: ExtractionModelClient = async () => ({ persons: [], assistantText: '' })

    const result = await handleIngestDocument(
      { driver, blobStore, modelClient },
      {
        currentUserId: `test_outsider_${testRunId}`,
        fieldContextId: ids.fieldContext,
        filename: 'sneaky.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('x'),
        hint: null,
      }
    )
    expect(result.ok).toBe(false)
    if (result.ok) throw new Error('unreachable')
    expect(result.error.toLowerCase()).toMatch(/permission|edit|access|spaces you/i)
  })

  itIf(true)(
    'slice 2 batch — 2 persons + 3 pulses (Goal/Resource/Story) approved together land in the graph with EXTRACTED_FROM; CarePulse is dropped server-side',
    async () => {
      if (!neo4jAvailable) return
      const blobStore = createMemoryBlobStore()
      // Cast through unknown to force-feed an out-of-allowlist kind that the
      // Zod schema would normally reject. The CarePulse entry exercises the
      // runtime allowlist filter, not the schema gate.
      const modelClient = (async () => ({
        persons: [
          { firstName: 'Amelia', lastName: 'Stone' },
          { firstName: 'Diego', lastName: 'Rivera' },
        ],
        pulses: [
          {
            kind: 'GoalPulse',
            title: 'Ship the Q3 migration',
            content: 'Move all customer data to the new schema before EOQ.',
            horizon: 'SHORT',
          },
          {
            kind: 'ResourcePulse',
            title: 'Migration credits pool',
            content: 'Shared budget allocated to the migration team.',
            resourceType: 'budget',
          },
          {
            kind: 'StoryPulse',
            title: 'Why we started this',
            content: 'The old system was paging the team weekly.',
          },
          {
            kind: 'CarePulse',
            title: 'Bring soup to Mae',
            content: 'Take soup after surgery.',
          },
        ],
        assistantText: '',
      })) as unknown as ExtractionModelClient

      const result = await handleIngestDocument(
        { driver, blobStore, modelClient },
        {
          currentUserId: ids.user,
          fieldContextId: ids.fieldContext,
          filename: 'planning.txt',
          mimeType: 'text/plain',
          buffer: Buffer.from(
            'Amelia Stone and Diego Rivera met about the Q3 migration.',
            'utf8'
          ),
          hint: null,
        }
      )

      expect(result.ok).toBe(true)
      if (!result.ok) throw new Error('unreachable')

      // 2 persons + 3 valid pulses; CarePulse was dropped server-side.
      expect(result.pendingApprovals).toHaveLength(5)
      const byTool = result.pendingApprovals.reduce<Record<string, number>>(
        (acc, c) => {
          acc[c.tool] = (acc[c.tool] ?? 0) + 1
          return acc
        },
        {}
      )
      expect(byTool.create_person).toBe(2)
      expect(byTool.create_pulse).toBe(3)

      // None of the pre-staged tool calls carry the disallowed pulse type.
      const pulseTypes = result.pendingApprovals
        .filter((c) => c.tool === 'create_pulse')
        .map((c) => c.args.pulseType)
      expect(pulseTypes.sort()).toEqual(['GoalPulse', 'ResourcePulse', 'StoryPulse'])
      expect(pulseTypes).not.toContain('CarePulse')

      // Simulate Approve all — runtime would call executeAuthorizedWriteTool
      // once per pending approval.
      const graph = await initGraph()
      for (const pending of result.pendingApprovals) {
        const execResult = await executeAuthorizedWriteTool(
          graph,
          ids.user,
          pending.tool,
          pending.args
        )
        expect(execResult.success).toBe(true)
      }

      // Graph state: 2 PersonPulse + 3 FieldPulse with correct sub-labels,
      // all with EXTRACTED_FROM edge to the source Document; one Log per
      // entity; no CarePulse anywhere.
      const session = driver.session()
      try {
        const personRows = await session.run(
          `
          MATCH (c:FieldContext {id: $ctxId})-[:HAS_PERSON]->(p:Person:PersonPulse)
          WHERE p.firstName IN ['Amelia', 'Diego']
          MATCH (p)-[:EXTRACTED_FROM]->(d:Document {id: $docId})
          RETURN p.firstName AS firstName, p.lastName AS lastName
          ORDER BY p.firstName ASC
          `,
          { ctxId: ids.fieldContext, docId: result.documentId }
        )
        expect(personRows.records).toHaveLength(2)
        expect(personRows.records[0].get('firstName')).toBe('Amelia')
        expect(personRows.records[1].get('firstName')).toBe('Diego')

        const pulseRows = await session.run(
          `
          MATCH (c:FieldContext {id: $ctxId})-[:HAS_PULSE]->(p:FieldPulse)
          MATCH (p)-[:EXTRACTED_FROM]->(d:Document {id: $docId})
          RETURN p.title AS title, labels(p) AS labels
          ORDER BY p.title ASC
          `,
          { ctxId: ids.fieldContext, docId: result.documentId }
        )
        expect(pulseRows.records).toHaveLength(3)
        const titles = pulseRows.records.map((r) => r.get('title') as string)
        expect(titles).toEqual([
          'Migration credits pool',
          'Ship the Q3 migration',
          'Why we started this',
        ])
        const allLabels = pulseRows.records.flatMap(
          (r) => r.get('labels') as string[]
        )
        expect(allLabels).toEqual(expect.arrayContaining([
          'FieldPulse',
          'GoalPulse',
          'ResourcePulse',
          'StoryPulse',
        ]))
        // CarePulse never lands.
        expect(allLabels).not.toContain('CarePulse')

        // No CarePulse reached the graph even by title.
        const careRows = await session.run(
          `MATCH (p:FieldPulse) WHERE p.title = 'Bring soup to Mae' RETURN p.id AS id`
        )
        expect(careRows.records).toHaveLength(0)

        // One Log per approved entity (5 total) attributed to the uploader.
        const logRows = await session.run(
          `
          MATCH (log:Log)-[:CREATED_BY]->(u:Person {id: $userId})
          WHERE log.description CONTAINS 'Q3 migration'
             OR log.description CONTAINS 'Migration credits pool'
             OR log.description CONTAINS 'Why we started this'
             OR log.description CONTAINS 'Amelia Stone'
             OR log.description CONTAINS 'Diego Rivera'
          RETURN log.description AS description
          `,
          { userId: ids.user }
        )
        expect(logRows.records.length).toBeGreaterThanOrEqual(5)
        for (const r of logRows.records) {
          const description = String(r.get('description'))
          // Rule 1 — no raw ids and no __typename in activity copy.
          expect(description).not.toContain(ids.fieldContext)
          expect(description).not.toContain(result.documentId)
          expect(description).not.toContain('GoalPulse')
          expect(description).not.toContain('ResourcePulse')
          expect(description).not.toContain('StoryPulse')
        }
      } finally {
        await session.close()
      }
    }
  )
})
