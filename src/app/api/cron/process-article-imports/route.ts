import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { driver } from '@/lib/neo4j/driver'
import { initGraph } from '@/modules/graph'
import {
  IMPORT_PERMISSION_LOST_MESSAGE,
  IMPORT_UNEXPECTED_FAILURE_MESSAGE,
  appendArticleImportRowOutcome,
  claimArticleImportJob,
  findPendingArticleImportJobIds,
  loadArticleImportJob,
  markArticleImportJobComplete,
  markArticleImportJobFailed,
  purgeFinishedArticleImportJobs,
  reclaimStalledArticleImports,
  requeueArticleImportJob,
} from '@/lib/imports/article-import-queue'
import {
  loadEditableContext,
  processArticleImport,
} from '@/lib/imports/article-import-service'
import { runContextResonanceDiscovery } from '@/lib/resonance/discovery/on-upload-discovery'

/**
 * Vercel Scheduled Function: drain the bulk article import queue (GOAL-326).
 *
 * `POST /api/import/articles` used to walk all 300 rows inside the request,
 * which raced the serverless ceiling and gave a timeout-prone UX. It now
 * anchors an `:ArticleImportJob` as PENDING and answers 202; this worker mints
 * the pulses off the request path.
 *
 * Runs every minute so an import feels near-real-time. Each invocation:
 *   1. Reclaims jobs stranded in PROCESSING by a killed worker.
 *   2. Claims up to MAX_JOBS_PER_RUN PENDING jobs, one at a time, via a
 *      conditional transition that is safe against overlapping runs.
 *   3. Walks each job's rows as the *persisted requester* — the worker holds no
 *      JWT, so authorization was decided at enqueue time and captured on the
 *      REQUESTED_BY edge, then re-validated live here.
 *   4. Lands each job in COMPLETE / FAILED, or hands it back to the queue with
 *      its cursor intact when the run is out of time.
 *   5. Runs the embedding + resonance sweep for contexts that gained pulses —
 *      awaited here as a durable step, not fired at a dying request.
 *
 * Jobs are processed sequentially. Each row is several authorized graph writes,
 * and running batches in parallel inside one 300s function is the fastest way
 * back to the timeouts this story exists to remove.
 */

export const dynamic = 'force-dynamic'
export const maxDuration = 300

/**
 * Upper bound per invocation. Deliberately small: one 300-row job is already a
 * few hundred write round-trips, and the row deadline below usually stops a run
 * before it can reach a second job anyway.
 */
const MAX_JOBS_PER_RUN = 2

/**
 * Stop starting rows once this much of the budget is spent, hand the job back
 * to the queue, and let the next tick resume from its cursor. This is what
 * keeps a slow batch off the stalled-claim path entirely: a job that yields is
 * cleanly PENDING again a second later rather than invisible for 15 minutes.
 *
 * The remaining ~80s covers the terminal write plus the resonance sweep below.
 * A sweep cut short by the function ceiling costs nothing durable — the job is
 * already COMPLETE and the nightly resonance cron re-embeds whatever it missed
 * — so the budget is deliberately spent on rows, which are not recoverable that
 * cheaply.
 */
const ROW_DEADLINE_MS = 220_000

/**
 * Stop claiming NEW jobs earlier than that, so a run always has room to finish
 * (or cleanly yield) the job it already holds.
 */
const CLAIM_DEADLINE_MS = 180_000

/**
 * Per-job line in the cron's response. Carries the job id and counts only —
 * this body reports on imports across every Space, and row titles are member
 * content.
 */
interface ProcessedImportReport {
  jobId: string
  status: 'COMPLETE' | 'FAILED' | 'REQUEUED' | 'ABANDONED_CLAIM'
  processedRows?: number
  totalRows?: number
  reason?: string
}

export async function GET(request: NextRequest) {
  const startedAt = Date.now()
  try {
    // Fail CLOSED when the secret is unconfigured, following
    // /api/cron/process-document-ingestion. This endpoint writes graph entities
    // on behalf of arbitrary users and drives OpenAI spend through the
    // resonance sweep; no user-facing surface calls it, so an unset secret must
    // not make it anonymously triggerable. (Local runs need CRON_SECRET in
    // .env.local.)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      console.warn('[Import Cron] Unauthorized cron request attempted')
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // A run id makes it possible to tell from the graph which invocation owns
    // an in-flight claim when diagnosing a stuck import.
    const workerRunId = `import_run_${randomUUID().slice(0, 8)}`

    const reclaimed = await reclaimStalledArticleImports(driver)
    if (reclaimed.requeued > 0 || reclaimed.abandoned > 0) {
      console.warn(
        `[Import Cron] Reclaimed stalled imports: ${reclaimed.requeued} requeued, ${reclaimed.abandoned} abandoned`
      )
    }

    // Over-fetch: with overlapping runs, fetching exactly the budget means a
    // tick can idle while work remains because every candidate was already
    // claimed elsewhere. The loop stops after MAX_JOBS_PER_RUN claims anyway.
    const candidateIds = await findPendingArticleImportJobIds(
      driver,
      MAX_JOBS_PER_RUN * 2
    )
    if (candidateIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No article imports awaiting processing.',
        processed: [],
        reclaimed,
        timestamp: new Date().toISOString(),
      })
    }

    const graph = await initGraph()
    const processed: ProcessedImportReport[] = []
    // Contexts that gained pulses this run, keyed by context id so three jobs
    // into one field trigger one discovery sweep rather than three. The value
    // is the requester the sweep is attributed to.
    const contextsToSweep = new Map<string, string>()
    let claimedCount = 0
    let considered = 0
    let skippedForTime = 0

    for (const jobId of candidateIds) {
      if (Date.now() - startedAt > CLAIM_DEADLINE_MS) {
        // Report what was never looked at, not what failed — a job another
        // worker claimed was considered, just not ours. Without this a
        // persistently starved queue is indistinguishable from an empty one in
        // the logs (the ingest cron reports the same field).
        skippedForTime = candidateIds.length - considered
        console.warn(
          `[Import Cron] Time budget reached — leaving ${skippedForTime} job(s) for the next run`
        )
        break
      }
      if (claimedCount >= MAX_JOBS_PER_RUN) break
      considered += 1

      const claimed = await claimArticleImportJob(driver, jobId, workerRunId)
      // Another overlapping invocation got there first; its claim stands.
      if (!claimed) continue
      claimedCount += 1

      try {
        const job = await loadArticleImportJob(driver, jobId)
        if (!job) {
          // No payload, or an ambiguous requester/context — there is no safe
          // identity to attribute writes to, so refuse rather than guess.
          await markArticleImportJobFailed(driver, {
            jobId,
            workerRunId,
            statusMessage: IMPORT_UNEXPECTED_FAILURE_MESSAGE,
          })
          console.error(
            `[Import Cron] Job ${jobId} is not loadable (missing payload or ambiguous requester)`
          )
          processed.push({ jobId, status: 'FAILED', reason: 'unloadable_job' })
          continue
        }

        // Re-check the decision captured at enqueue. The gap can be minutes —
        // longer for a requeued job — and the requester may since have been
        // removed from the Space or demoted to GUEST. Every individual write
        // re-gates itself inside executeAuthorizedWriteTool, but failing 300
        // rows one at a time is a worse answer than stopping here.
        const context = await loadEditableContext(
          graph,
          job.requesterUserId,
          job.fieldContextId
        )
        if (!context.found || !context.allowed) {
          await markArticleImportJobFailed(driver, {
            jobId,
            workerRunId,
            statusMessage: IMPORT_PERMISSION_LOST_MESSAGE,
          })
          console.warn(
            `[Import Cron] Requester lost canEditContent before job ${jobId} ran`
          )
          processed.push({
            jobId,
            status: 'FAILED',
            reason: 'requester_no_longer_permitted',
          })
          continue
        }

        // The durable outcome list IS the cursor: one entry per processed row,
        // in row order, so its length is where to resume.
        const startIndex = job.outcomes.length
        const run = await processArticleImport({
          graph,
          currentUserId: job.requesterUserId,
          fieldContextId: job.fieldContextId,
          contextTitle: context.title,
          rows: job.rows,
          startIndex,
          onRowOutcome: (outcome) =>
            appendArticleImportRowOutcome(driver, {
              jobId,
              workerRunId,
              outcome,
            }),
          shouldYield: () => Date.now() - startedAt > ROW_DEADLINE_MS,
        })

        if (run.stopReason === 'lost_claim') {
          // Someone else owns this job now (it was reclaimed as stalled while
          // this run was mid-batch). Touch nothing — every terminal write is
          // fenced on the claim anyway — and deliberately do NOT register a
          // resonance sweep: the run that now owns the job will sweep when it
          // completes, and this one would only duplicate the OpenAI spend.
          console.warn(
            `[Import Cron] Job ${jobId} was re-claimed elsewhere mid-batch; stopping`
          )
          processed.push({
            jobId,
            status: 'ABANDONED_CLAIM',
            processedRows: run.outcomes.length,
            totalRows: job.totalRows,
          })
          continue
        }

        // Only a newly minted pulse or person earns a discovery sweep — the
        // sweep costs real OpenAI calls, and an all-skipped batch has nothing
        // new to embed. Checked across THIS run's outcomes; a resumed job that
        // minted nothing on this tick still gets swept by the tick that does.
        const mintedSomething = run.outcomes.some(
          (outcome) =>
            outcome.status === 'created' || outcome.personEvent === 'created'
        )
        if (mintedSomething) {
          contextsToSweep.set(job.fieldContextId, job.requesterUserId)
        }

        if (run.stopReason === 'yielded') {
          // Reset the attempt ceiling only when this tick actually landed rows.
          // A job claimed near the claim deadline can yield having processed
          // nothing, and resetting there would let it requeue forever.
          await requeueArticleImportJob(driver, {
            jobId,
            workerRunId,
            resetAttempts: run.outcomes.length > 0,
          })
          processed.push({
            jobId,
            status: 'REQUEUED',
            processedRows: startIndex + run.outcomes.length,
            totalRows: job.totalRows,
          })
          continue
        }

        await markArticleImportJobComplete(driver, { jobId, workerRunId })
        processed.push({
          jobId,
          status: 'COMPLETE',
          processedRows: job.totalRows,
          totalRows: job.totalRows,
        })
      } catch (error) {
        // Raw driver/Cypher error text never reaches the member — log it here
        // and persist fixed copy (kb/07 Rule 1). Rows already imported stay
        // imported and their outcomes stay visible.
        console.error(
          `[Import Cron] Unexpected failure processing import ${jobId}:`,
          error
        )
        await markArticleImportJobFailed(driver, {
          jobId,
          workerRunId,
          statusMessage: IMPORT_UNEXPECTED_FAILURE_MESSAGE,
        }).catch((markError) => {
          // If even the FAILED write fails the job stays PROCESSING and the
          // stale-claim reclaim catches it on a later run.
          console.error(
            `[Import Cron] Could not mark import ${jobId} failed:`,
            markError
          )
        })
        processed.push({ jobId, status: 'FAILED', reason: 'unexpected_error' })
      }
    }

    // Embedding + on-upload resonance discovery (GOAL-294 / GOAL-318). Awaited
    // here rather than fired from a `after()` on the request — that was the
    // other half of the durability problem: this sweep is what embeds the new
    // pulses and author PersonPulses so they surface in search and resonance
    // before the nightly cron.
    for (const [contextId, actorUserId] of contextsToSweep) {
      try {
        await runContextResonanceDiscovery({ contextId, actorUserId })
      } catch (error) {
        // Never fail a completed import over the discovery pass — the nightly
        // resonance cron re-embeds anything missed here.
        console.error(
          `[Import Cron] Resonance discovery failed for context ${contextId}:`,
          error
        )
      }
    }

    // Retention sweep for finished jobs. Cheap (two index seeks, capped), and
    // this is the only route that runs often enough to keep up with it.
    const purged = await purgeFinishedArticleImportJobs(driver).catch(
      (error) => {
        console.error('[Import Cron] Finished-job purge failed:', error)
        return 0
      }
    )

    return NextResponse.json({
      success: true,
      message: `Processed ${processed.length} import job(s).`,
      processed,
      reclaimed,
      skippedForTime,
      purged,
      timestamp: new Date().toISOString(),
    })
  } catch (error: unknown) {
    // Log the real error; return fixed copy. The raw message can carry driver
    // internals and this body is not member-scoped.
    console.error('[Import Cron] Error during import sweep:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Article import sweep failed. See server logs.',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
