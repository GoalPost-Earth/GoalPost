/**
 * Cross-Context Resonance Discovery
 *
 * When a pulse is shared across contexts, its resonances should be discoverable
 * in any context where BOTH the source and target pulses exist.
 *
 * This resolver finds all resonances that:
 * 1. Are linked to the original source/target pulses
 * 2. Have both pulses present in the queried context
 */

import { initGraph } from '@/modules/graph'

export interface CrossContextResonance {
  resonanceId: string
  label: string
  description: string | null
  confidence: number
  sourceId: string
  targetId: string
  sourceTitle: string
  targetTitle: string
  confidence_percent: number
}

/**
 * Get all resonances visible in a specific context
 * Includes resonances where both source and target pulses are in the context,
 * even if the resonance was created in a different context
 */
export async function getContextResonancesWithSharedPulses(
  contextId: string
): Promise<CrossContextResonance[]> {
  const graph = await initGraph()

  const result = await graph.query<CrossContextResonance>(
    `
    MATCH (ctx:FieldContext {id: $contextId})
    MATCH (ctx)-[:HAS_PULSE]->(p1)
    MATCH (ctx)-[:HAS_PULSE]->(p2)
    WHERE p1 <> p2
    OPTIONAL MATCH (r:ResonanceLink)
    WHERE (r)-[:SOURCE]->(p1) AND (r)-[:TARGET]->(p2)
       OR (r)-[:SOURCE]->(p2) AND (r)-[:TARGET]->(p1)
    RETURN DISTINCT
      r.id as resonanceId,
      r.label as label,
      r.description as description,
      r.confidence as confidence,
      p1.id as sourceId,
      p2.id as targetId,
      p1.title as sourceTitle,
      p2.title as targetTitle,
      ROUND(r.confidence * 100, 1) as confidence_percent
    ORDER BY r.confidence DESC
    `,
    { contextId }
  )

  return result
}

/**
 * Check if a pulse can be shared to a context (authorization check)
 * Ensures user has write access to both source and target contexts
 */
export async function canSharePulseToContext(
  pulseId: string,
  sourceContextId: string,
  targetContextId: string,
  userId: string
): Promise<boolean> {
  const graph = await initGraph()

  const result = await graph.query<{ canShare: boolean }>(
    `
    MATCH (pulse {id: $pulseId})
    MATCH (sourceCtx:FieldContext {id: $sourceContextId})-[:HAS_PULSE]->(pulse)
    MATCH (targetCtx:FieldContext {id: $targetContextId})
    
    // Check user owns or is admin member of both spaces
    OPTIONAL MATCH (sourceCtx)<-[:HAS_CONTEXT]-(space1:Space)
    OPTIONAL MATCH (targetCtx)<-[:HAS_CONTEXT]-(space2:Space)
    OPTIONAL MATCH (space1)-[:OWNS]->(p1:Person {id: $userId})
    OPTIONAL MATCH (space1)-[:HAS_MEMBER]->(m1:SpaceMembership)-[:IS_MEMBER]->(p2:Person {id: $userId})
    WHERE m1.role IN ['ADMIN', 'MEMBER']
    OPTIONAL MATCH (space2)-[:OWNS]->(p3:Person {id: $userId})
    OPTIONAL MATCH (space2)-[:HAS_MEMBER]->(m2:SpaceMembership)-[:IS_MEMBER]->(p4:Person {id: $userId})
    WHERE m2.role IN ['ADMIN', 'MEMBER']
    
    RETURN 
      (p1 IS NOT NULL OR p2 IS NOT NULL) AND 
      (p3 IS NOT NULL OR p4 IS NOT NULL) as canShare
    `,
    { pulseId, sourceContextId, targetContextId, userId }
  )

  return result[0]?.canShare ?? false
}

/**
 * Get all contexts where a pulse is shared
 */
export async function getPulseContexts(pulseId: string) {
  const graph = await initGraph()

  const result = await graph.query<{
    contextId: string
    contextTitle: string
    spaceName: string
    spaceType: string
  }>(
    `
    MATCH (pulse {id: $pulseId})
    MATCH (ctx:FieldContext)-[:HAS_PULSE]->(pulse)
    OPTIONAL MATCH (ctx)<-[:HAS_CONTEXT]-(space:Space)
    RETURN 
      ctx.id as contextId,
      ctx.title as contextTitle,
      space.name as spaceName,
      labels(space)[0] as spaceType
    ORDER BY ctx.title
    `,
    { pulseId }
  )

  return result
}
