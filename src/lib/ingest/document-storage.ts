import { randomUUID } from 'node:crypto'
import neo4j from 'neo4j-driver'
import type { Driver } from 'neo4j-driver'
import type { BlobStore } from './blob-store'

/**
 * Owns the lifecycle of `Document` nodes and their backing blob. v1 ships
 * with one mimeType (text/plain) and a flat `documents/<docId>/<filename>`
 * blob key; later slices add PDF/MD and size gating, none of which change
 * the (Document, HAS_DOCUMENT, UPLOADED_BY) graph contract pinned here.
 *
 * Order of operations on `uploadDocument`:
 *   1. Reserve the graph: MATCH the FieldContext + uploader, then CREATE
 *      the Document node and edges in one transaction. If the FieldContext
 *      doesn't exist the CREATE pattern returns zero rows and we throw
 *      BEFORE touching blob storage — so a bad upload can never leak a
 *      blob without a parent node.
 *   2. PUT the blob.
 *   3. PATCH the Document with the resolved blobKey + blobUrl.
 *
 * Order of operations on `deleteDocument`:
 *   1. Read blobKey off the Document.
 *   2. DETACH DELETE the Document.
 *   3. Best-effort DELETE the blob (idempotent — a missing blob is fine).
 */

export interface UploadDocumentInput {
  driver: Driver
  blobStore: BlobStore
  documentId: string
  fieldContextId: string
  uploaderUserId: string
  filename: string
  mimeType: string
  buffer: Buffer
  /** Pages in the source document. `1` for .txt/.md, real page count for .pdf. */
  pageCount?: number
  /** Optional one-line "What is this?" hint reused on re-extract (GOAL-241). */
  userHint?: string | null
}

export interface UploadedDocument {
  id: string
  filename: string
  mimeType: string
  sizeBytes: number
  pageCount: number | null
  blobKey: string
  blobUrl: string
  userHint: string | null
}

export async function uploadDocument(
  input: UploadDocumentInput
): Promise<UploadedDocument> {
  // Server-side upload path: PUT the blob, then anchor the graph node. Kept
  // for tests and any caller that still streams bytes through this process.
  // The browser-direct-upload flow does not use this — it calls `presignPut`
  // on the BlobStore and then `anchorDocument` after the client has uploaded.
  const blobKey = `documents/${input.documentId}/${input.filename}`
  const ref = await input.blobStore.put({
    key: blobKey,
    contentType: input.mimeType,
    buffer: input.buffer,
  })
  await anchorDocument({
    driver: input.driver,
    documentId: input.documentId,
    fieldContextId: input.fieldContextId,
    uploaderUserId: input.uploaderUserId,
    filename: input.filename,
    mimeType: input.mimeType,
    sizeBytes: input.buffer.length,
    pageCount: input.pageCount ?? null,
    userHint: input.userHint ?? null,
    blobKey: ref.key,
    blobUrl: ref.url,
  })
  return {
    id: input.documentId,
    filename: input.filename,
    mimeType: input.mimeType,
    sizeBytes: input.buffer.length,
    pageCount: input.pageCount ?? null,
    blobKey: ref.key,
    blobUrl: ref.url,
    userHint: input.userHint?.trim() ? input.userHint.trim() : null,
  }
}

export interface AnchorDocumentInput {
  driver: Driver
  documentId: string
  fieldContextId: string
  uploaderUserId: string
  filename: string
  mimeType: string
  sizeBytes: number
  pageCount: number | null
  userHint: string | null
  blobKey: string
  blobUrl: string
}

/**
 * Graph-only anchor for a Document whose bytes already live in blob storage
 * (browser-direct-to-S3 upload). Single CREATE — no follow-up SET, because
 * the blob location is known up front.
 *
 * Throws if FieldContext or uploader are missing; the caller surfaces this
 * as a 400/404 to the frontend so the user can retry. The blob is left in
 * place — orphan cleanup is a separate concern handled by S3 lifecycle.
 */
export async function anchorDocument(input: AnchorDocumentInput): Promise<void> {
  const session = input.driver.session()
  try {
    const result = await session.executeWrite(async (tx) =>
      tx.run(
        `
        MATCH (c:FieldContext {id: $fieldContextId})
        MATCH (u:Person:User {id: $uploaderUserId})
        CREATE (d:Document {
          id: $documentId,
          filename: $filename,
          mimeType: $mimeType,
          sizeBytes: $sizeBytes,
          pageCount: $pageCount,
          userHint: $userHint,
          blobKey: $blobKey,
          blobUrl: $blobUrl,
          status: 'PENDING',
          failureReason: null,
          uploadedAt: datetime()
        })
        CREATE (c)-[:HAS_DOCUMENT]->(d)
        CREATE (d)-[:UPLOADED_BY]->(u)
        RETURN d.id AS id
        `,
        {
          fieldContextId: input.fieldContextId,
          uploaderUserId: input.uploaderUserId,
          documentId: input.documentId,
          filename: input.filename,
          mimeType: input.mimeType,
          sizeBytes: input.sizeBytes,
          pageCount: input.pageCount,
          userHint: input.userHint?.trim() ? input.userHint.trim() : null,
          blobKey: input.blobKey,
          blobUrl: input.blobUrl,
        }
      )
    )
    if (result.records.length === 0) {
      throw new Error(
        `anchorDocument: could not anchor Document — FieldContext "${input.fieldContextId}" or uploader "${input.uploaderUserId}" not found.`
      )
    }
  } finally {
    await session.close()
  }
}

export interface DocumentRecord {
  id: string
  filename: string
  mimeType: string
  sizeBytes: number
  pageCount: number | null
  blobKey: string
  blobUrl: string
  userHint: string | null
  fieldContextId: string
  uploaderUserId: string
}

/**
 * Loads a Document by id along with the ids needed to re-extract: its parent
 * FieldContext (so the permission gate + roster lookup work) and the original
 * uploader (so the new ingest thread can be anchored back to the right
 * Person:User). Returns `null` if the document doesn't exist — callers
 * surface that as a not-found instead of throwing.
 */
export async function loadDocumentRecord(
  driver: Driver,
  documentId: string
): Promise<DocumentRecord | null> {
  const session = driver.session()
  try {
    const result = await session.executeRead(async (tx) =>
      tx.run(
        `
        MATCH (c:FieldContext)-[:HAS_DOCUMENT]->(d:Document {id: $documentId})
        OPTIONAL MATCH (d)-[:UPLOADED_BY]->(u:Person:User)
        RETURN
          d.id AS id,
          d.filename AS filename,
          d.mimeType AS mimeType,
          d.sizeBytes AS sizeBytes,
          d.pageCount AS pageCount,
          d.blobKey AS blobKey,
          d.blobUrl AS blobUrl,
          d.userHint AS userHint,
          c.id AS fieldContextId,
          u.id AS uploaderUserId
        LIMIT 1
        `,
        { documentId }
      )
    )
    const record = result.records[0]
    if (!record) return null
    return {
      id: record.get('id') as string,
      filename: record.get('filename') as string,
      mimeType: record.get('mimeType') as string,
      sizeBytes: Number(record.get('sizeBytes') ?? 0),
      pageCount:
        record.get('pageCount') === null
          ? null
          : Number(record.get('pageCount')),
      blobKey: (record.get('blobKey') as string | null) ?? '',
      blobUrl: (record.get('blobUrl') as string | null) ?? '',
      userHint: (record.get('userHint') as string | null) ?? null,
      fieldContextId: record.get('fieldContextId') as string,
      uploaderUserId: (record.get('uploaderUserId') as string | null) ?? '',
    }
  } finally {
    await session.close()
  }
}

export interface DocumentSummaryInput {
  driver: Driver
  documentId: string
  summary: string | null
  concepts: string[]
  /**
   * Real page count discovered once the blob is actually read (only the
   * PDF text route resolves this — see `extraction-input-preparer.ts`). The
   * background worker doesn't know this at anchor time (GOAL-292 deferred
   * blob access out of the synchronous enqueue path), so it's set here
   * alongside the summary instead. Omit/null leaves the anchored value
   * (1 for .txt/.md, null when unknown) untouched.
   */
  pageCount?: number | null
}

/**
 * Persists AI-generated summary + concepts on the Document node. Called
 * by the ingest orchestrator after the summarizer model returns. A failed
 * summarizer call is non-fatal — we just skip this write and leave the
 * properties null/empty so the UI degrades gracefully.
 */
export async function setDocumentSummary(
  input: DocumentSummaryInput
): Promise<void> {
  const session = input.driver.session()
  try {
    await session.executeWrite((tx) =>
      tx.run(
        `
        MATCH (d:Document {id: $documentId})
        SET d.summary = $summary,
            d.concepts = $concepts,
            d.pageCount = coalesce($pageCount, d.pageCount)
        `,
        {
          documentId: input.documentId,
          summary: input.summary?.trim() || null,
          concepts: input.concepts.filter((c) => c?.trim().length > 0),
          pageCount: input.pageCount ?? null,
        }
      )
    )
  } finally {
    await session.close()
  }
}

/**
 * Background-job lifecycle for `Document.status` (GOAL-292). Documents are
 * anchored PENDING (see `anchorDocument`), claimed PROCESSING by the cron
 * worker, then move to a terminal COMPLETE/FAILED state.
 */
export type DocumentIngestStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETE'
  | 'FAILED'

/**
 * Atomically claims up to `batchSize` PENDING Documents by transitioning them
 * to PROCESSING in the same write, oldest-first.
 *
 * A naive `MATCH (d:Document {status: 'PENDING'}) ... SET d.status =
 * 'PROCESSING'` is NOT safe against two overlapping cron invocations: Neo4j
 * evaluates the `status: 'PENDING'` predicate against each transaction's own
 * read, and only takes a write lock on `d` when the `SET` actually runs. A
 * second transaction that matched the same row before the first committed
 * will still apply its `SET` once unblocked — it does not re-check the
 * predicate — so both transactions "win" the same Document (confirmed
 * empirically against a real concurrent-transaction test during review).
 *
 * The safe pattern re-checks `d.status` INSIDE the `SET`'s own `CASE`, and
 * stamps a per-call `claimToken` so the caller can tell which rows it
 * actually won (`won: true`) versus which were merely re-matched after
 * losing the race (`won: false`, status already flipped by the other
 * transaction). Only `won` rows are returned as claimed.
 */
export async function claimPendingDocuments(
  driver: Driver,
  batchSize: number
): Promise<string[]> {
  const claimToken = randomUUID()
  const session = driver.session()
  try {
    const result = await session.executeWrite((tx) =>
      tx.run(
        `
        MATCH (d:Document {status: 'PENDING'})
        WITH d
        ORDER BY d.uploadedAt ASC
        LIMIT $batchSize
        SET d.status = CASE WHEN d.status = 'PENDING' THEN 'PROCESSING' ELSE d.status END,
            d.claimToken = CASE WHEN d.status = 'PENDING' THEN $claimToken ELSE d.claimToken END
        RETURN d.id AS id, d.claimToken = $claimToken AS won
        `,
        // LIMIT requires an integer — the driver serializes a plain JS
        // number as a Cypher Float, which LIMIT rejects at runtime.
        { batchSize: neo4j.int(batchSize), claimToken }
      )
    )
    return result.records
      .filter((r) => r.get('won') === true)
      .map((r) => r.get('id') as string)
  } finally {
    await session.close()
  }
}

/**
 * Single-document counterpart to `claimPendingDocuments`, used by the
 * synchronous `handleIngestDocument` convenience wrapper (tests, and any
 * caller that wants enqueue+process in one call) right after it anchors a
 * brand-new PENDING Document. Returns `false` if the document was not found
 * in PENDING state (already claimed, or doesn't exist). Uses the same
 * CASE-guarded claim-token pattern as `claimPendingDocuments` — see its doc
 * comment for why the naive form is unsafe.
 */
export async function claimDocumentById(
  driver: Driver,
  documentId: string
): Promise<boolean> {
  const claimToken = randomUUID()
  const session = driver.session()
  try {
    const result = await session.executeWrite((tx) =>
      tx.run(
        `
        MATCH (d:Document {id: $documentId})
        SET d.status = CASE WHEN d.status = 'PENDING' THEN 'PROCESSING' ELSE d.status END,
            d.claimToken = CASE WHEN d.status = 'PENDING' THEN $claimToken ELSE d.claimToken END
        RETURN d.claimToken = $claimToken AS won
        `,
        { documentId, claimToken }
      )
    )
    return result.records[0]?.get('won') === true
  } finally {
    await session.close()
  }
}

export async function markDocumentComplete(
  driver: Driver,
  documentId: string
): Promise<void> {
  const session = driver.session()
  try {
    await session.executeWrite((tx) =>
      tx.run(
        `MATCH (d:Document {id: $documentId}) SET d.status = 'COMPLETE', d.failureReason = null`,
        { documentId }
      )
    )
  } finally {
    await session.close()
  }
}

/**
 * Terminal failure — `failureReason` is a plain-English message (kb/07 Rule 1:
 * no raw ids / internal artifacts) surfaced on the Document card so the user
 * can decide whether to Re-extract (GOAL-241, the uniform retry path).
 */
export async function markDocumentFailed(
  driver: Driver,
  documentId: string,
  failureReason: string
): Promise<void> {
  const session = driver.session()
  try {
    await session.executeWrite((tx) =>
      tx.run(
        `MATCH (d:Document {id: $documentId}) SET d.status = 'FAILED', d.failureReason = $failureReason`,
        { documentId, failureReason }
      )
    )
  } finally {
    await session.close()
  }
}

export interface DeleteDocumentInput {
  driver: Driver
  blobStore: BlobStore
  documentId: string
}

export async function deleteDocument(
  input: DeleteDocumentInput
): Promise<void> {
  const session = input.driver.session()
  let blobKey: string | null = null
  try {
    const lookup = await session.executeRead(async (tx) =>
      tx.run(
        `MATCH (d:Document {id: $documentId}) RETURN d.blobKey AS blobKey`,
        { documentId: input.documentId }
      )
    )
    blobKey = (lookup.records[0]?.get('blobKey') as string | null) ?? null

    await session.executeWrite(async (tx) =>
      tx.run(`MATCH (d:Document {id: $documentId}) DETACH DELETE d`, {
        documentId: input.documentId,
      })
    )
  } finally {
    await session.close()
  }
  if (blobKey) {
    await input.blobStore.delete(blobKey)
  }
}
