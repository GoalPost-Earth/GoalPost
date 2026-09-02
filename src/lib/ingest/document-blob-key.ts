/**
 * One place that knows the shape of a Document's blob key:
 * `documents/<documentId>/<sanitized-filename>`.
 *
 * The presign route mints keys in this shape for browser uploads, the process
 * route validates that shape before anchoring, and `documentIdFromBlobKey`
 * parses the id back out of it. Server-side writers (the bulk article import
 * storing a fetched article, GOAL-344) must produce the same shape so every
 * downstream reader — download, re-extract, delete — treats their documents
 * exactly like an upload.
 */

/**
 * Keep the extension; strip path separators and control characters so the
 * resulting storage key is predictable. The display filename on the Document
 * node stays verbatim — this only affects the key, never the label a member
 * sees.
 */
export function sanitizeDocumentFilename(raw: string): string {
  return (
    raw
      .replace(/[\\/\0-\x1f]/g, '_')
      .replace(/^\.+/, '')
      .slice(0, 200) || 'upload'
  )
}

export function buildDocumentBlobKey(
  documentId: string,
  filename: string
): string {
  return `documents/${documentId}/${sanitizeDocumentFilename(filename)}`
}
