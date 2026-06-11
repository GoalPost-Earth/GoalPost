import { resolveAuthenticatedUserId } from '@/app/api/auth/utils'
import { createS3BlobStore } from '@/lib/ingest/s3-blob-store'
import { createMemoryBlobStore } from '@/lib/ingest/blob-store'

/**
 * Serves a member's uploaded profile photo.
 *
 *   GET /api/user/avatar?key=avatars/<uuid>.<ext>
 *
 * Person.photo stores this stable app path (minted by the presign route) so the
 * underlying S3 object can stay private and the stored value never expires. On
 * each render we mint a fresh short-lived presigned GET and 302-redirect to it,
 * so the bytes are served straight from S3 rather than streamed through this
 * process (the memory backend used in tests has no real download URL, so we
 * stream those directly).
 *
 * Auth: any authenticated member may fetch any avatar — profile photos are
 * shown across the community (person nodes, people lists), exactly like the
 * existing externally-hosted Person.photo URLs. The `<img>` tag sends the
 * same-origin `accessToken` cookie, which resolveAuthenticatedUserId reads.
 * Keys are unguessable random UUIDs, so this is also defence in depth.
 */

const DOWNLOAD_TTL_SECONDS = 60 * 5
// Cache the redirect for less than the presign TTL so a cached 302 can never
// point at an already-expired signed URL.
const REDIRECT_MAX_AGE_SECONDS = 60
// `avatars/<canonical-uuid>.<ext>` and nothing else — a strict allowlist that
// forbids path traversal, nested prefixes, or reaching document/other keys.
const KEY_PATTERN =
  /^avatars\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|gif)$/

function unauthorized() {
  return Response.json({ error: 'Authentication required' }, { status: 401 })
}

function resolveBlobStore() {
  if (process.env.INGEST_BLOB_BACKEND === 'memory') {
    return createMemoryBlobStore()
  }
  return createS3BlobStore()
}

export async function GET(req: Request) {
  const currentUserId = resolveAuthenticatedUserId(req)
  if (!currentUserId) return unauthorized()

  const key = new URL(req.url).searchParams.get('key') ?? ''
  if (!KEY_PATTERN.test(key)) {
    return Response.json({ error: 'Invalid avatar key.' }, { status: 400 })
  }

  // Memory backend (tests/local without S3): no real download URL — stream the
  // stored bytes directly so the image still renders.
  if (process.env.INGEST_BLOB_BACKEND === 'memory') {
    const obj = await createMemoryBlobStore().get(key)
    if (!obj) return Response.json({ error: 'Not found.' }, { status: 404 })
    return new Response(new Uint8Array(obj.buffer), {
      headers: {
        'Content-Type': obj.contentType,
        'Cache-Control': 'private, max-age=300',
      },
    })
  }

  let downloadUrl: string
  try {
    downloadUrl = await resolveBlobStore().presignGet({
      key,
      ttlSeconds: DOWNLOAD_TTL_SECONDS,
    })
  } catch (err) {
    console.error('[user/avatar] failed to mint download URL:', err)
    return Response.json(
      { error: 'Avatar is temporarily unavailable.' },
      { status: 503 }
    )
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: downloadUrl,
      'Cache-Control': `private, max-age=${REDIRECT_MAX_AGE_SECONDS}`,
    },
  })
}
