import { driver } from '@/lib/neo4j/driver'
import { resolveAuthenticatedUserId } from '@/app/api/auth/utils'
import { enqueueIngestDocument } from '@/lib/ingest/handle-ingest-document'

/**
 * Step 2 of the direct-to-S3 upload flow.
 *
 *   POST /api/ingest/document/process
 *   { documentId, blobKey, fieldContextId, filename, mimeType, sizeBytes, hint? }
 *
 * Called once the browser has finished PUT-ing the file to S3 via the
 * URL handed back by `/presign`. This step validates the body, enforces the
 * `canEditContent` permission gate, and anchors a PENDING Document node — it
 * never touches the blob or calls a model. The heavy extraction +
 * summarization + Neo4j entity-write pipeline runs later, off-request, in the
 * `/api/cron/process-document-ingestion` background job (GOAL-292).
 *
 * This replaces the former synchronous orchestrator, which ran the full
 * pipeline inline and could exceed even the raised 300s `maxDuration`
 * stopgap on large documents / slow LLM calls, returning a 504 to the
 * browser. Enqueuing keeps this route's own work (permission check + one
 * Cypher write) well under the original 60s ceiling — `maxDuration` itself is
 * left at the stopgap's 300s (lowering it is explicitly out of scope for
 * GOAL-292; it can be revisited once async ingestion is proven).
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

  const result = await enqueueIngestDocument(
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
    return Response.json({ error: result.error, reason: result.reason }, { status: 403 })
  }

  // The background job (`/api/cron/process-document-ingestion`) picks this
  // Document up from PENDING on its next run and does the actual extraction
  // + summarization + entity writes. The UI polls `documentsByFieldContext`
  // to reflect PENDING → PROCESSING → COMPLETE/FAILED.
  return Response.json(
    { documentId: result.documentId, status: 'PENDING' },
    { status: 202 }
  )
}
