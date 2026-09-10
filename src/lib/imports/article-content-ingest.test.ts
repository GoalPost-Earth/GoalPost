import type { ArticleImportRowInput } from './article-import'
import type { ArticleFetchResult } from './article-url-fetcher'

/**
 * GOAL-344 — the per-row orchestration that turns a sheet row's link into a
 * stored article + a document-ingest run. Everything with a network or a
 * database behind it is mocked; the suite pins the decision logic: the two
 * dedupe checks, the fetch → store → pipeline → fill sequence, the
 * graceful-degradation branches, and the created/updated arithmetic the receipt
 * reports.
 *
 * GOAL-356 — and, above all, that a document-linked row yields ONE node: the
 * article lands on the row's own Resource, not on a second one beside it.
 */

const anchorDocument = jest.fn().mockResolvedValue(undefined)
const attachSourceFileToResource = jest.fn().mockResolvedValue('attached')
jest.mock('@/lib/ingest/document-storage', () => ({
  anchorDocument: (input: unknown) => anchorDocument(input),
  attachSourceFileToResource: (input: unknown) =>
    attachSourceFileToResource(input),
}))

const runDocumentIngestPipeline = jest.fn()
jest.mock('@/lib/ingest/run-document-ingest-pipeline', () => ({
  ...jest.requireActual('@/lib/ingest/run-document-ingest-pipeline'),
  runDocumentIngestPipeline: (deps: unknown, input: unknown) =>
    runDocumentIngestPipeline(deps, input),
}))

const markDocumentIngestComplete = jest.fn().mockResolvedValue(undefined)
const markDocumentIngestFailed = jest.fn().mockResolvedValue(undefined)
jest.mock('@/lib/ingest/document-ingest-queue', () => ({
  ...jest.requireActual('@/lib/ingest/document-ingest-queue'),
  markDocumentIngestComplete: (input: unknown) =>
    markDocumentIngestComplete(input),
  markDocumentIngestFailed: (input: unknown) => markDocumentIngestFailed(input),
}))

import {
  ARTICLE_ALREADY_READ_MESSAGE,
  ARTICLE_EXTRACTION_FAILED_MESSAGE,
  ARTICLE_IN_PROGRESS_MESSAGE,
  ARTICLE_PREVIOUS_FAILURE_MESSAGE,
  ARTICLE_UNREADABLE_PAGE_MESSAGE,
  buildArticleDocumentHint,
  countArticleEntities,
  ingestArticleForRow,
  type ArticleContentIngestDeps,
} from './article-content-ingest'
import { createMemoryBlobStore } from '@/lib/ingest/blob-store'

const row: ArticleImportRowInput = {
  row: 2,
  title: 'Seeing People as Living Systems',
  author: 'Veronique Letellier',
  date: '2025-05-19',
  url: 'https://example.org/articles/living-systems',
  pulseType: 'ResourcePulse',
}

const articleHtml = `<html><head><title>Seeing People as Living Systems</title></head><body><article><p>${'Leadership as a living system, not a machine. '.repeat(12)}</p></article></body></html>`

function htmlFetch(): ArticleFetchResult {
  return {
    ok: true,
    kind: 'html',
    buffer: Buffer.from(articleHtml, 'utf8'),
    contentType: 'text/html',
    charset: 'utf-8',
    finalUrl: row.url,
  }
}

/**
 * A driver double. `executeRead` answers two different lookups — the row
 * pulse's shape (GOAL-356) and the sourceUrl dedupe — so it dispatches on the
 * query text; `executeWrite` answers the attach/fill statement. Each test sets
 * what they return.
 *
 * `rowPulse` defaults to a file-less Resource, which is what a freshly created
 * `ResourcePulse` row is and therefore the merged path. Pass `null` for a row
 * whose pulse cannot be resolved, or `isResource: false` for a goal/story row.
 */
function fakeDriver(options: {
  rowPulse?: {
    isResource: boolean
    hasSourceFile: boolean
    status: string
  } | null
  existing?: { id: string; status: string } | null
  filled?: boolean
}) {
  const reads: Array<{ query: string; params: unknown }> = []
  const writes: unknown[] = []
  const rowPulse =
    options.rowPulse === undefined
      ? { isResource: true, hasSourceFile: false, status: 'COMPLETE' }
      : options.rowPulse
  const driver = {
    session: () => ({
      executeRead: async (work: (tx: unknown) => unknown) =>
        work({
          run: async (query: string, params: unknown) => {
            reads.push({ query, params })
            if (query.includes('AS isResource')) {
              return {
                records: rowPulse
                  ? [
                      {
                        get: (key: string) =>
                          key === 'isResource'
                            ? rowPulse.isResource
                            : key === 'hasSourceFile'
                              ? rowPulse.hasSourceFile
                              : rowPulse.status,
                      },
                    ]
                  : [],
              }
            }
            const existing = options.existing ?? null
            return {
              records: existing
                ? [
                    {
                      get: (key: string) =>
                        key === 'id' ? existing.id : existing.status,
                    },
                  ]
                : [],
            }
          },
        }),
      executeWrite: async (work: (tx: unknown) => unknown) =>
        work({
          run: async (query: string, params: unknown) => {
            writes.push({ query, params })
            return {
              records: [{ get: () => options.filled ?? false }],
            }
          },
        }),
      close: async () => undefined,
    }),
  }
  return { driver, reads, writes }
}

function deps(
  driver: unknown,
  fetchSource: () => Promise<ArticleFetchResult>
): ArticleContentIngestDeps {
  return {
    driver: driver as ArticleContentIngestDeps['driver'],
    blobStore: createMemoryBlobStore(),
    pdfExtractionClient: jest.fn(),
    textExtractionClient: jest.fn(),
    fetchSource,
  }
}

const baseInput = {
  fieldContextId: 'ctx_1',
  contextTitle: 'Experiencing',
  requesterUserId: 'user_1',
  row,
  rowPulseId: 'pulse_row',
  authorName: 'Veronique Letellier',
}

function okRun(executedToolCalls: unknown[], extractionFailed = false) {
  return {
    ok: true,
    documentId: 'document_x',
    fieldContextId: 'ctx_1',
    threadId: 'thread_1',
    filename: 'x.txt',
    executedToolCalls,
    extractionFailed,
  }
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('ingestArticleForRow', () => {
  it('stores the article ON the row pulse, runs the pipeline, and fills the body — one node, not two', async () => {
    const { driver, writes } = fakeDriver({ existing: null, filled: true })
    const d = deps(driver, async () => htmlFetch())
    runDocumentIngestPipeline.mockResolvedValue(
      okRun([
        { tool: 'create_person', args: {}, result: { success: true, personId: 'p1' } },
        { tool: 'create_pulse', args: {}, result: { success: true, pulseId: 'p2' } },
        { tool: 'update_pulse', args: {}, result: { success: true } },
        { tool: 'link_entity_to_pulse', args: {}, result: { success: true } },
        { tool: 'create_pulse', args: {}, result: { success: false } },
      ])
    )

    const result = await ingestArticleForRow(d, baseInput)

    // GOAL-356: no second ResourcePulse is minted for this row.
    expect(anchorDocument).not.toHaveBeenCalled()
    expect(attachSourceFileToResource).toHaveBeenCalledTimes(1)
    const anchored = attachSourceFileToResource.mock.calls[0][0]
    expect(anchored).toMatchObject({
      resourceId: 'pulse_row',
      fieldContextId: 'ctx_1',
      uploaderUserId: 'user_1',
      filename: 'Seeing People as Living Systems.txt',
      mimeType: 'text/plain',
      sourceUrl: row.url,
      status: 'PROCESSING',
    })
    // Same blob key shape as an upload, keyed by the node that holds the file.
    expect(anchored.blobKey).toBe(
      'documents/pulse_row/Seeing People as Living Systems.txt'
    )
    expect(anchored.userHint).toBe(buildArticleDocumentHint(row, 'Veronique Letellier'))
    const stored = await d.blobStore.get(anchored.blobKey)
    expect(stored?.buffer.toString('utf8')).toContain('Leadership as a living system')
    expect(stored?.buffer.toString('utf8')).not.toContain('<article>')

    // The pipeline ran as the requester against the row's own pulse.
    expect(runDocumentIngestPipeline).toHaveBeenCalledWith(
      expect.objectContaining({ blobStore: d.blobStore }),
      expect.objectContaining({
        documentId: 'pulse_row',
        actingUserId: 'user_1',
        userTurnVerb: 'Imported',
      })
    )
    expect(markDocumentIngestComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        documentId: 'pulse_row',
        createdEntityCount: 4,
        failedEntityCount: 1,
      })
    )
    expect(markDocumentIngestFailed).not.toHaveBeenCalled()

    // The fill statement targets that same node — the conditional MERGE inside
    // it is what stops a pulse taking EXTRACTED_FROM provenance to itself.
    expect(writes).toHaveLength(1)
    expect(writes[0]).toMatchObject({
      params: expect.objectContaining({
        fieldContextId: 'ctx_1',
        pulseId: 'pulse_row',
        documentId: 'pulse_row',
        userId: 'user_1',
        placeholder: 'Article by Veronique Letellier, published 2025-05-19: https://example.org/articles/living-systems',
      }),
    })

    // 2 created (person + pulse), 1 updated by the model, +1 for the filled row.
    expect(result).toEqual({
      status: 'extracted',
      message: null,
      created: 2,
      updated: 2,
    })
  })

  it('anchors a separate document Resource for a goal or story row', async () => {
    // Only ResourcePulse declares the source* properties, and a goal plus the
    // article it came from are provenance, not duplicates — so this row keeps
    // the pre-GOAL-356 two-node shape.
    const { driver, writes } = fakeDriver({
      rowPulse: { isResource: false, hasSourceFile: false, status: 'COMPLETE' },
      existing: null,
      filled: true,
    })
    const d = deps(driver, async () => htmlFetch())
    runDocumentIngestPipeline.mockResolvedValue(okRun([]))

    await ingestArticleForRow(d, {
      ...baseInput,
      row: { ...row, pulseType: 'GoalPulse' },
    })

    expect(attachSourceFileToResource).not.toHaveBeenCalled()
    expect(anchorDocument).toHaveBeenCalledTimes(1)
    const anchored = anchorDocument.mock.calls[0][0]
    expect(anchored.documentId).toMatch(/^document_[0-9a-f-]{36}$/)
    expect(anchored.blobKey).toMatch(
      /^documents\/document_[0-9a-f-]{36}\/Seeing People as Living Systems\.txt$/
    )
    // Distinct nodes, so the provenance edge IS written here.
    expect(writes[0]).toMatchObject({
      params: expect.objectContaining({
        pulseId: 'pulse_row',
        documentId: anchored.documentId,
      }),
    })
  })

  it('does not re-read a row whose own pulse already carries the file', async () => {
    // A re-uploaded sheet: create_pulse matched the existing pulse, which has
    // been document-backed since the first import.
    const fetchSource = jest.fn()
    const { driver, writes } = fakeDriver({
      rowPulse: { isResource: true, hasSourceFile: true, status: 'COMPLETE' },
      filled: true,
    })
    const result = await ingestArticleForRow(deps(driver, fetchSource), baseInput)
    expect(fetchSource).not.toHaveBeenCalled()
    expect(attachSourceFileToResource).not.toHaveBeenCalled()
    expect(anchorDocument).not.toHaveBeenCalled()
    // Still re-runs the idempotent fill, against itself.
    expect(writes[0]).toMatchObject({
      params: expect.objectContaining({
        pulseId: 'pulse_row',
        documentId: 'pulse_row',
      }),
    })
    expect(result).toEqual({
      status: 'already_extracted',
      message: ARTICLE_ALREADY_READ_MESSAGE,
      created: 0,
      updated: 1,
    })
  })

  it('only accepts a resource that actually holds a file as proof the link was read', async () => {
    // `sourceUrl` means two things since GOAL-355 — "fetched from" and the
    // member's "found at" column — so the dedupe has to require a real file.
    // Without that, row B whose `url` equals row A's `source_url` is reported
    // already-read and its article is silently never fetched.
    const { driver, reads } = fakeDriver({ existing: null })
    runDocumentIngestPipeline.mockResolvedValue(okRun([]))
    await ingestArticleForRow(deps(driver, async () => htmlFetch()), baseInput)
    const dedupe = reads.find((r) => r.query.includes('d.sourceUrl = $sourceUrl'))
    expect(dedupe?.query).toContain('d.sourceBlobKey IS NOT NULL')
    expect(dedupe?.params).toMatchObject({ resourceType: 'document' })
  })

  it('never matches the row pulse against its own source_url when deduping', async () => {
    // GOAL-355 lets a member put the same link in both `url` and `source_url`,
    // which puts the fetched URL on the row pulse's own `sourceUrl`. The dedupe
    // lookup must exclude that pulse or the article is never read at all.
    const { driver, reads } = fakeDriver({ existing: null })
    runDocumentIngestPipeline.mockResolvedValue(okRun([]))
    await ingestArticleForRow(deps(driver, async () => htmlFetch()), baseInput)
    const dedupe = reads.find((r) => r.query.includes('d.sourceUrl = $sourceUrl'))
    expect(dedupe?.params).toMatchObject({ excludePulseId: 'pulse_row' })
    expect(attachSourceFileToResource).toHaveBeenCalledTimes(1)
  })

  it('never fetches the same link into a field twice', async () => {
    const cases: Array<[string, string, string]> = [
      ['PROCESSING', 'in_progress', ARTICLE_IN_PROGRESS_MESSAGE],
      ['PENDING', 'in_progress', ARTICLE_IN_PROGRESS_MESSAGE],
      ['FAILED', 'extraction_failed', ARTICLE_PREVIOUS_FAILURE_MESSAGE],
    ]
    for (const [status, expected, message] of cases) {
      const fetchSource = jest.fn()
      const { driver, writes } = fakeDriver({ existing: { id: 'document_old', status } })
      const result = await ingestArticleForRow(deps(driver, fetchSource), baseInput)
      expect(fetchSource).not.toHaveBeenCalled()
      expect(writes).toHaveLength(0)
      expect(result).toEqual({ status: expected, message, created: 0, updated: 0 })
    }
    expect(anchorDocument).not.toHaveBeenCalled()
    expect(attachSourceFileToResource).not.toHaveBeenCalled()
  })

  it('re-attaches the row pulse to an already-read article instead of refetching', async () => {
    // A resume after a mid-row crash, or a re-uploaded sheet: the document is
    // COMPLETE, so no fetch — but the row's pulse still gets provenance + fill.
    const fetchSource = jest.fn()
    const { driver, writes } = fakeDriver({
      existing: { id: 'document_old', status: 'COMPLETE' },
      filled: true,
    })
    const result = await ingestArticleForRow(deps(driver, fetchSource), baseInput)
    expect(fetchSource).not.toHaveBeenCalled()
    expect(anchorDocument).not.toHaveBeenCalled()
    expect(attachSourceFileToResource).not.toHaveBeenCalled()
    expect(writes).toHaveLength(1)
    expect(writes[0]).toMatchObject({
      params: expect.objectContaining({ pulseId: 'pulse_row', documentId: 'document_old' }),
    })
    expect(result).toEqual({
      status: 'already_extracted',
      message: ARTICLE_ALREADY_READ_MESSAGE,
      created: 0,
      updated: 1,
    })
  })

  it('treats only the seeded sentence as a placeholder, never a member-written description', async () => {
    const { driver, writes } = fakeDriver({ existing: null, filled: false })
    runDocumentIngestPipeline.mockResolvedValue(okRun([]))
    await ingestArticleForRow(deps(driver, async () => htmlFetch()), {
      ...baseInput,
      row: { ...row, description: 'My own note about why this article matters.' },
    })
    // The placeholder handed to the fill statement is the seeded sentence, so
    // a body equal to the member's description can never match it.
    expect(writes[0]).toMatchObject({
      params: expect.objectContaining({
        placeholder: 'Article by Veronique Letellier, published 2025-05-19: https://example.org/articles/living-systems',
      }),
    })
  })

  it('bounds the model calls for one article', async () => {
    const { driver } = fakeDriver({ existing: null })
    runDocumentIngestPipeline.mockResolvedValue(okRun([]))
    await ingestArticleForRow(deps(driver, async () => htmlFetch()), baseInput)
    const pipelineInput = runDocumentIngestPipeline.mock.calls[0][1] as { modelAbortSignal?: AbortSignal }
    expect(pipelineInput.modelAbortSignal).toBeInstanceOf(AbortSignal)
  })

  it('fetches a failing link once per worker run, not once per row', async () => {
    const fetchSource = jest.fn().mockResolvedValue({
      ok: false,
      reason: 'timeout',
      message: 'The site took too long to respond.',
    })
    const { driver } = fakeDriver({ existing: null })
    const { createArticleContentIngestor } = await import('./article-content-ingest')
    const ingest = createArticleContentIngestor(deps(driver, fetchSource))
    const first = await ingest(baseInput)
    const second = await ingest({ ...baseInput, row: { ...row, row: 3, title: 'Another row, same link' } })
    expect(fetchSource).toHaveBeenCalledTimes(1)
    expect(first).toEqual(second)
    expect(first.status).toBe('fetch_failed')
  })

  it('fails fast for every link on a host that timed out once this run', async () => {
    const fetchSource = jest.fn().mockResolvedValue({
      ok: false,
      reason: 'timeout',
      message: 'The site took too long to respond.',
    })
    const { driver } = fakeDriver({ existing: null })
    const { createArticleContentIngestor } = await import('./article-content-ingest')
    const ingest = createArticleContentIngestor(deps(driver, fetchSource))
    await ingest({ ...baseInput, row: { ...row, url: 'https://slow.example.org/a?n=1' } })
    const second = await ingest({ ...baseInput, row: { ...row, row: 3, url: 'https://slow.example.org/b?n=2' } })
    // A different host is still tried.
    await ingest({ ...baseInput, row: { ...row, row: 4, url: 'https://other.example.org/c' } })
    expect(fetchSource).toHaveBeenCalledTimes(2)
    expect(second.status).toBe('fetch_failed')
  })

  it('does not fail a host fast for a per-page failure such as a login wall', async () => {
    const fetchSource = jest.fn().mockResolvedValue({
      ok: false,
      reason: 'login_required',
      message: 'The site asked for a login or refused the request, so the article could not be read.',
    })
    const { driver } = fakeDriver({ existing: null })
    const { createArticleContentIngestor } = await import('./article-content-ingest')
    const ingest = createArticleContentIngestor(deps(driver, fetchSource))
    await ingest({ ...baseInput, row: { ...row, url: 'https://wall.example.org/a' } })
    await ingest({ ...baseInput, row: { ...row, row: 3, url: 'https://wall.example.org/b' } })
    expect(fetchSource).toHaveBeenCalledTimes(2)
  })

  it('reports a fetch failure with the fetcher\'s member-safe copy and stores nothing', async () => {
    const { driver } = fakeDriver({ existing: null })
    const result = await ingestArticleForRow(
      deps(driver, async () => ({
        ok: false,
        reason: 'login_required',
        message: 'The site asked for a login or refused the request, so the article could not be read.',
      })),
      baseInput
    )
    expect(result).toEqual({
      status: 'fetch_failed',
      message: 'The site asked for a login or refused the request, so the article could not be read.',
      created: 0,
      updated: 0,
    })
    expect(anchorDocument).not.toHaveBeenCalled()
    expect(attachSourceFileToResource).not.toHaveBeenCalled()
    expect(runDocumentIngestPipeline).not.toHaveBeenCalled()
  })

  it('treats a page with no readable article text as unread', async () => {
    const { driver } = fakeDriver({ existing: null })
    const result = await ingestArticleForRow(
      deps(driver, async () => ({
        ...htmlFetch(),
        buffer: Buffer.from('<html><body><nav>Sign in</nav><main>Join now</main></body></html>'),
      })),
      baseInput
    )
    expect(result).toMatchObject({
      status: 'fetch_failed',
      message: ARTICLE_UNREADABLE_PAGE_MESSAGE,
    })
    expect(anchorDocument).not.toHaveBeenCalled()
    expect(attachSourceFileToResource).not.toHaveBeenCalled()
  })

  it('stores a fetched PDF as-is for the multimodal route', async () => {
    const { driver } = fakeDriver({ existing: null })
    const d = deps(driver, async () => ({
      ok: true,
      kind: 'pdf',
      buffer: Buffer.from('%PDF-1.7 fake'),
      contentType: 'application/pdf',
      charset: null,
      finalUrl: row.url,
    }))
    runDocumentIngestPipeline.mockResolvedValue(okRun([]))

    const result = await ingestArticleForRow(d, baseInput)

    // The .pdf extension lives on the filename, never on the pulse title —
    // that suffixed title was the visible half of the GOAL-356 duplicate.
    expect(attachSourceFileToResource.mock.calls[0][0]).toMatchObject({
      resourceId: 'pulse_row',
      filename: 'Seeing People as Living Systems.pdf',
      mimeType: 'application/pdf',
    })
    expect(anchorDocument).not.toHaveBeenCalled()
    expect(result.status).toBe('nothing_extracted')
  })

  it('marks the document FAILED and degrades when the pipeline reports a failure', async () => {
    const { driver } = fakeDriver({ existing: null })
    runDocumentIngestPipeline.mockResolvedValue({
      ok: false,
      reason: 'oversize_chars',
      error: 'too big',
    })
    const result = await ingestArticleForRow(deps(driver, async () => htmlFetch()), baseInput)
    expect(markDocumentIngestFailed).toHaveBeenCalledTimes(1)
    expect(markDocumentIngestComplete).not.toHaveBeenCalled()
    expect(result).toMatchObject({
      status: 'extraction_failed',
      message: ARTICLE_EXTRACTION_FAILED_MESSAGE,
    })
  })

  it('marks the document FAILED and degrades when the pipeline throws', async () => {
    const { driver } = fakeDriver({ existing: null })
    runDocumentIngestPipeline.mockRejectedValue(new Error('driver exploded'))
    const result = await ingestArticleForRow(deps(driver, async () => htmlFetch()), baseInput)
    expect(markDocumentIngestFailed).toHaveBeenCalledTimes(1)
    expect(result.status).toBe('extraction_failed')
    expect(result.message).not.toContain('driver exploded')
  })

  it('degrades without storing when the blob store rejects the write', async () => {
    const { driver } = fakeDriver({ existing: null })
    const d = deps(driver, async () => htmlFetch())
    d.blobStore = {
      ...d.blobStore,
      put: async () => {
        throw new Error('S3 says no')
      },
    }
    const result = await ingestArticleForRow(d, baseInput)
    expect(anchorDocument).not.toHaveBeenCalled()
    expect(attachSourceFileToResource).not.toHaveBeenCalled()
    expect(runDocumentIngestPipeline).not.toHaveBeenCalled()
    expect(result.status).toBe('extraction_failed')
    expect(result.message).not.toContain('S3')
  })

  it('reports extraction_failed with counts when the model itself failed', async () => {
    const { driver } = fakeDriver({ existing: null, filled: false })
    runDocumentIngestPipeline.mockResolvedValue(okRun([], true))
    const result = await ingestArticleForRow(deps(driver, async () => htmlFetch()), baseInput)
    // The document still landed COMPLETE (re-extract is the retry path).
    expect(markDocumentIngestComplete).toHaveBeenCalledTimes(1)
    expect(result).toEqual({
      status: 'extraction_failed',
      message: ARTICLE_EXTRACTION_FAILED_MESSAGE,
      created: 0,
      updated: 0,
    })
  })
})

describe('countArticleEntities', () => {
  it('counts creates, treats enrich-hits as updates, and ignores links and failures', () => {
    expect(
      countArticleEntities([
        { tool: 'create_person', args: {}, result: { success: true } },
        { tool: 'create_pulse', args: {}, result: { success: true, alreadyExisted: true } },
        { tool: 'update_pulse', args: {}, result: { success: true } },
        { tool: 'create_organization', args: {}, result: { success: false } },
        { tool: 'link_entity_to_pulse', args: {}, result: { success: true } },
      ] as never)
    ).toEqual({ created: 1, updated: 2 })
  })
})

describe('buildArticleDocumentHint', () => {
  it('names the title, author, date and link', () => {
    expect(buildArticleDocumentHint(row, 'Veronique Letellier')).toBe(
      'Article "Seeing People as Living Systems" by Veronique Letellier, published 2025-05-19. Source: https://example.org/articles/living-systems'
    )
  })

  it('omits the date clause when the row has none', () => {
    expect(buildArticleDocumentHint({ ...row, date: '' }, 'V')).toBe(
      'Article "Seeing People as Living Systems" by V. Source: https://example.org/articles/living-systems'
    )
  })
})
