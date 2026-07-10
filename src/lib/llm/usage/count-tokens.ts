/**
 * Local token counting (GOAL-297, Phase 1).
 *
 * Used for exactly ONE seam: OpenAI embeddings. LangChain's
 * `OpenAIEmbeddings.embedDocuments` returns vectors but no usage object,
 * so we count the input tokens ourselves. Embeddings are input-only, so an
 * accurate input count fully captures their cost.
 *
 * Every other call site gets an exact `usage` object straight from the AI
 * SDK / LangChain response and does NOT go through here.
 *
 * `gpt-tokenizer` is pure JS (no native/wasm), so it runs fine in the
 * Node and edge runtimes without extra bundler config.
 */

import { encode as encodeCl100k } from 'gpt-tokenizer/encoding/cl100k_base'
import { encode as encodeO200k } from 'gpt-tokenizer/encoding/o200k_base'

/**
 * Pick the BPE encoding for a model.
 *   - text-embedding-3-* and the gpt-4/gpt-3.5 families use cl100k_base.
 *   - gpt-4o / gpt-5.x and newer use o200k_base.
 * Default to o200k_base (the newer models) for anything unrecognized.
 */
function encoderFor(model: string): (text: string) => number[] {
  const m = model.toLowerCase()
  if (m.startsWith('text-embedding-3') || m.startsWith('text-embedding-ada')) {
    return encodeCl100k
  }
  if (m.startsWith('gpt-4-') || m === 'gpt-4' || m.startsWith('gpt-3.5')) {
    return encodeCl100k
  }
  return encodeO200k
}

/** Count tokens in a single string for the given model. */
export function countTokens(model: string, text: string): number {
  if (!text) return 0
  try {
    return encoderFor(model)(text).length
  } catch {
    // Never let a tokenizer edge case (odd unicode, huge input) break a
    // metering write — fall back to a coarse chars/4 estimate.
    return Math.ceil(text.length / 4)
  }
}

/** Count tokens across many strings (e.g. a batch embed call). */
export function countTokensBatch(model: string, texts: string[]): number {
  return texts.reduce((sum, t) => sum + countTokens(model, t), 0)
}
