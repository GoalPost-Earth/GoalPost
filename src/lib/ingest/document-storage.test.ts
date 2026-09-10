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
 * GOAL-356 — the bulk article import attaches a fetched file to the row's OWN
 * Resource instead of anchoring a second one beside it. These pin the two
 * things that shape depends on: the row keeps its identity, and it becomes
 * addressable as a document.
 */
describe('DocumentStorage — attachSourceFileToResource', () => {
  const attachArgs = (resourceId: string) => ({
    driver,
    resourceId,
    fieldContextId: ids.fieldContext,
    uploaderUserId: ids.user,
    filename: 'Seeing People as Living Systems.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 4096,
    pageCount: null,
    userHint: 'Article "Seeing People as Living Systems" by V. Letellier',
    blobKey: 'documents/x/Seeing People as Living Systems.pdf',
    blobUrl: 'documents/x/Seeing People as Living Systems.pdf',
    status: 'PROCESSING' as const,
  })

  /** A row pulse as the import leaves it: typed, authored, no file. */
  async function seedRowPulse(id: string, props = '') {
    const session = driver.session()
    try {
      await session.run(
        `
        MATCH (c:FieldContext {id: $ctxId})
        CREATE (r:FieldPulse:ResourcePulse {
          id: $id, title: 'Seeing People as Living Systems',
          content: 'Article by V. Letellier, published 2025-05-19: https://example.org/a',
          resourceType: 'article', createdAt: datetime()${props}
        })
        CREATE (c)-[:HAS_PULSE]->(r)
        `,
        { ctxId: ids.fieldContext, id }
      )
    } finally {
      await session.close()
    }
  }

  itIf(true)('makes the row pulse document-backed without touching its identity', async () => {
    if (!neo4jAvailable) return
    const id = `test_${testRunId}_row_merge`
    await seedRowPulse(id)

    expect(await attachSourceFileToResource(attachArgs(id))).toBe('attached')

    const session = driver.session()
    try {
      const rows = await session.run(
        `MATCH (c:FieldContext {id: $ctxId})-[:HAS_PULSE]->(r:ResourcePulse {id: $id})-[:UPLOADED_BY]->(:Person:User {id: $userId})
         OPTIONAL MATCH (log:Log)-[:LOGGED_FOR]->(r)
         RETURN r.title AS title, r.resourceType AS resourceType, r.content AS content,
                r.sourceFilename AS filename, r.sourceBlobKey AS blobKey,
                r.sourceBacked AS sourceBacked, r.ingestStatus AS ingestStatus,
                r.uploadedAt AS uploadedAt, count(log) AS logs`,
        { ctxId: ids.fieldContext, id, userId: ids.user }
      )
      expect(rows.records).toHaveLength(1)
      const r = rows.records[0]
      // Identity survives: no ".pdf" title, still an article, body untouched.
      expect(r.get('title')).toBe('Seeing People as Living Systems')
      expect(r.get('resourceType')).toBe('article')
      expect(r.get('content')).toContain('published 2025-05-19')
      // …and it is now a document everywhere that matters.
      expect(r.get('filename')).toBe('Seeing People as Living Systems.pdf')
      expect(r.get('blobKey')).toBe(attachArgs(id).blobKey)
      expect(r.get('ingestStatus')).toBe('PROCESSING')
      expect(r.get('uploadedAt')).toBeTruthy()
      // The filterable mirror of sourceBlobKey the two SDL @authorization
      // rules gate on. Without it the resource 404s in the document drawer and
      // the generated delete root will orphan its blob.
      expect(r.get('sourceBacked')).toBe(true)
      expect(Number(r.get('logs'))).toBe(1)
    } finally {
      await session.close()
    }
  })

  itIf(true)('never re-points a resource that already holds a file, and says so', async () => {
    if (!neo4jAvailable) return
    const id = `test_${testRunId}_row_taken`
    await seedRowPulse(id, `, sourceBlobKey: 'documents/first/original.pdf', sourceBacked: true`)

    expect(await attachSourceFileToResource(attachArgs(id))).toBe(
      'already_source_backed'
    )

    const session = driver.session()
    try {
      const rows = await session.run(
        `MATCH (r:ResourcePulse {id: $id})
         OPTIONAL MATCH (log:Log)-[:LOGGED_FOR]->(r)
         RETURN r.sourceBlobKey AS blobKey, count(log) AS logs`,
        { id }
      )
      expect(rows.records[0].get('blobKey')).toBe('documents/first/original.pdf')
      expect(Number(rows.records[0].get('logs'))).toBe(0)
    } finally {
      await session.close()
    }
  })

  itIf(true)('refuses a resource that is not under the targeted FieldContext', async () => {
    if (!neo4jAvailable) return
    const id = `test_${testRunId}_row_elsewhere`
    await seedRowPulse(id)
    expect(
      await attachSourceFileToResource({
        ...attachArgs(id),
        fieldContextId: 'ctx_nonexistent_xyz',
      })
    ).toBe('not_found')
  })

  itIf(true)('uploadDocument-anchored documents carry the same sourceBacked flag', async () => {
    if (!neo4jAvailable) return
    const blobStore = createMemoryBlobStore()
    const docId = `test_${testRunId}_doc_flag`
    await uploadDocument({
      driver,
      blobStore,
      documentId: docId,
      fieldContextId: ids.fieldContext,
      uploaderUserId: ids.user,
      filename: 'flagged.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('anchored'),
    })
    const session = driver.session()
    try {
      const rows = await session.run(
        `MATCH (d:ResourcePulse {id: $docId}) RETURN d.sourceBacked AS sourceBacked`,
        { docId }
      )
      // Both writers must agree, or the SDL rules see two populations.
      expect(rows.records[0].get('sourceBacked')).toBe(true)
    } finally {
      await session.close()
    }
  })
})
