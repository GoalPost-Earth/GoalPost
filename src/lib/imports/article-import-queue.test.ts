import { randomUUID } from 'node:crypto'
import { driver } from '@/lib/neo4j/driver'
import {
  ARTICLE_IMPORT_STATUS,
  type ArticleImportRowInput,
  type PersistedArticleRowOutcome,
} from './article-import'
import {
  IMPORT_ABANDONED_MESSAGE,
  IMPORT_FIELD_GONE_MESSAGE,
  MAX_IN_FLIGHT_ARTICLE_IMPORTS_PER_USER,
  MAX_ARTICLE_IMPORT_ATTEMPTS,
  STALE_PROCESSING_MINUTES,
  appendArticleImportRowOutcome,
  claimArticleImportJob,
  countInFlightArticleImportsForUser,
  createArticleImportJob,
  findPendingArticleImportJobIds,
  loadArticleImportJob,
  markArticleImportJobComplete,
  markArticleImportJobFailed,
  readArticleImportJobForRequester,
  reclaimStalledArticleImports,
  requeueArticleImportJob,
} from './article-import-queue'

/**
 * Integration test for the GOAL-326 bulk-article-import queue. Exercises the
 * real Neo4j driver against the dev Aura instance and skips itself when Neo4j
 * is unreachable (CI without NEO4J_*), the same shape as
 * `src/lib/ingest/document-ingest-queue.test.ts`.
 *
 * Run with the repo's own env wiring — `jest.config.js` uses
 * `setupFiles: ['dotenv/config']`, which loads `.env`, and this repo only has
 * `.env.local`:
 *
 *     npm test -- src/lib/imports/article-import-queue.test.ts
 *     # or: DOTENV_CONFIG_PATH=.env.local npx jest src/lib/imports/article-import-queue.test.ts
 *
 * A plain `npx jest` sees empty NEO4J_* and every assertion below self-skips.
 *
 * SHARED-DATABASE DISCIPLINE. The dev instance is shared and, once this ships,
 * `/api/cron/process-article-imports` runs against it every minute looking for
 * exactly the PENDING jobs this suite creates. So every fixture id is
 * namespaced with a per-run prefix, teardown first neutralises any survivor to
 * COMPLETE and only then deletes it, and teardown asserts nothing is left
 * behind. `findPendingArticleImportJobIds` and `reclaimStalledArticleImports`
 * are deliberately database-wide (that is what the worker calls), so assertions
 * filter to this run's prefix rather than assuming this suite owns the queue.
 */

let neo4jAvailable = false

const testRunId = `aiq_${randomUUID().slice(0, 8)}`
const prefix = `test_${testRunId}_`

const ids = {
  user: `${prefix}user`,
  otherUser: `${prefix}other`,
  meSpace: `${prefix}me`,
  fieldContext: `${prefix}ctx_live`,
  deletedFieldContext: `${prefix}ctx_deleted`,
}

function makeRows(count: number): ArticleImportRowInput[] {
  return Array.from({ length: count }, (_, index) => ({
    row: index + 2,
    title: `Row ${index + 2}`,
    author: 'Amara Osei',
    date: '2026-05-14',
    url: `https://example.org/articles/${index + 2}`,
    pulseType: 'ResourcePulse' as const,
  }))
}

function makeOutcome(row: number): PersistedArticleRowOutcome {
  return {
    row,
    title: `Row ${row}`,
    status: 'created',
    message: 'Created.',
    personEvent: row === 2 ? 'created' : undefined,
  }
}

interface CreateJobOptions {
  key: string
  rowCount?: number
  fieldContextId?: string
  requesterUserId?: string
  status?: string
  /** Drives the stale-claim window in `reclaimStalledArticleImports`. */
  statusMinutesAgo?: number
  attempts?: number
  claimedBy?: string | null
  /** Drives the `ORDER BY createdAt ASC` fairness assertion. */
  createdMinutesAgo?: number
}

async function createJob(options: CreateJobOptions): Promise<string> {
  const jobId = `${prefix}job_${options.key}`
  const created = await createArticleImportJob(driver, {
    jobId,
    fieldContextId: options.fieldContextId ?? ids.fieldContext,
    requesterUserId: options.requesterUserId ?? ids.user,
    rows: makeRows(options.rowCount ?? 2),
  })
  // The enqueue now enforces the in-flight cap itself, so a fixture that trips
  // it would otherwise surface as a baffling "job not found" further down.
  if (!created.created) {
    throw new Error(
      `createJob: ${jobId} was refused by the in-flight cap (${created.inFlight} in flight) — a previous test leaked fixtures`
    )
  }

  // Everything the enqueue path deliberately does not let a caller set is
  // back-dated here so the reclaim / fairness paths have something to bite on.
  const session = driver.session()
  try {
    await session.executeWrite((tx) =>
      tx.run(
        `
        MATCH (j:ArticleImportJob {id: $jobId})
        SET j.status = $status,
            j.attempts = $attempts,
            j.claimedBy = $claimedBy,
            j.createdAt = datetime() - duration({minutes: $createdMinutesAgo}),
            j.statusUpdatedAt = datetime() - duration({minutes: $statusMinutesAgo})
        `,
        {
          jobId,
          status: options.status ?? ARTICLE_IMPORT_STATUS.pending,
          attempts: options.attempts ?? 0,
          claimedBy: options.claimedBy ?? null,
          createdMinutesAgo: options.createdMinutesAgo ?? 0,
          statusMinutesAgo: options.statusMinutesAgo ?? 0,
        }
      )
    )
  } finally {
    await session.close()
  }
  return jobId
}

interface JobState {
  status: string | null
  statusMessage: string | null
  attempts: number
  claimedBy: string | null
  rowsJson: string | null
  outcomeCount: number
}

async function readJobState(jobId: string): Promise<JobState> {
  const session = driver.session()
  try {
    const result = await session.executeRead((tx) =>
      tx.run(
        `
        MATCH (j:ArticleImportJob {id: $jobId})
        RETURN j.status AS status,
               j.statusMessage AS statusMessage,
               coalesce(j.attempts, 0) AS attempts,
               j.claimedBy AS claimedBy,
               j.rowsJson AS rowsJson,
               size(coalesce(j.rowOutcomes, [])) AS outcomeCount
        `,
        { jobId }
      )
    )
    const record = result.records[0]
    if (!record) throw new Error(`readJobState: ${jobId} not found`)
    return {
      status: record.get('status') as string | null,
      statusMessage: record.get('statusMessage') as string | null,
      attempts: Number(record.get('attempts')),
      claimedBy: record.get('claimedBy') as string | null,
      rowsJson: record.get('rowsJson') as string | null,
      outcomeCount: Number(record.get('outcomeCount')),
    }
  } finally {
    await session.close()
  }
}

/** Drop fixture jobs as soon as the test needing them is done, so a PENDING
 *  fixture is never visible to the every-minute worker for long. */
async function deleteJobs(jobIds: string[]): Promise<void> {
  const session = driver.session()
  try {
    await session.executeWrite((tx) =>
      tx.run(
        `
        MATCH (j:ArticleImportJob)
        WHERE j.id IN $jobIds
        DETACH DELETE j
        `,
        { jobIds }
      )
    )
  } finally {
    await session.close()
  }
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
      CREATE (u:Person:User {id: $userId, firstName: 'Test', lastName: 'Importer', name: 'Test Importer', createdAt: datetime()})
      CREATE (o:Person:User {id: $otherUserId, firstName: 'Other', lastName: 'Member', name: 'Other Member', createdAt: datetime()})
      CREATE (s:Space:MeSpace {id: $spaceId, name: 'Test MeSpace', visibility: 'PRIVATE', createdAt: datetime()})
      CREATE (c:FieldContext {id: $ctxId, title: 'Import Queue', createdAt: datetime()})
      CREATE (u)-[:OWNS]->(s)
      CREATE (s)-[:HAS_CONTEXT]->(c)
      // GOAL-319 soft delete: the edge is re-pointed and deletedAt stamped.
      CREATE (dc:FieldContext {id: $deletedCtxId, title: 'Retired Field', createdAt: datetime(), deletedAt: datetime()})
      CREATE (s)-[:HAS_DELETED_CONTEXT]->(dc)
      `,
      {
        userId: ids.user,
        otherUserId: ids.otherUser,
        spaceId: ids.meSpace,
        ctxId: ids.fieldContext,
        deletedCtxId: ids.deletedFieldContext,
      }
    )
  } finally {
    await session.close()
  }
})

afterAll(async () => {
  if (!neo4jAvailable) {
    await driver.close()
    return
  }
  const session = driver.session()
  try {
    // Step 1 — neutralise before deleting. A leftover PENDING job would be
    // claimed by the real worker and processed against fixture rows. Parking
    // everything in COMPLETE first makes that impossible regardless of what
    // happens next.
    await session.run(
      `
      MATCH (j:ArticleImportJob)
      WHERE j.id STARTS WITH $prefix
      SET j.status = $complete, j.claimedBy = null
      `,
      { prefix, complete: ARTICLE_IMPORT_STATUS.complete }
    )

    // Step 2 — drop every node this run minted, whatever its label.
    await session.run(
      `
      MATCH (n)
      WHERE n.id STARTS WITH $prefix
      DETACH DELETE n
      `,
      { prefix }
    )

    // Step 3 — prove the shared instance is clean again.
    const leftovers = await session.run(
      `
      MATCH (n)
      WHERE n.id STARTS WITH $prefix
      RETURN n.id AS id
      `,
      { prefix }
    )
    const leaked = leftovers.records.map((record) => record.get('id') as string)
    if (leaked.length > 0) {
      throw new Error(
        `article-import-queue.test leaked ${leaked.length} fixture node(s): ${leaked.join(', ')}`
      )
    }
  } finally {
    await session.close()
    await driver.close()
  }
})

/**
 * Neo4j reachability is only known once `beforeAll` has run, which is after
 * every `describe` body is evaluated — so tests always register and bail from
 * the inside.
 */
function neo4jReady(): boolean {
  if (!neo4jAvailable) {
    console.warn(
      '[article-import-queue.test] Skipping integration assertions — Neo4j unreachable'
    )
    return false
  }
  return true
}

describe('claimArticleImportJob', () => {
  it('reports whether the integration assertions actually ran', () => {
    if (!neo4jReady()) return
    expect(neo4jAvailable).toBe(true)
  })

  it('lets exactly one of 8 racing workers win, incrementing attempts once', async () => {
    if (!neo4jReady()) return
    const jobId = await createJob({ key: 'race' })
    const workerRunIds = Array.from(
      { length: 8 },
      (_, index) => `${prefix}worker_${index}`
    )

    // The point of the write-then-guard shape: without the lock-forcing SET
    // ahead of the status guard, Neo4j's read-committed isolation lets every
    // overlapping claim win and the whole batch runs N times.
    const results = await Promise.all(
      workerRunIds.map((workerRunId) =>
        claimArticleImportJob(driver, jobId, workerRunId)
      )
    )

    expect(results.filter(Boolean)).toHaveLength(1)
    const state = await readJobState(jobId)
    expect(state.status).toBe(ARTICLE_IMPORT_STATUS.processing)
    expect(state.attempts).toBe(1)
    expect(workerRunIds).toContain(state.claimedBy)

    await deleteJobs([jobId])
  })

  it('refuses a job that is not PENDING', async () => {
    if (!neo4jReady()) return
    const jobId = await createJob({
      key: 'not_pending',
      status: ARTICLE_IMPORT_STATUS.complete,
    })

    await expect(
      claimArticleImportJob(driver, jobId, `${prefix}late_worker`)
    ).resolves.toBe(false)

    await deleteJobs([jobId])
  })
})

describe('findPendingArticleImportJobIds', () => {
  it('returns PENDING jobs oldest-first and skips soft-deleted contexts', async () => {
    if (!neo4jReady()) return
    const newer = await createJob({ key: 'fair_new', createdMinutesAgo: 1 })
    const older = await createJob({ key: 'fair_old', createdMinutesAgo: 30 })
    const hidden = await createJob({
      key: 'fair_deleted_ctx',
      fieldContextId: ids.deletedFieldContext,
    })
    const processing = await createJob({
      key: 'fair_processing',
      status: ARTICLE_IMPORT_STATUS.processing,
    })

    const found = await findPendingArticleImportJobIds(driver, 100)
    const mine = found.filter((id) => id.startsWith(prefix))

    expect(mine).toEqual([older, newer])
    expect(mine).not.toContain(hidden)
    expect(mine).not.toContain(processing)

    await deleteJobs([newer, older, hidden, processing])
  })
})

describe('per-row outcomes and the resume cursor', () => {
  it('appends in row order and resumes from the outcome count', async () => {
    if (!neo4jReady()) return
    const jobId = await createJob({ key: 'resume', rowCount: 5 })
    const workerRunId = `${prefix}worker_resume`
    await claimArticleImportJob(driver, jobId, workerRunId)

    for (const row of [2, 3]) {
      await expect(
        appendArticleImportRowOutcome(driver, {
          jobId,
          workerRunId,
          outcome: makeOutcome(row),
        })
      ).resolves.toBe(true)
    }

    // A worker crash lands here: the job is reclaimed, re-claimed, and reloaded.
    const reloaded = await loadArticleImportJob(driver, jobId)
    expect(reloaded).not.toBeNull()
    expect(reloaded?.rows).toHaveLength(5)
    // The cursor IS the outcome count — the next tick starts at row index 2.
    expect(reloaded?.outcomes.map((outcome) => outcome.row)).toEqual([2, 3])
    expect(reloaded?.fieldContextId).toBe(ids.fieldContext)
    expect(reloaded?.requesterUserId).toBe(ids.user)

    await deleteJobs([jobId])
  })

  it('rejects an append from a run that no longer holds the claim', async () => {
    if (!neo4jReady()) return
    const jobId = await createJob({ key: 'fence' })
    const zombie = `${prefix}worker_zombie`
    const winner = `${prefix}worker_winner`
    await claimArticleImportJob(driver, jobId, zombie)

    // The stalled-claim path hands the job to a different run.
    await requeueArticleImportJob(driver, { jobId, workerRunId: zombie, resetAttempts: true })
    await claimArticleImportJob(driver, jobId, winner)

    // The zombie must be told to stop rather than silently double-writing rows
    // alongside the new claimant.
    await expect(
      appendArticleImportRowOutcome(driver, {
        jobId,
        workerRunId: zombie,
        outcome: makeOutcome(2),
      })
    ).resolves.toBe(false)
    await expect(readJobState(jobId)).resolves.toMatchObject({
      outcomeCount: 0,
    })

    await deleteJobs([jobId])
  })
})

describe('terminal and requeue transitions', () => {
  it('COMPLETE clears the claim and drops the stored payload', async () => {
    if (!neo4jReady()) return
    const jobId = await createJob({ key: 'complete' })
    const workerRunId = `${prefix}worker_complete`
    await claimArticleImportJob(driver, jobId, workerRunId)

    await markArticleImportJobComplete(driver, { jobId, workerRunId })

    await expect(readJobState(jobId)).resolves.toMatchObject({
      status: ARTICLE_IMPORT_STATUS.complete,
      statusMessage: null,
      claimedBy: null,
      rowsJson: null,
    })

    await deleteJobs([jobId])
  })

  it('FAILED persists member-safe copy', async () => {
    if (!neo4jReady()) return
    const jobId = await createJob({ key: 'failed' })
    const workerRunId = `${prefix}worker_failed`
    await claimArticleImportJob(driver, jobId, workerRunId)

    await markArticleImportJobFailed(driver, {
      jobId,
      workerRunId,
      statusMessage: 'Nope.',
    })

    await expect(readJobState(jobId)).resolves.toMatchObject({
      status: ARTICLE_IMPORT_STATUS.failed,
      statusMessage: 'Nope.',
      claimedBy: null,
    })

    await deleteJobs([jobId])
  })

  it('a stale run cannot stomp the status of the attempt that replaced it', async () => {
    if (!neo4jReady()) return
    const jobId = await createJob({ key: 'stomp' })
    const stale = `${prefix}worker_stale`
    const current = `${prefix}worker_current`
    await claimArticleImportJob(driver, jobId, stale)
    await requeueArticleImportJob(driver, { jobId, workerRunId: stale, resetAttempts: true })
    await claimArticleImportJob(driver, jobId, current)

    await markArticleImportJobFailed(driver, {
      jobId,
      workerRunId: stale,
      statusMessage: 'stale failure',
    })

    // Still owned by the current run, still PROCESSING.
    await expect(readJobState(jobId)).resolves.toMatchObject({
      status: ARTICLE_IMPORT_STATUS.processing,
      claimedBy: current,
      statusMessage: null,
    })

    await deleteJobs([jobId])
  })

  it('a voluntary requeue keeps the payload and resets attempts', async () => {
    if (!neo4jReady()) return
    const jobId = await createJob({ key: 'yield', attempts: 2 })
    const workerRunId = `${prefix}worker_yield`
    await claimArticleImportJob(driver, jobId, workerRunId)
    await appendArticleImportRowOutcome(driver, {
      jobId,
      workerRunId,
      outcome: makeOutcome(2),
    })

    await requeueArticleImportJob(driver, { jobId, workerRunId, resetAttempts: true })

    const state = await readJobState(jobId)
    expect(state.status).toBe(ARTICLE_IMPORT_STATUS.pending)
    expect(state.claimedBy).toBeNull()
    // Progress proves the job is not poison, so the attempt ceiling resets —
    // otherwise a long import spanning four ticks would be abandoned.
    expect(state.attempts).toBe(0)
    expect(state.rowsJson).not.toBeNull()
    expect(state.outcomeCount).toBe(1)

    await deleteJobs([jobId])
  })
})

describe('reclaimStalledArticleImports', () => {
  it('requeues a stalled claim under the attempt ceiling', async () => {
    if (!neo4jReady()) return
    const jobId = await createJob({
      key: 'stalled',
      status: ARTICLE_IMPORT_STATUS.processing,
      statusMinutesAgo: STALE_PROCESSING_MINUTES + 1,
      attempts: 1,
      claimedBy: `${prefix}dead_worker`,
    })

    const result = await reclaimStalledArticleImports(driver)
    expect(result.requeued).toBeGreaterThanOrEqual(1)

    await expect(readJobState(jobId)).resolves.toMatchObject({
      status: ARTICLE_IMPORT_STATUS.pending,
      statusMessage: null,
      claimedBy: null,
    })
    // The payload survives so the retry resumes rather than restarting.
    const state = await readJobState(jobId)
    expect(state.rowsJson).not.toBeNull()

    await deleteJobs([jobId])
  })

  it('abandons a claim that has burned the attempt ceiling', async () => {
    if (!neo4jReady()) return
    const jobId = await createJob({
      key: 'abandoned',
      status: ARTICLE_IMPORT_STATUS.processing,
      statusMinutesAgo: STALE_PROCESSING_MINUTES + 1,
      attempts: MAX_ARTICLE_IMPORT_ATTEMPTS,
      claimedBy: `${prefix}dead_worker`,
    })

    const result = await reclaimStalledArticleImports(driver)
    expect(result.abandoned).toBeGreaterThanOrEqual(1)

    await expect(readJobState(jobId)).resolves.toMatchObject({
      status: ARTICLE_IMPORT_STATUS.failed,
      statusMessage: IMPORT_ABANDONED_MESSAGE,
      claimedBy: null,
      rowsJson: null,
    })

    await deleteJobs([jobId])
  })

  it('leaves a PROCESSING job whose clock is fresh alone', async () => {
    if (!neo4jReady()) return
    const jobId = await createJob({
      key: 'fresh',
      status: ARTICLE_IMPORT_STATUS.processing,
      statusMinutesAgo: 1,
      claimedBy: `${prefix}live_worker`,
    })

    await reclaimStalledArticleImports(driver)

    await expect(readJobState(jobId)).resolves.toMatchObject({
      status: ARTICLE_IMPORT_STATUS.processing,
      claimedBy: `${prefix}live_worker`,
    })

    await deleteJobs([jobId])
  })
})

describe('countInFlightArticleImportsForUser', () => {
  it('counts only what the drain can reach, for this user', async () => {
    if (!neo4jReady()) return
    const pending = await createJob({ key: 'cap_pending' })
    const processing = await createJob({
      key: 'cap_processing',
      status: ARTICLE_IMPORT_STATUS.processing,
    })
    const done = await createJob({
      key: 'cap_done',
      status: ARTICLE_IMPORT_STATUS.complete,
    })
    // A job under a soft-deleted context is never drained, so counting it would
    // hold a slot against the member until the 90-day purge.
    const hidden = await createJob({
      key: 'cap_hidden',
      fieldContextId: ids.deletedFieldContext,
    })
    const someoneElse = await createJob({
      key: 'cap_other_user',
      requesterUserId: ids.otherUser,
    })

    await expect(
      countInFlightArticleImportsForUser(driver, ids.user)
    ).resolves.toBe(2)
    await expect(
      countInFlightArticleImportsForUser(driver, ids.otherUser)
    ).resolves.toBe(1)

    await deleteJobs([pending, processing, done, hidden, someoneElse])
  })
})

describe('the in-flight cap', () => {
  it('is enforced by the enqueue write itself, not by a prior read', async () => {
    if (!neo4jReady()) return
    const created: string[] = []
    for (let index = 0; index < MAX_IN_FLIGHT_ARTICLE_IMPORTS_PER_USER; index++) {
      created.push(await createJob({ key: `cap_fill_${index}` }))
    }

    // The (N+1)th must be refused — and refused *inside* the write, so N
    // concurrent callers cannot all read zero-in-flight and all enqueue.
    const overflow = await createArticleImportJob(driver, {
      jobId: `${prefix}job_cap_overflow`,
      fieldContextId: ids.fieldContext,
      requesterUserId: ids.user,
      rows: makeRows(1),
    })
    expect(overflow.created).toBe(false)
    expect(overflow.inFlight).toBe(MAX_IN_FLIGHT_ARTICLE_IMPORTS_PER_USER)

    // Nothing was written for the rejected job.
    const session = driver.session()
    try {
      const check = await session.executeRead((tx) =>
        tx.run(
          `MATCH (j:ArticleImportJob {id: $jobId}) RETURN count(j) AS n`,
          { jobId: `${prefix}job_cap_overflow` }
        )
      )
      expect(Number(check.records[0].get('n'))).toBe(0)
    } finally {
      await session.close()
    }

    // A different account is unaffected.
    const otherJob = await createArticleImportJob(driver, {
      jobId: `${prefix}job_cap_other`,
      fieldContextId: ids.fieldContext,
      requesterUserId: ids.otherUser,
      rows: makeRows(1),
    })
    expect(otherJob.created).toBe(true)

    await deleteJobs([...created, `${prefix}job_cap_other`])
  })

  it('refuses concurrent enqueues past the cap rather than letting them race', async () => {
    if (!neo4jReady()) return
    // The whole point of doing the count inside the write: fired together,
    // every one of these would otherwise read zero in flight and commit.
    const attempts = await Promise.all(
      Array.from({ length: 8 }, (_, index) =>
        createArticleImportJob(driver, {
          jobId: `${prefix}job_race_cap_${index}`,
          fieldContextId: ids.fieldContext,
          requesterUserId: ids.user,
          rows: makeRows(1),
        })
      )
    )

    const landed = attempts.filter((attempt) => attempt.created).length
    expect(landed).toBeLessThanOrEqual(MAX_IN_FLIGHT_ARTICLE_IMPORTS_PER_USER)
    await expect(
      countInFlightArticleImportsForUser(driver, ids.user)
    ).resolves.toBeLessThanOrEqual(MAX_IN_FLIGHT_ARTICLE_IMPORTS_PER_USER)

    await deleteJobs(
      Array.from({ length: 8 }, (_, index) => `${prefix}job_race_cap_${index}`)
    )
  })
})

describe('stranded PENDING jobs', () => {
  it('fails a PENDING job whose context was soft-deleted after enqueue', async () => {
    if (!neo4jReady()) return
    // Nothing else can move this job: the drain skips it, the in-flight count
    // skips it, and the stale sweep only matches PROCESSING. Without this
    // branch the member's modal polls "Queued" forever.
    const jobId = await createJob({ key: 'stranded_pending' })
    const session = driver.session()
    try {
      await session.executeWrite((tx) =>
        tx.run(
          `
          MATCH (s:Space)-[rel:HAS_CONTEXT]->(c:FieldContext {id: $ctxId})
          SET c.deletedAt = datetime()
          CREATE (s)-[:HAS_DELETED_CONTEXT]->(c)
          DELETE rel
          `,
          { ctxId: ids.fieldContext }
        )
      )

      await reclaimStalledArticleImports(driver)
      await expect(readJobState(jobId)).resolves.toMatchObject({
        status: ARTICLE_IMPORT_STATUS.failed,
        statusMessage: IMPORT_FIELD_GONE_MESSAGE,
        rowsJson: null,
      })
    } finally {
      // Restore the live edge for the suites that follow.
      await session.executeWrite((tx) =>
        tx.run(
          `
          MATCH (s:Space)-[rel:HAS_DELETED_CONTEXT]->(c:FieldContext {id: $ctxId})
          REMOVE c.deletedAt
          CREATE (s)-[:HAS_CONTEXT]->(c)
          DELETE rel
          `,
          { ctxId: ids.fieldContext }
        )
      )
      await session.close()
    }
    await deleteJobs([jobId])
  })
})

describe('readArticleImportJobForRequester', () => {
  it('returns the snapshot for the requester and nothing for anyone else', async () => {
    if (!neo4jReady()) return
    const jobId = await createJob({ key: 'read', rowCount: 3 })
    const workerRunId = `${prefix}worker_read`
    await claimArticleImportJob(driver, jobId, workerRunId)
    await appendArticleImportRowOutcome(driver, {
      jobId,
      workerRunId,
      outcome: makeOutcome(2),
    })

    const snapshot = await readArticleImportJobForRequester(
      driver,
      jobId,
      ids.user
    )
    expect(snapshot).toMatchObject({
      status: ARTICLE_IMPORT_STATUS.processing,
      totalRows: 3,
    })
    expect(snapshot?.outcomes).toHaveLength(1)

    // A job that belongs to someone else must be indistinguishable from one
    // that does not exist.
    await expect(
      readArticleImportJobForRequester(driver, jobId, ids.otherUser)
    ).resolves.toBeNull()

    await deleteJobs([jobId])
  })
})
