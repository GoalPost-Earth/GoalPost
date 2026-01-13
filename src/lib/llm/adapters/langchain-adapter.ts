/**
 * LangChain Adapter
 *
 * Converts our provider abstraction back to LangChain models for compatibility
 * with existing LangChain-dependent code (agents, tools, etc.)
 *
 * This is a temporary bridge layer - eventually we'll migrate fully to our abstraction
 */

import { ChatOpenAI } from '@langchain/openai'
import { OpenAIEmbeddings } from '@langchain/openai'
import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { Embeddings } from '@langchain/core/embeddings'

/**
 * Get a LangChain-compatible chat model
 * Uses environment variables to determine provider and configuration
 */
export function getLangChainChatModel(config?: {
  temperature?: number
  modelName?: string
  maxTokens?: number
}): BaseChatModel {
  // For now, only OpenAI is supported
  // In the future, this will check process.env.LLM_PROVIDER and return appropriate models
  const provider = process.env.LLM_PROVIDER || 'openai'

  if (provider !== 'openai') {
    throw new Error(
      `LangChain adapter does not yet support provider: ${provider}. Use 'openai' for now.`
    )
  }

  return new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: config?.modelName || 'gpt-4o',
    temperature: config?.temperature ?? 0.7,
    maxTokens: config?.maxTokens,
    configuration: {
      baseURL: process.env.OPENAI_API_BASE,
    },
  })
}

/**
 * Get a LangChain-compatible embeddings model
 * Uses environment variables to determine provider and configuration
 */
export function getLangChainEmbeddings(config?: {
  modelName?: string
}): Embeddings {
  const provider = process.env.LLM_PROVIDER || 'openai'

  if (provider !== 'openai') {
    throw new Error(
      `LangChain adapter does not yet support provider: ${provider}. Use 'openai' for now.`
    )
  }

  return new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: config?.modelName || 'text-embedding-3-small',
    configuration: {
      baseURL: process.env.OPENAI_API_BASE,
    },
  })
}
