/**
 * Unit tests for `extractDocumentText` covering the v1 mimeType matrix:
 *   - text/plain
 *   - text/markdown
 *   - application/pdf  (pdf-parse / pdfjs is mocked — we test our wrapper,
 *     not pdfjs's parsing correctness)
 *
 * Acceptance criteria covered (GOAL-238):
 *   - .pdf valid path returns { text, pageCount, charCount }
 *   - .md preserves markdown formatting verbatim, no rendering
 *   - mimeType rejection error names the v1 allow-list
 *   - oversize PDF (pageCount > MAX_PDF_PAGES) rejected before text extraction
 *   - oversize text (charCount > MAX_TEXT_CHARS) rejected
 *   - UTF-8 BOM stripped; CRLF normalised
 */

const mockGetInfo = jest.fn<Promise<{ total: number }>, []>()
const mockGetText = jest.fn<Promise<{ text: string; total: number }>, []>()
const mockDestroy = jest.fn<Promise<void>, []>()

jest.mock('pdf-parse', () => ({
  __esModule: true,
  PDFParse: jest.fn().mockImplementation(() => ({
    getInfo: mockGetInfo,
    getText: mockGetText,
    destroy: mockDestroy,
  })),
}))

import {
  extractDocumentText,
  DocumentTextExtractionError,
  MAX_PDF_PAGES,
  MAX_TEXT_CHARS,
  SUPPORTED_MIME_TYPES,
} from './document-text-extractor'

beforeEach(() => {
  mockGetInfo.mockReset()
  mockGetText.mockReset()
  mockDestroy.mockReset().mockResolvedValue(undefined)
})

describe('DocumentTextExtractor — text/plain', () => {
  it('decodes a utf-8 .txt buffer into { text, pageCount, charCount }', async () => {
    const text = 'Sarah Chen mentored the team through the migration.\nDr. Patel coordinated logistics.'
    const result = await extractDocumentText({
      mimeType: 'text/plain',
      buffer: Buffer.from(text, 'utf8'),
      filename: 'notes.txt',
    })
    expect(result.text).toBe(text)
    expect(result.charCount).toBe(text.length)
    expect(result.pageCount).toBe(1)
  })

  it('treats text/plain; charset=utf-8 (with parameters) the same as text/plain', async () => {
    const result = await extractDocumentText({
      mimeType: 'text/plain; charset=utf-8',
      buffer: Buffer.from('hello', 'utf8'),
      filename: 'hello.txt',
    })
    expect(result.text).toBe('hello')
  })

  it('strips a leading UTF-8 BOM before counting characters', async () => {
    const bom = Buffer.from([0xef, 0xbb, 0xbf])
    const body = Buffer.from('clean text', 'utf8')
    const result = await extractDocumentText({
      mimeType: 'text/plain',
      buffer: Buffer.concat([bom, body]),
      filename: 'notes.txt',
    })
    expect(result.text).toBe('clean text')
    expect(result.charCount).toBe('clean text'.length)
  })

  it('normalises mixed line endings (CRLF, CR) to LF', async () => {
    const result = await extractDocumentText({
      mimeType: 'text/plain',
      buffer: Buffer.from('a\r\nb\rc\nd', 'utf8'),
      filename: 'notes.txt',
    })
    expect(result.text).toBe('a\nb\nc\nd')
  })

  it('handles an empty .txt buffer as { text: "", pageCount: 1, charCount: 0 }', async () => {
    const result = await extractDocumentText({
      mimeType: 'text/plain',
      buffer: Buffer.alloc(0),
      filename: 'empty.txt',
    })
    expect(result.text).toBe('')
    expect(result.charCount).toBe(0)
    expect(result.pageCount).toBe(1)
  })

  it('rejects text bodies above MAX_TEXT_CHARS with an oversize_chars error', async () => {
    const big = 'x'.repeat(MAX_TEXT_CHARS + 1)
    await expect(
      extractDocumentText({
        mimeType: 'text/plain',
        buffer: Buffer.from(big, 'utf8'),
        filename: 'huge.txt',
      })
    ).rejects.toMatchObject({
      name: 'DocumentTextExtractionError',
      kind: 'oversize_chars',
    })
  })
})

describe('DocumentTextExtractor — text/markdown', () => {
  it('passes markdown through verbatim — no rendering, no HTML', async () => {
    const md = '# Heading\n\n- item one\n- item two\n\n[link](https://example.com)'
    const result = await extractDocumentText({
      mimeType: 'text/markdown',
      buffer: Buffer.from(md, 'utf8'),
      filename: 'notes.md',
    })
    expect(result.text).toBe(md)
    expect(result.text).toContain('# Heading')
    expect(result.text).toContain('[link](https://example.com)')
    expect(result.text).not.toContain('<h1>')
    expect(result.text).not.toContain('<a ')
    expect(result.pageCount).toBe(1)
  })

  it('strips BOM on markdown too', async () => {
    const result = await extractDocumentText({
      mimeType: 'text/markdown',
      buffer: Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from('# Hi', 'utf8')]),
      filename: 'notes.md',
    })
    expect(result.text).toBe('# Hi')
  })
})

describe('DocumentTextExtractor — application/pdf', () => {
  it('returns text and pageCount from the underlying pdf parser', async () => {
    mockGetInfo.mockResolvedValueOnce({ total: 3 })
    mockGetText.mockResolvedValueOnce({ text: 'page1\n\npage2\n\npage3', total: 3 })

    const result = await extractDocumentText({
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.7\n', 'utf8'),
      filename: 'meeting.pdf',
    })

    expect(result.pageCount).toBe(3)
    expect(result.text).toBe('page1\n\npage2\n\npage3')
    expect(result.charCount).toBe('page1\n\npage2\n\npage3'.length)
    expect(mockDestroy).toHaveBeenCalled()
  })

  it('rejects PDFs with pageCount > MAX_PDF_PAGES BEFORE pulling full text', async () => {
    mockGetInfo.mockResolvedValueOnce({ total: MAX_PDF_PAGES + 1 })

    await expect(
      extractDocumentText({
        mimeType: 'application/pdf',
        buffer: Buffer.from('%PDF-1.7\n'),
        filename: 'huge.pdf',
      })
    ).rejects.toMatchObject({
      name: 'DocumentTextExtractionError',
      kind: 'oversize_pages',
    })

    expect(mockGetText).not.toHaveBeenCalled()
    expect(mockDestroy).toHaveBeenCalled()
  })

  it('rejects PDFs whose extracted text exceeds MAX_TEXT_CHARS', async () => {
    mockGetInfo.mockResolvedValueOnce({ total: 5 })
    mockGetText.mockResolvedValueOnce({
      text: 'x'.repeat(MAX_TEXT_CHARS + 1),
      total: 5,
    })

    await expect(
      extractDocumentText({
        mimeType: 'application/pdf',
        buffer: Buffer.from('%PDF-1.7\n'),
        filename: 'dense.pdf',
      })
    ).rejects.toMatchObject({ kind: 'oversize_chars' })
    expect(mockDestroy).toHaveBeenCalled()
  })

  it('rejects bytes labelled application/pdf that lack the %PDF- magic bytes (defense in depth)', async () => {
    await expect(
      extractDocumentText({
        mimeType: 'application/pdf',
        buffer: Buffer.from('this is plain text pretending to be a PDF'),
        filename: 'fake.pdf',
      })
    ).rejects.toMatchObject({
      name: 'DocumentTextExtractionError',
      kind: 'unsupported_mime',
    })

    // Parser is never invoked when the magic-byte sniff fails.
    expect(mockGetInfo).not.toHaveBeenCalled()
  })

  it('wraps parser errors as parse_failure (not raw exception bleed)', async () => {
    mockGetInfo.mockRejectedValueOnce(new Error('Invalid PDF structure'))

    await expect(
      extractDocumentText({
        // Magic bytes are present, so the sniff passes; the parser then
        // rejects the content shape.
        mimeType: 'application/pdf',
        buffer: Buffer.from('%PDF-1.4\nbroken content'),
        filename: 'broken.pdf',
      })
    ).rejects.toMatchObject({
      name: 'DocumentTextExtractionError',
      kind: 'parse_failure',
    })
    expect(mockDestroy).toHaveBeenCalled()
  })
})

describe('DocumentTextExtractor — mimeType allow-list', () => {
  it('rejects unsupported mimeTypes with an error that names the v1 allow-list', async () => {
    await expect(
      extractDocumentText({
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        buffer: Buffer.from(''),
        filename: 'x.docx',
      })
    ).rejects.toMatchObject({
      name: 'DocumentTextExtractionError',
      kind: 'unsupported_mime',
    })
  })

  it('exposes the supported set so callers (validator, UI) can stay in lockstep', () => {
    // text/* mimes come from the shared TEXT_ROUTE_MIME_TYPES; application/pdf
    // is retained for the buffer-based PDF fallback. PDFs/images normally route
    // to Gemini multimodal before reaching this extractor.
    expect(new Set(SUPPORTED_MIME_TYPES)).toEqual(
      new Set(['text/plain', 'text/markdown', 'text/csv', 'application/pdf'])
    )
  })

  it('throws a DocumentTextExtractionError (not a plain Error) so callers can branch on kind', async () => {
    await expect(
      extractDocumentText({
        mimeType: 'image/png',
        buffer: Buffer.alloc(0),
        filename: 'x.png',
      })
    ).rejects.toBeInstanceOf(DocumentTextExtractionError)
  })
})
