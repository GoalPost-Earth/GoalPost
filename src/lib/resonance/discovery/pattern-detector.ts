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
 * Create ResonanceLink nodes in the database (context-scoped)
 * Each link represents one semantic connection between two pulses
 */
async function createResonanceLinksInDatabase(
  contextId: string,
  pattern: z.infer<typeof ResonancePatternSchema>
): Promise<DiscoveredResonance[]> {
  const graph = await initGraph()

  const links: DiscoveredResonance[] = []

  // Create individual ResonanceLink nodes for each pulse connection
  for (const connection of pattern.pulseConnections) {
    // Create ResonanceLink and connect it to the context, source, and target
    const linkResult = await graph.query<{ linkId: string }>(
      `
      MATCH (context:FieldContext {id: $contextId})
      MATCH (source:FieldPulse {id: $sourcePulseId})
      MATCH (target:FieldPulse {id: $targetPulseId})
      
      // Ensure source and target are in the same context
      MATCH (context)-[:HAS_PULSE]->(source)
      MATCH (context)-[:HAS_PULSE]->(target)
      
      // Create ResonanceLink
      CREATE (link:ResonanceLink {
        id: 'rl_' + randomUUID(),
        label: $label,
        description: $description,
        confidence: $confidence,
        evidence: $evidence,
        createdAt: datetime()
      })
      
      // Connect to context and pulses
      CREATE (context)-[:HAS_RESONANCE]->(link)
      CREATE (link)-[:SOURCE]->(source)
      CREATE (link)-[:TARGET]->(target)
      
      RETURN link.id as linkId
    `,
      {
        contextId,
        sourcePulseId: connection.sourcePulseId,
        targetPulseId: connection.targetPulseId,
        label: pattern.label,
        description: pattern.description,
        confidence: connection.confidence,
        evidence: connection.evidence,
      }
    )

    const linkId =
      Array.isArray(linkResult) && linkResult.length > 0
        ? linkResult[0].linkId
        : null

    if (linkId) {
      links.push({
        linkId,
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

  return links
}

/**
 * Discover resonances for a specific pulse WITHIN ITS CONTEXT
 */
export async function discoverResonancesForPulse(
  pulseId: string
): Promise<DiscoveredResonance[]> {
  const graph = await initGraph()

  // Get the pulse and its context
  const pulseResult = await graph.query<{
    pulse: { id: string; content: string; createdAt: string }
    contextId: string
  }>(
    `
    MATCH (context:FieldContext)-[:HAS_PULSE]->(p:FieldPulse {id: $pulseId})
    RETURN {
      id: p.id,
      content: p.content,
      createdAt: toString(p.createdAt)
    } as pulse,
    context.id as contextId
  `,
    { pulseId }
  )

  if (!Array.isArray(pulseResult) || pulseResult.length === 0) {
    console.warn(`Pulse not found or has no context: ${pulseId}`)
    return []
  }

  const { pulse, contextId } = pulseResult[0]

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

  // Create resonance links in database
  const links = await createResonanceLinksInDatabase(contextId, pattern)

  return links
}

/**
 * Discover resonances for all contexts (or specific contexts)
 * Processes each context independently
 */
export async function discoverGlobalResonances(
  lastRunTimestamp?: string
): Promise<DiscoveredResonance[]> {
  const graph = await initGraph()

  // Get all contexts
  const contextsResult = await graph.query<{
    contextId: string
    contextTitle: string
  }>(
    `
    MATCH (context:FieldContext)
    RETURN context.id as contextId, context.title as contextTitle
  `,
    {}
  )

  if (!Array.isArray(contextsResult) || contextsResult.length === 0) {
    console.log('No contexts found for resonance discovery')
    return []
  }

  const contexts = contextsResult

  console.log(`Analyzing ${contexts.length} contexts for resonances...`)

  const allDiscoveredResonances: DiscoveredResonance[] = []

  // Process each context independently
  for (const { contextId, contextTitle } of contexts) {
    try {
      console.log(`Processing context: ${contextTitle} (${contextId})`)

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
        console.log(`Not enough pulses in context ${contextId}, skipping`)
        continue
      }

      const pulses = pulsesResult.map((r) => r.pulse)

      console.log(`  Found ${pulses.length} pulses in context ${contextId}`)

      // Discover resonances for each pulse in the context
      for (const pulse of pulses) {
        try {
          const resonances = await discoverResonancesForPulse(pulse.id)
          allDiscoveredResonances.push(...resonances)
        } catch (error) {
          console.error(
            `Failed to discover resonances for pulse ${pulse.id}:`,
            error
          )
        }
      }
    } catch (error) {
      console.error(`Failed to process context ${contextId}:`, error)
    }
  }

  console.log(
    `Discovered ${allDiscoveredResonances.length} total resonance links across all contexts`
  )

  return allDiscoveredResonances
}
