import {
  buildDocumentDownloadUrl,
  documentDownloadPath,
  parseDocumentDownloadLocation,
} from './document-download-url'

describe('document-download-url', () => {
  // Keep the suite hermetic: pin the base-url env and the Vercel host so the
  // resolved URL never depends on the ambient environment the tests run in.
  const ORIGINAL_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
  const ORIGINAL_VERCEL_HOST = process.env.VERCEL_PROJECT_PRODUCTION_URL

  beforeEach(() => {
    process.env.NEXT_PUBLIC_BASE_URL = 'https://app.goalpost.test'
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL
  })

  afterEach(() => {
    if (ORIGINAL_BASE_URL === undefined) delete process.env.NEXT_PUBLIC_BASE_URL
    else process.env.NEXT_PUBLIC_BASE_URL = ORIGINAL_BASE_URL
    if (ORIGINAL_VERCEL_HOST === undefined)
      delete process.env.VERCEL_PROJECT_PRODUCTION_URL
    else process.env.VERCEL_PROJECT_PRODUCTION_URL = ORIGINAL_VERCEL_HOST
  })

  describe('documentDownloadPath', () => {
    it('builds the relative download path for a document id', () => {
      expect(documentDownloadPath('doc_1')).toBe(
        '/api/ingest/document/doc_1/download'
      )
    })

    it('URL-encodes the document id in the path', () => {
      // A slash / space in the id must not break out of the path segment.
      expect(documentDownloadPath('a b/c')).toBe(
        '/api/ingest/document/a%20b%2Fc/download'
      )
    })
  })

  describe('buildDocumentDownloadUrl', () => {
    it('prefixes the resolved base url and ends with the download path', () => {
      expect(buildDocumentDownloadUrl('doc_1')).toBe(
        'https://app.goalpost.test/api/ingest/document/doc_1/download'
      )
    })

    it('URL-encodes the document id inside the absolute url', () => {
      expect(buildDocumentDownloadUrl('a b/c')).toBe(
        'https://app.goalpost.test/api/ingest/document/a%20b%2Fc/download'
      )
    })

    it('strips a trailing slash from an explicit base url so paths never double-slash', () => {
      process.env.NEXT_PUBLIC_BASE_URL = 'https://app.goalpost.test/'
      expect(buildDocumentDownloadUrl('doc_1')).toBe(
        'https://app.goalpost.test/api/ingest/document/doc_1/download'
      )
    })

    it('falls back to the Vercel production host when base url is unset', () => {
      delete process.env.NEXT_PUBLIC_BASE_URL
      process.env.VERCEL_PROJECT_PRODUCTION_URL = 'my-app.vercel.app'
      expect(buildDocumentDownloadUrl('doc_1')).toBe(
        'https://my-app.vercel.app/api/ingest/document/doc_1/download'
      )
    })

    it('falls back to localhost when no server base url is configured', () => {
      delete process.env.NEXT_PUBLIC_BASE_URL
      delete process.env.VERCEL_PROJECT_PRODUCTION_URL
      expect(buildDocumentDownloadUrl('doc_1')).toBe(
        'http://localhost:3000/api/ingest/document/doc_1/download'
      )
    })
  })

  describe('parseDocumentDownloadLocation', () => {
    it('recognises the absolute durable URL and returns a clean relative path', () => {
      const abs = buildDocumentDownloadUrl('document_abc')
      expect(parseDocumentDownloadLocation(abs)).toEqual({
        documentId: 'document_abc',
        path: '/api/ingest/document/document_abc/download',
      })
    })

    it('recognises a bare relative download path (deploy-domain change survives)', () => {
      expect(
        parseDocumentDownloadLocation('/api/ingest/document/document_abc/download')
      ).toEqual({
        documentId: 'document_abc',
        path: '/api/ingest/document/document_abc/download',
      })
    })

    it('matches regardless of the host in the stored absolute URL', () => {
      expect(
        parseDocumentDownloadLocation(
          'https://old-deploy.example.com/api/ingest/document/document_xyz/download'
        )
      ).toEqual({
        documentId: 'document_xyz',
        path: '/api/ingest/document/document_xyz/download',
      })
    })

    it('decodes a URL-encoded document id and re-encodes it in the path', () => {
      expect(
        parseDocumentDownloadLocation(
          '/api/ingest/document/a%20b/download'
        )
      ).toEqual({
        documentId: 'a b',
        path: '/api/ingest/document/a%20b/download',
      })
    })

    it('tolerates a trailing slash', () => {
      expect(
        parseDocumentDownloadLocation('/api/ingest/document/doc_1/download/')
      ).toEqual({
        documentId: 'doc_1',
        path: '/api/ingest/document/doc_1/download',
      })
    })

    it.each([
      ['a physical place', 'Berlin, Germany'],
      ['an external source URL', 'https://example.com/some-article'],
      ['a look-alike but wrong path', '/api/ingest/document/doc_1/preview'],
      ['a path with an extra segment', '/api/ingest/document/doc_1/download/extra'],
      // A lone `%` makes the id segment undecodable — must fall through to null,
      // never throw URIError during render.
      ['an undecodable id segment', '/api/ingest/document/50%/download'],
      ['empty string', ''],
      ['whitespace only', '   '],
    ])('returns null for %s', (_label, value) => {
      expect(parseDocumentDownloadLocation(value)).toBeNull()
    })

    it('returns null for null / undefined', () => {
      expect(parseDocumentDownloadLocation(null)).toBeNull()
      expect(parseDocumentDownloadLocation(undefined)).toBeNull()
    })
  })
})
