import {
  recordLlmUsage,
  type LlmUsageSource,
  type LlmUsagePrincipal,
  type LlmProviderName,
} from './llm-usage.service'

/**
 * Thin adapter from an AI-SDK usage object to a `(:LlmUsage)` record
 * (GOAL-297, Phase 1).
 *
 * AI SDK v5/v6 report usage as `{ inputTokens, outputTokens, totalTokens }`
 * (fields may be undefined for some providers/steps). `streamText` exposes
 * it as `totalUsage` in `onFinish`; `generateText` / `generateObject`
 * expose it as `result.usage`. This maps either shape onto our
 * prompt/completion vocabulary and records it.
 *
 * Always fire-and-forget from the caller: `void recordAiSdkUsage(...)`.
 */

export interface AiSdkUsageLike {
  inputTokens?: number | null
  outputTokens?: number | null
  totalTokens?: number | null
}

export interface RecordAiSdkUsageCtx {
  source: LlmUsageSource
  model: string
  provider?: LlmProviderName // defaults to 'openai'
  principal: LlmUsagePrincipal
  userId?: string | null
  threadId?: string | null
}

export async function recordAiSdkUsage(
  usage: AiSdkUsageLike | undefined | null,
  ctx: RecordAiSdkUsageCtx
): Promise<void> {
  // No usage object → nothing meaningful to record. Providers occasionally
  // omit it (e.g. an errored step); skip rather than write a zero row.
  if (!usage) return

  const promptTokens = usage.inputTokens ?? 0
  const completionTokens = usage.outputTokens ?? 0
  const totalTokens =
    usage.totalTokens ?? promptTokens + completionTokens

  if (promptTokens === 0 && completionTokens === 0 && totalTokens === 0) {
    return
  }

  await recordLlmUsage({
    model: ctx.model,
    provider: ctx.provider ?? 'openai',
    source: ctx.source,
    promptTokens,
    completionTokens,
    totalTokens,
    principal: ctx.principal,
    userId: ctx.userId ?? null,
    threadId: ctx.threadId ?? null,
  })
}
