/**
 * Accept a resonance suggestion and promote it to a ResonanceLink
 * POST /api/resonance/suggestions/[id]/accept
 */

import { NextRequest, NextResponse } from 'next/server'
import { initGraph } from '@/modules/graph'
import { resolveAuthenticatedUserId } from '@/app/api/auth/utils'
import { createNotification } from '@/lib/notifications/create-notification'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: suggestionId } = await params

    console.log(`[Resonance Accept] Processing suggestion: ${suggestionId}`)

    // The accepting user, resolved from the verified accessToken cookie / bearer.
    // Promoting a suggestion to a ResonanceLink is a graph write, so require a
    // valid authenticated caller (this route previously had no gate at all —
    // GOAL security review). A finer-grained Space-permission check (can this
    // user manage the suggestion's FieldContext) is a tracked follow-up.
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

    const { suggestion, sourcePulseId, targetPulseId, contextId } =
      suggestionResult[0]

    // Create the ResonanceLink from the suggestion
    const linkResult = await graph.query<{ linkId: string }>(
      `
      MATCH (source:FieldPulse {id: $sourcePulseId})
      MATCH (target:FieldPulse {id: $targetPulseId})
      MATCH (suggestion:ResonanceSuggestion {id: $suggestionId})
      
      // Create ResonanceLink with data from suggestion
      CREATE (link:ResonanceLink {
        id: 'rl_' + randomUUID(),
        label: $label,
        description: $description,
        confidence: $confidence,
        evidence: $evidence,
        createdAt: datetime(),
        approvedFromSuggestion: $suggestionId
      })
      
      // Connect to pulses (no context connection - resonances are pulse-level)
      CREATE (link)-[:SOURCE]->(source)
      CREATE (link)-[:TARGET]->(target)
      
      // Update suggestion status
      SET suggestion.status = 'accepted'
      SET suggestion.acceptedAt = datetime()
      
      RETURN link.id as linkId
    `,
      {
        suggestionId,
        sourcePulseId,
        targetPulseId,
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
      throw new Error('Failed to create ResonanceLink from suggestion')
    }

    console.log(
      `[Resonance Accept] ✓ Promoted suggestion ${suggestionId} to link ${linkId}`
    )

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
