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
  const session = input.driver.session()
  try {
    // Step 1: reserve the graph node up front. If FieldContext or uploader
    // are missing, throws before any blob write.
    const reserve = await session.executeWrite(async (tx) =>
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
          sizeBytes: input.buffer.length,
          pageCount: input.pageCount ?? null,
          userHint: input.userHint?.trim() ? input.userHint.trim() : null,
        }
      )
    )
    if (reserve.records.length === 0) {
      throw new Error(
        `uploadDocument: could not anchor Document — FieldContext "${input.fieldContextId}" or uploader "${input.uploaderUserId}" not found.`
      )
    }

    // Step 2: put the blob. Key namespace mirrors the graph hierarchy.
    const blobKey = `documents/${input.documentId}/${input.filename}`
    const ref = await input.blobStore.put({
      key: blobKey,
      contentType: input.mimeType,
      buffer: input.buffer,
    })

    // Step 3: patch the Document with the resolved blob location.
    await session.executeWrite(async (tx) =>
      tx.run(
        `
        MATCH (d:Document {id: $documentId})
        SET d.blobKey = $blobKey, d.blobUrl = $blobUrl
        `,
        { documentId: input.documentId, blobKey: ref.key, blobUrl: ref.url }
      )
    )

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
