import type { Driver } from 'neo4j-driver'
import {
  ARTICLE_IMPORT_STATUS,
  type ArticleImportRowInput,
  type ArticleImportStatus,
  type PersistedArticleRowOutcome,
} from './article-import'

/**
 * GOAL-326 — the durable queue behind asynchronous bulk article import.
 *
 *   PENDING → PROCESSING → COMPLETE
 *                        → FAILED
 *
 * `POST /api/import/articles` validates, gates on `canEditContent`, anchors an
 * `:ArticleImportJob` as PENDING and returns 202.
 * `/api/cron/process-article-imports` claims PENDING jobs, walks their rows
 * through the same authorized write path the synchronous route used, and lands
 * them in COMPLETE or FAILED. The member polls
 * `GET /api/import/articles/<jobId>`.
 *
 * Why a job node rather than the provisioned Upstash Redis (ADR-019): the rows
 * are member content that must survive a worker crash, one 300-row payload can
 * exceed Upstash's per-record ceiling, and keeping job state in the same store
 * as the entities it mints is what makes the resume cursor and the `:Log` audit
 * trail consistent with each other. The claim/reclaim shape is deliberately the
 * same as `document-ingest-queue.ts` — see the comments there and in
 * `kb/04-state-machines.md` for why the lock-forcing write is load-bearing.
 *
 * The resume cursor is `size(rowOutcomes)`. Outcomes are appended in row order,
 * exactly one per processed row, so the list length *is* how far the job got —
 * there is no second counter that could disagree with it.
 */

/**
 * How many imports one account may have queued or in flight at once.
 *
 * The synchronous route throttled itself: a member could only run one import at
 * a time because they were waiting on it. Enqueue now returns in milliseconds,
 * so without a cap a looping caller could park thousands of rows in the queue
 * and starve every other Space. The `bulk-import` rate limit (10/hour/account)
 * is the primary bound, but it fails OPEN when Redis is unreachable — this cap
 * is enforced by the graph itself and cannot degrade.
 */
export const MAX_IN_FLIGHT_ARTICLE_IMPORTS_PER_USER = 5

/**
 * How many times a job may be claimed before it is parked in FAILED, so a job
 * that reproducibly kills the worker cannot be retried forever. A job that
 * *voluntarily* yields on the run's time budget resets this (it demonstrably
 * made progress), so a long import spanning several ticks is never abandoned.
 */
export const MAX_ARTICLE_IMPORT_ATTEMPTS = 3

/**
 * A claim older than this is treated as abandoned. Longer than the 300s
 * function ceiling so a live run is never reclaimed out from under itself —
 * and the per-row outcome write refreshes `statusUpdatedAt`, so a job that is
 * genuinely progressing keeps its clock fresh.
 */
export const STALE_PROCESSING_MINUTES = 15

/** Member-safe copy for a worker crash (kb/07 Rule 1 — raw errors stay in logs). */
export const IMPORT_UNEXPECTED_FAILURE_MESSAGE =
  'Something went wrong while importing this spreadsheet. The rows below show how far it got — upload the remaining rows again.'

/** Member-safe copy for a job parked after too many failed attempts. */
export const IMPORT_ABANDONED_MESSAGE =
  'We could not finish this import after several attempts. The rows below show how far it got — upload the remaining rows again.'

/**
 * Shared copy for "no such field" and "you may not write to this field".
 * Deliberately identical so the response never discloses whether a
 * FieldContext exists in a Space the caller cannot see.
 */
export const IMPORT_FORBIDDEN_MESSAGE =
  'This field is not available, or you cannot add pulses to it.'

/** Member-safe copy when the uploader loses access between enqueue and claim. */
export const IMPORT_PERMISSION_LOST_MESSAGE =
  'This import was not run because you no longer have permission to add pulses to this field.'

/** Member-safe copy when the target field was deleted before the import ran. */
export const IMPORT_FIELD_GONE_MESSAGE =
  'This import was not run because the field it was going into has been deleted.'

/**
 * How long a finished job survives. It is a receipt for a completed import —
 * the member reads it minutes after uploading, not weeks — and it holds their
 * article titles in `rowOutcomes`, so it should not live forever.
 */
export const FINISHED_JOB_RETENTION_DAYS = 30

export interface ArticleImportJobRecord {
  id: string
  fieldContextId: string
  requesterUserId: string
  totalRows: number
  rows: ArticleImportRowInput[]
  /** Durable per-row outcomes, in row order. Its length is the resume cursor. */
  outcomes: PersistedArticleRowOutcome[]
}

export interface ArticleImportJobSnapshot {
  status: ArticleImportStatus
  statusMessage: string | null
  totalRows: number
  outcomes: PersistedArticleRowOutcome[]
}

/**
 * Outcomes are stored as a list of JSON strings rather than a single blob so
 * each row is a cheap append. A row that somehow persisted as unparseable JSON
 * is reported as a failed row instead of throwing the whole read away — the
 * member still sees the rest of their batch.
 */
function parseOutcomes(raw: unknown): PersistedArticleRowOutcome[] {
  if (!Array.isArray(raw)) return []
  const unreadable: PersistedArticleRowOutcome = {
    row: 0,
    title: '',
    status: 'failed',
    message: 'This row’s result could not be read.',
  }
  // Every corrupt entry becomes a placeholder rather than being skipped:
  // dropping one would shorten the list, and the list's LENGTH is the resume
  // cursor — a short read would rewind the job and re-import rows that already
  // landed.
  return raw.map((entry) => {
    if (typeof entry !== 'string') return unreadable
    try {
      return JSON.parse(entry) as PersistedArticleRowOutcome
    } catch {
      return unreadable
    }
  })
}

/**
 * Anchor a validated batch as a PENDING job, refusing when the requester is
 * already at the in-flight cap. Returns false when the cap rejected it.
 *
 * The caller has already authenticated, rate-limited, validated the payload,
 * and gated on `canEditContent`.
 *
 * **The cap is enforced inside this write, not by a separate read.** A
 * count-then-create across two transactions is a check-then-act: N concurrent
 * enqueues all commit their count before any peer's CREATE lands, all see zero
 * in flight, and all enqueue. That matters specifically because
 * `POLICY_FAILURE_MODE['bulk-import']` is fail-OPEN — with Redis unreachable
 * this cap is the *only* bound, which is exactly when it must not evaporate.
 * The lock-forcing `SET` on the requester serializes their own concurrent
 * enqueues (same trick, same reason, as `claimArticleImportJob` below).
 *
 * The `REQUESTED_BY` edge is the authorization decision crossing the queue
 * boundary: the worker holds no JWT, so every write it makes is attributed to
 * this person (and re-gated live at claim time — see the cron).
 */
export async function createArticleImportJob(
  driver: Driver,
  input: {
    jobId: string
    fieldContextId: string
    requesterUserId: string
    rows: ArticleImportRowInput[]
  }
): Promise<{ created: boolean; inFlight: number }> {
  const session = driver.session()
  try {
    const result = await session.executeWrite(async (tx) =>
      tx.run(
        `
        MATCH (u:Person:User {id: $requesterUserId})
        // Lock-forcing write only — nothing reads it. Serializes this account's
        // concurrent enqueues so the count below cannot be stale.
        SET u.importEnqueueLock = randomUUID()
        WITH u
        CALL {
          WITH u
          MATCH (j:ArticleImportJob {status: $pending})
          WHERE EXISTS { (j)-[:REQUESTED_BY]->(u) }
            AND EXISTS {
              MATCH (c:FieldContext)-[:HAS_IMPORT_JOB]->(j)
              WHERE c.deletedAt IS NULL
            }
          RETURN count(j) AS pendingCount
        }
        CALL {
          WITH u
          MATCH (j:ArticleImportJob {status: $processing})
          WHERE EXISTS { (j)-[:REQUESTED_BY]->(u) }
            AND EXISTS {
              MATCH (c:FieldContext)-[:HAS_IMPORT_JOB]->(j)
              WHERE c.deletedAt IS NULL
            }
          RETURN count(j) AS processingCount
        }
        WITH u, pendingCount + processingCount AS inFlight
        WHERE inFlight < $cap
        MATCH (c:FieldContext {id: $fieldContextId})
        CREATE (j:ArticleImportJob {
          id: $jobId,
          status: $pending,
          statusMessage: null,
          statusUpdatedAt: datetime(),
          createdAt: datetime(),
          // toInteger: a plain JS number is encoded as a Float64, which would
          // store 300.0 for an int-declared property and render as "300.0"
          // anywhere it reaches copy.
          totalRows: toInteger($totalRows),
          rowsJson: $rowsJson,
          rowOutcomes: [],
          attempts: 0
        })
        CREATE (c)-[:HAS_IMPORT_JOB]->(j)
        CREATE (j)-[:REQUESTED_BY]->(u)
        RETURN inFlight
        `,
        {
          jobId: input.jobId,
          fieldContextId: input.fieldContextId,
          requesterUserId: input.requesterUserId,
          totalRows: input.rows.length,
          rowsJson: JSON.stringify(input.rows),
          pending: ARTICLE_IMPORT_STATUS.pending,
          processing: ARTICLE_IMPORT_STATUS.processing,
          cap: MAX_IN_FLIGHT_ARTICLE_IMPORTS_PER_USER,
        }
      )
    )
    const record = result.records[0]
    if (record) {
      return { created: true, inFlight: Number(record.get('inFlight')) }
    }
    // Zero rows means the cap guard rejected it — or, far less likely, the
    // requester/context MATCH missed. Re-read the count so the caller can say
    // something specific; a missing context reads as 0 and the caller has
    // already gated on it, so it cannot be a silent success either way.
    return {
      created: false,
      inFlight: await countInFlightArticleImportsForUser(
        driver,
        input.requesterUserId
      ),
    }
  } finally {
    await session.close()
  }
}

/**
 * Jobs this user has queued or in flight right now.
 *
 * Counts exactly what the drain can actually reach: a job under a soft-deleted
 * context (GOAL-319) is skipped by `findPendingArticleImportJobIds` and lingers
 * until the 90-day purge, so counting it here would hold a slot against the
 * member permanently.
 */
export async function countInFlightArticleImportsForUser(
  driver: Driver,
  userId: string
): Promise<number> {
  const session = driver.session()
  try {
    const result = await session.executeRead(async (tx) =>
      tx.run(
        `
        CALL {
          MATCH (j:ArticleImportJob {status: $pending})    RETURN j
          UNION
          MATCH (j:ArticleImportJob {status: $processing}) RETURN j
        }
        // Planner barrier, carried over from countInFlightIngestsForUser where
        // it was measured to matter. At this label it is a no-op — 65 dbHits
        // either way, both seeks stay under the Union — so it is kept as cheap
        // insurance against a future plan change, not because it is load-
        // bearing here.
        WITH collect(j) AS inFlightJobs
        UNWIND inFlightJobs AS j
        WITH j
        WHERE EXISTS { (j)-[:REQUESTED_BY]->(:Person {id: $userId}) }
          AND EXISTS {
            MATCH (c:FieldContext)-[:HAS_IMPORT_JOB]->(j)
            WHERE c.deletedAt IS NULL
          }
        RETURN count(j) AS inFlight
        `,
        {
          userId,
          pending: ARTICLE_IMPORT_STATUS.pending,
          processing: ARTICLE_IMPORT_STATUS.processing,
        }
      )
    )
    return Number(result.records[0]?.get('inFlight') ?? 0)
  } finally {
    await session.close()
  }
}

/**
 * Ids of PENDING jobs, oldest first, so the queue drains fairly. Jobs under a
 * soft-deleted context are skipped — the whole subtree is invisible to every
 * read surface and awaiting purge, so minting pulses into it is pure waste.
 *
 * Claiming is a separate step: this scan makes no promise that a candidate is
 * still PENDING by the time the caller tries to take it.
 */
export async function findPendingArticleImportJobIds(
  driver: Driver,
  limit: number
): Promise<string[]> {
  const session = driver.session()
  try {
    const result = await session.executeRead(async (tx) =>
      tx.run(
        `
        // Anchor on the status index, NOT on (c:FieldContext)-[:HAS_IMPORT_JOB]->(j).
        // The context-anchored form label-scans FieldContext and expands every
        // job ever created under a live context — it never touches
        // article_import_job_status at all. Measured at a 2,000-job backlog:
        // 4,070 dbHits vs 29, and ~4,056 every tick even when the queue is
        // EMPTY, which is the common case at 1,440 ticks/day.
        //
        // (This shape looks index-anchored if you EXPLAIN it against an empty
        // label — the planner estimates 0 rows and picks the seek. It only
        // flips once real jobs exist. Profile with a seeded backlog.)
        MATCH (j:ArticleImportJob {status: $pending})
        // collect/UNWIND is a planner barrier: without it the EXISTS predicate
        // gets folded back into a context-anchored plan and the scan returns.
        WITH collect(j) AS pending
        UNWIND pending AS j
        WITH j
        // EXISTS rather than a pattern match, so a job with duplicate
        // HAS_IMPORT_JOB edges yields one row instead of burning two of the
        // run's slots (what the old DISTINCT was for).
        WHERE EXISTS {
          MATCH (c:FieldContext)-[:HAS_IMPORT_JOB]->(j)
          WHERE c.deletedAt IS NULL
        }
        RETURN j.id AS id, j.createdAt AS createdAt
        ORDER BY createdAt ASC
        LIMIT toInteger($limit)
        `,
        { pending: ARTICLE_IMPORT_STATUS.pending, limit }
      )
    )
    return result.records.map((record) => record.get('id') as string)
  } finally {
    await session.close()
  }
}

/**
 * Atomically take ownership of one PENDING job, returning false when another
 * worker got there first.
 *
 * The write-then-guard shape is load-bearing and must not be simplified back to
 * `MATCH (j {status:'PENDING'}) SET j.status='PROCESSING'`: Neo4j is
 * read-committed and only takes a write lock when a SET actually executes, so
 * two overlapping cron runs would both match, both queue their SET, and both
 * win — measured 11/12 trials on the identically-shaped document queue. The
 * lock is forced on a throwaway `lockToken` and NOT on `claimedBy`, because the
 * lock-forcing write commits even for the loser; `claimedBy` has to stay
 * truthful since every terminal write fences on it.
 */
export async function claimArticleImportJob(
  driver: Driver,
  jobId: string,
  workerRunId: string
): Promise<boolean> {
  const session = driver.session()
  try {
    const result = await session.executeWrite(async (tx) =>
      tx.run(
        `
        MATCH (j:ArticleImportJob {id: $jobId})
        // Lock-forcing write only — deliberately a property nothing reads.
        SET j.lockToken = randomUUID()
        WITH j
        WHERE j.status = $pending
        SET j.status = $processing,
            j.statusUpdatedAt = datetime(),
            j.statusMessage = null,
            j.claimedBy = $workerRunId,
            j.attempts = coalesce(j.attempts, 0) + 1
        RETURN j.id AS id
        `,
        {
          jobId,
          workerRunId,
          pending: ARTICLE_IMPORT_STATUS.pending,
          processing: ARTICLE_IMPORT_STATUS.processing,
        }
      )
    )
    return result.records.length > 0
  } finally {
    await session.close()
  }
}

/**
 * Everything the worker needs to run (or resume) a claimed job.
 *
 * Returns null when the job is unreachable OR carries an ambiguous number of
 * context / requester edges. Guessing between two requesters would mean running
 * an authenticated write path as the wrong person, so refuse instead — the
 * caller lands the job in FAILED.
 */
export async function loadArticleImportJob(
  driver: Driver,
  jobId: string
): Promise<ArticleImportJobRecord | null> {
  const session = driver.session()
  try {
    const result = await session.executeRead(async (tx) =>
      tx.run(
        `
        MATCH (j:ArticleImportJob {id: $jobId})
        OPTIONAL MATCH (c:FieldContext)-[:HAS_IMPORT_JOB]->(j)
        WITH j, collect(DISTINCT c.id) AS contextIds
        OPTIONAL MATCH (j)-[:REQUESTED_BY]->(p:Person)
        RETURN contextIds,
               collect(DISTINCT p.id) AS requesterIds,
               j.rowsJson AS rowsJson,
               coalesce(j.rowOutcomes, []) AS rowOutcomes,
               j.totalRows AS totalRows
        `,
        { jobId }
      )
    )
    const record = result.records[0]
    if (!record) return null

    const contextIds = (record.get('contextIds') as string[]) ?? []
    const requesterIds = (record.get('requesterIds') as string[]) ?? []
    if (contextIds.length !== 1 || requesterIds.length !== 1) return null

    const rowsJson = record.get('rowsJson') as string | null
    if (!rowsJson) return null
    let rows: ArticleImportRowInput[]
    try {
      rows = JSON.parse(rowsJson) as ArticleImportRowInput[]
    } catch {
      return null
    }
    if (!Array.isArray(rows)) return null

    return {
      id: jobId,
      fieldContextId: contextIds[0],
      requesterUserId: requesterIds[0],
      totalRows: Number(record.get('totalRows') ?? rows.length),
      rows,
      outcomes: parseOutcomes(record.get('rowOutcomes')),
    }
  } finally {
    await session.close()
  }
}

/**
 * Append one row's outcome, fenced on the claim so a run that was reclaimed
 * underneath itself cannot keep writing into the newer attempt's list.
 *
 * Also refreshes `statusUpdatedAt`, which is the staleness clock — a job that
 * is genuinely progressing therefore never looks abandoned, however long it
 * runs.
 *
 * Returns false when the fence rejected the write, i.e. this run no longer owns
 * the job. That is the worker's signal to stop immediately: a zombie run that
 * kept minting pulses beside the new claimant would double-write every
 * remaining row.
 */
export async function appendArticleImportRowOutcome(
  driver: Driver,
  input: {
    jobId: string
    workerRunId: string
    outcome: PersistedArticleRowOutcome
  }
): Promise<boolean> {
  const session = driver.session()
  try {
    const result = await session.executeWrite(async (tx) =>
      tx.run(
        `
        MATCH (j:ArticleImportJob {id: $jobId})
        // Lock-forcing write BEFORE the fence is read — the fence is a
        // read-then-write and is otherwise the exact lost-update hazard the
        // claim takes this same precaution against. Without it a run whose
        // claim was revoked mid-statement evaluates claimedBy against the
        // pre-revoke value and its append lands anyway, splicing a zombie
        // outcome into the new attempt's list and shifting its resume cursor.
        // Measured: 3 of 4 revoked writes landed without this line, 0 of 3 with.
        SET j.lockToken = randomUUID()
        WITH j
        WHERE j.claimedBy = $workerRunId
        SET j.rowOutcomes = coalesce(j.rowOutcomes, []) + $outcome,
            j.statusUpdatedAt = datetime()
        RETURN j.id AS id
        `,
        {
          jobId: input.jobId,
          workerRunId: input.workerRunId,
          outcome: JSON.stringify(input.outcome),
        }
      )
    )
    return result.records.length > 0
  } finally {
    await session.close()
  }
}

/**
 * Fence shared by the terminal writes: a slow run that was reclaimed and
 * re-claimed underneath itself must not stomp the newer attempt's status.
 *
 * The `SET j.lockToken` is load-bearing, not decoration. Reading `claimedBy` in
 * a `WHERE` and then `SET`-ing is a read-then-write, and Neo4j only takes the
 * node lock at the `SET` — so without a lock-forcing write first, a revoked run
 * evaluates the fence against the pre-revoke value and its write commits. The
 * worst case measured was `markArticleImportJobComplete`: a zombie stamped
 * COMPLETE onto a job the new claimant was still processing, so the member saw
 * a successful import with rows silently missing and no error. 2 of 3 stomps
 * landed without this line; 0 of 3 with it.
 */
const CLAIM_FENCE = `
        SET j.lockToken = randomUUID()
        WITH j
        WHERE j.claimedBy = $workerRunId`

/**
 * Land a job in COMPLETE. `rowsJson` is dropped: the payload has served its
 * purpose, the outcomes are what the member reads from here on, and keeping a
 * second copy of their spreadsheet in the graph forever buys nothing.
 */
export async function markArticleImportJobComplete(
  driver: Driver,
  input: { jobId: string; workerRunId: string }
): Promise<void> {
  const session = driver.session()
  try {
    await session.executeWrite(async (tx) =>
      tx.run(
        `
        MATCH (j:ArticleImportJob {id: $jobId})${CLAIM_FENCE}
        SET j.status = $complete,
            j.statusUpdatedAt = datetime(),
            j.statusMessage = null,
            j.claimedBy = null,
            j.rowsJson = null
        `,
        {
          jobId: input.jobId,
          workerRunId: input.workerRunId,
          complete: ARTICLE_IMPORT_STATUS.complete,
        }
      )
    )
  } finally {
    await session.close()
  }
}

/**
 * Park a job in FAILED with member-safe copy the UI renders as-is. Rows already
 * imported stay imported and their outcomes stay visible; re-uploading the
 * sheet is the recovery path (the write tools enrich rather than duplicate, so
 * a re-upload of the whole sheet is safe).
 */
export async function markArticleImportJobFailed(
  driver: Driver,
  input: { jobId: string; workerRunId: string; statusMessage: string }
): Promise<void> {
  const session = driver.session()
  try {
    await session.executeWrite(async (tx) =>
      tx.run(
        `
        MATCH (j:ArticleImportJob {id: $jobId})${CLAIM_FENCE}
        SET j.status = $failed,
            j.statusUpdatedAt = datetime(),
            j.statusMessage = $statusMessage,
            j.claimedBy = null,
            j.rowsJson = null
        `,
        {
          jobId: input.jobId,
          workerRunId: input.workerRunId,
          failed: ARTICLE_IMPORT_STATUS.failed,
          statusMessage: input.statusMessage,
        }
      )
    )
  } finally {
    await session.close()
  }
}

/**
 * Hand a partially-processed job back to the queue because the run is out of
 * time. `rowsJson` and `rowOutcomes` are untouched, so the next tick resumes at
 * `size(rowOutcomes)` rather than re-walking the sheet.
 *
 * `resetAttempts` clears the poison-payload ceiling, and the caller must pass
 * it ONLY when the run actually landed rows. `shouldYield` is checked at the
 * top of the row loop, so a job claimed close to the run's claim deadline can
 * yield having processed nothing — resetting there would let it be claimed,
 * yield, and requeue forever without ever reaching MAX_ARTICLE_IMPORT_ATTEMPTS,
 * holding one of the member's in-flight slots and spinning their modal.
 */
export async function requeueArticleImportJob(
  driver: Driver,
  input: { jobId: string; workerRunId: string; resetAttempts: boolean }
): Promise<void> {
  const session = driver.session()
  try {
    await session.executeWrite(async (tx) =>
      tx.run(
        `
        MATCH (j:ArticleImportJob {id: $jobId})${CLAIM_FENCE}
        SET j.status = $pending,
            j.statusUpdatedAt = datetime(),
            j.statusMessage = null,
            j.claimedBy = null,
            j.attempts = CASE WHEN $resetAttempts THEN 0 ELSE j.attempts END
        `,
        {
          jobId: input.jobId,
          workerRunId: input.workerRunId,
          resetAttempts: input.resetAttempts,
          pending: ARTICLE_IMPORT_STATUS.pending,
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
 * Recover jobs stranded in PROCESSING by a worker that died before writing a
 * terminal status (function kill, deploy mid-run, crash).
 *
 * Under the attempt ceiling they go back to PENDING and resume from their
 * cursor; at or over it they are parked in FAILED so the member gets a real
 * error state instead of a spinner that never resolves. Both branches are a
 * single statement, so an overlapping run cannot double-count attempts.
 */
export async function reclaimStalledArticleImports(
  driver: Driver
): Promise<ReclaimResult> {
  const session = driver.session()
  try {
    const result = await session.executeWrite(async (tx) =>
      tx.run(
        `
        MATCH (j:ArticleImportJob)
        WHERE j.status = $processing
          // A PROCESSING job with no clock is broken state by definition —
          // without the IS NULL branch the comparison is null, never matches,
          // and the job spins forever: the outcome this function prevents.
          AND (
            j.statusUpdatedAt IS NULL
            OR j.statusUpdatedAt < datetime() - duration({minutes: $staleMinutes})
          )
        WITH j, coalesce(j.attempts, 0) >= $maxAttempts AS exhausted
        SET j.status = CASE WHEN exhausted THEN $failed ELSE $pending END,
            j.statusMessage = CASE WHEN exhausted THEN $abandonedMessage ELSE null END,
            j.rowsJson = CASE WHEN exhausted THEN null ELSE j.rowsJson END,
            j.statusUpdatedAt = datetime(),
            j.claimedBy = null
        // Abandonment is a system-initiated terminal transition with a
        // member-visible consequence (rows silently not imported) and no
        // request behind it, so it earns an activity Log — attributed to the
        // requester, exactly as the worker attributes its other writes. The
        // requeue branch is pure queue mechanics and writes nothing.
        FOREACH (_ IN CASE WHEN exhausted THEN [1] ELSE [] END |
          MERGE (j)-[:REQUESTED_BY]->(requester:Person)
          CREATE (log:Log {
            id: 'log_' + toString(timestamp()) + '_' + left(randomUUID(), 8),
            description: 'Bulk article import was abandoned after repeated failures',
            metadata: '{"source":"article-import","jobId":"' + j.id + '"}',
            createdAt: datetime()
          })
          CREATE (log)-[:CREATED_BY]->(requester)
        )
        RETURN exhausted AS exhausted
        `,
        {
          processing: ARTICLE_IMPORT_STATUS.processing,
          pending: ARTICLE_IMPORT_STATUS.pending,
          failed: ARTICLE_IMPORT_STATUS.failed,
          staleMinutes: STALE_PROCESSING_MINUTES,
          maxAttempts: MAX_ARTICLE_IMPORT_ATTEMPTS,
          abandonedMessage: IMPORT_ABANDONED_MESSAGE,
        }
      )
    )
    let requeued = 0
    let abandoned = 0
    for (const record of result.records) {
      if (record.get('exhausted') === true) abandoned += 1
      else requeued += 1
    }
    const stranded = await failStrandedPendingJobs(driver)
    return { requeued, abandoned: abandoned + stranded }
  } finally {
    await session.close()
  }
}

/**
 * Fail PENDING jobs whose FieldContext is gone or soft-deleted.
 *
 * Nothing else can move these: the drain skips them (GOAL-319), the in-flight
 * cap skips them, and the stale sweep above only matches PROCESSING. Before
 * GOAL-326 a delete mid-import was harmless because the import lived inside the
 * request; now the job would sit PENDING forever and the member's modal would
 * poll "Queued" forever. Enqueue refuses a soft-deleted context up front, so
 * this covers the delete-AFTER-enqueue window.
 */
async function failStrandedPendingJobs(driver: Driver): Promise<number> {
  const session = driver.session()
  try {
    const result = await session.executeWrite(async (tx) =>
      tx.run(
        `
        MATCH (j:ArticleImportJob {status: $pending})
        WHERE NOT EXISTS {
          MATCH (c:FieldContext)-[:HAS_IMPORT_JOB]->(j)
          WHERE c.deletedAt IS NULL
        }
        SET j.status = $failed,
            j.statusMessage = $statusMessage,
            j.statusUpdatedAt = datetime(),
            j.claimedBy = null,
            j.rowsJson = null
        RETURN count(j) AS stranded
        `,
        {
          pending: ARTICLE_IMPORT_STATUS.pending,
          failed: ARTICLE_IMPORT_STATUS.failed,
          statusMessage: IMPORT_FIELD_GONE_MESSAGE,
        }
      )
    )
    return Number(result.records[0]?.get('stranded') ?? 0)
  } finally {
    await session.close()
  }
}

/**
 * Drop finished jobs past their retention window.
 *
 * `rowsJson` is cleared at every terminal write, but `rowOutcomes` keeps the
 * member's article titles, and on a context that is never deleted the 90-day
 * context purge never fires — so without this the label grows monotonically for
 * the life of the deployment and holds member content indefinitely. The job is
 * a receipt for an import that already happened; a month is far longer than
 * anyone revisits one.
 */
export async function purgeFinishedArticleImportJobs(
  driver: Driver,
  retentionDays = FINISHED_JOB_RETENTION_DAYS,
  limit = 200
): Promise<number> {
  const session = driver.session()
  try {
    const result = await session.executeWrite(async (tx) =>
      tx.run(
        `
        CALL {
          MATCH (j:ArticleImportJob {status: $complete}) RETURN j
          UNION
          MATCH (j:ArticleImportJob {status: $failed})   RETURN j
        }
        WITH j
        WHERE j.statusUpdatedAt IS NOT NULL
          AND j.statusUpdatedAt < datetime() - duration({days: $retentionDays})
        WITH j LIMIT toInteger($limit)
        DETACH DELETE j
        RETURN count(*) AS purged
        `,
        {
          complete: ARTICLE_IMPORT_STATUS.complete,
          failed: ARTICLE_IMPORT_STATUS.failed,
          retentionDays,
          limit,
        }
      )
    )
    return Number(result.records[0]?.get('purged') ?? 0)
  } finally {
    await session.close()
  }
}

/**
 * Read a job for the member polling it. Scoped to the requester by the
 * `REQUESTED_BY` edge — the person who submitted the sheet is the only one who
 * needs its progress, and their rows are not otherwise readable content. A job
 * belonging to somebody else is indistinguishable from one that does not exist.
 */
export async function readArticleImportJobForRequester(
  driver: Driver,
  jobId: string,
  userId: string
): Promise<ArticleImportJobSnapshot | null> {
  const session = driver.session()
  try {
    const result = await session.executeRead(async (tx) =>
      tx.run(
        `
        MATCH (j:ArticleImportJob {id: $jobId})-[:REQUESTED_BY]->(:Person {id: $userId})
        RETURN j.status AS status,
               j.statusMessage AS statusMessage,
               j.totalRows AS totalRows,
               coalesce(j.rowOutcomes, []) AS rowOutcomes
        LIMIT 1
        `,
        { jobId, userId }
      )
    )
    const record = result.records[0]
    if (!record) return null
    return {
      status: (record.get('status') as ArticleImportStatus) ??
        ARTICLE_IMPORT_STATUS.pending,
      statusMessage: (record.get('statusMessage') as string | null) ?? null,
      totalRows: Number(record.get('totalRows') ?? 0),
      outcomes: parseOutcomes(record.get('rowOutcomes')),
    }
  } finally {
    await session.close()
  }
}
