import { driver } from '@/lib/neo4j/driver'
import { resolveAuthenticatedUserId } from '@/app/api/auth/utils'
import { enqueueDocumentIngest } from '@/lib/ingest/handle-ingest-document'
import { DOCUMENT_INGEST_STATUS } from '@/lib/ingest/document-ingest-queue'
import { kickQueueWorker } from '@/lib/jobs/kick-queue-worker'

/**
 * Step 2 of the direct-to-S3 upload flow.
 *
 *   POST /api/ingest/document/process
 *   { blobKey, fieldContextId, filename, mimeType, sizeBytes, hint? }
 *   → 202 { documentId, status: 'PENDING' }
 *
 * Called once the browser has finished PUT-ing the file to S3 via the URL
 * handed back by `/presign`.
 *
 * GOAL-292: this used to run the entire pipeline inline — fetch the blob back,
 * LLM entity extraction, LLM summarization, Neo4j entity writes — which is
 * where every observed 504 came from. `maxDuration = 300` was the stopgap; this
 * is the durable fix. The request now only validates, enforces
 * `canEditContent`, and anchors the Document as PENDING, then answers 202.
 * `/api/cron/process-document-ingestion` does the heavy half and moves the
 * document to COMPLETE / FAILED; the client polls `Document.status`.
 *
 * The route no longer needs a raised `maxDuration` (nothing here is slow) and no
 * longer schedules resonance discovery via `after()` — the worker owns that as a
 * durable step.
 */

function unauthorized(message = 'Authentication required') {
  return Response.json({ error: message }, { status: 401 })
}

function badRequest(message: string, reason?: string) {
  return Response.json(reason ? { error: message, reason } : { error: message }, {
    status: 400,
  })
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
    // No documentId — it is derived from the server-minted blobKey so a retried
    // call re-anchors the same document instead of creating a second one.
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

  const result = await enqueueDocumentIngest(
    { driver },
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
        : // Too many of this account's documents are already queued. 429 so a
          // client can back off rather than treating it as a bad request.
          result.reason === 'queue_full'
          ? 429
          : 400
    return Response.json(
      { error: result.error, reason: result.reason },
      { status }
    )
  }

  // The document is durable in the queue either way; the kick starts a worker
  // sweep as soon as the 202 is on the wire instead of waiting for a
  // scheduler tick, which on dev/demo can be the better part of an hour away.
  kickQueueWorker(req, 'document-ingest')

  // 202 Accepted: the document is anchored and queued, nothing has been
  // extracted yet. The client polls `Document.status` (PENDING → PROCESSING →
  // COMPLETE / FAILED) rather than waiting on this response. No threadId or
  // entity counts here — the worker creates the ingest thread.
  return Response.json(
    {
      documentId: result.documentId,
      status: DOCUMENT_INGEST_STATUS.pending,
    },
    { status: 202 }
  )
}
