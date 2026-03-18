import { tool } from 'ai'
import { z } from 'zod'
import { initGraph } from '@/modules/graph'
import { getLangChainEmbeddings } from '@/lib/llm/adapters/langchain-adapter'
import { createPersonSearchTool } from '@/modules/agent/tools/person-search.tool'
import { createSpaceSearchTool } from '@/modules/agent/tools/space/space-search.tool'
import { createSpaceRenameTool } from '@/modules/agent/tools/space/space-rename.tool'
import {
  searchFieldContexts,
  updateFieldContext,
} from '@/modules/agent/tools/field-context/field-context.service'
import {
  searchPulses,
  updatePulse,
  linkPulseToContext,
  unlinkPulseFromContext,
} from '@/modules/agent/tools/pulse/pulse.service'
import { graphRagSearch } from '@/modules/agent/tools/rag/graph-rag.service'

type ToolError = {
  status: 'error'
  message: string
}

function toErrorResult(prefix: string, error: unknown): ToolError {
  return {
    status: 'error',
    message: `${prefix}: ${error instanceof Error ? error.message : 'Unknown error'}`,
  }
}

export function buildSimulationChatTools() {
  const embeddings = getLangChainEmbeddings()

  return {
    search_person: tool({
      description:
        'Search the GoalPost database for a person by first name, last name, or full name.',
      inputSchema: z.object({
        name: z
          .string()
          .describe(
            'Exact person name string from the user. Do not rewrite spelling before searching.'
          ),
      }),
      execute: async ({ name }: { name: string }) => {
        try {
          const graph = await initGraph()
          const personTool = createPersonSearchTool(graph)
          const result = await personTool.invoke({ name })
          return JSON.parse(result)
        } catch (error) {
          return toErrorResult('Failed to search person', error)
        }
      },
    }),

    search_community: tool({
      description:
        'Search communities by name/description and return top relevant results.',
      inputSchema: z.object({
        query: z.string().describe('Community name or keyword to search for.'),
      }),
      execute: async ({ query }: { query: string }) => {
        try {
          const graph = await initGraph()

          const cypher = `
            MATCH (c:Community)
            WHERE toLower(c.name) CONTAINS toLower($query)
              OR toLower(coalesce(c.description, '')) CONTAINS toLower($query)
            OPTIONAL MATCH (c)-[:MOTIVATED_BY]->(g:Goal)
            OPTIONAL MATCH (p:Person)-[:BELONGS_TO]->(c)
            WITH c,
                 [goal IN collect(DISTINCT g.name) WHERE goal IS NOT NULL][0..3] AS goals,
                 count(DISTINCT p) AS memberCount
            RETURN
              c.name AS name,
              c.description AS description,
              goals,
              memberCount
            LIMIT 8
          `

          const communities = await graph.query<Record<string, unknown>>(
            cypher,
            {
              query: query.trim(),
            }
          )

          if (!communities || communities.length === 0) {
            return {
              found: false,
              count: 0,
              communities: [],
              message: `No communities matching "${query}" were found.`,
            }
          }

          return {
            found: true,
            count: communities.length,
            communities,
            message: `Found ${communities.length} community match(es).`,
          }
        } catch (error) {
          return toErrorResult('Failed to search community', error)
        }
      },
    }),

    search_space: tool({
      description:
        'Search spaces by name (supports personal and collaborative spaces).',
      inputSchema: z.object({
        name: z.string().describe('Space name or partial space name.'),
      }),
      execute: async ({ name }: { name: string }) => {
        try {
          const graph = await initGraph()
          const spaceTool = createSpaceSearchTool(graph)
          const result = await spaceTool.invoke({ name })
          return JSON.parse(result)
        } catch (error) {
          return toErrorResult('Failed to search space', error)
        }
      },
    }),

    rename_space: tool({
      description:
        'Rename a space by current name and new name. Search first if needed.',
      inputSchema: z.object({
        currentName: z.string().describe('Current space name.'),
        newName: z.string().describe('Desired new space name.'),
      }),
      execute: async ({
        currentName,
        newName,
      }: {
        currentName: string
        newName: string
      }) => {
        try {
          const graph = await initGraph()
          const renameTool = createSpaceRenameTool(graph)
          const result = await renameTool.invoke({ currentName, newName })
          return JSON.parse(result)
        } catch (error) {
          return toErrorResult('Failed to rename space', error)
        }
      },
    }),

    search_field_context: tool({
      description:
        'Search field contexts by title or emergent name, optionally scoped by space name.',
      inputSchema: z.object({
        query: z.string().describe('Field context title or keyword.'),
        spaceName: z
          .string()
          .optional()
          .describe('Optional space name filter.'),
        limit: z
          .number()
          .int()
          .positive()
          .max(25)
          .optional()
          .describe('Optional max result count.'),
      }),
      execute: async ({
        query,
        spaceName,
        limit,
      }: {
        query: string
        spaceName?: string
        limit?: number
      }) => {
        try {
          const graph = await initGraph()
          return await searchFieldContexts(graph, { query, spaceName, limit })
        } catch (error) {
          return toErrorResult('Failed to search field context', error)
        }
      },
    }),

    update_field_context: tool({
      description:
        'Update a field context title and/or emergent name. Prefer contextId to avoid ambiguity.',
      inputSchema: z.object({
        contextId: z
          .string()
          .optional()
          .describe('Exact context ID (preferred).'),
        currentTitle: z
          .string()
          .optional()
          .describe('Current context title (if ID is not known).'),
        spaceName: z
          .string()
          .optional()
          .describe('Optional space name filter when using currentTitle.'),
        newTitle: z.string().optional().describe('New context title.'),
        newEmergentName: z.string().optional().describe('New emergent name.'),
      }),
      execute: async (input: {
        contextId?: string
        currentTitle?: string
        spaceName?: string
        newTitle?: string
        newEmergentName?: string
      }) => {
        try {
          const graph = await initGraph()
          return await updateFieldContext(graph, input)
        } catch (error) {
          return toErrorResult('Failed to update field context', error)
        }
      },
    }),

    search_pulse: tool({
      description:
        'Search pulses by title/content with optional context and pulse type filters.',
      inputSchema: z.object({
        query: z.string().describe('Pulse title or content keyword.'),
        contextId: z
          .string()
          .optional()
          .describe('Optional field context ID filter.'),
        contextTitle: z
          .string()
          .optional()
          .describe('Optional field context title filter.'),
        pulseType: z
          .enum([
            'GoalPulse',
            'ResourcePulse',
            'StoryPulse',
            'CarePulse',
            'CoreValuePulse',
            'FieldPulse',
          ])
          .optional()
          .describe('Optional pulse type filter.'),
        limit: z
          .number()
          .int()
          .positive()
          .max(25)
          .optional()
          .describe('Optional max result count.'),
      }),
      execute: async (input: {
        query: string
        contextId?: string
        contextTitle?: string
        pulseType?:
          | 'GoalPulse'
          | 'ResourcePulse'
          | 'StoryPulse'
          | 'CarePulse'
          | 'CoreValuePulse'
          | 'FieldPulse'
        limit?: number
      }) => {
        try {
          const graph = await initGraph()
          return await searchPulses(graph, input)
        } catch (error) {
          return toErrorResult('Failed to search pulse', error)
        }
      },
    }),

    update_pulse: tool({
      description:
        'Update pulse fields (title/content/status/intensity/horizon/resourceType/etc). Prefer pulseId to avoid ambiguity.',
      inputSchema: z.object({
        pulseId: z.string().optional().describe('Exact pulse ID (preferred).'),
        currentTitle: z
          .string()
          .optional()
          .describe('Current pulse title (if pulseId is unknown).'),
        contextId: z
          .string()
          .optional()
          .describe('Optional context ID disambiguator when using title.'),
        newTitle: z.string().optional(),
        newContent: z.string().optional(),
        newStatus: z.string().optional(),
        newIntensity: z.number().optional(),
        newHorizon: z.string().optional(),
        newResourceType: z.string().optional(),
        newAvailability: z.number().optional(),
        newWhy: z.string().optional(),
        newLocation: z.string().optional(),
        newTime: z.string().optional(),
      }),
      execute: async (input: {
        pulseId?: string
        currentTitle?: string
        contextId?: string
        newTitle?: string
        newContent?: string
        newStatus?: string
        newIntensity?: number
        newHorizon?: string
        newResourceType?: string
        newAvailability?: number
        newWhy?: string
        newLocation?: string
        newTime?: string
      }) => {
        try {
          const graph = await initGraph()
          return await updatePulse(graph, input)
        } catch (error) {
          return toErrorResult('Failed to update pulse', error)
        }
      },
    }),

    edit_pulse_context_link: tool({
      description:
        'Link (share) or unlink (remove) a pulse to/from a field context.',
      inputSchema: z.object({
        action: z.enum(['link', 'unlink']),
        pulseId: z.string().describe('Pulse ID to edit.'),
        contextId: z
          .string()
          .optional()
          .describe('Target context ID (preferred).'),
        contextTitle: z
          .string()
          .optional()
          .describe('Target context title if ID is unknown.'),
      }),
      execute: async ({
        action,
        pulseId,
        contextId,
        contextTitle,
      }: {
        action: 'link' | 'unlink'
        pulseId: string
        contextId?: string
        contextTitle?: string
      }) => {
        try {
          const graph = await initGraph()
          return action === 'link'
            ? await linkPulseToContext(graph, {
                pulseId,
                contextId,
                contextTitle,
              })
            : await unlinkPulseFromContext(graph, {
                pulseId,
                contextId,
                contextTitle,
              })
        } catch (error) {
          return toErrorResult('Failed to edit pulse/context link', error)
        }
      },
    }),

    graph_rag_search: tool({
      description:
        'Semantic Graph RAG retrieval across people and pulses using vector indexes, enriched with graph relationships.',
      inputSchema: z.object({
        query: z.string().describe('Natural language search query.'),
        scope: z
          .enum(['people', 'pulses', 'all'])
          .optional()
          .describe('Search scope (default: all).'),
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
          .describe('Top-k retrieval limit.'),
      }),
      execute: async ({
        query,
        scope,
        contextId,
        limit,
      }: {
        query: string
        scope?: 'people' | 'pulses' | 'all'
        contextId?: string
        limit?: number
      }) => {
        try {
          const graph = await initGraph()
          return await graphRagSearch(graph, embeddings, {
            query,
            scope,
            contextId,
            limit,
          })
        } catch (error) {
          return toErrorResult('Failed to run Graph RAG retrieval', error)
        }
      },
    }),
  }
}
