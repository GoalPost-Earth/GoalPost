import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { driver } from '@/lib/neo4j/driver'
import { loadDocumentRecord } from '@/lib/ingest/document-storage'
import {
  claimDocumentForIngest,
  INGEST_UNEXPECTED_FAILURE_MESSAGE,
  findPendingDocumentIds,
  markDocumentIngestComplete,
  markDocumentIngestFailed,
  memberSafeIngestFailureMessage,
  reclaimStalledIngests,
} from '@/lib/ingest/document-ingest-queue'
import { userCanEditFieldContext } from '@/lib/ingest/handle-ingest-document'
import {
  countExecutedToolCalls,
  runDocumentIngestPipeline,
} from '@/lib/ingest/run-document-ingest-pipeline'
import { createGeminiExtractionModelClient } from '@/lib/ingest/gemini-extraction-model-client'
import { createOpenAIExtractionModelClient } from '@/lib/ingest/openai-extraction-model-client'
import {
  createGeminiDocumentSummarizer,
  createOpenAIDocumentSummarizer,
} from '@/lib/ingest/document-summarizer'
import { resolveIngestBlobStore } from '@/lib/ingest/resolve-blob-store'
import { runContextResonanceDiscovery } from '@/lib/resonance/discovery/on-upload-discovery'

/**
 * Vercel Scheduled Function: process queued document ingestion (GOAL-292).
 *
 * `POST /api/ingest/document/process` used to run the whole LLM pipeline inline
 * and was the source of every observed 504. It now anchors a PENDING Document
 * and returns 202; this worker does the heavy half — extraction,
 * summarization, and the entity writes — off the request path.
 *
 * Runs every minute so an upload feels near-real-time. Each invocation:
 *   1. Reclaims documents stranded in PROCESSING by a killed worker.
 *   2. Claims up to MAX_DOCUMENTS_PER_RUN PENDING documents, one at a time,
 *      via a conditional transition that is safe against overlapping runs.
 *   3. Runs the shared pipeline as the *persisted uploader* — the worker has no
 *      JWT, so authorization was decided and captured at enqueue time.
 *   4. Lands each document in COMPLETE or FAILED, then runs on-upload
 *      resonance discovery for contexts that gained entities.
 *
 * Documents are processed sequentially rather than in parallel: each one is
 * several LLM round-trips, and a burst of parallel Gemini/OpenAI calls inside a
 * single 300s function is the fastest way back to the timeouts this story
 * exists to remove. The per-document guard below stops claiming once the run is
 * close to the ceiling, leaving the rest for the next minute's invocation.
 */

export const dynamic = 'force-dynamic'
export const maxDuration = 300

/**
 * Upper bound per invocation. With a 1-minute schedule this drains 4 documents
 * a minute, and the time guard below cuts it short before the function ceiling.
 */
const MAX_DOCUMENTS_PER_RUN = 4

/**
 * Stop claiming new work once this much of the budget is spent, so the run
 * always has room to write a terminal status for the document in flight rather
 * than being killed mid-pipeline (which would leave it to the stale-claim
 * reclaim path).
 */
const CLAIM_DEADLINE_MS = 210_000


/**
 * Per-document line in the cron's response. Deliberately carries the document
 * id and not the filename: this body reports on documents across every Space,
 * and a filename is member content. Ids are already opaque server-minted
 * handles, and they are what an operator needs to look one up.
 */
interface ProcessedDocumentReport {
  documentId: string
  status: 'COMPLETE' | 'FAILED'
  createdEntityCount?: number
  failedEntityCount?: number
  reason?: string
}

export async function GET(request: NextRequest) {
  const startedAt = Date.now()
  try {
    // Fail CLOSED when the secret is unconfigured, following
    // /api/person/enrich rather than the older fail-open crons. This endpoint
    // drives Gemini/OpenAI spend and writes graph entities on behalf of
    // arbitrary users, and no user-facing surface calls it — an unset secret
    // must not make it anonymously triggerable. (Local runs therefore need
    // CRON_SECRET set in .env.local.)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      console.warn('[Ingest Cron] Unauthorized cron request attempted')
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // A run id makes it possible to tell from the graph which invocation owns
    // an in-flight claim when diagnosing a stuck document.
    const workerRunId = `ingest_run_${randomUUID().slice(0, 8)}`

    const reclaimed = await reclaimStalledIngests(driver)
    if (reclaimed.requeued > 0 || reclaimed.abandoned > 0) {
      console.warn(
        `[Ingest Cron] Reclaimed stalled ingests: ${reclaimed.requeued} requeued, ${reclaimed.abandoned} abandoned`
      )
    }

    // Over-fetch: with overlapping runs, fetching exactly the budget means a
    // tick can idle while work remains, because every candidate was already
    // claimed elsewhere. The loop stops after MAX_DOCUMENTS_PER_RUN successful
    // claims regardless.
    const candidateIds = await findPendingDocumentIds(
      driver,
      MAX_DOCUMENTS_PER_RUN * 2
    )
    if (candidateIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No documents awaiting ingestion.',
        processed: [],
        reclaimed,
        timestamp: new Date().toISOString(),
      })
    }

    const deps = {
      driver,
      blobStore: resolveIngestBlobStore(),
      pdfExtractionClient: createGeminiExtractionModelClient(),
      textExtractionClient: createOpenAIExtractionModelClient(),
      pdfSummarizerClient: createGeminiDocumentSummarizer(),
      textSummarizerClient: createOpenAIDocumentSummarizer(),
    }

    const processed: ProcessedDocumentReport[] = []
    // Contexts that gained entities this run, keyed by context id so five
    // documents in one field trigger one discovery sweep rather than five. The
    // value is the uploader to attribute the sweep to.
    const contextsToSweep = new Map<string, string>()
    let skippedForTime = 0
    let considered = 0
    let claimedCount = 0

    for (const documentId of candidateIds) {
      if (Date.now() - startedAt > CLAIM_DEADLINE_MS) {
        // Count what we never looked at, not what we failed to finish — a
        // document another worker claimed was considered, just not ours.
        skippedForTime = candidateIds.length - considered
        console.warn(
          `[Ingest Cron] Time budget reached — leaving ${skippedForTime} document(s) for the next run`
        )
        break
      }
      if (claimedCount >= MAX_DOCUMENTS_PER_RUN) break
      considered += 1

      const claimed = await claimDocumentForIngest(
        driver,
        documentId,
        workerRunId
      )
      // Another overlapping invocation got there first; its claim stands.
      if (!claimed) continue
      claimedCount += 1

      try {
        // The persisted uploader is the authorization decision captured at
        // enqueue time. The worker holds no request context, so every write in
        // the pipeline is attributed to them — never to the cron itself.
        const record = await loadDocumentRecord(driver, documentId)
        if (!record || !record.uploaderUserId) {
          await markDocumentIngestFailed({
            driver,
            documentId,
            workerRunId,
            statusMessage: INGEST_UNEXPECTED_FAILURE_MESSAGE,
          })
          console.error(
            `[Ingest Cron] Document ${documentId} has no single uploader — cannot attribute writes`
          )
          processed.push({
            documentId,
            status: 'FAILED',
            reason: 'missing_uploader',
          })
          continue
        }

        // Re-check the captured decision against the live graph. Enqueue may
        // have been minutes ago — longer if this document was requeued by the
        // reclaim path — and the uploader may since have been removed from the
        // Space or demoted to GUEST. Individual entity writes re-gate
        // themselves inside executeAuthorizedWriteTool, but the summary, the
        // page count and the ingest thread do not, and the LLM spend is
        // incurred either way. So stop here rather than part-way through.
        const stillAllowed = await userCanEditFieldContext(
          driver,
          record.uploaderUserId,
          record.fieldContextId
        )
        if (!stillAllowed) {
          await markDocumentIngestFailed({
            driver,
            documentId,
            workerRunId,
            statusMessage:
              'This document was not processed because the uploader no longer has permission to add content to this field.',
          })
          console.warn(
            `[Ingest Cron] Uploader lost canEditContent before ${documentId} was processed`
          )
          processed.push({
            documentId,
            status: 'FAILED',
            reason: 'uploader_no_longer_permitted',
          })
          continue
        }

        const run = await runDocumentIngestPipeline(deps, {
          documentId,
          actingUserId: record.uploaderUserId,
          userTurnVerb: 'Uploaded',
          record,
        })

        if (!run.ok) {
          await markDocumentIngestFailed({
            driver,
            documentId,
            workerRunId,
            // Most prepare-stage copy is authored and member-facing, but two
            // reasons interpolate untrusted text (the parser's own error, the
            // client's mimeType) and must not be persisted verbatim.
            statusMessage: memberSafeIngestFailureMessage(
              run.reason,
              run.error
            ),
          })
          processed.push({
            documentId,
            status: 'FAILED',
            reason: run.reason,
          })
          continue
        }

        const counts = countExecutedToolCalls(run.executedToolCalls)
        await markDocumentIngestComplete({
          driver,
          documentId,
          workerRunId,
          ...counts,
        })
        processed.push({
          documentId,
          status: 'COMPLETE',
          ...counts,
        })
        // Same trigger the synchronous route used: only a newly minted pulse or
        // person earns a discovery sweep. An update-only run has nothing new to
        // embed, and the sweep costs real OpenAI calls.
        const mintedPulseOrPerson = run.executedToolCalls.some(
          (call) =>
            (call.tool === 'create_pulse' || call.tool === 'create_person') &&
            call.result.success !== false
        )
        if (mintedPulseOrPerson) {
          contextsToSweep.set(run.fieldContextId, record.uploaderUserId)
        }
      } catch (error) {
        // Raw driver/model error text never reaches the member — log it here
        // and store fixed copy (kb/07 Rule 1). The Document and its blob both
        // survive, so Re-extract (GOAL-241) remains the recovery path.
        console.error(
          `[Ingest Cron] Unexpected failure ingesting document ${documentId}:`,
          error
        )
        await markDocumentIngestFailed({
          driver,
          documentId,
          workerRunId,
          statusMessage: INGEST_UNEXPECTED_FAILURE_MESSAGE,
        }).catch((markError) => {
          // If even the FAILED write fails the document stays PROCESSING and
          // the stale-claim reclaim will catch it on a later run.
          console.error(
            `[Ingest Cron] Could not mark document ${documentId} failed:`,
            markError
          )
        })
        processed.push({
          documentId,
          status: 'FAILED',
          reason: 'unexpected_error',
        })
      }
    }

    // On-upload resonance discovery (GOAL-294 / GOAL-318). Runs here, awaited,
    // rather than in a fire-and-forget `after()` on the request — that was the
    // other half of the durability problem: the sweep is what embeds new pulses
    // and PersonPulses so they surface in search before the nightly cron.
    for (const [contextId, actorUserId] of contextsToSweep) {
      try {
        await runContextResonanceDiscovery({ contextId, actorUserId })
      } catch (error) {
        // Never fail a completed ingest over the discovery pass — the nightly
        // resonance cron re-embeds anything missed here.
        console.error(
          `[Ingest Cron] Resonance discovery failed for context ${contextId}:`,
          error
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${processed.length} document(s).`,
      processed,
      reclaimed,
      skippedForTime,
      timestamp: new Date().toISOString(),
    })
  } catch (error: unknown) {
    // Log the real error; return fixed copy. The raw message can carry driver
    // internals and this body is not member-scoped.
    console.error('[Ingest Cron] Error during ingestion sweep:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Ingestion sweep failed. See server logs.',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
