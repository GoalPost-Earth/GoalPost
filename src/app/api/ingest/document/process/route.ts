import { after } from 'next/server'
import { driver } from '@/lib/neo4j/driver'
import { resolveAuthenticatedUserId } from '@/app/api/auth/utils'
import { handleIngestDocument } from '@/lib/ingest/handle-ingest-document'
import { runContextResonanceDiscovery } from '@/lib/resonance/discovery/on-upload-discovery'
import { createOpenAIExtractionModelClient } from '@/lib/ingest/openai-extraction-model-client'
import { createGeminiExtractionModelClient } from '@/lib/ingest/gemini-extraction-model-client'
import {
  createOpenAIDocumentSummarizer,
  createGeminiDocumentSummarizer,
} from '@/lib/ingest/document-summarizer'
import { createS3BlobStore } from '@/lib/ingest/s3-blob-store'
import { createMemoryBlobStore } from '@/lib/ingest/blob-store'

/**
 * Step 2 of the direct-to-S3 upload flow.
 *
 *   POST /api/ingest/document/process
 *   { documentId, blobKey, fieldContextId, filename, mimeType, sizeBytes, hint? }
 *
 * Called once the browser has finished PUT-ing the file to S3 via the
 * URL handed back by `/presign`. The orchestrator anchors the Document
 * node, mints a fresh presigned GET URL, and routes to Gemini (PDF) or
 * OpenAI (text) for entity extraction + summarization.
 *
 * The orchestrator never holds the file bytes. `maxDuration` is raised to the
 * Pro-plan ceiling (300s) as a stopgap for large documents whose Gemini/OpenAI
 * extraction + summarization was blowing past 60s and returning 504s. The
 * durable fix is to make ingestion asynchronous (enqueue + background job) so
 * the request no longer holds the full pipeline — tracked in GOAL-292.
 */

export const maxDuration = 300

function unauthorized(message = 'Authentication required') {
  return Response.json({ error: message }, { status: 401 })
}

function badRequest(message: string, reason?: string) {
  return Response.json(reason ? { error: message, reason } : { error: message }, {
    status: 400,
  })
}

function resolveBlobStore() {
  if (process.env.INGEST_BLOB_BACKEND === 'memory') {
    return createMemoryBlobStore()
  }
  return createS3BlobStore()
}

// The presign step mints keys as `documents/document_<uuid>/<sanitized-name>`.
// Reject anything that doesn't match that server-issued shape before it
// reaches the blob store — defense in depth against a forged/traversal key.
// (Note: this is a shape check, not an ownership check; the document UUID is
// server-minted and unguessable, but binding the key to the uploader at
// presign time is a tracked follow-up.)
const BLOB_KEY_PATTERN = /^documents\/document_[0-9a-f-]{36}\/[^/]+$/i

function isValidBlobKey(key: string): boolean {
  return BLOB_KEY_PATTERN.test(key)
}

export async function POST(req: Request) {
  const currentUserId = resolveAuthenticatedUserId(req)
  if (!currentUserId) return unauthorized()

  let body: {
    documentId?: unknown
    blobKey?: unknown
    fieldContextId?: unknown
    filename?: unknown
    mimeType?: unknown
    sizeBytes?: unknown
    hint?: unknown
  }
  try {
    body = await req.json()
  } catch {
    return badRequest('Expected JSON body.')
  }

  const blobKey = String(body.blobKey ?? '').trim()
  const fieldContextId = String(body.fieldContextId ?? '').trim()
  const filename = String(body.filename ?? '').trim()
  const mimeType = String(body.mimeType ?? '').trim().toLowerCase()
  const sizeBytes = Number(body.sizeBytes ?? 0)
  const hintRaw = typeof body.hint === 'string' ? body.hint.trim() : ''
  const hint = hintRaw.length > 0 ? hintRaw : null

  if (!blobKey) return badRequest('blobKey is required.')
  if (!isValidBlobKey(blobKey)) return badRequest('Invalid blobKey.')
  if (!fieldContextId) return badRequest('fieldContextId is required.')
  if (!filename) return badRequest('filename is required.')
  if (!mimeType) return badRequest('mimeType is required.')
  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
    return badRequest('sizeBytes must be a positive number.')
  }

  const result = await handleIngestDocument(
    {
      driver,
      blobStore: resolveBlobStore(),
      pdfExtractionClient: createGeminiExtractionModelClient(),
      textExtractionClient: createOpenAIExtractionModelClient(),
      pdfSummarizerClient: createGeminiDocumentSummarizer(),
      textSummarizerClient: createOpenAIDocumentSummarizer(),
    },
    {
      currentUserId,
      fieldContextId,
      filename,
      mimeType,
      blobKey,
      sizeBytes,
      hint,
    }
  )

  if (!result.ok) {
    const status =
      result.reason === 'forbidden'
        ? 403
        : result.reason === 'blob_missing'
          ? 404
          : 400
    return Response.json({ error: result.error, reason: result.reason }, { status })
  }

  const createdEntityCount = result.executedToolCalls.filter(
    (c) => c.result.success !== false
  ).length
  const failedEntityCount = result.executedToolCalls.length - createdEntityCount

  // On-upload resonance discovery (GOAL-294). Trigger only when the upload
  // actually created a pulse OR a person — discovery over a context with
  // nothing new is wasted work. A new person triggers too (GOAL-318): an
  // update-only run can still mint the document's author, and the discovery
  // pass is what embeds that PersonPulse at upload time (Step 1b) instead of
  // waiting for the nightly cron. Scheduled via `after()` so the (potentially
  // minute-long) embed + LLM analysis runs AFTER the upload response is sent,
  // without blocking the user and without the dropped-floating-promise risk
  // of a bare fire-and-forget (the platform keeps the invocation alive up to
  // `maxDuration`). `runContextResonanceDiscovery` never throws, is
  // Space-scoped, and dedups so repeated uploads don't duplicate suggestions.
  const createdAPulseOrPerson = result.executedToolCalls.some(
    (c) =>
      (c.tool === 'create_pulse' || c.tool === 'create_person') &&
      c.result.success !== false
  )
  if (createdAPulseOrPerson) {
    after(async () => {
      await runContextResonanceDiscovery({
        contextId: fieldContextId,
        actorUserId: currentUserId,
      })
    })
  }

  return Response.json({
    documentId: result.documentId,
    threadId: result.threadId,
    createdEntityCount,
    failedEntityCount,
  })
}
