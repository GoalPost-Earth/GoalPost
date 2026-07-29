/**
 * Vercel Scheduled Function: Discover Resonances
 * Runs daily at midnight UTC (0 0 * * *)
 *
 * This endpoint is called by Vercel's cron service and triggers
 * the resonance discovery workflow across all spaces.
 *
 * Resonances are created as SUGGESTIONS (ResonanceSuggestion nodes)
 * that users must accept or decline before they become ResonanceLink nodes.
 */

import { NextRequest, NextResponse } from 'next/server'
import { discoverGlobalResonances } from '@/lib/resonance/discovery/pattern-detector'
import { generatePulseEmbeddings } from '@/lib/resonance/embeddings/pulse-embedder'
import { generatePersonEmbedding } from '@/lib/resonance/embeddings/person-embedder'
import { initGraph } from '@/modules/graph'

// Vercel cron invocations are always GET. The full sweep (embeddings + LLM
// pattern analysis across every space × context) can run for minutes; 300s is
// the Pro plan ceiling for serverless functions (raising it requires Fluid
// Compute, which is a project-level setting, not a code change).
export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET(request: NextRequest) {
  try {
    // Verify this is a Vercel cron request
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.warn('[Resonance Cron] Unauthorized cron request attempted')
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log(
      '[Resonance Cron] Starting scheduled resonance discovery across all spaces...'
    )

    // Step 1: Generate embeddings for pulses that don't have them
    const graph = await initGraph()

    const pulsesWithoutEmbeddings = await graph.query<{ id: string }>(
      `
      MATCH (p:FieldPulse)
      WHERE p.embedding IS NULL
        // Soft-deleted pulses (GOAL-319) await the purge cron — never spend
        // embedding calls on them.
        AND p.deletedAt IS NULL
      RETURN p.id as id
      LIMIT 100
    `,
      {}
    )

    // Neo4jGraph returns plain array, not {records: []}
    if (
      Array.isArray(pulsesWithoutEmbeddings) &&
      pulsesWithoutEmbeddings.length > 0
    ) {
      const pulseIds = pulsesWithoutEmbeddings.map((r) => r.id)
      console.log(
        `[Resonance Cron] Generating embeddings for ${pulseIds.length} pulses...`
      )

      for (const pulseId of pulseIds) {
        try {
          await generatePulseEmbeddings(pulseId)
          console.log(`[Resonance Cron] ✓ Generated embeddings for ${pulseId}`)
        } catch (error) {
          console.error(
            `[Resonance Cron] ✗ Failed to generate embeddings for ${pulseId}:`,
            error
          )
        }
      }
    } else {
      console.log(
        '[Resonance Cron] All pulses already have embeddings, skipping generation'
      )
    }

    // Step 1b: Generate embeddings for people that don't have them.
    // Two write paths rely on this sweep: document ingest creates
    // PersonPulses without an embedding, and update_person nulls the
    // embedding on semantic edits (person-pulse-resolver.ts). Without it,
    // those people never enter vector search or resonance discovery.
    // The trim() filter skips nameless, contentless Person nodes — there is
    // nothing to embed and they would otherwise error on every nightly run.
    // Known gap (safe direction): the filter checks name/description only,
    // while the embedder can also embed passions/fieldsOfCare/traits — a
    // person whose ONLY content is enriched arrays is never swept. Arrays
    // can't be string-concatenated here, and such nodes don't occur in
    // practice (enrichment implies a named person).
    const peopleWithoutEmbeddings = await graph.query<{ id: string }>(
      `
      MATCH (p:Person)
      WHERE p.embedding IS NULL
        AND trim(coalesce(p.name, '') + coalesce(p.firstName, '')
          + coalesce(p.lastName, '') + coalesce(p.description, '')) <> ''
      RETURN p.id as id
      LIMIT 100
    `,
      {}
    )

    if (
      Array.isArray(peopleWithoutEmbeddings) &&
      peopleWithoutEmbeddings.length > 0
    ) {
      const personIds = peopleWithoutEmbeddings.map((r) => r.id)
      console.log(
        `[Resonance Cron] Generating embeddings for ${personIds.length} people...`
      )

      for (const personId of personIds) {
        try {
          await generatePersonEmbedding(personId)
          console.log(
            `[Resonance Cron] ✓ Generated person embedding for ${personId}`
          )
        } catch (error) {
          console.error(
            `[Resonance Cron] ✗ Failed to generate person embedding for ${personId}:`,
            error
          )
        }
      }
    } else {
      console.log(
        '[Resonance Cron] All people already have embeddings, skipping generation'
      )
    }

    // Step 2: Run resonance discovery (space-scoped, creates suggestions instead of links)
    console.log(
      '[Resonance Cron] Discovering resonance suggestions across spaces...'
    )
    const resonances = await discoverGlobalResonances()

    console.log(
      `[Resonance Cron] ✓ Completed discovery: created ${resonances.length} resonance suggestions`
    )

    return NextResponse.json({
      success: true,
      message:
        'Resonance discovery completed successfully (suggestions created)',
      suggestionsCreated: resonances.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error: unknown) {
    console.error('[Resonance Cron] Error during discovery:', error)
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
