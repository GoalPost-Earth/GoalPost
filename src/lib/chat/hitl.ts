import { Neo4jGraph } from '@langchain/community/graphs/neo4j_graph'
import {
  updateFieldContext,
  type UpdateFieldContextInput,
} from '@/modules/agent/tools/field-context/field-context.service'
import {
  updatePulse,
  linkPulseToContext,
  unlinkPulseFromContext,
  type UpdatePulseInput,
  type PulseContextLinkInput,
} from '@/modules/agent/tools/pulse/pulse.service'
import { createHash, randomUUID } from 'crypto'

export type WriteToolName =
  | 'rename_space'
  | 'create_field_context'
  | 'delete_field_context'
  | 'update_field_context'
  | 'create_pulse'
  | 'delete_pulse'
  | 'update_pulse'
  | 'edit_pulse_context_link'
  | 'update_my_profile'
  | 'delete_my_profile'
  | 'create_person'
  | 'update_person'
  | 'create_connection'

export interface ApprovedAction {
  tool: WriteToolName
  args: Record<string, unknown>
}

interface ToolExecutionResult {
  success?: boolean
  message?: string
  [key: string]: unknown
}

const WRITE_TOOL_NAMES = new Set<WriteToolName>([
  'rename_space',
  'create_field_context',
  'delete_field_context',
  'update_field_context',
  'create_pulse',
  'delete_pulse',
  'update_pulse',
  'edit_pulse_context_link',
  'update_my_profile',
  'delete_my_profile',
  'create_person',
  'update_person',
  'create_connection',
])

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value)
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`
  }

  const entries = Object.entries(value as Record<string, unknown>).sort(
    ([a], [b]) => a.localeCompare(b)
  )

  return `{${entries
    .map(([key, val]) => `${JSON.stringify(key)}:${stableStringify(val)}`)
    .join(',')}}`
}

export function isWriteToolName(name: string): name is WriteToolName {
  return WRITE_TOOL_NAMES.has(name as WriteToolName)
}

export function createApprovalHash(
  tool: WriteToolName,
  args: Record<string, unknown>
): string {
  const payload = `${tool}:${stableStringify(args)}`
  return createHash('sha256').update(payload).digest('hex')
}

function pulseTypeLabel(rawType: unknown): string {
  const type = typeof rawType === 'string' ? rawType.trim() : ''
  switch (type) {
    case 'GoalPulse':
      return 'goal'
    case 'ResourcePulse':
      return 'resource'
    case 'StoryPulse':
      return 'story'
    case 'CarePulse':
      return 'care note'
    case 'CoreValuePulse':
      return 'core value'
    default:
      return 'pulse'
  }
}

export function describeWriteAction(
  tool: WriteToolName,
  args: Record<string, unknown>
): string {
  switch (tool) {
    case 'rename_space':
      return `Rename space \"${String(args.currentName || '')}\" to \"${String(args.newName || '')}\"`
    case 'update_field_context':
      return `Update field context ${String(args.contextId || args.currentTitle || 'target')}`
    case 'create_field_context':
      // Rule 1: never surface the raw spaceId — prefer the resolved name, fall
      // back to a generic phrase rather than an id.
      return `Create field context "${String(args.title || '')}" in ${String(args.spaceName || 'the selected space')}`
    case 'delete_field_context':
      return `Delete field context ${String(args.contextId || args.currentTitle || 'target context')}`
    case 'update_pulse': {
      const title = String(args.currentTitle || args.newTitle || '').trim()
      const where = String(args.contextTitle || args.contextName || '').trim()
      const label = pulseTypeLabel(args.pulseType)
      const titleClause = title ? ` "${title}"` : ''
      const whereClause = where ? ` in ${where}` : ''
      if (title || where || args.pulseType) {
        return `Update ${label}${titleClause}${whereClause}`
      }
      // Fallback for callers that don't carry the doc-ingest enrichment.
      return `Update pulse ${String(args.pulseId || 'target')}`
    }
    case 'create_pulse': {
      const title = String(args.title || '').trim()
      const where =
        String(args.contextTitle || args.contextName || '').trim()
      const label = pulseTypeLabel(args.pulseType)
      const titleClause = title ? ` "${title}"` : ''
      const whereClause = where ? ` in ${where}` : ''
      return `Add ${label}${titleClause}${whereClause}`
    }
    case 'delete_pulse':
      return `Delete pulse ${String(args.pulseId || args.currentTitle || 'target pulse')}`
    case 'edit_pulse_context_link':
      return `${String(args.action || 'Edit')} pulse/context link for pulse ${String(args.pulseId || 'unknown')}`
    case 'update_my_profile':
      return `Update your profile name to \"${String(args.newName || '')}\"`
    case 'delete_my_profile':
      return 'Deactivate your own user profile'
    case 'create_person': {
      const first = String(args.firstName || '').trim()
      const last = String(args.lastName || '').trim()
      const full = [first, last].filter(Boolean).join(' ') || 'person'
      const where =
        String(args.contextTitle || args.contextName || '').trim() ||
        'this field context'
      // Rule 1: surface the relationship in plain words, never an id.
      const why = String(args.relationshipWhy || '').trim()
      const whyClause = why ? ` — connected to you as "${why}"` : ''
      return `Add ${full} to ${where}${whyClause}`
    }
    case 'create_connection': {
      // Names only (Rule 1). The model passes person NAMES; never echo an id.
      const to =
        String(args.toPersonName || args.toName || '').trim() || 'someone'
      const fromRaw = String(args.fromPersonName || '').trim()
      const fromClause =
        fromRaw && fromRaw.toLowerCase() !== 'you' && fromRaw.toLowerCase() !== 'me'
          ? `${fromRaw} with `
          : 'you with '
      const why = String(args.why || '').trim()
      const whyClause = why ? ` — "${why}"` : ''
      return `Connect ${fromClause}${to}${whyClause}`
    }
    case 'update_person': {
      const first = String(args.firstName || '').trim()
      const last = String(args.lastName || '').trim()
      const full =
        [first, last].filter(Boolean).join(' ') ||
        String(args.currentName || '').trim() ||
        'person'
      const where =
        String(args.contextTitle || args.contextName || '').trim() ||
        'this field context'
      return `Update ${full} in ${where}`
    }
    default:
      return `Run ${tool}`
  }
}

type PulseCreationType =
  | 'GoalPulse'
  | 'ResourcePulse'
  | 'StoryPulse'
  | 'CarePulse'
  | 'CoreValuePulse'
  | 'FieldPulse'

interface SpaceLocatorInput {
  spaceId?: string
  spaceName?: string
}

interface ContextLocatorInput {
  contextId?: string
  contextTitle?: string
  spaceName?: string
}

interface CreateFieldContextInput extends SpaceLocatorInput {
  title?: string
  emergentName?: string
}

interface DeleteFieldContextInput extends ContextLocatorInput {
  currentTitle?: string
  deletePulses?: boolean
}

interface CreatePulseInput extends ContextLocatorInput {
  title?: string
  content?: string
  pulseType?: PulseCreationType
  status?: string
  intensity?: number
  horizon?: string
  resourceType?: string
  availability?: number
  why?: string
  location?: string
  time?: string
  /** Optional source Document — when present, EXTRACTED_FROM edge is created (ADR-0002). */
  documentId?: string
  /** Optional ingest thread — slice 7: stamps the Log.metadata audit trail. */
  conversationThreadId?: string
}

interface DeletePulseInput {
  pulseId?: string
  currentTitle?: string
  contextId?: string
}

const ALLOWED_PULSE_TYPES = new Set<PulseCreationType>([
  'GoalPulse',
  'ResourcePulse',
  'StoryPulse',
  'CarePulse',
  'CoreValuePulse',
  'FieldPulse',
])

/**
 * Slice 7 (GOAL-242) — look up a Document's filename so per-entity Log rows
 * can reference it in user-readable copy. Returns null when the document is
 * missing or the lookup fails (the description simply omits the suffix —
 * never blocks the write).
 */
async function lookupDocumentFilename(
  graph: Neo4jGraph,
  documentId: string
): Promise<string | null> {
  try {
    const rows = await graph.query<{ filename: string | null }>(
      `MATCH (d:Document {id: $documentId}) RETURN d.filename AS filename LIMIT 1`,
      { documentId }
    )
    const value = rows?.[0]?.filename
    return typeof value === 'string' && value.trim() ? value.trim() : null
  } catch {
    return null
  }
}

/**
 * Slice 7 (GOAL-242) — server-side audit trail JSON for ingest-path Log rows.
 * Returns null when no provenance applies, so the Cypher conditional SET stays
 * a no-op for manual creates/updates (existing behavior preserved).
 */
function buildIngestLogMetadata(
  documentId: string | null,
  conversationThreadId: string | null
): string | null {
  if (!documentId && !conversationThreadId) return null
  const payload: Record<string, string> = {}
  if (documentId) payload.documentId = documentId
  if (conversationThreadId) payload.conversationThreadId = conversationThreadId
  return JSON.stringify(payload)
}

/**
 * The single source of truth for the "pending HITL approval" tool-result
 * shape. Both the runtime gate (runWriteTool in chat-tools.ts) and the
 * doc-ingestion synthesized-turn appender must call this exact factory so
 * the HITL Dialog hydrates either path identically. Drift here silently
 * breaks approval — pinned by hitl.test.ts.
 */
export interface PendingApprovalResult {
  success: false
  approvalRequired: true
  approvalHash: string
  tool: WriteToolName
  args: Record<string, unknown>
  summary: string
  message: string
}

export function buildPendingApprovalResult(
  tool: WriteToolName,
  args: Record<string, unknown>
): PendingApprovalResult {
  return {
    success: false,
    approvalRequired: true,
    approvalHash: createApprovalHash(tool, args),
    tool,
    args,
    summary: describeWriteAction(tool, args),
    message: 'This action needs your approval before I can execute it.',
  }
}

export function buildApprovedActionHashSet(
  approvedActions: ApprovedAction[] | undefined
): Set<string> {
  if (!approvedActions || approvedActions.length === 0) {
    return new Set<string>()
  }

  const hashes = approvedActions
    .filter(
      (item): item is ApprovedAction =>
        Boolean(item?.tool) && isWriteToolName(item.tool)
    )
    .map((item) => createApprovalHash(item.tool, item.args || {}))

  return new Set(hashes)
}

async function getEditableSpaceMatchesByName(
  graph: Neo4jGraph,
  currentUserId: string,
  currentName: string
): Promise<Array<{ id: string; graphId: string; name: string }>> {
  const query = `
    MATCH (space:Space)
    WHERE toLower(trim(coalesce(space.name, ''))) = toLower(trim($currentName))
    WITH DISTINCT space
    OPTIONAL MATCH (owner:Person)-[:OWNS]->(space)
    OPTIONAL MATCH (space)-[:HAS_MEMBER]->(:SpaceMembership)-[:IS_MEMBER]->(member:Person)
    WITH space,
      [id IN collect(DISTINCT owner.id) WHERE id IS NOT NULL] AS ownerIds,
      [id IN collect(DISTINCT member.id) WHERE id IS NOT NULL] AS memberIds
    WHERE $currentUserId IN ownerIds OR $currentUserId IN memberIds
    RETURN
      coalesce(space.id, '') AS id,
      elementId(space) AS graphId,
      space.name AS name
    LIMIT 10
  `

  return await graph.query<{ id: string; graphId: string; name: string }>(
    query,
    {
      currentName,
      currentUserId,
    }
  )
}

async function resolveEditableSpace(
  graph: Neo4jGraph,
  currentUserId: string,
  input: SpaceLocatorInput
): Promise<
  | { ok: true; spaceId: string; spaceName: string }
  | { ok: false; result: ToolExecutionResult }
> {
  const spaceId = input.spaceId?.trim() || null
  const spaceName = input.spaceName?.trim() || null

  if (!spaceId && !spaceName) {
    return {
      ok: false,
      result: {
        success: false,
        message:
          'Please provide spaceId or spaceName to identify where to apply this change.',
      },
    }
  }

  if (spaceId) {
    const query = `
      MATCH (space:Space {id: $spaceId})
      OPTIONAL MATCH (owner:Person)-[:OWNS]->(space)
      OPTIONAL MATCH (space)-[:HAS_MEMBER]->(:SpaceMembership)-[:IS_MEMBER]->(member:Person)
      WITH space,
        [id IN collect(DISTINCT owner.id) WHERE id IS NOT NULL] AS ownerIds,
        [id IN collect(DISTINCT member.id) WHERE id IS NOT NULL] AS memberIds
      WHERE $currentUserId IN ownerIds OR $currentUserId IN memberIds
      RETURN space.id AS id, space.name AS name
      LIMIT 1
    `

    const rows = await graph.query<{ id: string; name: string }>(query, {
      spaceId,
      currentUserId,
    })

    if (!rows || rows.length === 0) {
      return {
        ok: false,
        result: {
          success: false,
          message: 'You can only modify spaces you own or are a member of.',
        },
      }
    }

    return { ok: true, spaceId: rows[0].id, spaceName: rows[0].name }
  }

  const matches = await getEditableSpaceMatchesByName(
    graph,
    currentUserId,
    spaceName as string
  )

  if (matches.length === 0) {
    return {
      ok: false,
      result: {
        success: false,
        message: `No editable space found for "${spaceName}".`,
      },
    }
  }

  if (matches.length > 1) {
    return {
      ok: false,
      result: {
        success: false,
        requiresDisambiguation: true,
        message:
          'Multiple editable spaces match that name. Please provide spaceId.',
        candidates: matches,
      },
    }
  }

  return {
    ok: true,
    spaceId: matches[0].id,
    spaceName: matches[0].name,
  }
}

async function canEditContext(
  graph: Neo4jGraph,
  currentUserId: string,
  contextId: string
): Promise<boolean> {
  const query = `
    MATCH (space:Space)-[:HAS_CONTEXT]->(context:FieldContext {id: $contextId})
    OPTIONAL MATCH (owner:Person)-[:OWNS]->(space)
    OPTIONAL MATCH (space)-[:HAS_MEMBER]->(:SpaceMembership)-[:IS_MEMBER]->(member:Person)
    WITH [id IN collect(DISTINCT owner.id) WHERE id IS NOT NULL] AS ownerIds,
         [id IN collect(DISTINCT member.id) WHERE id IS NOT NULL] AS memberIds
    RETURN ($currentUserId IN ownerIds OR $currentUserId IN memberIds) AS allowed
    LIMIT 1
  `

  const rows = await graph.query<{ allowed: boolean }>(query, {
    contextId,
    currentUserId,
  })

  return Boolean(rows?.[0]?.allowed)
}

async function canEditPulse(
  graph: Neo4jGraph,
  currentUserId: string,
  pulseId: string
): Promise<boolean> {
  const query = `
    MATCH (space:Space)-[:HAS_CONTEXT]->(:FieldContext)-[:HAS_PULSE]->(pulse:FieldPulse {id: $pulseId})
    OPTIONAL MATCH (owner:Person)-[:OWNS]->(space)
    OPTIONAL MATCH (space)-[:HAS_MEMBER]->(:SpaceMembership)-[:IS_MEMBER]->(member:Person)
    WITH [id IN collect(DISTINCT owner.id) WHERE id IS NOT NULL] AS ownerIds,
         [id IN collect(DISTINCT member.id) WHERE id IS NOT NULL] AS memberIds
    RETURN ($currentUserId IN ownerIds OR $currentUserId IN memberIds) AS allowed
    LIMIT 1
  `

  const rows = await graph.query<{ allowed: boolean }>(query, {
    pulseId,
    currentUserId,
  })

  return Boolean(rows?.[0]?.allowed)
}

async function resolveAuthorizedContextId(
  graph: Neo4jGraph,
  currentUserId: string,
  input: UpdateFieldContextInput
): Promise<
  { ok: true; contextId: string } | { ok: false; result: ToolExecutionResult }
> {
  if (input.contextId?.trim()) {
    const allowed = await canEditContext(graph, currentUserId, input.contextId)
    if (!allowed) {
      return {
        ok: false,
        result: {
          success: false,
          message: 'You can only edit field contexts in spaces you belong to.',
        },
      }
    }

    return { ok: true, contextId: input.contextId }
  }

  const title = input.currentTitle?.trim()
  if (!title) {
    return {
      ok: false,
      result: {
        success: false,
        message:
          'Please provide contextId or currentTitle so I can identify the field context.',
      },
    }
  }

  const query = `
    MATCH (space:Space)-[:HAS_CONTEXT]->(context:FieldContext)
    WHERE (
      toLower(trim(coalesce(context.title, ''))) = toLower(trim($title))
      OR toLower(trim(coalesce(context.emergentName, ''))) = toLower(trim($title))
    )
      AND (
        $spaceName IS NULL
        OR toLower(coalesce(space.name, '')) CONTAINS toLower($spaceName)
      )
    OPTIONAL MATCH (owner:Person)-[:OWNS]->(space)
    OPTIONAL MATCH (space)-[:HAS_MEMBER]->(:SpaceMembership)-[:IS_MEMBER]->(member:Person)
    WITH context,
      [id IN collect(DISTINCT owner.id) WHERE id IS NOT NULL] AS ownerIds,
      [id IN collect(DISTINCT member.id) WHERE id IS NOT NULL] AS memberIds
    WHERE $currentUserId IN ownerIds OR $currentUserId IN memberIds
    RETURN context.id AS contextId
    LIMIT 5
  `

  const rows = await graph.query<{ contextId: string }>(query, {
    title,
    spaceName: input.spaceName?.trim() || null,
    currentUserId,
  })

  if (!rows || rows.length === 0) {
    return {
      ok: false,
      result: {
        success: false,
        message: 'No editable field context matched your request.',
      },
    }
  }

  if (rows.length > 1) {
    return {
      ok: false,
      result: {
        success: false,
        requiresDisambiguation: true,
        message:
          'Multiple editable field contexts match your request. Please provide contextId.',
        candidates: rows,
      },
    }
  }

  return { ok: true, contextId: rows[0].contextId }
}

async function resolveAuthorizedPulseId(
  graph: Neo4jGraph,
  currentUserId: string,
  input: UpdatePulseInput
): Promise<
  { ok: true; pulseId: string } | { ok: false; result: ToolExecutionResult }
> {
  if (input.pulseId?.trim()) {
    const allowed = await canEditPulse(graph, currentUserId, input.pulseId)
    if (!allowed) {
      return {
        ok: false,
        result: {
          success: false,
          message: 'You can only edit pulses in spaces you belong to.',
        },
      }
    }

    return { ok: true, pulseId: input.pulseId }
  }

  const title = input.currentTitle?.trim()
  if (!title) {
    return {
      ok: false,
      result: {
        success: false,
        message:
          'Please provide pulseId or currentTitle so I can identify the pulse.',
      },
    }
  }

  const query = `
    MATCH (space:Space)-[:HAS_CONTEXT]->(context:FieldContext)-[:HAS_PULSE]->(pulse:FieldPulse)
    WHERE toLower(trim(coalesce(pulse.title, ''))) = toLower(trim($title))
      AND (
        $contextId IS NULL
        OR context.id = $contextId
      )
    OPTIONAL MATCH (owner:Person)-[:OWNS]->(space)
    OPTIONAL MATCH (space)-[:HAS_MEMBER]->(:SpaceMembership)-[:IS_MEMBER]->(member:Person)
    WITH pulse,
      [id IN collect(DISTINCT owner.id) WHERE id IS NOT NULL] AS ownerIds,
      [id IN collect(DISTINCT member.id) WHERE id IS NOT NULL] AS memberIds
    WHERE $currentUserId IN ownerIds OR $currentUserId IN memberIds
    RETURN pulse.id AS pulseId
    LIMIT 5
  `

  const rows = await graph.query<{ pulseId: string }>(query, {
    title,
    contextId: input.contextId?.trim() || null,
    currentUserId,
  })

  if (!rows || rows.length === 0) {
    return {
      ok: false,
      result: {
        success: false,
        message: 'No editable pulse matched your request.',
      },
    }
  }

  if (rows.length > 1) {
    return {
      ok: false,
      result: {
        success: false,
        requiresDisambiguation: true,
        message:
          'Multiple editable pulses match your request. Please provide pulseId.',
        candidates: rows,
      },
    }
  }

  return { ok: true, pulseId: rows[0].pulseId }
}

async function renameSpaceAuthorized(
  graph: Neo4jGraph,
  currentUserId: string,
  args: Record<string, unknown>
): Promise<ToolExecutionResult> {
  const currentName = String(args.currentName || '').trim()
  const newName = String(args.newName || '').trim()

  if (!currentName || !newName) {
    return {
      success: false,
      message: 'Both currentName and newName are required for rename_space.',
    }
  }

  const matches = await getEditableSpaceMatchesByName(
    graph,
    currentUserId,
    currentName
  )

  if (matches.length === 0) {
    return {
      success: false,
      message: 'No editable space matched that name.',
    }
  }

  if (matches.length > 1) {
    return {
      success: false,
      requiresDisambiguation: true,
      message:
        'Multiple editable spaces have that name. Please rename using a unique space name first.',
      candidates: matches,
    }
  }

  const target = matches[0]
  const updateQuery = `
    MATCH (space:Space)
    WHERE elementId(space) = $graphId
    SET space.name = $newName,
        space.updatedAt = datetime()
    RETURN coalesce(space.id, '') AS id, space.name AS name
    LIMIT 1
  `

  const updated = await graph.query<{ id: string; name: string }>(updateQuery, {
    graphId: target.graphId,
    newName,
  })

  if (!updated || updated.length === 0) {
    return {
      success: false,
      message: 'Failed to rename the space.',
    }
  }

  return {
    success: true,
    spaceId: updated[0].id,
    oldName: currentName,
    newName: updated[0].name,
    message: `Renamed \"${currentName}\" to \"${updated[0].name}\" successfully.`,
  }
}

async function updateMyProfileAuthorized(
  graph: Neo4jGraph,
  currentUserId: string,
  args: Record<string, unknown>
): Promise<ToolExecutionResult> {
  const newName = String(args.newName || '').trim()

  if (!newName) {
    return {
      success: false,
      message: 'Please provide newName to update your profile.',
    }
  }

  const query = `
    MATCH (p:Person {id: $currentUserId})
    SET p.name = $newName,
        p.updatedAt = datetime()
    RETURN p.id AS id, p.name AS name
    LIMIT 1
  `

  const rows = await graph.query<{ id: string; name: string }>(query, {
    currentUserId,
    newName,
  })

  if (!rows || rows.length === 0) {
    return {
      success: false,
      message: 'Could not update your profile. Please verify your session.',
    }
  }

  return {
    success: true,
    personId: rows[0].id,
    name: rows[0].name,
    message: `Updated your display name to \"${rows[0].name}\".`,
  }
}

async function createFieldContextAuthorized(
  graph: Neo4jGraph,
  currentUserId: string,
  args: Record<string, unknown>
): Promise<ToolExecutionResult> {
  const input = args as CreateFieldContextInput
  const title = input.title?.trim() || ''
  const emergentName = input.emergentName?.trim() || null

  if (!title) {
    return {
      success: false,
      message: 'title is required to create a field context.',
    }
  }

  const space = await resolveEditableSpace(graph, currentUserId, input)
  if (!space.ok) return space.result

  const query = `
    MATCH (space:Space {id: $spaceId})
    CREATE (context:FieldContext {
      id: 'context_' + randomUUID(),
      title: $title,
      createdAt: datetime(),
      updatedAt: datetime()
    })
    FOREACH (_ IN CASE WHEN $emergentName IS NULL THEN [] ELSE [1] END |
      SET context.emergentName = $emergentName
    )
    CREATE (space)-[:HAS_CONTEXT]->(context)
    RETURN context.id AS id, context.title AS title, context.emergentName AS emergentName
    LIMIT 1
  `

  const rows = await graph.query<{
    id: string
    title: string
    emergentName?: string | null
  }>(query, {
    spaceId: space.spaceId,
    title,
    emergentName,
  })

  if (!rows || rows.length === 0) {
    return {
      success: false,
      message: 'Failed to create the field context.',
    }
  }

  return {
    success: true,
    contextId: rows[0].id,
    title: rows[0].title,
    emergentName: rows[0].emergentName || null,
    spaceId: space.spaceId,
    spaceName: space.spaceName,
    message: `Created field context "${rows[0].title}" in "${space.spaceName}".`,
  }
}

async function deleteFieldContextAuthorized(
  graph: Neo4jGraph,
  currentUserId: string,
  args: Record<string, unknown>
): Promise<ToolExecutionResult> {
  const input = args as DeleteFieldContextInput
  const resolved = await resolveAuthorizedContextId(graph, currentUserId, {
    contextId: input.contextId,
    currentTitle: input.currentTitle || input.contextTitle,
    spaceName: input.spaceName,
  })

  if (!resolved.ok) return resolved.result

  const contextId = resolved.contextId
  const detailsQuery = `
    MATCH (context:FieldContext {id: $contextId})
    OPTIONAL MATCH (context)-[:HAS_PULSE]->(pulse:FieldPulse)
    RETURN context.title AS title, count(DISTINCT pulse) AS pulseCount
    LIMIT 1
  `

  const details = await graph.query<{ title: string; pulseCount: number }>(
    detailsQuery,
    { contextId }
  )

  if (!details || details.length === 0) {
    return {
      success: false,
      message: 'Field context not found.',
    }
  }

  const pulseCount = Number(details[0].pulseCount || 0)
  const deletePulses = Boolean(input.deletePulses)

  if (pulseCount > 0 && !deletePulses) {
    return {
      success: false,
      requiresClarification: true,
      message: `This field context has ${pulseCount} pulse${pulseCount === 1 ? '' : 's'}. Confirm deletePulses=true if you want to delete the context and its pulses.`,
    }
  }

  if (deletePulses) {
    const deleteQuery = `
      MATCH (context:FieldContext {id: $contextId})
      OPTIONAL MATCH (context)-[:HAS_PULSE]->(pulse:FieldPulse)
      OPTIONAL MATCH (pulse)-[:HAS_CHUNK]->(chunk:ConversationChunk)
      WITH context,
           collect(DISTINCT pulse) AS pulses,
           collect(DISTINCT chunk) AS chunks
      FOREACH (c IN chunks | DETACH DELETE c)
      FOREACH (p IN pulses | DETACH DELETE p)
      WITH context, size(pulses) AS deletedPulseCount
      DETACH DELETE context
      RETURN deletedPulseCount
    `

    const rows = await graph.query<{ deletedPulseCount: number }>(deleteQuery, {
      contextId,
    })

    return {
      success: true,
      contextId,
      deletedPulseCount: Number(rows?.[0]?.deletedPulseCount || 0),
      message: `Deleted field context "${details[0].title}" and its pulses.`,
    }
  }

  const deleteContextOnlyQuery = `
    MATCH (context:FieldContext {id: $contextId})
    WHERE NOT EXISTS {
      MATCH (context)-[:HAS_PULSE]->(:FieldPulse)
    }
    DETACH DELETE context
    RETURN 1 AS deleted
  `

  const rows = await graph.query<{ deleted: number }>(deleteContextOnlyQuery, {
    contextId,
  })

  if (!rows || rows.length === 0) {
    return {
      success: false,
      message: 'Could not delete field context.',
    }
  }

  return {
    success: true,
    contextId,
    deletedPulseCount: 0,
    message: `Deleted field context "${details[0].title}".`,
  }
}

async function createPulseAuthorized(
  graph: Neo4jGraph,
  currentUserId: string,
  args: Record<string, unknown>
): Promise<ToolExecutionResult> {
  const input = args as CreatePulseInput
  const title = input.title?.trim() || ''
  // A title is the only hard requirement — the UI lets users create a
  // title-only goal/pulse. When the user gave no body, seed content from the
  // title so the create succeeds (GOAL-261: an empty content used to fail the
  // write, which then re-triggered the approval prompt in a loop).
  const content = input.content?.trim() || title

  if (!title) {
    return {
      success: false,
      message: 'A title is required to create a pulse.',
    }
  }

  const resolvedContext = await resolveAuthorizedContextId(
    graph,
    currentUserId,
    {
      contextId: input.contextId,
      currentTitle: input.contextTitle,
      spaceName: input.spaceName,
    }
  )
  if (!resolvedContext.ok) return resolvedContext.result

  const pulseType = ALLOWED_PULSE_TYPES.has(
    (input.pulseType as PulseCreationType) || 'FieldPulse'
  )
    ? (input.pulseType as PulseCreationType) || 'FieldPulse'
    : 'FieldPulse'
  const pulseLabel = pulseType === 'FieldPulse' ? '' : `:${pulseType}`
  const documentId = input.documentId?.trim() || null
  const conversationThreadId = input.conversationThreadId?.trim() || null
  const documentFilename = documentId
    ? await lookupDocumentFilename(graph, documentId)
    : null
  const pulseId = `pulse_${randomUUID()}`
  const logId = `log_${Date.now()}_${randomUUID().slice(0, 8)}`
  const where = input.contextTitle?.trim() || ''
  const humanLabel = pulseTypeLabel(pulseType)
  const filenameSuffix = documentFilename ? ` (from ${documentFilename})` : ''
  const description =
    (where
      ? `Added ${humanLabel} "${title}" to ${where}`
      : `Added ${humanLabel} "${title}"`) + filenameSuffix
  // Slice 7: server-side audit metadata. Never user-facing; surfaced only via
  // the Log row's metadata field for downstream audits.
  const metadata = buildIngestLogMetadata(documentId, conversationThreadId)

  const query = `
    MATCH (context:FieldContext {id: $contextId})
    MATCH (person:Person {id: $currentUserId})
    OPTIONAL MATCH (doc:Document {id: $documentId})
    CREATE (pulse:FieldPulse${pulseLabel} {
      id: $pulseId,
      title: $title,
      content: $content,
      createdAt: datetime(),
      updatedAt: datetime()
    })
    FOREACH (_ IN CASE WHEN $status IS NULL THEN [] ELSE [1] END |
      SET pulse.status = $status
    )
    FOREACH (_ IN CASE WHEN $intensity IS NULL THEN [] ELSE [1] END |
      SET pulse.intensity = $intensity
    )
    FOREACH (_ IN CASE WHEN $horizon IS NULL THEN [] ELSE [1] END |
      SET pulse.horizon = $horizon
    )
    FOREACH (_ IN CASE WHEN $resourceType IS NULL THEN [] ELSE [1] END |
      SET pulse.resourceType = $resourceType
    )
    FOREACH (_ IN CASE WHEN $availability IS NULL THEN [] ELSE [1] END |
      SET pulse.availability = $availability
    )
    FOREACH (_ IN CASE WHEN $why IS NULL THEN [] ELSE [1] END |
      SET pulse.why = $why
    )
    FOREACH (_ IN CASE WHEN $location IS NULL THEN [] ELSE [1] END |
      SET pulse.location = $location
    )
    FOREACH (_ IN CASE WHEN $time IS NULL THEN [] ELSE [1] END |
      SET pulse.time = $time
    )
    CREATE (context)-[:HAS_PULSE]->(pulse)
    CREATE (pulse)-[:INITIATED_BY]->(person)
    CREATE (log:Log {
      id: $logId,
      description: $description,
      createdAt: datetime()
    })
    FOREACH (_ IN CASE WHEN $metadata IS NULL THEN [] ELSE [1] END |
      SET log.metadata = $metadata
    )
    CREATE (log)-[:CREATED_BY]->(person)
    CREATE (log)-[:LOGGED_FOR]->(pulse)
    FOREACH (_ IN CASE WHEN doc IS NULL THEN [] ELSE [1] END |
      CREATE (pulse)-[:EXTRACTED_FROM]->(doc)
    )
    RETURN pulse.id AS id, pulse.title AS title
    LIMIT 1
  `

  const rows = await graph.query<{ id: string; title: string }>(query, {
    contextId: resolvedContext.contextId,
    currentUserId,
    documentId,
    pulseId,
    logId,
    description,
    metadata,
    title,
    content,
    // GoalPulse.status is non-nullable (GoalStatus!) in the schema. A GoalPulse
    // created without an explicit status must default to ACTIVE, otherwise the
    // node has no status property and every later query of it fails with
    // "Cannot return null for non-nullable field GoalPulse.status".
    status:
      input.status?.trim() ||
      (pulseType === 'GoalPulse' ? 'ACTIVE' : null),
    intensity:
      typeof input.intensity === 'number' && Number.isFinite(input.intensity)
        ? input.intensity
        : null,
    horizon: input.horizon?.trim() || null,
    resourceType: input.resourceType?.trim() || null,
    availability:
      typeof input.availability === 'number' &&
      Number.isFinite(input.availability)
        ? input.availability
        : null,
    why: input.why?.trim() || null,
    location: input.location?.trim() || null,
    time: input.time?.trim() || null,
  })

  if (!rows || rows.length === 0) {
    return {
      success: false,
      message: 'Failed to create pulse.',
    }
  }

  return {
    success: true,
    pulseId: rows[0].id,
    title: rows[0].title,
    pulseType,
    contextId: resolvedContext.contextId,
    documentId,
    message: where
      ? `Added ${humanLabel} "${rows[0].title}" to ${where}.`
      : `Added ${humanLabel} "${rows[0].title}".`,
  }
}

async function deletePulseAuthorized(
  graph: Neo4jGraph,
  currentUserId: string,
  args: Record<string, unknown>
): Promise<ToolExecutionResult> {
  const input = args as DeletePulseInput
  const resolved = await resolveAuthorizedPulseId(graph, currentUserId, {
    pulseId: input.pulseId,
    currentTitle: input.currentTitle,
    contextId: input.contextId,
  })
  if (!resolved.ok) return resolved.result

  const pulseId = resolved.pulseId
  const query = `
    MATCH (pulse:FieldPulse {id: $pulseId})
    OPTIONAL MATCH (pulse)-[:HAS_CHUNK]->(chunk:ConversationChunk)
    WITH pulse, pulse.title AS title, collect(DISTINCT chunk) AS chunks
    FOREACH (c IN chunks | DETACH DELETE c)
    DETACH DELETE pulse
    RETURN title, size(chunks) AS deletedChunkCount
  `

  const rows = await graph.query<{ title: string; deletedChunkCount: number }>(
    query,
    { pulseId }
  )

  if (!rows || rows.length === 0) {
    return {
      success: false,
      message: 'Failed to delete pulse.',
    }
  }

  return {
    success: true,
    pulseId,
    title: rows[0].title,
    deletedChunkCount: Number(rows[0].deletedChunkCount || 0),
    message: `Deleted pulse "${rows[0].title}".`,
  }
}

interface CreatePersonAuthorizedInput {
  firstName?: string
  lastName?: string
  contextId?: string
  contextTitle?: string
  documentId?: string
  conversationThreadId?: string
  /**
   * The current user's relationship to this person, captured at creation and
   * persisted as the `why` on a CONNECTED_TO edge from the user to the new
   * person (GOAL-XXX). Optional — the approval card always ASKS for it, but the
   * user may skip it, in which case no connection edge is created.
   */
  relationshipWhy?: string
  /** Optional shared interests, persisted as CONNECTED_TO.interests. */
  interests?: string
  /**
   * A short relational note about who this person is — persisted on the
   * PersonPulse node's `description`. Distinct from `relationshipWhy` (which
   * captures how the user relates to them). Optional.
   */
  description?: string
}

async function createPersonAuthorized(
  graph: Neo4jGraph,
  currentUserId: string,
  args: Record<string, unknown>
): Promise<ToolExecutionResult> {
  const input = args as CreatePersonAuthorizedInput
  const firstName = input.firstName?.trim() || ''
  const lastName = input.lastName?.trim() || ''
  const contextId = input.contextId?.trim() || ''
  const contextTitle = input.contextTitle?.trim() || ''
  const documentId = input.documentId?.trim() || null
  const conversationThreadId = input.conversationThreadId?.trim() || null
  // The user's relationship to this person — modeled as CONNECTED_TO.why from
  // the current user to the new person. Skippable (null = no edge created).
  const relationshipWhy = input.relationshipWhy?.trim() || null
  const relationshipInterests = input.interests?.trim() || null
  // A short note describing who this person is, stored on the node itself.
  // (Named distinctly from the activity-log `description` built below.)
  const personDescription = input.description?.trim() || null

  if (!firstName) {
    return {
      success: false,
      message: 'create_person requires at least a firstName.',
    }
  }
  if (!contextId) {
    return {
      success: false,
      message: 'create_person requires a contextId.',
    }
  }

  const allowed = await canEditContext(graph, currentUserId, contextId)
  if (!allowed) {
    return {
      success: false,
      message: 'You can only add people to field contexts in spaces you belong to.',
    }
  }

  const documentFilename = documentId
    ? await lookupDocumentFilename(graph, documentId)
    : null
  const personId = `person_${randomUUID()}`
  const logId = `log_${Date.now()}_${randomUUID().slice(0, 8)}`
  // lastName is optional — people are often known by a single name. The `name`
  // field is the canonical display string used everywhere downstream, so it
  // collapses to just the firstName when no surname was provided.
  const name = lastName ? `${firstName} ${lastName}` : firstName
  const where = contextTitle || 'this field context'
  const filenameSuffix = documentFilename ? ` (from ${documentFilename})` : ''
  // Fold the relationship into the activity log so the audit trail records why
  // the person matters to the user, not just that they were added.
  const connectionClause = relationshipWhy
    ? ` (connected to you as "${relationshipWhy}")`
    : ''
  const description = `Added ${name} to ${where}${filenameSuffix}${connectionClause}`
  const metadata = buildIngestLogMetadata(documentId, conversationThreadId)

  const rows = await graph.query<{ id: string; name: string }>(
    `
    MATCH (c:FieldContext {id: $contextId})
    MATCH (u:Person {id: $currentUserId})
    OPTIONAL MATCH (d:Document {id: $documentId})
    CREATE (p:Person:PersonPulse {
      id: $personId,
      firstName: $firstName,
      lastName: $lastName,
      name: $name,
      createdAt: datetime()
    })
    FOREACH (_ IN CASE WHEN $personDescription IS NULL THEN [] ELSE [1] END |
      SET p.description = $personDescription
    )
    CREATE (c)-[:HAS_PERSON]->(p)
    // Model the user's relationship to the new person as a CONNECTED_TO edge
    // carrying the why. Only when a relationship was provided — a skipped
    // relationship leaves the person unconnected (per the always-ask-but-
    // skippable decision). MERGE keeps it idempotent on accidental re-runs.
    FOREACH (_ IN CASE WHEN $relationshipWhy IS NULL THEN [] ELSE [1] END |
      MERGE (u)-[rc:CONNECTED_TO]-(p)
      SET rc.why = $relationshipWhy,
          rc.interests = coalesce($relationshipInterests, rc.interests)
    )
    CREATE (log:Log {
      id: $logId,
      description: $description,
      createdAt: datetime()
    })
    FOREACH (_ IN CASE WHEN $metadata IS NULL THEN [] ELSE [1] END |
      SET log.metadata = $metadata
    )
    CREATE (log)-[:CREATED_BY]->(u)
    FOREACH (_ IN CASE WHEN d IS NULL THEN [] ELSE [1] END |
      CREATE (p)-[:EXTRACTED_FROM]->(d)
    )
    RETURN p.id AS id, p.name AS name
    LIMIT 1
    `,
    {
      contextId,
      currentUserId,
      documentId,
      personId,
      firstName,
      lastName,
      name,
      logId,
      description,
      personDescription,
      metadata,
      relationshipWhy,
      relationshipInterests,
    }
  )

  if (!rows || rows.length === 0) {
    return {
      success: false,
      message: 'Failed to create the person.',
    }
  }

  return {
    success: true,
    personId: rows[0].id,
    name: rows[0].name,
    contextId,
    documentId,
    connectedToYou: Boolean(relationshipWhy),
    relationshipWhy,
    message: relationshipWhy
      ? `Added ${rows[0].name} to ${where} and connected them to you as "${relationshipWhy}".`
      : `Added ${rows[0].name} to ${where}.`,
  }
}

interface UpdatePersonAuthorizedInput {
  personId?: string
  firstName?: string
  lastName?: string
  currentName?: string
  contextId?: string
  contextTitle?: string
  documentId?: string
  conversationThreadId?: string
}

async function updatePersonAuthorized(
  graph: Neo4jGraph,
  currentUserId: string,
  args: Record<string, unknown>
): Promise<ToolExecutionResult> {
  const input = args as UpdatePersonAuthorizedInput
  const personId = input.personId?.trim() || ''
  const firstName = input.firstName?.trim() || ''
  const lastName = input.lastName?.trim() || ''
  const contextId = input.contextId?.trim() || ''
  const contextTitle = input.contextTitle?.trim() || ''
  const documentId = input.documentId?.trim() || null
  const conversationThreadId = input.conversationThreadId?.trim() || null

  if (!personId) {
    return {
      success: false,
      message: 'update_person requires a personId.',
    }
  }

  // Auth check: the user must be able to edit *some* FieldContext that
  // hosts this person. Passing the contextId from the synthesized turn keeps
  // the gate aligned with the ingest path (the document was uploaded into
  // that FieldContext, so it is also where the existing person lives).
  if (contextId) {
    const allowed = await canEditContext(graph, currentUserId, contextId)
    if (!allowed) {
      return {
        success: false,
        message:
          'You can only edit people in field contexts in spaces you belong to.',
      }
    }
  } else {
    const allowedRows = await graph.query<{ allowed: boolean }>(
      `
      MATCH (space:Space)-[:HAS_CONTEXT]->(:FieldContext)-[:HAS_PERSON]->(p:Person {id: $personId})
      OPTIONAL MATCH (owner:Person {id: $currentUserId})-[:OWNS]->(space)
      OPTIONAL MATCH (space)-[:HAS_MEMBER]->(:SpaceMembership)-[:IS_MEMBER]->(member:Person {id: $currentUserId})
      WITH (owner IS NOT NULL OR member IS NOT NULL) AS allowed
      RETURN allowed
      LIMIT 1
      `,
      { personId, currentUserId }
    )
    if (!allowedRows?.[0]?.allowed) {
      return {
        success: false,
        message:
          'You can only edit people in field contexts in spaces you belong to.',
      }
    }
  }

  const newFirstName = firstName || null
  const newLastName = lastName || null
  const hasNameChange = Boolean(newFirstName || newLastName)

  const documentFilename = documentId
    ? await lookupDocumentFilename(graph, documentId)
    : null
  const logId = `log_${Date.now()}_${randomUUID().slice(0, 8)}`
  const composedName = [firstName, lastName].filter(Boolean).join(' ').trim()
  const displayName =
    composedName || input.currentName?.trim() || 'person'
  const where = contextTitle || 'this field context'
  const filenameSuffix = documentFilename ? ` (from ${documentFilename})` : ''
  const description = `Updated ${displayName} in ${where}${filenameSuffix}`
  const metadata = buildIngestLogMetadata(documentId, conversationThreadId)

  const rows = await graph.query<{
    id: string
    firstName: string | null
    lastName: string | null
    name: string | null
  }>(
    `
    MATCH (p:Person {id: $personId})
    MATCH (u:Person {id: $currentUserId})
    OPTIONAL MATCH (d:Document {id: $documentId})
    FOREACH (_ IN CASE WHEN $newFirstName IS NULL THEN [] ELSE [1] END |
      SET p.firstName = $newFirstName
    )
    FOREACH (_ IN CASE WHEN $newLastName IS NULL THEN [] ELSE [1] END |
      SET p.lastName = $newLastName
    )
    FOREACH (_ IN CASE WHEN NOT $hasNameChange THEN [] ELSE [1] END |
      SET p.name = trim(coalesce(p.firstName, '') + ' ' + coalesce(p.lastName, ''))
    )
    SET p.updatedAt = datetime()
    CREATE (log:Log {
      id: $logId,
      description: $description,
      createdAt: datetime()
    })
    FOREACH (_ IN CASE WHEN $metadata IS NULL THEN [] ELSE [1] END |
      SET log.metadata = $metadata
    )
    CREATE (log)-[:CREATED_BY]->(u)
    FOREACH (_ IN CASE WHEN d IS NULL THEN [] ELSE [1] END |
      MERGE (p)-[:EXTRACTED_FROM]->(d)
    )
    RETURN p.id AS id, p.firstName AS firstName, p.lastName AS lastName, p.name AS name
    LIMIT 1
    `,
    {
      personId,
      currentUserId,
      documentId,
      newFirstName,
      newLastName,
      hasNameChange,
      logId,
      description,
      metadata,
    }
  )

  if (!rows || rows.length === 0) {
    return {
      success: false,
      message: 'Failed to update the person.',
    }
  }

  return {
    success: true,
    personId: rows[0].id,
    name: rows[0].name || displayName,
    contextId,
    documentId,
    message: `Updated ${rows[0].name || displayName} in ${where}.`,
  }
}

interface PersonLocatorInput {
  personId?: string
  personName?: string
}

/**
 * Resolve a Person the current user is allowed to connect, by id or name.
 * "Allowed" = the current user THEMSELVES (the from-endpoint default), OR a
 * `PersonPulse` (a relational-world person, never another registered User)
 * attached (HAS_PERSON) to a FieldContext inside a Space the user owns or is a
 * member of. Restricting non-self targets to `PersonPulse` keeps the assistant
 * from writing an undirected CONNECTED_TO edge onto another real account that
 * never consented — and matches the scoping suggest_connections already uses.
 *
 * Two query shapes: an index-seek by id (the hot path — the suggestion-accept
 * card always passes resolved ids) and a name scan (PersonPulse only) that also
 * returns the owning Space name so same-name matches can be disambiguated by
 * the model (Rule 1 — names only, never ids).
 */
async function resolveEditablePerson(
  graph: Neo4jGraph,
  currentUserId: string,
  input: PersonLocatorInput
): Promise<
  | { ok: true; personId: string; name: string }
  | { ok: false; result: ToolExecutionResult }
> {
  const personId = input.personId?.trim() || null
  const personName = input.personName?.trim() || null

  if (!personId && !personName) {
    return {
      ok: false,
      result: {
        success: false,
        message: 'Provide a person id or name to identify who to connect.',
      },
    }
  }

  if (personId) {
    const rows = await graph.query<{ id: string; name: string | null }>(
      `
      MATCH (target:Person {id: $personId})
      WHERE target.id = $currentUserId
         OR (target:PersonPulse AND EXISTS {
              MATCH (target)<-[:HAS_PERSON]-(:FieldContext)<-[:HAS_CONTEXT]-(space:Space)
              WHERE (space)<-[:OWNS]-(:Person {id: $currentUserId})
                 OR (space)-[:HAS_MEMBER]->(:SpaceMembership)-[:IS_MEMBER]->(:Person {id: $currentUserId})
            })
      RETURN target.id AS id, target.name AS name
      LIMIT 1
      `,
      { personId, currentUserId }
    )
    if (!rows || rows.length === 0) {
      return {
        ok: false,
        result: {
          success: false,
          message:
            'That person could not be found, or you do not have access to them.',
        },
      }
    }
    return { ok: true, personId: rows[0].id, name: rows[0].name || 'person' }
  }

  const rows = await graph.query<{
    id: string
    name: string | null
    spaceName: string | null
  }>(
    `
    MATCH (target:Person:PersonPulse)
    WHERE toLower(trim(coalesce(target.name, ''))) = toLower(trim($personName))
    MATCH (target)<-[:HAS_PERSON]-(:FieldContext)<-[:HAS_CONTEXT]-(space:Space)
    WHERE (space)<-[:OWNS]-(:Person {id: $currentUserId})
       OR (space)-[:HAS_MEMBER]->(:SpaceMembership)-[:IS_MEMBER]->(:Person {id: $currentUserId})
    WITH target, head(collect(DISTINCT space.name)) AS spaceName
    RETURN target.id AS id, target.name AS name, spaceName
    LIMIT 5
    `,
    { personName, currentUserId }
  )

  if (!rows || rows.length === 0) {
    return {
      ok: false,
      result: {
        success: false,
        message: `No person named "${personName}" that you can connect was found.`,
      },
    }
  }

  if (rows.length > 1) {
    return {
      ok: false,
      result: {
        success: false,
        requiresDisambiguation: true,
        message: `More than one person named "${personName}" — tell me which one (e.g. the one in a particular space) or open their profile and connect from there.`,
        // Names + owning-space names only (Rule 1 — never ids) so the model can
        // help the user pick between same-named people.
        candidates: rows.map((r) => ({ name: r.name, space: r.spaceName })),
      },
    }
  }

  return { ok: true, personId: rows[0].id, name: rows[0].name || 'person' }
}

interface CreateConnectionAuthorizedInput {
  fromPersonId?: string
  fromPersonName?: string
  toPersonId?: string
  toPersonName?: string
  why?: string
  interests?: string
}

/**
 * Create (or refresh) a CONNECTED_TO edge between two people the current user
 * is allowed to connect. `from` defaults to the current user — the common case
 * is "connect me to <person>" with a relationship why. Both endpoints are
 * authorized via resolveEditablePerson. Writes a single activity Log attributed
 * to the user (the GraphQL connection resolver skips logging; the assistant
 * path must not — activity logging is mandatory on mutations).
 *
 * `why` / `interests` are coalesced, so re-connecting without re-stating the
 * metadata never wipes an existing edge's why.
 */
async function createConnectionAuthorized(
  graph: Neo4jGraph,
  currentUserId: string,
  args: Record<string, unknown>
): Promise<ToolExecutionResult> {
  const input = args as CreateConnectionAuthorizedInput
  const why = input.why?.trim() || null
  const interests = input.interests?.trim() || null

  // `from` defaults to the current user when neither id nor name is given.
  const fromHasLocator = Boolean(
    input.fromPersonId?.trim() || input.fromPersonName?.trim()
  )
  const fromResolved = await resolveEditablePerson(
    graph,
    currentUserId,
    fromHasLocator
      ? { personId: input.fromPersonId, personName: input.fromPersonName }
      : { personId: currentUserId }
  )
  if (!fromResolved.ok) return fromResolved.result

  const toResolved = await resolveEditablePerson(graph, currentUserId, {
    personId: input.toPersonId,
    personName: input.toPersonName,
  })
  if (!toResolved.ok) return toResolved.result

  if (fromResolved.personId === toResolved.personId) {
    return {
      success: false,
      message: 'You cannot connect a person to themselves.',
    }
  }

  const logId = `log_${Date.now()}_${randomUUID().slice(0, 8)}`
  const whyClause = why ? ` — "${why}"` : ''
  const description = `Connected ${fromResolved.name} with ${toResolved.name}${whyClause}`

  const rows = await graph.query<{
    fromName: string | null
    toName: string | null
    why: string | null
  }>(
    // Both endpoint ids are already authorized above via resolveEditablePerson
    // (self or a PersonPulse in an editable Space), so this id-anchored write is
    // safe; it does not re-scope by Space.
    `
    MATCH (from:Person {id: $fromId})
    MATCH (to:Person {id: $toId})
    MATCH (actor:Person {id: $currentUserId})
    MERGE (from)-[r:CONNECTED_TO]-(to)
    SET r.why = coalesce($why, r.why),
        r.interests = coalesce($interests, r.interests)
    CREATE (log:Log {
      id: $logId,
      description: $description,
      createdAt: datetime()
    })
    CREATE (log)-[:CREATED_BY]->(actor)
    RETURN from.name AS fromName, to.name AS toName, r.why AS why
    LIMIT 1
    `,
    {
      fromId: fromResolved.personId,
      toId: toResolved.personId,
      currentUserId,
      why,
      interests,
      logId,
      description,
    }
  )

  if (!rows || rows.length === 0) {
    return {
      success: false,
      message: 'Failed to create the connection.',
    }
  }

  const fromName = rows[0].fromName || fromResolved.name
  const toName = rows[0].toName || toResolved.name
  return {
    success: true,
    fromName,
    toName,
    why: rows[0].why ?? null,
    message: `Connected ${fromName} with ${toName}.`,
  }
}

async function deleteMyProfileAuthorized(
  graph: Neo4jGraph,
  currentUserId: string,
  args: Record<string, unknown>
): Promise<ToolExecutionResult> {
  const confirm = Boolean(args.confirm)
  if (!confirm) {
    return {
      success: false,
      requiresClarification: true,
      message:
        'Set confirm=true to deactivate your profile. This action only applies to your own account.',
    }
  }

  const query = `
    MATCH (p:Person {id: $currentUserId})
    WITH p, coalesce(p.isActive, true) AS wasActive
    SET p.isActive = false,
        p.deactivatedAt = datetime(),
        p.updatedAt = datetime()
    RETURN p.id AS id, p.name AS name, wasActive
    LIMIT 1
  `

  const rows = await graph.query<{
    id: string
    name: string
    wasActive: boolean
  }>(query, { currentUserId })

  if (!rows || rows.length === 0) {
    return {
      success: false,
      message: 'Could not find your profile for deactivation.',
    }
  }

  return {
    success: true,
    personId: rows[0].id,
    wasActive: Boolean(rows[0].wasActive),
    message: 'Your profile has been deactivated.',
  }
}

export async function executeAuthorizedWriteTool(
  graph: Neo4jGraph,
  currentUserId: string | null,
  toolName: WriteToolName,
  rawArgs: Record<string, unknown>
): Promise<ToolExecutionResult> {
  if (!currentUserId) {
    return {
      success: false,
      message: 'You must be logged in to perform edits.',
    }
  }

  if (toolName === 'rename_space') {
    return await renameSpaceAuthorized(graph, currentUserId, rawArgs)
  }

  if (toolName === 'create_field_context') {
    return await createFieldContextAuthorized(graph, currentUserId, rawArgs)
  }

  if (toolName === 'delete_field_context') {
    return await deleteFieldContextAuthorized(graph, currentUserId, rawArgs)
  }

  if (toolName === 'update_field_context') {
    const input = rawArgs as unknown as UpdateFieldContextInput
    const resolved = await resolveAuthorizedContextId(
      graph,
      currentUserId,
      input
    )
    if (!resolved.ok) return resolved.result

    return (await updateFieldContext(graph, {
      ...input,
      contextId: resolved.contextId,
    })) as unknown as ToolExecutionResult
  }

  if (toolName === 'update_pulse') {
    const input = rawArgs as unknown as UpdatePulseInput & {
      documentId?: string
      pulseType?: string
      contextTitle?: string
    }
    const resolved = await resolveAuthorizedPulseId(graph, currentUserId, input)
    if (!resolved.ok) return resolved.result

    const updateResult = (await updatePulse(graph, {
      ...input,
      pulseId: resolved.pulseId,
    })) as unknown as ToolExecutionResult & {
      pulse?: { id?: string; title?: string }
    }

    if (!updateResult.success) return updateResult

    // Doc-ingestion provenance: when the synthesized turn carries a
    // documentId, append EXTRACTED_FROM (idempotent via MERGE) and a single
    // Log entry attributed to the editor — parity with manual create/update.
    const documentId =
      typeof input.documentId === 'string' && input.documentId.trim()
        ? input.documentId.trim()
        : null
    const conversationThreadId =
      typeof (input as { conversationThreadId?: string }).conversationThreadId ===
        'string' &&
      (input as { conversationThreadId?: string }).conversationThreadId!.trim()
        ? (input as { conversationThreadId?: string })
            .conversationThreadId!.trim()
        : null
    if (documentId) {
      const updatedTitle =
        updateResult.pulse?.title || input.currentTitle || 'pulse'
      const where =
        typeof input.contextTitle === 'string' ? input.contextTitle.trim() : ''
      const humanLabel = pulseTypeLabel(input.pulseType)
      const documentFilename = await lookupDocumentFilename(graph, documentId)
      const filenameSuffix = documentFilename
        ? ` (from ${documentFilename})`
        : ''
      const description =
        (where
          ? `Updated ${humanLabel} "${updatedTitle}" in ${where}`
          : `Updated ${humanLabel} "${updatedTitle}"`) + filenameSuffix
      const metadata = buildIngestLogMetadata(documentId, conversationThreadId)
      const logId = `log_${Date.now()}_${randomUUID().slice(0, 8)}`
      await graph.query(
        `
        MATCH (pulse:FieldPulse {id: $pulseId})
        MATCH (u:Person {id: $currentUserId})
        OPTIONAL MATCH (d:Document {id: $documentId})
        CREATE (log:Log {
          id: $logId,
          description: $description,
          createdAt: datetime()
        })
        FOREACH (_ IN CASE WHEN $metadata IS NULL THEN [] ELSE [1] END |
          SET log.metadata = $metadata
        )
        CREATE (log)-[:CREATED_BY]->(u)
        CREATE (log)-[:LOGGED_FOR]->(pulse)
        FOREACH (_ IN CASE WHEN d IS NULL THEN [] ELSE [1] END |
          MERGE (pulse)-[:EXTRACTED_FROM]->(d)
        )
        `,
        {
          pulseId: resolved.pulseId,
          currentUserId,
          documentId,
          logId,
          description,
          metadata,
        }
      )
    }

    return updateResult
  }

  if (toolName === 'create_pulse') {
    return await createPulseAuthorized(graph, currentUserId, rawArgs)
  }

  if (toolName === 'delete_pulse') {
    return await deletePulseAuthorized(graph, currentUserId, rawArgs)
  }

  if (toolName === 'edit_pulse_context_link') {
    const input = rawArgs as unknown as PulseContextLinkInput & {
      action?: 'link' | 'unlink'
    }

    const pulseId = String(input.pulseId || '').trim()
    if (!pulseId) {
      return {
        success: false,
        message: 'pulseId is required.',
      }
    }

    const allowed = await canEditPulse(graph, currentUserId, pulseId)
    if (!allowed) {
      return {
        success: false,
        message: 'You can only edit pulse links in spaces you belong to.',
      }
    }

    const action = input.action === 'unlink' ? 'unlink' : 'link'
    const result =
      action === 'link'
        ? await linkPulseToContext(graph, input)
        : await unlinkPulseFromContext(graph, input)

    return result as unknown as ToolExecutionResult
  }

  if (toolName === 'update_my_profile') {
    return await updateMyProfileAuthorized(graph, currentUserId, rawArgs)
  }

  if (toolName === 'delete_my_profile') {
    return await deleteMyProfileAuthorized(graph, currentUserId, rawArgs)
  }

  if (toolName === 'create_person') {
    return await createPersonAuthorized(graph, currentUserId, rawArgs)
  }

  if (toolName === 'update_person') {
    return await updatePersonAuthorized(graph, currentUserId, rawArgs)
  }

  if (toolName === 'create_connection') {
    return await createConnectionAuthorized(graph, currentUserId, rawArgs)
  }

  return {
    success: false,
    message: `Unsupported write tool: ${toolName}`,
  }
}
