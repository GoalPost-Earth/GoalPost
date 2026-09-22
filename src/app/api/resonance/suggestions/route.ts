/**
 * List pending resonance suggestions for a space
 * GET /api/resonance/suggestions?spaceId=<space_id>&status=pending|accepted|declined&contextId=<field_id>
 *
 * `contextId` is OPTIONAL and narrows the list to suggestions anchored on one
 * FieldContext. Without it the route returns the whole Space, which is what the
 * review modal has always shown — while the badge that opens it counts a single
 * field (`./count`). A member reviewing a 117-suggestion import therefore opened
 * a queue holding every other field's suggestions too and reasonably read the
 * larger number as leftovers from a field they had deleted. Same parameter name,
 * same scoping clause and same visibility rule as the count route, so the two
 * can be pointed at one field and agree.
 *
 * NOT YET WIRED: `useResonanceSuggestions` does not send `contextId`, so the
 * review modal still lists the whole Space and the badge/modal mismatch above
 * is not yet resolved end to end. The parameter lands here ahead of the
 * grouped review surface that will pass it.
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
  /**
   * The theme this pair expresses (GOAL / Phase 2). Null for a suggestion
   * written before themes existed, or one whose theme write failed — the
   * review UI groups those under "Ungrouped" rather than hiding them.
   */
  themeId: string | null
  themeLabel: string | null
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const spaceId = searchParams.get('spaceId')
    const status = searchParams.get('status') || 'pending'
    // `?contextId=` yields '' rather than null, which would make the Cypher
    // compare against an empty id and match nothing. Normalize so an empty
    // parameter reads as "no field filter".
    const contextId = searchParams.get('contextId') || null

    if (!spaceId) {
      return NextResponse.json(
        { success: false, error: 'spaceId parameter required' },
        { status: 400 }
      )
    }
    // Allowlisted rather than free text, so this route and ./count answer a
    // bad `status` the same way instead of 400-vs-empty-200.
    const VALID_STATUSES = ['pending', 'accepted', 'declined', 'all']
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'invalid status parameter' },
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
      // The theme, when the suggestion carries one. OPTIONAL so an ungrouped
      // suggestion is still returned — a reviewer must never lose a pair
      // because its theme write failed.
      OPTIONAL MATCH (suggestion)-[:RESONATES_AS]->(theme:FieldResonance)

      // Three guards in one WHERE (Cypher takes a single WHERE per MATCH):
      //
      // 1. The anchoring context must belong to the gated Space —
      //    UNCONDITIONALLY, exactly as the count route requires it. Keeping
      //    this outside the optional narrowing below matters twice over: an
      //    arbitrary $contextId can never become a cross-Space probe, and
      //    soft delete re-points HAS_CONTEXT to HAS_DELETED_CONTEXT
      //    (soft-delete-field-context.ts), so a deleted field's leftovers
      //    drop out of this list the same way they drop out of the count.
      //    Scoping it to the $contextId branch alone would have left the
      //    unscoped queue able to surface a deleted field's context title —
      //    the very confusion this parameter exists to clear up.
      // 2. Optional narrowing to one field.
      // 3. Defense in depth for cross-context suggestions (GOAL-293):
      //    canViewContent above only proves the caller can view the ANCHOR
      //    Space. A cross-context suggestion's TARGET lives in a different
      //    Space, so also require the caller to be able to view BOTH pulses
      //    before returning their content — a Space co-member must never
      //    receive a pulse from a Space they have no role on.
      WHERE (space)-[:HAS_CONTEXT]->(context)
        AND ($contextId IS NULL OR context.id = $contextId)
        AND ${viewablePulsePredicate('source', 'currentUserId')}
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
        contextTitle: context.title,
        themeId: theme.id,
        themeLabel: theme.label
      } as suggestion

      ORDER BY suggestion.createdAt DESC
    `,
      { spaceId, status, contextId, currentUserId: userId }
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
      contextId,
      status,
      count: suggestions.length,
      suggestions,
      timestamp: new Date().toISOString(),
    },
    // The URL is identical for every caller but the answer is per-caller, and
    // this response carries both pulses' full content — never let a shared
    // cache hand one member another member's queue.
    { headers: { 'Cache-Control': 'no-store' } })
  } catch (error: unknown) {
    // Detail stays in the server log: a Neo4j driver error embeds the failing
    // statement, which would hand the client our label and relationship names
    // — and this route's message is rendered straight into the UI's error
    // state (useResonanceSuggestions). Same masking as ./count.
    console.error('[Resonance Suggestions] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load resonance suggestions',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
