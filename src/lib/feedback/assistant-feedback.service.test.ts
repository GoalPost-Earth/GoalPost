import { listUnclassifiedFeedback } from './assistant-feedback.service'

/**
 * Regression test for the failure-triage false-positive fix.
 *
 * Background: the inline suggestion cards (e.g. capture-and-connect
 * resonances) record an ACCEPT as POSITIVE `user_thumb` feedback and a
 * DISMISS as NEGATIVE — both through the same submitAssistantFeedback path
 * as an explicit thumbs-up/down. The daily classify cron consumes
 * `listUnclassifiedFeedback` and hands every row to a *failure* classifier
 * that force-fits it into one of a fixed set of failure modes. A positive
 * acceptance ("Accepted suggested resonance: A sense of belonging and
 * Freedom") is a SUCCESS, not a failure, yet it was being classified and
 * clustered into `/dev/ai-quality` as a bogus bad row.
 *
 * The fix scopes `listUnclassifiedFeedback` to NEGATIVE-rated feedback.
 * This test pins that: the classifier's input query must filter to
 * `rating: 'negative'`, so positive rows can never enter the pipeline.
 */

// Capture the params of every read query the service issues so we can
// assert the rating filter without a live Neo4j.
const runCalls: Array<{ cypher: string; params: Record<string, unknown> }> = []

jest.mock('@/lib/neo4j/driver', () => ({
  driver: {
    session: () => ({
      executeRead: async (
        work: (tx: {
          run: (
            cypher: string,
            params: Record<string, unknown>
          ) => { records: unknown[] }
        }) => unknown
      ) =>
        work({
          run: (cypher: string, params: Record<string, unknown>) => {
            runCalls.push({ cypher, params })
            return { records: [] }
          },
        }),
      close: async () => {},
    }),
  },
}))

beforeEach(() => {
  runCalls.length = 0
})

describe('listUnclassifiedFeedback', () => {
  it('only asks the DB for negative-rated feedback (positives are successes, not failures)', async () => {
    await listUnclassifiedFeedback(25)

    expect(runCalls).toHaveLength(1)
    const [{ cypher, params }] = runCalls

    // The failure classifier must never see a positive row (a thumbs-up or a
    // suggestion-card accept). The rating filter enforces that at the source.
    expect(params.rating).toBe('negative')

    // Sanity: it is still the feedback-list read (so the filter is on the
    // right query), and the limit is threaded through.
    expect(cypher).toContain(':AssistantFeedback')
    expect(params.limit).toBe(25)
  })

  it('leaves the classification-null narrowing in place for the remaining rows', async () => {
    // With the DB stubbed to return no rows, the JS-side
    // `classification === null` filter yields an empty batch — i.e. the
    // function still returns an array and does not throw.
    const rows = await listUnclassifiedFeedback()
    expect(Array.isArray(rows)).toBe(true)
    expect(rows).toHaveLength(0)
  })
})
