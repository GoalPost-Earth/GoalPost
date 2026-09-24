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

// Default assistant chat model. Used when OPENAI_ASSISTANT_MODEL is unset.
// gpt-5.4 is OpenAI's lower-cost reasoning model in the gpt-5 family. It's
// routed through the Responses API by `@ai-sdk/openai`, so callers must NOT
// pass `temperature` — tune output via `reasoning.effort` instead.
// Bump this alongside the env var when upgrading the assistant.
export const DEFAULT_ASSISTANT_MODEL = 'gpt-5.4'

/**
 * Resolve the OpenAI model id used for assistant chat / reasoning calls.
 *
 * Resolution order:
 *   1. explicit `override` (per-call or per-mode)
 *   2. process.env.OPENAI_ASSISTANT_MODEL
 *   3. DEFAULT_ASSISTANT_MODEL
 *
 * The embedding model (text-embedding-3-small) is intentionally NOT routed
 * through this helper — embeddings are configured separately.
 */
export function getAssistantModelId(override?: string | null): string {
  const trimmedOverride = override?.trim()
  if (trimmedOverride) return trimmedOverride
  const envValue = process.env.OPENAI_ASSISTANT_MODEL?.trim()
  if (envValue) return envValue
  return DEFAULT_ASSISTANT_MODEL
}

// Default model for batch ANALYSIS work — resonance discovery, person
// enrichment, feedback classification. Deliberately NOT the assistant's
// reasoning model.
//
// These callers are bulk and latency-bound, not conversational: the nightly
// resonance sweep makes one structured-output call per anchor pulse inside a
// fixed 270s serverless budget, so the per-call latency IS the coverage
// ceiling. Measured on demo across nine nights of `:LlmUsage` records, a
// gpt-5.4 analysis call takes ~20s and emits ~2,100 completion tokens, so a
// nightly run landed only 11-14 of them and left 10 of 19 Spaces never swept.
// Reasoning depth buys nothing here — the judgement is "do these two short
// texts share a theme", and the prompt already supplies the candidates.
//
// Bump alongside OPENAI_ANALYSIS_MODEL, and keep the id in
// `src/lib/llm/pricing.ts` (KNOWN_MODELS + DEFAULT_RATES) or its spend reads
// as unpriced on the usage dashboard.
export const DEFAULT_ANALYSIS_MODEL = 'gpt-4o-mini'

/**
 * Resolve the OpenAI model id used for background analysis calls.
 *
 * Same resolution order as `getAssistantModelId`, against its own env var so
 * analysis and chat can be tuned independently:
 *   1. explicit `override` (per-call)
 *   2. process.env.OPENAI_ANALYSIS_MODEL
 *   3. DEFAULT_ANALYSIS_MODEL
 */
export function getAnalysisModelId(override?: string | null): string {
  const trimmedOverride = override?.trim()
  if (trimmedOverride) return trimmedOverride
  const envValue = process.env.OPENAI_ANALYSIS_MODEL?.trim()
  if (envValue) return envValue
  return DEFAULT_ANALYSIS_MODEL
}

// Reasoning effort for the assistant chat model (gpt-5.x family). Lower effort
// means the model "thinks" less before responding, cutting time-to-first-token
// at the cost of less internal deliberation — for chat + tool-calling this is
// the right trade: the tools do the heavy lifting, not the model's private
// reasoning. `'low'` is the default; bump via OPENAI_ASSISTANT_REASONING_EFFORT
// (none | minimal | low | medium | high | xhigh) without a code change while we
// tune latency vs. answer quality. Passed to streamText/generateText as
// `providerOptions.openai.reasoningEffort`.
export type ReasoningEffort =
  | 'none'
  | 'minimal'
  | 'low'
  | 'medium'
  | 'high'
  | 'xhigh'

export const DEFAULT_ASSISTANT_REASONING_EFFORT: ReasoningEffort = 'low'

const VALID_REASONING_EFFORTS: readonly ReasoningEffort[] = [
  'none',
  'minimal',
  'low',
  'medium',
  'high',
  'xhigh',
]

export function getAssistantReasoningEffort(): ReasoningEffort {
  const envValue = process.env.OPENAI_ASSISTANT_REASONING_EFFORT?.trim()
  if (envValue && VALID_REASONING_EFFORTS.includes(envValue as ReasoningEffort)) {
    return envValue as ReasoningEffort
  }
  return DEFAULT_ASSISTANT_REASONING_EFFORT
}

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
  // Resolve the MODEL here, not just the vendor. Without this the provider
  // constructor falls through to `getAssistantModelId()` and every analysis
  // call silently runs on the chat reasoning model — which is what this
  // function's "can use cheaper models for batch processing" contract has
  // always promised and never delivered. An explicit `config.modelName` from
  // the caller still wins.
  return getLLMProvider(type, {
    ...config,
    modelName: getAnalysisModelId(config?.modelName),
  })
}
