/**
 * API endpoint for fetching pulses by context
 * GET /api/pulse/get-by-context?contextId=field_id
 *
 * Retrieves all pulses for a given FieldContext
 */

import { NextRequest, NextResponse } from 'next/server'
import { initGraph } from '@/modules/graph'

interface PulseNode {
  id: string
  content: string
  type: 'goal' | 'resource' | 'story'
  createdAt: string
}

interface GetPulsesByContextResponse {
  success: boolean
  pulses: PulseNode[]
  count: number
  message: string
}

export async function GET(request: NextRequest) {
  try {
    const contextId = request.nextUrl.searchParams.get('contextId')

    if (!contextId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: contextId',
        },
        { status: 400 }
      )
    }

    const graph = await initGraph()

    // Query pulses by context
    const pulseResult = await graph.query<{ pulse: PulseNode }>(
      `
      MATCH (context:FieldContext {id: $contextId})
      MATCH (context)-[:HAS_PULSE]->(pulse:FieldPulse)
      WITH pulse, labels(pulse) as pulseLabels
      WITH pulse, pulseLabels,
        CASE
          WHEN 'GoalPulse' IN pulseLabels THEN 'goal'
          WHEN 'ResourcePulse' IN pulseLabels THEN 'resource'
          WHEN 'StoryPulse' IN pulseLabels THEN 'story'
          ELSE 'goal'
        END as pulseType
      RETURN {
        id: pulse.id,
        content: pulse.content,
        type: pulseType,
        createdAt: toString(pulse.createdAt)
      } as pulse
      ORDER BY pulse.createdAt DESC
      LIMIT 50
    `,
      { contextId }
    )

    const pulses: PulseNode[] = Array.isArray(pulseResult)
      ? pulseResult.map(({ pulse }) => pulse)
      : []

    console.log(`✓ Retrieved ${pulses.length} pulses for context ${contextId}`)

    return NextResponse.json<GetPulsesByContextResponse>({
      success: true,
      pulses,
      count: pulses.length,
      message: `Retrieved ${pulses.length} pulses for context ${contextId}`,
    })
  } catch (error) {
    console.error('Error fetching pulses by context:', error)
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
