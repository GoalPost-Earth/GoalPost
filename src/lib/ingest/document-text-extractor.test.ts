import { extractDocumentText } from './document-text-extractor'

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
    expect(result.pageCount).toBe(1) // .txt has no concept of pages
  })

  it('treats text/plain; charset=utf-8 (with parameters) the same as text/plain', async () => {
    const result = await extractDocumentText({
      mimeType: 'text/plain; charset=utf-8',
      buffer: Buffer.from('hello', 'utf8'),
      filename: 'hello.txt',
    })
    expect(result.text).toBe('hello')
  })

  it('rejects unsupported mimeTypes in this slice with a typed error', async () => {
    // PDF and Markdown ship in slice 3; .docx is permanently out of scope.
    await expect(
      extractDocumentText({
        mimeType: 'application/pdf',
        buffer: Buffer.from('%PDF-1.7\n'),
        filename: 'x.pdf',
      })
    ).rejects.toThrow(/text\/plain/)
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
})
