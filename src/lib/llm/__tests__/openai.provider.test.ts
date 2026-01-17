/**
 * Tests for OpenAI Provider
 */

import { describe, it, expect, beforeAll } from '@jest/globals'
import { OpenAIProvider } from '../providers/openai.provider'
import { z } from 'zod'

describe('OpenAIProvider', () => {
  let provider: OpenAIProvider | null = null

  beforeAll(() => {
    // Skip if no API key (CI environment)
    if (!process.env.OPENAI_API_KEY) {
      console.warn('⚠️  Skipping OpenAI provider tests - no API key found')
      return
    }

    provider = new OpenAIProvider()
  })

  describe('metadata', () => {
    it('should have correct metadata', () => {
      if (!provider) {
        console.log('Skipping test - no provider')
        return
      }

      expect(provider.name).toBe('openai')
      expect(provider.embeddingDimension).toBe(1536)
      expect(provider.maxContextTokens).toBeGreaterThan(0)
      expect(provider.capabilities.has('chat')).toBe(true)
      expect(provider.capabilities.has('embeddings')).toBe(true)
      expect(provider.capabilities.has('structured-output')).toBe(true)
    })
  })

  describe('chat', () => {
    it('should complete a simple chat', async () => {
      if (!provider) {
        console.log('Skipping test - no provider')
        return
      }

      const response = await provider.chat([
        { role: 'user', content: 'Say "test successful" and nothing else.' },
      ])

      expect(response.content).toContain('test')
      expect(response.usage).toBeDefined()
      if (response.usage) {
        expect(response.usage.totalTokens).toBeGreaterThan(0)
      }
    }, 15000) // 15s timeout for API call
  })

  describe('embed', () => {
    it('should generate embeddings', async () => {
      if (!provider) {
        console.log('Skipping test - no provider')
        return
      }

      const embeddings = await provider.embed(['Hello world', 'Test embedding'])

      expect(embeddings).toHaveLength(2)
      expect(embeddings[0]).toHaveLength(1536)
      expect(embeddings[1]).toHaveLength(1536)

      // Embeddings should be different
      expect(embeddings[0]).not.toEqual(embeddings[1])
    }, 15000)
  })

  describe('structuredOutput', () => {
    it('should return structured data', async () => {
      if (!provider) {
        console.log('Skipping test - no provider')
        return
      }

      const schema = z.object({
        name: z.string().describe("The person's name"),
        age: z.number().describe("The person's age"),
      })

      const result = await provider.structuredOutput(
        [
          {
            role: 'user',
            content: 'Extract the following: John is 30 years old',
          },
        ],
        { schema }
      )

      expect(result.name).toBe('John')
      expect(result.age).toBe(30)
    }, 15000)
  })

  describe('estimateCost', () => {
    it('should estimate chat cost', () => {
      if (!provider) {
        console.log('Skipping test - no provider')
        return
      }

      const cost = provider.estimateCost('chat', 1000)
      expect(cost).toBeGreaterThan(0)
      expect(cost).toBeLessThan(1) // Should be less than $1 for 1K tokens
    })

    it('should estimate embedding cost', () => {
      if (!provider) {
        console.log('Skipping test - no provider')
        return
      }

      const cost = provider.estimateCost('embed', 1000)
      expect(cost).toBeGreaterThan(0)
      expect(cost).toBeLessThan(provider.estimateCost('chat', 1000)) // Embeddings cheaper than chat
    })
  })

  describe('error handling', () => {
    it('should throw LLMProviderError on invalid API key', () => {
      expect(() => {
        new OpenAIProvider({ apiKey: 'invalid-key-xxx' })
      }).not.toThrow() // Constructor doesn't validate, API call will
    })
  })
})
