import { randomUUID } from 'node:crypto'
import { driver } from '@/lib/neo4j/driver'
import { resolveAuthenticatedUserId } from '@/app/api/auth/utils'
import { createS3BlobStore } from '@/lib/ingest/s3-blob-store'
import { createMemoryBlobStore } from '@/lib/ingest/blob-store'

/**
 * Step 1 of the direct-to-S3 upload flow.
 *
 *   POST /api/ingest/document/presign
 *   { fieldContextId, filename, mimeType, sizeBytes, hint? }
 *
 * Validates auth + size + mime, mints a short-lived presigned PUT URL the
 * browser can `fetch(..., { method: 'PUT', body: file })` directly to S3.
 * Returns `{ documentId, blobKey, uploadUrl, expiresInSeconds }`. The
 * browser then calls `/api/ingest/document/process` once the upload
 * resolves.
 *
 * Permission gate: the FieldContext must exist and the caller must hold
 * `canEditContent`. Same check the GraphQL mutation used to perform up
 * front. Deferred to the process step where the full handler runs — the
 * presign mint itself does not touch the graph, but the URL is bounded by
 * a per-key prefix scoped to the user's document.
 */

const PRESIGN_TTL_SECONDS = 60 * 5
const ALLOWED_MIME = new Set([
  'text/plain',
  'text/markdown',
  'application/pdf',
])
// Generous byte ceiling — Gemini accepts up to 100MB by reference, but we
// cap at 50MB here so the browser can't request a presign for a runaway
// upload that the model would then refuse.
const MAX_BYTES = 50 * 1024 * 1024

function unauthorized(message = 'Authentication required') {
  return Response.json({ error: message }, { status: 401 })
}

function badRequest(message: string, reason?: string) {
  return Response.json(reason ? { error: message, reason } : { error: message }, {
    status: 400,
  })
}

function storageUnavailable() {
  return Response.json(
    {
      error:
        'Document uploads are temporarily unavailable. Please try again later.',
      reason: 'storage_unavailable',
    },
    { status: 503 }
  )
}

function resolveBlobStore() {
  if (process.env.INGEST_BLOB_BACKEND === 'memory') {
    return createMemoryBlobStore()
  }
  return createS3BlobStore()
}

function normaliseMime(raw: string): string {
  const semi = raw.indexOf(';')
  return (semi === -1 ? raw : raw.slice(0, semi)).trim().toLowerCase()
}

function sanitizeFilename(raw: string): string {
  // Keep the extension; strip path separators and control chars so the
  // resulting S3 key is predictable. The display filename on the Document
  // node is kept verbatim from input.filename, so this only affects the
  // storage key, not the user-facing label.
  return raw
    .replace(/[\\/\0-\x1f]/g, '_')
    .replace(/^\.+/, '')
    .slice(0, 200) || 'upload'
}

async function userCanEditContext(
  userId: string,
  fieldContextId: string
): Promise<boolean> {
  const session = driver.session()
  try {
    const result = await session.executeRead(async (tx) =>
      tx.run(
        `
        MATCH (space:Space)-[:HAS_CONTEXT]->(c:FieldContext {id: $fieldContextId})
        OPTIONAL MATCH (owner:Person {id: $userId})-[:OWNS]->(space)
        OPTIONAL MATCH (space)-[:HAS_MEMBER]->(sm:SpaceMembership)-[:IS_MEMBER]->(member:Person {id: $userId})
        WHERE sm.role IN ['ADMIN', 'MEMBER']
        RETURN (owner IS NOT NULL OR sm IS NOT NULL) AS allowed
        LIMIT 1
        `,
        { userId, fieldContextId }
      )
    )
    return Boolean(result.records[0]?.get('allowed'))
  } finally {
    await session.close()
  }
}

export async function POST(req: Request) {
  const currentUserId = resolveAuthenticatedUserId(req)
  if (!currentUserId) return unauthorized()

  let body: {
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

  const fieldContextId = String(body.fieldContextId ?? '').trim()
  if (!fieldContextId) return badRequest('fieldContextId is required.')

  const filename = String(body.filename ?? '').trim()
  if (!filename) return badRequest('filename is required.')

  const mimeType = normaliseMime(String(body.mimeType ?? ''))
  if (!ALLOWED_MIME.has(mimeType)) {
    return badRequest(
      `We don't yet support this file type ("${mimeType}"). v1 accepts .txt, .md, and .pdf.`,
      'unsupported_mime'
    )
  }

  const sizeBytes = Number(body.sizeBytes ?? 0)
  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
    return badRequest('sizeBytes must be a positive number.')
  }
  if (sizeBytes > MAX_BYTES) {
    return badRequest(
      `This document is too large (${(sizeBytes / (1024 * 1024)).toFixed(1)} MB). The upload limit is ${MAX_BYTES / (1024 * 1024)} MB.`,
      'oversize_bytes'
    )
  }

  const allowed = await userCanEditContext(currentUserId, fieldContextId)
  if (!allowed) {
    return Response.json(
      {
        error: 'You do not have permission to add documents to this field context.',
        reason: 'forbidden',
      },
      { status: 403 }
    )
  }

  // Predict the documentId now so the storage key + graph anchor agree later.
  const documentId = `document_${randomUUID()}`
  const blobKey = `documents/${documentId}/${sanitizeFilename(filename)}`

  // The presign mint depends on blob-storage configuration (S3 bucket /
  // region / credentials). A missing or malformed config throws here — surface
  // it as a clean 503 rather than leaking a raw 500 with the internal error.
  let uploadUrl: string
  try {
    const store = resolveBlobStore()
    uploadUrl = await store.presignPut({
      key: blobKey,
      contentType: mimeType,
      ttlSeconds: PRESIGN_TTL_SECONDS,
    })
  } catch (err) {
    console.error('[ingest/presign] failed to mint upload URL:', err)
    return storageUnavailable()
  }

  return Response.json({
    documentId,
    blobKey,
    uploadUrl,
    contentType: mimeType,
    expiresInSeconds: PRESIGN_TTL_SECONDS,
  })
}
