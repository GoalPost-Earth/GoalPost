import { DynamicStructuredTool } from '@langchain/community/tools/dynamic'
import { Neo4jGraph } from '@langchain/community/graphs/neo4j_graph'
import { z } from 'zod'
import { searchFieldContexts } from './field-context.service'

const FieldContextSearchSchema = z.object({
  query: z.string().describe('Field context title or keyword to search for.'),
  spaceName: z
    .string()
    .optional()
    .describe('Optional space name filter to narrow the search.'),
  limit: z
    .number()
    .int()
    .positive()
    .max(25)
    .optional()
    .describe('Optional maximum number of results (default 10, max 25).'),
})

export function createFieldContextSearchTool(
  graph: Neo4jGraph
): DynamicStructuredTool {
  return new DynamicStructuredTool({
    name: 'search_field_context',
    description:
      'Search for field contexts by title or emergent name. Use this before editing a field context or when users ask what fields exist.',
    schema: FieldContextSearchSchema as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    func: async (input: z.infer<typeof FieldContextSearchSchema>) => {
      const result = await searchFieldContexts(graph, input)
      return JSON.stringify(result)
    },
  })
}
