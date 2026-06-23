import { Neo4jGraph } from '@langchain/community/graphs/neo4j_graph'
import { viewablePulsePredicate } from '@/lib/permissions/pulse-visibility'

export type PulseType =
  | 'GoalPulse'
  | 'ResourcePulse'
  | 'StoryPulse'
  | 'CarePulse'
  | 'CoreValuePulse'
  | 'FieldPulse'

export interface PulseRecord {
  id: string
  title: string
  content: string
  type: PulseType
  status?: string | null
  intensity?: number | null
  horizon?: string | null
  resourceType?: string | null
  availability?: number | null
  why?: string | null
  location?: string | null
  time?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  contextId?: string | null
  contextTitle?: string | null
  contextTitles?: string[]
  spaceNames?: string[]
  createdByName?: string | null
}

export interface PulseSearchInput {
  query: string
  /**
   * The authenticated caller's id. REQUIRED — results are restricted to pulses
   * in Spaces this user can view. A missing/empty userId returns nothing
   * (fail closed), never the whole graph.
   */
  userId?: string | null
  contextId?: string
  contextTitle?: string
  pulseType?: PulseType
  limit?: number
}

export interface PulseSearchResult {
  found: boolean
  count: number
  pulses: PulseRecord[]
  needsDisambiguation: boolean
  message: string
}

export interface UpdatePulseInput {
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
}

export interface UpdatePulseResult {
  success: boolean
  requiresDisambiguation?: boolean
  message: string
  pulse?: PulseRecord
  candidates?: PulseRecord[]
}

export interface PulseContextLinkInput {
  pulseId: string
  contextId?: string
  contextTitle?: string
}

export interface PulseContextLinkResult {
  success: boolean
  requiresDisambiguation?: boolean
  message: string
  pulseId?: string
  contextId?: string
  contextTitle?: string
  candidates?: Array<{ id: string; title: string }>
}

function normalizeLimit(limit?: number): number {
  if (!limit || !Number.isFinite(limit)) return 10
  return Math.max(1, Math.min(25, Math.floor(limit)))
}

function mapPulseRecord(raw: Record<string, unknown>): PulseRecord {
  const contextTitles = (
    (raw.contextTitles as string[] | undefined) || []
  ).filter(Boolean)
  const spaceNames = ((raw.spaceNames as string[] | undefined) || []).filter(
    Boolean
  )

  return {
    id: String(raw.id || ''),
    title: String(raw.title || ''),
    content: String(raw.content || ''),
    type: (raw.type as PulseType) || 'FieldPulse',
    status: (raw.status as string | null) || null,
    intensity:
      raw.intensity === null || raw.intensity === undefined
        ? null
        : Number(raw.intensity),
    horizon: (raw.horizon as string | null) || null,
    resourceType: (raw.resourceType as string | null) || null,
    availability:
      raw.availability === null || raw.availability === undefined
        ? null
        : Number(raw.availability),
    why: (raw.why as string | null) || null,
    location: (raw.location as string | null) || null,
    time: (raw.time as string | null) || null,
    createdAt: (raw.createdAt as string | null) || null,
    updatedAt: (raw.updatedAt as string | null) || null,
    contextId: (raw.contextId as string | null) || null,
    contextTitle: (raw.contextTitle as string | null) || null,
    contextTitles,
    spaceNames,
    createdByName: (raw.createdByName as string | null) || null,
  }
}

function typeFilterCypher(): string {
  return `
    (
      $pulseType IS NULL
      OR $pulseType = ''
      OR ($pulseType = 'GoalPulse' AND pulse:GoalPulse)
      OR ($pulseType = 'ResourcePulse' AND pulse:ResourcePulse)
      OR ($pulseType = 'StoryPulse' AND pulse:StoryPulse)
      OR ($pulseType = 'CarePulse' AND pulse:CarePulse)
      OR ($pulseType = 'CoreValuePulse' AND pulse:CoreValuePulse)
      OR ($pulseType = 'FieldPulse' AND pulse:FieldPulse)
    )
  `
}

function pulseProjectionCypher(): string {
  return `
    pulse.id AS id,
    pulse.title AS title,
    pulse.content AS content,
    CASE
      WHEN pulse:GoalPulse THEN 'GoalPulse'
      WHEN pulse:ResourcePulse THEN 'ResourcePulse'
      WHEN pulse:StoryPulse THEN 'StoryPulse'
      WHEN pulse:CarePulse THEN 'CarePulse'
      WHEN pulse:CoreValuePulse THEN 'CoreValuePulse'
      ELSE 'FieldPulse'
    END AS type,
    pulse.status AS status,
    pulse.intensity AS intensity,
    pulse.horizon AS horizon,
    pulse.resourceType AS resourceType,
    pulse.availability AS availability,
    pulse.why AS why,
    pulse.location AS location,
    pulse.time AS time,
    toString(pulse.createdAt) AS createdAt,
    toString(pulse.updatedAt) AS updatedAt,
    CASE WHEN size(contextIds) = 0 THEN NULL ELSE contextIds[0] END AS contextId,
    CASE WHEN size(contextTitles) = 0 THEN NULL ELSE contextTitles[0] END AS contextTitle,
    contextTitles AS contextTitles,
    spaceNames AS spaceNames,
    coalesce(createdByA, createdByB) AS createdByName
  `
}

export async function searchPulses(
  graph: Neo4jGraph,
  input: PulseSearchInput
): Promise<PulseSearchResult> {
  const query = input.query?.trim()

  if (!query) {
    return {
      found: false,
      count: 0,
      pulses: [],
      needsDisambiguation: false,
      message: 'Please provide a pulse title or keyword to search for.',
    }
  }

  const contextId = input.contextId?.trim() || null
  const contextTitle = input.contextTitle?.trim() || null
  const pulseType = input.pulseType || null
  const limit = normalizeLimit(input.limit)
  const currentUserId = input.userId?.trim() || null

  // Fail closed: without an authenticated caller we never search pulses, so an
  // unauthenticated/spoofed request can't enumerate the graph.
  if (!currentUserId) {
    return {
      found: false,
      count: 0,
      pulses: [],
      needsDisambiguation: false,
      message: 'You need to be signed in to search pulses.',
    }
  }

  const cypher = `
    MATCH (pulse:FieldPulse)
    WHERE (
      toLower(coalesce(pulse.title, '')) CONTAINS toLower($query)
      OR toLower(coalesce(pulse.content, '')) CONTAINS toLower($query)
      OR toLower(coalesce(pulse.title, '')) STARTS WITH toLower($query)
    )
      AND ${viewablePulsePredicate('pulse', 'currentUserId')}
      AND (
        $contextId IS NULL
        OR EXISTS {
          MATCH (:FieldContext {id: $contextId})-[:HAS_PULSE]->(pulse)
        }
      )
      AND (
        $contextTitle IS NULL
        OR EXISTS {
          MATCH (contextFilter:FieldContext)-[:HAS_PULSE]->(pulse)
          WHERE toLower(coalesce(contextFilter.title, '')) CONTAINS toLower($contextTitle)
        }
      )
      AND ${typeFilterCypher()}
    OPTIONAL MATCH (context:FieldContext)-[:HAS_PULSE]->(pulse)
    OPTIONAL MATCH (space:Space)-[:HAS_CONTEXT]->(context)
    OPTIONAL MATCH (pulse)-[:CREATED_BY]->(creatorA:Person)
    OPTIONAL MATCH (pulse)-[:INITIATED_BY]->(creatorB:Person)
    WITH
      pulse,
      [id IN collect(DISTINCT context.id) WHERE id IS NOT NULL] AS contextIds,
      [title IN collect(DISTINCT context.title) WHERE title IS NOT NULL] AS contextTitles,
      [name IN collect(DISTINCT space.name) WHERE name IS NOT NULL] AS spaceNames,
      head([name IN collect(DISTINCT creatorA.name) WHERE name IS NOT NULL]) AS createdByA,
      head([name IN collect(DISTINCT creatorB.name) WHERE name IS NOT NULL]) AS createdByB
    RETURN ${pulseProjectionCypher()}
    ORDER BY
      CASE
        WHEN toLower(trim(coalesce(pulse.title, ''))) = toLower(trim($query)) THEN 0
        WHEN toLower(coalesce(pulse.title, '')) STARTS WITH toLower($query) THEN 1
        ELSE 2
      END,
      pulse.createdAt DESC
    LIMIT $limit
  `

  const raw = await graph.query<Record<string, unknown>>(cypher, {
    query,
    contextId,
    contextTitle,
    pulseType,
    limit,
    currentUserId,
  })

  const pulses = (raw || []).map(mapPulseRecord)

  if (pulses.length === 0) {
    return {
      found: false,
      count: 0,
      pulses: [],
      needsDisambiguation: false,
      message: `I could not find pulses matching "${query}".`,
    }
  }

  return {
    found: true,
    count: pulses.length,
    pulses,
    needsDisambiguation: pulses.length > 1,
    message:
      pulses.length === 1
        ? `I found pulse "${pulses[0].title}".`
        : `I found ${pulses.length} matching pulses. Please specify a pulse ID for updates.`,
  }
}

async function resolvePulseCandidates(
  graph: Neo4jGraph,
  input: UpdatePulseInput
): Promise<PulseRecord[]> {
  const pulseId = input.pulseId?.trim() || null
  const currentTitle = input.currentTitle?.trim() || null
  const contextId = input.contextId?.trim() || null

  if (!pulseId && !currentTitle) {
    return []
  }

  const cypher = pulseId
    ? `
      MATCH (pulse:FieldPulse {id: $pulseId})
      OPTIONAL MATCH (context:FieldContext)-[:HAS_PULSE]->(pulse)
      OPTIONAL MATCH (space:Space)-[:HAS_CONTEXT]->(context)
      OPTIONAL MATCH (pulse)-[:CREATED_BY]->(creatorA:Person)
      OPTIONAL MATCH (pulse)-[:INITIATED_BY]->(creatorB:Person)
      WITH
        pulse,
        [id IN collect(DISTINCT context.id) WHERE id IS NOT NULL] AS contextIds,
        [title IN collect(DISTINCT context.title) WHERE title IS NOT NULL] AS contextTitles,
        [name IN collect(DISTINCT space.name) WHERE name IS NOT NULL] AS spaceNames,
        head([name IN collect(DISTINCT creatorA.name) WHERE name IS NOT NULL]) AS createdByA,
        head([name IN collect(DISTINCT creatorB.name) WHERE name IS NOT NULL]) AS createdByB
      RETURN ${pulseProjectionCypher()}
      LIMIT 3
    `
    : `
      MATCH (pulse:FieldPulse)
      WHERE toLower(trim(coalesce(pulse.title, ''))) = toLower(trim($currentTitle))
        AND (
          $contextId IS NULL
          OR EXISTS {
            MATCH (:FieldContext {id: $contextId})-[:HAS_PULSE]->(pulse)
          }
        )
      OPTIONAL MATCH (context:FieldContext)-[:HAS_PULSE]->(pulse)
      OPTIONAL MATCH (space:Space)-[:HAS_CONTEXT]->(context)
      OPTIONAL MATCH (pulse)-[:CREATED_BY]->(creatorA:Person)
      OPTIONAL MATCH (pulse)-[:INITIATED_BY]->(creatorB:Person)
      WITH
        pulse,
        [id IN collect(DISTINCT context.id) WHERE id IS NOT NULL] AS contextIds,
        [title IN collect(DISTINCT context.title) WHERE title IS NOT NULL] AS contextTitles,
        [name IN collect(DISTINCT space.name) WHERE name IS NOT NULL] AS spaceNames,
        head([name IN collect(DISTINCT creatorA.name) WHERE name IS NOT NULL]) AS createdByA,
        head([name IN collect(DISTINCT creatorB.name) WHERE name IS NOT NULL]) AS createdByB
      RETURN ${pulseProjectionCypher()}
      ORDER BY pulse.createdAt DESC
      LIMIT 5
    `

  const raw = await graph.query<Record<string, unknown>>(cypher, {
    pulseId,
    currentTitle,
    contextId,
  })

  return (raw || []).map(mapPulseRecord)
}

function isFiniteNumber(value: number | undefined): boolean {
  return typeof value === 'number' && Number.isFinite(value)
}

export async function updatePulse(
  graph: Neo4jGraph,
  input: UpdatePulseInput
): Promise<UpdatePulseResult> {
  const changes = {
    newTitle: input.newTitle?.trim() || null,
    newContent: input.newContent?.trim() || null,
    newStatus: input.newStatus?.trim() || null,
    newIntensity: isFiniteNumber(input.newIntensity)
      ? input.newIntensity
      : null,
    newHorizon: input.newHorizon?.trim() || null,
    newResourceType: input.newResourceType?.trim() || null,
    newAvailability: isFiniteNumber(input.newAvailability)
      ? input.newAvailability
      : null,
    newWhy: input.newWhy?.trim() || null,
    newLocation: input.newLocation?.trim() || null,
    newTime: input.newTime?.trim() || null,
  }

  const hasAnyChange = Object.values(changes).some((value) => value !== null)
  if (!hasAnyChange) {
    return {
      success: false,
      message:
        'Please provide at least one update value (for example newTitle or newContent).',
    }
  }

  const candidates = await resolvePulseCandidates(graph, input)

  if (candidates.length === 0) {
    return {
      success: false,
      message:
        'I could not find the pulse to update. Provide pulseId or exact currentTitle.',
    }
  }

  if (candidates.length > 1) {
    return {
      success: false,
      requiresDisambiguation: true,
      message: 'Multiple pulses match. Please provide the pulse ID to update.',
      candidates,
    }
  }

  const target = candidates[0]

  const updateCypher = `
    MATCH (pulse:FieldPulse {id: $pulseId})
    SET pulse.updatedAt = datetime()
    FOREACH (_ IN CASE WHEN $newTitle IS NULL THEN [] ELSE [1] END |
      SET pulse.title = $newTitle
    )
    FOREACH (_ IN CASE WHEN $newContent IS NULL THEN [] ELSE [1] END |
      SET pulse.content = $newContent
    )
    FOREACH (_ IN CASE WHEN $newStatus IS NULL THEN [] ELSE [1] END |
      SET pulse.status = $newStatus
    )
    FOREACH (_ IN CASE WHEN $newIntensity IS NULL THEN [] ELSE [1] END |
      SET pulse.intensity = $newIntensity
    )
    FOREACH (_ IN CASE WHEN $newHorizon IS NULL THEN [] ELSE [1] END |
      SET pulse.horizon = $newHorizon
    )
    FOREACH (_ IN CASE WHEN $newResourceType IS NULL THEN [] ELSE [1] END |
      SET pulse.resourceType = $newResourceType
    )
    FOREACH (_ IN CASE WHEN $newAvailability IS NULL THEN [] ELSE [1] END |
      SET pulse.availability = $newAvailability
    )
    FOREACH (_ IN CASE WHEN $newWhy IS NULL THEN [] ELSE [1] END |
      SET pulse.why = $newWhy
    )
    FOREACH (_ IN CASE WHEN $newLocation IS NULL THEN [] ELSE [1] END |
      SET pulse.location = $newLocation
    )
    FOREACH (_ IN CASE WHEN $newTime IS NULL THEN [] ELSE [1] END |
      SET pulse.time = $newTime
    )
    WITH pulse
    OPTIONAL MATCH (context:FieldContext)-[:HAS_PULSE]->(pulse)
    OPTIONAL MATCH (space:Space)-[:HAS_CONTEXT]->(context)
    OPTIONAL MATCH (pulse)-[:CREATED_BY]->(creatorA:Person)
    OPTIONAL MATCH (pulse)-[:INITIATED_BY]->(creatorB:Person)
    WITH
      pulse,
      [id IN collect(DISTINCT context.id) WHERE id IS NOT NULL] AS contextIds,
      [title IN collect(DISTINCT context.title) WHERE title IS NOT NULL] AS contextTitles,
      [name IN collect(DISTINCT space.name) WHERE name IS NOT NULL] AS spaceNames,
      head([name IN collect(DISTINCT creatorA.name) WHERE name IS NOT NULL]) AS createdByA,
      head([name IN collect(DISTINCT creatorB.name) WHERE name IS NOT NULL]) AS createdByB
    RETURN ${pulseProjectionCypher()}
    LIMIT 1
  `

  const updatedRaw = await graph.query<Record<string, unknown>>(updateCypher, {
    pulseId: target.id,
    ...changes,
  })

  if (!updatedRaw || updatedRaw.length === 0) {
    return {
      success: false,
      message: 'Failed to update the pulse. Please try again.',
    }
  }

  const pulse = mapPulseRecord(updatedRaw[0])

  return {
    success: true,
    pulse,
    message: `Updated pulse "${target.title}" successfully.`,
  }
}

async function resolveContextCandidates(
  graph: Neo4jGraph,
  contextId?: string,
  contextTitle?: string
): Promise<Array<{ id: string; title: string }>> {
  const safeContextId = contextId?.trim() || null
  const safeContextTitle = contextTitle?.trim() || null

  if (!safeContextId && !safeContextTitle) {
    return []
  }

  const cypher = safeContextId
    ? `
      MATCH (context:FieldContext {id: $contextId})
      RETURN context.id AS id, context.title AS title
      LIMIT 3
    `
    : `
      MATCH (context:FieldContext)
      WHERE toLower(trim(coalesce(context.title, ''))) = toLower(trim($contextTitle))
         OR toLower(coalesce(context.title, '')) CONTAINS toLower($contextTitle)
      RETURN context.id AS id, context.title AS title
      ORDER BY context.title ASC
      LIMIT 5
    `

  const rows = await graph.query<Record<string, unknown>>(cypher, {
    contextId: safeContextId,
    contextTitle: safeContextTitle,
  })

  return (rows || []).map((row) => ({
    id: String(row.id || ''),
    title: String(row.title || ''),
  }))
}

export async function linkPulseToContext(
  graph: Neo4jGraph,
  input: PulseContextLinkInput
): Promise<PulseContextLinkResult> {
  const pulseId = input.pulseId?.trim()

  if (!pulseId) {
    return {
      success: false,
      message: 'pulseId is required.',
    }
  }

  const contextCandidates = await resolveContextCandidates(
    graph,
    input.contextId,
    input.contextTitle
  )

  if (contextCandidates.length === 0) {
    return {
      success: false,
      message:
        'I could not find the target field context. Provide contextId or exact contextTitle.',
    }
  }

  if (contextCandidates.length > 1) {
    return {
      success: false,
      requiresDisambiguation: true,
      message: 'Multiple field contexts match. Please provide contextId.',
      candidates: contextCandidates,
    }
  }

  const [context] = contextCandidates

  const cypher = `
    MATCH (pulse:FieldPulse {id: $pulseId})
    MATCH (context:FieldContext {id: $contextId})
    OPTIONAL MATCH (context)-[existing:HAS_PULSE]->(pulse)
    WITH pulse, context, existing IS NOT NULL AS alreadyLinked
    MERGE (context)-[:HAS_PULSE]->(pulse)
    RETURN alreadyLinked AS alreadyLinked
  `

  const rows = await graph.query<Record<string, unknown>>(cypher, {
    pulseId,
    contextId: context.id,
  })

  if (!rows || rows.length === 0) {
    return {
      success: false,
      message: 'Failed to link the pulse to the field context.',
    }
  }

  const alreadyLinked = Boolean(rows[0].alreadyLinked)

  return {
    success: true,
    pulseId,
    contextId: context.id,
    contextTitle: context.title,
    message: alreadyLinked
      ? `Pulse is already linked to "${context.title}".`
      : `Linked pulse to "${context.title}" successfully.`,
  }
}

export async function unlinkPulseFromContext(
  graph: Neo4jGraph,
  input: PulseContextLinkInput
): Promise<PulseContextLinkResult> {
  const pulseId = input.pulseId?.trim()

  if (!pulseId) {
    return {
      success: false,
      message: 'pulseId is required.',
    }
  }

  const contextCandidates = await resolveContextCandidates(
    graph,
    input.contextId,
    input.contextTitle
  )

  if (contextCandidates.length === 0) {
    return {
      success: false,
      message:
        'I could not find the field context to unlink from. Provide contextId or exact contextTitle.',
    }
  }

  if (contextCandidates.length > 1) {
    return {
      success: false,
      requiresDisambiguation: true,
      message: 'Multiple field contexts match. Please provide contextId.',
      candidates: contextCandidates,
    }
  }

  const [context] = contextCandidates

  const cypher = `
    MATCH (context:FieldContext {id: $contextId})-[rel:HAS_PULSE]->(pulse:FieldPulse {id: $pulseId})
    DELETE rel
    RETURN count(rel) AS deleted
  `

  const rows = await graph.query<Record<string, unknown>>(cypher, {
    pulseId,
    contextId: context.id,
  })

  const deleted = Number(rows?.[0]?.deleted || 0)

  if (deleted === 0) {
    return {
      success: false,
      pulseId,
      contextId: context.id,
      contextTitle: context.title,
      message: `No HAS_PULSE link existed between the pulse and "${context.title}".`,
    }
  }

  return {
    success: true,
    pulseId,
    contextId: context.id,
    contextTitle: context.title,
    message: `Removed pulse from "${context.title}" successfully.`,
  }
}
