import { put as sdkPut, del as sdkDel, head as sdkHead } from '@vercel/blob'
import type { BlobStore } from './blob-store'

/**
 * Production BlobStore backed by Vercel Blob.
 *
 * Authentication: BLOB_READ_WRITE_TOKEN is read at call time per request so
 * tests / dev / prod can swap tokens without rebuilding the store. The SDK
 * also auto-reads BLOB_READ_WRITE_TOKEN when deployed to Vercel; passing it
 * explicitly keeps Jest + local dev predictable.
 *
 * Upload contract:
 *   - access: 'public' — documents are anchored to a FieldContext in the
 *     graph and the GraphQL layer already enforces space membership when
 *     surfacing the blob URL. Listing endpoints never disclose URLs to
 *     non-members.
 *   - allowOverwrite: true — re-extract on the same filename is supported
 *     in slice 6 and must not 409.
 *   - addRandomSuffix: false — blob key === pathname === graph blobKey so
 *     document-storage's CREATE / SET dance stays deterministic.
 */
function isBlobNotFoundError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false
  const e = err as { name?: string; message?: string }
  return (
    e.name === 'BlobNotFoundError' ||
    /not found/i.test(e.message ?? '')
  )
}

export function createVercelBlobStore(): BlobStore {
  function token(): string {
    const t = process.env.BLOB_READ_WRITE_TOKEN?.trim() || ''
    if (!t) {
      throw new Error(
        'createVercelBlobStore: BLOB_READ_WRITE_TOKEN is not set. Set it in the environment or use INGEST_BLOB_BACKEND=memory for local dev.'
      )
    }
    return t
  }

  return {
    async put(input) {
      const result = await sdkPut(input.key, input.buffer, {
        access: 'public',
        contentType: input.contentType,
        allowOverwrite: true,
        addRandomSuffix: false,
        token: token(),
      })
      return {
        key: result.pathname,
        url: result.url,
        contentType: result.contentType,
        sizeBytes: input.buffer.length,
      }
    },
    async get(key) {
      let metadata
      try {
        metadata = await sdkHead(key, { token: token() })
      } catch (err) {
        if (isBlobNotFoundError(err)) return null
        throw err
      }
      const response = await fetch(metadata.url)
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error(
          `createVercelBlobStore.get: fetch ${metadata.url} failed with status ${response.status}`
        )
      }
      const bytes = Buffer.from(await response.arrayBuffer())
      return {
        key,
        contentType: metadata.contentType,
        buffer: bytes,
      }
    },
    async delete(key) {
      try {
        await sdkDel(key, { token: token() })
      } catch (err) {
        if (isBlobNotFoundError(err)) return
        throw err
      }
    },
  }
}
