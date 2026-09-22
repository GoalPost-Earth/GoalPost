/**
 * Decline every pending resonance suggestion under one theme (or above a
 * confidence floor) in one pass.
 * POST /api/resonance/suggestions/decline-bulk
 *
 * Body: { spaceId: string, fieldResonanceId?: string, minConfidence?: number }
 *
 * The counterpart to `accept-bulk`, and the other half of the grouped review
 * action: a reviewer shown "31 pairs under Regenerative Commons" needs to be
 * able to reject the group as readily as take it. Declining only flips status —
 * no ResonanceLink is created and nothing is deleted, exactly like the
 * single-decline route — so the suggestions remain as an audit trail and keep
 * populating the modal's Declined tab.
 *
 * A real filter is required: either `fieldResonanceId`, or a `minConfidence`
 * ABOVE 0. An unfiltered "decline everything pending in this Space" is
 * deliberately not expressible here — it is a destructive-feeling action that
 * should be an explicit product decision, not something that falls out of an
 * empty body or a client serialising an unset field. `minConfidence` must be a
 * real JSON number; it is never coerced, because `Number(null)` is 0 and would
 * turn an absent value into a floor that selects everything.
 *
 * REST rather than GraphQL for the same reason as its siblings —
 * `ResonanceSuggestion` has no SDL type, and ADR-005 reserves `/api/resonance`
 * for this surface.
 */

import { NextRequest, NextResponse } from 'next/server'
import { initGraph } from '@/modules/graph'
import { resolveAuthenticatedUserId } from '@/app/api/auth/utils'
import { getSession, initializeDB } from '@/app/api/auth/neo4j'
import { canEditContent } from '@/lib/permissions/space-permissions'
import { createLog } from '@/lib/activity-logs/create-log'

interface BulkDeclineRequest {
  spaceId?: string
  fieldResonanceId?: string
  minConfidence?: number
}

export async function POST(request: NextRequest) {
  try {
    let body: BulkDeclineRequest = {}
    try {
      const text = await request.text()
      if (text && text.trim()) body = JSON.parse(text)
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON body' },
        { status: 400 }
      )
    }
    // A literal `null` body is valid JSON, so it parses without throwing and
    // then blows up on the first property read — a 500 where the sibling
    // /api/resonance/discover correctly answers 400.
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON body' },
        { status: 400 }
      )
    }

    const spaceId = body.spaceId?.trim()
    const fieldResonanceId = body.fieldResonanceId?.trim() || null
    // Type-check BEFORE coercing. `Number(null)` is 0 — as are `false`, `''`
    // and `[]` — so coercing first would read `{ minConfidence: null }` as a
    // deliberate floor of zero, satisfy the range check and the filter gate
    // below, and decline every pending suggestion in the Space. That is the
    // exact action this route refuses to offer, reachable from a body a client
    // sends by accident when an unset field serialises as null.
    const hasConfidence = body.minConfidence !== undefined
    const minConfidence = hasConfidence ? (body.minConfidence as number) : null

    if (!spaceId) {
      return NextResponse.json(
        { success: false, error: 'spaceId is required' },
        { status: 400 }
      )
    }
    if (
      hasConfidence &&
      (typeof minConfidence !== 'number' ||
        !Number.isFinite(minConfidence) ||
        minConfidence < 0 ||
        minConfidence > 1)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'minConfidence must be a number between 0 and 1',
        },
        { status: 400 }
      )
    }
    // Refuse to interpret an empty filter set as "decline the whole Space" —
    // and note a floor of 0 is not a filter either. `minConfidence: 0` is a
    // legitimate way to say "every pair under THIS theme regardless of score",
    // but on its own it selects everything pending, so it needs a theme beside
    // it. Anything above 0 genuinely narrows and stands alone.
    const narrowsByConfidence =
      hasConfidence && (minConfidence as number) > 0
    if (!fieldResonanceId && !narrowsByConfidence) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Provide fieldResonanceId, and/or a minConfidence above 0 — declining every pending suggestion in a Space is not supported here',
        },
        { status: 400 }
      )
    }

    // Reviewing is a content write within the Space: owner / ADMIN / MEMBER.
    // A GUEST may see the queue but not act on it (kb/02-user-roles.md).
    const actorId = resolveAuthenticatedUserId(request)
    if (!actorId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
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

    const graph = await initGraph()

    // Status-only write, so there is no dedup or link-creation branch to
    // mirror from accept-bulk. The theme edge is REQUIRED when an id is given,
    // so an ungrouped suggestion is never swept up by a per-theme reject.
    const rows = await graph.query<{ declined: number | string }>(
      `
      MATCH (space:Space {id: $spaceId})-[:HAS_SUGGESTION]->(sug:ResonanceSuggestion {status: 'pending'})
      WHERE ($fieldResonanceId IS NULL
             OR EXISTS {
               MATCH (sug)-[:RESONATES_AS]->(:FieldResonance {id: $fieldResonanceId})
             })
        AND ($minConfidence IS NULL OR sug.confidence >= $minConfidence)
      SET sug.status = 'declined', sug.declinedAt = datetime()
      RETURN count(sug) AS declined
      `,
      { spaceId, fieldResonanceId, minConfidence }
    )

    // count() can round-trip through the LangChain layer as a string.
    const declined = Number(rows?.[0]?.declined ?? 0) || 0

    // Best-effort audit, awaited so it flushes before the serverless response
    // returns. No pulseIds: declining touches no pulse, and a Space-level log
    // is the honest record of what happened.
    if (declined > 0) {
      try {
        await createLog({
          userId: actorId,
          description: fieldResonanceId
            ? `Dismissed ${declined} resonance suggestion${declined === 1 ? '' : 's'} under one theme`
            : `Dismissed ${declined} resonance suggestion${declined === 1 ? '' : 's'}`,
          metadata: {
            event: 'resonance_bulk_declined',
            spaceId,
            fieldResonanceId,
            minConfidence,
            declined,
          },
        })
      } catch (logErr) {
        console.warn('[Resonance Bulk Decline] activity log failed:', logErr)
      }
    }

    return NextResponse.json({
      success: true,
      declined,
      fieldResonanceId,
      minConfidence,
      timestamp: new Date().toISOString(),
    })
  } catch (error: unknown) {
    // Detail stays server-side: a driver error embeds the failing statement.
    console.error('[Resonance Bulk Decline] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to dismiss resonance suggestions',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
