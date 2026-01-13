/**
 * Mock LLM Provider for Testing
 *
 * Returns predictable responses without making API calls.
 * Useful for unit tests and development.
 */

import {
  LLMProvider,
  Message,
  ChatResponse,
  StructuredOutputOptions,
  LLMCapability,
} from '../provider'

/**
 * Mock LLM Provider
 * Returns predictable responses without API calls
 */
export class MockLLMProvider implements LLMProvider {
  name = 'mock'
  embeddingDimension = 1536
  maxContextTokens = 128000
  capabilities = new Set<LLMCapability>([
    'chat',
    'embeddings',
    'structured-output',
  ])

  // Track calls for testing
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public calls: {
    chat: Message[][]
    embed: string[][]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    structuredOutput: any[]
  } = {
    chat: [],
    embed: [],
    structuredOutput: [],
  }

  constructor(
    private mockResponses: {
      chat?: string
      embeddings?: number[][]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      structuredOutput?: any
    } = {}
  ) {}

  async chat(messages: Message[]): Promise<ChatResponse> {
    this.calls.chat.push(messages)

    return {
      content: this.mockResponses.chat || 'Mock response',
      usage: {
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30,
      },
      finishReason: 'stop',
    }
  }

  async embed(texts: string[]): Promise<number[][]> {
    this.calls.embed.push(texts)

    if (this.mockResponses.embeddings) {
      return this.mockResponses.embeddings
    }

    // Return random embeddings of correct dimension
    return texts.map(() =>
      Array(this.embeddingDimension)
        .fill(0)
        .map(() => Math.random())
    )
  }

  async structuredOutput<T>(
    messages: Message[],
    options: StructuredOutputOptions<T>
  ): Promise<T> {
    this.calls.structuredOutput.push({ messages, options })

    if (this.mockResponses.structuredOutput) {
      return this.mockResponses.structuredOutput as T
    }

    // Return empty object that should validate against schema
    // In real tests, you'd provide specific mock data
    return {} as T
  }

  estimateCost(): number {
    return 0 // Mock provider is free!
  }

  // Test helper: reset call tracking
  resetCalls(): void {
    this.calls = {
      chat: [],
      embed: [],
      structuredOutput: [],
    }
  }
}
