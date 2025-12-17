/**
 * Person enrichment API
 * POST /api/person/enrich
 *
 * Enriches person profiles by analyzing their pulses
 * Generates person embeddings for similarity matching
 */

import { NextRequest, NextResponse } from 'next/server'
import { enrichPersonFromPulses } from '@/lib/resonance/embeddings/person-enricher'
import { initGraph } from '@/modules/graph'

interface EnrichRequest {
  personIds?: string[] // Optional: specific person IDs, otherwise enriches all
}

export async function POST(request: NextRequest) {
  try {
    const body: EnrichRequest = await request.json()
    const { personIds } = body

    const graph = await initGraph()

    // Get people to enrich
    let peopleToEnrich: string[]

    if (personIds && personIds.length > 0) {
      peopleToEnrich = personIds
    } else {
      // Get all people who have pulses
      const result = await graph.query<{ id: string }>(
        `
        MATCH (p:Person)<-[:INITIATED_BY]-(pulse:FieldPulse)
        RETURN DISTINCT p.id as id
      `,
        {}
      )

      if (!Array.isArray(result) || result.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'No people with pulses found',
          enrichedCount: 0,
        })
      }

      peopleToEnrich = result.map((r) => r.id)
    }

    console.log(
      `[Person Enrichment] Enriching ${peopleToEnrich.length} people...`
    )

    const results = []
    const errors = []

    for (const personId of peopleToEnrich) {
      try {
        const result = await enrichPersonFromPulses(personId)
        results.push({
          personId: result.personId,
          themes: result.insights.themes.length,
          passions: result.updatedProperties.passions?.length || 0,
          fieldsOfCare: result.updatedProperties.fieldsOfCare?.length || 0,
          traits: result.updatedProperties.traits?.length || 0,
        })
        console.log(`[Person Enrichment] ✓ Enriched person ${personId}`)
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error'
        errors.push({ personId, error: errorMessage })
        console.error(
          `[Person Enrichment] ✗ Failed to enrich person ${personId}:`,
          errorMessage
        )
      }
    }

    return NextResponse.json({
      success: true,
      enrichedCount: results.length,
      errorCount: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: unknown) {
    console.error('[Person Enrichment] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
