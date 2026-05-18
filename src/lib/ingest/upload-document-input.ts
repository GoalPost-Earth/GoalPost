/**
 * Pure input validator for the `uploadDocument` GraphQL mutation. The REST
 * POST route reuses this so both transports share size/mime gates. The cap
 * here is a defense-in-depth byte ceiling — the real "is this doc too big"
 * decision happens after extraction in `DocumentTextExtractor` against the
 * ~50K-char / ~20-page caps.
 */

const ALLOWED_MIME = new Set<string>([
  'text/plain',
  'text/markdown',
  'application/pdf',
])

// Generous byte ceiling so a legitimate 20-page PDF (often 2–5 MB) passes
// through, while a wildly out-of-band upload (50 MB image renamed to .pdf)
// is bounced before we hit the parser.
const MAX_BYTES = 10 * 1024 * 1024

export interface RawUploadDocumentInput {
  fieldContextId: string
  filename: string
  mimeType: string
  fileBase64: string
  hint?: string | null
}

export interface ParsedUploadDocumentInput {
  fieldContextId: string
  filename: string
  mimeType: string
  buffer: Buffer
  hint: string | null
}

export type ValidateUploadDocumentResult =
  | { ok: true; parsed: ParsedUploadDocumentInput }
  | { ok: false; error: string }

function normaliseMimeType(raw: string): string {
  const semi = raw.indexOf(';')
  return (semi === -1 ? raw : raw.slice(0, semi)).trim().toLowerCase()
}

function decodeBase64Strict(b64: string): Buffer | null {
  // Node's Buffer.from('@@@', 'base64') silently returns an empty buffer.
  // Re-encode to detect whether the input round-trips, which catches the
  // "looked like base64 but wasn't" case while staying permissive on
  // whitespace/padding variations.
  if (!/^[A-Za-z0-9+/=\s]*$/.test(b64)) return null
  const decoded = Buffer.from(b64, 'base64')
  const reencoded = decoded.toString('base64')
  const normalised = b64.replace(/\s+/g, '')
  if (reencoded.replace(/=+$/, '') !== normalised.replace(/=+$/, '')) {
    return null
  }
  return decoded
}

export function validateUploadDocumentInput(
  input: RawUploadDocumentInput
): ValidateUploadDocumentResult {
  const fieldContextId = input.fieldContextId?.trim() || ''
  if (!fieldContextId) {
    return { ok: false, error: 'fieldContextId is required.' }
  }

  const filename = input.filename?.trim() || ''
  if (!filename) {
    return { ok: false, error: 'filename is required.' }
  }

  const mimeType = normaliseMimeType(input.mimeType || '')
  if (!ALLOWED_MIME.has(mimeType)) {
    return {
      ok: false,
      error: `We don't yet support this file type ("${mimeType}"). v1 accepts .txt, .md, and .pdf.`,
    }
  }

  const buffer = decodeBase64Strict(input.fileBase64 || '')
  if (buffer === null) {
    return { ok: false, error: 'fileBase64 is not a valid base64 payload.' }
  }
  if (buffer.length > MAX_BYTES) {
    return {
      ok: false,
      error: `This document is too large (${(buffer.length / (1024 * 1024)).toFixed(1)} MB). The upload limit is ${MAX_BYTES / (1024 * 1024)} MB.`,
    }
  }

  const hintRaw = (input.hint ?? '').trim()
  const hint = hintRaw.length > 0 ? hintRaw : null

  return {
    ok: true,
    parsed: { fieldContextId, filename, mimeType, buffer, hint },
  }
}
