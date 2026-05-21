import { tool } from 'ai'
import { z } from 'zod'
import { initGraph } from '@/modules/graph'
import { getLangChainEmbeddings } from '@/lib/llm/adapters/langchain-adapter'
import { createPersonSearchTool } from '@/modules/agent/tools/person-search.tool'
import { createSpaceSearchTool } from '@/modules/agent/tools/space/space-search.tool'
import { searchFieldContexts } from '@/modules/agent/tools/field-context/field-context.service'
import { searchPulses } from '@/modules/agent/tools/pulse/pulse.service'
import { graphRagSearch } from '@/modules/agent/tools/rag/graph-rag.service'
import { canViewContent } from '@/lib/permissions/space-permissions'
import { driver } from '@/lib/neo4j/driver'
import {
  buildPendingApprovalResult,
  createApprovalHash,
  executeAuthorizedWriteTool,
  isWriteToolName,
  type PendingApprovalResult,
  type WriteToolName,
} from '@/lib/chat/hitl'
import {
  isFocalEntityType,
  type FocalEntityType,
} from '@/lib/focal-entity/types'
import { generateAndRunForBloom } from '@/lib/cypher-generator'
import type { Neo4jGraph } from '@langchain/community/graphs/neo4j_graph'

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

export interface SimulationChatToolContext {
  currentUserId: string | null
  spaceId: string | null
  fieldContextId: string | null
  /** The narrowest entity the user is currently viewing. See FocalEntity. */
  focalEntity: { type: FocalEntityType; id: string; label?: string } | null
  /** Pre-computed approval hashes from the request's approvedActions. */
  approvedActionHashes: Set<string>
  /**
   * Names resolved once per request from session-context-resolve.ts.
   * Lets tools (e.g. query_for_bloom) speak about the active scope
   * without re-querying Neo4j.
   */
  spaceName?: string | null
  spaceType?: 'MeSpace' | 'WeSpace' | null
  fieldContextTitle?: string | null
  /**
   * Which canvas surface the user is currently looking at, plus the
   * flat list of entities rendered there. Forwarded to
   * `query_for_bloom` so the Cypher generator can prefer a
   * canvas-known id over a fresh keyword search.
   */
  canvasView?: 'dashboard' | 'graph' | 'bloom' | null
  canvasVisibleEntities?: Array<{
    id: string
    name: string
    type: string
    source: 'dashboard' | 'graph' | 'bloom'
  }>
}

/**
 * Verify that the resolved user can view the given Space, using the
 * neo4j-driver Session-based permission helpers. Returns true on permit;
 * returns an error object on deny so callers can surface a tool-result
 * without leaking authorization details.
 */
async function assertCanViewSpace(
  ctx: SimulationChatToolContext,
  spaceId: string
): Promise<true | ToolError> {
  if (!ctx.currentUserId) {
    return {
      status: 'error',
      message:
        'Authentication required for Space-scoped data. Please sign in and try again.',
    }
  }
  const session = driver.session()
  try {
    const allowed = await canViewContent(session, ctx.currentUserId, spaceId)
    if (!allowed) {
      return {
        status: 'error',
        message: 'You do not have access to that Space.',
      }
    }
    return true
  } finally {
    await session.close()
  }
}

function logToolDispatch(
  toolName: string,
  ctx: SimulationChatToolContext,
  args: Record<string, unknown>
): void {
  console.log('[Assistant Tool]', {
    tool: toolName,
    currentUserId: ctx.currentUserId,
    activeSpaceId: ctx.spaceId,
    activeFieldContextId: ctx.fieldContextId,
    focalEntity: ctx.focalEntity,
    args,
  })
}

/**
 * Gate a write tool invocation through the HITL approval flow.
 *
 * - Computes a stable hash of (toolName, args).
 * - If the hash is in `ctx.approvedActionHashes` (the user has already approved
 *   this exact action in a prior turn), execute via `executeAuthorizedWriteTool`.
 * - Otherwise return a `pendingApproval` result the UI can intercept to render
 *   an approval prompt, then re-send the original message with the approved
 *   action attached.
 *
 * The hash + describe helpers in src/lib/chat/hitl.ts were lifted from the
 * legacy /api/chat route so the approval contract stays consistent now that
 * /api/chat/simulation is the sole assistant endpoint.
 */
async function runWriteTool(
  toolName: WriteToolName,
  args: Record<string, unknown>,
  ctx: SimulationChatToolContext
): Promise<PendingApprovalResult | Record<string, unknown>> {
  if (!isWriteToolName(toolName)) {
    return {
      success: false,
      message: `Unsupported write tool: ${toolName}`,
    }
  }
  const approvalHash = createApprovalHash(toolName, args)
  if (!ctx.approvedActionHashes.has(approvalHash)) {
    return buildPendingApprovalResult(toolName, args)
  }
  try {
    const graph = await initGraph()
    return await executeAuthorizedWriteTool(
      graph,
      ctx.currentUserId,
      toolName,
      args
    )
  } catch (error) {
    return toErrorResult(`Failed to execute ${toolName}`, error)
  }
}

/**
 * Fetch the entity record corresponding to `ctx.focalEntity` directly from
 * Neo4j. Used by the get_focal_entity tool. The type label is interpolated
 * but the input is constrained to validated `FocalEntityType` values, so
 * there is no injection surface.
 */
async function getFocalRecord(
  graph: Neo4jGraph,
  focal: { type: FocalEntityType; id: string }
): Promise<Record<string, unknown> | null> {
  switch (focal.type) {
    case 'MeSpace':
    case 'WeSpace': {
      const cypher = `
        MATCH (s:${focal.type} {id: $id})
        RETURN s { .id, .name, .description, .visibility, .why, .location } AS record
        LIMIT 1
      `
      const rows = await graph.query<{ record: Record<string, unknown> }>(
        cypher,
        { id: focal.id }
      )
      return rows?.[0]?.record ?? null
    }
    case 'FieldContext': {
      const cypher = `
        MATCH (c:FieldContext {id: $id})
        OPTIONAL MATCH (s:Space)-[:HAS_CONTEXT]->(c)
        WITH c, head(collect(s)) AS s
        RETURN {
          id: c.id,
          title: c.title,
          emergentName: c.emergentName,
          createdAt: c.createdAt,
          space: CASE WHEN s IS NULL THEN null ELSE {
            id: s.id,
            name: s.name,
            type: head([l IN labels(s) WHERE l IN ['MeSpace','WeSpace']])
          } END
        } AS record
        LIMIT 1
      `
      const rows = await graph.query<{ record: Record<string, unknown> }>(
        cypher,
        { id: focal.id }
      )
      return rows?.[0]?.record ?? null
    }
    case 'User':
    case 'PersonPulse': {
      const cypher = `
        MATCH (p:${focal.type} {id: $id})
        RETURN p { .id, .firstName, .lastName, .name, .email, .pronouns, .photo, .location, .careManual, .favorites, .passions, .traits, .fieldsOfCare, .interests } AS record
        LIMIT 1
      `
      const rows = await graph.query<{ record: Record<string, unknown> }>(
        cypher,
        { id: focal.id }
      )
      return rows?.[0]?.record ?? null
    }
    case 'GoalPulse':
    case 'ResourcePulse':
    case 'StoryPulse':
    case 'CarePulse':
    case 'CoreValuePulse': {
      const cypher = `
        MATCH (p:${focal.type} {id: $id})
        OPTIONAL MATCH (c:FieldContext)-[:HAS_PULSE]->(p)
        OPTIONAL MATCH (s:Space)-[:HAS_CONTEXT]->(c)
        WITH p, head(collect(DISTINCT c)) AS c, head(collect(DISTINCT s)) AS s
        RETURN {
          id: p.id,
          title: p.title,
          content: p.content,
          status: p.status,
          horizon: p.horizon,
          intensity: p.intensity,
          why: p.why,
          location: p.location,
          time: p.time,
          createdAt: p.createdAt,
          context: CASE WHEN c IS NULL THEN null ELSE { id: c.id, title: c.title } END,
          space: CASE WHEN s IS NULL THEN null ELSE { id: s.id, name: s.name } END
        } AS record
        LIMIT 1
      `
      const rows = await graph.query<{ record: Record<string, unknown> }>(
        cypher,
        { id: focal.id }
      )
      return rows?.[0]?.record ?? null
    }
  }
}

export async function buildSimulationChatTools(
  context: SimulationChatToolContext = {
    currentUserId: null,
    spaceId: null,
    fieldContextId: null,
    focalEntity: null,
    approvedActionHashes: new Set<string>(),
    spaceName: null,
    spaceType: null,
    fieldContextTitle: null,
    canvasView: null,
    canvasVisibleEntities: [],
  }
) {
  const embeddings = getLangChainEmbeddings()
  const ctx = context

  return {
    get_my_spaces: tool({
      description:
        "Get every Space (MeSpace or WeSpace) the current authenticated user is a member of or owns. Use this when the user mentions 'my spaces' / 'my space' / 'my pulses' and no activeSpaceId is set.",
      inputSchema: z.object({}),
      execute: async () => {
        logToolDispatch('get_my_spaces', ctx, {})
        if (!ctx.currentUserId) {
          return {
            found: false,
            spaces: [],
            message:
              'Could not identify current user. Please log in and try again.',
          }
        }
        try {
          const graph = await initGraph()
          const cypher = `
            MATCH (p:Person {id: $userId})
            OPTIONAL MATCH (p)-[:OWNS]->(owned:Space)
            OPTIONAL MATCH (p)<-[:IS_MEMBER]-(sm:SpaceMembership)<-[:HAS_MEMBER]-(member:Space)
            WITH collect(DISTINCT owned) + collect(DISTINCT member) AS allSpaces
            UNWIND allSpaces AS s
            WITH DISTINCT s WHERE s IS NOT NULL
            RETURN s.id AS id, s.name AS name, s.description AS description, labels(s) AS labels
            ORDER BY s.name
          `
          const results = await graph.query<Record<string, unknown>>(cypher, {
            userId: ctx.currentUserId,
          })
          if (!results || results.length === 0) {
            return {
              found: false,
              spaces: [],
              message: 'You are not currently a member of any spaces.',
            }
          }
          const spaces = results.map((row) => ({
            id: String(row.id || ''),
            name: String(row.name || ''),
            description: (row.description as string | null) ?? null,
            type:
              Array.isArray(row.labels) && row.labels.includes('MeSpace')
                ? 'MeSpace'
                : Array.isArray(row.labels) && row.labels.includes('WeSpace')
                  ? 'WeSpace'
                  : 'Space',
          }))
          return { found: true, spaces, count: spaces.length }
        } catch (error) {
          return toErrorResult('Failed to fetch your spaces', error)
        }
      },
    }),

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
        logToolDispatch('search_person', ctx, { name })
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
        logToolDispatch('search_community', ctx, { query })
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
        'Search spaces by name (supports personal and collaborative spaces). Prefer the activeSpaceId from session context if available.',
      inputSchema: z.object({
        name: z.string().describe('Space name or partial space name.'),
      }),
      execute: async ({ name }: { name: string }) => {
        logToolDispatch('search_space', ctx, { name })
        try {
          const graph = await initGraph()
          const spaceTool = createSpaceSearchTool(graph, ctx.currentUserId)
          const result = await spaceTool.invoke({ name })
          return JSON.parse(result)
        } catch (error) {
          return toErrorResult('Failed to search space', error)
        }
      },
    }),

    rename_space: tool({
      description:
        'Rename a space by current name and new name. Search first if needed. This write is gated by user approval (HITL).',
      inputSchema: z.object({
        currentName: z.string().describe('Current space name.'),
        newName: z.string().describe('Desired new space name.'),
      }),
      execute: async (args: { currentName: string; newName: string }) => {
        logToolDispatch('rename_space', ctx, args)
        return runWriteTool('rename_space', { ...args }, ctx)
      },
    }),

    search_field_context: tool({
      description:
        'Search field contexts by title or emergent name. If activeSpaceId is in session context, scope to that Space; otherwise pass spaceName to filter.',
      inputSchema: z.object({
        query: z.string().describe('Field context title or keyword.'),
        spaceName: z
          .string()
          .optional()
          .describe('Optional space name filter.'),
        spaceId: z
          .string()
          .optional()
          .describe(
            'Optional space ID filter. Prefer this over spaceName when activeSpaceId is available in session context.'
          ),
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
        spaceId,
        limit,
      }: {
        query: string
        spaceName?: string
        spaceId?: string
        limit?: number
      }) => {
        const resolvedSpaceId = spaceId || ctx.spaceId || undefined
        logToolDispatch('search_field_context', ctx, {
          query,
          spaceName,
          resolvedSpaceId,
          limit,
        })
        if (resolvedSpaceId) {
          const check = await assertCanViewSpace(ctx, resolvedSpaceId)
          if (check !== true) return check
        }
        try {
          const graph = await initGraph()
          return await searchFieldContexts(graph, {
            query,
            spaceName,
            spaceId: resolvedSpaceId,
            limit,
          })
        } catch (error) {
          return toErrorResult('Failed to search field context', error)
        }
      },
    }),

    update_field_context: tool({
      description:
        'Update a field context title and/or emergent name. Prefer contextId to avoid ambiguity. This write is gated by user approval (HITL).',
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
      execute: async (args: {
        contextId?: string
        currentTitle?: string
        spaceName?: string
        newTitle?: string
        newEmergentName?: string
      }) => {
        logToolDispatch('update_field_context', ctx, args)
        return runWriteTool('update_field_context', { ...args }, ctx)
      },
    }),

    create_field_context: tool({
      description:
        'Create a new field context inside a space the user can edit. Provide spaceId or spaceName plus the new context title. This write is gated by user approval (HITL).',
      inputSchema: z.object({
        spaceId: z.string().optional(),
        spaceName: z.string().optional(),
        title: z.string().describe('New context title.'),
        emergentName: z.string().optional(),
      }),
      execute: async (args: {
        spaceId?: string
        spaceName?: string
        title: string
        emergentName?: string
      }) => {
        const resolved = {
          ...args,
          spaceId: args.spaceId || ctx.spaceId || undefined,
        }
        logToolDispatch('create_field_context', ctx, resolved)
        return runWriteTool('create_field_context', { ...resolved }, ctx)
      },
    }),

    delete_field_context: tool({
      description:
        'Delete a field context the user can edit. If it has pulses, set deletePulses=true to remove them too. This write is gated by user approval (HITL).',
      inputSchema: z.object({
        contextId: z.string().optional(),
        contextTitle: z.string().optional(),
        currentTitle: z.string().optional(),
        spaceName: z.string().optional(),
        deletePulses: z.boolean().optional(),
      }),
      execute: async (args: {
        contextId?: string
        contextTitle?: string
        currentTitle?: string
        spaceName?: string
        deletePulses?: boolean
      }) => {
        logToolDispatch('delete_field_context', ctx, args)
        return runWriteTool('delete_field_context', { ...args }, ctx)
      },
    }),

    search_pulse: tool({
      description:
        'Search pulses by title/content with optional context and pulse type filters. If activeFieldContextId is in session context, scope to that context.',
      inputSchema: z.object({
        query: z.string().describe('Pulse title or content keyword.'),
        contextId: z
          .string()
          .optional()
          .describe(
            'Optional field context ID filter. Defaults to activeFieldContextId from session context when present.'
          ),
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
        const resolvedContextId =
          input.contextId || ctx.fieldContextId || undefined
        logToolDispatch('search_pulse', ctx, {
          ...input,
          resolvedContextId,
        })
        try {
          const graph = await initGraph()
          return await searchPulses(graph, {
            ...input,
            contextId: resolvedContextId,
          })
        } catch (error) {
          return toErrorResult('Failed to search pulse', error)
        }
      },
    }),

    update_pulse: tool({
      description:
        'Update pulse fields (title/content/status/intensity/horizon/resourceType/etc). Prefer pulseId to avoid ambiguity. This write is gated by user approval (HITL).',
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
      execute: async (args: {
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
        logToolDispatch('update_pulse', ctx, args)
        return runWriteTool('update_pulse', { ...args }, ctx)
      },
    }),

    create_pulse: tool({
      description:
        'Create a new pulse in a field context the user can edit. This write is gated by user approval (HITL).',
      inputSchema: z.object({
        contextId: z.string().optional(),
        contextTitle: z.string().optional(),
        spaceName: z.string().optional(),
        pulseType: z
          .enum([
            'GoalPulse',
            'ResourcePulse',
            'StoryPulse',
            'CarePulse',
            'CoreValuePulse',
            'FieldPulse',
          ])
          .optional(),
        title: z.string(),
        content: z.string(),
        status: z.string().optional(),
        intensity: z.number().optional(),
        horizon: z.string().optional(),
        resourceType: z.string().optional(),
        availability: z.number().optional(),
        why: z.string().optional(),
        location: z.string().optional(),
        time: z.string().optional(),
      }),
      execute: async (args: Record<string, unknown>) => {
        const resolved = {
          ...args,
          contextId:
            (args.contextId as string | undefined) ||
            ctx.fieldContextId ||
            undefined,
        }
        logToolDispatch('create_pulse', ctx, resolved)
        return runWriteTool('create_pulse', { ...resolved }, ctx)
      },
    }),

    delete_pulse: tool({
      description:
        'Delete a pulse the user can edit. This write is gated by user approval (HITL).',
      inputSchema: z.object({
        pulseId: z.string().optional(),
        currentTitle: z.string().optional(),
        contextId: z.string().optional(),
      }),
      execute: async (args: {
        pulseId?: string
        currentTitle?: string
        contextId?: string
      }) => {
        logToolDispatch('delete_pulse', ctx, args)
        return runWriteTool('delete_pulse', { ...args }, ctx)
      },
    }),

    edit_pulse_context_link: tool({
      description:
        'Link (share) or unlink (remove) a pulse to/from a field context. This write is gated by user approval (HITL).',
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
      execute: async (args: {
        action: 'link' | 'unlink'
        pulseId: string
        contextId?: string
        contextTitle?: string
      }) => {
        logToolDispatch('edit_pulse_context_link', ctx, args)
        return runWriteTool('edit_pulse_context_link', { ...args }, ctx)
      },
    }),

    update_my_profile: tool({
      description:
        'Update the current authenticated user profile. Currently supports updating your own display name only. This write is gated by user approval (HITL).',
      inputSchema: z.object({
        newName: z
          .string()
          .min(1)
          .describe('Your new display name for your own profile.'),
      }),
      execute: async (args: { newName: string }) => {
        logToolDispatch('update_my_profile', ctx, args)
        return runWriteTool('update_my_profile', { ...args }, ctx)
      },
    }),

    delete_my_profile: tool({
      description:
        'Deactivate the current authenticated user profile. Only applies to your own account. This write is gated by user approval (HITL).',
      inputSchema: z.object({
        confirm: z.boolean().optional(),
      }),
      execute: async (args: { confirm?: boolean }) => {
        logToolDispatch('delete_my_profile', ctx, args)
        return runWriteTool('delete_my_profile', { ...args }, ctx)
      },
    }),

    query_for_bloom: tool({
      description:
        'Pull specific graph entities (spaces, field contexts, pulses, people, resonances) into the Bloom canvas so the user can SEE them. Use whenever the user wants to visualize, show, bring up, pull up, or see something in the graph — especially when the conversation has drifted to an entity that is not currently on the canvas. Provide a precise natural-language intent that names entity types and any names, titles, or keywords from the conversation. The tool generates safe read-only Cypher under the hood, runs it scoped to the current user, and returns NVL-shaped nodes and relationships. After this tool returns nodes, emit a BLOOM_GRAPH_OVERLAY marker in your reply text immediately followed by the JSON payload { summary, nodes, relationships }, then continue in plain English. Never paste the Cypher. Never mention raw ids.',
      inputSchema: z.object({
        intent: z
          .string()
          .min(8)
          .max(500)
          .describe(
            'Natural-language description of what to show in Bloom. Be precise about entity types and names/keywords from the conversation. Example: "Show the field context titled Care Practices in the user\'s active MeSpace, and the pulses inside it."'
          ),
      }),
      execute: async ({ intent }: { intent: string }) => {
        logToolDispatch('query_for_bloom', ctx, { intent })
        if (!ctx.currentUserId) {
          return {
            found: false,
            summary:
              'I need you to be signed in before I can pull graph data into Bloom.',
          }
        }
        try {
          const result = await generateAndRunForBloom({
            intent,
            userId: ctx.currentUserId,
            activeSpaceId: ctx.spaceId,
            activeSpaceName: ctx.spaceName ?? null,
            activeSpaceType: ctx.spaceType ?? null,
            activeFieldContextId: ctx.fieldContextId,
            activeFieldContextTitle: ctx.fieldContextTitle ?? null,
            focalEntity: ctx.focalEntity
              ? {
                  type: ctx.focalEntity.type,
                  id: ctx.focalEntity.id,
                  label: ctx.focalEntity.label ?? null,
                }
              : null,
            canvasVisibleEntities: ctx.canvasVisibleEntities ?? [],
          })
          if (!result.found) {
            return { found: false, summary: result.summary }
          }
          return {
            found: true,
            summary: result.summary,
            nodes: result.nodes,
            relationships: result.relationships,
          }
        } catch (error) {
          return toErrorResult('Failed to query graph for Bloom', error)
        }
      },
    }),

    // get_focal_entity is only useful when the user is actually viewing a
    // specific entity. Registering it only when ctx.focalEntity is non-null
    // means the model literally cannot call it on neutral surfaces (dashboard
    // root, /graph, /assistant). Otherwise the pronoun "this" in benign
    // questions like "what space is this" would steer the model into a
    // failing tool call with no useful recovery on reasoning models.
    ...(ctx.focalEntity
      ? {
          get_focal_entity: tool({
            description:
              'Fetch the full record of the entity in `focalEntity` from SESSION CONTEXT (the specific person, pulse, field context, or space the user is currently viewing). Call this when the user uses a pronoun ("this", "they", "here", "this person", "this goal") or asks an open question ("tell me about this", "what should I do here") that refers to the entity in focus. Returns the entity record.',
            inputSchema: z.object({}),
            execute: async () => {
              logToolDispatch('get_focal_entity', ctx, {})
              const focal = ctx.focalEntity
              if (!focal) {
                // Defensive — should be unreachable because the tool is only
                // registered when focal is set.
                return {
                  status: 'no_focal_entity' as const,
                  message: 'No focal entity in session.',
                }
              }
              if (!isFocalEntityType(focal.type)) {
                return {
                  status: 'error' as const,
                  message: `Unsupported focal entity type: ${String(
                    focal.type
                  )}`,
                }
              }
              try {
                const graph = await initGraph()
                const record = await getFocalRecord(graph, focal)
                if (!record) {
                  return {
                    status: 'error' as const,
                    message: `Could not find ${focal.type} ${focal.id}.`,
                  }
                }
                return {
                  status: 'ok' as const,
                  type: focal.type,
                  id: focal.id,
                  label: focal.label ?? null,
                  record,
                }
              } catch (error) {
                return toErrorResult('Failed to fetch focal entity', error)
              }
            },
          }),
        }
      : {}),

    graph_rag_search: tool({
      description:
        'Semantic Graph RAG retrieval across people, pulses, and conversation chunks (specific moments from a pulse\'s source conversation). Uses vector indexes enriched with graph relationships. If activeFieldContextId is in session context, defaults the contextId filter to it.',
      inputSchema: z.object({
        query: z.string().describe('Natural language search query.'),
        scope: z
          .enum(['people', 'pulses', 'chunks', 'all'])
          .optional()
          .describe(
            'Search scope. Use `chunks` when the user is asking about a specific moment or quote from a past conversation. Default: all.'
          ),
        contextId: z
          .string()
          .optional()
          .describe(
            'Optional field context ID for pulse-scoped retrieval. Defaults to activeFieldContextId from session context when present.'
          ),
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
        scope?: 'people' | 'pulses' | 'chunks' | 'all'
        contextId?: string
        limit?: number
      }) => {
        const resolvedContextId = contextId || ctx.fieldContextId || undefined
        logToolDispatch('graph_rag_search', ctx, {
          query,
          scope,
          resolvedContextId,
          limit,
        })
        try {
          const graph = await initGraph()
          return await graphRagSearch(graph, embeddings, {
            query,
            scope,
            contextId: resolvedContextId,
            limit,
          })
        } catch (error) {
          return toErrorResult('Failed to run Graph RAG retrieval', error)
        }
      },
    }),
  }
}
