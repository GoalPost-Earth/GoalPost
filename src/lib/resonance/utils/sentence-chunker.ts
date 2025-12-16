/**
 * Sentence-based chunking utility for conversation text
 * Splits text into semantic chunks based on sentence boundaries
 */

export interface ConversationChunkData {
  content: string
  order: number
  role: 'user' | 'assistant' | 'system'
}

/**
 * Split text into sentences using multiple delimiters and heuristics
 * Handles common sentence endings while avoiding false splits on abbreviations
 */
function splitIntoSentences(text: string): string[] {
  // Common abbreviations that shouldn't trigger sentence splits
  const abbreviations =
    /\b(Mr|Mrs|Ms|Dr|Prof|Sr|Jr|vs|etc|e\.g|i\.e|Inc|Ltd|Co|Corp)\./gi

  // Replace abbreviations with a placeholder to avoid false splits
  let processedText = text
  const abbreviationMatches: Array<{ placeholder: string; original: string }> =
    []
  let match
  let counter = 0

  const abbrevRegex = new RegExp(abbreviations.source, 'gi')
  while ((match = abbrevRegex.exec(text)) !== null) {
    const placeholder = `__ABBREV_${counter}__`
    abbreviationMatches.push({ placeholder, original: match[0] })
    processedText = processedText.replace(match[0], placeholder)
    counter++
  }

  // Split on sentence boundaries: . ! ? followed by space and capital letter or newline
  const sentencePattern = /([.!?…]+[\s\n]+)(?=[A-Z])|([.!?…]+$)/g
  const sentences: string[] = []
  let lastIndex = 0

  let sentenceMatch
  while ((sentenceMatch = sentencePattern.exec(processedText)) !== null) {
    const sentence = processedText
      .slice(lastIndex, sentenceMatch.index + sentenceMatch[0].length)
      .trim()
    if (sentence.length > 0) {
      sentences.push(sentence)
    }
    lastIndex = sentenceMatch.index + sentenceMatch[0].length
  }

  // Add remaining text as last sentence
  if (lastIndex < processedText.length) {
    const lastSentence = processedText.slice(lastIndex).trim()
    if (lastSentence.length > 0) {
      sentences.push(lastSentence)
    }
  }

  // Restore abbreviations
  return sentences.map((sentence) => {
    let restored = sentence
    abbreviationMatches.forEach(({ placeholder, original }) => {
      restored = restored.replace(placeholder, original)
    })
    return restored
  })
}

/**
 * Chunk conversation messages into sentence-based segments
 *
 * @param messages - Array of conversation messages
 * @param maxSentencesPerChunk - Maximum sentences to combine into one chunk (default: 3)
 * @returns Array of conversation chunk data
 */
export function chunkConversationMessages(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  maxSentencesPerChunk: number = 3
): ConversationChunkData[] {
  const chunks: ConversationChunkData[] = []
  let orderCounter = 0

  for (const message of messages) {
    const sentences = splitIntoSentences(message.content)

    // Group sentences into chunks
    for (let i = 0; i < sentences.length; i += maxSentencesPerChunk) {
      const chunkSentences = sentences.slice(i, i + maxSentencesPerChunk)
      chunks.push({
        content: chunkSentences.join(' '),
        order: orderCounter++,
        role: message.role,
      })
    }
  }

  return chunks
}

/**
 * Chunk a single message into sentence-based segments
 *
 * @param content - Message content
 * @param role - Message role
 * @param startOrder - Starting order number (default: 0)
 * @param maxSentencesPerChunk - Maximum sentences per chunk (default: 3)
 * @returns Array of conversation chunk data
 */
export function chunkSingleMessage(
  content: string,
  role: 'user' | 'assistant' | 'system',
  startOrder: number = 0,
  maxSentencesPerChunk: number = 3
): ConversationChunkData[] {
  const sentences = splitIntoSentences(content)
  const chunks: ConversationChunkData[] = []

  for (let i = 0; i < sentences.length; i += maxSentencesPerChunk) {
    const chunkSentences = sentences.slice(i, i + maxSentencesPerChunk)
    chunks.push({
      content: chunkSentences.join(' '),
      order: startOrder + Math.floor(i / maxSentencesPerChunk),
      role,
    })
  }

  return chunks
}

/**
 * Combine chunks back into full text for embedding generation
 *
 * @param chunks - Array of conversation chunks
 * @returns Combined text content
 */
export function combineChunks(chunks: ConversationChunkData[]): string {
  return chunks
    .sort((a, b) => a.order - b.order)
    .map((chunk) => chunk.content)
    .join(' ')
}
