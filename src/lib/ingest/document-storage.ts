import type { Driver } from 'neo4j-driver'
import type { BlobStore } from './blob-store'
import {
  DOCUMENT_INGEST_STATUS,
  type DocumentIngestStatus,
} from './document-ingest-queue'

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
  /**
   * Where the bytes came from when the Document was not uploaded by a member
   * but fetched server-side from a link (GOAL-344 bulk article import). Null
   * for uploads. Also the idempotency key that stops the same article being
   * fetched twice into one FieldContext.
   */
  sourceUrl?: string | null
  /**
   * Initial ingest status (GOAL-292). The async upload path anchors PENDING so
   * the cron worker picks the document up. Defaults to COMPLETE for callers
   * that run the pipeline themselves and never enqueue — `uploadDocument`'s
   * server-side path and tests — so those documents are not re-ingested.
   */
  status?: DocumentIngestStatus
}

/**
 * Graph-only anchor for a Document whose bytes already live in blob storage
 * (browser-direct-to-S3 upload). Single CREATE — no follow-up SET, because
 * the blob location is known up front.
 *
 * GOAL-292: the node is born with an ingest `status` (PENDING for the async
 * upload path) so `/api/cron/process-document-ingestion` can find it. The
 * `UPLOADED_BY` edge created here is also what captures the authorization
 * decision — the worker runs under CRON_SECRET with no request context, so
 * this uploader identity is who its entity writes are attributed to.
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
        // MERGE, not CREATE: the document id is derived from the server-minted
        // blob key, so a retried /process call must re-anchor the same document
        // rather than create a second one over the same blob (GOAL-292). ON
        // CREATE only, so a retry arriving after the worker has already started
        // cannot reset the status machine or the attempt counter. The
        // document_id uniqueness constraint makes this safe under concurrency.
        MERGE (d:Document {id: $documentId})
        ON CREATE SET
          d.filename = $filename,
          d.mimeType = $mimeType,
          d.sizeBytes = toInteger($sizeBytes),
          d.pageCount = $pageCount,
          d.userHint = $userHint,
          d.blobKey = $blobKey,
          d.blobUrl = $blobUrl,
          d.sourceUrl = $sourceUrl,
          d.status = $status,
          d.statusMessage = null,
          d.statusUpdatedAt = datetime(),
          d.ingestAttempts = 0,
          d.uploadedAt = datetime()
        MERGE (c)-[:HAS_DOCUMENT]->(d)
        MERGE (d)-[:UPLOADED_BY]->(u)
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
          sourceUrl: input.sourceUrl?.trim() || null,
          status: input.status ?? DOCUMENT_INGEST_STATUS.complete,
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
  /** Link the bytes were fetched from (GOAL-344); null for uploads. */
  sourceUrl: string | null
  fieldContextId: string
  uploaderUserId: string
  /**
   * Ingest lifecycle status (GOAL-292). Documents uploaded before that story
   * carry no `status` property; they read back as COMPLETE so the backlog is
   * never re-ingested.
   */
  status: DocumentIngestStatus
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
        // Collect uploaders rather than OPTIONAL MATCH + LIMIT 1. The cron
        // worker runs AS this user (GOAL-292), so an anomalous document with two
        // UPLOADED_BY edges must not resolve non-deterministically to whichever
        // one the planner happens to return — the caller fails the run instead.
        OPTIONAL MATCH (d)-[:UPLOADED_BY]->(uploader:Person:User)
        WITH c, d, collect(DISTINCT uploader.id) AS uploaderIds
        RETURN
          d.id AS id,
          d.filename AS filename,
          d.mimeType AS mimeType,
          d.sizeBytes AS sizeBytes,
          d.pageCount AS pageCount,
          d.blobKey AS blobKey,
          d.blobUrl AS blobUrl,
          d.userHint AS userHint,
          d.sourceUrl AS sourceUrl,
          c.id AS fieldContextId,
          uploaderIds,
          coalesce(d.status, $completeStatus) AS status
        LIMIT 1
        `,
        { documentId, completeStatus: DOCUMENT_INGEST_STATUS.complete }
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
      sourceUrl: (record.get('sourceUrl') as string | null) ?? null,
      fieldContextId: record.get('fieldContextId') as string,
      // Exactly one uploader, or none. An ambiguous document yields '' so the
      // caller treats it as un-attributable rather than guessing.
      uploaderUserId: (() => {
        const ids = (record.get('uploaderIds') as string[] | null) ?? []
        return ids.length === 1 ? ids[0] : ''
      })(),
      status: record.get('status') as DocumentIngestStatus,
    }
  } finally {
    await session.close()
  }
}

/**
 * Records the page count discovered while preparing extraction inputs.
 *
 * Split out for GOAL-292: page count comes from reading the blob, which now
 * happens in the background worker, while `anchorDocument` runs in the request
 * before any blob has been read. Only paged sources produce a count, so a null
 * simply leaves the property untouched-but-null rather than being an error.
 */
export async function setDocumentPageCount(input: {
  driver: Driver
  documentId: string
  pageCount: number | null
}): Promise<void> {
  if (input.pageCount === null) return
  const session = input.driver.session()
  try {
    await session.executeWrite((tx) =>
      tx.run(
        // toInteger: the driver encodes a plain JS number as a Float64, which
        // would store 3.0 on an int-declared property and render as "3.0".
        `MATCH (d:Document {id: $documentId})
         SET d.pageCount = toInteger($pageCount)`,
        { documentId: input.documentId, pageCount: input.pageCount }
      )
    )
  } finally {
    await session.close()
  }
}

export interface DocumentSummaryInput {
  driver: Driver
  documentId: string
  summary: string | null
  concepts: string[]
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
            d.concepts = $concepts
        `,
        {
          documentId: input.documentId,
          summary: input.summary?.trim() || null,
          concepts: input.concepts.filter((c) => c?.trim().length > 0),
        }
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
