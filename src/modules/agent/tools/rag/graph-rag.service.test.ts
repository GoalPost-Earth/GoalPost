import type { Neo4jGraph } from '@langchain/community/graphs/neo4j_graph'
import type { Embeddings } from '@langchain/core/embeddings'
import { graphRagSearch } from './graph-rag.service'

/**
 * Regression for the captured AI-quality failure behind
 * feedback_32f2ee28-... . When a vector sub-search throws a raw Neo4j error
 * (e.g. "LIMIT: Invalid input. '25.0' is not a valid value"), graphRagSearch
 * swallows the throw and records a WARNING — which buildResultMessage folds
 * verbatim into the human-facing `message`. That warning must therefore stay
 * member-safe: the raw error text must never reach the model, or it paraphrases
 * it into a confusing "search-tool limit error" for a participant (kb/07 Rule 1).
 *
 * graphRagSearch takes its graph + embeddings as arguments, so we drive it
 * directly with a graph whose query() rejects with the exact captured error.
 */
describe('graph_rag_search sanitizes vector-search failures (kb/07 Rule 1)', () => {
  it('does not leak a raw Neo4j LIMIT error into warnings or message', async () => {
    const graph = {
      query: jest.fn(() =>
        Promise.reject(
          new Error(
            "LIMIT: Invalid input. '25.0' is not a valid value. Must be a non-negative integer."
          )
        )
      ),
    } as unknown as Neo4jGraph

    const embeddings = {
      embedQuery: jest.fn(() => Promise.resolve(new Array(1536).fill(0))),
    } as unknown as Embeddings

    const result = await graphRagSearch(graph, embeddings, {
      query: 'value',
      scope: 'pulses',
      userId: 'person_test',
    })

    // Nothing in the entire result object may carry the raw technical string —
    // warnings, message, or anywhere else the model can read.
    const blob = JSON.stringify(result)
    expect(blob).not.toMatch(/LIMIT/i)
    expect(blob).not.toContain('25.0')
    expect(blob).not.toMatch(/valid value/i)

    // A member-safe warning IS still surfaced so the model can be honest that
    // some matches were unavailable.
    expect(result.warnings.join(' ')).toMatch(/unavailable/i)
    expect(result.message).not.toContain('25.0')
  })
})
