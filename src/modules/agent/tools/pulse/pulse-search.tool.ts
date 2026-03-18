import { DynamicStructuredTool } from '@langchain/community/tools/dynamic'
import { Neo4jGraph } from '@langchain/community/graphs/neo4j_graph'
import { z } from 'zod'
import { searchPulses } from './pulse.service'

const PulseTypeEnum = z.enum([
  'GoalPulse',
  'ResourcePulse',
  'StoryPulse',
  'CarePulse',
  'CoreValuePulse',
  'FieldPulse',
])

const PulseSearchSchema = z.object({
  query: z.string().describe('Pulse title or keyword to search for.'),
  contextId: z
    .string()
    .optional()
    .describe('Optional context ID to restrict search to one field context.'),
  contextTitle: z
    .string()
    .optional()
    .describe(
      'Optional context title to restrict search to one field context.'
    ),
  pulseType: PulseTypeEnum.optional().describe('Optional pulse type filter.'),
  limit: z
    .number()
    .int()
    .positive()
    .max(25)
    .optional()
    .describe('Optional maximum number of results (default 10, max 25).'),
})

export function createPulseSearchTool(
  graph: Neo4jGraph
): DynamicStructuredTool {
  return new DynamicStructuredTool({
    name: 'search_pulse',
    description:
      'Search for pulses by title/content, with optional context and pulse type filters. Use this before editing pulses.',
    schema: PulseSearchSchema as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    func: async (input: z.infer<typeof PulseSearchSchema>) => {
      const result = await searchPulses(graph, input)
      return JSON.stringify(result)
    },
  })
}
