/**
 * API endpoint for creating pulses from conversation
 * POST /api/pulse/create-from-conversation
 *
 * Accepts conversation chunks and creates a pulse with linked chunks,
 * generates embeddings, and triggers person enrichment
 */

import { NextRequest, NextResponse } from 'next/server'
import { initGraph } from '@/modules/graph'
import { chunkConversationMessages } from '@/lib/resonance/utils/sentence-chunker'
import { generatePulseEmbeddings } from '@/lib/resonance/embeddings/pulse-embedder'
import { enrichPersonFromPulses } from '@/lib/resonance/embeddings/person-enricher'

interface CreatePulseRequest {
  contextId: string // FieldContext where pulse belongs
  personId: string // Person who initiated the pulse
  pulseType:
    | 'GoalPulse'
    | 'ResourcePulse'
    | 'StoryPulse'
    | 'CarePulse'
    | 'TimePulse'
  content: string // Main pulse content
  intensity?: number
  why?: string
  // Pulse-type specific fields
  status?: 'ACTIVE' | 'PAUSED' | 'COMPLETED'
  horizon?: 'SHORT' | 'MID' | 'LONG'
  resourceType?: string
  availability?: number
  // Conversation chunks
  conversation?: Array<{
    role: 'user' | 'assistant' | 'system'
    content: string
  }>
}

interface CreatePulseResponse {
  success: boolean
  pulseId: string
  chunkIds: string[]
  message: string
}

export async function POST(request: NextRequest) {
  try {
    const body: CreatePulseRequest = await request.json()

    const {
      contextId,
      personId,
      pulseType,
      content,
      intensity,
      why,
      status,
      horizon,
      resourceType,
      availability,
      conversation,
    } = body

    // Validate required fields
    if (!contextId || !personId || !pulseType || !content) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Missing required fields: contextId, personId, pulseType, content',
        },
        { status: 400 }
      )
    }

    const graph = await initGraph()

    // Create pulse node with appropriate labels
    const pulseLabels = ['FieldPulse', pulseType]

    // Build property setters for optional fields
    const optionalProps: string[] = []
    const params: Record<string, unknown> = { contextId, personId, content }

    if (intensity !== undefined) {
      optionalProps.push('pulse.intensity = $intensity')
      params.intensity = intensity
    }
    if (why) {
      optionalProps.push('pulse.why = $why')
      params.why = why
    }
    if (status) {
      optionalProps.push('pulse.status = $status')
      params.status = status
    }
    if (horizon) {
      optionalProps.push('pulse.horizon = $horizon')
      params.horizon = horizon
    }
    if (resourceType) {
      optionalProps.push('pulse.resourceType = $resourceType')
      params.resourceType = resourceType
    }
    if (availability !== undefined) {
      optionalProps.push('pulse.availability = $availability')
      params.availability = availability
    }

    const optionalSetClause =
      optionalProps.length > 0 ? `SET ${optionalProps.join(', ')}` : ''

    // Create pulse node using Neo4j's randomUUID()
    const pulseResult = await graph.query<{ pulseId: string }>(
      `
      MATCH (context:FieldContext {id: $contextId})
      MATCH (person:Person {id: $personId})
      CREATE (pulse:${pulseLabels.join(':')} {
        id: 'pulse_' + randomUUID(),
        content: $content,
        createdAt: datetime(),
        modifiedAt: datetime()
      })
      ${optionalSetClause}
      CREATE (context)-[:HAS_PULSE]->(pulse)
      CREATE (pulse)-[:INITIATED_BY]->(person)
      RETURN pulse.id as pulseId
    `,
      params
    )

    const pulseId =
      Array.isArray(pulseResult) && pulseResult.length > 0
        ? pulseResult[0].pulseId
        : null

    if (!pulseId) {
      throw new Error('Failed to create pulse')
    }

    // Process conversation chunks if provided
    const chunkIds: string[] = []

    if (conversation && conversation.length > 0) {
      // Chunk the conversation into sentence-based segments
      const chunks = chunkConversationMessages(conversation, 3)

      // Create ConversationChunk nodes using Neo4j's randomUUID()
      for (const chunk of chunks) {
        const result = await graph.query<{ chunkId: string }>(
          `
          MATCH (pulse:FieldPulse {id: $pulseId})
          CREATE (chunk:ConversationChunk {
            id: 'chunk_' + randomUUID(),
            content: $content,
            order: $order,
            role: $role,
            createdAt: datetime()
          })
          CREATE (pulse)-[:HAS_CHUNK]->(chunk)
          RETURN chunk.id as chunkId
        `,
          {
            pulseId,
            content: chunk.content,
            order: chunk.order,
            role: chunk.role,
          }
        )

        const chunkId =
          Array.isArray(result) && result.length > 0 ? result[0].chunkId : null

        if (chunkId) {
          chunkIds.push(chunkId)
        }
      }
    }

    // Process embeddings and person enrichment directly (no queue/workers needed)
    try {
      // Generate embeddings for pulse and chunks
      await generatePulseEmbeddings(pulseId)
      await enrichPersonFromPulses(personId)
      console.log(`✓ Enriched person profile for ${personId}`)
    } catch (error) {
      console.error('Error in background processing:', error)
      // Don't fail the request if background processing fails
    }

    console.log(
      `✓ Created pulse ${pulseId} with ${chunkIds.length} conversation chunks`
    )

    return NextResponse.json<CreatePulseResponse>({
      success: true,
      pulseId,
      chunkIds,
      message: `Pulse created successfully with ${chunkIds.length} conversation chunks. Embeddings generated and person enriched.`,
    })
  } catch (error) {
    console.error('Error creating pulse from conversation:', error)
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
