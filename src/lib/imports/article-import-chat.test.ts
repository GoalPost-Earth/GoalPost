import {
  ARTICLE_IMPORT_STATUS,
  summarizeArticleOutcomes,
  type ArticleImportSummary,
  type PersistedArticleRowOutcome,
} from './article-import'
import {
  buildImportThreadTitle,
  describeArticleImportForChat,
  summarizeChatImports,
  trimFieldName,
  type ChatImportStatus,
} from './article-import-chat'
import { deriveDisplayTitle } from '@/lib/simulation/thread-switcher-helpers'

/**
 * GOAL-359 — the member-safe description of a bulk import, which is what both
 * the chat progress card and the assistant's answer are built from.
 *
 * Two properties carry the ticket and are asserted here rather than left to a
 * manual pass:
 *
 *  1. **The four member-facing states are derived, not copied.** `PENDING`
 *     means two different things (GOAL-357): never claimed, or handed back
 *     mid-batch with its cursor intact. Reading it as "queued" both times is
 *     the defect that ticket fixed in the modal, and this module is where the
 *     chat surface would reintroduce it.
 *  2. **Nothing internal reaches the payload** (kb/07 Rule 1). No job id, no
 *     context id, no raw `PENDING`/`PROCESSING`, no Material Symbols glyph —
 *     the shape is what the model reads back out to a member.
 */

function outcomes(count: number): PersistedArticleRowOutcome[] {
  return Array.from({ length: count }, (_unused, index) => ({
    row: index + 2,
    title: `Article ${index + 1}`,
    status: 'created' as const,
    personEvent: 'created' as const,
  })) as PersistedArticleRowOutcome[]
}

function summaryFor(
  landed: number,
  total: number
): { summary: ArticleImportSummary; processedRows: number } {
  const rows = outcomes(landed)
  return {
    summary: summarizeArticleOutcomes(rows, total),
    processedRows: rows.length,
  }
}

describe('describeArticleImportForChat', () => {
  it('reads an unclaimed job with nothing landed as queued', () => {
    const { summary, processedRows } = summaryFor(0, 5)
    const status = describeArticleImportForChat({
      status: ARTICLE_IMPORT_STATUS.pending,
      statusMessage: null,
      processedRows,
      summary,
      fieldContextTitle: 'Care Practices',
    })

    expect(status.state).toBe('queued')
    expect(status.label).toBe('Queued')
    expect(status.totalRows).toBe(5)
    expect(status.processedRows).toBe(0)
    expect(status.fieldContext).toBe('Care Practices')
  })

  it('keeps a job that yielded mid-batch as importing, not rewound to queued', () => {
    // The GOAL-357 case: the worker ran out of its time budget and handed the
    // job back PROCESSING -> PENDING with its row cursor intact. Reading that
    // second PENDING as "not started" is what showed one import three ways.
    const { summary, processedRows } = summaryFor(2, 5)
    const status = describeArticleImportForChat({
      status: ARTICLE_IMPORT_STATUS.pending,
      statusMessage: null,
      processedRows,
      summary,
      fieldContextTitle: 'Care Practices',
    })

    expect(status.state).toBe('importing')
    expect(status.percent).toBe(40)
    expect(status.processedRows).toBe(2)
  })

  it('reads a freshly claimed job with nothing landed as importing', () => {
    const { summary, processedRows } = summaryFor(0, 5)
    const status = describeArticleImportForChat({
      status: ARTICLE_IMPORT_STATUS.processing,
      statusMessage: null,
      processedRows,
      summary,
      fieldContextTitle: 'Care Practices',
    })

    expect(status.state).toBe('importing')
    expect(status.percent).toBe(0)
  })

  it('reports a finished job at 100% even when some rows failed', () => {
    const rows: PersistedArticleRowOutcome[] = [
      ...outcomes(3),
      { row: 5, title: 'Article 4', status: 'failed', error: 'nope' },
      { row: 6, title: 'Article 5', status: 'failed', error: 'nope' },
    ] as PersistedArticleRowOutcome[]
    const status = describeArticleImportForChat({
      status: ARTICLE_IMPORT_STATUS.complete,
      statusMessage: null,
      processedRows: rows.length,
      summary: summarizeArticleOutcomes(rows, 5),
      fieldContextTitle: 'Care Practices',
    })

    expect(status.state).toBe('complete')
    expect(status.percent).toBe(100)
    expect(status.failedRows).toBe(2)
  })

  it('carries the member-safe failure copy on a failed job', () => {
    const { summary, processedRows } = summaryFor(1, 5)
    const status = describeArticleImportForChat({
      status: ARTICLE_IMPORT_STATUS.failed,
      statusMessage: 'Something went wrong on our end.',
      processedRows,
      summary,
      fieldContextTitle: 'Care Practices',
    })

    expect(status.state).toBe('failed')
    expect(status.statusMessage).toBe('Something went wrong on our end.')
  })

  it('names a field it could not resolve rather than leaving it blank', () => {
    const { summary, processedRows } = summaryFor(0, 5)
    const status = describeArticleImportForChat({
      status: ARTICLE_IMPORT_STATUS.pending,
      statusMessage: null,
      processedRows,
      summary,
      fieldContextTitle: null,
    })

    expect(status.fieldContext).toBe('a field')
  })

  it('caps a very long field name before it reaches the model', () => {
    const long = 'Community Care Practices and Mutual Aid Coordination Across the Region'
    const { summary, processedRows } = summaryFor(0, 5)
    const status = describeArticleImportForChat({
      status: ARTICLE_IMPORT_STATUS.pending,
      statusMessage: null,
      processedRows,
      summary,
      fieldContextTitle: long,
    })

    expect(status.fieldContext.length).toBeLessThanOrEqual(60)
    expect(status.fieldContext.endsWith('…')).toBe(true)
  })

  it('exposes no ids, raw statuses or UI glyphs (kb/07 Rule 1)', () => {
    const { summary, processedRows } = summaryFor(2, 5)
    const status = describeArticleImportForChat({
      status: ARTICLE_IMPORT_STATUS.processing,
      statusMessage: null,
      processedRows,
      summary,
      fieldContextTitle: 'Care Practices',
    })

    // The glyph left this payload deliberately — the renderer derives its own
    // from `state`. A Material Symbols name is an internal artifact.
    expect(status).not.toHaveProperty('icon')
    expect(status).not.toHaveProperty('jobId')

    const serialized = JSON.stringify(status)
    expect(serialized).not.toMatch(/import_|ctx_|pulse_|me_|ws_|thread_/)
    expect(serialized).not.toMatch(/PENDING|PROCESSING|COMPLETE|FAILED/)
    expect(serialized).not.toMatch(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
    )
  })
})

describe('summarizeChatImports', () => {
  function statusWith(
    overrides: Partial<ChatImportStatus> = {}
  ): ChatImportStatus {
    const { summary, processedRows } = summaryFor(2, 5)
    return {
      ...describeArticleImportForChat({
        status: ARTICLE_IMPORT_STATUS.processing,
        statusMessage: null,
        processedRows,
        summary,
        fieldContextTitle: 'Care Practices',
      }),
      ...overrides,
    }
  }

  it('answers the ticket question — rows done versus total — in prose', () => {
    const sentence = summarizeChatImports([statusWith()])
    expect(sentence).toContain('2 of 5 rows')
    expect(sentence).toContain('40%')
    expect(sentence).toContain('Care Practices')
  })

  it('says plainly when there is nothing to report', () => {
    expect(summarizeChatImports([])).toBe(
      'No article imports have been started recently.'
    )
  })

  it('does not describe a queued import as underway', () => {
    const sentence = summarizeChatImports([
      statusWith({ state: 'queued', processedRows: 0, percent: 0 }),
    ])
    expect(sentence).toContain('queued')
    expect(sentence).not.toContain('underway')
  })
})

describe('buildImportThreadTitle', () => {
  it('names the row count and the field, with no id', () => {
    expect(buildImportThreadTitle(5, 'Care Practices')).toBe(
      'Import: 5 articles into Care Practices'
    )
  })

  it('singularises one row', () => {
    expect(buildImportThreadTitle(1, 'Care Practices')).toBe(
      'Import: 1 article into Care Practices'
    )
  })

  it('drops the field clause when the title could not be read', () => {
    expect(buildImportThreadTitle(5, null)).toBe('Import: 5 articles')
  })

  it('truncates here rather than at the caller, so the cap stays out of prose', () => {
    const long = 'Community Care Practices and Mutual Aid Coordination Across the Region'
    const title = buildImportThreadTitle(5, long)
    expect(title.startsWith('Import: 5 articles into ')).toBe(true)
    expect(title.endsWith('…')).toBe(true)
    expect(trimFieldName(long).length).toBeLessThanOrEqual(60)
  })
})

describe('thread switcher', () => {
  it('labels a titleless import thread by kind, never by id', () => {
    expect(
      deriveDisplayTitle({ title: null, kind: 'import', snippet: '' })
    ).toBe('Import')
  })

  it('prefers the persisted import title over the kind sentinel', () => {
    expect(
      deriveDisplayTitle({
        title: 'Import: 5 articles into Care Practices',
        kind: 'import',
        snippet: 'Import 5 articles into Care Practices',
      })
    ).toBe('Import: 5 articles into Care Practices')
  })
})
