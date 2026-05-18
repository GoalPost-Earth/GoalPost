import { validateUploadDocumentInput } from './upload-document-input'

const baseInput = {
  fieldContextId: 'ctx_1',
  filename: 'notes.txt',
  mimeType: 'text/plain',
  fileBase64: Buffer.from('hello world').toString('base64'),
  hint: null as string | null,
}

describe('validateUploadDocumentInput', () => {
  it('accepts a well-formed text/plain input and returns a buffer with the decoded contents', () => {
    const result = validateUploadDocumentInput(baseInput)
    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error('unreachable')
    expect(result.parsed.filename).toBe('notes.txt')
    expect(result.parsed.mimeType).toBe('text/plain')
    expect(result.parsed.buffer.toString('utf8')).toBe('hello world')
  })

  it('accepts text/markdown as a v1 mimeType', () => {
    const result = validateUploadDocumentInput({
      ...baseInput,
      filename: 'notes.md',
      mimeType: 'text/markdown',
      fileBase64: Buffer.from('# Heading\n\nbody').toString('base64'),
    })
    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error('unreachable')
    expect(result.parsed.mimeType).toBe('text/markdown')
  })

  it('accepts application/pdf as a v1 mimeType', () => {
    const result = validateUploadDocumentInput({
      ...baseInput,
      filename: 'doc.pdf',
      mimeType: 'application/pdf',
      fileBase64: Buffer.from('%PDF-1.7\n', 'utf8').toString('base64'),
    })
    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error('unreachable')
    expect(result.parsed.mimeType).toBe('application/pdf')
  })

  it('strips charset parameters from mimeType when normalising', () => {
    const result = validateUploadDocumentInput({
      ...baseInput,
      mimeType: 'text/plain; charset=utf-8',
    })
    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error('unreachable')
    expect(result.parsed.mimeType).toBe('text/plain')
  })

  it('rejects unsupported mimeTypes with a copy that names the v1 allow-list', () => {
    const result = validateUploadDocumentInput({
      ...baseInput,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })
    expect(result.ok).toBe(false)
    if (result.ok) throw new Error('unreachable')
    expect(result.error.toLowerCase()).toMatch(/\.txt.*\.md.*\.pdf/)
  })

  it('rejects an empty filename', () => {
    const result = validateUploadDocumentInput({ ...baseInput, filename: '   ' })
    expect(result.ok).toBe(false)
    if (result.ok) throw new Error('unreachable')
    expect(result.error.toLowerCase()).toContain('filename')
  })

  it('rejects an empty fieldContextId', () => {
    const result = validateUploadDocumentInput({ ...baseInput, fieldContextId: '' })
    expect(result.ok).toBe(false)
    if (result.ok) throw new Error('unreachable')
    expect(result.error.toLowerCase()).toContain('fieldcontextid')
  })

  it('rejects invalid base64 with a clear error', () => {
    const result = validateUploadDocumentInput({
      ...baseInput,
      fileBase64: '@@@not-base64@@@',
    })
    expect(result.ok).toBe(false)
    if (result.ok) throw new Error('unreachable')
    expect(result.error.toLowerCase()).toContain('base64')
  })

  it('rejects files larger than the upload-time byte ceiling', () => {
    const big = 'x'.repeat(11 * 1024 * 1024) // 11 MB, above the 10 MB cap.
    const result = validateUploadDocumentInput({
      ...baseInput,
      fileBase64: Buffer.from(big).toString('base64'),
    })
    expect(result.ok).toBe(false)
    if (result.ok) throw new Error('unreachable')
    expect(result.error.toLowerCase()).toMatch(/large|limit/)
  })

  it('trims and normalises a non-empty hint, returns null when blank', () => {
    const withHint = validateUploadDocumentInput({ ...baseInput, hint: '  Q2 strategy  ' })
    expect(withHint.ok).toBe(true)
    if (!withHint.ok) throw new Error('unreachable')
    expect(withHint.parsed.hint).toBe('Q2 strategy')

    const blankHint = validateUploadDocumentInput({ ...baseInput, hint: '   ' })
    expect(blankHint.ok).toBe(true)
    if (!blankHint.ok) throw new Error('unreachable')
    expect(blankHint.parsed.hint).toBeNull()
  })
})
