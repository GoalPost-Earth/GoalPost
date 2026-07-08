/**
 * Accept a resonance suggestion and promote it to a ResonanceLink
 * POST /api/resonance/suggestions/[id]/accept
 */

import { NextRequest, NextResponse } from 'next/server'
import { initGraph } from '@/modules/graph'
import { resolveAuthenticatedUserId } from '@/app/api/auth/utils'
import { getSession, initializeDB } from '@/app/api/auth/neo4j'
import { canEditContent } from '@/lib/permissions/space-permissions'
import { createNotification } from '@/lib/notifications/create-notification'
import { createLog } from '@/lib/activity-logs/create-log'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: suggestionId } = await params

    console.log(`[Resonance Accept] Processing suggestion: ${suggestionId}`)

    // The accepting user, resolved from the verified accessToken cookie / bearer.
    // Promoting a suggestion to a ResonanceLink is a graph write, so require a
    // valid authenticated caller. The finer-grained Space-permission check (can
    // this user edit the suggestion's Space) is enforced below via
    // canEditContent once the suggestion's FieldContext is resolved.
    const actorId = resolveAuthenticatedUserId(request)
    if (!actorId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const graph = await initGraph()

    // Get the suggestion and its connections
    const suggestionResult = await graph.query<{
      suggestion: {
        id: string
        label: string
        description: string
        confidence: number
        evidence: string
      }
      status: string | null
      contextId: string
      sourcePulseId: string
      targetPulseId: string
    }>(
      `
      MATCH (suggestion:ResonanceSuggestion {id: $suggestionId})
      MATCH (suggestion)-[:SOURCE]->(source:FieldPulse)
      MATCH (suggestion)-[:TARGET]->(target:FieldPulse)
      MATCH (context:FieldContext)-[:HAS_SUGGESTION]->(suggestion)
      RETURN {
        id: suggestion.id,
        label: suggestion.label,
        description: suggestion.description,
        confidence: suggestion.confidence,
        evidence: suggestion.evidence
      } as suggestion,
      suggestion.status as status,
      context.id as contextId,
      source.id as sourcePulseId,
      target.id as targetPulseId
    `,
      { suggestionId }
    )

    if (!Array.isArray(suggestionResult) || suggestionResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Suggestion not found' },
        { status: 404 }
      )
    }

    const { suggestion, status, sourcePulseId, targetPulseId, contextId } =
      suggestionResult[0]

    // Idempotency: a suggestion is promoted exactly once. A second accept (double
    // click, client retry, two admins) must NOT mint a second ResonanceLink —
    // the promote below is an unconditional CREATE, so without this guard every
    // re-accept produced a duplicate link + duplicate HAS_RESONANCE edge, now
    // visible in Bloom. If already accepted, return the link created the first
    // time. (Sequential guard; the compare-and-set WHERE on the promote closes
    // the concurrent window.)
    if (status && status !== 'pending') {
      const existing = await graph.query<{ linkId: string | null }>(
        `MATCH (l:ResonanceLink {approvedFromSuggestion: $suggestionId})
         RETURN l.id AS linkId
         LIMIT 1`,
        { suggestionId }
      )
      return NextResponse.json({
        success: true,
        alreadyAccepted: true,
        suggestionId,
        linkId: existing?.[0]?.linkId ?? null,
        message: 'Suggestion has already been reviewed.',
        timestamp: new Date().toISOString(),
      })
    }

    // Promoting a suggestion to a ResonanceLink is a content write within the
    // suggestion's Space — gate it on the caller being able to edit that Space
    // (owner / ADMIN / MEMBER), resolved from the suggestion's FieldContext.
    const spaceRows = await graph.query<{ spaceId: string | null }>(
      `
      MATCH (space:Space)-[:HAS_CONTEXT]->(:FieldContext {id: $contextId})
      RETURN space.id AS spaceId
      LIMIT 1
      `,
      { contextId }
    )
    const spaceId = spaceRows?.[0]?.spaceId || null
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

    // Create the ResonanceLink from the suggestion
    const linkResult = await graph.query<{ linkId: string }>(
      `
      MATCH (source:FieldPulse {id: $sourcePulseId})
      MATCH (target:FieldPulse {id: $targetPulseId})
      MATCH (suggestion:ResonanceSuggestion {id: $suggestionId})
      // Compare-and-set: only promote a still-pending suggestion. Under Neo4j's
      // per-node write lock on the SET below, a racing second accept re-reads
      // the (now 'accepted') status here and matches nothing — so it creates no
      // duplicate link. Together with the early-return above this makes accept
      // idempotent for both sequential and concurrent double-submits.
      WHERE suggestion.status = 'pending'
      // The suggestion's context — both pulses are guaranteed to live in it
      // (enforced at suggestion-create). This is the anchor that makes the
      // promoted link visible.
      MATCH (context:FieldContext {id: $contextId})

      // Create ResonanceLink with data from suggestion
      CREATE (link:ResonanceLink {
        id: 'rl_' + randomUUID(),
        label: $label,
        description: $description,
        confidence: $confidence,
        evidence: $evidence,
        status: 'confirmed',
        reviewedBy: $actorId,
        reviewedAt: datetime(),
        createdAt: datetime(),
        approvedFromSuggestion: $suggestionId
      })

      // Connect to pulses
      CREATE (link)-[:SOURCE]->(source)
      CREATE (link)-[:TARGET]->(target)
      // Anchor to the context via HAS_RESONANCE (GOAL-294). Studio Bloom and the
      // graph neighborhood auth filter reach ResonanceLinks ONLY through
      // (FieldContext)-[:HAS_RESONANCE]->(rl); without this edge an accepted
      // resonance is invisible in every graph surface. Mirrors the assistant
      // create_resonance path (src/lib/chat/hitl.ts).
      CREATE (context)-[:HAS_RESONANCE]->(link)

      // Update suggestion status
      SET suggestion.status = 'accepted'
      SET suggestion.acceptedAt = datetime()

      RETURN link.id as linkId
    `,
      {
        suggestionId,
        sourcePulseId,
        targetPulseId,
        contextId,
        actorId,
        label: suggestion.label,
        description: suggestion.description,
        confidence: suggestion.confidence,
        evidence: suggestion.evidence,
      }
    )

    const linkId =
      Array.isArray(linkResult) && linkResult.length > 0
        ? linkResult[0].linkId
        : null

    if (!linkId) {
      // The compare-and-set guard matched nothing: a concurrent accept won the
      // race and already promoted this suggestion. Return that link idempotently
      // rather than 500ing — the caller's intent (this suggestion is accepted)
      // is satisfied.
      const existing = await graph.query<{ linkId: string | null }>(
        `MATCH (l:ResonanceLink {approvedFromSuggestion: $suggestionId})
         RETURN l.id AS linkId
         LIMIT 1`,
        { suggestionId }
      )
      return NextResponse.json({
        success: true,
        alreadyAccepted: true,
        suggestionId,
        linkId: existing?.[0]?.linkId ?? null,
        message: 'Suggestion has already been reviewed.',
        timestamp: new Date().toISOString(),
      })
    }

    console.log(
      `[Resonance Accept] ✓ Promoted suggestion ${suggestionId} to link ${linkId}`
    )

    // Audit log for the promotion, attributed to the accepting user. Linking
    // both pulses (LOGGED_FOR) surfaces this in the context's activity feed;
    // source and target always share a context (enforced at suggestion create),
    // so this stays within the suggestion's Space. Best-effort — a log hiccup
    // must not fail a successful accept — but awaited so the write actually
    // flushes before the serverless response returns (a floating promise can be
    // dropped when the function freezes).
    try {
      await createLog({
        userId: actorId,
        description: `Accepted resonance "${suggestion.label}"`,
        pulseIds: [sourcePulseId, targetPulseId],
        contextId,
        metadata: {
          event: 'resonance_accepted',
          linkId,
          suggestionId,
          contextId,
        },
      })
    } catch (logErr) {
      console.warn('[Resonance Accept] Failed to write activity log:', logErr)
    }

    // Notify the authors of the two connected pulses that a resonance was
    // discovered on their pulse. Best-effort: a notification failure must not
    // fail the accept. Self-notify is guarded inside createNotification (an
    // admin who authored a pulse won't get pinged for their own acceptance).
    try {
      const authors = await graph.query<{
        personId: string
        pulseLabel: string
      }>(
        `
        MATCH (p:FieldPulse)-[:INITIATED_BY|CREATED_BY]->(person:Person)
        WHERE p.id IN [$sourcePulseId, $targetPulseId]
        RETURN DISTINCT person.id AS personId,
               coalesce(p.title, p.content, 'your pulse') AS pulseLabel
        `,
        { sourcePulseId, targetPulseId }
      )
      await Promise.all(
        authors.map((a) =>
          createNotification({
            recipientId: a.personId,
            actorId,
            type: 'RESONANCE',
            title: 'New resonance on your pulse',
            message: `A resonance "${suggestion.label}" was discovered involving "${a.pulseLabel}"`,
            link: contextId
              ? `/protected/dashboard/field-context/${contextId}`
              : '/protected/dashboard',
            metadata: { linkId, suggestionId, contextId },
          })
        )
      )
    } catch (notifyErr) {
      console.warn('[Resonance Accept] notification fan-out failed:', notifyErr)
    }

    return NextResponse.json({
      success: true,
      message: 'Suggestion accepted and promoted to ResonanceLink',
      suggestionId,
      linkId,
      timestamp: new Date().toISOString(),
    })
  } catch (error: unknown) {
    console.error('[Resonance Accept] Error:', error)
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
