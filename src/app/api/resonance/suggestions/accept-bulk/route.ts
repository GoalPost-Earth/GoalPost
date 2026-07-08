/**
 * Bulk-accept resonance suggestions above a confidence threshold
 * POST /api/resonance/suggestions/accept-bulk
 *
 * Body: { spaceId: string, minConfidence: number }  // minConfidence in [0,1]
 *
 * Promotes every PENDING ResonanceSuggestion in the Space whose confidence is
 * >= minConfidence to a confirmed ResonanceLink in one pass — the "type 85% and
 * add all" affordance. Mirrors the single-accept route's write exactly (context
 * HAS_RESONANCE anchor so the link is visible in Bloom, confirmed status,
 * reviewedBy/reviewedAt, dedup) but batched, and gated on the caller being able
 * to edit the Space.
 */

import { NextRequest, NextResponse } from 'next/server'
import { initGraph } from '@/modules/graph'
import { resolveAuthenticatedUserId } from '@/app/api/auth/utils'
import { getSession, initializeDB } from '@/app/api/auth/neo4j'
import { canEditContent } from '@/lib/permissions/space-permissions'
import { createLog } from '@/lib/activity-logs/create-log'

interface BulkAcceptRequest {
  spaceId?: string
  minConfidence?: number
}

export async function POST(request: NextRequest) {
  try {
    let body: BulkAcceptRequest = {}
    try {
      const text = await request.text()
      if (text && text.trim()) body = JSON.parse(text)
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON body' },
        { status: 400 }
      )
    }

    const spaceId = body.spaceId?.trim()
    const minConfidence = Number(body.minConfidence)

    if (!spaceId) {
      return NextResponse.json(
        { success: false, error: 'spaceId is required' },
        { status: 400 }
      )
    }
    if (!Number.isFinite(minConfidence) || minConfidence < 0 || minConfidence > 1) {
      return NextResponse.json(
        {
          success: false,
          error: 'minConfidence must be a number between 0 and 1',
        },
        { status: 400 }
      )
    }

    // Promoting suggestions is a content write within the Space — require an
    // authenticated caller who can edit it (owner / ADMIN / MEMBER).
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

    // Promote every qualifying pending suggestion whose pulse pair is not
    // already linked (dedup / idempotent — mirrors the single-accept guard). We
    // anchor the new link to the suggestion's own FieldContext via HAS_RESONANCE
    // so it renders in the graph, and stamp confirmed/reviewedBy like a human
    // accept. count() comes back as a string from the LangChain layer → Number().
    const promoted = await graph.query<{
      accepted: number | string
      pulseIds: string[]
    }>(
      `
      MATCH (space:Space {id: $spaceId})-[:HAS_SUGGESTION]->(sug:ResonanceSuggestion {status: 'pending'})
      WHERE sug.confidence >= $minConfidence
      MATCH (ctx:FieldContext)-[:HAS_SUGGESTION]->(sug)
      MATCH (sug)-[:SOURCE]->(src:FieldPulse)
      MATCH (sug)-[:TARGET]->(tgt:FieldPulse)
      // Skip pairs already joined by a ResonanceLink (either direction).
      OPTIONAL MATCH (src)<-[:SOURCE|TARGET]-(existing:ResonanceLink)-[:SOURCE|TARGET]->(tgt)
      WITH space, sug, ctx, src, tgt, existing
      WHERE existing IS NULL
      CREATE (link:ResonanceLink {
        id: 'rl_' + randomUUID(),
        label: sug.label,
        description: sug.description,
        confidence: sug.confidence,
        evidence: sug.evidence,
        status: 'confirmed',
        reviewedBy: $actorId,
        reviewedAt: datetime(),
        createdAt: datetime(),
        approvedFromSuggestion: sug.id
      })
      CREATE (link)-[:SOURCE]->(src)
      CREATE (link)-[:TARGET]->(tgt)
      CREATE (ctx)-[:HAS_RESONANCE]->(link)
      SET sug.status = 'accepted', sug.acceptedAt = datetime()
      RETURN count(link) AS accepted,
             collect(DISTINCT src.id) + collect(DISTINCT tgt.id) AS pulseIds
      `,
      { spaceId, minConfidence, actorId }
    )

    const accepted = Number(promoted?.[0]?.accepted ?? 0)
    const pulseIds = promoted?.[0]?.pulseIds ?? []

    // Clear any qualifying pending suggestion whose pair was ALREADY linked
    // (e.g. accepted individually first, or a legacy pre-dedup duplicate): mark
    // it accepted so "accept all" truly empties the pending set, without minting
    // a second link.
    const clearedRows = await graph.query<{ alreadyLinked: number | string }>(
      `
      MATCH (space:Space {id: $spaceId})-[:HAS_SUGGESTION]->(sug:ResonanceSuggestion {status: 'pending'})
      WHERE sug.confidence >= $minConfidence
      MATCH (sug)-[:SOURCE]->(src:FieldPulse)
      MATCH (sug)-[:TARGET]->(tgt:FieldPulse)
      MATCH (src)<-[:SOURCE|TARGET]-(:ResonanceLink)-[:SOURCE|TARGET]->(tgt)
      SET sug.status = 'accepted', sug.acceptedAt = datetime()
      RETURN count(sug) AS alreadyLinked
      `,
      { spaceId, minConfidence }
    )
    const alreadyLinked = Number(clearedRows?.[0]?.alreadyLinked ?? 0)

    // One aggregate activity log for the batch (best-effort), only when links
    // were actually created — anchored to the involved pulses so it surfaces in
    // the context feeds.
    if (accepted > 0) {
      try {
        const pct = Math.round(minConfidence * 100)
        await createLog({
          userId: actorId,
          description: `Accepted ${accepted} resonance${accepted === 1 ? '' : 's'} at ${pct}%+ confidence`,
          pulseIds,
          metadata: {
            event: 'resonance_bulk_accepted',
            spaceId,
            minConfidence,
            accepted,
            alreadyLinked,
          },
        })
      } catch (logErr) {
        console.warn('[Resonance Bulk Accept] activity log failed:', logErr)
      }
    }

    return NextResponse.json({
      success: true,
      accepted,
      alreadyLinked,
      minConfidence,
      timestamp: new Date().toISOString(),
    })
  } catch (error: unknown) {
    console.error('[Resonance Bulk Accept] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
