/**
 * List pending resonance suggestions for a space
 * GET /api/resonance/suggestions?spaceId=<space_id>&status=pending|accepted|declined
 */

import { NextRequest, NextResponse } from 'next/server'
import { initGraph } from '@/modules/graph'
import { resolveAuthenticatedUserId } from '@/app/api/auth/utils'
import { getSession, initializeDB } from '@/app/api/auth/neo4j'
import { canViewContent } from '@/lib/permissions/space-permissions'
import { viewablePulsePredicate } from '@/lib/permissions/pulse-visibility'

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

    // Resonance suggestions embed pulse content, so they are visible ONLY to
    // people who can access the Space. Require an authenticated caller who owns
    // or is a member of the Space (kb/02-user-roles.md) — the prior code only
    // checked that the Space existed, which leaked pulse content to anyone.
    const userId = resolveAuthenticatedUserId(request)
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    initializeDB()
    const permSession = getSession()
    try {
      const allowed = await canViewContent(permSession, userId, spaceId)
      if (!allowed) {
        // Don't distinguish "not a member" from "no such space" — both 403.
        return NextResponse.json(
          { success: false, error: 'Forbidden' },
          { status: 403 }
        )
      }
    } finally {
      await permSession.close()
    }

    console.log(
      `[Resonance Suggestions] Fetching ${status} suggestions for space ${spaceId}`
    )

    const graph = await initGraph()

    // Get suggestions with their pulses and context. Pass status='all' to
    // return every status (used by the review modal so its Accepted/Declined
    // tabs populate); otherwise filter to the requested status.
    const suggestionsResult = await graph.query<{
      suggestion: ResonanceSuggestion
    }>(
      `
      MATCH (space:Space {id: $spaceId})-[:HAS_SUGGESTION]->(suggestion:ResonanceSuggestion)
      WHERE $status = 'all' OR suggestion.status = $status
      MATCH (suggestion)-[:SOURCE]->(source:FieldPulse)
      MATCH (suggestion)-[:TARGET]->(target:FieldPulse)
      MATCH (context:FieldContext)-[:HAS_SUGGESTION]->(suggestion)

      // Defense in depth for cross-context suggestions (GOAL-293): canViewContent
      // above only proves the caller can view the ANCHOR Space. A cross-context
      // suggestion's TARGET lives in a different Space, so also require the caller
      // to be able to view BOTH pulses before returning their content — a Space
      // co-member must never receive a pulse from a Space they have no role on.
      WHERE ${viewablePulsePredicate('source', 'currentUserId')}
        AND ${viewablePulsePredicate('target', 'currentUserId')}

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
      { spaceId, status, currentUserId: userId }
    )

    // The Cypher aliases the projection as `suggestion`, and the LangChain
    // Neo4jGraph layer returns each row as `{ suggestion: {...} }` (record
    // key preserved). Unwrap so the API contract stays flat — the modal +
    // hook read `.status`/`.confidence` directly. (Without this the modal
    // filters on undefined fields and shows "No pending suggestions".)
    const suggestions = (Array.isArray(suggestionsResult)
      ? suggestionsResult
      : []
    ).map((row) =>
      row && typeof row === 'object' && 'suggestion' in row
        ? (row as { suggestion: ResonanceSuggestion }).suggestion
        : (row as unknown as ResonanceSuggestion)
    )

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
