import { randomUUID } from 'node:crypto'
import type { Driver } from 'neo4j-driver'
import { anchorDocument } from './document-storage'
import {
  DOCUMENT_INGEST_STATUS,
  INGEST_UNEXPECTED_FAILURE_MESSAGE,
  MAX_IN_FLIGHT_INGESTS_PER_USER,
  countInFlightIngestsForUser,
  markDocumentIngestComplete,
  markDocumentIngestFailed,
  memberSafeIngestFailureMessage,
} from './document-ingest-queue'
import { ingestRouteForMime } from './supported-file-types'
import {
  countExecutedToolCalls,
  runDocumentIngestPipeline,
  type DocumentIngestPipelineDependencies,
  type DocumentIngestPipelineFailureReason,
} from './run-document-ingest-pipeline'
import type { ExecutedToolCallRecord } from './synthesized-turn-appender'

/**
 * Entry points for getting an uploaded document into the graph.
 *
 * GOAL-292 split this into two halves so the browser upload no longer holds the
 * LLM pipeline open:
 *
 *   - `enqueueDocumentIngest` — cheap and synchronous. Gates on
 *     `canEditContent`, anchors the Document as PENDING, returns. This is what
 *     `POST /api/ingest/document/process` calls before answering 202.
 *   - `runDocumentIngestPipeline` (separate module) — the extraction /
 *     summarization / entity-write half, run by
 *     `/api/cron/process-document-ingestion`.
 *
 * `handleIngestDocument` composes both. It has NO production caller — the
 * browser upload goes through `enqueueDocumentIngest` + the cron, and the
 * server-side `uploadDocument` path is itself test-only. It is kept because the
 * ingest integration tests need the whole pipeline to run inline, with no cron
 * to hand off to. Bear that in mind when reading its race guards: they are
 * production-shaped logic exercised only by tests.
 *
 * The heavy steps (`createIngestThread`, `appendSynthesizedIngestTurns`) live in
 * `run-document-ingest-pipeline.ts`.
 */

export interface IngestDocumentInput {
  currentUserId: string
  fieldContextId: string
  filename: string
  mimeType: string
  /**
   * Key of the file the browser has already uploaded to S3 via a presigned
   * PUT URL. The orchestrator never holds the bytes.
   */
  blobKey: string
  /** Client-reported size (used to populate Document.sizeBytes). */
  sizeBytes: number
  hint: string | null
}

/**
 * Derived from the pipeline's own failure reasons rather than re-listing them,
 * so adding a reason there is a compile error here instead of being silently
 * widened by a cast.
 */
export type IngestFailureReason =
  | DocumentIngestPipelineFailureReason
  | 'forbidden'
  | 'queue_full'

export interface IngestSuccess {
  ok: true
  documentId: string
  threadId: string
  /**
   * The tool calls the extractor proposed and the orchestrator auto-
   * executed. `result.success === true` means the entity landed in the
   * graph; `false` means execution failed (permission, validation, etc.).
   */
  executedToolCalls: ExecutedToolCallRecord[]
}
export interface IngestFailure {
  ok: false
  error: string
  reason: IngestFailureReason
}
export type IngestDocumentResult = IngestSuccess | IngestFailure

/**
 * Permission gate: caller must hold canEditContent on the FieldContext's
 * parent Space (MeSpace owner OR WeSpace admin/member).
 *
 * Exported because the cron worker re-runs it at claim time (GOAL-292): the
 * decision captured at enqueue can be minutes old by the time a document is
 * picked up, and the uploader may have been removed from the Space or demoted
 * to GUEST in between.
 */
export async function userCanEditFieldContext(
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

/**
 * Presign mints blob keys as `documents/document_<uuid>/<sanitized-name>`, so
 * the key already carries a server-generated document id. Returns null for any
 * key that doesn't match (server-side upload path, legacy keys), leaving the
 * caller to mint one.
 */
// Mirrors BLOB_KEY_PATTERN in the process route, filename segment included, so
// the validator and the parser cannot disagree about what a valid key is.
const BLOB_KEY_DOCUMENT_ID = /^documents\/(document_[0-9a-f-]{36})\/[^/]+$/i

export function documentIdFromBlobKey(blobKey: string): string | null {
  const match = BLOB_KEY_DOCUMENT_ID.exec(blobKey)
  return match ? match[1].toLowerCase() : null
}

export interface EnqueueDocumentIngestSuccess {
  ok: true
  documentId: string
}
export type EnqueueDocumentIngestResult =
  | EnqueueDocumentIngestSuccess
  | IngestFailure

/**
 * Synchronous half of the upload (GOAL-292): permission gate → anchor a PENDING
 * Document → done. No blob is read and no model is called, so this returns in
 * milliseconds and the request can answer 202 well inside the pre-stopgap 60s
 * limit that used to produce 504s.
 *
 * The mime check is kept here because it is a pure function of the declared
 * type — no I/O — so an unsupported file still fails immediately and visibly
 * rather than being queued only to fail a minute later. Every other validation
 * needs the blob's bytes and therefore belongs to the worker, which reports it
 * through `Document.status = FAILED` + `statusMessage`.
 *
 * Anchoring before returning is deliberate: the Document row is the queue
 * entry AND the thing the UI polls, so it must exist by the time the client
 * gets its 202.
 */
export async function enqueueDocumentIngest(
  deps: Pick<DocumentIngestPipelineDependencies, 'driver'>,
  input: IngestDocumentInput,
  options: {
    /**
     * Status to anchor with. Callers that run the pipeline themselves pass
     * PROCESSING so the cron worker cannot claim the document out from under
     * them mid-run and ingest it a second time.
     */
    initialStatus?: (typeof DOCUMENT_INGEST_STATUS)[keyof typeof DOCUMENT_INGEST_STATUS]
  } = {}
): Promise<EnqueueDocumentIngestResult> {
  // Permission gate FIRST so a bad caller never causes graph writes.
  const allowed = await userCanEditFieldContext(
    deps.driver,
    input.currentUserId,
    input.fieldContextId
  )
  if (!allowed) {
    return {
      ok: false,
      reason: 'forbidden',
      error:
        'You do not have permission to add documents to this field context.',
    }
  }

  if (!ingestRouteForMime(input.mimeType)) {
    // Defense in depth — the presign gate already rejects unsupported mimes,
    // so reaching here means a client skipped presign or the allow-list
    // drifted. Fail closed rather than queueing work no extractor can do.
    return {
      ok: false,
      reason: 'unsupported_mime',
      error: `We don't support this file type (${input.mimeType}).`,
    }
  }

  // Bound how much of the shared worker one account can occupy. The queue
  // drains oldest-first, so an unbounded burst here would delay every other
  // Space's uploads behind it.
  const inFlight = await countInFlightIngestsForUser(
    deps.driver,
    input.currentUserId
  )
  if (inFlight >= MAX_IN_FLIGHT_INGESTS_PER_USER) {
    return {
      ok: false,
      reason: 'queue_full',
      error: `You have ${inFlight} documents still being processed. Wait for those to finish before uploading more.`,
    }
  }

  // Derive the id from the blob key rather than minting a fresh one, so a
  // retried /process call (flaky connection where the first request actually
  // landed, a double-click) re-anchors the SAME document instead of creating a
  // second one over the same blob — which would be ingested twice, at double the
  // model spend, and only noticed when duplicate entities appeared. The key was
  // shape-validated by the route and its uuid segment is server-minted at
  // presign time, so it is a safe idempotency key; `anchorDocument` MERGEs on it.
  const documentId =
    documentIdFromBlobKey(input.blobKey) ?? `document_${randomUUID()}`
  await anchorDocument({
    driver: deps.driver,
    documentId,
    fieldContextId: input.fieldContextId,
    uploaderUserId: input.currentUserId,
    filename: input.filename,
    mimeType: input.mimeType,
    sizeBytes: input.sizeBytes,
    // Only knowable once the blob is read, which now happens in the worker.
    pageCount: null,
    userHint: input.hint,
    blobKey: input.blobKey,
    // The canonical blob locator is the key — presigned URLs are minted on
    // demand and never persisted.
    blobUrl: input.blobKey,
    status: options.initialStatus ?? DOCUMENT_INGEST_STATUS.pending,
  })

  return { ok: true, documentId }
}

/**
 * Enqueue + run the pipeline inline, i.e. the pre-GOAL-292 behavior.
 *
 * TEST-ONLY: the sole caller is `__test-utils__/handle-ingest-document-helper`.
 * The browser upload route enqueues and lets
 * `/api/cron/process-document-ingestion` do this work; the `uploadDocument`
 * server-side path that used to justify keeping this is also test-only.
 */
export async function handleIngestDocument(
  deps: DocumentIngestPipelineDependencies,
  input: IngestDocumentInput
): Promise<IngestDocumentResult> {
  // Anchor as PROCESSING, not PENDING: this call runs the pipeline itself, and a
  // PENDING document is fair game for the cron worker — which would claim it
  // mid-run and ingest the same file a second time (duplicate thread, duplicate
  // LLM spend). The dev database is shared with a worker that ticks every
  // minute, so the exposure is real, not theoretical.
  const enqueued = await enqueueDocumentIngest(deps, input, {
    initialStatus: DOCUMENT_INGEST_STATUS.processing,
  })
  if (!enqueued.ok) return enqueued

  // Land a terminal status on EVERY exit path — including a thrown error.
  // Anything left at PENDING would be picked up by the cron worker and ingested
  // a SECOND time, double-creating every entity this call already wrote.
  let run: Awaited<ReturnType<typeof runDocumentIngestPipeline>>
  try {
    run = await runDocumentIngestPipeline(deps, {
      documentId: enqueued.documentId,
      actingUserId: input.currentUserId,
      userTurnVerb: 'Uploaded',
    })
  } catch (error) {
    await markDocumentIngestFailed({
      driver: deps.driver,
      documentId: enqueued.documentId,
      statusMessage: INGEST_UNEXPECTED_FAILURE_MESSAGE,
    })
    throw error
  }

  if (!run.ok) {
    await markDocumentIngestFailed({
      driver: deps.driver,
      documentId: enqueued.documentId,
      statusMessage: memberSafeIngestFailureMessage(run.reason, run.error),
    })
    return { ok: false, reason: run.reason, error: run.error }
  }

  await markDocumentIngestComplete({
    driver: deps.driver,
    documentId: enqueued.documentId,
    ...countExecutedToolCalls(run.executedToolCalls),
  })

  return {
    ok: true,
    documentId: run.documentId,
    threadId: run.threadId,
    executedToolCalls: run.executedToolCalls,
  }
}
