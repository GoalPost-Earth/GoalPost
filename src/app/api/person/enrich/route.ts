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
    // Ops/cron-only endpoint: bulk enrichment overwrites profile fields and
    // embeddings and burns LLM spend — it must never be anonymously
    // triggerable. Fail CLOSED when the secret is unconfigured (unlike the
    // legacy fail-open pattern) because no user-facing surface calls this.
    const cronSecret = process.env.CRON_SECRET
    const authHeader = request.headers.get('authorization')
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      console.warn('[Person Enrichment] Unauthorized enrich request attempted')
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: EnrichRequest = await request.json()
    const { personIds } = body

    const graph = await initGraph()

    // Get people to enrich
    let peopleToEnrich: string[]

    if (personIds && personIds.length > 0) {
      peopleToEnrich = personIds
    } else {
      // People to enrich: pulse authors PLUS the non-author contacts that
      // doc-ingestion attaches to a field (HAS_PERSON) or links to a pulse
      // (MENTIONED_IN, GOAL-298). Author-only selection silently skipped every
      // extracted :Person:PersonPulse, so their embeddings only ever landed via
      // the discover-resonances backfill. For a no-pulse contact,
      // enrichPersonFromPulses skips the LLM insight pass and just (re)generates
      // the name/description embedding — cheap and correct.
      const result = await graph.query<{ id: string }>(
        `
        MATCH (p:Person)
        WHERE EXISTS { (p)<-[:INITIATED_BY]-(:FieldPulse) }
           OR EXISTS { (:FieldContext)-[:HAS_PERSON]->(p) }
           OR EXISTS { (p)-[:MENTIONED_IN]->(:FieldPulse) }
        RETURN DISTINCT p.id as id
      `,
        {}
      )

      if (!Array.isArray(result) || result.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'No people to enrich found',
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
