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

/**
 * Short, model-facing keys for the living-system entity types a conversation
 * can surface. `person` maps to a PersonPulse (HAS_PERSON); every other key
 * maps to a FieldPulse subtype (HAS_PULSE). Extensible per GOAL-267 — adding a
 * new living-system type is a single entry here plus its create mapping.
 */
export type SuggestionTypeKey =
  | 'person'
  | 'goal'
  | 'resource'
  | 'story'
  | 'care'
  | 'value'

interface SuggestionTypeConfig {
  /** Which HITL write tool an accept dispatches. */
  writeTool: 'create_person' | 'create_pulse'
  /** create_pulse pulseType, or null for person (create_person). */
  pulseType:
    | 'GoalPulse'
    | 'ResourcePulse'
    | 'StoryPulse'
    | 'CarePulse'
    | 'CoreValuePulse'
    | null
  /** User-facing label for the type chip. */
  label: string
}

export const SUGGESTION_TYPES: Record<SuggestionTypeKey, SuggestionTypeConfig> =
  {
    person: { writeTool: 'create_person', pulseType: null, label: 'person' },
    goal: { writeTool: 'create_pulse', pulseType: 'GoalPulse', label: 'goal' },
    resource: {
      writeTool: 'create_pulse',
      pulseType: 'ResourcePulse',
      label: 'resource',
    },
    story: {
      writeTool: 'create_pulse',
      pulseType: 'StoryPulse',
      label: 'story',
    },
    care: { writeTool: 'create_pulse', pulseType: 'CarePulse', label: 'care' },
    value: {
      writeTool: 'create_pulse',
      pulseType: 'CoreValuePulse',
      label: 'core value',
    },
  }

/** Map a stored node label (e.g. "GoalPulse") to its short suggestion key. */
function labelToSuggestionKey(label: string | null): SuggestionTypeKey | null {
  switch (label) {
    case 'person':
      return 'person'
    case 'GoalPulse':
      return 'goal'
    case 'ResourcePulse':
      return 'resource'
    case 'StoryPulse':
      return 'story'
    case 'CarePulse':
      return 'care'
    case 'CoreValuePulse':
      return 'value'
    default:
      return null
  }
}

/**
 * A single conversation-derived pulse suggestion, ready for the inline
 * suggestion card. `createArgs` is the exact, internal payload the UI hands
 * back as a one-shot `executeAction` on accept — it carries the contextId
 * (an internal artifact the card never renders) so the write is fully
 * deterministic. Everything the user sees (`name`, `typeLabel`,
 * `sourceSnippet`) is human-readable per Rule 1/3 (kb/07).
 */
export interface PulseSuggestion {
  /** Human-readable display name — a person's name or a pulse title. */
  name: string
  /** Short living-system type key. */
  type: SuggestionTypeKey
  /** User-facing label for the type chip ("person", "goal", …). */
  typeLabel: string
  /** Short verbatim quote from the dialogue that triggered the suggestion. */
  sourceSnippet: string | null
  /** Which HITL write tool the card dispatches on accept. */
  writeTool: 'create_person' | 'create_pulse'
  /** Exact write args executed verbatim on accept (carries ids). */
  createArgs: Record<string, unknown>
}

/**
 * Collect canonical "type:name" keys for every pulse already living anywhere
 * in the given Space — people (by name) and field pulses (by title), each
 * tagged with its short type. Used to suppress duplicate suggestions (AC: name
 * match + type match) before they reach the user.
 *
 * Space-wide on purpose: an entity already added under a sibling FieldContext
 * is still a duplicate from the user's perspective. The caller authorizes the
 * Space read via assertCanViewSpace before invoking this.
 */
async function fetchExistingPulseKeys(
  graph: Neo4jGraph,
  spaceId: string
): Promise<Set<string>> {
  const rows = await graph.query<{
    ptype: string | null
    pname: string | null
  }>(
    `
    MATCH (s:Space {id: $spaceId})-[:HAS_CONTEXT]->(:FieldContext)-[:HAS_PERSON]->(p:Person:PersonPulse)
    RETURN 'person' AS ptype, p.name AS pname
    UNION
    MATCH (s:Space {id: $spaceId})-[:HAS_CONTEXT]->(:FieldContext)-[:HAS_PULSE]->(fp:FieldPulse)
    RETURN head([l IN labels(fp)
      WHERE l IN ['GoalPulse', 'ResourcePulse', 'StoryPulse', 'CarePulse', 'CoreValuePulse']
    ]) AS ptype, fp.title AS pname
    `,
    { spaceId }
  )
  const keys = new Set<string>()
  for (const row of rows ?? []) {
    const key = labelToSuggestionKey(row.ptype)
    // Canonicalize here — the SAME helper the suggestion side uses — so a stored
    // "Sarah  Chen" and a candidate "Sarah Chen" produce identical keys. Doing
    // it in JS (not Cypher) keeps a single source of truth for the dedup form.
    const name = canonicalizeName(row.pname ?? '')
    if (key && name) keys.add(`${key}:${name}`)
  }
  return keys
}

function canonicalizeName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, ' ').trim()
}

/**
 * Resolve the parent Space id for a FieldContext. On the field-context route
 * the request body carries activeFieldContextId but NOT activeSpaceId (the
 * focal scope is the context, not the space), so dedup needs to derive the
 * owning Space itself. Authorization is enforced separately by the caller via
 * assertCanViewSpace on the resolved id.
 */
async function resolveSpaceIdForContext(
  graph: Neo4jGraph,
  fieldContextId: string
): Promise<string | null> {
  const rows = await graph.query<{ spaceId: string | null }>(
    `
    MATCH (s:Space)-[:HAS_CONTEXT]->(:FieldContext {id: $fieldContextId})
    RETURN s.id AS spaceId
    LIMIT 1
    `,
    { fieldContextId }
  )
  return rows?.[0]?.spaceId ?? null
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

    // Only useful when an active Space is in session — per Rule 4 in
    // kb/07-ai-assistant-ux.md, don't register a tool whose only useful
    // path needs session state that's absent. Keeps the model from
    // calling this from the dashboard root and getting a no-op error.
    ...(ctx.spaceId
      ? {
          list_field_contexts_in_active_space: tool({
            description:
              "List every Field Context in the user's active Space (activeSpaceId from SESSION CONTEXT) with pulse counts, plus the space-wide total. Use this for any OVERVIEW or COUNT question about the active Space — e.g. 'what's in this space', 'what fields are here', 'list the field contexts', AND 'how many pulses are in this space', 'how many fields does this space have'. Prefer this over search_field_context (which needs a keyword) when the user wants a list or a count rather than a keyword search. Returns totalPulses (the sum across all field contexts) and count (the number of field contexts), plus id, title, emergentName, and pulseCount for each Field Context. Answer 'how many pulses' with totalPulses.",
            inputSchema: z.object({}),
            execute: async () => {
              logToolDispatch('list_field_contexts_in_active_space', ctx, {})
              if (!ctx.spaceId) {
                return {
                  status: 'error' as const,
                  message:
                    'No active Space in session. Call get_my_spaces first or ask the user which Space.',
                }
              }
              const check = await assertCanViewSpace(ctx, ctx.spaceId)
              if (check !== true) return check
              try {
                const graph = await initGraph()
                const cypher = `
                  MATCH (s:Space {id: $spaceId})
                  OPTIONAL MATCH (s)-[:HAS_CONTEXT]->(c:FieldContext)
                  OPTIONAL MATCH (c)-[:HAS_PULSE]->(p)
                  WITH s, c, count(p) AS pulseCount
                  ORDER BY c.createdAt DESC
                  WITH s, collect(CASE WHEN c IS NULL THEN null ELSE {
                    id: c.id,
                    title: c.title,
                    emergentName: c.emergentName,
                    pulseCount: pulseCount
                  } END) AS rows
                  RETURN s.name AS spaceName,
                    [r IN rows WHERE r IS NOT NULL] AS fieldContexts
                `
                const rows = await graph.query<{
                  spaceName: string | null
                  fieldContexts: Array<{
                    id: string
                    title: string | null
                    emergentName: string | null
                    // LangChain's Neo4jGraph.query stringifies every Neo4j
                    // integer (isInt → item.toString()), so count() arrives
                    // as a decimal string like "5" — NOT a number and NOT a
                    // { low, high } object. Coerce with Number(... || 0)
                    // below, mirroring asFieldContextRecord in
                    // field-context.service.ts. The previous `.low`-based
                    // coercion read "5".low === undefined and collapsed every
                    // count to 0 (GOAL-258).
                    pulseCount: number | string | null
                  }>
                }>(cypher, { spaceId: ctx.spaceId })
                const row = rows?.[0]
                const fieldContexts = (row?.fieldContexts ?? []).map((fc) => ({
                  id: fc.id,
                  title: fc.title,
                  emergentName: fc.emergentName,
                  pulseCount: Number(fc.pulseCount || 0),
                }))
                const totalPulses = fieldContexts.reduce(
                  (sum, fc) => sum + fc.pulseCount,
                  0
                )
                const spaceName =
                  row?.spaceName ?? ctx.spaceName ?? null
                return {
                  status: 'ok' as const,
                  spaceId: ctx.spaceId,
                  spaceName,
                  count: fieldContexts.length,
                  totalPulses,
                  fieldContexts,
                  message:
                    fieldContexts.length === 0
                      ? `${spaceName ?? 'This space'} has no field contexts yet.`
                      : undefined,
                }
              } catch (error) {
                return toErrorResult(
                  'Failed to list field contexts in active space',
                  error
                )
              }
            },
          }),
        }
      : {}),

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

    // suggest_pulses only makes sense when there is an active FieldContext to
    // create into — without one there is nowhere to put an accepted pulse, so
    // it is omitted entirely (Rule 4, kb/07). NOTE: on the field-context route
    // the body carries activeFieldContextId but NOT activeSpaceId, so we gate
    // on the context alone and resolve the owning Space for dedup at call time
    // (resolveSpaceIdForContext). It is READ-ONLY: it never writes. It returns
    // conversation-derived candidates (deduped Space-wide) for the inline
    // suggestion card, which performs the actual create via the deterministic
    // executeAction path.
    ...(ctx.fieldContextId
      ? {
          suggest_pulses: tool({
            description:
              "Surface pulses worth creating from the ongoing conversation as one-tap suggestions the user can add to their active field context. Suggest ANY living-system type that fits this field context's purpose: people (person), goals (goal), resources (resource), stories (story), care practices (care), and core values (value). Call this PROACTIVELY — but only when the dialogue clearly surfaces a concrete, substantive candidate that fits the active field context and is not obviously already in the space. For each candidate give its type, a concise human name/title, and a short verbatim source quote; for non-person pulses also give a one-line `content`. Do NOT suggest vague references ('a friend', 'something'), the current user, duplicates, or filler just to be chatty. The user sees inline cards and chooses to add or dismiss each — you never create anything yourself. After calling, keep your reply brief (e.g. 'I noticed a few things worth adding — add them if you'd like.').",
            inputSchema: z.object({
              candidates: z
                .array(
                  z.object({
                    type: z
                      .enum([
                        'person',
                        'goal',
                        'resource',
                        'story',
                        'care',
                        'value',
                      ])
                      .describe(
                        'Living-system type that best fits this candidate and the active field context.'
                      ),
                    name: z
                      .string()
                      .min(1)
                      .describe(
                        'For person: full name ("Sarah Chen", "Tom"). For other types: a concise pulse title ("Ship the beta", "Community kitchen").'
                      ),
                    content: z
                      .string()
                      .optional()
                      .describe(
                        'For non-person pulses: a one-line description/body. Ignored for person.'
                      ),
                    firstName: z
                      .string()
                      .optional()
                      .describe(
                        'Person only — given name, if cleanly separable. Optional; the name is split automatically when omitted.'
                      ),
                    lastName: z
                      .string()
                      .optional()
                      .describe(
                        'Person only — surname, if known. Optional; many people are known by a single name.'
                      ),
                    sourceSnippet: z
                      .string()
                      .optional()
                      .describe(
                        'Short verbatim quote from the conversation that surfaced this candidate (~140 chars). Helps the user recognise why it surfaced.'
                      ),
                  })
                )
                .min(1)
                .max(6)
                .describe('Up to 6 candidate pulses surfaced from the dialogue.'),
            }),
            execute: async ({
              candidates,
            }: {
              candidates: Array<{
                type: SuggestionTypeKey
                name: string
                content?: string
                firstName?: string
                lastName?: string
                sourceSnippet?: string
              }>
            }) => {
              logToolDispatch('suggest_pulses', ctx, {
                count: candidates?.length ?? 0,
              })
              if (!ctx.currentUserId) {
                return {
                  status: 'error' as const,
                  message:
                    'You need to be signed in before I can suggest pulses to add.',
                }
              }
              if (!ctx.fieldContextId) {
                // Defensive — the tool is only registered when a FieldContext
                // is active, so this should be unreachable.
                return {
                  status: 'error' as const,
                  message:
                    'Open a field context first and I can suggest pulses to add to it.',
                }
              }
              try {
                const graph = await initGraph()
                // On the field-context route activeSpaceId is null, so derive
                // the owning Space from the field context for dedup.
                const effectiveSpaceId =
                  ctx.spaceId ||
                  (await resolveSpaceIdForContext(graph, ctx.fieldContextId))
                // Authorize the Space read (and, by extension, the create
                // target) before touching its data.
                if (effectiveSpaceId) {
                  const canView = await assertCanViewSpace(ctx, effectiveSpaceId)
                  if (canView !== true) return canView
                }
                const existing = effectiveSpaceId
                  ? await fetchExistingPulseKeys(graph, effectiveSpaceId)
                  : new Set<string>()
                const seen = new Set<string>()
                const suggestions: PulseSuggestion[] = []
                let suppressedDuplicates = 0

                for (const candidate of candidates) {
                  // The Zod enum already constrains type; if an unknown value
                  // ever slips through (schema drift), skip it rather than
                  // silently mis-creating a PersonPulse from non-person content.
                  const typeConfig = SUGGESTION_TYPES[candidate.type]
                  if (!typeConfig) continue
                  const typeKey = candidate.type
                  const rawName = (candidate.name || '').trim()
                  if (!rawName) continue

                  const sourceSnippet =
                    (candidate.sourceSnippet || '').trim().slice(0, 200) || null

                  // Build the per-type display name + write payload.
                  let displayName = rawName
                  let createArgs: Record<string, unknown>

                  if (typeKey === 'person') {
                    const explicitFirst = (candidate.firstName || '').trim()
                    const explicitLast = (candidate.lastName || '').trim()
                    const parts = rawName.split(/\s+/).filter(Boolean)
                    const firstName = explicitFirst || parts[0] || ''
                    const lastName = explicitLast || parts.slice(1).join(' ')
                    if (!firstName) continue
                    // Use the SAME composed name the write persists
                    // (createPersonAuthorized: name = firstName [+ lastName]) so
                    // the card label, the created entity, and the dedup key all
                    // agree.
                    displayName = lastName
                      ? `${firstName} ${lastName}`
                      : firstName
                    createArgs = {
                      firstName,
                      ...(lastName ? { lastName } : {}),
                      contextId: ctx.fieldContextId,
                      ...(ctx.fieldContextTitle
                        ? { contextTitle: ctx.fieldContextTitle }
                        : {}),
                    }
                  } else {
                    const content = (candidate.content || '').trim()
                    createArgs = {
                      pulseType: typeConfig.pulseType,
                      title: displayName,
                      // createPulseAuthorized defaults content to the title when
                      // empty (GOAL-261), so only forward a real description.
                      ...(content ? { content } : {}),
                      contextId: ctx.fieldContextId,
                      ...(ctx.fieldContextTitle
                        ? { contextTitle: ctx.fieldContextTitle }
                        : {}),
                      ...(ctx.spaceName ? { spaceName: ctx.spaceName } : {}),
                    }
                  }

                  const dedupKey = `${typeKey}:${canonicalizeName(displayName)}`
                  if (existing.has(dedupKey) || seen.has(dedupKey)) {
                    suppressedDuplicates++
                    continue
                  }
                  seen.add(dedupKey)

                  suggestions.push({
                    name: displayName,
                    type: typeKey,
                    typeLabel: typeConfig.label,
                    sourceSnippet,
                    writeTool: typeConfig.writeTool,
                    createArgs,
                  })
                }

                return {
                  status: 'ok' as const,
                  suggestions,
                  suppressedDuplicates,
                  fieldContextTitle: ctx.fieldContextTitle ?? null,
                  message:
                    suggestions.length > 0
                      ? `Surfacing ${suggestions.length} ${
                          suggestions.length === 1 ? 'suggestion' : 'suggestions'
                        } you might want to add.`
                      : 'No new pulses to suggest right now.',
                }
              } catch (error) {
                return toErrorResult(
                  'Failed to prepare pulse suggestions',
                  error
                )
              }
            },
          }),
        }
      : {}),

    graph_rag_search: tool({
      description:
        "Semantic Graph RAG retrieval across people, pulses, and conversation chunks. People and pulses are searched across the whole graph. Conversation chunks (sentence-level segments of the back-and-forth that produced a pulse) are PRIVATE to the user who created the parent pulse — the `chunks` and `all` scopes will only ever return the current user's own chunks. Never offer to search another person's conversation chunks. If activeFieldContextId is in session context, defaults the contextId filter to it.",
      inputSchema: z.object({
        query: z.string().describe('Natural language search query.'),
        scope: z
          .enum(['people', 'pulses', 'chunks', 'all'])
          .optional()
          .describe(
            "Search scope. Use `chunks` when the user is asking about a specific moment or quote from THEIR OWN past conversation with the assistant — the chunk index is locked to the current user and never returns another user's conversations. Default: all."
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
            userId: ctx.currentUserId,
          })
        } catch (error) {
          return toErrorResult('Failed to run Graph RAG retrieval', error)
        }
      },
    }),
  }
}
