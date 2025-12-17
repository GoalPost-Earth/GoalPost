/**
 * Generate embeddings for pulses
 * POST /api/pulse/generate-embeddings
 *
 * Batch generates embeddings for pulses that don't have them yet
 */

import { NextRequest, NextResponse } from 'next/server'
import { generatePulseEmbeddings } from '@/lib/resonance/embeddings/pulse-embedder'
import { initGraph } from '@/modules/graph'

interface GenerateEmbeddingsRequest {
  pulseIds?: string[] // Optional: specific pulse IDs, otherwise generates for all
  limit?: number // Optional: limit number of pulses to process
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateEmbeddingsRequest = await request.json()
    const { pulseIds, limit = 50 } = body

    const graph = await initGraph()

    // Get pulses to process
    let pulsesToProcess: string[]

    if (pulseIds && pulseIds.length > 0) {
      pulsesToProcess = pulseIds
    } else {
      // Get all pulses without embeddings
      const result = await graph.query<{ id: string }>(
        `
        MATCH (p:FieldPulse)
        WHERE p.embedding IS NULL
        RETURN p.id as id
        LIMIT $limit
      `,
        { limit }
      )

      if (!Array.isArray(result) || result.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'No pulses need embeddings',
          processedCount: 0,
        })
      }

      pulsesToProcess = result.map((r) => r.id)
    }

    console.log(
      `[Generate Embeddings] Processing ${pulsesToProcess.length} pulses...`
    )

    const results = []
    const errors = []

    for (const pulseId of pulsesToProcess) {
      try {
        const result = await generatePulseEmbeddings(pulseId)
        results.push({
          pulseId: result.pulseId,
          embeddingsGenerated: result.chunkEmbeddings.length + 1,
        })
        console.log(`[Generate Embeddings] ✓ Processed pulse ${pulseId}`)
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error'
        errors.push({ pulseId, error: errorMessage })
        console.error(
          `[Generate Embeddings] ✗ Failed to process pulse ${pulseId}:`,
          errorMessage
        )
      }
    }

    return NextResponse.json({
      success: true,
      processedCount: results.length,
      errorCount: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: unknown) {
    console.error('[Generate Embeddings] Error:', error)
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
