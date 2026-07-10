/**
 * Tests for local token counting (GOAL-297, embeddings seam).
 */

import { describe, it, expect } from '@jest/globals'
import { countTokens, countTokensBatch } from '../usage/count-tokens'

describe('countTokens', () => {
  it('returns 0 for empty input', () => {
    expect(countTokens('text-embedding-3-small', '')).toBe(0)
  })

  it('counts a non-trivial number of tokens for real text', () => {
    const n = countTokens(
      'text-embedding-3-small',
      'The quick brown fox jumps over the lazy dog.'
    )
    expect(n).toBeGreaterThan(5)
    expect(n).toBeLessThan(20)
  })

  it('uses o200k for newer models without throwing', () => {
    expect(countTokens('gpt-5.4', 'hello world')).toBeGreaterThan(0)
  })

  it('sums a batch', () => {
    const texts = ['hello world', 'another string here']
    const sum = countTokensBatch('text-embedding-3-small', texts)
    const parts = texts.reduce(
      (acc, t) => acc + countTokens('text-embedding-3-small', t),
      0
    )
    expect(sum).toBe(parts)
    expect(sum).toBeGreaterThan(0)
  })
})
