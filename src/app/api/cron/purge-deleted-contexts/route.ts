/**
 * Vercel Scheduled Function: Purge soft-deleted FieldContexts (GOAL-319)
 * Runs daily at 2am UTC (0 2 * * *) — between the resonance-discovery (0:00)
 * and feedback-classification (3:00) crons.
 *
 * Deleting a FieldContext soft-deletes it (deletedAt stamp + the Space edge
 * re-pointed to HAS_DELETED_CONTEXT, hiding the whole subtree from every
 * read surface). This job makes the deletion permanent once the 90-day
 * retention window has passed, cascading over every nested entity — see
 * `purgeDeletedFieldContexts` for the exact cascade rules.
 */

import { NextRequest, NextResponse } from 'next/server'
import { driver } from '@/lib/neo4j/driver'
import { createS3BlobStore } from '@/lib/ingest/s3-blob-store'
import { createMemoryBlobStore } from '@/lib/ingest/blob-store'
import { purgeDeletedFieldContexts } from '@/lib/field-context/purge-deleted-field-contexts'

// Vercel cron invocations are always GET. Purging is batched (one context
// per transaction, capped per run) but a run over large contexts can still
// take a while; 300s is the Pro plan ceiling.
export const dynamic = 'force-dynamic'
export const maxDuration = 300

function resolveBlobStore() {
  if (process.env.INGEST_BLOB_BACKEND === 'memory') {
    return createMemoryBlobStore()
  }
  return createS3BlobStore()
}

export async function GET(request: NextRequest) {
  try {
    // Verify this is a Vercel cron request
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.warn('[Purge Contexts Cron] Unauthorized cron request attempted')
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log(
      '[Purge Contexts Cron] Purging soft-deleted field contexts past retention...'
    )

    const result = await purgeDeletedFieldContexts({
      driver,
      blobStore: resolveBlobStore(),
    })

    for (const purged of result.purgedContexts) {
      console.log(
        `[Purge Contexts Cron] ✓ Purged "${purged.title}" (${purged.pulseCount} pulses, ` +
          `${purged.chunkCount} chunks, ${purged.linkCount} links, ` +
          `${purged.suggestionCount} suggestions, ${purged.weaveCount} weaves, ` +
          `${purged.documentCount} documents, ${purged.organizationCount} orphaned orgs)`
      )
    }
    console.log(
      `[Purge Contexts Cron] ✓ Completed: purged ${result.purgedContexts.length} context(s)`
    )

    return NextResponse.json({
      success: true,
      message: 'Purge of soft-deleted field contexts completed',
      purgedContextCount: result.purgedContexts.length,
      purgedContexts: result.purgedContexts,
      blobFailures: result.blobFailures,
      timestamp: new Date().toISOString(),
    })
  } catch (error: unknown) {
    console.error('[Purge Contexts Cron] Error during purge:', error)
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
