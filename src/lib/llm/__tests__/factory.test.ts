/**
 * Tests for LLM Factory
 */

import { describe, it, expect, afterEach } from '@jest/globals'
import {
  getLLMProvider,
  getChatProvider,
  getEmbeddingsProvider,
  getAnalysisProvider,
} from '../factory'

describe('LLM Factory', () => {
  beforeEach(() => {
    // Clear LLM_PROVIDER before each test to ensure clean state
    delete process.env.LLM_PROVIDER
  })

  afterEach(() => {
    // Clear after test
    delete process.env.LLM_PROVIDER
  })

  describe('getLLMProvider', () => {
    it('should return OpenAI provider by default', () => {
      const provider = getLLMProvider()
      expect(provider.name).toBe('openai')
    })

    it('should return OpenAI when explicitly requested', () => {
      const provider = getLLMProvider('openai')
      expect(provider.name).toBe('openai')
    })

    it('should return mock provider when requested', () => {
      const provider = getLLMProvider('mock')
      expect(provider.name).toBe('mock')
    })

    it('should respect LLM_PROVIDER environment variable', () => {
      process.env.LLM_PROVIDER = 'mock'
      const provider = getLLMProvider()
      expect(provider.name).toBe('mock')
    })

    it('should throw for unimplemented providers', () => {
      expect(() => getLLMProvider('mistral')).toThrow('not yet implemented')
      expect(() => getLLMProvider('bedrock')).toThrow('not yet implemented')
    })

    it('should throw for unknown providers', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => getLLMProvider('invalid' as any)).toThrow(
        'Unknown provider type'
      )
    })
  })

  describe('specialized factories', () => {
    it('getChatProvider should work', () => {
      const provider = getChatProvider()
      expect(provider).toBeDefined()
      expect(provider.capabilities.has('chat')).toBe(true)
    })

    it('getEmbeddingsProvider should work', () => {
      const provider = getEmbeddingsProvider()
      expect(provider).toBeDefined()
      expect(provider.capabilities.has('embeddings')).toBe(true)
    })

    it('getAnalysisProvider should work', () => {
      const provider = getAnalysisProvider()
      expect(provider).toBeDefined()
      expect(provider.capabilities.has('chat')).toBe(true)
    })

    it('should allow different providers for different operations', () => {
      process.env.CHAT_PROVIDER = 'openai'
      process.env.EMBEDDINGS_PROVIDER = 'mock'

      const chatProvider = getChatProvider()
      const embeddingsProvider = getEmbeddingsProvider()

      expect(chatProvider.name).toBe('openai')
      expect(embeddingsProvider.name).toBe('mock')

      // Cleanup
      delete process.env.CHAT_PROVIDER
      delete process.env.EMBEDDINGS_PROVIDER
    })
  })

  describe('provider capabilities', () => {
    it('OpenAI provider should have all capabilities', () => {
      const provider = getLLMProvider('openai')
      expect(provider.capabilities.has('chat')).toBe(true)
      expect(provider.capabilities.has('embeddings')).toBe(true)
      expect(provider.capabilities.has('structured-output')).toBe(true)
      expect(provider.capabilities.has('streaming')).toBe(true)
      expect(provider.capabilities.has('function-calling')).toBe(true)
    })

    it('Mock provider should have basic capabilities', () => {
      const provider = getLLMProvider('mock')
      expect(provider.capabilities.has('chat')).toBe(true)
      expect(provider.capabilities.has('embeddings')).toBe(true)
      expect(provider.capabilities.has('structured-output')).toBe(true)
    })
  })
})
