/**
 * List pending resonance suggestions for a space
 * GET /api/resonance/suggestions?spaceId=<space_id>&status=pending|accepted|declined
 */

import { NextRequest, NextResponse } from 'next/server'
import { initGraph } from '@/modules/graph'

interface ResonanceSuggestion {
  id: string
  label: string
  description: string
  confidence: number
  evidence: string
  status: string
  createdAt: string
  sourcePulseId: string
  sourcePulseContent: string
  targetPulseId: string
  targetPulseContent: string
  contextId: string
  contextTitle: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const spaceId = searchParams.get('spaceId')
    const status = searchParams.get('status') || 'pending'

    if (!spaceId) {
      return NextResponse.json(
        { success: false, error: 'spaceId parameter required' },
        { status: 400 }
      )
    }

    console.log(
      `[Resonance Suggestions] Fetching ${status} suggestions for space ${spaceId}`
    )

    const graph = await initGraph()

    // Verify space exists
    const spaceResult = await graph.query<{ spaceId: string }>(
      `MATCH (space:WeSpace {id: $spaceId}) RETURN space.id as spaceId`,
      { spaceId }
    )

    if (!Array.isArray(spaceResult) || spaceResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Space not found' },
        { status: 404 }
      )
    }

    // Get suggestions with their pulses and context
    const suggestionsResult = await graph.query<ResonanceSuggestion>(
      `
      MATCH (space:WeSpace {id: $spaceId})-[:HAS_SUGGESTION]->(suggestion:ResonanceSuggestion {status: $status})
      MATCH (suggestion)-[:SOURCE]->(source:FieldPulse)
      MATCH (suggestion)-[:TARGET]->(target:FieldPulse)
      MATCH (context:FieldContext)-[:HAS_SUGGESTION]->(suggestion)
      
      RETURN {
        id: suggestion.id,
        label: suggestion.label,
        description: suggestion.description,
        confidence: suggestion.confidence,
        evidence: suggestion.evidence,
        status: suggestion.status,
        createdAt: toString(suggestion.createdAt),
        sourcePulseId: source.id,
        sourcePulseContent: source.content,
        targetPulseId: target.id,
        targetPulseContent: target.content,
        contextId: context.id,
        contextTitle: context.title
      } as suggestion
      
      ORDER BY suggestion.createdAt DESC
    `,
      { spaceId, status }
    )

    const suggestions = Array.isArray(suggestionsResult)
      ? suggestionsResult
      : []

    console.log(
      `[Resonance Suggestions] Found ${suggestions.length} ${status} suggestions in space ${spaceId}`
    )

    return NextResponse.json({
      success: true,
      spaceId,
      status,
      count: suggestions.length,
      suggestions,
      timestamp: new Date().toISOString(),
    })
  } catch (error: unknown) {
    console.error('[Resonance Suggestions] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
