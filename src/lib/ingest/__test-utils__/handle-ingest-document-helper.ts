import type { Driver } from 'neo4j-driver'
import type { BlobStore } from '../blob-store'
import type { ExtractionModelClient } from '../extraction-model-invoker'
import type { DocumentSummarizerClient } from '../document-summarizer'
import {
  handleIngestDocument,
  type IngestDocumentResult,
} from '../handle-ingest-document'
import {
  handleReExtractDocument,
  type ReExtractDocumentResult,
} from '../handle-reextract-document'

/**
 * Test helper that pre-seeds the blob store with the given buffer and then
 * calls `handleIngestDocument` with the post-refactor shape (blobKey +
 * sizeBytes instead of buffer). Lets the integration tests keep their
 * pre-direct-upload arrange step nearly verbatim.
 *
 * The single `modelClient` is wired into BOTH the pdf and text extractor
 * slots so a test can keep one mock regardless of mime — production routes
 * differ but the orchestrator branch is exercised either way.
 */
export interface HelperInput {
  currentUserId: string
  fieldContextId: string
  filename: string
  mimeType: string
  buffer: Buffer
  hint: string | null
}

export async function seedAndIngest(
  deps: {
    driver: Driver
    blobStore: BlobStore
    modelClient: ExtractionModelClient
    summarizerClient?: DocumentSummarizerClient | null
  },
  input: HelperInput
): Promise<IngestDocumentResult> {
  const blobKey = `documents/test-${Date.now()}-${Math.random().toString(36).slice(2)}/${input.filename}`
  await deps.blobStore.put({
    key: blobKey,
    contentType: input.mimeType,
    buffer: input.buffer,
  })
  return handleIngestDocument(
    {
      driver: deps.driver,
      blobStore: deps.blobStore,
      pdfExtractionClient: deps.modelClient,
      textExtractionClient: deps.modelClient,
      pdfSummarizerClient: deps.summarizerClient ?? null,
      textSummarizerClient: deps.summarizerClient ?? null,
    },
    {
      currentUserId: input.currentUserId,
      fieldContextId: input.fieldContextId,
      filename: input.filename,
      mimeType: input.mimeType,
      blobKey,
      sizeBytes: input.buffer.length,
      hint: input.hint,
    }
  )
}

export async function reExtractWithSingleClient(
  deps: {
    driver: Driver
    blobStore: BlobStore
    modelClient: ExtractionModelClient
    summarizerClient?: DocumentSummarizerClient | null
  },
  input: { currentUserId: string; documentId: string }
): Promise<ReExtractDocumentResult> {
  return handleReExtractDocument(
    {
      driver: deps.driver,
      blobStore: deps.blobStore,
      pdfExtractionClient: deps.modelClient,
      textExtractionClient: deps.modelClient,
      pdfSummarizerClient: deps.summarizerClient ?? null,
      textSummarizerClient: deps.summarizerClient ?? null,
    },
    input
  )
}
