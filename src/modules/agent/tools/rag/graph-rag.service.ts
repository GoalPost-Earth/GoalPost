/**
 * Graph RAG retrieval — semantic search across people, pulses, and
 * conversation chunks, enriched with graph relationships.
 *
 * Vector-index role separation (`scripts/init-db.js` defines all three at
 * 1536-dim cosine):
 *
 *   personBioVectorIndex          — Person.embedding, for person similarity.
 *                                   Source for `searchPeopleByVector`.
 *   pulseContentVectorIndex       — FieldPulse.embedding, for pulse-level
 *                                   semantic match. Source for
 *                                   `searchPulsesByVector` and the
 *                                   resonance-discovery cron (cosine is
 *                                   only the candidate-pick step there;
 *                                   the *why* now comes from graph
 *                                   traversal via
 *                                   `evidence-collector.ts`).
 *   conversationChunkVectorIndex  — ConversationChunk.embedding, for
 *                                   chunk-level recall ("what was said in
 *                                   that earlier moment?"). Source for
 *                                   `searchChunksByVector` — Robert's
 *                                   "graph semantics over vectors" line
 *                                   keeps chunks for language-translation
 *                                   retrieval, not as the primary matcher.
 *
 * The active chat surface (`/api/chat/simulation`) hits this module via
 * the `graph_rag_search` tool. The legacy `src/modules/agent/vector.store.ts`
 * Neo4jVectorStore wrapper is superseded by `searchPeopleByVector` here
 * and stays only because the deprecated agent path
 * (`src/modules/agent/agent.ts` → `chatbot-resolvers.ts`) still imports it.
 */

import { Neo4jGraph } from '@langchain/community/graphs/neo4j_graph'
import { Embeddings } from '@langchain/core/embeddings'
import { viewablePulsePredicate } from '@/lib/permissions/pulse-visibility'

export type GraphRagScope = 'people' | 'pulses' | 'chunks' | 'all'

export interface GraphRagSearchInput {
  query: string
  scope?: GraphRagScope
  contextId?: string
  limit?: number
  /**
   * Authenticated user id. REQUIRED to retrieve ConversationChunks — chunks
   * represent the user's private back-and-forth with the AI assistant and
   * must only be searchable by the user who created the parent pulse.
   * If omitted, chunk results are returned empty with a warning.
   */
  userId?: string | null
}

export interface GraphRagMatch {
  entityType: 'person' | 'pulse' | 'chunk'
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
  chunkMatches: GraphRagMatch[]
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

// GOAL-275: this raw-Cypher path bypasses Person's field-level
// @authorization, and the vector index spans every Person — including
// PersonPulses that live in other users' private Spaces (the embedding
// sweep enrolls all of them). Person *discovery* is open by design, so
// similarity ranking over all people is fine, but the projection must be
// directory-safe only (id / name / photo / open community names). Never
// return email, passions, traits, interests, fieldsOfCare, descriptions,
// or Space names here — that hands gated scalars cross-Space to any
// authenticated chat user.
async function searchPeopleByVector(
  graph: Neo4jGraph,
  embedding: number[],
  limit: number
): Promise<GraphRagMatch[]> {
  const cypher = `
    CALL db.index.vector.queryNodes('personBioVectorIndex', $limit, $embedding)
    YIELD node, score
    WHERE node:Person
    OPTIONAL MATCH (node)-[:BELONGS_TO]->(community:Community)
    WITH
      node,
      score,
      [name IN collect(DISTINCT community.name) WHERE name IS NOT NULL][0..3] AS communities
    RETURN
      'person' AS entityType,
      node.id AS id,
      coalesce(node.name, trim(coalesce(node.firstName, '') + ' ' + coalesce(node.lastName, ''))) AS title,
      NULL AS snippet,
      score,
      {
        firstName: node.firstName,
        lastName: node.lastName,
        photo: node.photo,
        communities: communities
      } AS metadata
    ORDER BY score DESC
    LIMIT toInteger($limit)
  `

  const rows = await graph.query<Record<string, unknown>>(cypher, {
    embedding,
    limit,
  })

  return (rows || []).map(mapMatch)
}

/**
 * Chunk-level recall via `conversationChunkVectorIndex`. Used when the
 * user asks the agent to find a specific *moment* from a past pulse's
 * source conversation rather than the pulse as a whole.
 *
 * ConversationChunks are the user's private back-and-forth with the AI
 * assistant during pulse creation. They MUST stay locked to the user
 * who created the parent pulse — even WeSpace co-members do not get to
 * search someone else's chunks. The `MATCH ... -[:CREATED_BY|INITIATED_BY]->
 * (:Person {id: $userId})` clause enforces this server-side, regardless
 * of what the model decides to do in the chat surface.
 *
 * INVARIANT this gate leans on: doc-ingest attribution can point a pulse's
 * INITIATED_BY at an extracted person instead of the acting user
 * (`createPulseAuthorized` in src/lib/chat/hitl.ts), but ingest-created
 * pulses never carry HAS_CHUNK, so INITIATED_BY still equals "chunk owner"
 * for every pulse that has chunks. If attribution ever extends to
 * chat-created pulses (which DO carry chunks), this MATCH must be re-gated
 * on the acting user (e.g. via the Log CREATED_BY edge) or an attributed
 * User could search the uploader's private conversation, and the uploader
 * would lose recall of their own.
 *
 * Returns the matching chunk plus enough metadata to navigate back to
 * the parent pulse without exposing raw IDs in user-facing output (per
 * kb/07-ai-assistant-ux.md Rule 1 — the model gets the parent pulse's
 * title here, never just the chunk id).
 */
async function searchChunksByVector(
  graph: Neo4jGraph,
  embedding: number[],
  limit: number,
  userId: string,
  contextId?: string
): Promise<GraphRagMatch[]> {
  const cypher = `
    CALL db.index.vector.queryNodes('conversationChunkVectorIndex', $limit, $embedding)
    YIELD node, score
    MATCH (pulse:FieldPulse)-[:HAS_CHUNK]->(node)
    MATCH (pulse)-[:CREATED_BY|INITIATED_BY]->(:Person {id: $userId})
    WHERE
      // This gate is authorship-based, not Space-reachability-based, so a
      // soft-deleted pulse (GOAL-319) would otherwise still surface its
      // conversation chunks here. Exclude by stamp.
      pulse.deletedAt IS NULL
      AND (
        $contextId IS NULL
        OR EXISTS {
          MATCH (:FieldContext {id: $contextId})-[:HAS_PULSE]->(pulse)
        }
      )
    OPTIONAL MATCH (context:FieldContext)-[:HAS_PULSE]->(pulse)
    WITH
      node, pulse, score,
      head([title IN collect(DISTINCT context.title) WHERE title IS NOT NULL]) AS contextTitle,
      head([id IN collect(DISTINCT context.id) WHERE id IS NOT NULL]) AS contextId
    RETURN
      'chunk' AS entityType,
      node.id AS id,
      coalesce(pulse.title, 'Untitled Pulse') AS title,
      node.content AS snippet,
      score,
      {
        pulseId: pulse.id,
        pulseTitle: pulse.title,
        contextId: contextId,
        contextTitle: contextTitle,
        role: node.role,
        order: node.order
      } AS metadata
    ORDER BY score DESC
    LIMIT toInteger($limit)
  `

  const rows = await graph.query<Record<string, unknown>>(cypher, {
    embedding,
    limit,
    contextId: contextId?.trim() || null,
    userId,
  })

  return (rows || []).map(mapMatch)
}

async function searchPulsesByVector(
  graph: Neo4jGraph,
  embedding: number[],
  limit: number,
  userId: string,
  contextId?: string
): Promise<GraphRagMatch[]> {
  // The vector index returns its top-K by similarity, and the Space-scope
  // predicate then prunes that set — so asking the index for exactly `limit`
  // would under-return (often zero) whenever a caller's nearest neighbours are
  // other tenants' pulses. Over-fetch from the index, filter, then re-LIMIT.
  const topK = Math.min(Math.max(limit * 10, limit), 500)
  const cypher = `
    CALL db.index.vector.queryNodes('pulseContentVectorIndex', $topK, $embedding)
    YIELD node, score
    WHERE node:FieldPulse
      // Space-scope: only pulses the caller can view (raw Cypher bypasses the
      // GraphQL @authorization filter).
      AND ${viewablePulsePredicate('node', 'currentUserId')}
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
    LIMIT toInteger($limit)
  `

  const rows = await graph.query<Record<string, unknown>>(cypher, {
    embedding,
    limit,
    topK,
    contextId: contextId?.trim() || null,
    currentUserId: userId,
  })

  return (rows || []).map(mapMatch)
}

function buildResultMessage(
  query: string,
  peopleCount: number,
  pulseCount: number,
  chunkCount: number,
  warnings: string[]
): string {
  const parts = [
    `Graph RAG retrieval for "${query}" found ${peopleCount} people match(es), ${pulseCount} pulse match(es), and ${chunkCount} conversation chunk match(es).`,
  ]

  if (warnings.length > 0) {
    parts.push(`Warnings: ${warnings.join(' | ')}`)
  }

  return parts.join(' ')
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
      chunkMatches: [],
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
  let chunkMatches: GraphRagMatch[] = []

  if (scope === 'all' || scope === 'people') {
    try {
      peopleMatches = await searchPeopleByVector(graph, embedding, limit)
    } catch (error) {
      // Keep the raw error (Neo4j/Cypher internals like "LIMIT: Invalid input.
      // '25.0' ...") in the server log ONLY. This warning is folded into the
      // human-facing `message`, so it must stay member-safe — the model must
      // never receive raw technical error text to paraphrase (kb/07 Rule 1).
      console.error('[graph_rag_search] people vector search failed', error)
      warnings.push('Some people matches were unavailable for this search.')
    }
  }

  if (scope === 'all' || scope === 'pulses') {
    // Pulses are Space-scoped: without an authenticated userId we cannot filter
    // to the caller's viewable Spaces, so skip rather than leak every pulse.
    if (!input.userId) {
      warnings.push(
        'Pulse vector search skipped: pulses are visible only to people with access to their Space and require an authenticated session.'
      )
    } else {
      try {
        pulseMatches = await searchPulsesByVector(
          graph,
          embedding,
          limit,
          input.userId,
          input.contextId
        )
      } catch (error) {
        // Raw error stays server-side only (see note above) — this is the exact
        // path that can throw the "LIMIT: Invalid input. '25.0' ..." string.
        console.error('[graph_rag_search] pulse vector search failed', error)
        warnings.push('Some pulse matches were unavailable for this search.')
      }
    }
  }

  if (scope === 'all' || scope === 'chunks') {
    // ConversationChunks contain the user's private back-and-forth with
    // the AI assistant during pulse creation. Without an authenticated
    // userId we cannot scope to "only this user's chunks", so refuse —
    // never return cross-user chunks. The `all` scope still returns
    // people/pulses; only the chunks branch is skipped.
    if (!input.userId) {
      warnings.push(
        'Chunk vector search skipped: conversation chunks are private to the user who created the parent pulse and require an authenticated session.'
      )
    } else {
      try {
        chunkMatches = await searchChunksByVector(
          graph,
          embedding,
          limit,
          input.userId,
          input.contextId
        )
      } catch (error) {
        // Raw error stays server-side only (see note above).
        console.error('[graph_rag_search] chunk vector search failed', error)
        warnings.push(
          'Some conversation matches were unavailable for this search.'
        )
      }
    }
  }

  const combinedMatches = [...peopleMatches, ...pulseMatches, ...chunkMatches]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit * 3)

  return {
    success: combinedMatches.length > 0,
    query,
    scope,
    count: combinedMatches.length,
    peopleMatches,
    pulseMatches,
    chunkMatches,
    combinedMatches,
    warnings,
    message: buildResultMessage(
      query,
      peopleMatches.length,
      pulseMatches.length,
      chunkMatches.length,
      warnings
    ),
  }
}
