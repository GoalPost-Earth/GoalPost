import type { Driver } from 'neo4j-driver'

/**
 * GOAL-292 — the durable queue behind asynchronous document ingestion.
 *
 * `Document.status` *is* the queue. There is no separate job node: the
 * document already carries everything a worker needs (blobKey, mimeType,
 * userHint, parent FieldContext, uploader), so a second node would only
 * duplicate that state and invite the two to drift.
 *
 *   PENDING → PROCESSING → COMPLETE
 *                        → FAILED
 *
 * `POST /api/ingest/document/process` anchors a document as PENDING and
 * returns 202. `/api/cron/process-document-ingestion` claims PENDING rows,
 * runs the extraction pipeline, and lands them in COMPLETE or FAILED.
 *
 * Documents that predate this story have no `status` property at all. Every
 * read here coalesces a missing value to COMPLETE (per the story's Out of
 * Scope note) so the backlog is never re-ingested and the UI never shows an
 * old upload as stuck.
 */

export const DOCUMENT_INGEST_STATUS = {
  pending: 'PENDING',
  processing: 'PROCESSING',
  complete: 'COMPLETE',
  failed: 'FAILED',
} as const

export type DocumentIngestStatus =
  (typeof DOCUMENT_INGEST_STATUS)[keyof typeof DOCUMENT_INGEST_STATUS]

/**
 * How many times a single document may be claimed before we stop retrying it
 * and park it in FAILED. Guards against a document that reproducibly kills the
 * worker (a pathological file, a permanently-gone blob) being retried forever
 * and starving the rest of the queue.
 */
export const MAX_INGEST_ATTEMPTS = 3

/**
 * A claim older than this is treated as abandoned. The worker runs inside a
 * serverless function that can be killed at `maxDuration` (300s) without ever
 * reaching its FAILED write, which would otherwise leave the document in
 * PROCESSING forever — an infinite spinner in the UI. 15 minutes is
 * comfortably longer than the function ceiling, so a *live* run is never
 * reclaimed out from under itself.
 */
export const STALE_PROCESSING_MINUTES = 15

/**
 * Member-safe copy for a worker/pipeline crash. Lives here so the cron and the
 * inline path cannot drift apart on what a member is told.
 */
export const INGEST_UNEXPECTED_FAILURE_MESSAGE =
  'Something went wrong while reading this document. Try re-extracting it, or upload the file again.'

/** Member-safe copy for a document parked after too many failed attempts. */
export const INGEST_ABANDONED_MESSAGE =
  'We could not read this document after several attempts. Try re-extracting it, or upload the file again.'

/**
 * Copy to persist in `statusMessage` for a pipeline failure.
 *
 * `statusMessage` is rendered verbatim to every member of the Space, so two
 * reasons must not pass their text through:
 *
 *   - `parse_failure` interpolates the PDF/office parser's own `err.message`
 *     (`document-text-extractor.ts`), i.e. raw upstream error text — kb/07
 *     Rule 1. Before ingestion was asynchronous this string only ever reached
 *     the uploader's own HTTP 400; persisting it is what makes it a leak.
 *   - `unsupported_mime` echoes the client-supplied mimeType straight back.
 *
 * The rest are authored, member-facing strings that carry genuinely useful
 * detail (which size limit was exceeded, that the file is gone), so they are
 * passed through rather than flattened.
 */
export function memberSafeIngestFailureMessage(
  reason: string,
  authoredMessage: string
): string {
  if (reason === 'parse_failure') {
    return 'We could not read this document — the file may be damaged, empty, or password-protected. Try uploading it again.'
  }
  if (reason === 'unsupported_mime') {
    return "We don't support this file type."
  }
  return authoredMessage
}

/**
 * How many documents one account may have queued or in flight at once.
 *
 * Before GOAL-292 the upload was synchronous, so a member could only ever have
 * one ingest running — the request itself was the throttle. Enqueueing now
 * returns in milliseconds, and the queue drains strictly oldest-first at
 * MAX_DOCUMENTS_PER_RUN per minute, so without a cap one account could queue
 * hundreds of documents and starve every other Space for hours while burning
 * the LLM budget. 20 leaves room for a genuine batch upload (five minutes of
 * draining) without letting one member monopolise the worker.
 */
export const MAX_IN_FLIGHT_INGESTS_PER_USER = 20

export interface ClaimedDocument {
  id: string
  filename: string
}

/**
 * Documents this user has queued or being processed right now. Counts both
 * PENDING and PROCESSING so a member cannot sidestep the cap by waiting for
 * claims without waiting for completions.
 *
 * It must count exactly what `findPendingDocumentIds` will actually drain. A
 * PENDING document under a soft-deleted context is skipped by the drain but
 * lingers until the 90-day purge, so counting it here would hold a permanent
 * slot against the uploader — twenty of them and they can never upload again.
 *
 * Shape: two index seeks unioned, then filtered. Anchoring on the *user*
 * instead makes this O(their lifetime uploads) — 4,031 dbHits at 2,000
 * documents, on every single upload — where the union is O(global queue depth)
 * at 118. The `collect`/`UNWIND` is a planner barrier: without it the EXISTS
 * predicates get pushed below the status seek and the cost returns.
 */
export async function countInFlightIngestsForUser(
  driver: Driver,
  userId: string
): Promise<number> {
  const session = driver.session()
  try {
    const result = await session.executeRead(async (tx) =>
      tx.run(
        `
        CALL {
          MATCH (d:Document {status: $pending})    RETURN d
          UNION
          MATCH (d:Document {status: $processing}) RETURN d
        }
        WITH collect(d) AS inFlightDocs
        UNWIND inFlightDocs AS d
        WITH d
        WHERE EXISTS { (d)-[:UPLOADED_BY]->(:Person:User {id: $userId}) }
          AND EXISTS {
            MATCH (c:FieldContext)-[:HAS_DOCUMENT]->(d)
            WHERE c.deletedAt IS NULL
          }
        RETURN count(d) AS inFlight
        `,
        {
          userId,
          pending: DOCUMENT_INGEST_STATUS.pending,
          processing: DOCUMENT_INGEST_STATUS.processing,
        }
      )
    )
    return Number(result.records[0]?.get('inFlight') ?? 0)
  } finally {
    await session.close()
  }
}

/**
 * Returns the ids of PENDING documents, oldest upload first, so the queue
 * drains fairly. Soft-deleted contexts (GOAL-319) are skipped — their subtree
 * is invisible to every read surface and awaiting purge, so spending LLM calls
 * on their documents is pure waste.
 *
 * Claiming is a separate step (`claimDocumentForIngest`): this scan is a plain
 * read and makes no promise that a candidate is still PENDING by the time the
 * caller tries to take it.
 */
export async function findPendingDocumentIds(
  driver: Driver,
  limit: number
): Promise<string[]> {
  const session = driver.session()
  try {
    const result = await session.executeRead(async (tx) =>
      tx.run(
        `
        MATCH (c:FieldContext)-[:HAS_DOCUMENT]->(d:Document)
        WHERE d.status = $pending
          AND c.deletedAt IS NULL
        // DISTINCT because nothing enforces one HAS_DOCUMENT edge per document:
        // a second edge would otherwise return the same id twice and burn two of
        // the run's slots on one document.
        RETURN DISTINCT d.id AS id, d.uploadedAt AS uploadedAt
        ORDER BY uploadedAt ASC
        LIMIT toInteger($limit)
        `,
        { pending: DOCUMENT_INGEST_STATUS.pending, limit }
      )
    )
    return result.records.map((record) => record.get('id') as string)
  } finally {
    await session.close()
  }
}

/**
 * Atomically take ownership of one PENDING document, returning null when
 * another worker got there first.
 *
 * Why the write-then-guard shape rather than `MATCH (d {status:'PENDING'}) SET
 * d.status='PROCESSING'`: Neo4j is read-committed and only takes a write lock
 * when a SET actually executes. Two overlapping cron runs would both MATCH the
 * same PENDING node, both queue their SET, and the second would still apply
 * after the first committed — because its predicate was evaluated *before* it
 * held the lock. That is the classic lost-update, and it would run the whole
 * LLM pipeline twice, double-creating entities.
 *
 * The lock is taken on a throwaway `ingestLockToken`, NOT on
 * `ingestClaimedBy`. The lock-forcing write is not rolled back when the guard
 * filters the row away — it commits — so a loser writing `ingestClaimedBy`
 * would leave that field naming a worker that does not own the claim (measured:
 * correct in 0 of 6 contended trials, and permanently stamped even on an
 * already-COMPLETE document). Since `ingestClaimedBy` is the field an operator
 * reads to find out who is holding a stuck document, and the fence on the
 * terminal writes below depends on it being truthful, only the winner may set
 * it — so it moves inside the guard. Same plan, same 8 dbHits.
 */
export async function claimDocumentForIngest(
  driver: Driver,
  documentId: string,
  workerRunId: string
): Promise<ClaimedDocument | null> {
  const session = driver.session()
  try {
    const result = await session.executeWrite(async (tx) =>
      tx.run(
        `
        MATCH (d:Document {id: $documentId})
        // Lock-forcing write only — deliberately a property nothing reads.
        SET d.ingestLockToken = randomUUID()
        WITH d
        WHERE d.status = $pending
        SET d.status = $processing,
            d.statusUpdatedAt = datetime(),
            d.statusMessage = null,
            d.ingestClaimedBy = $workerRunId,
            d.ingestAttempts = coalesce(d.ingestAttempts, 0) + 1
        RETURN d.id AS id, d.filename AS filename
        `,
        {
          documentId,
          workerRunId,
          pending: DOCUMENT_INGEST_STATUS.pending,
          processing: DOCUMENT_INGEST_STATUS.processing,
        }
      )
    )
    const record = result.records[0]
    if (!record) return null
    return {
      id: record.get('id') as string,
      filename: (record.get('filename') as string | null) ?? '',
    }
  } finally {
    await session.close()
  }
}

export interface FinishIngestInput {
  driver: Driver
  documentId: string
  /** Member-safe copy for FAILED; never raw driver/model error text (kb/07). */
  statusMessage?: string | null
  /** Entity counts from the run, surfaced by the UI when the upload lands. */
  createdEntityCount?: number
  failedEntityCount?: number
  /**
   * The claim this write belongs to. When given, the write only lands if the
   * document is still claimed by that run — so a slow run that was reclaimed
   * and re-claimed underneath itself cannot stomp the newer attempt's status.
   * Omitted by callers that own the document outright (the inline path anchors
   * it PROCESSING and never publishes it to the queue).
   */
  workerRunId?: string
}

/**
 * `WITH d WHERE …` fence shared by both terminal writes. A no-op when the
 * caller passes no run id.
 */
const CLAIM_FENCE = `
        WITH d
        WHERE $workerRunId IS NULL OR d.ingestClaimedBy = $workerRunId`

export async function markDocumentIngestComplete(
  input: FinishIngestInput
): Promise<void> {
  const session = input.driver.session()
  try {
    await session.executeWrite(async (tx) =>
      tx.run(
        `
        MATCH (d:Document {id: $documentId})${CLAIM_FENCE}
        SET d.status = $complete,
            d.statusUpdatedAt = datetime(),
            d.statusMessage = null,
            // toInteger: a plain JS number is encoded as a Float64, which
            // would store 3.0 for an int-declared property and render as
            // "3.0" anywhere it reaches copy.
            d.ingestCreatedEntityCount = toInteger($createdEntityCount),
            d.ingestFailedEntityCount = toInteger($failedEntityCount),
            d.ingestClaimedBy = null
        `,
        {
          documentId: input.documentId,
          complete: DOCUMENT_INGEST_STATUS.complete,
          createdEntityCount: input.createdEntityCount ?? 0,
          failedEntityCount: input.failedEntityCount ?? 0,
          workerRunId: input.workerRunId ?? null,
        }
      )
    )
  } finally {
    await session.close()
  }
}

/**
 * Park a document in FAILED with member-safe copy the UI can render as-is.
 * The document node and its blob both survive, so the existing Re-extract
 * action (GOAL-241) stays the recovery path.
 */
export async function markDocumentIngestFailed(
  input: FinishIngestInput
): Promise<void> {
  const session = input.driver.session()
  try {
    await session.executeWrite(async (tx) =>
      tx.run(
        `
        MATCH (d:Document {id: $documentId})${CLAIM_FENCE}
        SET d.status = $failed,
            d.statusUpdatedAt = datetime(),
            d.statusMessage = $statusMessage,
            d.ingestClaimedBy = null
        `,
        {
          documentId: input.documentId,
          failed: DOCUMENT_INGEST_STATUS.failed,
          statusMessage: input.statusMessage?.trim() || null,
          workerRunId: input.workerRunId ?? null,
        }
      )
    )
  } finally {
    await session.close()
  }
}

export interface ReclaimResult {
  requeued: number
  abandoned: number
}

/**
 * Recover documents stranded in PROCESSING by a worker that died before it
 * could write a terminal status (function timeout, deploy mid-run, crash).
 *
 * Under the attempt ceiling they go back to PENDING for another pass; at or
 * over it they are parked in FAILED so the user gets a real error state
 * instead of a spinner that never resolves. Both branches are single
 * statements, so an overlapping cron run cannot double-count attempts.
 */
export async function reclaimStalledIngests(
  driver: Driver
): Promise<ReclaimResult> {
  const session = driver.session()
  try {
    const result = await session.executeWrite(async (tx) =>
      tx.run(
        `
        MATCH (d:Document)
        WHERE d.status = $processing
          // A PROCESSING document with no clock is broken state by definition —
          // treat it as stale. Without the IS NULL branch the comparison is
          // null, it never matches, and the document spins forever: exactly the
          // outcome this function exists to prevent.
          AND (
            d.statusUpdatedAt IS NULL
            OR d.statusUpdatedAt < datetime() - duration({minutes: $staleMinutes})
          )
        WITH d, coalesce(d.ingestAttempts, 0) >= $maxAttempts AS exhausted
        SET d.status = CASE WHEN exhausted THEN $failed ELSE $pending END,
            d.statusMessage = CASE WHEN exhausted THEN $abandonedMessage ELSE null END,
            d.statusUpdatedAt = datetime(),
            d.ingestClaimedBy = null
        RETURN exhausted AS exhausted
        `,
        {
          processing: DOCUMENT_INGEST_STATUS.processing,
          pending: DOCUMENT_INGEST_STATUS.pending,
          failed: DOCUMENT_INGEST_STATUS.failed,
          staleMinutes: STALE_PROCESSING_MINUTES,
          maxAttempts: MAX_INGEST_ATTEMPTS,
          abandonedMessage: INGEST_ABANDONED_MESSAGE,
        }
      )
    )
    let requeued = 0
    let abandoned = 0
    for (const record of result.records) {
      if (record.get('exhausted') === true) abandoned += 1
      else requeued += 1
    }
    return { requeued, abandoned }
  } finally {
    await session.close()
  }
}
