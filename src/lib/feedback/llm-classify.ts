/**
 * LLM-driven failure classification + embedding-based clustering for
 * AssistantFeedback rows. Invoked by the daily cron in
 * `src/app/api/cron/classify-ai-feedback/route.ts`.
 *
 * For each unclassified row, we:
 *
 *   1. Pull the user question, assistant response, and the response's
 *      `parts` array (tool calls + tool results) from the existing
 *      ConversationTurn nodes via `listAssistantFeedback`.
 *   2. Ask a strong LLM (defaults to gpt-5.6 to be explicitly different
 *      from the chat assistant's gpt-5.4 — we want an outside opinion,
 *      not self-grading) to classify the failure with a 1-sentence
 *      rationale.
 *   3. Embed the question via the existing text-embedding-3-small
 *      provider and persist it to drive the question-clustering vector
 *      index.
 *   4. Find the nearest already-clustered feedback row above the cosine
 *      threshold; copy its cluster id if found, otherwise mint a new
 *      one.
 *
 * Steps 2 and 3 are independent, so we parallelize them per row. Across
 * rows we serialize to keep the rate-limit blast radius small.
 */

import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { getAnalysisProvider, getEmbeddingsProvider } from '@/lib/llm/factory'
import {
  listUnclassifiedFeedback,
  updateFeedbackClassification,
  setFeedbackCluster,
  findNearestClusterFeedback,
  type AssistantFeedbackRow,
} from './assistant-feedback.service'

const CLASSIFICATIONS = [
  'missing_tool',
  'wrong_tool',
  'hallucination',
  'raw_id_leak',
  'tone_issue',
  'off_topic',
  'partial_answer',
  'prompt_rule_violation',
  'other',
] as const

const ClassificationSchema = z.object({
  classification: z.enum(CLASSIFICATIONS),
  reason: z
    .string()
    .min(1)
    .max(280)
    .describe(
      'One-sentence rationale for the chosen classification. Avoid jargon, name the concrete failure.'
    ),
})

type ClassificationResult = z.infer<typeof ClassificationSchema>

const SYSTEM_PROMPT = `You analyze failures of an AI assistant ("GoalPost AI").

Given a user question, the assistant's response, and the tool calls it made, classify the response into exactly one failure mode and explain in one sentence.

Failure modes:
  - missing_tool          The assistant lacked a tool that would have answered the question.
  - wrong_tool            The assistant called a tool, but the wrong one for the question.
  - hallucination         The assistant invented facts, IDs, names, or relationships not grounded in any tool result.
  - raw_id_leak           The response contains raw entity IDs (me_…, ws_…, ctx_…, UUIDs) or internal type names (GoalPulse, __typename) that should never reach users.
  - tone_issue            The content is technically OK but the voice is wrong (too curt, overly clinical, confessional, etc.).
  - off_topic             The assistant answered a different question than the one asked.
  - partial_answer        The assistant addressed part of the question but missed an obvious follow-on.
  - prompt_rule_violation The assistant violated an explicit system-prompt rule other than raw-id leakage.
  - other                 None of the above fit.

Pick the SINGLE best fit. If the response is mostly fine but has any ID leak, prefer raw_id_leak — it is a hard product invariant.`

function buildUserPayload(row: AssistantFeedbackRow): string {
  const question = row.question ?? '(no prior user turn captured)'
  const response = row.response ?? '(empty response)'
  const parts = row.responseParts
    ? JSON.stringify(row.responseParts, null, 2)
    : '(no tool calls)'
  const autoHint = row.autoSignal
    ? `\n\nServer-detected signal: ${row.autoSignal}${row.ruleViolated ? ` (${row.ruleViolated})` : ''}`
    : ''
  const userHint = row.userComment
    ? `\n\nUser comment ("what would have been better"): ${row.userComment}`
    : ''
  return `User question:\n${question}\n\nAssistant response:\n${response}\n\nResponse parts (tool calls + results):\n${parts}${autoHint}${userHint}`
}

/**
 * Run one row end-to-end: classify, embed, cluster. Best-effort —
 * individual failures are logged and swallowed so a single bad row
 * doesn't poison the rest of the batch.
 */
async function processRow(
  row: AssistantFeedbackRow,
  threshold: number
): Promise<{
  feedbackId: string
  classification: string | null
  cluster: string | null
  error?: string
}> {
  try {
    const analysis = getAnalysisProvider()
    const embeddings = getEmbeddingsProvider()
    const questionText = row.question ?? row.response ?? ''
    if (!questionText.trim()) {
      return {
        feedbackId: row.id,
        classification: null,
        cluster: null,
        error: 'no question or response text',
      }
    }

    const [classified, embedding] = await Promise.all([
      analysis.structuredOutput<ClassificationResult>(
        [{ role: 'user', content: buildUserPayload(row) }],
        {
          schema: ClassificationSchema,
          systemPrompt: SYSTEM_PROMPT,
        }
      ),
      embeddings.embed([questionText]),
    ])

    const vec = embedding[0]
    if (!Array.isArray(vec) || vec.length === 0) {
      return {
        feedbackId: row.id,
        classification: classified.classification,
        cluster: null,
        error: 'embedding empty',
      }
    }

    await updateFeedbackClassification(
      row.id,
      classified.classification,
      classified.reason,
      vec
    )

    // Now that the embedding is persisted on this row, look for an
    // existing cluster within the cosine-similarity threshold. If
    // nothing matches, mint a new cluster id seeded by this row.
    const nearest = await findNearestClusterFeedback(row.id, vec, threshold)
    const cluster = nearest?.cluster ?? `cluster_${randomUUID().slice(0, 12)}`
    await setFeedbackCluster(row.id, cluster)

    return {
      feedbackId: row.id,
      classification: classified.classification,
      cluster,
    }
  } catch (error) {
    return {
      feedbackId: row.id,
      classification: null,
      cluster: null,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export interface ClassifyBatchOptions {
  /** Max rows to process per invocation. Default 25 — leaves headroom on
   *  the Vercel Pro 60s default function ceiling even when a few rows
   *  spend several seconds in `structuredOutput`. */
  limit?: number
  /** Cosine similarity threshold for cluster co-assignment. Default 0.85
   *  — pulled from the plan; tunable as we observe real cluster quality. */
  threshold?: number
}

export interface ClassifyBatchResult {
  processed: number
  succeeded: number
  failed: number
  results: Array<{
    feedbackId: string
    classification: string | null
    cluster: string | null
    error?: string
  }>
}

/**
 * Process a batch of unclassified feedback rows. Returns a summary
 * suitable for the cron route's JSON response.
 */
export async function classifyUnclassifiedBatch(
  options: ClassifyBatchOptions = {}
): Promise<ClassifyBatchResult> {
  const limit = options.limit ?? 25
  const threshold = options.threshold ?? 0.85

  const rows = await listUnclassifiedFeedback(limit)
  if (rows.length === 0) {
    return { processed: 0, succeeded: 0, failed: 0, results: [] }
  }

  // Serialize across rows: OpenAI rate limits + embedding calls are
  // cheap individually but we don't want a 100-row burst from a busy
  // day to spike rate limit errors.
  const results: ClassifyBatchResult['results'] = []
  for (const row of rows) {
    results.push(await processRow(row, threshold))
  }

  const succeeded = results.filter((r) => !r.error).length
  return {
    processed: results.length,
    succeeded,
    failed: results.length - succeeded,
    results,
  }
}
