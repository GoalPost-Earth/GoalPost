/**
 * Semantic search API for pulses and conversation chunks
 * POST /api/resonance/search
 *
 * Searches for semantically similar pulses, chunks, or resonances
 * using vector similarity and returns ranked results
 */

import { NextRequest, NextResponse } from 'next/server'
import { getEmbeddingsProvider } from '@/lib/llm'
import { initGraph } from '@/modules/graph'

interface SearchRequest {
  query: string
  searchType: 'pulses' | 'chunks' | 'resonances' | 'all'
  limit?: number
  minSimilarity?: number
  contextId?: string // Optional: limit search to specific context
  spaceId?: string // Optional: limit search to specific space
}

interface PulseResult {
  id: string
  content: string
  type: string
  createdAt: string
  similarity: number
  initiator: {
    id: string
    name: string
  }
  context?: {
    id: string
    title: string
  }
}

interface ChunkResult {
  id: string
  content: string
  role: string
  order: number
  similarity: number
  pulseId: string
  pulseContent: string
}

interface ResonanceResult {
  id: string
  label: string
  description: string
  linkCount: number
  avgConfidence: number
  relatedPulses: string[]
}

interface SearchResponse {
  success: boolean
  query: string
  results: {
    pulses?: PulseResult[]
    chunks?: ChunkResult[]
    resonances?: ResonanceResult[]
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: SearchRequest = await request.json()

    const {
      query,
      searchType,
      limit = 10,
      minSimilarity = 0.7,
      contextId,
      spaceId,
    } = body

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      )
    }

    // Generate query embedding
    const embeddingsProvider = getEmbeddingsProvider()
    const embeddings = await embeddingsProvider.embed([query])
    const queryEmbedding = embeddings[0]

    const graph = await initGraph()
    const results: SearchResponse['results'] = {}

    // Search pulses
    if (searchType === 'pulses' || searchType === 'all') {
      let pulseQuery = `
        CALL db.index.vector.queryNodes('pulseContentVectorIndex', $limit, $queryEmbedding)
        YIELD node, score
        WHERE score >= $minSimilarity
      `

      if (contextId) {
        pulseQuery += ` AND EXISTS {
          MATCH (context:FieldContext {id: $contextId})-[:HAS_PULSE]->(node)
        }`
      }

      if (spaceId) {
        pulseQuery += ` AND EXISTS {
          MATCH (space:Space {id: $spaceId})-[:HAS_CONTEXT]->(:FieldContext)-[:HAS_PULSE]->(node)
        }`
      }

      pulseQuery += `
        MATCH (node)-[:INITIATED_BY]->(initiator)
        OPTIONAL MATCH (context:FieldContext)-[:HAS_PULSE]->(node)
        RETURN 
          node.id as id,
          node.content as content,
          [label IN labels(node) WHERE label CONTAINS 'Pulse' AND label <> 'FieldPulse'][0] as type,
          toString(node.createdAt) as createdAt,
          score as similarity,
          {id: initiator.id, name: initiator.name} as initiator,
          CASE WHEN context IS NOT NULL THEN {id: context.id, title: context.title} ELSE null END as context
        ORDER BY similarity DESC
        LIMIT $limit
      `

      const pulseResults = await graph.query<PulseResult>(pulseQuery, {
        queryEmbedding,
        limit,
        minSimilarity,
        contextId,
        spaceId,
      })

      results.pulses = Array.isArray(pulseResults)
        ? (pulseResults as PulseResult[])
        : []
    }

    // Search conversation chunks
    if (searchType === 'chunks' || searchType === 'all') {
      const chunkQuery = `
        CALL db.index.vector.queryNodes('conversationChunkVectorIndex', $limit, $queryEmbedding)
        YIELD node, score
        WHERE score >= $minSimilarity
        MATCH (pulse:FieldPulse)-[:HAS_CHUNK]->(node)
        RETURN 
          node.id as id,
          node.content as content,
          node.role as role,
          node.order as order,
          score as similarity,
          pulse.id as pulseId,
          pulse.content as pulseContent
        ORDER BY similarity DESC
        LIMIT $limit
      `

      const chunkResults = await graph.query<ChunkResult>(chunkQuery, {
        queryEmbedding,
        limit,
        minSimilarity,
      })

      results.chunks = Array.isArray(chunkResults)
        ? (chunkResults as ChunkResult[])
        : []
    }

    // Search resonances (label/description based)
    if (searchType === 'resonances' || searchType === 'all') {
      const resonanceQuery = `
        MATCH (r:FieldResonance)
        WHERE toLower(r.label) CONTAINS toLower($query)
           OR toLower(r.description) CONTAINS toLower($query)
        OPTIONAL MATCH (link:ResonanceLink)-[:RESONATES_AS]->(r)
        OPTIONAL MATCH (link)-[:SOURCE|TARGET]->(pulse:FieldPulse)
        WITH r, 
             count(DISTINCT link) as linkCount,
             avg(link.confidence) as avgConfidence,
             collect(DISTINCT pulse.id) as relatedPulses
        RETURN 
          r.id as id,
          r.label as label,
          r.description as description,
          linkCount,
          avgConfidence,
          relatedPulses[0..5] as relatedPulses
        ORDER BY linkCount DESC, avgConfidence DESC
        LIMIT $limit
      `

      const resonanceResults = await graph.query<ResonanceResult>(
        resonanceQuery,
        {
          query,
          limit,
        }
      )

      results.resonances = Array.isArray(resonanceResults)
        ? (resonanceResults as ResonanceResult[])
        : []
    }

    return NextResponse.json<SearchResponse>({
      success: true,
      query,
      results,
    })
  } catch (error) {
    console.error('Error performing semantic search:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
