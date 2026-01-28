/**
 * AI-powered title generation for pulses
 * Generates short one-sentence summaries from pulse content
 */

import { ChatOpenAI } from '@langchain/openai'
import { PromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'

const model = new ChatOpenAI({
  modelName: 'gpt-4o-mini',
  temperature: 0.3,
})

const titlePrompt =
  PromptTemplate.fromTemplate(`You are a helpful assistant that creates concise, clear titles for user content.

Given the following content, generate a short one-sentence title (max 10 words) that captures its essence:

Content: {content}

Requirements:
- Maximum 10 words
- Clear and descriptive
- Action-oriented when possible
- No quotes around the title
- No punctuation at the end

Title:`)

/**
 * Generate a concise title from pulse content using AI
 * @param content - The full pulse content
 * @returns Generated title string
 */
export async function generatePulseTitle(content: string): Promise<string> {
  try {
    // If content is very short (< 50 chars), use it directly as title
    if (content.length < 50) {
      return content.trim()
    }

    // Create the chain
    const chain = titlePrompt.pipe(model).pipe(new StringOutputParser())

    // Generate title
    const title = await chain.invoke({
      content: content.substring(0, 500), // Limit content to first 500 chars for efficiency
    })

    // Clean up the result
    const cleanTitle = title
      .trim()
      .replace(/^["']|["']$/g, '')
      .replace(/\.$/, '')

    // Fallback to truncated content if generation fails
    if (!cleanTitle || cleanTitle.length === 0) {
      return (
        content.substring(0, 60).trim() + (content.length > 60 ? '...' : '')
      )
    }

    return cleanTitle
  } catch (error) {
    console.error('Error generating pulse title:', error)
    // Fallback: use first sentence or truncate content
    const firstSentence = content.match(/^[^.!?]+[.!?]/)
    if (firstSentence) {
      return firstSentence[0].trim()
    }
    return content.substring(0, 60).trim() + (content.length > 60 ? '...' : '')
  }
}
