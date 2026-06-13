/**
 * In-process text extraction for Office Open XML uploads (docx / xlsx / pptx).
 *
 * Office files are not a format Gemini reads by reference, so rather than ship
 * the bytes to a third-party converter (which would leak user documents
 * outside our trust boundary — see the data-sovereignty principle) or run a
 * LibreOffice binary (impossible on the serverless runtime), we extract their
 * text here with `officeparser` — a pure-JS parser that unzips the OOXML and
 * walks its content tree. The extracted text then feeds the same OpenAI text
 * extraction path that `.txt`/`.md`/`.csv` uploads use.
 *
 * Returns the shared `ExtractedDocumentText` shape so the orchestrator stays
 * agnostic to which extractor produced the text. Failures surface as the same
 * typed `DocumentTextExtractionError` the text path throws, so the route layer
 * maps them to clean 400s.
 */

import { parseOffice } from 'officeparser'
import {
  DocumentTextExtractionError,
  MAX_TEXT_CHARS,
  type ExtractedDocumentText,
} from './document-text-extractor'

export interface ExtractOfficeTextInput {
  buffer: Buffer
  filename: string
}

export async function extractOfficeText(
  input: ExtractOfficeTextInput
): Promise<ExtractedDocumentText> {
  let text: string
  try {
    // officeparser sniffs the format from the buffer's magic bytes, so a
    // mislabelled extension can't steer it to the wrong parser. `toText()`
    // flattens the AST to plain text — all we need for entity extraction.
    const ast = await parseOffice(input.buffer)
    text = (ast.toText() ?? '').replace(/\r\n?/g, '\n').trim()
  } catch (err) {
    throw new DocumentTextExtractionError(
      'parse_failure',
      `Could not read ${input.filename}: ${err instanceof Error ? err.message : String(err)}`
    )
  }

  if (text.length === 0) {
    throw new DocumentTextExtractionError(
      'parse_failure',
      `${input.filename} doesn't appear to contain any extractable text.`
    )
  }

  if (text.length > MAX_TEXT_CHARS) {
    throw new DocumentTextExtractionError(
      'oversize_chars',
      `This document is too large (${text.length.toLocaleString()} characters of text). Please split it into pieces under ${MAX_TEXT_CHARS.toLocaleString()} characters.`
    )
  }

  return {
    text,
    charCount: text.length,
    // Office formats don't carry a meaningful single page count once flattened
    // to text; the text path treats non-paged sources as a single unit.
    pageCount: 1,
  }
}
