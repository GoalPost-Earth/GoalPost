/**
 * Resonance discovery pattern detector
 * Uses LLM and vector similarity to discover semantic patterns across pulses
 */

import { ChatOpenAI } from '@langchain/openai'
import { getGraphInstance } from '@/modules/agent/tools/langchain-react-agent.tool'
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
  resonanceId: string
  label: string
  description: string
  links: Array<{
    linkId: string
    sourcePulseId: string
    targetPulseId: string
    confidence: number
    evidence: string
  }>
}

/**
 * Find semantically similar pulses using vector search
 */
async function findSimilarPulses(
  pulseId: string,
  threshold: number = 0.7,
  limit: number = 10
): Promise<Array<{ id: string; content: string; similarity: number }>> {
  const graph = getGraphInstance()

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

  if (!pulseResult.records.length || !pulseResult.records[0].get('embedding')) {
    return []
  }

  const embedding = pulseResult.records[0].get('embedding')

  // Use vector similarity search
  const similarResult = await graph.query<{
    pulse: { id: string; content: string }
    similarity: number
  }>(
    `
    CALL db.index.vector.queryNodes('pulseContentVectorIndex', $limit, $embedding)
    YIELD node, score
    WHERE node.id <> $pulseId AND score >= $threshold
    RETURN {id: node.id, content: node.content} as pulse, score as similarity
    ORDER BY similarity DESC
  `,
    { pulseId, embedding, limit, threshold }
  )

  return similarResult.records.map((r) => ({
    id: r.get('pulse').id,
    content: r.get('pulse').content,
    similarity: r.get('similarity'),
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

  const llm = new ChatOpenAI({
    modelName: 'gpt-4-turbo-preview',
    temperature: 0.2,
    openAIApiKey: process.env.OPENAI_API_KEY,
  })

  const pulseList = pulses
    .map((p, i) => `[${i}] ID: ${p.id}\n   Content: "${p.content}"`)
    .join('\n\n')

  const prompt = `Analyze the following pulses to discover resonance patterns - semantic, emotional, or thematic connections.

Pulses:
${pulseList}

Task:
1. Identify the strongest resonance pattern connecting these pulses (e.g., "grief", "momentum", "overload", "belonging", "focus")
2. Provide a clear label and description for the pattern
3. For each pair of pulses that share this resonance, explain WHY they connect and assign a confidence score (0-1)

Focus on:
- Emotional resonance (shared feelings, energy, mood)
- Thematic resonance (shared topics, concerns, aspirations)  
- Symbolic resonance (shared metaphors, meanings, values)

Be specific and evidence-based. Only create connections where the resonance is clear and meaningful.`

  const structuredLlm = llm.withStructuredOutput(ResonancePatternSchema)

  try {
    const pattern = await structuredLlm.invoke([
      {
        role: 'system',
        content:
          'You are an expert at discovering meaningful patterns and connections in human experiences and reflections.',
      },
      { role: 'user', content: prompt },
    ])

    return pattern as z.infer<typeof ResonancePatternSchema>
  } catch (error) {
    console.error('Failed to analyze resonance pattern:', error)
    return null
  }
}

/**
 * Create FieldResonance and ResonanceLink nodes in the database
 */
async function createResonanceInDatabase(
  pattern: z.infer<typeof ResonancePatternSchema>
): Promise<DiscoveredResonance> {
  const graph = getGraphInstance()

  // Create FieldResonance node using Neo4j's randomUUID()
  const resonanceResult = await graph.query<{ resonanceId: string }>(
    `
    CREATE (r:FieldResonance {
      id: 'res_' + randomUUID(),
      label: $label,
      description: $description,
      createdAt: datetime(),
      detectedBy: 'AI'
    })
    RETURN r.id as resonanceId
  `,
    {
      label: pattern.label,
      description: pattern.description,
    }
  )

  const resonanceId = resonanceResult.records[0].get('resonanceId')

  // Create ResonanceLink nodes
  const links: DiscoveredResonance['links'] = []

  for (const connection of pattern.pulseConnections) {
    const linkResult = await graph.query<{ linkId: string }>(
      `
      MATCH (source:FieldPulse {id: $sourcePulseId})
      MATCH (target:FieldPulse {id: $targetPulseId})
      MATCH (resonance:FieldResonance {id: $resonanceId})
      CREATE (link:ResonanceLink {
        id: 'rl_' + randomUUID(),
        confidence: $confidence,
        evidence: $evidence,
        createdAt: datetime()
      })
      CREATE (link)-[:SOURCE]->(source)
      CREATE (link)-[:TARGET]->(target)
      CREATE (link)-[:RESONATES_AS]->(resonance)
      RETURN link.id as linkId
    `,
      {
        sourcePulseId: connection.sourcePulseId,
        targetPulseId: connection.targetPulseId,
        resonanceId,
        confidence: connection.confidence,
        evidence: connection.evidence,
      }
    )

    const linkId = linkResult.records[0].get('linkId')

    links.push({
      linkId,
      sourcePulseId: connection.sourcePulseId,
      targetPulseId: connection.targetPulseId,
      confidence: connection.confidence,
      evidence: connection.evidence,
    })
  }

  return {
    resonanceId,
    label: pattern.label,
    description: pattern.description,
    links,
  }
}

/**
 * Discover resonances for a specific pulse
 */
export async function discoverResonancesForPulse(
  pulseId: string
): Promise<DiscoveredResonance[]> {
  const graph = getGraphInstance()

  // Get the pulse
  const pulseResult = await graph.query<{
    pulse: { id: string; content: string; createdAt: string }
  }>(
    `
    MATCH (p:FieldPulse {id: $pulseId})
    RETURN {
      id: p.id,
      content: p.content,
      createdAt: toString(p.createdAt)
    } as pulse
  `,
    { pulseId }
  )

  if (!pulseResult.records.length) {
    console.warn(`Pulse not found: ${pulseId}`)
    return []
  }

  const pulse = pulseResult.records[0].get('pulse')

  // Find similar pulses
  const similarPulses = await findSimilarPulses(pulseId, 0.7, 10)

  if (similarPulses.length === 0) {
    console.log(`No similar pulses found for ${pulseId}`)
    return []
  }

  // Analyze for resonance patterns
  const pulsesToAnalyze = [pulse, ...similarPulses]
  const pattern = await analyzeResonancePattern(pulsesToAnalyze)

  if (!pattern) {
    return []
  }

  // Create resonance in database
  const resonance = await createResonanceInDatabase(pattern)

  return [resonance]
}

/**
 * Discover resonances globally across all recent pulses
 */
export async function discoverGlobalResonances(
  lastRunTimestamp?: string
): Promise<DiscoveredResonance[]> {
  const graph = getGraphInstance()

  // Get all pulses created/modified since last run
  const query = lastRunTimestamp
    ? `MATCH (p:FieldPulse)
       WHERE p.modifiedAt > datetime($lastRunTimestamp) 
          OR p.createdAt > datetime($lastRunTimestamp)
       RETURN {id: p.id, content: p.content, createdAt: toString(p.createdAt)} as pulse
       ORDER BY p.createdAt DESC
       LIMIT 100`
    : `MATCH (p:FieldPulse)
       WHERE p.embedding IS NOT NULL
       RETURN {id: p.id, content: p.content, createdAt: toString(p.createdAt)} as pulse
       ORDER BY p.createdAt DESC
       LIMIT 50`

  const pulsesResult = await graph.query<{
    pulse: { id: string; content: string; createdAt: string }
  }>(query, lastRunTimestamp ? { lastRunTimestamp } : {})

  const pulses = pulsesResult.records.map((r) => r.get('pulse'))

  console.log(`Analyzing ${pulses.length} pulses for resonances...`)

  const discoveredResonances: DiscoveredResonance[] = []

  // Discover resonances for each pulse
  for (const pulse of pulses) {
    try {
      const resonances = await discoverResonancesForPulse(pulse.id)
      discoveredResonances.push(...resonances)
    } catch (error) {
      console.error(
        `Failed to discover resonances for pulse ${pulse.id}:`,
        error
      )
    }
  }

  return discoveredResonances
}
