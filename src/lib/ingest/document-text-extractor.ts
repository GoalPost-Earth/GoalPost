/**
 * Normalises an uploaded document into the plain-text shape the
 * extraction model consumes. Slice 1 supports `text/plain` only; slice 3
 * adds `text/markdown` and `application/pdf`.
 */

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

const SUPPORTED_MIME_TYPES = new Set<string>(['text/plain'])

function normaliseMimeType(raw: string): string {
  // strip parameters like "; charset=utf-8" so callers can pass whatever the
  // HTTP layer gave them without pre-trimming.
  const semi = raw.indexOf(';')
  return (semi === -1 ? raw : raw.slice(0, semi)).trim().toLowerCase()
}

export async function extractDocumentText(
  input: ExtractDocumentTextInput
): Promise<ExtractedDocumentText> {
  const mime = normaliseMimeType(input.mimeType)
  if (!SUPPORTED_MIME_TYPES.has(mime)) {
    throw new Error(
      `Unsupported mimeType "${mime}". Slice 1 supports text/plain only.`
    )
  }

  const text = input.buffer.toString('utf8')
  return {
    text,
    charCount: text.length,
    pageCount: 1,
  }
}
