/**
 * Single source of truth for which uploads the document-ingestion pipeline
 * accepts, and how each one is turned into text/entities. Three gates and the
 * orchestrator all import from here so the allow-list can never drift apart:
 *
 *   - `upload-document-modal.tsx`          client-side allow-list, accept attr, copy
 *   - `api/ingest/document/presign/route`  server allow-list gate
 *   - `handle-ingest-document.ts`          routing (multimodal vs office vs text)
 *   - `document-text-extractor.ts`         the text-route mime set
 *
 * This module is intentionally isomorphic — pure data + string helpers, no
 * Node-only imports — so the `'use client'` modal can import it as safely as
 * the server route. Heavy extractors (officeparser, pdf-parse) are pulled in
 * only by the server-side extractor modules, never here.
 *
 * Extraction routes:
 *   - `multimodal` — read by reference by Gemini from a presigned URL. PDFs and
 *     images. The bytes never re-traverse our process.
 *   - `office`     — Office Open XML (docx/xlsx/pptx). Text is extracted
 *     in-process via officeparser (no LibreOffice, no third-party converter —
 *     keeps user documents inside our trust boundary, per data sovereignty),
 *     then fed to the text extraction model.
 *   - `text`       — plain-text formats decoded server-side and fed to the text
 *     extraction model.
 */

export type IngestExtractionRoute = 'multimodal' | 'office' | 'text'

export interface SupportedIngestType {
  mime: string
  /** Lower-case extensions (with leading dot) used for the accept attribute
   *  and as a fallback when the browser reports an empty `File.type`. */
  extensions: string[]
  route: IngestExtractionRoute
  /** Human-readable label for UI copy — never an internal token. */
  label: string
}

export const SUPPORTED_INGEST_TYPES: readonly SupportedIngestType[] = [
  // Multimodal — Gemini reads these natively by reference.
  { mime: 'application/pdf', extensions: ['.pdf'], route: 'multimodal', label: 'PDF' },
  { mime: 'image/png', extensions: ['.png'], route: 'multimodal', label: 'PNG image' },
  {
    mime: 'image/jpeg',
    extensions: ['.jpg', '.jpeg'],
    route: 'multimodal',
    label: 'JPEG image',
  },
  { mime: 'image/webp', extensions: ['.webp'], route: 'multimodal', label: 'WebP image' },
  { mime: 'image/heic', extensions: ['.heic'], route: 'multimodal', label: 'HEIC image' },
  { mime: 'image/heif', extensions: ['.heif'], route: 'multimodal', label: 'HEIF image' },
  // Office Open XML — text extracted in-process. Legacy binary formats
  // (.doc/.xls/.ppt) are intentionally excluded; only the modern XML formats
  // are supported.
  {
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    extensions: ['.docx'],
    route: 'office',
    label: 'Word document',
  },
  {
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    extensions: ['.xlsx'],
    route: 'office',
    label: 'Excel spreadsheet',
  },
  {
    mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    extensions: ['.pptx'],
    route: 'office',
    label: 'PowerPoint deck',
  },
  // Plain-text formats — decoded server-side.
  { mime: 'text/plain', extensions: ['.txt'], route: 'text', label: 'Plain text' },
  {
    mime: 'text/markdown',
    extensions: ['.md', '.markdown'],
    route: 'text',
    label: 'Markdown',
  },
  { mime: 'text/csv', extensions: ['.csv'], route: 'text', label: 'CSV' },
]

/** Default upload byte ceiling, shared by the client modal and presign gate. */
export const MAX_INGEST_BYTES = 50 * 1024 * 1024

/**
 * Tighter ceiling for the `office` route. OOXML files are ZIP archives that
 * `officeparser` fully inflates in-process before the text char-cap applies,
 * so a highly-compressible upload is a decompression-amplification (OOM) risk.
 * A lower ceiling bounds the worst case; a legitimate doc whose text fits the
 * 50k char cap is rarely this large. (Uploads are already auth + edit-permission
 * gated, so the attacker set is limited to space members.)
 */
export const MAX_OFFICE_BYTES = 25 * 1024 * 1024

/** Byte ceiling for a given extraction route. */
export function maxBytesForRoute(route: IngestExtractionRoute): number {
  return route === 'office' ? MAX_OFFICE_BYTES : MAX_INGEST_BYTES
}

/**
 * Normalise a raw Content-Type to its bare lower-case mime (drop any
 * `; charset=…` parameter and surrounding whitespace).
 */
export function normalizeIngestMime(raw: string): string {
  const semi = raw.indexOf(';')
  return (semi === -1 ? raw : raw.slice(0, semi)).trim().toLowerCase()
}

const ROUTE_BY_MIME: ReadonlyMap<string, IngestExtractionRoute> = new Map(
  SUPPORTED_INGEST_TYPES.map((t) => [t.mime, t.route])
)

/** The extraction route for a mime, or null when the type is unsupported. */
export function ingestRouteForMime(raw: string): IngestExtractionRoute | null {
  return ROUTE_BY_MIME.get(normalizeIngestMime(raw)) ?? null
}

export function isSupportedIngestMime(raw: string): boolean {
  return ROUTE_BY_MIME.has(normalizeIngestMime(raw))
}

/** Mimes that flow through the in-process text extractor (text route only). */
export const TEXT_ROUTE_MIME_TYPES: readonly string[] = SUPPORTED_INGEST_TYPES.filter(
  (t) => t.route === 'text'
).map((t) => t.mime)

const EXTENSION_TO_MIME: ReadonlyMap<string, string> = new Map(
  SUPPORTED_INGEST_TYPES.flatMap((t) => t.extensions.map((ext) => [ext, t.mime]))
)

/**
 * Best-effort mime inference from a filename's extension. Used by the upload
 * modal when the browser reports an empty `File.type`. Returns null for
 * unknown extensions.
 */
export function inferIngestMimeFromExtension(filename: string): string | null {
  const dot = filename.lastIndexOf('.')
  if (dot === -1) return null
  return EXTENSION_TO_MIME.get(filename.slice(dot).toLowerCase()) ?? null
}

/** Value for a file input's `accept` attribute — extensions plus mimes. */
export const INGEST_ACCEPT_ATTRIBUTE = [
  ...SUPPORTED_INGEST_TYPES.flatMap((t) => t.extensions),
  ...SUPPORTED_INGEST_TYPES.map((t) => t.mime),
].join(',')

/**
 * Short human summary of the accepted formats for UI copy and error
 * messages, e.g. "PDF, images, Word, Excel, PowerPoint, and text files".
 */
export const SUPPORTED_INGEST_SUMMARY =
  'PDF, images, Word, Excel, PowerPoint, and text files'
