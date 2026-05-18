/**
 * Document-ingestion blob storage abstraction. Production wires
 * `createVercelBlobStore()` (or equivalent); tests use
 * `createMemoryBlobStore()` so DocumentStorage integration tests don't
 * depend on a live blob bucket.
 *
 * Delete is intentionally idempotent — the cleanup paths in
 * DocumentStorage call it on best-effort; a missing blob never blocks
 * graph cleanup.
 */

export interface BlobRef {
  key: string
  url: string
  contentType: string
  sizeBytes: number
}

export interface BlobObject {
  key: string
  contentType: string
  buffer: Buffer
}

export interface PutBlobInput {
  key: string
  contentType: string
  buffer: Buffer
}

export interface BlobStore {
  put(input: PutBlobInput): Promise<BlobRef>
  get(key: string): Promise<BlobObject | null>
  delete(key: string): Promise<void>
}

export function createMemoryBlobStore(): BlobStore {
  const store = new Map<string, BlobObject>()
  return {
    async put(input) {
      store.set(input.key, {
        key: input.key,
        contentType: input.contentType,
        buffer: Buffer.from(input.buffer),
      })
      return {
        key: input.key,
        url: `memory://${input.key}`,
        contentType: input.contentType,
        sizeBytes: input.buffer.length,
      }
    },
    async get(key) {
      const obj = store.get(key)
      return obj ? { ...obj, buffer: Buffer.from(obj.buffer) } : null
    },
    async delete(key) {
      store.delete(key)
    },
  }
}
