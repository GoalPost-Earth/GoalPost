/**
 * Document-ingestion blob storage abstraction. Production wires
 * `createS3BlobStore()`; tests use `createMemoryBlobStore()` so DocumentStorage
 * integration tests don't depend on a live blob bucket.
 *
 * The interface supports two presign methods because the ingest flow does
 * direct browser→S3 upload (presignPut) and Gemini multimodal extraction
 * (presignGet — Gemini fetches via `file_data.file_uri`). Server-side `put`
 * is retained for tests + legacy paths but is not used by the primary upload
 * flow.
 *
 * Delete is intentionally idempotent — the cleanup paths in DocumentStorage
 * call it on best-effort; a missing blob never blocks graph cleanup.
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

export interface PresignPutInput {
  key: string
  contentType: string
  ttlSeconds: number
}

export interface PresignGetInput {
  key: string
  ttlSeconds: number
}

export interface BlobStore {
  put(input: PutBlobInput): Promise<BlobRef>
  get(key: string): Promise<BlobObject | null>
  delete(key: string): Promise<void>
  /** Mint a short-lived URL the browser can PUT directly to. */
  presignPut(input: PresignPutInput): Promise<string>
  /** Mint a short-lived URL Gemini (or any downstream fetcher) can GET. */
  presignGet(input: PresignGetInput): Promise<string>
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
    async presignPut(input) {
      return `memory://put/${input.key}?ttl=${input.ttlSeconds}`
    },
    async presignGet(input) {
      return `memory://get/${input.key}?ttl=${input.ttlSeconds}`
    },
  }
}
