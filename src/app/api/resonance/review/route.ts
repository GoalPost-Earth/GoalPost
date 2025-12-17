/**
 * Resonance review API for human-in-the-loop confirmation
 * POST /api/resonance/review
 *
 * Allows users to review, confirm, edit, or reject AI-generated resonances
 */

import { NextRequest, NextResponse } from 'next/server'
import { initGraph } from '@/modules/graph'

interface ReviewResonanceLinkRequest {
  linkId: string
  action: 'confirm' | 'edit' | 'reject'
  confidence?: number // New confidence score if editing
  evidence?: string // New evidence text if editing
  reviewerId: string // Person who reviewed
}

interface UpdateResonanceLabelRequest {
  resonanceId: string
  label?: string
  description?: string
  reviewerId: string
}

interface ResonanceLinkDetail {
  linkId: string
  confidence: number
  evidence: string
  createdAt: string
  reviewedAt?: string
  reviewedBy?: string
  status: 'pending' | 'confirmed' | 'rejected'
  sourcePulse: {
    id: string
    content: string
  }
  targetPulse: {
    id: string
    content: string
  }
  resonance: {
    id: string
    label: string
    description: string
  }
}

// GET /api/resonance/review - Get pending resonances for review
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '20')
    const minConfidence = parseFloat(searchParams.get('minConfidence') || '0')
    const maxConfidence = parseFloat(searchParams.get('maxConfidence') || '1')

    const graph = await initGraph()

    const query = `
      MATCH (link:ResonanceLink)-[:SOURCE]->(source:FieldPulse)
      MATCH (link)-[:TARGET]->(target:FieldPulse)
      MATCH (link)-[:RESONATES_AS]->(resonance:FieldResonance)
      WHERE link.confidence >= $minConfidence 
        AND link.confidence <= $maxConfidence
        AND link.reviewedAt IS NULL
      RETURN {
        linkId: link.id,
        confidence: link.confidence,
        evidence: link.evidence,
        createdAt: toString(link.createdAt),
        status: COALESCE(link.status, 'pending'),
        sourcePulse: {id: source.id, content: source.content},
        targetPulse: {id: target.id, content: target.content},
        resonance: {id: resonance.id, label: resonance.label, description: resonance.description}
      } as linkDetail
      ORDER BY link.createdAt DESC
      LIMIT $limit
    `

    const result = await graph.query<{ linkDetail: ResonanceLinkDetail }>(
      query,
      {
        limit,
        minConfidence,
        maxConfidence,
      }
    )

    const pendingResonances = Array.isArray(result)
      ? result.map((r) => r.linkDetail)
      : []

    return NextResponse.json({
      success: true,
      count: pendingResonances.length,
      resonances: pendingResonances,
    })
  } catch (error: unknown) {
    console.error('Error fetching pending resonances:', error)
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

// POST /api/resonance/review - Review a resonance link
export async function POST(request: NextRequest) {
  try {
    const body: ReviewResonanceLinkRequest | UpdateResonanceLabelRequest =
      await request.json()

    const graph = await initGraph()

    // Check if this is a link review or label update
    if ('linkId' in body) {
      const { linkId, action, confidence, evidence, reviewerId } = body

      if (!linkId || !action || !reviewerId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Missing required fields: linkId, action, reviewerId',
          },
          { status: 400 }
        )
      }

      switch (action) {
        case 'confirm':
          await graph.query(
            `
            MATCH (link:ResonanceLink {id: $linkId})
            MATCH (reviewer:Person {id: $reviewerId})
            SET link.status = 'confirmed',
                link.reviewedAt = datetime(),
                link.reviewedBy = reviewer.id
          `,
            { linkId, reviewerId }
          )
          break

        case 'edit':
          if (confidence === undefined && !evidence) {
            return NextResponse.json(
              {
                success: false,
                error: 'Must provide confidence or evidence to edit',
              },
              { status: 400 }
            )
          }

          const updates: string[] = []
          const params: Record<string, unknown> = { linkId, reviewerId }

          if (confidence !== undefined) {
            updates.push('link.confidence = $confidence')
            params.confidence = confidence
          }

          if (evidence) {
            updates.push('link.evidence = $evidence')
            params.evidence = evidence
          }

          await graph.query(
            `
            MATCH (link:ResonanceLink {id: $linkId})
            MATCH (reviewer:Person {id: $reviewerId})
            SET ${updates.join(', ')},
                link.status = 'confirmed',
                link.reviewedAt = datetime(),
                link.reviewedBy = reviewer.id,
                link.editedBy = reviewer.id
          `,
            params
          )
          break

        case 'reject':
          await graph.query(
            `
            MATCH (link:ResonanceLink {id: $linkId})
            MATCH (reviewer:Person {id: $reviewerId})
            SET link.status = 'rejected',
                link.reviewedAt = datetime(),
                link.reviewedBy = reviewer.id
          `,
            { linkId, reviewerId }
          )
          break

        default:
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid action. Must be confirm, edit, or reject',
            },
            { status: 400 }
          )
      }

      return NextResponse.json({
        success: true,
        message: `Resonance link ${action}ed successfully`,
        linkId,
        action,
      })
    } else if ('resonanceId' in body) {
      const { resonanceId, label, description, reviewerId } = body

      if (!resonanceId || !reviewerId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Missing required fields: resonanceId, reviewerId',
          },
          { status: 400 }
        )
      }

      if (!label && !description) {
        return NextResponse.json(
          {
            success: false,
            error: 'Must provide label or description to update',
          },
          { status: 400 }
        )
      }

      const updates: string[] = []
      const params: Record<string, unknown> = { resonanceId, reviewerId }

      if (label) {
        updates.push('r.label = $label')
        params.label = label
      }

      if (description) {
        updates.push('r.description = $description')
        params.description = description
      }

      await graph.query(
        `
        MATCH (r:FieldResonance {id: $resonanceId})
        MATCH (reviewer:Person {id: $reviewerId})
        SET ${updates.join(', ')},
            r.editedAt = datetime(),
            r.editedBy = reviewer.id
      `,
        params
      )

      return NextResponse.json({
        success: true,
        message: 'Resonance label updated successfully',
        resonanceId,
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    )
  } catch (error: unknown) {
    console.error('Error reviewing resonance:', error)
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
