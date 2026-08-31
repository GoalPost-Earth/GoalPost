import type { Driver } from 'neo4j-driver'
import type { BlobStore } from './blob-store'
import type { ExtractionModelClient } from './extraction-model-invoker'
import type { ExecutedToolCallRecord } from './synthesized-turn-appender'
import { loadDocumentRecord } from './document-storage'
import type { DocumentSummarizerClient } from './document-summarizer'
import {
  countExecutedToolCalls,
  runDocumentIngestPipeline,
  type DocumentIngestPipelineFailureReason,
} from './run-document-ingest-pipeline'
import {
  DOCUMENT_INGEST_STATUS,
  markDocumentIngestComplete,
  markDocumentIngestFailed,
  memberSafeIngestFailureMessage,
} from './document-ingest-queue'

/**
 * Slice 6 — Re-extract an existing Document.
 *
 * Differences from the initial upload path (handleIngestDocument):
 *   - No blob put. No new Document node. The original blob and metadata are
 *     reused so the user gets a fresh extraction attempt against the *current*
 *     FieldContext roster without re-uploading the file.
 *   - The new ConversationThread title is `Ingest: <filename> (re-extracted)`
 *     so the thread switcher disambiguates attempts on the same source.
 *   - One activity Log row is written with the document's human-readable
 *     filename in the description (kb/07 Rule 1 — no raw IDs in user copy).
 *   - The previously-stored `Document.userHint` is reused — the user does
 *     not re-enter it. (Editing the hint is out of scope per PRD § Out of Scope.)
 */

export interface ReExtractDocumentDependencies {
  driver: Driver
  blobStore: BlobStore
  /** Multimodal extractor (Gemini) for PDFs. */
  pdfExtractionClient: ExtractionModelClient
  /** Text extractor (OpenAI) for .txt/.md. */
  textExtractionClient: ExtractionModelClient
  /** Optional summarizers — refreshes Document.summary + Document.concepts. */
  pdfSummarizerClient?: DocumentSummarizerClient | null
  textSummarizerClient?: DocumentSummarizerClient | null
}

export interface ReExtractDocumentInput {
  currentUserId: string
  documentId: string
}

/**
 * Derived from the pipeline's own reasons plus the two this entry point adds, so
 * a new pipeline reason is a compile error here rather than something a cast
 * silently swallows.
 */
export type ReExtractFailureReason =
  | DocumentIngestPipelineFailureReason
  | 'forbidden'
  | 'in_progress'

export interface ReExtractSuccess {
  ok: true
  documentId: string
  threadId: string
  /**
   * The context the document is anchored to — lets the caller schedule the
   * post-run resonance/embedding pass (GOAL-318) without a second lookup.
   */
  fieldContextId: string
  /**
   * Same shape as `IngestSuccess.executedToolCalls`. Re-extract auto-
   * executes the new proposals just like the initial upload path.
   */
  executedToolCalls: ExecutedToolCallRecord[]
}
export interface ReExtractFailure {
  ok: false
  error: string
  reason: ReExtractFailureReason
}
export type ReExtractDocumentResult = ReExtractSuccess | ReExtractFailure

async function userCanEditContext(
  driver: Driver,
  userId: string,
  fieldContextId: string
): Promise<boolean> {
  const session = driver.session()
  try {
    const result = await session.executeRead(async (tx) =>
      tx.run(
        `
        MATCH (space:Space)-[:HAS_CONTEXT]->(c:FieldContext {id: $fieldContextId})
        OPTIONAL MATCH (owner:Person {id: $userId})-[:OWNS]->(space)
        OPTIONAL MATCH (space)-[:HAS_MEMBER]->(sm:SpaceMembership)-[:IS_MEMBER]->(member:Person {id: $userId})
        WHERE sm.role IN ['ADMIN', 'MEMBER']
        RETURN (owner IS NOT NULL OR sm IS NOT NULL) AS allowed
        LIMIT 1
        `,
        { userId, fieldContextId }
      )
    )
    return Boolean(result.records[0]?.get('allowed'))
  } finally {
    await session.close()
  }
}

async function writeReExtractLog(
  driver: Driver,
  userId: string,
  filename: string,
  documentId: string,
  threadId: string,
  executedCount: number,
  outcome: 'success' | 'failure' | 'empty'
): Promise<void> {
  const session = driver.session()
  try {
    const description = `Re-extracted document "${filename}"`
    const metadata = JSON.stringify({
      documentId,
      conversationThreadId: threadId,
      executedCount,
      outcome,
    })
    await session.executeWrite(async (tx) =>
      tx.run(
        `
        MATCH (u:Person:User {id: $userId})
        CREATE (log:Log {
          id: 'log_' + randomUUID(),
          description: $description,
          metadata: $metadata,
          createdAt: datetime()
        })
        CREATE (log)-[:CREATED_BY]->(u)
        `,
        { userId, description, metadata }
      )
    )
  } finally {
    await session.close()
  }
}

export async function handleReExtractDocument(
  deps: ReExtractDocumentDependencies,
  input: ReExtractDocumentInput
): Promise<ReExtractDocumentResult> {
  // 1) Look up the Document with its parent FieldContext id (needed for the
  //    permission gate) and original uploader (needed to anchor the new
  //    ingest thread — the re-extracting user owns the new thread, not the
  //    original uploader, but we still need the FieldContext id either way).
  const record = await loadDocumentRecord(deps.driver, input.documentId)
  if (!record) {
    return {
      ok: false,
      reason: 'not_found',
      error: 'Document not found.',
    }
  }

  // 2) Permission gate — same canEditContent check used by uploadDocument.
  const allowed = await userCanEditContext(
    deps.driver,
    input.currentUserId,
    record.fieldContextId
  )
  if (!allowed) {
    return {
      ok: false,
      reason: 'forbidden',
      error: 'You do not have permission to re-extract this document.',
    }
  }

  // 2b) Refuse while the FIRST ingest pass is still queued or running
  //     (GOAL-292). Re-extract does not go through the worker's claim, so
  //     without this check a direct GraphQL call — or a stale browser tab whose
  //     client-side guard is out of date — starts a second full pipeline on a
  //     document the worker is holding in PROCESSING: duplicate entity writes,
  //     two ingest threads, two summary writes and doubled model spend, with
  //     the worker's terminal write then overwriting whatever this run left.
  //
  //     KNOWN GAP (pre-existing, unchanged by this story): this does NOT make
  //     two concurrent RE-EXTRACTS mutually exclusive, because a re-extract
  //     leaves the document COMPLETE/FAILED while it runs rather than claiming
  //     it. Only the per-row client guard stops that, and only per tab. Fixing
  //     it needs a claim that fences on `ingestClaimedBy` WITHOUT entering the
  //     drainable PENDING/PROCESSING states, or the reclaim path would hand the
  //     document to the cron as a fresh upload.
  if (
    record.status === DOCUMENT_INGEST_STATUS.pending ||
    record.status === DOCUMENT_INGEST_STATUS.processing
  ) {
    return {
      ok: false,
      reason: 'in_progress',
      error:
        'This document is still being read. Wait for it to finish before re-extracting.',
    }
  }

  // 3) Verify the original blob still exists. A missing blob is a hard
  //    failure — the Document row persists; the user will see the
  //    "blob_missing" message and can decide whether to re-upload.
  if (!record.blobKey) {
    return {
      ok: false,
      reason: 'blob_missing',
      error: 'The original file for this document is no longer available.',
    }
  }

  // 4) Run the shared pipeline — prepare inputs by route, extract + summarize,
  //    refresh the stored summary, then open a fresh thread and auto-execute
  //    the proposals. Identical code to the initial-upload worker (GOAL-292),
  //    so the two entry points can no longer drift the way they did before
  //    extraction-input-preparer.ts was factored out. The thread-title suffix
  //    makes the re-extract origin obvious in the thread switcher.
  const run = await runDocumentIngestPipeline(deps, {
    documentId: record.id,
    actingUserId: input.currentUserId,
    userTurnVerb: 'Re-extracted',
    threadTitleSuffix: ' (re-extracted)',
    record,
  })
  if (!run.ok) {
    // Record the failure on the document so the row reflects reality rather
    // than keeping whatever status the previous pass left.
    await markDocumentIngestFailed({
      driver: deps.driver,
      documentId: record.id,
      statusMessage: memberSafeIngestFailureMessage(run.reason, run.error),
    })
    return { ok: false, reason: run.reason, error: run.error }
  }

  // Re-extract is the documented recovery path for a FAILED document, so a
  // successful pass must clear that state. Without this the row keeps showing
  // the old Failed chip and stale error copy to every member of the Space —
  // beside the entities this run just created.
  await markDocumentIngestComplete({
    driver: deps.driver,
    documentId: record.id,
    ...countExecutedToolCalls(run.executedToolCalls),
  })

  const outcome: 'success' | 'failure' | 'empty' = run.extractionFailed
    ? 'failure'
    : run.executedToolCalls.length === 0
      ? 'empty'
      : 'success'
  await writeReExtractLog(
    deps.driver,
    input.currentUserId,
    record.filename,
    record.id,
    run.threadId,
    run.executedToolCalls.length,
    outcome
  )

  return {
    ok: true,
    documentId: record.id,
    threadId: run.threadId,
    fieldContextId: record.fieldContextId,
    executedToolCalls: run.executedToolCalls,
  }
}
