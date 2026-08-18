import { tool, type Tool, type ToolSet } from 'ai'
import { z } from 'zod'
import { initGraph } from '@/modules/graph'
import { getLangChainEmbeddings } from '@/lib/llm/adapters/langchain-adapter'
import { createPersonSearchTool } from '@/modules/agent/tools/person-search.tool'
import { createSpaceSearchTool } from '@/modules/agent/tools/space/space-search.tool'
import { searchFieldContexts } from '@/modules/agent/tools/field-context/field-context.service'
import { searchPulses } from '@/modules/agent/tools/pulse/pulse.service'
import { graphRagSearch } from '@/modules/agent/tools/rag/graph-rag.service'
import { canViewContent } from '@/lib/permissions/space-permissions'
import {
  canViewPulse,
  canViewContext,
} from '@/lib/permissions/pulse-visibility'
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
import { toAssistantSafeLocation } from '@/lib/ingest/document-download-url'
import type { Neo4jGraph } from '@langchain/community/graphs/neo4j_graph'

type ToolError = {
  status: 'error'
  message: string
}

function toErrorResult(prefix: string, error: unknown): ToolError {
  // The raw exception message routinely carries technical internals — Neo4j /
  // Cypher errors like "LIMIT: Invalid input. '25.0' is not a valid value",
  // stack fragments, GraphQL field names. Feeding that string back to the model
  // means it paraphrases it into member-facing copy ("a search-tool limit error
  // on this surface"), surfacing a technical failure a participant can't make
  // sense of — the exact complaint behind kb/07 Rule 1. So we keep the real
  // error in the server log (for debugging) and hand the model a clean,
  // member-safe message it can relay without leaking internals.
  console.error('[Assistant Tool Error]', {
    prefix,
    error: error instanceof Error ? error.message : String(error),
  })
  return {
    status: 'error',
    message:
      'I couldn’t complete that just now because of a temporary problem on our end. Please try again in a moment.',
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
   * The authenticated user's resolved display name. Forwarded to
   * `query_for_bloom` so the co-visualization rescue can recognise the user
   * when the model names them in a third-person intent (see RunForBloomArgs).
   */
  currentUserName?: string | null
  /**
   * Which canvas surface the user is currently looking at, plus the
   * flat list of entities rendered there. Forwarded to
   * `query_for_bloom` so the Cypher generator can prefer a
   * canvas-known id over a fresh keyword search.
   */
  canvasView?: 'dashboard' | 'bloom' | null
  canvasVisibleEntities?: Array<{
    id: string
    name: string
    type: string
    source: 'dashboard' | 'bloom'
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
      // GOAL-295: contexts can be nested. Surface the parent chain and the
      // live sub-contexts (titles included — kb/07 Rule 3) so the assistant
      // describes a sub-field as sitting inside its parent field, not as
      // hanging directly off the Space.
      const cypher = `
        MATCH (c:FieldContext {id: $id})
        OPTIONAL MATCH (s:Space)-[:HAS_CONTEXT]->(c)
        WITH c, head(collect(s)) AS s
        OPTIONAL MATCH (parent:FieldContext)-[:HAS_SUBCONTEXT]->(c)
        WITH c, s, head(collect(parent)) AS parent
        OPTIONAL MATCH (c)-[:HAS_SUBCONTEXT]->(child:FieldContext)
        WHERE child.deletedAt IS NULL
        WITH c, s, parent,
             [ch IN collect(DISTINCT child) | { id: ch.id, title: ch.title }] AS subContexts
        RETURN {
          id: c.id,
          title: c.title,
          emergentName: c.emergentName,
          createdAt: c.createdAt,
          parentContext: CASE WHEN parent IS NULL THEN null ELSE {
            id: parent.id,
            title: parent.title
          } END,
          subContexts: subContexts,
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
      const record = rows?.[0]?.record ?? null
      if (!record) return null
      // GOAL-322: a pulse extracted from an uploaded document carries the
      // durable download locator in `location` (GOAL-283/316). Handing that URL
      // — and the raw document id inside it — to the model invites it straight
      // into chat prose, which kb/07 Rule 1 forbids. Shape it into the opaque
      // phrase here; real places and external source URLs pass through.
      return {
        ...record,
        location: toAssistantSafeLocation(
          (record.location as string | null) ?? null
        ),
      }
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
 * A single conversation-derived connection suggestion, ready for the inline
 * connection card. Mirrors PulseSuggestion: everything the user sees (`name`,
 * `why`, `sourceSnippet`) is human-readable per Rule 1/3 (kb/07); `createArgs`
 * carries the resolved person ids (internal artifacts the card never renders)
 * so the accepted write is fully deterministic. Always dispatches
 * `create_connection`.
 */
export interface ConnectionSuggestion {
  /** Display label — the other person's name, or "Ada ↔ Ben" for two others. */
  name: string
  /** The relationship in the user's words, inferred from the dialogue. */
  why: string | null
  /** Short verbatim quote from the dialogue that triggered the suggestion. */
  sourceSnippet: string | null
  /** Always create_connection. */
  writeTool: 'create_connection'
  /** Exact write args executed verbatim on accept (carries resolved ids). */
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

/**
 * A single assistant-surfaced resonance between two existing pulses, ready for
 * the inline resonance card. Everything the user sees (`sourceName`,
 * `targetName`, `why`, qualitative `strength`) is human-readable per Rule 1/3
 * (kb/07); `createArgs` carries the resolved pulse ids (internal artifacts the
 * card never renders) so the accepted write is deterministic. Always dispatches
 * `create_resonance`.
 */
export interface ResonanceSuggestion {
  /** Display label for the source pulse (its title). */
  sourceName: string
  /** Display label for the target pulse (its title). */
  targetName: string
  /** Short theme of the resonance ("a shared sense of belonging"). */
  label: string | null
  /** One-line description of why the two resonate, in plain words. */
  why: string | null
  /** Qualitative strength — never a raw score (Rule 1). */
  strength: 'loose' | 'moderate' | 'strong'
  /** Short verbatim quote from the dialogue that surfaced the resonance. */
  sourceSnippet: string | null
  /** Always create_resonance. */
  writeTool: 'create_resonance'
  /** Exact write args executed verbatim on accept (carries resolved ids). */
  createArgs: Record<string, unknown>
}

/**
 * A single assistant-surfaced "capture and resonate" candidate: a NEW pulse the
 * dialogue surfaced, to be created AND connected as a resonance to an EXISTING
 * pulse in the active field. Powers the conversation↔pulse card. Everything the
 * user sees is human-readable (Rule 1/3); `createArgs` carries the resolved
 * existing-pulse id for the deterministic write. Always dispatches
 * `create_resonant_pulse`.
 */
export interface ResonantPulseSuggestion {
  /** Title of the new pulse to capture from the conversation. */
  newPulseName: string
  /** Living-system type of the new pulse. */
  newPulseType: SuggestionTypeKey
  /** User-facing label for the new pulse's type chip. */
  newPulseTypeLabel: string
  /** Title of the existing pulse it resonates with. */
  existingPulseName: string
  /** Short theme of the resonance. */
  label: string | null
  /** One-line plain-words description of why they resonate. */
  why: string | null
  /** Qualitative strength — never a raw score (Rule 1). */
  strength: 'loose' | 'moderate' | 'strong'
  /** Short verbatim quote from the dialogue that surfaced it. */
  sourceSnippet: string | null
  /** Always create_resonant_pulse. */
  writeTool: 'create_resonant_pulse'
  /** Exact write args executed verbatim on accept (carries resolved ids). */
  createArgs: Record<string, unknown>
}

/**
 * Read the resonance-relevant state of a FieldContext in one round-trip: the
 * FieldPulses living in it (for name→id resolution) and the set of pulse pairs
 * that ALREADY have a ResonanceLink (for symmetric dedup). Resonances connect
 * FieldPulses within a single context, so resolution is context-scoped. The
 * caller authorizes the owning Space (assertCanViewSpace) before invoking.
 */
async function fetchContextResonanceState(
  graph: Neo4jGraph,
  fieldContextId: string
): Promise<{
  pulses: Array<{ id: string; name: string }>
  existingPairs: Set<string>
}> {
  const [pulseRows, pairRows] = await Promise.all([
    graph.query<{ id: string; name: string | null }>(
      `
      MATCH (:FieldContext {id: $fieldContextId})-[:HAS_PULSE]->(p:FieldPulse)
      RETURN p.id AS id, coalesce(p.title, p.content) AS name
      LIMIT 500
      `,
      { fieldContextId }
    ),
    graph.query<{ sourceId: string; targetId: string }>(
      // Anchor on the context's pulses and walk inward to the ResonanceLinks
      // that actually touch them — avoids a full label scan over every link.
      `
      MATCH (:FieldContext {id: $fieldContextId})-[:HAS_PULSE]->(p:FieldPulse)<-[:SOURCE|TARGET]-(l:ResonanceLink)
      MATCH (l)-[:SOURCE]->(s:FieldPulse)
      MATCH (l)-[:TARGET]->(t:FieldPulse)
      RETURN DISTINCT s.id AS sourceId, t.id AS targetId
      `,
      { fieldContextId }
    ),
  ])

  const pulses = (pulseRows ?? [])
    .filter((r) => r.id && (r.name ?? '').trim())
    .map((r) => ({ id: r.id, name: (r.name as string).trim() }))

  const existingPairs = new Set<string>()
  for (const row of pairRows ?? []) {
    if (row.sourceId && row.targetId) {
      existingPairs.add(resonancePairKey(row.sourceId, row.targetId))
    }
  }
  return { pulses, existingPairs }
}

/** Order-independent key for a pulse pair (resonances are symmetric). */
function resonancePairKey(a: string, b: string): string {
  return [a, b].sort().join('|')
}

/**
 * Resolve a non-user person (PersonPulse) by name, scoped to the people living
 * in Spaces the current user owns or is a member of. Used by suggest_connections
 * to turn a conversational name into a resolvable id WITHOUT leaking people the
 * user cannot see. Returns 'ambiguous' when a name matches more than one such
 * person (the model should search/disambiguate), 'none' when nothing matches.
 */
async function resolvePersonInUserScope(
  graph: Neo4jGraph,
  userId: string,
  name: string
): Promise<
  | { status: 'ok'; id: string; name: string }
  | { status: 'none' }
  | { status: 'ambiguous' }
> {
  const rows = await graph.query<{ id: string; name: string | null }>(
    `
    MATCH (target:Person:PersonPulse)
    WHERE toLower(trim(coalesce(target.name, ''))) = toLower(trim($name))
    MATCH (space:Space)-[:HAS_CONTEXT]->(:FieldContext)-[:HAS_PERSON]->(target)
    OPTIONAL MATCH (owner:Person)-[:OWNS]->(space)
    OPTIONAL MATCH (space)-[:HAS_MEMBER]->(:SpaceMembership)-[:IS_MEMBER]->(member:Person)
    WITH target,
      [id IN collect(DISTINCT owner.id) WHERE id IS NOT NULL] AS ownerIds,
      [id IN collect(DISTINCT member.id) WHERE id IS NOT NULL] AS memberIds
    WHERE $userId IN ownerIds OR $userId IN memberIds
    RETURN DISTINCT target.id AS id, target.name AS name
    LIMIT 5
    `,
    { name, userId }
  )
  if (!rows || rows.length === 0) return { status: 'none' }
  if (rows.length > 1) return { status: 'ambiguous' }
  return { status: 'ok', id: rows[0].id, name: rows[0].name || name }
}

/**
 * True when a CONNECTED_TO edge already links two people (either direction).
 * Both ids must already be authorized by the caller (resolvePersonInUserScope)
 * — this is an id-anchored dedup check, not a Space-scoped authorization gate.
 */
async function connectionExists(
  graph: Neo4jGraph,
  aId: string,
  bId: string
): Promise<boolean> {
  const rows = await graph.query<{ connected: boolean }>(
    `
    MATCH (a:Person {id: $aId})
    MATCH (b:Person {id: $bId})
    RETURN EXISTS( (a)-[:CONNECTED_TO]-(b) ) AS connected
    `,
    { aId, bId }
  )
  return Boolean(rows?.[0]?.connected)
}

/**
 * Hard ceiling for any single tool call (Phase 3). Generous on purpose: normal
 * tool calls finish in well under a second, so this only trips on a genuinely
 * hung query (a runaway Cypher, a stuck connection). Without it, one stuck tool
 * stalls the whole turn until the route's 60s maxDuration — a frozen UI. With
 * it, the call resolves to a narratable tool-error and the model recovers.
 *
 * Safe for the rare write that runs inside a tool body (an already-approved
 * runWriteTool): the timeout uses Promise.race and never aborts the orphaned
 * promise, and the underlying Neo4j writes auto-commit per statement — so an
 * orphaned write still lands atomically server-side, never half-committed. The
 * only anomaly would be narrating "took too long" while the write actually
 * succeeded, which is theoretical at 25s.
 */
const TOOL_TIMEOUT_MS = 25_000

/** Only log tool calls slower than this — surfaces the ones worth a look
 * (this is also the per-tool duration data Phase 0 didn't capture) without
 * spamming a line for every sub-second call. */
const TOOL_SLOW_LOG_MS = 1_000

/**
 * Wrap every tool's `execute` with a generous timeout + a slow-call duration
 * log. Behaviour-preserving on the happy path: on success the original result
 * passes straight through. On timeout it resolves (never rejects) to the same
 * `{ status: 'error', message }` shape tools already return, so the model
 * narrates it like any other tool failure. A post-timeout rejection from the
 * orphaned promise is swallowed into a tool-error to avoid an unhandled
 * rejection.
 *
 * Assumes promise-returning tools. AI SDK also supports an execute that returns
 * an AsyncIterable (streamed/preliminary output); a tool written that way would
 * be collapsed to a single awaited value here. No current tool streams, but a
 * future streaming tool would need to bypass this wrapper.
 */
function instrumentTools<T extends ToolSet>(tools: T): T {
  const out: Record<string, Tool> = {}
  for (const [name, definition] of Object.entries(tools)) {
    const original = (definition as Tool).execute
    if (typeof original !== 'function') {
      out[name] = definition as Tool
      continue
    }
    const exec = original as (
      args: unknown,
      options: unknown
    ) => Promise<unknown>
    out[name] = {
      ...(definition as Tool),
      execute: async (args: unknown, options: unknown) => {
        const startedAt = performance.now()
        let timer: ReturnType<typeof setTimeout> | undefined
        const guarded = exec(args, options).catch((error) =>
          toErrorResult(`Tool ${name} failed`, error)
        )
        try {
          const timeout = new Promise<ToolError>((resolve) => {
            timer = setTimeout(
              () =>
                resolve({
                  status: 'error',
                  message:
                    'This step took too long and was stopped. Tell the user briefly and suggest narrowing or retrying — do not silently give up.',
                }),
              TOOL_TIMEOUT_MS
            )
          })
          return await Promise.race([guarded, timeout])
        } finally {
          if (timer) clearTimeout(timer)
          const ms = Math.round(performance.now() - startedAt)
          if (ms >= TOOL_SLOW_LOG_MS) {
            console.log(`[Chat API] tool ${name} took ${ms}ms`)
          }
        }
      },
    } as Tool
  }
  return out as T
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

  return instrumentTools({
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
        'Search field contexts by title or emergent name across EVERY Space the member can access (owner or member). By DEFAULT — when the user has not named a Space — omit spaceId/spaceName so the search fans out across all their accessible Spaces. Only pass spaceId/spaceName when the user explicitly restricts to one Space (e.g. "in this space"). Do NOT auto-narrow to the active Space for a general lookup.',
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
        // GOAL-300: do NOT silently inject the active Space (ctx.spaceId). A
        // general lookup from inside a Space must still fan out across ALL the
        // member's accessible Spaces — the member should not have to name the
        // Space. Scope ONLY when the model explicitly passes spaceId/spaceName
        // (i.e. the user asked for a specific Space). searchFieldContexts is
        // $userId-anchored (owner/member), so the broad path stays authorized.
        const resolvedSpaceId = spaceId?.trim() || undefined
        logToolDispatch('search_field_context', ctx, {
          query,
          spaceName,
          resolvedSpaceId,
          limit,
        })
        // Defense in depth: when a Space is resolved, gate on it explicitly.
        // The PRIMARY guarantee is the $userId anchor inside searchFieldContexts
        // (see field-context.service.ts) — it scopes the name-only path too, so
        // an undefined resolvedSpaceId can no longer leak cross-tenant contexts.
        if (resolvedSpaceId) {
          const check = await assertCanViewSpace(ctx, resolvedSpaceId)
          if (check !== true) return check
        }
        try {
          const graph = await initGraph()
          return await searchFieldContexts(graph, {
            query,
            userId: ctx.currentUserId,
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
                const spaceName = row?.spaceName ?? ctx.spaceName ?? null
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
        'Delete a field context. Only the space owner or an admin may delete one. The context and ALL of its pulses are deleted together — if it has pulses, confirm with the user first and set deletePulses=true to proceed. This write is gated by user approval (HITL).',
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
        'Search OR list pulses across every field the member can access (any Space they own or belong to). Two modes. (1) KEYWORD SEARCH — pass a `query` to match pulse title/content. (2) ENUMERATE / LIST — leave `query` blank to list ALL pulses in a scope; use this for "all value pulses in my Me Space", "every goal here", "what pulses are in the Care field". When listing you MUST narrow with at least one of: `pulseType`, `spaceId`/`spaceName`, or `contextId`/`contextTitle` (a blank query with no scope is refused). To answer "all <type> pulses in <a Space the user named>", pass that pulseType PLUS the Space (spaceName, or spaceId from get_my_spaces) and leave query blank — this walks every field in that Space for you, so the member never has to name a field. By DEFAULT (general "what is X?" search) omit contextId/spaceId so it fans out across ALL accessible fields; add a context or space scope ONLY when the user restricts to one ("this field", "in my Me Space"). Also handles "pulses related to <a person>": when no pulse text matches but the query names a person in the graph (e.g. someone identified from an uploaded document), results include pulses connected to that person and each carries relatedVia ("authored" | "sharedDocument" | "sharedField") plus relatedPersonName. Use relatedPersonName as the person\'s name, and translate relatedVia into plain English (never print the literal token): relay the relationship honestly — a "sharedField" pulse is only a fieldmate of the person, NOT their own contribution.',
      inputSchema: z.object({
        query: z
          .string()
          .optional()
          .describe(
            'Pulse title or content keyword for a KEYWORD search. OMIT / leave blank to LIST every pulse in the given scope (you must then pass pulseType, a space, or a context).'
          ),
        contextId: z
          .string()
          .optional()
          .describe(
            "Optional field context ID filter. OMIT for a general search (fans out across ALL the member's accessible fields). To restrict to the field the user is currently viewing (\"this field\", \"here\"), pass the activeFieldContextId from SESSION CONTEXT."
          ),
        contextTitle: z
          .string()
          .optional()
          .describe('Optional field context title filter.'),
        spaceId: z
          .string()
          .optional()
          .describe(
            'Optional Space ID scope (e.g. an id from get_my_spaces). Restrict the search/list to one Space, walking all of its fields. Use when the user names a Space ("in my Me Space").'
          ),
        spaceName: z
          .string()
          .optional()
          .describe(
            'Optional Space name scope (fuzzy match). Alternative to spaceId when only the Space name is known.'
          ),
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
          .describe(
            'Optional pulse type filter. For "value" / "value-like" pulses use CoreValuePulse.'
          ),
        limit: z
          .number()
          .int()
          .positive()
          .max(25)
          .optional()
          .describe('Optional max result count.'),
      }),
      execute: async (input: {
        query?: string
        contextId?: string
        contextTitle?: string
        spaceId?: string
        spaceName?: string
        pulseType?:
          | 'GoalPulse'
          | 'ResourcePulse'
          | 'StoryPulse'
          | 'CarePulse'
          | 'CoreValuePulse'
          | 'FieldPulse'
        limit?: number
      }) => {
        // GOAL-300: default to an ALL-accessible-fields search. Only scope to a
        // field the model explicitly named — never silently inject the active
        // field (ctx.fieldContextId), which confined a dashboard/in-field
        // general query ("What is the Artisans Cooperative?") to one field and
        // missed matches living in the member's other accessible fields.
        // searchPulses gates every result on viewablePulsePredicate($userId),
        // so the broad path stays Space-authorized.
        const resolvedContextId = input.contextId?.trim() || undefined
        const resolvedSpaceId = input.spaceId?.trim() || undefined
        logToolDispatch('search_pulse', ctx, {
          ...input,
          resolvedContextId,
          resolvedSpaceId,
        })
        // Defense in depth: when the user restricts to a specific Space BY ID,
        // gate on it explicitly so a "no access" is a clear message rather than
        // a silent empty list. The PRIMARY guarantee is still
        // viewablePulsePredicate($userId) inside searchPulses — it gates every
        // returned pulse, so a spaceName scope (or an unauthorized spaceId)
        // never leaks pulses the caller can't already see (fail closed).
        if (resolvedSpaceId) {
          const check = await assertCanViewSpace(ctx, resolvedSpaceId)
          if (check !== true) return check
        }
        try {
          const graph = await initGraph()
          return await searchPulses(graph, {
            ...input,
            contextId: resolvedContextId,
            spaceId: resolvedSpaceId,
            // Scope results to Spaces this caller can view (raw Cypher bypasses
            // the GraphQL @authorization filter). Fails closed when absent.
            userId: ctx.currentUserId,
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
        'Pull specific graph entities (spaces, field contexts, pulses, people, resonances) into the Bloom canvas so the user can SEE them. Use whenever the user wants to visualize, show, bring up, pull up, or see something in the graph — especially when the conversation has drifted to an entity that is not currently on the canvas. Provide a precise natural-language intent that names entity types and any names, titles, or keywords from the conversation. The tool generates safe read-only Cypher under the hood, runs it scoped to the current user, and returns NVL-shaped nodes and relationships. When this returns found=true the canvas renders the graph AUTOMATICALLY from the tool result — do NOT copy the nodes/relationships into your reply or emit any JSON/marker; just narrate in plain English what was pulled up, by name. Never paste the Cypher. Never mention raw ids.',
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
            userName: ctx.currentUserName ?? null,
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
                // Authorize the read BEFORE fetching — raw Cypher bypasses the
                // GraphQL @authorization filter. Pulses/contexts/spaces are
                // Space-scoped; person profiles are readable by any authed user
                // (kb/02). Unauthorized + not-found return the same generic
                // message so we don't leak which entities exist (and no raw id,
                // per Rule 1).
                const notFound = {
                  status: 'error' as const,
                  message: `Could not find ${focal.label ?? 'that entity'}.`,
                }
                if (focal.type === 'MeSpace' || focal.type === 'WeSpace') {
                  const check = await assertCanViewSpace(ctx, focal.id)
                  if (check !== true) return notFound
                } else if (focal.type === 'FieldContext') {
                  const ok = await canViewContext(
                    graph,
                    ctx.currentUserId,
                    focal.id
                  )
                  if (!ok) return notFound
                } else if (
                  focal.type === 'GoalPulse' ||
                  focal.type === 'ResourcePulse' ||
                  focal.type === 'StoryPulse' ||
                  focal.type === 'CarePulse' ||
                  focal.type === 'CoreValuePulse'
                ) {
                  const ok = await canViewPulse(
                    graph,
                    ctx.currentUserId,
                    focal.id
                  )
                  if (!ok) return notFound
                }
                // User / PersonPulse: profiles are open to any authenticated
                // user, so no Space gate.
                const record = await getFocalRecord(graph, focal)
                if (!record) {
                  return notFound
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
                    relationshipWhy: z
                      .string()
                      .optional()
                      .describe(
                        "Person only — the current user's relationship to this person in their own words (\"a mentor and close friend\", \"my neighbour who runs the food bank\"), inferred from the conversation. Pre-fills the relationship field on the card; the user can edit or clear it before adding. ALWAYS provide this for a person when the dialogue reveals how the user relates to them."
                      ),
                    description: z
                      .string()
                      .optional()
                      .describe(
                        'Person only — a short note describing WHO this person is (role, what they do, what they care about), in the third person ("an elder in the housing-justice circle who mentors new organizers"). Distinct from relationshipWhy, which is how the USER relates to them. Pre-fills the description field on the card; the user can edit it before adding.'
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
                .describe(
                  'Up to 6 candidate pulses surfaced from the dialogue.'
                ),
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
                relationshipWhy?: string
                description?: string
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
                  const canView = await assertCanViewSpace(
                    ctx,
                    effectiveSpaceId
                  )
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
                    const relationshipWhy = (
                      candidate.relationshipWhy || ''
                    ).trim()
                    const personDescription = (
                      candidate.description || ''
                    ).trim()
                    createArgs = {
                      firstName,
                      ...(lastName ? { lastName } : {}),
                      contextId: ctx.fieldContextId,
                      ...(ctx.fieldContextTitle
                        ? { contextTitle: ctx.fieldContextTitle }
                        : {}),
                      // A short note about who this person is → PersonPulse
                      // description on accept. Surfaced as an editable field.
                      ...(personDescription ? { description: personDescription } : {}),
                      // The user's relationship to this person → CONNECTED_TO.why
                      // on accept. The card surfaces this as an editable field so
                      // the user can confirm, edit, or clear it (always-ask).
                      ...(relationshipWhy ? { relationshipWhy } : {}),
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
                          suggestions.length === 1
                            ? 'suggestion'
                            : 'suggestions'
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

    // suggest_resonances surfaces meaningful connections (resonances) BETWEEN
    // two pulses that already live in the active field context. Like
    // suggest_pulses / suggest_connections it is READ-ONLY: it resolves the
    // model's named pairs to ids, dedups against resonances that already exist,
    // and returns cards. The card's accept dispatches create_resonance through
    // the same HITL path. Field-gated (Rule 4): resonances are discovered within
    // a context, so without one there is nothing to relate.
    ...(ctx.fieldContextId
      ? {
          suggest_resonances: tool({
            description:
              "Surface RESONANCES — meaningful thematic connections between two pulses that ALREADY exist in the user's active field context (e.g. a goal that echoes a value, two stories that share a thread of belonging). Call this PROACTIVELY when the conversation reveals that two existing pulses speak to each other, OR when the user asks what connects or resonates here. For each pair give the two pulse names exactly as they exist in this field, a short theme (`label`), a one-line `why` in plain words, and a qualitative `strength`. READ-ONLY: it never writes — the user approves each card, which records the resonance through the same approval path as everything else. Do NOT suggest a pulse resonating with itself, pairs that are already connected, or vague/forced links just to be chatty. Both pulses must already exist here — to add a NEW pulse use suggest_pulses first. After calling, keep your reply brief (e.g. 'I noticed a couple of resonances worth recording — connect them if you'd like.').",
            inputSchema: z.object({
              candidates: z
                .array(
                  z.object({
                    sourcePulseName: z
                      .string()
                      .min(1)
                      .describe(
                        'Name/title of the first pulse, exactly as it exists in this field context.'
                      ),
                    targetPulseName: z
                      .string()
                      .min(1)
                      .describe(
                        'Name/title of the second pulse, exactly as it exists in this field context.'
                      ),
                    label: z
                      .string()
                      .optional()
                      .describe(
                        'Short theme of the resonance ("a shared sense of belonging", "both build momentum").'
                      ),
                    why: z
                      .string()
                      .optional()
                      .describe(
                        'One-line description of why these two resonate, in plain words inferred from the dialogue.'
                      ),
                    strength: z
                      .enum(['loose', 'moderate', 'strong'])
                      .describe(
                        'Qualitative strength of the resonance. Never a numeric score.'
                      ),
                    sourceSnippet: z
                      .string()
                      .optional()
                      .describe(
                        'Short verbatim quote from the conversation that surfaced this resonance (~140 chars).'
                      ),
                  })
                )
                .min(1)
                .max(6)
                .describe(
                  'Up to 6 candidate resonances surfaced from the dialogue.'
                ),
            }),
            execute: async ({
              candidates,
            }: {
              candidates: Array<{
                sourcePulseName: string
                targetPulseName: string
                label?: string
                why?: string
                strength: 'loose' | 'moderate' | 'strong'
                sourceSnippet?: string
              }>
            }) => {
              logToolDispatch('suggest_resonances', ctx, {
                count: candidates?.length ?? 0,
              })
              if (!ctx.currentUserId) {
                return {
                  status: 'error' as const,
                  message:
                    'You need to be signed in before I can surface resonances.',
                }
              }
              if (!ctx.fieldContextId) {
                // Defensive — the tool is only registered with an active Field.
                return {
                  status: 'error' as const,
                  message:
                    'Open a field context first and I can surface resonances within it.',
                }
              }
              try {
                const graph = await initGraph()
                // Fail CLOSED: if the owning Space can't be resolved we cannot
                // authorize the read, so deny rather than expose pulse titles.
                const effectiveSpaceId =
                  ctx.spaceId ||
                  (await resolveSpaceIdForContext(graph, ctx.fieldContextId))
                if (!effectiveSpaceId) {
                  return {
                    status: 'error' as const,
                    message:
                      "I couldn't resolve which space this field belongs to, so I can't surface resonances here.",
                  }
                }
                const canView = await assertCanViewSpace(ctx, effectiveSpaceId)
                if (canView !== true) return canView

                const { pulses, existingPairs } =
                  await fetchContextResonanceState(graph, ctx.fieldContextId)

                // Build a canonical-name → pulse lookup. When two pulses share a
                // canonicalized title the name is ambiguous, so drop it from the
                // resolver rather than guess (the model can disambiguate).
                const byName = new Map<string, { id: string; name: string }>()
                const ambiguous = new Set<string>()
                for (const p of pulses) {
                  const key = canonicalizeName(p.name)
                  if (!key) continue
                  if (byName.has(key)) ambiguous.add(key)
                  else byName.set(key, p)
                }
                for (const key of ambiguous) byName.delete(key)

                const seen = new Set<string>()
                const suggestions: ResonanceSuggestion[] = []
                let suppressedDuplicates = 0
                let unresolved = 0

                for (const candidate of candidates) {
                  const sourceKey = canonicalizeName(
                    candidate.sourcePulseName || ''
                  )
                  const targetKey = canonicalizeName(
                    candidate.targetPulseName || ''
                  )
                  const source = sourceKey ? byName.get(sourceKey) : undefined
                  const target = targetKey ? byName.get(targetKey) : undefined
                  // Both endpoints must resolve to a real pulse in this field —
                  // a resonance cannot be recorded against something that does
                  // not exist yet.
                  if (!source || !target) {
                    unresolved++
                    continue
                  }
                  if (source.id === target.id) continue

                  const pairKey = resonancePairKey(source.id, target.id)
                  if (existingPairs.has(pairKey) || seen.has(pairKey)) {
                    suppressedDuplicates++
                    continue
                  }
                  seen.add(pairKey)

                  const label = (candidate.label || '').trim() || null
                  const why = (candidate.why || '').trim() || null
                  const sourceSnippet =
                    (candidate.sourceSnippet || '').trim().slice(0, 200) || null

                  suggestions.push({
                    sourceName: source.name,
                    targetName: target.name,
                    label,
                    why,
                    strength: candidate.strength,
                    sourceSnippet,
                    writeTool: 'create_resonance',
                    createArgs: {
                      sourcePulseId: source.id,
                      targetPulseId: target.id,
                      // The active context anchors HAS_RESONANCE on accept so
                      // the link is visible through Space-scoped reads.
                      contextId: ctx.fieldContextId,
                      ...(label ? { label } : {}),
                      ...(why ? { why } : {}),
                      // Display-only names so the approval card copy is
                      // human-readable (Rule 1); the write re-reads titles.
                      sourceName: source.name,
                      targetName: target.name,
                    },
                  })
                }

                return {
                  status: 'ok' as const,
                  suggestions,
                  suppressedDuplicates,
                  unresolved,
                  fieldContextTitle: ctx.fieldContextTitle ?? null,
                  message:
                    suggestions.length > 0
                      ? `Surfacing ${suggestions.length} ${
                          suggestions.length === 1
                            ? 'resonance'
                            : 'resonances'
                        } you might want to record.`
                      : 'No new resonances to surface right now.',
                }
              } catch (error) {
                return toErrorResult(
                  'Failed to prepare resonance suggestions',
                  error
                )
              }
            },
          }),
        }
      : {}),

    // suggest_resonant_pulses is the conversation↔pulse path: when something the
    // user SAYS resonates with an existing pulse but isn't a pulse yet, this
    // surfaces a "capture and connect" card — create the new pulse AND link it
    // as a resonance to the existing one. READ-ONLY; accept dispatches the
    // compound create_resonant_pulse write. Field-gated (Rule 4).
    ...(ctx.fieldContextId
      ? {
          suggest_resonant_pulses: tool({
            description:
              "Surface a CAPTURE-AND-RESONATE card when something the user SAYS in the conversation clearly resonates with a pulse that ALREADY exists in their active field, but the thing they said is not yet a pulse. Each candidate proposes creating a NEW pulse from the dialogue (its type + a concise title + optional one-line content) AND connecting it as a resonance to the named existing pulse. Call this PROACTIVELY when the dialogue surfaces a fresh value/goal/story/care/resource that echoes an existing pulse. READ-ONLY: the user approves each card, which creates the pulse and records the resonance through the same approval path. Use suggest_resonances instead when BOTH pulses already exist; use suggest_pulses when there is nothing existing to resonate with. Do NOT force a connection or duplicate an existing pulse. After calling, keep your reply brief.",
            inputSchema: z.object({
              candidates: z
                .array(
                  z.object({
                    newPulseName: z
                      .string()
                      .min(1)
                      .describe(
                        'A concise title for the NEW pulse to capture from the dialogue ("A need for belonging").'
                      ),
                    newPulseType: z
                      .enum(['goal', 'resource', 'story', 'care', 'value'])
                      .describe(
                        'Living-system type of the new pulse that best fits the active field.'
                      ),
                    newPulseContent: z
                      .string()
                      .optional()
                      .describe('Optional one-line body for the new pulse.'),
                    existingPulseName: z
                      .string()
                      .min(1)
                      .describe(
                        'Name/title of the EXISTING pulse it resonates with, exactly as it exists in this field context.'
                      ),
                    label: z
                      .string()
                      .optional()
                      .describe('Short theme of the resonance.'),
                    why: z
                      .string()
                      .optional()
                      .describe(
                        'One-line description of why they resonate, in plain words.'
                      ),
                    strength: z
                      .enum(['loose', 'moderate', 'strong'])
                      .describe(
                        'Qualitative strength of the resonance. Never a numeric score.'
                      ),
                    sourceSnippet: z
                      .string()
                      .optional()
                      .describe(
                        'Short verbatim quote from the conversation that surfaced this (~140 chars).'
                      ),
                  })
                )
                .min(1)
                .max(6)
                .describe(
                  'Up to 6 capture-and-resonate candidates surfaced from the dialogue.'
                ),
            }),
            execute: async ({
              candidates,
            }: {
              candidates: Array<{
                newPulseName: string
                newPulseType: 'goal' | 'resource' | 'story' | 'care' | 'value'
                newPulseContent?: string
                existingPulseName: string
                label?: string
                why?: string
                strength: 'loose' | 'moderate' | 'strong'
                sourceSnippet?: string
              }>
            }) => {
              logToolDispatch('suggest_resonant_pulses', ctx, {
                count: candidates?.length ?? 0,
              })
              if (!ctx.currentUserId) {
                return {
                  status: 'error' as const,
                  message:
                    'You need to be signed in before I can surface resonances.',
                }
              }
              if (!ctx.fieldContextId) {
                return {
                  status: 'error' as const,
                  message:
                    'Open a field context first and I can surface resonances within it.',
                }
              }
              try {
                const graph = await initGraph()
                // Fail CLOSED: if the owning Space can't be resolved we cannot
                // authorize the read, so deny rather than expose pulse titles.
                const effectiveSpaceId =
                  ctx.spaceId ||
                  (await resolveSpaceIdForContext(graph, ctx.fieldContextId))
                if (!effectiveSpaceId) {
                  return {
                    status: 'error' as const,
                    message:
                      "I couldn't resolve which space this field belongs to, so I can't surface resonances here.",
                  }
                }
                const canView = await assertCanViewSpace(ctx, effectiveSpaceId)
                if (canView !== true) return canView

                const { pulses } = await fetchContextResonanceState(
                  graph,
                  ctx.fieldContextId
                )
                const byName = new Map<string, { id: string; name: string }>()
                const ambiguous = new Set<string>()
                for (const p of pulses) {
                  const key = canonicalizeName(p.name)
                  if (!key) continue
                  if (byName.has(key)) ambiguous.add(key)
                  else byName.set(key, p)
                }
                for (const key of ambiguous) byName.delete(key)

                const suggestions: ResonantPulseSuggestion[] = []
                let unresolved = 0

                for (const candidate of candidates) {
                  const typeConfig = SUGGESTION_TYPES[candidate.newPulseType]
                  if (!typeConfig || !typeConfig.pulseType) continue
                  const newName = (candidate.newPulseName || '').trim()
                  if (!newName) continue

                  const existing = byName.get(
                    canonicalizeName(candidate.existingPulseName || '')
                  )
                  // The existing side must resolve to a real pulse in this field.
                  if (!existing) {
                    unresolved++
                    continue
                  }

                  const label = (candidate.label || '').trim() || null
                  const why = (candidate.why || '').trim() || null
                  const content = (candidate.newPulseContent || '').trim()
                  const sourceSnippet =
                    (candidate.sourceSnippet || '').trim().slice(0, 200) || null

                  suggestions.push({
                    newPulseName: newName,
                    newPulseType: candidate.newPulseType,
                    newPulseTypeLabel: typeConfig.label,
                    existingPulseName: existing.name,
                    label,
                    why,
                    strength: candidate.strength,
                    sourceSnippet,
                    writeTool: 'create_resonant_pulse',
                    createArgs: {
                      pulseType: typeConfig.pulseType,
                      title: newName,
                      ...(content ? { content } : {}),
                      contextId: ctx.fieldContextId,
                      ...(ctx.fieldContextTitle
                        ? { contextTitle: ctx.fieldContextTitle }
                        : {}),
                      ...(ctx.spaceName ? { spaceName: ctx.spaceName } : {}),
                      resonateWithPulseId: existing.id,
                      // Display-only names so the card copy is human-readable
                      // (Rule 1); the write re-reads titles from the graph.
                      resonateWithName: existing.name,
                      newPulseName: newName,
                      ...(label ? { label } : {}),
                      ...(why ? { why } : {}),
                    },
                  })
                }

                return {
                  status: 'ok' as const,
                  suggestions,
                  unresolved,
                  fieldContextTitle: ctx.fieldContextTitle ?? null,
                  message:
                    suggestions.length > 0
                      ? `Surfacing ${suggestions.length} ${
                          suggestions.length === 1 ? 'resonance' : 'resonances'
                        } worth capturing.`
                      : 'No new resonances to capture right now.',
                }
              } catch (error) {
                return toErrorResult(
                  'Failed to prepare resonance suggestions',
                  error
                )
              }
            },
          }),
        }
      : {}),

    // create_connection links/updates relationships between people that ALREADY
    // exist (resolved across the user's spaces, fully auth-scoped), so it does
    // NOT need an active FieldContext — registered on every authenticated
    // surface so a relationship can be recorded or updated from anywhere.
    ...(ctx.currentUserId
      ? {
          create_connection: tool({
            description:
              'Create OR UPDATE a direct relationship — a connection — between the current user and another person, or between two people the user knows, carrying a short "why" describing the relationship in plain words. Call this whenever the user asks to connect, relate, OR change/add to/update the relationship between people ("connect me with Ashong", "update my relationship with Ashong to …", "add this to the relationship: …", "link Ada and Ben as co-organisers"). Passing a `why` overwrites the stored relationship note, so it doubles as the update path. This write is HUMAN-IN-THE-LOOP: ACTUALLY CALLING this tool is what renders the inline approval card — never tell the user to "approve the card" or that you have "drafted/submitted" the change unless you have called this tool in the same turn. Do NOT ask them to confirm in text first (Rule 9). Both people must already exist in the user\'s world; to add a NEW person use the person-suggestion flow, which captures the relationship automatically.',
            inputSchema: z.object({
              toPersonName: z
                .string()
                .min(1)
                .describe(
                  'The person to connect to. Pass the name exactly as the user wrote it.'
                ),
              fromPersonName: z
                .string()
                .optional()
                .describe(
                  'Who the connection is FROM. Defaults to the current user ("you"). Only set this to connect two OTHER people the user knows.'
                ),
              why: z
                .string()
                .optional()
                .describe(
                  'The relationship in the user\'s own words ("a mentor and close friend"). Strongly encouraged — infer it from the conversation.'
                ),
              interests: z
                .string()
                .optional()
                .describe('Optional shared interests or themes.'),
            }),
            execute: async (args: {
              toPersonName: string
              fromPersonName?: string
              why?: string
              interests?: string
            }) => {
              // The relationship `why`/`interests` are sensitive relational
              // free-text — log only their presence, not their content.
              logToolDispatch('create_connection', ctx, {
                toPersonName: args.toPersonName,
                fromPersonName: args.fromPersonName,
                hasWhy: Boolean(args.why),
                hasInterests: Boolean(args.interests),
              })
              return runWriteTool('create_connection', { ...args }, ctx)
            },
          }),
        }
      : {}),

    // suggest_connections is proactive and benefits from an active FieldContext
    // for relevance + dedup, so it stays Field-gated (Rule 4, kb/07).
    ...(ctx.fieldContextId
      ? {
          suggest_connections: tool({
            description:
              "Surface relationships worth recording as one-tap suggestions. Call this PROACTIVELY when the conversation reveals how the user relates to a person already in their world (\"Ashong is a wise friend who mirrors me\"), or how two people they know relate to each other. Each candidate proposes a connection (a CONNECTED_TO link) with an inferred 'why'. READ-ONLY: it never writes — the user approves each card, which creates the connection through the same approval path as everything else. Do NOT suggest connections that already exist, connections of a person to themselves, the current user to themselves, or vague references. For a person who does NOT yet exist, use suggest_pulses instead (creating a person already captures the relationship). After calling, keep your reply brief (e.g. 'I noticed a relationship worth recording — add it if you'd like.').",
            inputSchema: z.object({
              candidates: z
                .array(
                  z.object({
                    toPersonName: z
                      .string()
                      .min(1)
                      .describe(
                        "The person to connect — must ALREADY exist in the user's world. Pass the name exactly as known."
                      ),
                    fromPersonName: z
                      .string()
                      .optional()
                      .describe(
                        'Who the connection is FROM. Defaults to the current user ("you"). Only set to connect two OTHER people the user knows.'
                      ),
                    why: z
                      .string()
                      .optional()
                      .describe(
                        'The relationship in the user\'s words ("a wise friend and mirror"), inferred from the conversation.'
                      ),
                    interests: z
                      .string()
                      .optional()
                      .describe('Optional shared interests or themes.'),
                    sourceSnippet: z
                      .string()
                      .optional()
                      .describe(
                        'Short verbatim quote from the conversation that surfaced this connection (~140 chars).'
                      ),
                  })
                )
                .min(1)
                .max(6)
                .describe(
                  "Up to 6 candidate connections surfaced from the dialogue. Only people who ALREADY exist in the user's world."
                ),
            }),
            execute: async ({
              candidates,
            }: {
              candidates: Array<{
                toPersonName: string
                fromPersonName?: string
                why?: string
                interests?: string
                sourceSnippet?: string
              }>
            }) => {
              logToolDispatch('suggest_connections', ctx, {
                count: candidates?.length ?? 0,
              })
              if (!ctx.currentUserId) {
                return {
                  status: 'error' as const,
                  message:
                    'You need to be signed in before I can suggest connections.',
                }
              }
              try {
                const graph = await initGraph()
                const userId = ctx.currentUserId
                const SELF_TOKENS = new Set([
                  'you',
                  'me',
                  'myself',
                  'i',
                  'self',
                ])

                // Resolve every candidate's endpoints (+ existing-edge check) in
                // PARALLEL — each is independent. Dedup is then applied in a
                // sequential pass so batch ordering stays deterministic.
                const resolved = await Promise.all(
                  candidates.map(async (candidate) => {
                    const toName = (candidate.toPersonName || '').trim()
                    if (!toName) return null
                    const fromNameRaw = (candidate.fromPersonName || '').trim()
                    const fromIsUser =
                      !fromNameRaw || SELF_TOKENS.has(fromNameRaw.toLowerCase())

                    // Resolve the "from" endpoint (defaults to the current user).
                    let fromId = userId
                    let fromDisplay = 'you'
                    if (!fromIsUser) {
                      const from = await resolvePersonInUserScope(
                        graph,
                        userId,
                        fromNameRaw
                      )
                      if (from.status !== 'ok') return null
                      fromId = from.id
                      fromDisplay = from.name
                    }

                    const to = await resolvePersonInUserScope(graph, userId, toName)
                    if (to.status !== 'ok') return null
                    if (to.id === fromId) return null

                    const exists = await connectionExists(graph, fromId, to.id)
                    return {
                      candidate,
                      fromIsUser,
                      fromId,
                      fromDisplay,
                      toId: to.id,
                      toName: to.name,
                      exists,
                    }
                  })
                )

                const suggestions: ConnectionSuggestion[] = []
                const seen = new Set<string>()
                let skipped = 0
                for (const r of resolved) {
                  // Skip unresolved/ambiguous/self candidates, dedup within the
                  // batch (order-independent), and skip already-connected pairs.
                  if (!r) {
                    skipped++
                    continue
                  }
                  const pairKey = [r.fromId, r.toId].sort().join('::')
                  if (seen.has(pairKey) || r.exists) {
                    skipped++
                    continue
                  }
                  seen.add(pairKey)

                  const why = (r.candidate.why || '').trim() || null
                  const interests = (r.candidate.interests || '').trim() || null
                  const sourceSnippet =
                    (r.candidate.sourceSnippet || '').trim().slice(0, 200) ||
                    null
                  const display = r.fromIsUser
                    ? r.toName
                    : `${r.fromDisplay} ↔ ${r.toName}`

                  suggestions.push({
                    name: display,
                    why,
                    sourceSnippet,
                    writeTool: 'create_connection',
                    createArgs: {
                      toPersonId: r.toId,
                      ...(r.fromIsUser ? {} : { fromPersonId: r.fromId }),
                      ...(why ? { why } : {}),
                      ...(interests ? { interests } : {}),
                    },
                  })
                }

                return {
                  status: 'ok' as const,
                  suggestions,
                  skipped,
                  message:
                    suggestions.length > 0
                      ? `Surfacing ${suggestions.length} connection${
                          suggestions.length === 1 ? '' : 's'
                        } you might want to make.`
                      : 'No new connections to suggest right now.',
                }
              } catch (error) {
                return toErrorResult(
                  'Failed to prepare connection suggestions',
                  error
                )
              }
            },
          }),
        }
      : {}),

    graph_rag_search: tool({
      description:
        "Semantic Graph RAG retrieval across people, pulses, and conversation chunks. People and pulses are searched across every field the member can access. Conversation chunks (sentence-level segments of the back-and-forth that produced a pulse) are PRIVATE to the user who created the parent pulse — the `chunks` and `all` scopes will only ever return the current user's own chunks. Never offer to search another person's conversation chunks. By DEFAULT omit contextId so retrieval fans out across ALL the member's accessible fields; pass contextId ONLY when the user explicitly restricts to one field.",
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
            "Optional field context ID for pulse-scoped retrieval. OMIT for a general search (fans out across ALL the member's accessible fields). To restrict to the field the user is currently viewing (\"this field\", \"here\"), pass the activeFieldContextId from SESSION CONTEXT."
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
        // GOAL-300: default to an all-accessible-fields search; only scope when
        // the model explicitly passes contextId (user named a field). The
        // active field is no longer silently injected. graphRagSearch is
        // $userId-gated, so the broad path stays Space-authorized.
        const resolvedContextId = contextId?.trim() || undefined
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
  })
}
