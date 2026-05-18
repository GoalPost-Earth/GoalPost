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
})
