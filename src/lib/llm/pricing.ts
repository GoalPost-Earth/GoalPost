/**
 * Per-model LLM price table (GOAL-297, Phase 1).
 *
 * Translates token counts into dollar figures. Rates are expressed per 1K
 * tokens, split into input (prompt) and output (completion). Embedding
 * models are input-only, so their `outputPer1k` is 0.
 *
 * These defaults are a snapshot and WILL drift as vendors change pricing.
 * They are intentionally overridable WITHOUT a code change (an acceptance
 * criterion): set `LLM_PRICING_JSON` to a JSON object mapping model id →
 * `{ inputPer1k, outputPer1k }` and those entries are merged over the
 * defaults at read time. Example:
 *
 *   LLM_PRICING_JSON='{"gpt-5.4":{"inputPer1k":0.002,"outputPer1k":0.012}}'
 *
 * This module replaces the dead `pricing` map + `estimateCost()` that used
 * to live (unused) on `OpenAIProvider`.
 */

export interface ModelRate {
  /** USD per 1,000 input (prompt) tokens. */
  inputPer1k: number
  /** USD per 1,000 output (completion) tokens. 0 for embedding models. */
  outputPer1k: number
}

/**
 * Built-in rates for every model GoalPost calls today. Keys are the exact
 * model ids passed to the SDK / provider so lookups are direct.
 *
 * NOTE: prices are placeholders where a public rate is not authoritative
 * here — treat env override as the source of truth in a real deployment.
 */
const DEFAULT_RATES: Record<string, ModelRate> = {
  // Assistant chat / reasoning, cypher-gen, enrichment, resonance, extraction.
  'gpt-5.4': { inputPer1k: 0.00125, outputPer1k: 0.01 },
  // Thread-title generation + resonance title generation.
  'gpt-4o-mini': { inputPer1k: 0.00015, outputPer1k: 0.0006 },
  // Embeddings (input-only).
  'text-embedding-3-small': { inputPer1k: 0.00002, outputPer1k: 0 },
  // PDF doc-ingestion extraction / summary (non-OpenAI, priced separately).
  'gemini-2.5-pro': { inputPer1k: 0.00125, outputPer1k: 0.01 },
}

/**
 * Fallback rate for an unknown model id. Deliberately non-zero so a newly
 * introduced model still produces a (rough, over-estimating) cost rather
 * than silently reading as free — the report should surface "we're
 * spending on something unpriced," not hide it. Records costed this way
 * are flagged (`priced: false`) so the dashboard can mark them estimated.
 */
const FALLBACK_RATE: ModelRate = { inputPer1k: 0.01, outputPer1k: 0.03 }

let cachedOverrides: Record<string, ModelRate> | null = null

/**
 * Parse `LLM_PRICING_JSON` once per process. Malformed JSON or malformed
 * entries are ignored (with a warning) rather than throwing — a bad env
 * value must never take down a metering write on a hot path.
 */
function getOverrides(): Record<string, ModelRate> {
  if (cachedOverrides) return cachedOverrides
  const raw = process.env.LLM_PRICING_JSON?.trim()
  if (!raw) {
    cachedOverrides = {}
    return cachedOverrides
  }
  try {
    const parsed = JSON.parse(raw) as unknown
    const out: Record<string, ModelRate> = {}
    if (parsed && typeof parsed === 'object') {
      for (const [model, value] of Object.entries(
        parsed as Record<string, unknown>
      )) {
        if (
          value &&
          typeof value === 'object' &&
          typeof (value as ModelRate).inputPer1k === 'number' &&
          typeof (value as ModelRate).outputPer1k === 'number'
        ) {
          out[model] = {
            inputPer1k: (value as ModelRate).inputPer1k,
            outputPer1k: (value as ModelRate).outputPer1k,
          }
        }
      }
    }
    cachedOverrides = out
  } catch (error) {
    console.warn(
      '[llm/pricing] LLM_PRICING_JSON is not valid JSON — ignoring:',
      error instanceof Error ? error.message : error
    )
    cachedOverrides = {}
  }
  return cachedOverrides
}

/** Resolve the rate for a model: env override → default → fallback. */
export function getModelRate(model: string): {
  rate: ModelRate
  priced: boolean
} {
  const override = getOverrides()[model]
  if (override) return { rate: override, priced: true }
  const preset = DEFAULT_RATES[model]
  if (preset) return { rate: preset, priced: true }
  return { rate: FALLBACK_RATE, priced: false }
}

export interface TokenCounts {
  promptTokens: number
  completionTokens: number
}

export interface CostResult {
  costUsd: number
  /**
   * `true` when the model had an explicit rate (default or override);
   * `false` when the fallback rate was used (unknown model). The caller
   * persists this so the report can flag estimated rows.
   */
  priced: boolean
}

/**
 * Compute the dollar cost of a single call from its token counts. Rounds
 * to 6 decimal places — sub-micro-dollar precision is noise, and it keeps
 * the stored float clean for summing.
 */
export function computeCostUsd(
  model: string,
  { promptTokens, completionTokens }: TokenCounts
): CostResult {
  const { rate, priced } = getModelRate(model)
  const prompt = Number.isFinite(promptTokens) ? Math.max(0, promptTokens) : 0
  const completion = Number.isFinite(completionTokens)
    ? Math.max(0, completionTokens)
    : 0
  const costUsd =
    (prompt / 1000) * rate.inputPer1k +
    (completion / 1000) * rate.outputPer1k
  return { costUsd: Math.round(costUsd * 1e6) / 1e6, priced }
}

/** Test-only: reset the memoized env override cache. */
export function __resetPricingCacheForTests(): void {
  cachedOverrides = null
}
