import { randomUUID } from 'node:crypto'
import type { Driver } from 'neo4j-driver'
import type { BlobStore } from './blob-store'

/**
 * Document deletion orchestrator (PRD `docs/prd/document-ingestion.md` § Out
 * of Scope — extracted entities survive). Mirrors `handleIngestDocument`'s
 * shape:
 *
 *   permission gate ──┐
 *   activity Log      ├─ single write transaction (atomic)
 *   DETACH DELETE     ┘
 *   best-effort blob cleanup
 *
 * Authorization semantics match `userCanEditContext` in
 * `handle-ingest-document.ts`: OWNER + ADMIN + MEMBER pass, GUEST + non-member
 * fail. To avoid leaking document existence to non-members, a missing
 * document and a forbidden access return the SAME `forbidden` failure.
 *
 * Logging: writes one `:Log` per delete attributed to the caller via
 * `CREATED_BY` (parallel to `createPersonAuthorized` / `createPulseAuthorized`
 * in `src/lib/chat/hitl.ts`). Description carries the human-readable
 * filename so the activity feed can render without a follow-up read. The
 * blob cleanup happens AFTER the transaction commits — a blob delete failure
 * leaves an orphan blob, not a dangling graph reference (safer failure mode).
 */

export interface DeleteDocumentDependencies {
  driver: Driver
  blobStore: BlobStore
}

export interface DeleteDocumentInput {
  currentUserId: string
  documentId: string
}

export type DeleteFailureReason = 'forbidden' | 'invalid_input'

export interface DeleteSuccess {
  ok: true
  documentId: string
}

export interface DeleteFailure {
  ok: false
  reason: DeleteFailureReason
  error: string
}

export type DeleteDocumentResult = DeleteSuccess | DeleteFailure

export async function handleDeleteDocument(
  deps: DeleteDocumentDependencies,
  input: DeleteDocumentInput
): Promise<DeleteDocumentResult> {
  const documentId = input.documentId?.trim() || ''
  if (!documentId) {
    return {
      ok: false,
      reason: 'invalid_input',
      error: 'documentId is required.',
    }
  }
  const userId = input.currentUserId?.trim() || ''
  if (!userId) {
    return {
      ok: false,
      reason: 'forbidden',
      error: 'You do not have permission to delete this document.',
    }
  }

  const logId = `log_${Date.now()}_${randomUUID().slice(0, 8)}`
  const metadata = JSON.stringify({ documentId })

  const session = deps.driver.session()
  let blobKey: string | null = null
  try {
    // Single write transaction: resolves the Document, gates on
    // canEditContent, writes the Log, and runs DETACH DELETE. A missing
    // document and an unauthorized user both produce zero rows — callers
    // can't distinguish them.
    const result = await session.executeWrite((tx) =>
      tx.run(
        `
        MATCH (space:Space)-[:HAS_CONTEXT]->(c:FieldContext)-[:HAS_DOCUMENT]->(d:Document {id: $documentId})
        OPTIONAL MATCH (owner:Person {id: $userId})-[:OWNS]->(space)
        OPTIONAL MATCH (space)-[:HAS_MEMBER]->(sm:SpaceMembership)-[:IS_MEMBER]->(:Person {id: $userId})
        WHERE sm.role IN ['ADMIN', 'MEMBER']
        WITH d, c, (owner IS NOT NULL OR sm IS NOT NULL) AS allowed
        WHERE allowed
        MATCH (u:Person:User {id: $userId})
        WITH d, c, u, d.blobKey AS blobKey, d.filename AS filename
        CREATE (log:Log {
          id: $logId,
          description: 'Deleted document "' + filename + '"' +
            CASE WHEN c.title IS NOT NULL AND c.title <> ''
              THEN ' from ' + c.title
              ELSE ''
            END,
          metadata: $metadata,
          createdAt: datetime()
        })
        CREATE (log)-[:CREATED_BY]->(u)
        WITH d, blobKey
        DETACH DELETE d
        RETURN blobKey
        LIMIT 1
        `,
        { documentId, userId, logId, metadata }
      )
    )
    const record = result.records[0]
    if (!record) {
      return {
        ok: false,
        reason: 'forbidden',
        error: 'You do not have permission to delete this document.',
      }
    }
    blobKey = (record.get('blobKey') as string | null) ?? null
  } finally {
    await session.close()
  }

  // Best-effort blob cleanup — the graph is already consistent. A failure
  // here leaves an orphan blob, never a dangling Document.
  if (blobKey) {
    try {
      await deps.blobStore.delete(blobKey)
    } catch (err) {
      console.warn(
        `[handle-delete-document] best-effort blob cleanup failed for ${blobKey}:`,
        err
      )
    }
  }

  return { ok: true, documentId }
}
