import { DynamicStructuredTool } from '@langchain/community/tools/dynamic'
import { Neo4jGraph } from '@langchain/community/graphs/neo4j_graph'
import { z } from 'zod'
import { updateFieldContext } from './field-context.service'

const FieldContextUpdateSchema = z.object({
  contextId: z
    .string()
    .optional()
    .describe('Exact field context ID to update (preferred).'),
  currentTitle: z
    .string()
    .optional()
    .describe('Current field context title when contextId is not provided.'),
  spaceName: z
    .string()
    .optional()
    .describe('Optional space name filter used with currentTitle.'),
  newTitle: z.string().optional().describe('New title for the field context.'),
  newEmergentName: z
    .string()
    .optional()
    .describe('New emergent name for the field context.'),
})

export function createFieldContextUpdateTool(
  graph: Neo4jGraph
): DynamicStructuredTool {
  return new DynamicStructuredTool({
    name: 'update_field_context',
    description:
      'Update a field context title or emergent name. Use this tool after identifying the correct context ID.',
    schema: FieldContextUpdateSchema as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    func: async (input: z.infer<typeof FieldContextUpdateSchema>) => {
      const result = await updateFieldContext(graph, input)
      return JSON.stringify(result)
    },
  })
}
