/**
 * Shared extractor/summarizer input preparation for the two ingest entry
 * points — `handleIngestDocument` (initial upload) and `handleReExtractDocument`
 * (re-run against the current roster). Both need to turn a stored blob + its
 * mime into the inputs the extraction model and summarizer consume, and both
 * must route identically:
 *
 *   - multimodal (PDF, images): mint a presigned GET URL; Gemini reads it.
 *   - office (docx/xlsx/pptx):   pull the bytes, extract text in-process.
 *   - text (txt/md/csv):         pull the bytes, decode to text.
 *
 * Keeping this in one place is load-bearing: the two handlers previously
 * duplicated this branch and one drifted (re-extract never learned about the
 * office/image routes). A single helper makes that class of bug impossible.
 */

import type { BlobStore } from './blob-store'
import type { ExtractionModelClient } from './extraction-model-invoker'
import type { DocumentSummarizerClient } from './document-summarizer'
import {
  extractDocumentText,
  DocumentTextExtractionError,
} from './document-text-extractor'
import { extractOfficeText } from './office-text-extractor'
import { ingestRouteForMime, MAX_OFFICE_BYTES } from './supported-file-types'

/** URLs Gemini fetches synchronously inside generateContent. */
const GEMINI_PRESIGN_TTL_SECONDS = 60 * 15

export interface ExtractionClients {
  blobStore: BlobStore
  /** Multimodal extractor (Gemini) — `multimodal` route (PDF + images). */
  pdfExtractionClient: ExtractionModelClient
  /** Text extractor (OpenAI) — `office` + `text` routes. */
  textExtractionClient: ExtractionModelClient
  pdfSummarizerClient?: DocumentSummarizerClient | null
  textSummarizerClient?: DocumentSummarizerClient | null
}

interface ExtractionModelExtras {
  documentText: string
  documentUrl?: string
  documentMimeType?: string
}

export type PrepareExtractionFailureReason =
  | 'unsupported_mime'
  | 'blob_missing'
  | 'parse_failure'
  | 'oversize_pages'
  | 'oversize_chars'

export type PreparedExtraction =
  | {
      ok: true
      extractionModelInputExtras: ExtractionModelExtras
      summarizerExtras: ExtractionModelExtras
      modelClient: ExtractionModelClient
      summarizerClient: DocumentSummarizerClient | null
      /** Non-null only for paged sources (PDF text path); null otherwise. */
      pageCount: number | null
    }
  | { ok: false; reason: PrepareExtractionFailureReason; error: string }

export interface ExtractionSource {
  mimeType: string
  blobKey: string
  filename: string
}

export async function prepareExtractionInputs(
  deps: ExtractionClients,
  source: ExtractionSource
): Promise<PreparedExtraction> {
  const route = ingestRouteForMime(source.mimeType)
  if (!route) {
    // Defense in depth — the presign gate already rejects unsupported mimes,
    // so reaching here means a client skipped presign or the allow-list
    // drifted. Fail closed rather than guessing an extractor.
    return {
      ok: false,
      reason: 'unsupported_mime',
      error: `We don't support this file type (${source.mimeType}).`,
    }
  }

  if (route === 'multimodal') {
    const url = await deps.blobStore.presignGet({
      key: source.blobKey,
      ttlSeconds: GEMINI_PRESIGN_TTL_SECONDS,
    })
    const extras: ExtractionModelExtras = {
      documentText: '',
      documentUrl: url,
      documentMimeType: source.mimeType,
    }
    return {
      ok: true,
      extractionModelInputExtras: extras,
      summarizerExtras: extras,
      modelClient: deps.pdfExtractionClient,
      summarizerClient: deps.pdfSummarizerClient ?? null,
      pageCount: null,
    }
  }

  // office + text routes both produce plain text fed to the OpenAI client.
  const blob = await deps.blobStore.get(source.blobKey)
  if (!blob) {
    return {
      ok: false,
      reason: 'blob_missing',
      error: 'The uploaded file could not be read back from storage.',
    }
  }

  // Belt-and-suspenders against decompression amplification: reject an
  // oversized office archive before officeparser inflates it, even if it
  // slipped past the presign size gate.
  if (route === 'office' && blob.buffer.byteLength > MAX_OFFICE_BYTES) {
    return {
      ok: false,
      reason: 'oversize_chars',
      error: `This document is too large (${(blob.buffer.byteLength / (1024 * 1024)).toFixed(1)} MB). Office files are limited to ${MAX_OFFICE_BYTES / (1024 * 1024)} MB.`,
    }
  }

  let extracted
  try {
    extracted =
      route === 'office'
        ? await extractOfficeText({
            buffer: blob.buffer,
            filename: source.filename,
          })
        : await extractDocumentText({
            mimeType: source.mimeType,
            buffer: blob.buffer,
            filename: source.filename,
          })
  } catch (err) {
    if (err instanceof DocumentTextExtractionError) {
      return { ok: false, reason: err.kind, error: err.message }
    }
    throw err
  }

  const extras: ExtractionModelExtras = { documentText: extracted.text }
  return {
    ok: true,
    extractionModelInputExtras: extras,
    summarizerExtras: extras,
    modelClient: deps.textExtractionClient,
    summarizerClient: deps.textSummarizerClient ?? null,
    pageCount: extracted.pageCount,
  }
}
