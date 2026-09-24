/**
 * Tests for LLM Factory
 */

import { describe, it, expect, afterEach } from '@jest/globals'
import {
  getLLMProvider,
  getChatProvider,
  getEmbeddingsProvider,
  getAnalysisProvider,
  getAnalysisModelId,
  getAssistantModelId,
  DEFAULT_ANALYSIS_MODEL,
  DEFAULT_ASSISTANT_MODEL,
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

    it('resolves an analysis model distinct from the assistant model', () => {
      // GOAL-376: analysis used to fall through to getAssistantModelId(), so
      // every resonance / enrichment / classification call silently ran on the
      // chat REASONING model. At ~11s per call that capped the nightly sweep at
      // roughly one Space a night. These must not be the same id by default.
      delete process.env.OPENAI_ANALYSIS_MODEL
      delete process.env.OPENAI_ASSISTANT_MODEL

      expect(getAnalysisModelId()).toBe(DEFAULT_ANALYSIS_MODEL)
      expect(getAnalysisModelId()).not.toBe(getAssistantModelId())
      expect(DEFAULT_ANALYSIS_MODEL).not.toBe(DEFAULT_ASSISTANT_MODEL)
    })

    it('lets OPENAI_ANALYSIS_MODEL override without touching the assistant', () => {
      delete process.env.OPENAI_ASSISTANT_MODEL
      process.env.OPENAI_ANALYSIS_MODEL = 'gpt-4.1-mini'

      expect(getAnalysisModelId()).toBe('gpt-4.1-mini')
      expect(getAssistantModelId()).toBe(DEFAULT_ASSISTANT_MODEL)

      delete process.env.OPENAI_ANALYSIS_MODEL
    })

    it('prefers an explicit per-call model over the env var', () => {
      process.env.OPENAI_ANALYSIS_MODEL = 'gpt-4.1-mini'
      expect(getAnalysisModelId('gpt-4o-mini')).toBe('gpt-4o-mini')
      delete process.env.OPENAI_ANALYSIS_MODEL
    })

    it('wires the analysis model into the provider it returns', () => {
      // The regression this ticket exists for lived in the WIRING, not in the
      // resolver: getAnalysisProvider() built an OpenAIProvider without a
      // modelName, so the constructor fell through to getAssistantModelId().
      // Asserting on getAnalysisModelId() alone would still pass with the bug
      // present, so assert on the provider the factory actually hands back.
      delete process.env.OPENAI_ANALYSIS_MODEL
      delete process.env.OPENAI_ASSISTANT_MODEL

      const provider = getAnalysisProvider() as unknown as { model: string }
      expect(provider.model).toBe(DEFAULT_ANALYSIS_MODEL)
      expect(provider.model).not.toBe(DEFAULT_ASSISTANT_MODEL)

      const chat = getChatProvider() as unknown as { model: string }
      expect(chat.model).toBe(DEFAULT_ASSISTANT_MODEL)
    })

    it('honours OPENAI_ANALYSIS_MODEL on the provider, not just the resolver', () => {
      process.env.OPENAI_ANALYSIS_MODEL = 'gpt-4.1-mini'
      const provider = getAnalysisProvider() as unknown as { model: string }
      expect(provider.model).toBe('gpt-4.1-mini')
      delete process.env.OPENAI_ANALYSIS_MODEL
    })

    it('ANALYSIS_PROVIDER still selects the vendor independently', () => {
      process.env.ANALYSIS_PROVIDER = 'mock'
      expect(getAnalysisProvider().name).toBe('mock')
      delete process.env.ANALYSIS_PROVIDER
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
