import { randomUUID } from 'node:crypto'
import { driver } from '@/lib/neo4j/driver'
import { createMemoryBlobStore } from './blob-store'
import {
  uploadDocument,
  deleteDocument,
  attachSourceFileToResource,
} from './document-storage'

/**
 * Integration test: exercises the real Neo4j driver against the dev Aura
 * instance. Skipped automatically if Neo4j is unreachable (e.g. CI without
 * NEO4J_URI). Uses test-prefixed ids so cleanup is bounded if a teardown
 * is interrupted.
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
    const session = driver.session()
    await session.run('RETURN 1')
    await session.close()
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
    // Defensive cleanup — match every node carrying this run's ids regardless
    // of label so an interrupted test still cleans up.
    await session.run(
      `
      MATCH (n)
      WHERE n.id STARTS WITH $prefix OR n.id IN [$userId, $spaceId, $ctxId]
      DETACH DELETE n
      `,
      {
        prefix: `test_${testRunId}_`,
        userId: ids.user,
        spaceId: ids.meSpace,
        ctxId: ids.fieldContext,
      }
    )
  } finally {
    await session.close()
    await driver.close()
  }
})

const itIf = (cond: boolean) => (cond ? it : it.skip)

describe('DocumentStorage — uploadDocument', () => {
  itIf(true)('skips if neo4j is unreachable', () => {
    if (!neo4jAvailable) {
      console.warn('[document-storage.test] Skipping integration assertions — Neo4j unreachable')
    }
    expect(true).toBe(true)
  })

  itIf(true)('writes a Document node with HAS_DOCUMENT and UPLOADED_BY edges, and puts the blob', async () => {
    if (!neo4jAvailable) return
    const blobStore = createMemoryBlobStore()
    const docId = `test_${testRunId}_doc_a`
    const result = await uploadDocument({
      driver,
      blobStore,
      documentId: docId,
      fieldContextId: ids.fieldContext,
      uploaderUserId: ids.user,
      filename: 'meeting-notes.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Sarah Chen led the migration.', 'utf8'),
    })
    expect(result.id).toBe(docId)
    expect(result.filename).toBe('meeting-notes.txt')
    expect(result.mimeType).toBe('text/plain')
    expect(result.sizeBytes).toBeGreaterThan(0)
    expect(result.blobKey.length).toBeGreaterThan(0)

    // blob exists
    const blob = await blobStore.get(result.blobKey)
    expect(blob).not.toBeNull()
    expect(blob!.buffer.toString('utf8')).toContain('Sarah Chen')

    // graph shape
    const session = driver.session()
    try {
      const rows = await session.run(
        `
        MATCH (c:FieldContext {id: $ctxId})-[:HAS_PULSE]->(d:ResourcePulse {id: $docId})-[:UPLOADED_BY]->(u:Person:User {id: $userId})
        RETURN d.id AS id, d.sourceFilename AS filename, d.sourceMimeType AS mimeType, d.sourceSizeBytes AS sizeBytes, d.sourceBlobKey AS blobKey, d.uploadedAt AS uploadedAt
        `,
        { ctxId: ids.fieldContext, docId, userId: ids.user }
      )
      expect(rows.records).toHaveLength(1)
      const r = rows.records[0]
      expect(r.get('id')).toBe(docId)
      expect(r.get('filename')).toBe('meeting-notes.txt')
      expect(r.get('mimeType')).toBe('text/plain')
      expect(Number(r.get('sizeBytes'))).toBe(result.sizeBytes)
      expect(r.get('blobKey')).toBe(result.blobKey)
      expect(r.get('uploadedAt')).toBeTruthy()
    } finally {
      await session.close()
    }
  })

  itIf(true)('deleteDocument removes the Document node AND deletes the blob', async () => {
    if (!neo4jAvailable) return
    const blobStore = createMemoryBlobStore()
    const docId = `test_${testRunId}_doc_b`
    const result = await uploadDocument({
      driver,
      blobStore,
      documentId: docId,
      fieldContextId: ids.fieldContext,
      uploaderUserId: ids.user,
      filename: 'doomed.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('temporary'),
    })

    await deleteDocument({ driver, blobStore, documentId: docId })

    const session = driver.session()
    try {
      const rows = await session.run(`MATCH (d:ResourcePulse {id: $docId}) RETURN d`, { docId })
      expect(rows.records).toHaveLength(0)
    } finally {
      await session.close()
    }
    expect(await blobStore.get(result.blobKey)).toBeNull()
  })

  itIf(true)('deleteDocument preserves extracted Persons and FieldPulses (only the EXTRACTED_FROM edge drops)', async () => {
    if (!neo4jAvailable) return
    const blobStore = createMemoryBlobStore()
    const docId = `test_${testRunId}_doc_extracted`
    const personId = `test_${testRunId}_person_extracted`
    const pulseId = `test_${testRunId}_pulse_extracted`
    await uploadDocument({
      driver,
      blobStore,
      documentId: docId,
      fieldContextId: ids.fieldContext,
      uploaderUserId: ids.user,
      filename: 'with-extractions.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Sarah ran the migration.'),
    })

    // Simulate an approved extraction: a Person + a GoalPulse with
    // EXTRACTED_FROM edges back to the Document.
    const session = driver.session()
    try {
      await session.run(
        `
        MATCH (d:ResourcePulse {id: $docId})
        MATCH (c:FieldContext {id: $ctxId})
        CREATE (p:Person:PersonPulse {id: $personId, firstName: 'Sarah', lastName: 'Chen', createdAt: datetime()})
        CREATE (c)-[:HAS_PERSON]->(p)
        CREATE (p)-[:EXTRACTED_FROM]->(d)
        CREATE (g:FieldPulse:GoalPulse {id: $pulseId, title: 'Ship migration', status: 'ACTIVE', createdAt: datetime()})
        CREATE (c)-[:HAS_PULSE]->(g)
        CREATE (g)-[:EXTRACTED_FROM]->(d)
        `,
        { docId, ctxId: ids.fieldContext, personId, pulseId }
      )
    } finally {
      await session.close()
    }

    await deleteDocument({ driver, blobStore, documentId: docId })

    const verify = driver.session()
    try {
      const docGone = await verify.run(
        `MATCH (d:ResourcePulse {id: $docId}) RETURN d`,
        { docId }
      )
      expect(docGone.records).toHaveLength(0)

      const personSurvives = await verify.run(
        `MATCH (p:Person {id: $personId}) RETURN p.firstName AS firstName`,
        { personId }
      )
      expect(personSurvives.records).toHaveLength(1)
      expect(personSurvives.records[0].get('firstName')).toBe('Sarah')

      const pulseSurvives = await verify.run(
        `MATCH (g:GoalPulse {id: $pulseId}) RETURN g.title AS title`,
        { pulseId }
      )
      expect(pulseSurvives.records).toHaveLength(1)
      expect(pulseSurvives.records[0].get('title')).toBe('Ship migration')
    } finally {
      await verify.close()
    }
  })

  itIf(true)('rejects upload when the targeted FieldContext does not exist (no orphaned blob)', async () => {
    if (!neo4jAvailable) return
    const blobStore = createMemoryBlobStore()
    const docId = `test_${testRunId}_doc_c`
    await expect(
      uploadDocument({
        driver,
        blobStore,
        documentId: docId,
        fieldContextId: 'ctx_nonexistent_xyz',
        uploaderUserId: ids.user,
        filename: 'orphan.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('no parent'),
      })
    ).rejects.toThrow()

    // No leaked blob and no orphan Document node — graph cleanup ordering invariant.
    const leakedBlob = Array.from((blobStore as unknown as { _internal?: Map<string, unknown> })._internal ?? []).length
    expect(leakedBlob).toBe(0)
    const session = driver.session()
    try {
      const rows = await session.run(`MATCH (d:ResourcePulse {id: $docId}) RETURN d`, { docId })
      expect(rows.records).toHaveLength(0)
    } finally {
      await session.close()
    }
  })
})

/**
 * GOAL-356 — the adopt path. `anchorDocument` mints a resource and its file
 * together; this attaches a file to a Resource that already exists, so that a
 * bulk-imported article stops appearing twice. What matters most here is what
 * it does NOT write: the row's identity, and the member's own `sourceUrl`.
 */
describe('DocumentStorage — attachSourceFileToResource (GOAL-356)', () => {
  const rid = (name: string) => `test_${testRunId}_${name}`

  /** A ResourcePulse shaped like an import row: typed, located, member sourceUrl. */
  async function seedRow(
    id: string,
    extra: Record<string, unknown> = {},
    labels = ':FieldPulse:ResourcePulse'
  ) {
    const session = driver.session()
    try {
      await session.run(
        `
        MATCH (c:FieldContext {id: $ctxId})
        CREATE (c)-[:HAS_PULSE]->(p${labels} {
          id: $id, title: 'The World Ending Fire',
          content: 'Article by Wendell Berry: https://ex.test/a',
          resourceType: 'book', location: 'https://ex.test/a',
          sourceUrl: 'https://linkedin.test/where-i-found-it',
          createdAt: datetime()
        })
        SET p += $extra
        `,
        { ctxId: ids.fieldContext, id, extra }
      )
    } finally {
      await session.close()
    }
  }

  const attach = (id: string, over: Record<string, unknown> = {}) =>
    attachSourceFileToResource({
      driver,
      resourceId: id,
      fieldContextId: ids.fieldContext,
      uploaderUserId: ids.user,
      filename: 'The World Ending Fire.txt',
      mimeType: 'text/plain',
      sizeBytes: 2048,
      pageCount: null,
      userHint: 'Article by Wendell Berry',
      blobKey: `documents/${id}/The World Ending Fire.txt`,
      blobUrl: `documents/${id}/The World Ending Fire.txt`,
      sourceUrl: 'https://ex.test/a',
      status: 'PROCESSING',
      ...over,
    })

  async function readBack(id: string) {
    const session = driver.session()
    try {
      const r = await session.run(
        `
        MATCH (p:ResourcePulse {id: $id})
        OPTIONAL MATCH (p)-[:UPLOADED_BY]->(u:Person {id: $userId})
        OPTIONAL MATCH (p)-[:CREATED_BY]->(cb:Person)
        OPTIONAL MATCH (log:Log)-[:LOGGED_FOR]->(p)
        RETURN p.title AS title, p.content AS content, p.resourceType AS resourceType,
               p.sourceUrl AS sourceUrl, p.sourceFetchedFrom AS sourceFetchedFrom,
               p.sourceBlobKey AS blobKey, p.sourceFilename AS filename,
               p.ingestStatus AS status,
               count(DISTINCT u) AS uploadedBy, count(DISTINCT cb) AS createdBy,
               count(DISTINCT log) AS logs
        `,
        { id, userId: ids.user }
      )
      const rec = r.records[0]
      return {
        title: rec.get('title'),
        content: rec.get('content'),
        resourceType: rec.get('resourceType'),
        sourceUrl: rec.get('sourceUrl'),
        sourceFetchedFrom: rec.get('sourceFetchedFrom'),
        blobKey: rec.get('blobKey'),
        filename: rec.get('filename'),
        status: rec.get('status'),
        uploadedBy: Number(rec.get('uploadedBy')),
        createdBy: Number(rec.get('createdBy')),
        logs: Number(rec.get('logs')),
      }
    } finally {
      await session.close()
    }
  }

  it('makes the row source-backed without touching its identity', async () => {
    if (!neo4jAvailable) return
    const id = rid('adopt_identity')
    await seedRow(id)
    await attach(id)
    const p = await readBack(id)

    // Identity is the whole point: a book with a file attached, not a document.
    expect(p.title).toBe('The World Ending Fire')
    expect(p.resourceType).toBe('book')
    expect(p.content).toContain('Article by Wendell Berry')
    // …and source-backed, so it lists/downloads/deletes like an upload.
    expect(p.blobKey).toBe(`documents/${id}/The World Ending Fire.txt`)
    expect(p.filename).toBe('The World Ending Fire.txt')
    expect(p.status).toBe('PROCESSING')
  })

  it("records the fetched link separately from the member's source_url", async () => {
    if (!neo4jAvailable) return
    const id = rid('adopt_urls')
    await seedRow(id)
    await attach(id)
    const p = await readBack(id)

    // The collision GOAL-356 had to avoid: `sourceUrl` is the sheet's
    // `source_url` column (GOAL-355, where the member FOUND it) and must
    // survive; the fetched link gets its own property, which is what the
    // import's idempotency check keys on.
    expect(p.sourceUrl).toBe('https://linkedin.test/where-i-found-it')
    expect(p.sourceFetchedFrom).toBe('https://ex.test/a')
  })

  it('credits the importer as uploader only, never as author', async () => {
    if (!neo4jAvailable) return
    const id = rid('adopt_edges')
    await seedRow(id)
    await attach(id)
    const p = await readBack(id)

    expect(p.uploadedBy).toBe(1)
    // The article's real author holds INITIATED_BY; adding CREATED_BY here
    // would credit the importer for someone else's writing.
    expect(p.createdBy).toBe(0)
    expect(p.logs).toBe(1)
  })

  it('is idempotent for an identical retry and logs only once', async () => {
    if (!neo4jAvailable) return
    const id = rid('adopt_retry')
    await seedRow(id)
    await attach(id)
    await expect(attach(id)).resolves.toBeUndefined()
    expect((await readBack(id)).logs).toBe(1)
  })

  it('refuses a different file rather than stranding the first blob', async () => {
    if (!neo4jAvailable) return
    const id = rid('adopt_conflict')
    await seedRow(id)
    await attach(id)
    await expect(
      attach(id, { filename: 'other.txt', blobKey: `documents/${id}/other.txt` })
    ).rejects.toThrow(/already source-backed|could not attach/)
    // The first file is still the one on the node.
    expect((await readBack(id)).filename).toBe('The World Ending Fire.txt')
  })

  it('refuses a legacy document typed resourceType:document', async () => {
    if (!neo4jAvailable) return
    // SOURCE_BACKED_RESOURCE has two arms; a migrated document that never had a
    // blob pointer is source-backed by the project's definition, and taking it
    // over would silently reassign its identity and ingest state.
    const id = rid('adopt_legacy')
    await seedRow(id, { resourceType: 'document' })
    await expect(attach(id)).rejects.toThrow()
  })

  it('refuses a GoalPulse, which must never be grafted into a ResourcePulse', async () => {
    if (!neo4jAvailable) return
    const id = rid('adopt_goal')
    await seedRow(id, {}, ':FieldPulse:GoalPulse')
    await expect(attach(id)).rejects.toThrow()
  })

  it('refuses a resource that is not in the given FieldContext', async () => {
    if (!neo4jAvailable) return
    const id = rid('adopt_ctx')
    await seedRow(id)
    await expect(
      attach(id, { fieldContextId: 'test_ctx_does_not_exist' })
    ).rejects.toThrow()
  })
})
