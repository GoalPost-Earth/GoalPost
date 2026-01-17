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
  StructuredOutputOptions,
  ProviderConfig,
  LLMProviderError,
  LLMCapability,
} from '../provider'

/**
 * OpenAI Provider Implementation
 * Wraps LangChain's ChatOpenAI and OpenAIEmbeddings
 */
export class OpenAIProvider implements LLMProvider {
  name = 'openai'
  embeddingDimension = 1536 // text-embedding-3-small
  maxContextTokens = 128000 // gpt-4-turbo / gpt-5.1
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

  // Pricing (per 1K tokens) - approximate rates
  private readonly pricing = {
    'gpt-5.1': { prompt: 0.01, completion: 0.03 },
    'gpt-4-turbo': { prompt: 0.01, completion: 0.03 },
    'gpt-4': { prompt: 0.03, completion: 0.06 },
    'text-embedding-3-small': 0.0001,
  }

  constructor(private config: ProviderConfig = {}) {
    const apiKey = config.apiKey || process.env.OPENAI_API_KEY
    const modelName = config.modelName || 'gpt-5.1'

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

      return {
        content:
          typeof response.content === 'string'
            ? response.content
            : JSON.stringify(response.content),
        usage: response.response_metadata?.tokenUsage
          ? {
              promptTokens:
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (response.response_metadata.tokenUsage as any).promptTokens ||
                0,
              completionTokens:
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (response.response_metadata.tokenUsage as any)
                  .completionTokens || 0,
              totalTokens:
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (response.response_metadata.tokenUsage as any).totalTokens || 0,
            }
          : undefined,
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

  async embed(texts: string[]): Promise<number[][]> {
    try {
      const embeddings = await this.embeddingsModel.embedDocuments(texts)
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
      // Use LangChain's withStructuredOutput for OpenAI
      const structuredLlm = this.chatModel.withStructuredOutput(options.schema)

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
    if (operation === 'embed') {
      return (tokens / 1000) * this.pricing['text-embedding-3-small']
    }

    // For chat, assume 50/50 prompt/completion split for estimation
    const modelPricing = this.pricing['gpt-5.1']
    const promptCost = (tokens / 2000) * modelPricing.prompt
    const completionCost = (tokens / 2000) * modelPricing.completion
    return promptCost + completionCost
  }
}
