/**
 * Decline a resonance suggestion (soft delete - mark as declined)
 * POST /api/resonance/suggestions/[id]/decline
 */

import { NextRequest, NextResponse } from 'next/server'
import { initGraph } from '@/modules/graph'
import { resolveAuthenticatedUserId } from '@/app/api/auth/utils'
import { getSession, initializeDB } from '@/app/api/auth/neo4j'
import { canEditContent } from '@/lib/permissions/space-permissions'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: suggestionId } = await params

    console.log(`[Resonance Decline] Processing suggestion: ${suggestionId}`)

    // Declining mutates a suggestion within its Space — require an authenticated
    // caller who can edit that Space (resolved from the suggestion's context).
    const actorId = resolveAuthenticatedUserId(request)
    if (!actorId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const graph = await initGraph()

    // Get the suggestion (verify existence) and resolve its enclosing Space.
    const suggestionResult = await graph.query<{
      status: string
      spaceId: string | null
    }>(
      `
      MATCH (suggestion:ResonanceSuggestion {id: $suggestionId})
      OPTIONAL MATCH (space:Space)-[:HAS_CONTEXT]->(:FieldContext)-[:HAS_SUGGESTION]->(suggestion)
      RETURN suggestion.status as status, space.id AS spaceId
    `,
      { suggestionId }
    )

    if (!Array.isArray(suggestionResult) || suggestionResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Suggestion not found' },
        { status: 404 }
      )
    }

    const spaceId = suggestionResult[0]?.spaceId || null
    if (!spaceId) {
      return NextResponse.json(
        { success: false, error: 'Suggestion not found' },
        { status: 404 }
      )
    }
    initializeDB()
    const permSession = getSession()
    try {
      const allowed = await canEditContent(permSession, actorId, spaceId)
      if (!allowed) {
        return NextResponse.json(
          { success: false, error: 'Forbidden' },
          { status: 403 }
        )
      }
    } finally {
      await permSession.close()
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
