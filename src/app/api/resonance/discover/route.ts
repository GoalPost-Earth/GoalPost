/**
 * Manual resonance discovery API
 * POST /api/resonance/discover
 *
 * Manually triggers resonance discovery across pulses
 * Can be run without the background workers
 */

import { NextRequest, NextResponse } from 'next/server'
import { discoverGlobalResonances } from '@/lib/resonance/discovery/pattern-detector'
import { generatePulseEmbeddings } from '@/lib/resonance/embeddings/pulse-embedder'
import { initGraph } from '@/modules/graph'

interface DiscoverRequest {
  lastRunTimestamp?: string // Optional: only discover for pulses created after this timestamp
}

export async function POST(request: NextRequest) {
  try {
    // Handle empty request body gracefully
    let body: DiscoverRequest = {}
    try {
      const text = await request.text()
      if (text && text.trim()) {
        body = JSON.parse(text)
      }
    } catch {
      // If parsing fails, use empty object as default
      console.log(
        '[Resonance Discovery API] No valid JSON body, using defaults'
      )
    }

    const { lastRunTimestamp } = body

    console.log('[Resonance Discovery API] Starting discovery workflow...', {
      lastRunTimestamp: lastRunTimestamp || 'all pulses',
    })

    // Step 1: Generate embeddings for pulses that don't have them
    const graph = await initGraph()

    const pulsesWithoutEmbeddings = await graph.query<{ id: string }>(
      `
      MATCH (p:FieldPulse)
      WHERE p.embedding IS NULL
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
        `[Resonance Discovery API] Generating embeddings for ${pulseIds.length} pulses...`
      )

      for (const pulseId of pulseIds) {
        try {
          await generatePulseEmbeddings(pulseId)
          console.log(
            `[Resonance Discovery API] ✓ Generated embeddings for ${pulseId}`
          )
        } catch (error) {
          console.error(
            `[Resonance Discovery API] ✗ Failed to generate embeddings for ${pulseId}:`,
            error
          )
        }
      }
    } else {
      console.log(
        '[Resonance Discovery API] All pulses already have embeddings'
      )
    }

    // Step 2: Run resonance discovery
    console.log('[Resonance Discovery API] Discovering resonance patterns...')
    const resonances = await discoverGlobalResonances(lastRunTimestamp)

    console.log(
      `[Resonance Discovery API] Discovered ${resonances.length} resonance patterns`
    )

    return NextResponse.json({
      success: true,
      resonancesDiscovered: resonances.length,
      resonances: resonances.map((r) => ({
        resonanceId: r.resonanceId,
        label: r.label,
        description: r.description,
        linksCreated: r.links.length,
        pulses: r.links.map((link) => ({
          sourcePulseId: link.sourcePulseId,
          targetPulseId: link.targetPulseId,
          confidence: link.confidence,
        })),
      })),
    })
  } catch (error: unknown) {
    console.error('[Resonance Discovery API] Error:', error)
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
