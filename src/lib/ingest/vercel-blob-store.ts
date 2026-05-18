import type { BlobStore } from './blob-store'

/**
 * Production blob store. Slice 1 ships a stub that throws until
 * `@vercel/blob` (or the chosen blob SDK) is wired with env credentials.
 * The doc-ingestion code path is fully testable today via
 * `createMemoryBlobStore` — swapping in the real SDK is a follow-up step
 * gated on `BLOB_READ_WRITE_TOKEN` provisioning, not a TDD concern.
 */
export function createVercelBlobStore(): BlobStore {
  const notWired = () => {
    throw new Error(
      'createVercelBlobStore: blob SDK not wired yet. Set BLOB_READ_WRITE_TOKEN and replace this stub with the @vercel/blob client.'
    )
  }
  return {
    async put() {
      notWired()
      // unreachable — for type narrowing only
      throw new Error('unreachable')
    },
    async get() {
      notWired()
      throw new Error('unreachable')
    },
    async delete() {
      notWired()
    },
  }
}
