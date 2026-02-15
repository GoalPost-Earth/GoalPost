/**
 * Resonance discovery pattern detector
 * Discovers semantic connections between pulses WITHIN the same FieldContext
 */

import { getAnalysisProvider } from '@/lib/llm'
import { initGraph } from '../../../modules/graph'
import { z } from 'zod'

const ResonancePatternSchema = z.object({
  label: z
    .string()
    .describe(
      'Short label for the resonance pattern (e.g., "grief", "momentum", "scarcity")'
    ),
  description: z.string().describe('Detailed description of the pattern'),
  pulseConnections: z
    .array(
      z.object({
        sourcePulseId: z.string(),
        targetPulseId: z.string(),
        confidence: z.number().min(0).max(1).describe('Confidence score 0-1'),
        evidence: z
          .string()
          .describe('Explanation of why these pulses resonate'),
      })
    )
    .describe('Connections between pulses showing this pattern'),
})

export interface DiscoveredResonance {
  linkId: string
  contextId: string
  label: string
  description: string
  sourcePulseId: string
  targetPulseId: string
  confidence: number
  evidence: string
}

/**
 * Find semantically similar pulses WITHIN THE SAME CONTEXT using vector search
 */
async function findSimilarPulsesInContext(
  pulseId: string,
  contextId: string,
  threshold: number = 0.7,
  limit: number = 10
): Promise<Array<{ id: string; content: string; similarity: number }>> {
  const graph = await initGraph()

  // Get the pulse embedding
  const pulseResult = await graph.query<{
    embedding: number[]
  }>(
    `
    MATCH (p:FieldPulse {id: $pulseId})
    RETURN p.embedding as embedding
  `,
    { pulseId }
  )

  if (
    !Array.isArray(pulseResult) ||
    pulseResult.length === 0 ||
    !pulseResult[0].embedding
  ) {
    return []
  }

  const embedding = pulseResult[0].embedding

  // Use vector similarity search, filtered to same context
  const similarResult = await graph.query<{
    pulse: { id: string; content: string }
    similarity: number
  }>(
    `
    CALL db.index.vector.queryNodes('pulseContentVectorIndex', $limit * 3, $embedding)
    YIELD node, score
    WITH node, score
    MATCH (context:FieldContext {id: $contextId})-[:HAS_PULSE]->(node)
    WHERE node.id <> $pulseId AND score >= $threshold
    RETURN {id: node.id, content: node.content} as pulse, score as similarity
    ORDER BY similarity DESC
    LIMIT $limit
  `,
    { pulseId, contextId, threshold, limit, embedding }
  )

  if (!Array.isArray(similarResult) || similarResult.length === 0) {
    return []
  }

  return similarResult.map((r) => ({
    id: r.pulse.id,
    content: r.pulse.content,
    similarity: r.similarity,
  }))
}

/**
 * Analyze a cluster of similar pulses to extract resonance patterns using LLM
 */
async function analyzeResonancePattern(
  pulses: Array<{ id: string; content: string; createdAt?: string }>
): Promise<z.infer<typeof ResonancePatternSchema> | null> {
  if (pulses.length < 2) {
    return null
  }

  const provider = getAnalysisProvider()

  const prompt = `You are analyzing ${pulses.length} related pulses to discover a meaningful semantic pattern.

Pulses:
${pulses.map((p, i) => `${i + 1}. (ID: ${p.id}) ${p.content}`).join('\n')}

Your task:
1. Identify the SINGLE most meaningful resonance pattern across these pulses
2. Give it a short, evocative label (1-3 words)
3. Write a clear description explaining what the pattern represents
4. For each pair of pulses that share this resonance, explain WHY they connect and assign a confidence score (0-1)

Focus on:
- Emotional resonance (shared feelings, energy, mood)
- Thematic resonance (shared topics, concerns, aspirations)  
- Symbolic resonance (shared metaphors, meanings, values)

Be specific and evidence-based. Only create connections where the resonance is clear and meaningful.`

  try {
    const pattern = await provider.structuredOutput<
      z.infer<typeof ResonancePatternSchema>
    >(
      [
        {
          role: 'system',
          content:
            'You are an expert at discovering meaningful patterns and connections in human experiences and reflections.',
        },
        { role: 'user', content: prompt },
      ],
      { schema: ResonancePatternSchema, temperature: 0.2 }
    )

    return pattern as z.infer<typeof ResonancePatternSchema>
  } catch (error) {
    console.error('Failed to analyze resonance pattern:', error)
    return null
  }
}

/**
 * Create ResonanceSuggestion nodes in the database (not direct links)
 * Each suggestion represents one proposed semantic connection between two pulses
 * Users must accept/decline these suggestions before they become ResonanceLink nodes
 */
async function createResonanceSuggestionsInDatabase(
  contextId: string,
  spaceId: string,
  pattern: z.infer<typeof ResonancePatternSchema>
): Promise<DiscoveredResonance[]> {
  const graph = await initGraph()

  const suggestions: DiscoveredResonance[] = []

  // Create individual ResonanceSuggestion nodes for each pulse connection
  for (const connection of pattern.pulseConnections) {
    // Create ResonanceSuggestion and connect it to the space, context, source, and target
    const suggestionResult = await graph.query<{ suggestionId: string }>(
      `
      MATCH (space:WeSpace {id: $spaceId})
      MATCH (context:FieldContext {id: $contextId})
      MATCH (source:FieldPulse {id: $sourcePulseId})
      MATCH (target:FieldPulse {id: $targetPulseId})
      
      // Ensure source and target are in the same context
      MATCH (context)-[:HAS_PULSE]->(source)
      MATCH (context)-[:HAS_PULSE]->(target)
      MATCH (space)-[:HAS_CONTEXT]->(context)
      
      // Create ResonanceSuggestion
      CREATE (suggestion:ResonanceSuggestion {
        id: 'rs_' + randomUUID(),
        label: $label,
        description: $description,
        confidence: $confidence,
        evidence: $evidence,
        status: 'pending',
        createdAt: datetime()
      })
      
      // Connect to space, context and pulses
      CREATE (space)-[:HAS_SUGGESTION]->(suggestion)
      CREATE (context)-[:HAS_SUGGESTION]->(suggestion)
      CREATE (suggestion)-[:SOURCE]->(source)
      CREATE (suggestion)-[:TARGET]->(target)
      
      RETURN suggestion.id as suggestionId
    `,
      {
        spaceId,
        contextId,
        sourcePulseId: connection.sourcePulseId,
        targetPulseId: connection.targetPulseId,
        label: pattern.label,
        description: pattern.description,
        confidence: connection.confidence,
        evidence: connection.evidence,
      }
    )

    const suggestionId =
      Array.isArray(suggestionResult) && suggestionResult.length > 0
        ? suggestionResult[0].suggestionId
        : null

    if (suggestionId) {
      suggestions.push({
        linkId: suggestionId, // Using linkId field for backwards compatibility
        contextId,
        label: pattern.label,
        description: pattern.description,
        sourcePulseId: connection.sourcePulseId,
        targetPulseId: connection.targetPulseId,
        confidence: connection.confidence,
        evidence: connection.evidence,
      })
    }
  }

  return suggestions
}

/**
 * Discover resonances for a specific pulse WITHIN ITS CONTEXT
 * Creates ResonanceSuggestion nodes (pending approval) instead of direct links
 */
export async function discoverResonancesForPulse(
  pulseId: string,
  spaceId?: string
): Promise<DiscoveredResonance[]> {
  const graph = await initGraph()

  // Get the pulse and its context
  const pulseResult = await graph.query<{
    pulse: { id: string; content: string; createdAt: string }
    contextId: string
    spaceId: string
  }>(
    spaceId
      ? `
        MATCH (space:WeSpace {id: $spaceId})-[:HAS_CONTEXT]->(context:FieldContext)-[:HAS_PULSE]->(p:FieldPulse {id: $pulseId})
        RETURN {
          id: p.id,
          content: p.content,
          createdAt: toString(p.createdAt)
        } as pulse,
        context.id as contextId,
        space.id as spaceId
      `
      : `
        MATCH (context:FieldContext)-[:HAS_PULSE]->(p:FieldPulse {id: $pulseId})
        RETURN {
          id: p.id,
          content: p.content,
          createdAt: toString(p.createdAt)
        } as pulse,
        context.id as contextId,
        null as spaceId
      `,
    spaceId ? { pulseId, spaceId } : { pulseId }
  )

  if (!Array.isArray(pulseResult) || pulseResult.length === 0) {
    console.warn(`Pulse not found or has no context: ${pulseId}`)
    return []
  }

  const { pulse, contextId, spaceId: foundSpaceId } = pulseResult[0]

  // Find similar pulses WITHIN THE SAME CONTEXT
  const similarPulses = await findSimilarPulsesInContext(
    pulseId,
    contextId,
    0.7,
    10
  )

  if (similarPulses.length === 0) {
    console.log(
      `No similar pulses found for ${pulseId} in context ${contextId}`
    )
    return []
  }

  // Analyze for resonance patterns
  const pulsesToAnalyze = [pulse, ...similarPulses]
  const pattern = await analyzeResonancePattern(pulsesToAnalyze)

  if (!pattern) {
    return []
  }

  // If spaceId not provided, use the one found from the query
  const effectiveSpaceId = spaceId || foundSpaceId
  if (!effectiveSpaceId) {
    console.warn(
      `Cannot create suggestions: no space associated with pulse ${pulseId}`
    )
    return []
  }

  // Create resonance suggestions in database
  const suggestions = await createResonanceSuggestionsInDatabase(
    contextId,
    effectiveSpaceId,
    pattern
  )

  return suggestions
}

/**
 * Discover resonances for a specific space
 * Processes all contexts within the space independently
 */
export async function discoverResonancesForSpace(
  spaceId: string,
  lastRunTimestamp?: string
): Promise<DiscoveredResonance[]> {
  const graph = await initGraph()

  // Verify space exists
  const spaceResult = await graph.query<{ spaceId: string }>(
    `MATCH (space:WeSpace {id: $spaceId}) RETURN space.id as spaceId`,
    { spaceId }
  )

  if (!Array.isArray(spaceResult) || spaceResult.length === 0) {
    console.error(`Space not found: ${spaceId}`)
    return []
  }

  // Get all contexts for this space
  const contextsResult = await graph.query<{
    contextId: string
    contextTitle: string
  }>(
    `
    MATCH (space:WeSpace {id: $spaceId})-[:HAS_CONTEXT]->(context:FieldContext)
    RETURN context.id as contextId, context.title as contextTitle
  `,
    { spaceId }
  )

  if (!Array.isArray(contextsResult) || contextsResult.length === 0) {
    console.log(`No contexts found in space ${spaceId}`)
    return []
  }

  const contexts = contextsResult

  console.log(
    `[Space Discovery] Analyzing ${contexts.length} contexts in space ${spaceId} for resonances...`
  )

  const allDiscoveredResonances: DiscoveredResonance[] = []

  // Process each context independently
  for (const { contextId, contextTitle } of contexts) {
    try {
      console.log(
        `[Space Discovery] Processing context: ${contextTitle} (${contextId})`
      )

      // Get pulses in this context
      const query = lastRunTimestamp
        ? `MATCH (context:FieldContext {id: $contextId})-[:HAS_PULSE]->(p:FieldPulse)
           WHERE p.modifiedAt > datetime($lastRunTimestamp) 
              OR p.createdAt > datetime($lastRunTimestamp)
           RETURN {id: p.id, content: p.content, createdAt: toString(p.createdAt)} as pulse
           ORDER BY p.createdAt DESC
           LIMIT 50`
        : `MATCH (context:FieldContext {id: $contextId})-[:HAS_PULSE]->(p:FieldPulse)
           RETURN {id: p.id, content: p.content, createdAt: toString(p.createdAt)} as pulse
           ORDER BY p.createdAt DESC
           LIMIT 30`

      const pulsesResult = await graph.query<{
        pulse: { id: string; content: string; createdAt: string }
      }>(
        query,
        lastRunTimestamp ? { contextId, lastRunTimestamp } : { contextId }
      )

      if (!Array.isArray(pulsesResult) || pulsesResult.length < 2) {
        console.log(
          `[Space Discovery] Not enough pulses in context ${contextId}, skipping`
        )
        continue
      }

      const pulses = pulsesResult.map((r) => r.pulse)

      console.log(
        `[Space Discovery] Found ${pulses.length} pulses in context ${contextId}`
      )

      // Discover resonances for each pulse in the context
      for (const pulse of pulses) {
        try {
          const resonances = await discoverResonancesForPulse(pulse.id, spaceId)
          allDiscoveredResonances.push(...resonances)
        } catch (error) {
          console.error(
            `[Space Discovery] Failed to discover resonances for pulse ${pulse.id}:`,
            error
          )
        }
      }
    } catch (error) {
      console.error(
        `[Space Discovery] Failed to process context ${contextId}:`,
        error
      )
    }
  }

  console.log(
    `[Space Discovery] Discovered ${allDiscoveredResonances.length} resonance suggestions in space ${spaceId}`
  )

  return allDiscoveredResonances
}

/**
 * Discover resonances for all spaces (global discovery)
 * Processes each space independently
 */
export async function discoverGlobalResonances(
  lastRunTimestamp?: string
): Promise<DiscoveredResonance[]> {
  const graph = await initGraph()

  // Get all spaces
  const spacesResult = await graph.query<{
    spaceId: string
    spaceName: string
  }>(
    `
    MATCH (space:WeSpace)
    RETURN space.id as spaceId, space.name as spaceName
  `,
    {}
  )

  if (!Array.isArray(spacesResult) || spacesResult.length === 0) {
    console.log('[Global Discovery] No spaces found')
    return []
  }

  const spaces = spacesResult

  console.log(
    `[Global Discovery] Discovering resonances for ${spaces.length} spaces...`
  )

  const allDiscoveredResonances: DiscoveredResonance[] = []

  // Process each space independently
  for (const { spaceId, spaceName } of spaces) {
    try {
      console.log(
        `[Global Discovery] Processing space: ${spaceName} (${spaceId})`
      )
      const resonances = await discoverResonancesForSpace(
        spaceId,
        lastRunTimestamp
      )
      allDiscoveredResonances.push(...resonances)
    } catch (error) {
      console.error(
        `[Global Discovery] Failed to process space ${spaceId}:`,
        error
      )
    }
  }

  console.log(
    `[Global Discovery] Discovered ${allDiscoveredResonances.length} total resonance suggestions across all spaces`
  )

  return allDiscoveredResonances
}
