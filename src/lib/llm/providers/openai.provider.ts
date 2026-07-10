/**
 * OpenAI Provider Implementation
 *
 * Wraps LangChain's ChatOpenAI and OpenAIEmbeddings to implement
 * the LLMProvider interface, enabling model swapping without changing
 * application code.
 */

import { ChatOpenAI } from '@langchain/openai'
import { OpenAIEmbeddings } from '@langchain/openai'
import {
  LLMProvider,
  Message,
  ChatOptions,
  ChatResponse,
  EmbedOptions,
  StructuredOutputOptions,
  UsageMeter,
  ProviderConfig,
  LLMProviderError,
  LLMCapability,
} from '../provider'
import { getAssistantModelId } from '../factory'
import { computeCostUsd } from '../pricing'
import { recordLlmUsage } from '../usage/llm-usage.service'
import { countTokensBatch } from '../usage/count-tokens'

/** The embedding model id is fixed for this provider (see constructor). */
const EMBEDDING_MODEL_ID = 'text-embedding-3-small'

/**
 * OpenAI Provider Implementation
 * Wraps LangChain's ChatOpenAI and OpenAIEmbeddings
 */
export class OpenAIProvider implements LLMProvider {
  name = 'openai'
  embeddingDimension = 1536 // text-embedding-3-small
  maxContextTokens = 128000 // gpt-4-turbo / gpt-5.x family
  capabilities = new Set<LLMCapability>([
    'chat',
    'embeddings',
    'structured-output',
    'streaming',
    'function-calling',
    'json-mode',
  ])

  private chatModel: ChatOpenAI
  private embeddingsModel: OpenAIEmbeddings
  private apiKey: string
  private modelName: string

  constructor(private config: ProviderConfig = {}) {
    const apiKey = config.apiKey || process.env.OPENAI_API_KEY
    const modelName = getAssistantModelId(config.modelName)

    if (!apiKey) {
      throw new LLMProviderError(
        'openai',
        'OPENAI_API_KEY not found in environment or config'
      )
    }

    this.apiKey = apiKey
    this.modelName = modelName

    this.chatModel = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName,
      temperature: 0.3,
      maxRetries: config.maxRetries || 3,
      timeout: config.timeout || 60000,
      ...(config.baseURL && { configuration: { baseURL: config.baseURL } }),
    })

    this.embeddingsModel = new OpenAIEmbeddings({
      openAIApiKey: apiKey,
      modelName: 'text-embedding-3-small',
      ...(config.baseURL && { configuration: { baseURL: config.baseURL } }),
    })
  }

  /**
   * Record a `(:LlmUsage)` node for a metered call. Fire-and-forget — the
   * provider must never let a metering write affect the caller. GOAL-297.
   */
  private meterUsage(
    meter: UsageMeter,
    modelId: string,
    usage: { promptTokens: number; completionTokens: number; totalTokens?: number }
  ): void {
    void recordLlmUsage({
      model: modelId,
      provider: 'openai',
      source: meter.source,
      promptTokens: usage.promptTokens,
      completionTokens: usage.completionTokens,
      totalTokens: usage.totalTokens,
      principal: meter.principal,
      userId: meter.userId ?? null,
      threadId: meter.threadId ?? null,
    })
  }

  async chat(
    messages: Message[],
    options?: ChatOptions
  ): Promise<ChatResponse> {
    try {
      // Create a new chat model with options if provided
      const llm = options
        ? new ChatOpenAI({
            openAIApiKey: this.apiKey,
            modelName: this.modelName,
            temperature: options.temperature ?? 0.3,
            maxTokens: options.maxTokens,
            topP: options.topP,
            stop: options.stop,
          })
        : this.chatModel

      // Convert our Message format to LangChain format
      const langchainMessages = messages.map((msg) => {
        if (msg.role === 'system') {
          return { type: 'system' as const, content: msg.content }
        } else if (msg.role === 'assistant') {
          return { type: 'ai' as const, content: msg.content }
        } else {
          return { type: 'human' as const, content: msg.content }
        }
      })

      const response = await llm.invoke(langchainMessages)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tokenUsage = response.response_metadata?.tokenUsage as any
      const usage = tokenUsage
        ? {
            promptTokens: tokenUsage.promptTokens || 0,
            completionTokens: tokenUsage.completionTokens || 0,
            totalTokens: tokenUsage.totalTokens || 0,
          }
        : undefined

      // GOAL-297: record usage when the caller opted in.
      if (options?.meter && usage) {
        this.meterUsage(options.meter, this.modelName, usage)
      }

      return {
        content:
          typeof response.content === 'string'
            ? response.content
            : JSON.stringify(response.content),
        usage,
        finishReason: response.response_metadata?.finish_reason as
          | string
          | undefined,
      }
    } catch (error) {
      throw new LLMProviderError(
        'openai',
        `Chat completion failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error : undefined
      )
    }
  }

  async embed(texts: string[], options?: EmbedOptions): Promise<number[][]> {
    try {
      const embeddings = await this.embeddingsModel.embedDocuments(texts)
      // GOAL-297: LangChain's OpenAIEmbeddings returns no usage object, so
      // count input tokens locally (embeddings are input-only). Metering is
      // opt-in and fire-and-forget.
      if (options?.meter) {
        const promptTokens = countTokensBatch(EMBEDDING_MODEL_ID, texts)
        this.meterUsage(options.meter, EMBEDDING_MODEL_ID, {
          promptTokens,
          completionTokens: 0,
          totalTokens: promptTokens,
        })
      }
      return embeddings
    } catch (error) {
      throw new LLMProviderError(
        'openai',
        `Embedding generation failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error : undefined
      )
    }
  }

  async structuredOutput<T>(
    messages: Message[],
    options: StructuredOutputOptions<T>
  ): Promise<T> {
    try {
      // Convert to LangChain message format
      const langchainMessages = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

      // Add system prompt if provided
      if (options.systemPrompt) {
        langchainMessages.unshift({
          role: 'system',
          content: options.systemPrompt,
        })
      }

      // GOAL-297: when metering is requested, ask LangChain to return the
      // raw message too (`includeRaw`) so we can read `usage_metadata` — the
      // plain structured path discards it. Non-metered callers keep the
      // original zero-overhead path unchanged.
      if (options.meter) {
        const structuredLlm = this.chatModel.withStructuredOutput(
          options.schema,
          { includeRaw: true }
        )
        const result = (await structuredLlm.invoke(langchainMessages)) as {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          raw: any
          parsed: T
        }
        const um = result.raw?.usage_metadata
        if (um) {
          this.meterUsage(options.meter, this.modelName, {
            promptTokens: um.input_tokens || 0,
            completionTokens: um.output_tokens || 0,
            totalTokens: um.total_tokens || 0,
          })
        }
        return result.parsed
      }

      const structuredLlm = this.chatModel.withStructuredOutput(options.schema)
      const result = await structuredLlm.invoke(langchainMessages)
      return result as T
    } catch (error) {
      throw new LLMProviderError(
        'openai',
        `Structured output failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error : undefined
      )
    }
  }

  estimateCost(operation: 'chat' | 'embed', tokens: number): number {
    // Delegates to the shared, env-overridable price table (GOAL-297).
    if (operation === 'embed') {
      return computeCostUsd(EMBEDDING_MODEL_ID, {
        promptTokens: tokens,
        completionTokens: 0,
      }).costUsd
    }
    // Chat: assume a 50/50 prompt/completion split for a rough estimate.
    const half = tokens / 2
    return computeCostUsd(this.modelName, {
      promptTokens: half,
      completionTokens: half,
    }).costUsd
  }
}
