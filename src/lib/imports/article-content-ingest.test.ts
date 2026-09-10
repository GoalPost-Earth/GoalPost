import type { ArticleImportRowInput } from './article-import'
import type { ArticleFetchResult } from './article-url-fetcher'

/**
 * GOAL-344 — the per-row orchestration that turns a sheet row's link into a
 * Document + a document-ingest run. Everything with a network or a database
 * behind it is mocked; the suite pins the decision logic: dedupe by fetched
 * link, the fetch → store → pipeline → attach sequence, the graceful-
 * degradation branches, and the created/updated arithmetic the receipt reports.
 *
 * GOAL-356 split "store" in two. A ResourcePulse row attaches the file to the
 * pulse it already created (`attachSourceFileToResource`) so the member ends up
 * with ONE resource; a Goal/Story row still anchors a separate document
 * (`anchorDocument`), because there the article really is a different artifact.
 * Which of the two mocks a test expects is the assertion that matters most
 * here — calling the wrong one is exactly the duplicate the story removed.
 */

const anchorDocument = jest.fn().mockResolvedValue(undefined)
const attachSourceFileToResource = jest.fn().mockResolvedValue(undefined)
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
 * A driver double: `executeRead` answers the sourceUrl lookup, `executeWrite`
 * answers the attach/fill statement. Each test sets what they return.
 */
function fakeDriver(options: {
  /** Answer for the by-link lookup (findArticleDocument). */
  existing?: { id: string; status: string } | null
  /** Answer for the row's-own-pulse lookup (findResourceSourceFile). */
  own?: { id: string; status: string } | null
  filled?: boolean
}) {
  const reads: unknown[] = []
  const writes: unknown[] = []
  const driver = {
    session: () => ({
      executeRead: async (work: (tx: unknown) => unknown) =>
        work({
          run: async (query: string, params: unknown) => {
            reads.push({ query, params })
            // Two distinct read statements now reach this double; route by the
            // parameter each one seeks on, or a test cannot tell "this row was
            // already read" from "this LINK was already read" — which is the
            // whole distinction GOAL-356 turns on.
            const existing = query.includes('$resourceId')
              ? (options.own ?? null)
              : (options.existing ?? null)
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
  it('fetches, attaches the article to the row\'s own Resource, runs the pipeline against it, and fills the body', async () => {
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

    // GOAL-356 — no second node: the file lands on the row's own pulse, under
    // the same blob key shape an upload gets, as plain text, with the link.
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
    expect(anchored.blobKey).toBe('documents/pulse_row/Seeing People as Living Systems.txt')
    expect(anchored.userHint).toBe(buildArticleDocumentHint(row, 'Veronique Letellier'))
    const stored = await d.blobStore.get(anchored.blobKey)
    expect(stored?.buffer.toString('utf8')).toContain('Leadership as a living system')
    expect(stored?.buffer.toString('utf8')).not.toContain('<article>')

    // The pipeline ran as the requester against that same node, so everything
    // it extracts hangs EXTRACTED_FROM the resource the member can see.
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

    // The fill statement runs with both ends on the same node — the Cypher's
    // `d = p` branch skips the self-edge and fills the body only.
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

  it('still anchors a separate document for a Goal row, whose article is a different artifact', async () => {
    // The one shape GOAL-356 deliberately does NOT merge. Adopting here would
    // mean putting :ResourcePulse on a :GoalPulse — two pulse subtypes on one
    // node — and the article a goal came out of is genuinely its own Resource.
    const { driver, writes } = fakeDriver({ existing: null, filled: false })
    runDocumentIngestPipeline.mockResolvedValue(okRun([]))

    await ingestArticleForRow(deps(driver, async () => htmlFetch()), {
      ...baseInput,
      row: { ...row, pulseType: 'GoalPulse' },
    })

    expect(attachSourceFileToResource).not.toHaveBeenCalled()
    expect(anchorDocument).toHaveBeenCalledTimes(1)
    const anchored = anchorDocument.mock.calls[0][0]
    expect(anchored.documentId).toMatch(/^document_[0-9a-f-]{36}$/)
    expect(anchored.documentId).not.toBe('pulse_row')
    expect(anchored.blobKey).toMatch(
      /^documents\/document_[0-9a-f-]{36}\/Seeing People as Living Systems\.txt$/
    )
    // Two distinct nodes, so the provenance edge IS wanted here.
    expect(writes[0]).toMatchObject({
      params: expect.objectContaining({
        pulseId: 'pulse_row',
        documentId: anchored.documentId,
      }),
    })
  })

  it('keys the link lookup on where bytes were fetched from, not on the member\'s source_url', async () => {
    // The collision this guards: row A carries the sheet's source_url (where
    // the member FOUND it, GOAL-355) and is blob-backed because GOAL-356 put
    // its article on its own pulse. Row B's url equals that source_url. Keyed
    // on sourceUrl, B matched A, reported "already read", never fetched its own
    // article, and hung its EXTRACTED_FROM on an unrelated resource. Keyed on
    // sourceFetchedFrom the lookup misses, so B reads its own article.
    const fetchSource = jest.fn(async () => htmlFetch())
    const { driver, reads } = fakeDriver({ existing: null, own: null })
    runDocumentIngestPipeline.mockResolvedValue(okRun([]))

    await ingestArticleForRow(deps(driver, fetchSource), baseInput)

    expect(fetchSource).toHaveBeenCalledTimes(1)
    expect(attachSourceFileToResource).toHaveBeenCalledTimes(1)
    const linkLookup = (reads.find((r) =>
      (r as { query: string }).query.includes('$sourceUrl')
    ) as { query: string }).query
    expect(linkLookup).toContain('d.sourceFetchedFrom = $sourceUrl')
    // The two properties that carry a DIFFERENT meaning must not be keys.
    expect(linkLookup).not.toContain('d.sourceUrl = $sourceUrl')
    expect(linkLookup).not.toContain('d.location = $sourceUrl')
  })

  it('treats the row\'s own already-read pulse as read, without refetching or re-storing', async () => {
    // The re-import case GOAL-356 created: create_pulse's enrich branch returns
    // the SAME pulse id, and that pulse is already source-backed. Before this
    // was checked, the worker refetched, PUT a second blob, and then failed the
    // attach's backstop — a permanent save failure plus an orphan blob per
    // re-upload.
    const fetchSource = jest.fn()
    const { driver, writes } = fakeDriver({
      own: { id: 'pulse_row', status: 'COMPLETE' },
      existing: null,
      filled: false,
    })

    const result = await ingestArticleForRow(deps(driver, fetchSource), baseInput)

    expect(fetchSource).not.toHaveBeenCalled()
    expect(attachSourceFileToResource).not.toHaveBeenCalled()
    expect(anchorDocument).not.toHaveBeenCalled()
    // Still re-runs the idempotent fill against itself (documentId === pulseId).
    expect(writes[0]).toMatchObject({
      params: expect.objectContaining({
        pulseId: 'pulse_row',
        documentId: 'pulse_row',
      }),
    })
    expect(result.status).toBe('already_extracted')
  })

  it('does not ask the own-pulse question for a Goal row, which never adopts', async () => {
    const { driver, reads } = fakeDriver({ existing: null, own: null })
    runDocumentIngestPipeline.mockResolvedValue(okRun([]))
    await ingestArticleForRow(deps(driver, async () => htmlFetch()), {
      ...baseInput,
      row: { ...row, pulseType: 'GoalPulse' },
    })
    expect(
      reads.some((r) => (r as { query: string }).query.includes('$resourceId'))
    ).toBe(false)
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

    expect(attachSourceFileToResource.mock.calls[0][0]).toMatchObject({
      resourceId: 'pulse_row',
      filename: 'Seeing People as Living Systems.pdf',
      mimeType: 'application/pdf',
    })
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
