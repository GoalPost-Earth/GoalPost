/**
 * Decline a resonance suggestion (soft delete - mark as declined)
 * POST /api/resonance/suggestions/[id]/decline
 */

import { NextRequest, NextResponse } from 'next/server'
import { initGraph } from '@/modules/graph'
import { resolveAuthenticatedUserId } from '@/app/api/auth/utils'
import { getSession, initializeDB } from '@/app/api/auth/neo4j'
import { canEditContent } from '@/lib/permissions/space-permissions'
import { createLog } from '@/lib/activity-logs/create-log'

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
    // Also pull the label, context and connected pulses so the audit log can
    // describe what was declined and surface in the context activity feed.
    const suggestionResult = await graph.query<{
      status: string
      label: string | null
      spaceId: string | null
      contextId: string | null
      sourcePulseId: string | null
      targetPulseId: string | null
    }>(
      `
      MATCH (suggestion:ResonanceSuggestion {id: $suggestionId})
      OPTIONAL MATCH (space:Space)-[:HAS_CONTEXT]->(context:FieldContext)-[:HAS_SUGGESTION]->(suggestion)
      OPTIONAL MATCH (suggestion)-[:SOURCE]->(source:FieldPulse)
      OPTIONAL MATCH (suggestion)-[:TARGET]->(target:FieldPulse)
      RETURN suggestion.status as status,
             suggestion.label as label,
             space.id AS spaceId,
             context.id AS contextId,
             source.id AS sourcePulseId,
             target.id AS targetPulseId
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

    // Audit log for the decline, attributed to the actor. Best-effort — a log
    // hiccup must not fail a successful decline — but awaited so the write
    // flushes before the serverless response returns (a floating promise can be
    // dropped when the function freezes).
    const { label, contextId, sourcePulseId, targetPulseId } =
      suggestionResult[0]
    try {
      await createLog({
        userId: actorId,
        description: `Declined resonance "${label ?? 'suggestion'}"`,
        pulseIds: [sourcePulseId, targetPulseId].filter(
          (id): id is string => Boolean(id)
        ),
        contextId: contextId ?? undefined,
        metadata: {
          event: 'resonance_declined',
          suggestionId,
          ...(contextId ? { contextId } : {}),
        },
      })
    } catch (logErr) {
      console.warn('[Resonance Decline] Failed to write activity log:', logErr)
    }

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
