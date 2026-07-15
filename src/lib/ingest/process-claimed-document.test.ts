import { randomUUID } from 'node:crypto'
import { driver } from '@/lib/neo4j/driver'
import { createMemoryBlobStore } from './blob-store'
import { processClaimedDocument } from './handle-ingest-document'
import { seedAndIngest } from './__test-utils__/handle-ingest-document-helper'
import type { ExtractionModelClient } from './extraction-model-invoker'

/**
 * GOAL-292 — hard-failure paths through the split enqueue/process pipeline.
 *
 * Before GOAL-292, a bad mime/blob was discovered synchronously in the same
 * request that anchored the Document — a rejected upload never left a
 * Document node behind. Now `enqueueIngestDocument` always anchors first
 * (PENDING), and only the background job's `processClaimedDocument`
 * discovers the failure — so these cases now leave a `FAILED` Document with
 * a diagnosable `failureReason`, rather than a bare 400 with no trace.
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
    await session.run(
      `MATCH (c:FieldContext {id: $ctxId})-[:HAS_DOCUMENT]->(d:Document) DETACH DELETE d`,
      { ctxId: ids.fieldContext }
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

describe('processClaimedDocument — hard failure paths (GOAL-292)', () => {
  itIf(true)('an unsupported mime type lands the Document as FAILED with a diagnosable failureReason, not a silent rejection', async () => {
    if (!neo4jAvailable) return
    const blobStore = createMemoryBlobStore()
    const modelClient: ExtractionModelClient = async () => ({
      persons: [],
      assistantText: '',
    })

    const result = await seedAndIngest(
      { driver, blobStore, modelClient },
      {
        currentUserId: ids.user,
        fieldContextId: ids.fieldContext,
        filename: 'malware.exe',
        mimeType: 'application/x-msdownload',
        buffer: Buffer.from('not a real document'),
        hint: null,
      }
    )

    expect(result.ok).toBe(false)
    if (result.ok) throw new Error('unreachable')
    expect(result.reason).toBe('unsupported_mime')

    const session = driver.session()
    try {
      const rows = await session.run(
        `MATCH (c:FieldContext {id: $ctxId})-[:HAS_DOCUMENT]->(d:Document {filename: 'malware.exe'})
         RETURN d.status AS status, d.failureReason AS failureReason`,
        { ctxId: ids.fieldContext }
      )
      expect(rows.records).toHaveLength(1)
      expect(rows.records[0].get('status')).toBe('FAILED')
      const failureReason = rows.records[0].get('failureReason') as string | null
      expect(failureReason).toBeTruthy()
      expect(failureReason).not.toContain('document_') // no raw id leak (kb/07 Rule 1)
    } finally {
      await session.close()
    }
  })

  itIf(true)('processClaimedDocument on a non-existent documentId fails cleanly instead of throwing', async () => {
    if (!neo4jAvailable) return
    const blobStore = createMemoryBlobStore()
    const result = await processClaimedDocument(
      {
        driver,
        blobStore,
        pdfExtractionClient: async () => ({ persons: [], assistantText: '' }),
        textExtractionClient: async () => ({ persons: [], assistantText: '' }),
      },
      'document_does_not_exist'
    )
    expect(result.ok).toBe(false)
    if (result.ok) throw new Error('unreachable')
    expect(result.reason).toBe('processing_error')
  })
})
