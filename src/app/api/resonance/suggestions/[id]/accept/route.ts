/**
 * Accept a resonance suggestion and promote it to a ResonanceLink
 * POST /api/resonance/suggestions/[id]/accept
 */

import { NextRequest, NextResponse } from 'next/server'
import { initGraph } from '@/modules/graph'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: suggestionId } = await params

    console.log(`[Resonance Accept] Processing suggestion: ${suggestionId}`)

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

    const { suggestion, contextId, sourcePulseId, targetPulseId } =
      suggestionResult[0]

    // Create the ResonanceLink from the suggestion
    const linkResult = await graph.query<{ linkId: string }>(
      `
      MATCH (context:FieldContext {id: $contextId})
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
      
      // Connect to context and pulses
      CREATE (context)-[:HAS_RESONANCE]->(link)
      CREATE (link)-[:SOURCE]->(source)
      CREATE (link)-[:TARGET]->(target)
      
      // Update suggestion status
      SET suggestion.status = 'accepted'
      SET suggestion.acceptedAt = datetime()
      
      RETURN link.id as linkId
    `,
      {
        suggestionId,
        contextId,
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
