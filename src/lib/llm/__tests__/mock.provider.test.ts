/**
 * Tests for Mock Provider
 */

import { describe, it, expect, beforeEach } from '@jest/globals'
import { MockLLMProvider } from '../providers/mock.provider'
import { z } from 'zod'

describe('MockLLMProvider', () => {
  let provider: MockLLMProvider

  beforeEach(() => {
    provider = new MockLLMProvider()
  })

  describe('metadata', () => {
    it('should have correct metadata', () => {
      expect(provider.name).toBe('mock')
      expect(provider.embeddingDimension).toBe(1536)
      expect(provider.capabilities.has('chat')).toBe(true)
      expect(provider.capabilities.has('embeddings')).toBe(true)
      expect(provider.capabilities.has('structured-output')).toBe(true)
    })
  })

  describe('chat', () => {
    it('should return mock response', async () => {
      const response = await provider.chat([{ role: 'user', content: 'Hello' }])

      expect(response.content).toBe('Mock response')
      expect(response.usage).toBeDefined()
      expect(response.usage?.totalTokens).toBe(30)
    })

    it('should use custom mock response', async () => {
      const customProvider = new MockLLMProvider({
        chat: 'Custom mock response',
      })

      const response = await customProvider.chat([
        { role: 'user', content: 'Hello' },
      ])

      expect(response.content).toBe('Custom mock response')
    })

    it('should track calls', async () => {
      const messages = [{ role: 'user' as const, content: 'Test' }]
      await provider.chat(messages)

      expect(provider.calls.chat).toHaveLength(1)
      expect(provider.calls.chat[0]).toEqual(messages)
    })
  })

  describe('embed', () => {
    it('should return mock embeddings', async () => {
      const embeddings = await provider.embed(['text1', 'text2'])

      expect(embeddings).toHaveLength(2)
      expect(embeddings[0]).toHaveLength(1536)
      expect(embeddings[1]).toHaveLength(1536)
    })

    it('should use custom mock embeddings', async () => {
      const customEmbeddings = [
        [1, 2, 3],
        [4, 5, 6],
      ]
      const customProvider = new MockLLMProvider({
        embeddings: customEmbeddings,
      })

      const result = await customProvider.embed(['text1', 'text2'])
      expect(result).toEqual(customEmbeddings)
    })

    it('should track calls', async () => {
      const texts = ['text1', 'text2']
      await provider.embed(texts)

      expect(provider.calls.embed).toHaveLength(1)
      expect(provider.calls.embed[0]).toEqual(texts)
    })
  })

  describe('structuredOutput', () => {
    it('should return mock structured output', async () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      })

      const customProvider = new MockLLMProvider({
        structuredOutput: { name: 'John', age: 30 },
      })

      const result = await customProvider.structuredOutput(
        [{ role: 'user', content: 'test' }],
        { schema }
      )

      expect(result).toEqual({ name: 'John', age: 30 })
    })

    it('should track calls', async () => {
      const messages = [{ role: 'user' as const, content: 'test' }]
      const schema = z.object({ name: z.string() })

      await provider.structuredOutput(messages, { schema })

      expect(provider.calls.structuredOutput).toHaveLength(1)
      expect(provider.calls.structuredOutput[0].messages).toEqual(messages)
    })
  })

  describe('estimateCost', () => {
    it('should return zero cost', () => {
      expect(provider.estimateCost('chat', 1000)).toBe(0)
      expect(provider.estimateCost('embed', 1000)).toBe(0)
    })
  })

  describe('resetCalls', () => {
    it('should reset all tracked calls', async () => {
      await provider.chat([{ role: 'user', content: 'test' }])
      await provider.embed(['test'])

      expect(provider.calls.chat).toHaveLength(1)
      expect(provider.calls.embed).toHaveLength(1)

      provider.resetCalls()

      expect(provider.calls.chat).toHaveLength(0)
      expect(provider.calls.embed).toHaveLength(0)
    })
  })
})
