import { Neo4jGraph } from '@langchain/community/graphs/neo4j_graph'
import { Embeddings } from '@langchain/core/embeddings'

export type GraphRagScope = 'people' | 'pulses' | 'all'

export interface GraphRagSearchInput {
  query: string
  scope?: GraphRagScope
  contextId?: string
  limit?: number
}

export interface GraphRagMatch {
  entityType: 'person' | 'pulse'
  id: string
  title: string
  score: number
  snippet?: string | null
  metadata: Record<string, unknown>
}

export interface GraphRagSearchResult {
  success: boolean
  query: string
  scope: GraphRagScope
  count: number
  peopleMatches: GraphRagMatch[]
  pulseMatches: GraphRagMatch[]
  combinedMatches: GraphRagMatch[]
  warnings: string[]
  message: string
}

function normalizeLimit(limit?: number): number {
  if (!limit || !Number.isFinite(limit)) return 6
  return Math.max(1, Math.min(20, Math.floor(limit)))
}

function mapMatch(row: Record<string, unknown>): GraphRagMatch {
  return {
    entityType: (row.entityType as 'person' | 'pulse') || 'person',
    id: String(row.id || ''),
    title: String(row.title || ''),
    score: Number(row.score || 0),
    snippet: (row.snippet as string | null) || null,
    metadata: (row.metadata as Record<string, unknown>) || {},
  }
}

async function searchPeopleByVector(
  graph: Neo4jGraph,
  embedding: number[],
  limit: number
): Promise<GraphRagMatch[]> {
  const cypher = `
    CALL db.index.vector.queryNodes('personBioVectorIndex', $limit, $embedding)
    YIELD node, score
    WHERE node:Person
    OPTIONAL MATCH (node)-[:OWNS]->(space:Space)
    OPTIONAL MATCH (node)-[:BELONGS_TO]->(community:Community)
    WITH
      node,
      score,
      [name IN collect(DISTINCT space.name) WHERE name IS NOT NULL][0..3] AS ownedSpaces,
      [name IN collect(DISTINCT community.name) WHERE name IS NOT NULL][0..3] AS communities
    RETURN
      'person' AS entityType,
      node.id AS id,
      coalesce(node.name, trim(coalesce(node.firstName, '') + ' ' + coalesce(node.lastName, ''))) AS title,
      coalesce(node.passions, node.traits, node.interests, node.fieldsOfCare, '') AS snippet,
      score,
      {
        firstName: node.firstName,
        lastName: node.lastName,
        email: node.email,
        passions: node.passions,
        traits: node.traits,
        interests: node.interests,
        fieldsOfCare: node.fieldsOfCare,
        communities: communities,
        ownedSpaces: ownedSpaces
      } AS metadata
    ORDER BY score DESC
    LIMIT $limit
  `

  const rows = await graph.query<Record<string, unknown>>(cypher, {
    embedding,
    limit,
  })

  return (rows || []).map(mapMatch)
}

async function searchPulsesByVector(
  graph: Neo4jGraph,
  embedding: number[],
  limit: number,
  contextId?: string
): Promise<GraphRagMatch[]> {
  const cypher = `
    CALL db.index.vector.queryNodes('pulseContentVectorIndex', $limit, $embedding)
    YIELD node, score
    WHERE node:FieldPulse
      AND (
        $contextId IS NULL
        OR EXISTS {
          MATCH (:FieldContext {id: $contextId})-[:HAS_PULSE]->(node)
        }
      )
    OPTIONAL MATCH (context:FieldContext)-[:HAS_PULSE]->(node)
    OPTIONAL MATCH (space:Space)-[:HAS_CONTEXT]->(context)
    OPTIONAL MATCH (node)-[:CREATED_BY]->(creatorA:Person)
    OPTIONAL MATCH (node)-[:INITIATED_BY]->(creatorB:Person)
    WITH
      node,
      score,
      [id IN collect(DISTINCT context.id) WHERE id IS NOT NULL][0..5] AS contextIds,
      [title IN collect(DISTINCT context.title) WHERE title IS NOT NULL][0..5] AS contextTitles,
      [name IN collect(DISTINCT space.name) WHERE name IS NOT NULL][0..5] AS spaceNames,
      head([name IN collect(DISTINCT creatorA.name) WHERE name IS NOT NULL]) AS createdByA,
      head([name IN collect(DISTINCT creatorB.name) WHERE name IS NOT NULL]) AS createdByB
    RETURN
      'pulse' AS entityType,
      node.id AS id,
      coalesce(node.title, 'Untitled Pulse') AS title,
      node.content AS snippet,
      score,
      {
        pulseType: CASE
          WHEN node:GoalPulse THEN 'GoalPulse'
          WHEN node:ResourcePulse THEN 'ResourcePulse'
          WHEN node:StoryPulse THEN 'StoryPulse'
          WHEN node:CarePulse THEN 'CarePulse'
          WHEN node:CoreValuePulse THEN 'CoreValuePulse'
          ELSE 'FieldPulse'
        END,
        status: node.status,
        horizon: node.horizon,
        resourceType: node.resourceType,
        intensity: node.intensity,
        contextIds: contextIds,
        contextTitles: contextTitles,
        spaces: spaceNames,
        createdBy: coalesce(createdByA, createdByB)
      } AS metadata
    ORDER BY score DESC
    LIMIT $limit
  `

  const rows = await graph.query<Record<string, unknown>>(cypher, {
    embedding,
    limit,
    contextId: contextId?.trim() || null,
  })

  return (rows || []).map(mapMatch)
}

function buildResultMessage(
  query: string,
  peopleCount: number,
  pulseCount: number,
  warnings: string[]
): string {
  const chunks = [
    `Graph RAG retrieval for "${query}" found ${peopleCount} people match(es) and ${pulseCount} pulse match(es).`,
  ]

  if (warnings.length > 0) {
    chunks.push(`Warnings: ${warnings.join(' | ')}`)
  }

  return chunks.join(' ')
}

export async function graphRagSearch(
  graph: Neo4jGraph,
  embeddings: Embeddings,
  input: GraphRagSearchInput
): Promise<GraphRagSearchResult> {
  const query = input.query?.trim()

  if (!query) {
    return {
      success: false,
      query: '',
      scope: input.scope || 'all',
      count: 0,
      peopleMatches: [],
      pulseMatches: [],
      combinedMatches: [],
      warnings: [],
      message: 'Please provide a query for Graph RAG retrieval.',
    }
  }

  const scope = input.scope || 'all'
  const limit = normalizeLimit(input.limit)
  const warnings: string[] = []

  const embedding = await embeddings.embedQuery(query)

  let peopleMatches: GraphRagMatch[] = []
  let pulseMatches: GraphRagMatch[] = []

  if (scope === 'all' || scope === 'people') {
    try {
      peopleMatches = await searchPeopleByVector(graph, embedding, limit)
    } catch (error) {
      warnings.push(
        `People vector search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  if (scope === 'all' || scope === 'pulses') {
    try {
      pulseMatches = await searchPulsesByVector(
        graph,
        embedding,
        limit,
        input.contextId
      )
    } catch (error) {
      warnings.push(
        `Pulse vector search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  const combinedMatches = [...peopleMatches, ...pulseMatches]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit * 2)

  return {
    success: combinedMatches.length > 0,
    query,
    scope,
    count: combinedMatches.length,
    peopleMatches,
    pulseMatches,
    combinedMatches,
    warnings,
    message: buildResultMessage(
      query,
      peopleMatches.length,
      pulseMatches.length,
      warnings
    ),
  }
}
