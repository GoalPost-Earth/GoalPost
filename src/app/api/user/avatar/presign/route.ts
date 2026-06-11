import { randomUUID } from 'node:crypto'
import { resolveAuthenticatedUserId } from '@/app/api/auth/utils'
import { createS3BlobStore } from '@/lib/ingest/s3-blob-store'
import { createMemoryBlobStore } from '@/lib/ingest/blob-store'

/**
 * Step 1 of the direct-to-S3 profile-photo upload flow.
 *
 *   POST /api/user/avatar/presign
 *   { filename, mimeType, sizeBytes }
 *
 * Validates auth + image mime + size, then mints a short-lived presigned PUT
 * URL the browser can `fetch(uploadUrl, { method: 'PUT', body: file })`
 * directly to S3. Returns `{ uploadUrl, blobKey, photoPath, contentType }`.
 *
 * The browser uploads the bytes, then persists `photoPath` onto its own
 * Person.photo via the existing updatePerson mutation. `photoPath` is a stable
 * app URL (`/api/user/avatar?key=…`) that the sibling GET route resolves to a
 * fresh presigned download URL on each render — so the bucket stays private and
 * the stored value never expires.
 *
 * The storage key is server-chosen and fully random (`avatars/<uuid>.<ext>`):
 * the browser can only ever PUT to the exact key we signed, so a caller cannot
 * target or overwrite another member's object, and no Person id leaks into the
 * rendered image URL.
 */

const PRESIGN_TTL_SECONDS = 60 * 5
// Avatars are small; cap well below the document ceiling so a presign can't be
// requested for a runaway image upload.
const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_MIME = new Map<string, string>([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
])

function unauthorized(message = 'Authentication required') {
  return Response.json({ error: message }, { status: 401 })
}

function badRequest(message: string, reason?: string) {
  return Response.json(
    reason ? { error: message, reason } : { error: message },
    { status: 400 }
  )
}

function storageUnavailable() {
  return Response.json(
    {
      error:
        'Photo uploads are temporarily unavailable. Please try again later.',
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

export async function POST(req: Request) {
  const currentUserId = resolveAuthenticatedUserId(req)
  if (!currentUserId) return unauthorized()

  let body: { filename?: unknown; mimeType?: unknown; sizeBytes?: unknown }
  try {
    body = await req.json()
  } catch {
    return badRequest('Expected JSON body.')
  }

  const mimeType = normaliseMime(String(body.mimeType ?? ''))
  const ext = ALLOWED_MIME.get(mimeType)
  if (!ext) {
    return badRequest(
      `We don't support this image type ("${mimeType || 'unknown'}"). Use a JPG, PNG, WebP, or GIF.`,
      'unsupported_mime'
    )
  }

  const sizeBytes = Number(body.sizeBytes ?? 0)
  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
    return badRequest('sizeBytes must be a positive number.')
  }
  if (sizeBytes > MAX_BYTES) {
    return badRequest(
      `That image is too large (${(sizeBytes / (1024 * 1024)).toFixed(1)} MB). The limit is ${MAX_BYTES / (1024 * 1024)} MB.`,
      'oversize_bytes'
    )
  }

  // Known limitation: each upload mints a fresh random key and nothing reaps
  // the previously-referenced object, so replacing or abandoning a photo leaves
  // orphaned blobs. Reaping is a follow-up — an S3 lifecycle rule on the
  // `avatars/` prefix or a delete-old-key-on-save step (which needs ownership
  // verification, since keys don't encode the owner). Tracked alongside the
  // missing rate limiter on this route.
  const blobKey = `avatars/${randomUUID()}.${ext}`

  let uploadUrl: string
  try {
    const store = resolveBlobStore()
    uploadUrl = await store.presignPut({
      key: blobKey,
      contentType: mimeType,
      ttlSeconds: PRESIGN_TTL_SECONDS,
    })
  } catch (err) {
    console.error('[user/avatar/presign] failed to mint upload URL:', err)
    return storageUnavailable()
  }

  return Response.json({
    uploadUrl,
    blobKey,
    photoPath: `/api/user/avatar?key=${encodeURIComponent(blobKey)}`,
    contentType: mimeType,
    expiresInSeconds: PRESIGN_TTL_SECONDS,
  })
}
