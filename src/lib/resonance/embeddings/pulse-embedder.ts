/**
 * Pulse embedding service
 * Generates embeddings for pulses by combining pulse content with conversation chunks
 */

import { OpenAIEmbeddings } from '@langchain/openai'
import { getGraphInstance } from '@/modules/agent/tools/langchain-react-agent.tool'

export interface ConversationChunkNode {
  id: string
  content: string
  order: number
  role: string
  embedding?: number[]
}

export interface PulseEmbeddingResult {
  pulseId: string
  embedding: number[]
  chunkEmbeddings: Array<{
    chunkId: string
    embedding: number[]
  }>
}

/**
 * Generate embedding for a single text using OpenAI
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: 'text-embedding-3-small',
  })

  const embedding = await embeddings.embedQuery(text)
  return embedding
}

/**
 * Generate embeddings for pulse and all its conversation chunks
 * Stores individual chunk embeddings and aggregated pulse embedding
 *
 * @param pulseId - The ID of the pulse to generate embeddings for
 * @returns Embedding results with pulse and chunk embeddings
 */
export async function generatePulseEmbeddings(
  pulseId: string
): Promise<PulseEmbeddingResult> {
  const graph = getGraphInstance()

  // Fetch pulse content and all related conversation chunks
  const result = await graph.query<{
    pulse: { id: string; content: string }
    chunks: ConversationChunkNode[]
  }>(
    `
    MATCH (p:FieldPulse {id: $pulseId})
    OPTIONAL MATCH (p)-[:HAS_CHUNK]->(c:ConversationChunk)
    RETURN 
      {id: p.id, content: p.content} as pulse,
      collect({
        id: c.id, 
        content: c.content, 
        order: c.order, 
        role: c.role
      }) as chunks
  `,
    { pulseId }
  )

  if (!result.records.length) {
    throw new Error(`Pulse not found: ${pulseId}`)
  }

  const { pulse, chunks } = result.records[0].toObject()

  // Generate embeddings for each chunk
  const chunkEmbeddings: Array<{ chunkId: string; embedding: number[] }> = []

  if (chunks && chunks.length > 0) {
    // Sort chunks by order
    const sortedChunks = chunks
      .filter((c) => c.id) // Filter out null chunks from OPTIONAL MATCH
      .sort((a, b) => a.order - b.order)

    for (const chunk of sortedChunks) {
      const embedding = await generateEmbedding(chunk.content)
      chunkEmbeddings.push({
        chunkId: chunk.id,
        embedding,
      })

      // Store chunk embedding in database
      await graph.query(
        `
        MATCH (c:ConversationChunk {id: $chunkId})
        CALL db.create.setNodeVectorProperty(c, 'embedding', $embedding)
      `,
        { chunkId: chunk.id, embedding }
      )
    }
  }

  // Generate pulse embedding by combining pulse content with all chunk content
  let combinedText = pulse.content
  if (chunks && chunks.length > 0) {
    const chunkTexts = chunks
      .filter((c) => c.id)
      .sort((a, b) => a.order - b.order)
      .map((c) => c.content)
      .join(' ')
    combinedText = `${pulse.content}\n\nContext: ${chunkTexts}`
  }

  const pulseEmbedding = await generateEmbedding(combinedText)

  // Store pulse embedding in database
  await graph.query(
    `
    MATCH (p:FieldPulse {id: $pulseId})
    SET p.modifiedAt = datetime()
    CALL db.create.setNodeVectorProperty(p, 'embedding', $embedding)
  `,
    { pulseId, embedding: pulseEmbedding }
  )

  return {
    pulseId,
    embedding: pulseEmbedding,
    chunkEmbeddings,
  }
}

/**
 * Batch generate embeddings for multiple pulses
 *
 * @param pulseIds - Array of pulse IDs
 * @returns Array of embedding results
 */
export async function batchGeneratePulseEmbeddings(
  pulseIds: string[]
): Promise<PulseEmbeddingResult[]> {
  const results: PulseEmbeddingResult[] = []

  for (const pulseId of pulseIds) {
    try {
      const result = await generatePulseEmbeddings(pulseId)
      results.push(result)
    } catch (error) {
      console.error(
        `Failed to generate embeddings for pulse ${pulseId}:`,
        error
      )
    }
  }

  return results
}

/**
 * Generate embedding for conversation chunks without a pulse
 * Used during conversation before pulse creation
 *
 * @param chunks - Array of conversation chunk nodes
 * @returns Array of chunk embeddings
 */
export async function generateChunkEmbeddings(
  chunks: Array<{ id: string; content: string }>
): Promise<Array<{ chunkId: string; embedding: number[] }>> {
  const graph = getGraphInstance()
  const results: Array<{ chunkId: string; embedding: number[] }> = []

  for (const chunk of chunks) {
    const embedding = await generateEmbedding(chunk.content)
    results.push({
      chunkId: chunk.id,
      embedding,
    })

    // Store chunk embedding in database
    await graph.query(
      `
      MATCH (c:ConversationChunk {id: $chunkId})
      CALL db.create.setNodeVectorProperty(c, 'embedding', $embedding)
    `,
      { chunkId: chunk.id, embedding }
    )
  }

  return results
}
