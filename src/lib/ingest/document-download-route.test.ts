/**
 * GOAL-316 — the durable document-download route's auth flow.
 *
 * The bug: a signed-out member clicking an upload-populated document link
 * dead-ended on the login page. The route half of the contract is pinned
 * here: an unauthenticated BROWSER navigation must 302 to
 * `/auth/login?returnTo=<download path>` — and that returnTo must survive
 * the login page's sanitizer so the post-login navigation completes the
 * round trip. API callers keep the JSON 401; an empty read-gate verdict maps
 * to an identical 404 for missing-or-forbidden with no presigned URL minted.
 * (executeRead is stubbed here — this suite pins the route's handling of the
 * gate's verdict, not the Cypher gate query itself.)
 *
 * GOAL-321 adds the authenticated-browser half: an empty read-gate verdict on
 * a `text/html` navigation 302s to /document-unavailable (carrying no document
 * id) instead of dead-ending on the raw JSON 404 — which programmatic callers
 * keep.
 */
import { NextRequest } from 'next/server'
import { sanitizeReturnTo } from '@/lib/auth/safe-return-to'

jest.mock('@/app/api/auth/utils', () => ({
  resolveAuthenticatedUserId: jest.fn(),
}))

const executeRead = jest.fn()
const sessionClose = jest.fn()
jest.mock('@/lib/neo4j/driver', () => ({
  driver: {
    session: () => ({
      executeRead: (...args: unknown[]) => executeRead(...args),
      close: (...args: unknown[]) => sessionClose(...args),
    }),
  },
}))

const presignGet = jest.fn()
jest.mock('@/lib/ingest/blob-store', () => ({
  createMemoryBlobStore: () => ({ presignGet }),
}))
jest.mock('@/lib/ingest/s3-blob-store', () => ({
  createS3BlobStore: () => ({ presignGet }),
}))

import { GET } from '@/app/api/ingest/document/[documentId]/download/route'
import { resolveAuthenticatedUserId } from '@/app/api/auth/utils'

const DOC_PATH = '/api/ingest/document/doc_42/download'
const DOC_URL = `http://localhost:3000${DOC_PATH}`

function makeRequest(headers: Record<string, string> = {}): NextRequest {
  return new NextRequest(DOC_URL, { headers })
}

function makeParams(documentId = 'doc_42') {
  return { params: Promise.resolve({ documentId }) }
}

/** Shape executeRead the way the route consumes it (records[0].get('blobKey')). */
function stubBlobKeyLookup(blobKey: string | null) {
  executeRead.mockImplementation(async () => ({
    records: blobKey === null ? [] : [{ get: () => blobKey }],
  }))
}

describe('GET /api/ingest/document/[documentId]/download — auth flow (GOAL-316)', () => {
  const ORIGINAL_BACKEND = process.env.INGEST_BLOB_BACKEND

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.INGEST_BLOB_BACKEND = 'memory'
  })

  afterAll(() => {
    if (ORIGINAL_BACKEND === undefined) delete process.env.INGEST_BLOB_BACKEND
    else process.env.INGEST_BLOB_BACKEND = ORIGINAL_BACKEND
  })

  it('302s a logged-out browser navigation to login with the document path as returnTo', async () => {
    ;(resolveAuthenticatedUserId as jest.Mock).mockReturnValue(null)

    const res = await GET(makeRequest({ accept: 'text/html' }), makeParams())

    expect(res.status).toBe(302)
    const location = new URL(res.headers.get('location')!)
    expect(location.pathname).toBe('/auth/login')
    expect(location.searchParams.get('returnTo')).toBe(DOC_PATH)
    expect(executeRead).not.toHaveBeenCalled()
    expect(presignGet).not.toHaveBeenCalled()
  })

  it('mints a returnTo the login page sanitizer accepts (round-trip contract)', async () => {
    ;(resolveAuthenticatedUserId as jest.Mock).mockReturnValue(null)

    const res = await GET(makeRequest({ accept: 'text/html' }), makeParams())
    const location = new URL(res.headers.get('location')!)
    const returnTo = location.searchParams.get('returnTo')

    // If the sanitizer ever rejects the path this route mints, the post-login
    // navigation silently falls back to "/" and the dead end returns.
    expect(sanitizeReturnTo(returnTo)).toBe(DOC_PATH)
  })

  it('keeps the JSON 401 for logged-out programmatic callers', async () => {
    ;(resolveAuthenticatedUserId as jest.Mock).mockReturnValue(null)

    const res = await GET(makeRequest({ accept: 'application/json' }), makeParams())

    expect(res.status).toBe(401)
    expect(res.headers.get('location')).toBeNull()
  })

  it('302s an authorized member to a fresh presigned GET, uncached', async () => {
    ;(resolveAuthenticatedUserId as jest.Mock).mockReturnValue('user_1')
    stubBlobKeyLookup('ingest/space_1/doc_42.pdf')
    presignGet.mockResolvedValue('https://blobs.example/presigned?sig=abc')

    const res = await GET(makeRequest({ accept: 'text/html' }), makeParams())

    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toBe(
      'https://blobs.example/presigned?sig=abc'
    )
    expect(res.headers.get('cache-control')).toBe('private, no-store')
  })

  it('keeps the JSON 404 for authenticated programmatic callers of a missing document', async () => {
    ;(resolveAuthenticatedUserId as jest.Mock).mockReturnValue('user_1')
    stubBlobKeyLookup(null) // missing OR forbidden — same empty result

    const res = await GET(
      makeRequest({ accept: 'application/json' }),
      makeParams()
    )

    expect(res.status).toBe(404)
    expect(res.headers.get('location')).toBeNull()
    expect(presignGet).not.toHaveBeenCalled()
  })

  // GOAL-321: an authorized member clicking "Open document" on a pulse whose
  // source document was deleted must land on a human-readable page, not a raw
  // JSON body.
  it('302s an authenticated browser navigation for a missing document to /document-unavailable', async () => {
    ;(resolveAuthenticatedUserId as jest.Mock).mockReturnValue('user_1')
    stubBlobKeyLookup(null)

    const res = await GET(makeRequest({ accept: 'text/html' }), makeParams())

    expect(res.status).toBe(302)
    const location = new URL(res.headers.get('location')!)
    expect(location.pathname).toBe('/document-unavailable')
    // No document id may leak into the dead-end URL — the redirect must be
    // identical for missing and forbidden documents alike.
    expect(location.search).toBe('')
    expect(res.headers.get('location')).not.toContain('doc_42')
    expect(presignGet).not.toHaveBeenCalled()
  })

  it('sends a browser caller without Space access to the SAME dead-end as a missing document', async () => {
    ;(resolveAuthenticatedUserId as jest.Mock).mockReturnValue('user_intruder')
    stubBlobKeyLookup(null) // the gate collapses missing and forbidden upstream

    const res = await GET(makeRequest({ accept: 'text/html' }), makeParams())

    expect(res.status).toBe(302)
    expect(new URL(res.headers.get('location')!).pathname).toBe(
      '/document-unavailable'
    )
    expect(presignGet).not.toHaveBeenCalled()
  })
})
