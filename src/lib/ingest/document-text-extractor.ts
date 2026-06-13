/**
 * Normalises a *text-route* upload into the plain-text shape the extraction
 * model consumes:
 *   - text/plain
 *   - text/markdown    (passed through as plain text — no rendering)
 *   - text/csv         (passed through as plain text)
 *   - application/pdf  (parsed via pdf-parse / pdfjs)
 *
 * PDFs and images are read by Gemini multimodal by reference (the `multimodal`
 * route in handle-ingest-document), so no production caller reaches the
 * `application/pdf` branch here today — it's retained as a buffer-based
 * fallback and is exercised by the extractor's unit tests. Office formats are
 * handled by `office-text-extractor.ts`. See `supported-file-types.ts` for
 * routing.
 *
 * The returned shape `{ text, pageCount, charCount }` is fixed across formats
 * so downstream callers don't branch on mimeType. Unsupported types and
 * oversize documents throw a typed `DocumentTextExtractionError` so the route
 * layer can map cleanly to 400s.
 */

// Type-only import: `pdf-parse` (and the pdfjs-dist it wraps) references
// browser globals like `DOMMatrix` at module-evaluation time, which crash on
// the serverless Node runtime. This module is pulled into the GraphQL resolver
// graph (document-resolver → here), so eagerly importing the value would crash
// schema construction and 500 every /api/graphql request. We `import type` here
// and `await import('pdf-parse')` lazily inside the PDF branch so the heavy lib
// only evaluates when a PDF is actually parsed. The runtime globals it needs
// are polyfilled in `instrumentation.ts`.
import type { PDFParse } from 'pdf-parse'
import {
  SUPPORTED_INGEST_SUMMARY,
  TEXT_ROUTE_MIME_TYPES,
} from './supported-file-types'

export const MAX_TEXT_CHARS = 50_000
export const MAX_PDF_PAGES = 20

// The text-route mimes come from the single source of truth; `application/pdf`
// is appended only because the buffer-based PDF branch below can still handle
// a PDF if called directly (today PDFs route to Gemini multimodal before
// reaching here — see supported-file-types.ts).
export const SUPPORTED_MIME_TYPES: ReadonlyArray<string> = [
  ...TEXT_ROUTE_MIME_TYPES,
  'application/pdf',
]

export type DocumentTextExtractionErrorKind =
  | 'unsupported_mime'
  | 'oversize_pages'
  | 'oversize_chars'
  | 'parse_failure'

export class DocumentTextExtractionError extends Error {
  readonly kind: DocumentTextExtractionErrorKind
  constructor(kind: DocumentTextExtractionErrorKind, message: string) {
    super(message)
    this.name = 'DocumentTextExtractionError'
    this.kind = kind
  }
}

export interface ExtractDocumentTextInput {
  mimeType: string
  buffer: Buffer
  filename: string
}

export interface ExtractedDocumentText {
  text: string
  charCount: number
  pageCount: number
}

function normaliseMimeType(raw: string): string {
  const semi = raw.indexOf(';')
  return (semi === -1 ? raw : raw.slice(0, semi)).trim().toLowerCase()
}

function stripUtf8Bom(buffer: Buffer): Buffer {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xef &&
    buffer[1] === 0xbb &&
    buffer[2] === 0xbf
  ) {
    return buffer.subarray(3)
  }
  return buffer
}

function decodeUtf8Body(buffer: Buffer): string {
  // Normalise CRLF / lone-CR to LF so downstream prompts get a consistent
  // line-ending shape regardless of where the file was authored.
  return stripUtf8Bom(buffer).toString('utf8').replace(/\r\n?/g, '\n')
}

function ensureCharCap(text: string): string {
  if (text.length > MAX_TEXT_CHARS) {
    throw new DocumentTextExtractionError(
      'oversize_chars',
      `This document is too large (${text.length.toLocaleString()} characters). Please split it into pieces under ${MAX_TEXT_CHARS.toLocaleString()} characters.`
    )
  }
  return text
}

function looksLikePdf(buffer: Buffer): boolean {
  // Defense in depth: clients can lie about Content-Type. Real PDFs always
  // begin with the magic bytes `%PDF-`. Accept up to 1 KB of optional leading
  // whitespace / BOM that some producers prepend.
  const probe = buffer.subarray(0, Math.min(1024, buffer.length)).toString('latin1')
  return probe.includes('%PDF-')
}

async function extractPdf(buffer: Buffer): Promise<ExtractedDocumentText> {
  if (!looksLikePdf(buffer)) {
    throw new DocumentTextExtractionError(
      'unsupported_mime',
      "This file is labelled application/pdf but doesn't appear to be a real PDF."
    )
  }

  // pdfjs-dist takes a typed array; copy into a fresh Uint8Array so we don't
  // share the underlying ArrayBuffer with the caller (pdfjs may transfer it).
  const data = new Uint8Array(buffer.byteLength)
  data.set(buffer)

  const { PDFParse } = await import('pdf-parse')
  let parser: PDFParse | null = null
  try {
    parser = new PDFParse({ data, disableFontFace: true })

    // Cheap page-count check first so a huge PDF can be rejected without
    // pulling its full text into memory.
    const info = await parser.getInfo()
    const pageCount = info.total
    if (pageCount > MAX_PDF_PAGES) {
      throw new DocumentTextExtractionError(
        'oversize_pages',
        `This PDF has ${pageCount} pages — please split it. The current limit is ${MAX_PDF_PAGES} pages.`
      )
    }

    const result = await parser.getText()
    const text = ensureCharCap(result.text ?? '')
    return {
      text,
      charCount: text.length,
      pageCount,
    }
  } catch (err) {
    if (err instanceof DocumentTextExtractionError) throw err
    throw new DocumentTextExtractionError(
      'parse_failure',
      `Could not read the PDF: ${err instanceof Error ? err.message : String(err)}`
    )
  } finally {
    // destroy() releases the underlying worker even if loading threw.
    if (parser) {
      await parser.destroy().catch(() => {})
    }
  }
}

export async function extractDocumentText(
  input: ExtractDocumentTextInput
): Promise<ExtractedDocumentText> {
  const mime = normaliseMimeType(input.mimeType)
  if (!SUPPORTED_MIME_TYPES.includes(mime)) {
    throw new DocumentTextExtractionError(
      'unsupported_mime',
      `We don't support this file type ("${mime}"). We accept ${SUPPORTED_INGEST_SUMMARY}.`
    )
  }

  if (mime === 'application/pdf') {
    return extractPdf(input.buffer)
  }

  // text/plain and text/markdown: pass through as plain text. Markdown
  // formatting is preserved verbatim — no rendering, no HTML.
  const text = ensureCharCap(decodeUtf8Body(input.buffer))
  return {
    text,
    charCount: text.length,
    pageCount: 1,
  }
}
