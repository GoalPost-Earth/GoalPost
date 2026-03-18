import { DynamicStructuredTool } from '@langchain/community/tools/dynamic'
import { Neo4jGraph } from '@langchain/community/graphs/neo4j_graph'
import { Embeddings } from '@langchain/core/embeddings'
import { z } from 'zod'
import { graphRagSearch } from './graph-rag.service'

const GraphRagScopeSchema = z.enum(['people', 'pulses', 'all'])

const GraphRagSearchSchema = z.object({
  query: z
    .string()
    .describe(
      'Natural-language query for semantic retrieval across people and pulses.'
    ),
  scope: GraphRagScopeSchema.optional().describe(
    'Search scope: people, pulses, or all (default).'
  ),
  contextId: z
    .string()
    .optional()
    .describe('Optional field context ID for pulse-scoped retrieval.'),
  limit: z
    .number()
    .int()
    .positive()
    .max(20)
    .optional()
    .describe('Optional top-k retrieval limit (default 6, max 20).'),
})

export function createGraphRagSearchTool(
  graph: Neo4jGraph,
  embeddings: Embeddings
): DynamicStructuredTool {
  return new DynamicStructuredTool({
    name: 'graph_rag_search',
    description:
      'Run vector + graph retrieval over people and pulses. Use this for semantic questions, similarity search, and evidence-grounded Graph RAG answers.',
    schema: GraphRagSearchSchema as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    func: async (input: z.infer<typeof GraphRagSearchSchema>) => {
      const result = await graphRagSearch(graph, embeddings, input)
      return JSON.stringify(result)
    },
  })
}
