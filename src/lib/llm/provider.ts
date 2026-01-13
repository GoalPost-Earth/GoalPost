/**
 * LLM Provider Abstraction Layer
 *
 * This module defines the core interfaces for LLM provider abstraction,
 * enabling swappable AI models (OpenAI, Mistral, Bedrock, etc.) without
 * changing application code.
 *
 * @see docs/LLM_ABSTRACTION_IMPLEMENTATION_PLAN.md
 * @see docs/MCP_STYLE_INDIRECTION_ANALYSIS.md
 */

import { z } from 'zod'

/**
 * Core message interface for chat interactions
 */
export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
  name?: string // For tool messages
}

/**
 * Options for chat completion
 */
export interface ChatOptions {
  temperature?: number
  maxTokens?: number
  topP?: number
  stop?: string[]
  stream?: boolean
}

/**
 * Chat response from provider
 */
export interface ChatResponse {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  finishReason?: string
}

/**
 * Structured output request
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface StructuredOutputOptions<T = any> extends ChatOptions {
  schema: z.ZodSchema<T>
  systemPrompt?: string
}

/**
 * LLM Provider Interface
 * All providers must implement this interface to ensure consistent behavior
 * across different AI model vendors.
 */
export interface LLMProvider {
  // Metadata
  name: string
  embeddingDimension: number
  maxContextTokens: number
  capabilities: Set<LLMCapability>

  /**
   * Chat completion with messages
   * @param messages - Conversation messages
   * @param options - Optional chat parameters
   * @returns Chat response with content and usage stats
   */
  chat(messages: Message[], options?: ChatOptions): Promise<ChatResponse>

  /**
   * Generate embeddings for text inputs
   * @param texts - Array of text strings to embed
   * @returns 2D array of embeddings (one per text)
   */
  embed(texts: string[]): Promise<number[][]>

  /**
   * Generate structured output conforming to a Zod schema
   * @param messages - Conversation messages
   * @param options - Schema and chat options
   * @returns Parsed object matching schema
   */
  structuredOutput<T>(
    messages: Message[],
    options: StructuredOutputOptions<T>
  ): Promise<T>

  /**
   * Estimate cost for an operation
   * @param operation - Type of operation (chat or embed)
   * @param tokens - Estimated token count
   * @returns Estimated cost in USD
   */
  estimateCost(operation: 'chat' | 'embed', tokens: number): number
}

/**
 * Supported capabilities
 * Use this to check if a provider supports a specific feature
 */
export type LLMCapability =
  | 'chat'
  | 'embeddings'
  | 'structured-output'
  | 'streaming'
  | 'function-calling'
  | 'json-mode'

/**
 * Provider configuration
 * Used to initialize providers with custom settings
 */
export interface ProviderConfig {
  apiKey?: string
  baseURL?: string
  modelName?: string
  timeout?: number
  maxRetries?: number
  // For mock provider
  mockResponses?: {
    chat?: string
    embeddings?: number[][]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    structuredOutput?: any
  }
}

/**
 * Base error class for provider errors
 * Provides consistent error handling across providers
 */
export class LLMProviderError extends Error {
  constructor(
    public provider: string,
    message: string,
    public originalError?: Error
  ) {
    super(`[${provider}] ${message}`)
    this.name = 'LLMProviderError'
  }
}
