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

/**
 * Creates the legacy `search_field_context` tool.
 *
 * Results are scoped to FieldContexts whose parent Space the authenticated user
 * OWNS or is a MEMBER of, per the Space-based authorization model in
 * `kb/02-user-roles.md`. The `userId` is threaded into `searchFieldContexts`,
 * which anchors the Cypher on it. Passing `userId = null` is treated as an
 * unauthenticated call: the service fails closed and returns no results rather
 * than leaking cross-tenant FieldContexts (GOAL-273). The legacy agent path
 * (`src/modules/agent/tools/index.ts`) has no user identity and passes `null`;
 * the active chat surface (`src/lib/simulation/chat-tools.ts`) does not use this
 * factory — it calls `searchFieldContexts` directly with the JWT-resolved id.
 */
export function createFieldContextSearchTool(
  graph: Neo4jGraph,
  userId: string | null
): DynamicStructuredTool {
  return new DynamicStructuredTool({
    name: 'search_field_context',
    description:
      'Search for field contexts by title or emergent name. Use this before editing a field context or when users ask what fields exist.',
    schema: FieldContextSearchSchema as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    func: async (input: z.infer<typeof FieldContextSearchSchema>) => {
      const result = await searchFieldContexts(graph, { ...input, userId })
      return JSON.stringify(result)
    },
  })
}
