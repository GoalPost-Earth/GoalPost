import { Neo4jGraph } from '@langchain/community/graphs/neo4j_graph'

export interface FieldContextRecord {
  id: string
  title: string
  emergentName?: string | null
  createdAt?: string | null
  pulseCount: number
  spaceId?: string | null
  spaceName?: string | null
  spaceVisibility?: string | null
  spaceType?: 'MeSpace' | 'WeSpace' | 'Space'
}

export interface FieldContextSearchInput {
  query: string
  /**
   * The authenticated caller's Person id (from the request JWT). REQUIRED for
   * authorization: results are anchored to FieldContexts whose parent Space the
   * user OWNS or is a MEMBER of, mirroring `canViewContent` in
   * `src/lib/permissions/space-permissions.ts`. When `null`/absent (e.g. the
   * legacy agent path that carries no user identity) the search fails closed and
   * returns no results rather than leaking cross-tenant FieldContexts.
   */
  userId?: string | null
  spaceName?: string
  spaceId?: string
  limit?: number
}

export interface FieldContextSearchResult {
  found: boolean
  count: number
  contexts: FieldContextRecord[]
  needsDisambiguation: boolean
  message: string
}

export interface UpdateFieldContextInput {
  contextId?: string
  currentTitle?: string
  spaceName?: string
  newTitle?: string
  newEmergentName?: string
}

export interface UpdateFieldContextResult {
  success: boolean
  requiresDisambiguation?: boolean
  message: string
  context?: FieldContextRecord
  candidates?: FieldContextRecord[]
}

function normalizeLimit(limit?: number): number {
  if (!limit || !Number.isFinite(limit)) return 10
  return Math.max(1, Math.min(25, Math.floor(limit)))
}

function toSpaceType(
  labels: string[] | null | undefined
): 'MeSpace' | 'WeSpace' | 'Space' {
  if (!labels || labels.length === 0) return 'Space'
  if (labels.includes('MeSpace')) return 'MeSpace'
  if (labels.includes('WeSpace')) return 'WeSpace'
  return 'Space'
}

function asFieldContextRecord(
  raw: Record<string, unknown>
): FieldContextRecord {
  return {
    id: String(raw.id || ''),
    title: String(raw.title || ''),
    emergentName: (raw.emergentName as string | null) || null,
    createdAt: (raw.createdAt as string | null) || null,
    pulseCount: Number(raw.pulseCount || 0),
    spaceId: (raw.spaceId as string | null) || null,
    spaceName: (raw.spaceName as string | null) || null,
    spaceVisibility: (raw.spaceVisibility as string | null) || null,
    spaceType: toSpaceType((raw.spaceLabels as string[] | undefined) || []),
  }
}

export async function searchFieldContexts(
  graph: Neo4jGraph,
  input: FieldContextSearchInput
): Promise<FieldContextSearchResult> {
  const query = input.query?.trim()

  if (!query) {
    return {
      found: false,
      count: 0,
      contexts: [],
      needsDisambiguation: false,
      message: 'Please provide a field context title or keyword to search for.',
    }
  }

  // Fail closed: without an authenticated user we cannot scope results to the
  // caller's Spaces, so we must NOT run a graph-wide FieldContext search (that
  // would leak cross-tenant MeSpace/WeSpace metadata — GOAL-273). The legacy
  // agent path (src/modules/agent/tools/index.ts) carries no user identity and
  // hits this branch.
  const userId = input.userId?.trim() || null
  if (!userId) {
    return {
      found: false,
      count: 0,
      contexts: [],
      needsDisambiguation: false,
      message:
        'I could not identify the current user, so I cannot search field contexts. Please sign in and try again.',
    }
  }

  const limit = normalizeLimit(input.limit)
  const spaceName = input.spaceName?.trim() || null
  const spaceId = input.spaceId?.trim() || null

  // The space scope is the PRIMARY authorization guarantee. We only ever match
  // FieldContexts whose parent Space the user OWNS or is a MEMBER of, mirroring
  // `canViewContent` in src/lib/permissions/space-permissions.ts
  // (OWNS, or HAS_MEMBER -> SpaceMembership -> IS_MEMBER -> user). This filter
  // applies even when $spaceId / $spaceName are null, so the name-only path is
  // also safe.
  const cypher = `
    MATCH (user:Person {id: $userId})
    MATCH (space:Space)-[:HAS_CONTEXT]->(context:FieldContext)
    WHERE (
        EXISTS { MATCH (user)-[:OWNS]->(space) }
        OR EXISTS {
          MATCH (space)-[:HAS_MEMBER]->(:SpaceMembership)-[:IS_MEMBER]->(user)
        }
      )
      AND (
        toLower(coalesce(context.title, '')) CONTAINS toLower($query)
        OR toLower(coalesce(context.emergentName, '')) CONTAINS toLower($query)
        OR toLower(coalesce(context.title, '')) STARTS WITH toLower($query)
        OR toLower(coalesce(context.emergentName, '')) STARTS WITH toLower($query)
      )
      AND (
        $spaceName IS NULL
        OR toLower(coalesce(space.name, '')) CONTAINS toLower($spaceName)
      )
      AND (
        $spaceId IS NULL
        OR space.id = $spaceId
      )
    WITH DISTINCT context, space
    OPTIONAL MATCH (context)-[:HAS_PULSE]->(pulse:FieldPulse)
    RETURN
      context.id AS id,
      context.title AS title,
      context.emergentName AS emergentName,
      toString(context.createdAt) AS createdAt,
      count(DISTINCT pulse) AS pulseCount,
      space.id AS spaceId,
      space.name AS spaceName,
      space.visibility AS spaceVisibility,
      labels(space) AS spaceLabels
    ORDER BY
      CASE
        WHEN toLower(trim(coalesce(context.title, ''))) = toLower(trim($query)) THEN 0
        WHEN toLower(trim(coalesce(context.emergentName, ''))) = toLower(trim($query)) THEN 1
        WHEN toLower(coalesce(context.title, '')) STARTS WITH toLower($query) THEN 2
        ELSE 3
      END,
      context.title ASC
    LIMIT toInteger($limit)
  `

  const rawResults = await graph.query<Record<string, unknown>>(cypher, {
    userId,
    query,
    spaceName,
    spaceId,
    limit,
  })

  const contexts = (rawResults || []).map(asFieldContextRecord)

  if (contexts.length === 0) {
    return {
      found: false,
      count: 0,
      contexts: [],
      needsDisambiguation: false,
      message: `I could not find a field context matching "${query}".`,
    }
  }

  if (contexts.length === 1) {
    const [context] = contexts
    return {
      found: true,
      count: 1,
      contexts,
      needsDisambiguation: false,
      message: `I found "${context.title}"${context.spaceName ? ` in ${context.spaceName}` : ''}.`,
    }
  }

  return {
    found: true,
    count: contexts.length,
    contexts,
    needsDisambiguation: true,
    message: `I found ${contexts.length} matching field contexts. Please specify which one to use by ID or exact title.`,
  }
}

async function resolveFieldContextCandidates(
  graph: Neo4jGraph,
  input: UpdateFieldContextInput
): Promise<FieldContextRecord[]> {
  const contextId = input.contextId?.trim() || null
  const currentTitle = input.currentTitle?.trim() || null
  const spaceName = input.spaceName?.trim() || null

  if (!contextId && !currentTitle) {
    return []
  }

  const cypher = contextId
    ? `
      MATCH (context:FieldContext {id: $contextId})
      OPTIONAL MATCH (space:Space)-[:HAS_CONTEXT]->(context)
      WITH DISTINCT context, space
      OPTIONAL MATCH (context)-[:HAS_PULSE]->(pulse:FieldPulse)
      RETURN
        context.id AS id,
        context.title AS title,
        context.emergentName AS emergentName,
        toString(context.createdAt) AS createdAt,
        count(DISTINCT pulse) AS pulseCount,
        space.id AS spaceId,
        space.name AS spaceName,
        space.visibility AS spaceVisibility,
        labels(space) AS spaceLabels
      LIMIT 3
    `
    : `
      MATCH (context:FieldContext)
      OPTIONAL MATCH (space:Space)-[:HAS_CONTEXT]->(context)
      WHERE (
        toLower(trim(coalesce(context.title, ''))) = toLower(trim($currentTitle))
        OR toLower(trim(coalesce(context.emergentName, ''))) = toLower(trim($currentTitle))
      )
      AND (
        $spaceName IS NULL
        OR toLower(coalesce(space.name, '')) CONTAINS toLower($spaceName)
      )
      WITH DISTINCT context, space
      OPTIONAL MATCH (context)-[:HAS_PULSE]->(pulse:FieldPulse)
      RETURN
        context.id AS id,
        context.title AS title,
        context.emergentName AS emergentName,
        toString(context.createdAt) AS createdAt,
        count(DISTINCT pulse) AS pulseCount,
        space.id AS spaceId,
        space.name AS spaceName,
        space.visibility AS spaceVisibility,
        labels(space) AS spaceLabels
      ORDER BY context.title ASC
      LIMIT 5
    `

  const raw = await graph.query<Record<string, unknown>>(cypher, {
    contextId,
    currentTitle,
    spaceName,
  })

  return (raw || []).map(asFieldContextRecord)
}

export async function updateFieldContext(
  graph: Neo4jGraph,
  input: UpdateFieldContextInput
): Promise<UpdateFieldContextResult> {
  const newTitle = input.newTitle?.trim() || null
  const newEmergentName = input.newEmergentName?.trim() || null

  if (!newTitle && !newEmergentName) {
    return {
      success: false,
      message:
        'Please provide at least one update value (newTitle or newEmergentName).',
    }
  }

  const candidates = await resolveFieldContextCandidates(graph, input)

  if (candidates.length === 0) {
    return {
      success: false,
      message:
        'I could not find the field context to update. Provide a context ID or exact current title.',
    }
  }

  if (candidates.length > 1) {
    return {
      success: false,
      requiresDisambiguation: true,
      message:
        'Multiple field contexts match your request. Please specify the context ID.',
      candidates,
    }
  }

  const target = candidates[0]

  if (
    newTitle &&
    target.title.trim().toLowerCase() === newTitle.trim().toLowerCase()
  ) {
    return {
      success: false,
      message:
        'The new title matches the current title. Please provide a different title.',
    }
  }

  const updateCypher = `
    MATCH (context:FieldContext {id: $contextId})
    SET context.updatedAt = datetime()
    FOREACH (_ IN CASE WHEN $newTitle IS NULL THEN [] ELSE [1] END |
      SET context.title = $newTitle
    )
    FOREACH (_ IN CASE WHEN $newEmergentName IS NULL THEN [] ELSE [1] END |
      SET context.emergentName = $newEmergentName
    )
    WITH context
    OPTIONAL MATCH (space:Space)-[:HAS_CONTEXT]->(context)
    WITH DISTINCT context, space
    OPTIONAL MATCH (context)-[:HAS_PULSE]->(pulse:FieldPulse)
    RETURN
      context.id AS id,
      context.title AS title,
      context.emergentName AS emergentName,
      toString(context.createdAt) AS createdAt,
      count(DISTINCT pulse) AS pulseCount,
      space.id AS spaceId,
      space.name AS spaceName,
      space.visibility AS spaceVisibility,
      labels(space) AS spaceLabels
    LIMIT 1
  `

  const updatedRaw = await graph.query<Record<string, unknown>>(updateCypher, {
    contextId: target.id,
    newTitle,
    newEmergentName,
  })

  if (!updatedRaw || updatedRaw.length === 0) {
    return {
      success: false,
      message: 'Failed to update the field context. Please try again.',
    }
  }

  const context = asFieldContextRecord(updatedRaw[0])

  return {
    success: true,
    context,
    message: `Updated field context "${target.title}" to "${context.title}" successfully.`,
  }
}
