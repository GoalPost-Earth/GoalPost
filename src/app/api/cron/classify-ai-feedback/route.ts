/**
 * Vercel Scheduled Function: Classify AI Feedback
 * Runs daily at 03:00 UTC (offset from the resonance cron at 00:00).
 *
 * For every unclassified `AssistantFeedback` row in Neo4j, the job:
 *   1. Asks a strong LLM to classify the failure mode + write a
 *      one-sentence reason.
 *   2. Embeds the user question via text-embedding-3-small.
 *   3. Assigns a cluster id by nearest-neighbor lookup on the question
 *      embedding (cosine sim threshold 0.85), or mints a new cluster
 *      when nothing matches.
 *
 * Auth follows the existing `CRON_SECRET` Bearer-header pattern; in
 * dev (no secret set) the route is open so manual `curl` works.
 */

import { NextRequest, NextResponse } from 'next/server'
import { classifyUnclassifiedBatch } from '@/lib/feedback/llm-classify'

// Classification + embedding for ~25 rows can spike if individual
// `structuredOutput` calls drift toward the multi-second tail. 300s
// keeps headroom without burning the Pro 800s ceiling.
export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET(request: NextRequest) {
  try {
    // Fail-CLOSED (GOAL-347). This route runs an LLM classification batch, so
    // an unset secret would leave it an anonymous model-spend amplifier.
    // CRON_SECRET is set in all three Vercel environments; local runs need it
    // in .env.local.
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      console.warn(
        '[ClassifyFeedback Cron] Unauthorized cron request attempted'
      )
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log(
      '[ClassifyFeedback Cron] Starting feedback classification batch...'
    )

    const summary = await classifyUnclassifiedBatch()

    console.log(
      `[ClassifyFeedback Cron] ✓ Processed ${summary.processed} rows (${summary.succeeded} ok, ${summary.failed} failed)`
    )

    return NextResponse.json({
      success: true,
      processed: summary.processed,
      succeeded: summary.succeeded,
      failed: summary.failed,
      results: summary.results,
      timestamp: new Date().toISOString(),
    })
  } catch (error: unknown) {
    console.error(
      '[ClassifyFeedback Cron] Error during classification:',
      error
    )
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
