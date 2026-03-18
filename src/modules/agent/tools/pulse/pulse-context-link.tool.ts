import { DynamicStructuredTool } from '@langchain/community/tools/dynamic'
import { Neo4jGraph } from '@langchain/community/graphs/neo4j_graph'
import { z } from 'zod'
import { linkPulseToContext, unlinkPulseFromContext } from './pulse.service'

const PulseContextLinkSchema = z.object({
  action: z
    .enum(['link', 'unlink'])
    .describe(
      'Use "link" to share a pulse to a context, or "unlink" to remove it from a context.'
    ),
  pulseId: z.string().describe('Pulse ID to link or unlink.'),
  contextId: z.string().optional().describe('Target context ID (preferred).'),
  contextTitle: z
    .string()
    .optional()
    .describe('Target context title when contextId is not provided.'),
})

export function createPulseContextLinkTool(
  graph: Neo4jGraph
): DynamicStructuredTool {
  return new DynamicStructuredTool({
    name: 'edit_pulse_context_link',
    description:
      'Link or unlink a pulse to/from a field context. Use this for share/unshare style pulse context edits.',
    schema: PulseContextLinkSchema as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    func: async (input: z.infer<typeof PulseContextLinkSchema>) => {
      const result =
        input.action === 'link'
          ? await linkPulseToContext(graph, input)
          : await unlinkPulseFromContext(graph, input)

      return JSON.stringify(result)
    },
  })
}
