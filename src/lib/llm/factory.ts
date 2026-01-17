/**
 * LLM Provider Factory
 *
 * Central factory for creating LLM provider instances.
 * Supports multiple providers (OpenAI, Mistral, Bedrock, Mock)
 * and allows routing different operations to different providers.
 */

import { LLMProvider, ProviderConfig } from './provider'
import { OpenAIProvider } from './providers/openai.provider'
import { MockLLMProvider } from './providers/mock.provider'

export type ProviderType = 'openai' | 'mistral' | 'bedrock' | 'mock'

/**
 * Get an LLM provider instance
 * @param type - Provider type (defaults to LLM_PROVIDER env or 'openai')
 * @param config - Optional provider configuration
 * @returns LLMProvider instance
 */
export function getLLMProvider(
  type?: ProviderType,
  config?: ProviderConfig
): LLMProvider {
  const providerType =
    type || (process.env.LLM_PROVIDER as ProviderType) || 'openai'

  switch (providerType) {
    case 'openai':
      return new OpenAIProvider(config)

    case 'mistral':
      // TODO: Implement in Phase 4
      throw new Error(
        'Mistral provider not yet implemented. Use openai or mock.'
      )

    case 'bedrock':
      // TODO: Implement in Phase 4
      throw new Error(
        'AWS Bedrock provider not yet implemented. Use openai or mock.'
      )

    case 'mock':
      return new MockLLMProvider(config?.mockResponses)

    default:
      throw new Error(
        `Unknown provider type: ${providerType}. Valid options: openai, mock`
      )
  }
}

/**
 * Get provider for embedding operations
 * Can be different from chat provider for cost optimization
 *
 * @example
 * ```typescript
 * // Use OpenAI for embeddings
 * const provider = getEmbeddingsProvider()
 * const embeddings = await provider.embed(['text1', 'text2'])
 * ```
 */
export function getEmbeddingsProvider(config?: ProviderConfig): LLMProvider {
  const type =
    (process.env.EMBEDDINGS_PROVIDER as ProviderType) ||
    (process.env.LLM_PROVIDER as ProviderType) ||
    'openai'
  return getLLMProvider(type, config)
}

/**
 * Get provider for chat operations
 * Optimized for user-facing conversational quality
 *
 * @example
 * ```typescript
 * const provider = getChatProvider()
 * const response = await provider.chat([
 *   { role: 'user', content: 'Hello!' }
 * ])
 * ```
 */
export function getChatProvider(config?: ProviderConfig): LLMProvider {
  const type =
    (process.env.CHAT_PROVIDER as ProviderType) ||
    (process.env.LLM_PROVIDER as ProviderType) ||
    'openai'
  return getLLMProvider(type, config)
}

/**
 * Get provider for analysis operations (enrichment, resonance discovery)
 * Can use cheaper models for batch processing
 *
 * @example
 * ```typescript
 * const provider = getAnalysisProvider()
 * const insights = await provider.structuredOutput(messages, { schema })
 * ```
 */
export function getAnalysisProvider(config?: ProviderConfig): LLMProvider {
  const type =
    (process.env.ANALYSIS_PROVIDER as ProviderType) ||
    (process.env.LLM_PROVIDER as ProviderType) ||
    'openai'
  return getLLMProvider(type, config)
}
