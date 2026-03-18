import { DynamicStructuredTool } from '@langchain/community/tools/dynamic'
import { Neo4jGraph } from '@langchain/community/graphs/neo4j_graph'
import { z } from 'zod'
import { updatePulse } from './pulse.service'

const PulseUpdateSchema = z.object({
  pulseId: z
    .string()
    .optional()
    .describe('Exact pulse ID to update (preferred).'),
  currentTitle: z
    .string()
    .optional()
    .describe('Current pulse title when pulseId is not provided.'),
  contextId: z
    .string()
    .optional()
    .describe(
      'Optional context ID for disambiguation when using currentTitle.'
    ),
  newTitle: z.string().optional().describe('New pulse title.'),
  newContent: z.string().optional().describe('New pulse content.'),
  newStatus: z.string().optional().describe('New pulse status value.'),
  newIntensity: z.number().optional().describe('New pulse intensity value.'),
  newHorizon: z.string().optional().describe('New goal horizon value.'),
  newResourceType: z.string().optional().describe('New resource type value.'),
  newAvailability: z
    .number()
    .optional()
    .describe('New resource availability value.'),
  newWhy: z.string().optional().describe('New why value.'),
  newLocation: z.string().optional().describe('New location value.'),
  newTime: z.string().optional().describe('New time value.'),
})

export function createPulseUpdateTool(
  graph: Neo4jGraph
): DynamicStructuredTool {
  return new DynamicStructuredTool({
    name: 'update_pulse',
    description:
      'Update a pulse by ID (preferred) or by exact title. Supports title, content, status, intensity, horizon, resourceType, and other common pulse fields.',
    schema: PulseUpdateSchema as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    func: async (input: z.infer<typeof PulseUpdateSchema>) => {
      const result = await updatePulse(graph, input)
      return JSON.stringify(result)
    },
  })
}
