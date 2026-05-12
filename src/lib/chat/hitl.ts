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
import { createHash } from 'crypto'

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
      return `Create field context "${String(args.title || '')}" in ${String(args.spaceId || args.spaceName || 'selected space')}`
    case 'delete_field_context':
      return `Delete field context ${String(args.contextId || args.currentTitle || 'target context')}`
    case 'update_pulse':
      return `Update pulse ${String(args.pulseId || args.currentTitle || 'target')}`
    case 'create_pulse':
      return `Create ${String(args.pulseType || 'FieldPulse')} "${String(args.title || '')}"`
    case 'delete_pulse':
      return `Delete pulse ${String(args.pulseId || args.currentTitle || 'target pulse')}`
    case 'edit_pulse_context_link':
      return `${String(args.action || 'Edit')} pulse/context link for pulse ${String(args.pulseId || 'unknown')}`
    case 'update_my_profile':
      return `Update your profile name to \"${String(args.newName || '')}\"`
    case 'delete_my_profile':
      return 'Deactivate your own user profile'
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
  const content = input.content?.trim() || ''

  if (!title || !content) {
    return {
      success: false,
      message: 'title and content are required to create a pulse.',
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

  const query = `
    MATCH (context:FieldContext {id: $contextId})
    MATCH (person:Person {id: $currentUserId})
    CREATE (pulse:FieldPulse${pulseLabel} {
      id: 'pulse_' + randomUUID(),
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
    RETURN pulse.id AS id, pulse.title AS title
    LIMIT 1
  `

  const rows = await graph.query<{ id: string; title: string }>(query, {
    contextId: resolvedContext.contextId,
    currentUserId,
    title,
    content,
    status: input.status?.trim() || null,
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
    message: `Created ${pulseType} "${rows[0].title}".`,
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
    const input = rawArgs as unknown as UpdatePulseInput
    const resolved = await resolveAuthorizedPulseId(graph, currentUserId, input)
    if (!resolved.ok) return resolved.result

    return (await updatePulse(graph, {
      ...input,
      pulseId: resolved.pulseId,
    })) as unknown as ToolExecutionResult
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

  return {
    success: false,
    message: `Unsupported write tool: ${toolName}`,
  }
}
