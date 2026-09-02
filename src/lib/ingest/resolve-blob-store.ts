import { createMemoryBlobStore, type BlobStore } from './blob-store'
import { createS3BlobStore } from './s3-blob-store'

/**
 * The blob backend the ingest workers use: S3 in every deployed environment,
 * the in-memory store when `INGEST_BLOB_BACKEND=memory` (local dev, tests).
 *
 * Shared by the document-ingestion cron and the article-import cron (GOAL-344)
 * so the two workers can never disagree about where a Document's bytes live.
 * (The presign, download, resolver and purge routes still carry their own
 * copies of this switch — folding them in is a separate cleanup.)
 * Note the memory store is per instance — a worker that both writes and reads
 * a blob in one run must hold ONE store for the whole run.
 */
export function resolveIngestBlobStore(): BlobStore {
  if (process.env.INGEST_BLOB_BACKEND === 'memory') {
    return createMemoryBlobStore()
  }
  return createS3BlobStore()
}
