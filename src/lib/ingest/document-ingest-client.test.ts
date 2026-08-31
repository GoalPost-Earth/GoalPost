/**
 * Unit tests for the pure/client-side pieces of asynchronous document
 * ingestion (GOAL-292). No Neo4j, no network — everything here is either a pure
 * function or driven by an injected Apollo stub, so this suite runs in
 * milliseconds and is safe under a plain `npx jest`.
 *
 * The queue's graph behaviour is covered separately by
 * `document-ingest-queue.test.ts` (integration, needs Neo4j).
 */

import {
  documentIdFromBlobKey,
  type IngestDocumentInput,
} from './handle-ingest-document'
import { memberSafeIngestFailureMessage } from './document-ingest-queue'
import { watchDocumentIngest } from './watch-document-ingest'

describe('documentIdFromBlobKey', () => {
  // This is load-bearing for idempotency: a retried POST /process must re-anchor
  // the SAME document, and the only thing making that true is deriving the id
  // from the server-minted blob key instead of generating a fresh one.
  it('extracts the server-minted document id from a presigned key', () => {
    const id = 'document_1a1561f4-edab-4fe7-9733-75f04faa5ae5'
    expect(documentIdFromBlobKey(`documents/${id}/report.pdf`)).toBe(id)
  })

  it('is stable across calls — the property idempotency depends on', () => {
    const key = 'documents/document_1a1561f4-edab-4fe7-9733-75f04faa5ae5/a b.txt'
    expect(documentIdFromBlobKey(key)).toBe(documentIdFromBlobKey(key))
  })

  it('normalises case so one blob can never yield two document ids', () => {
    const upper = 'documents/document_1A1561F4-EDAB-4FE7-9733-75F04FAA5AE5/x.txt'
    expect(documentIdFromBlobKey(upper)).toBe(
      'document_1a1561f4-edab-4fe7-9733-75f04faa5ae5'
    )
  })

  it.each([
    ['a filename with no folder', 'report.pdf'],
    ['the server-side upload shape', 'documents/doc-123/report.pdf'],
    ['the test-utils shape', 'documents/test-abc/report.pdf'],
    ['a key with no filename segment', 'documents/document_1a1561f4-edab-4fe7-9733-75f04faa5ae5/'],
    ['a traversal attempt', '../documents/document_1a1561f4-edab-4fe7-9733-75f04faa5ae5/x'],
    ['an empty key', ''],
  ])('returns null for %s so the caller mints an id instead', (_label, key) => {
    expect(documentIdFromBlobKey(key)).toBeNull()
  })
})

describe('memberSafeIngestFailureMessage', () => {
  // statusMessage is rendered verbatim to every member of the Space, so the two
  // reasons that interpolate untrusted text must never pass it through
  // (kb/07 Rule 1).
  it('replaces parse_failure copy, which embeds the parser error verbatim', () => {
    const raw = 'Could not read the PDF: FormatError: bad XRef entry at 0x1f'
    const safe = memberSafeIngestFailureMessage('parse_failure', raw)
    expect(safe).not.toContain('FormatError')
    expect(safe).not.toContain('0x1f')
    expect(safe).toMatch(/could not read this document/i)
  })

  it('replaces unsupported_mime copy, which echoes client input', () => {
    const safe = memberSafeIngestFailureMessage(
      'unsupported_mime',
      "We don't support this file type (application/x-<script>)."
    )
    expect(safe).not.toContain('script')
    expect(safe).toBe("We don't support this file type.")
  })

  it.each(['blob_missing', 'oversize_pages', 'oversize_chars', 'not_found'])(
    'passes %s through — authored copy carrying useful detail',
    (reason) => {
      const authored = 'This document is too large (12.4 MB).'
      expect(memberSafeIngestFailureMessage(reason, authored)).toBe(authored)
    }
  )
})

describe('watchDocumentIngest', () => {
  const documentId = 'document_abc'
  const fieldContextId = 'ctx_1'

  function stubClient(pages: unknown[]) {
    const queue = [...pages]
    const query = jest.fn(async () => ({
      data: {
        documentsByFieldContext: queue.length > 1 ? queue.shift() : queue[0],
      },
    }))
    return { client: { query } as never, query }
  }

  it('reports complete with the counts and newest ingest thread', async () => {
    const { client } = stubClient([
      [
        {
          id: documentId,
          status: 'COMPLETE',
          ingestCreatedEntityCount: 4,
          ingestFailedEntityCount: 1,
          ingestThreads: [
            { id: 'thread_old', createdAt: '2026-08-01T00:00:00Z' },
            { id: 'thread_new', createdAt: '2026-08-19T00:00:00Z' },
          ],
        },
      ],
    ])
    const outcome = await watchDocumentIngest(client, {
      documentId,
      fieldContextId,
    })
    expect(outcome).toEqual({
      state: 'complete',
      threadId: 'thread_new',
      createdEntityCount: 4,
      failedEntityCount: 1,
    })
  })

  it('reports failed with the member-safe message', async () => {
    const { client } = stubClient([
      [{ id: documentId, status: 'FAILED', statusMessage: 'We could not read this document.' }],
    ])
    await expect(
      watchDocumentIngest(client, { documentId, fieldContextId })
    ).resolves.toEqual({
      state: 'failed',
      message: 'We could not read this document.',
    })
  })

  it('keeps polling through PENDING and PROCESSING before settling', async () => {
    const { client, query } = stubClient([
      [{ id: documentId, status: 'PENDING' }],
      [{ id: documentId, status: 'PROCESSING' }],
      [
        {
          id: documentId,
          status: 'COMPLETE',
          ingestCreatedEntityCount: 0,
          ingestFailedEntityCount: 0,
          ingestThreads: [],
        },
      ],
    ])
    const outcome = await watchDocumentIngest(client, {
      documentId,
      fieldContextId,
    })
    expect(outcome.state).toBe('complete')
    expect(query).toHaveBeenCalledTimes(3)
  }, 20000)

  it('treats running out of budget as pending, NOT as a failure', async () => {
    // The on-page status chip keeps tracking after the watch gives up, so the
    // caller must say "still working" rather than reporting an error.
    const { client, query } = stubClient([[{ id: documentId, status: 'PENDING' }]])
    await expect(
      watchDocumentIngest(client, { documentId, fieldContextId, timeoutMs: 1 })
    ).resolves.toEqual({ state: 'pending' })
    // The deadline is checked at the top of the loop, before the interval sleep,
    // so an exhausted budget still costs at most one poll — never a stream.
    expect(query.mock.calls.length).toBeLessThanOrEqual(1)
  })

  it('stops watching when the document is no longer visible', async () => {
    // Deleted mid-ingest, or read access lost — nothing left to report on.
    const { client } = stubClient([[]])
    await expect(
      watchDocumentIngest(client, { documentId, fieldContextId })
    ).resolves.toEqual({ state: 'pending' })
  })

  it('survives a transient query rejection and keeps polling', async () => {
    let call = 0
    const client = {
      query: jest.fn(async () => {
        call += 1
        if (call === 1) throw new Error('Network error: Failed to fetch')
        return {
          data: {
            documentsByFieldContext: [
              {
                id: documentId,
                status: 'COMPLETE',
                ingestCreatedEntityCount: 2,
                ingestFailedEntityCount: 0,
                ingestThreads: [],
              },
            ],
          },
        }
      }),
    } as never
    const outcome = await watchDocumentIngest(client, {
      documentId,
      fieldContextId,
    })
    expect(outcome.state).toBe('complete')
  }, 20000)
})

describe('IngestDocumentInput contract', () => {
  it('carries no documentId — the server derives it from the blob key', () => {
    // Guards the idempotency contract at the type level: reintroducing a
    // client-supplied id here is what would let a retry create a second
    // document over the same blob.
    const input: IngestDocumentInput = {
      currentUserId: 'u1',
      fieldContextId: 'ctx_1',
      filename: 'a.txt',
      mimeType: 'text/plain',
      blobKey: 'documents/document_1a1561f4-edab-4fe7-9733-75f04faa5ae5/a.txt',
      sizeBytes: 10,
      hint: null,
    }
    expect('documentId' in input).toBe(false)
  })
})
