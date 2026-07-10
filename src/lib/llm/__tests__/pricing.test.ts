/**
 * Tests for the LLM price table (GOAL-297).
 */

import { describe, it, expect, afterEach } from '@jest/globals'
import {
  computeCostUsd,
  getModelRate,
  __resetPricingCacheForTests,
} from '../pricing'

afterEach(() => {
  delete process.env.LLM_PRICING_JSON
  __resetPricingCacheForTests()
})

describe('computeCostUsd', () => {
  it('prices a known chat model from input + output rates', () => {
    // gpt-4o-mini: input 0.00015/1k, output 0.0006/1k
    const { costUsd, priced } = computeCostUsd('gpt-4o-mini', {
      promptTokens: 1000,
      completionTokens: 1000,
    })
    // 0.00015 + 0.0006 = 0.00075
    expect(costUsd).toBeCloseTo(0.00075, 8)
    expect(priced).toBe(true)
  })

  it('prices embeddings as input-only (output rate is 0)', () => {
    // text-embedding-3-small: input 0.00002/1k, output 0
    const { costUsd } = computeCostUsd('text-embedding-3-small', {
      promptTokens: 10_000,
      completionTokens: 0,
    })
    expect(costUsd).toBeCloseTo(0.0002, 8)
  })

  it('falls back (priced=false) for an unknown model, non-zero cost', () => {
    const { costUsd, priced } = computeCostUsd('some-future-model', {
      promptTokens: 1000,
      completionTokens: 1000,
    })
    expect(priced).toBe(false)
    expect(costUsd).toBeGreaterThan(0)
  })

  it('clamps negative / non-finite token counts to zero', () => {
    const { costUsd } = computeCostUsd('gpt-4o-mini', {
      promptTokens: -50,
      completionTokens: Number.NaN,
    })
    expect(costUsd).toBe(0)
  })

  it('honors an LLM_PRICING_JSON override without a code change', () => {
    process.env.LLM_PRICING_JSON = JSON.stringify({
      'gpt-4o-mini': { inputPer1k: 1, outputPer1k: 2 },
    })
    __resetPricingCacheForTests()
    const { rate, priced } = getModelRate('gpt-4o-mini')
    expect(priced).toBe(true)
    expect(rate.inputPer1k).toBe(1)
    expect(rate.outputPer1k).toBe(2)
    const { costUsd } = computeCostUsd('gpt-4o-mini', {
      promptTokens: 1000,
      completionTokens: 1000,
    })
    // 1 + 2 = 3
    expect(costUsd).toBeCloseTo(3, 6)
  })

  it('ignores malformed LLM_PRICING_JSON and keeps defaults', () => {
    process.env.LLM_PRICING_JSON = '{not valid json'
    __resetPricingCacheForTests()
    const { rate, priced } = getModelRate('gpt-4o-mini')
    expect(priced).toBe(true)
    expect(rate.inputPer1k).toBe(0.00015)
  })
})
