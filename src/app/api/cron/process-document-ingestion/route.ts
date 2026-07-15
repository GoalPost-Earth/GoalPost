/**
 * Vercel Scheduled Function: Process Document Ingestion (GOAL-292)
 *
 * Runs every minute (see vercel.json) so uploads feel close to real-time
 * without needing a dedicated queue service. Claims a batch of PENDING
 * Documents (atomically transitioning them to PROCESSING so an overlapping
 * run can't double-pick one — see `claimPendingDocuments`), then runs the
 * extraction + summarization + Neo4j entity-write pipeline for each,
 * attributed to the uploader captured at enqueue time
 * (`POST /api/ingest/document/process`), landing each Document in a
 * terminal COMPLETE/FAILED state.
 */

import { NextRequest, NextResponse } from 'next/server'
import { driver } from '@/lib/neo4j/driver'
import {
  claimPendingDocuments,
  markDocumentFailed,
} from '@/lib/ingest/document-storage'
import { processClaimedDocument } from '@/lib/ingest/handle-ingest-document'
import { createOpenAIExtractionModelClient } from '@/lib/ingest/openai-extraction-model-client'
import { createGeminiExtractionModelClient } from '@/lib/ingest/gemini-extraction-model-client'
import {
  createOpenAIDocumentSummarizer,
  createGeminiDocumentSummarizer,
} from '@/lib/ingest/document-summarizer'
import { createS3BlobStore } from '@/lib/ingest/s3-blob-store'
import { createMemoryBlobStore } from '@/lib/ingest/blob-store'

// Vercel cron invocations are always GET. A batch of documents each running
// their own LLM extraction + summarization can run for minutes; 300s is the
// Pro plan ceiling for serverless functions (same as discover-resonances).
export const dynamic = 'force-dynamic'
export const maxDuration = 300

// Bounded per run so one invocation can't monopolize every PENDING Document
// and starve a concurrent/overlapping run — the rest simply wait for the
// next minute's tick.
const BATCH_SIZE = 5

function resolveBlobStore() {
  if (process.env.INGEST_BLOB_BACKEND === 'memory') {
    return createMemoryBlobStore()
  }
  return createS3BlobStore()
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.warn('[Document Ingestion Cron] Unauthorized cron request attempted')
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const deps = {
    driver,
    blobStore: resolveBlobStore(),
    pdfExtractionClient: createGeminiExtractionModelClient(),
    textExtractionClient: createOpenAIExtractionModelClient(),
    pdfSummarizerClient: createGeminiDocumentSummarizer(),
    textSummarizerClient: createOpenAIDocumentSummarizer(),
  }

  const claimedIds = await claimPendingDocuments(driver, BATCH_SIZE)
  if (claimedIds.length === 0) {
    return NextResponse.json({ success: true, claimed: 0, processed: 0, failed: 0 })
  }

  console.log(
    `[Document Ingestion Cron] Claimed ${claimedIds.length} pending document(s): ${claimedIds.join(', ')}`
  )

  let processed = 0
  let failed = 0
  for (const documentId of claimedIds) {
    try {
      const result = await processClaimedDocument(deps, documentId)
      if (result.ok) {
        processed++
        console.log(`[Document Ingestion Cron] ✓ Processed ${documentId}`)
      } else {
        failed++
        console.error(
          `[Document Ingestion Cron] ✗ ${documentId} failed: ${result.error}`
        )
      }
    } catch (error) {
      // Defense in depth — processClaimedDocument already catches its own
      // errors and marks the Document FAILED. This only fires if something
      // throws outside that boundary, so still leave a clear failure record
      // rather than an orphaned PROCESSING row.
      failed++
      const message =
        error instanceof Error ? error.message : 'Unknown processing error.'
      console.error(
        `[Document Ingestion Cron] ✗ Unhandled error processing ${documentId}:`,
        error
      )
      await markDocumentFailed(driver, documentId, message).catch(() => {})
    }
  }

  return NextResponse.json({
    success: true,
    claimed: claimedIds.length,
    processed,
    failed,
  })
}
