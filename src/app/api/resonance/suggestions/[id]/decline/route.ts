/**
 * Decline a resonance suggestion (soft delete - mark as declined)
 * POST /api/resonance/suggestions/[id]/decline
 */

import { NextRequest, NextResponse } from 'next/server'
import { initGraph } from '@/modules/graph'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: suggestionId } = await params

    console.log(`[Resonance Decline] Processing suggestion: ${suggestionId}`)

    const graph = await initGraph()

    // Get the suggestion to verify it exists
    const suggestionResult = await graph.query<{
      status: string
    }>(
      `
      MATCH (suggestion:ResonanceSuggestion {id: $suggestionId})
      RETURN suggestion.status as status
    `,
      { suggestionId }
    )

    if (!Array.isArray(suggestionResult) || suggestionResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Suggestion not found' },
        { status: 404 }
      )
    }

    // Mark suggestion as declined
    await graph.query(
      `
      MATCH (suggestion:ResonanceSuggestion {id: $suggestionId})
      SET suggestion.status = 'declined'
      SET suggestion.declinedAt = datetime()
    `,
      { suggestionId }
    )

    console.log(
      `[Resonance Decline] ✓ Marked suggestion ${suggestionId} as declined`
    )

    return NextResponse.json({
      success: true,
      message: 'Suggestion declined',
      suggestionId,
      timestamp: new Date().toISOString(),
    })
  } catch (error: unknown) {
    console.error('[Resonance Decline] Error:', error)
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
