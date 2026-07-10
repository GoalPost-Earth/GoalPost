import { randomUUID } from 'node:crypto'
import { driver } from '@/lib/neo4j/driver'

/**
 * Server-side persistence for AI assistant feedback.
 *
 * Two write paths land here:
 *   - `user_thumb`        — explicit thumbs-up / thumbs-down from the chat
 *                            UI, optionally with a "what would have been
 *                            better" comment.
 *   - `auto_*`            — server-emitted signals captured in the chat
 *                            route's `onFinish`: empty assistant text, tool
 *                            errors, Rule-1 raw-id/__typename leaks.
 *
 * Schema:
 *
 *   (:AssistantFeedback {
 *      id, rating, source, userComment, ruleViolated, autoSignal,
 *      classification, classificationReason, cluster, questionEmbedding,
 *      goldenSet, createdAt
 *   })
 *     -[:FEEDBACK_ON]-> (:ConversationTurn)
 *     -[:FEEDBACK_FROM]-> (:Person)        // present for user_thumb only
 *     -[:IN_CONTEXT_OF]-> (:ConversationThread)
 *
 * Activity logging: feedback writes are NOT mirrored into the Log stream,
 * matching the existing exemption for ConversationTurn / ConversationChunk
 * (see conversation-thread.service.ts). The feedback nodes themselves are
 * the audit trail.
 */

export type AssistantFeedbackRating = 'positive' | 'negative'
export type AssistantFeedbackSource =
  | 'user_thumb'
  | 'auto_tool_error'
  | 'auto_empty_text'
  | 'auto_rule_violation'

/**
 * Workflow state for a feedback row in the triage dashboard.
 *
 *   - `open`        — newly captured; no one has acted on it yet (default).
 *   - `in_progress` — a dev is currently working on a fix.
 *   - `resolved`    — fix shipped (or "wontfix" decision recorded); the
 *                     dashboard hides these by default.
 *
 * Rows written before this field existed have no `status` property; the
 * read query coalesces those to `'open'`.
 */
export type AssistantFeedbackStatus = 'open' | 'in_progress' | 'resolved'

export interface CreateAssistantFeedbackInput {
  turnId: string
  rating: AssistantFeedbackRating
  source: AssistantFeedbackSource
  /** Submitting user (required for `user_thumb`; null for auto signals). */
  userId?: string | null
  userComment?: string | null
  ruleViolated?: string | null
  autoSignal?: string | null
}

export interface AssistantFeedbackRecord {
  id: string
  rating: AssistantFeedbackRating
  source: AssistantFeedbackSource
  userComment: string | null
  ruleViolated: string | null
  autoSignal: string | null
  classification: string | null
  classificationReason: string | null
  cluster: string | null
  goldenSet: boolean
  status: AssistantFeedbackStatus
  statusUpdatedAt: string | null
  statusNote: string | null
  createdAt: string
  turnId: string
  threadId: string | null
}

/**
 * Persist a single feedback row.
 *
 * Authorization model:
 *   - `user_thumb` MUST include a `userId`. The Cypher asserts that the
 *     user owns the thread containing the turn; if they don't, the MATCH
 *     yields no rows and the write becomes a no-op (we throw so callers
 *     surface the error to the client).
 *   - `auto_*` signals are written from the chat route, which already
 *     anchored the turn to the authenticated user — so we trust the turn
 *     id without a second ownership check, but still write an inbound
 *     [:IN_CONTEXT_OF] edge to the thread for query convenience.
 */
export async function createAssistantFeedback(
  input: CreateAssistantFeedbackInput
): Promise<AssistantFeedbackRecord> {
  const id = `feedback_${randomUUID()}`
  const session = driver.session()
  try {
    if (input.source === 'user_thumb') {
      if (!input.userId) {
        throw new Error(
          'createAssistantFeedback: userId is required for user_thumb feedback'
        )
      }
      const result = await session.executeWrite(async (tx) =>
        tx.run(
          `
          MATCH (p:Person:User {id: $userId})-[:HAS_THREAD]->(thread:ConversationThread)-[:HAS_TURN]->(turn:ConversationTurn {id: $turnId})
          CREATE (f:AssistantFeedback {
            id: $id,
            rating: $rating,
            source: $source,
            userComment: $userComment,
            ruleViolated: null,
            autoSignal: null,
            classification: null,
            classificationReason: null,
            cluster: null,
            goldenSet: false,
            status: 'open',
            statusUpdatedAt: null,
            statusNote: null,
            createdAt: datetime()
          })
          CREATE (f)-[:FEEDBACK_ON]->(turn)
          CREATE (f)-[:FEEDBACK_FROM]->(p)
          CREATE (f)-[:IN_CONTEXT_OF]->(thread)
          RETURN f, turn.id AS turnId, thread.id AS threadId
          `,
          {
            userId: input.userId,
            turnId: input.turnId,
            id,
            rating: input.rating,
            source: input.source,
            userComment: input.userComment ?? null,
          }
        )
      )
      const record = result.records[0]
      if (!record) {
        throw new Error(
          'createAssistantFeedback: turn not found or not owned by user'
        )
      }
      return shapeRecord(
        record.get('f').properties,
        record.get('turnId') as string,
        record.get('threadId') as string | null
      )
    }

    // Auto-signal path: chat route already anchored the turn to the
    // authenticated user when it called appendConversationTurn, so we
    // don't re-check ownership here. We still wire IN_CONTEXT_OF to the
    // thread so the dashboard query can join through it cheaply.
    const result = await session.executeWrite(async (tx) =>
      tx.run(
        `
        MATCH (thread:ConversationThread)-[:HAS_TURN]->(turn:ConversationTurn {id: $turnId})
        CREATE (f:AssistantFeedback {
          id: $id,
          rating: $rating,
          source: $source,
          userComment: null,
          ruleViolated: $ruleViolated,
          autoSignal: $autoSignal,
          classification: null,
          classificationReason: null,
          cluster: null,
          goldenSet: false,
          status: 'open',
          statusUpdatedAt: null,
          statusNote: null,
          createdAt: datetime()
        })
        CREATE (f)-[:FEEDBACK_ON]->(turn)
        CREATE (f)-[:IN_CONTEXT_OF]->(thread)
        RETURN f, turn.id AS turnId, thread.id AS threadId
        `,
        {
          turnId: input.turnId,
          id,
          rating: input.rating,
          source: input.source,
          ruleViolated: input.ruleViolated ?? null,
          autoSignal: input.autoSignal ?? null,
        }
      )
    )
    const record = result.records[0]
    if (!record) {
      throw new Error(
        `createAssistantFeedback: turn ${input.turnId} not found for auto signal`
      )
    }
    return shapeRecord(
      record.get('f').properties,
      record.get('turnId') as string,
      record.get('threadId') as string | null
    )
  } finally {
    await session.close()
  }
}

export interface ListAssistantFeedbackFilters {
  source?: AssistantFeedbackSource
  classification?: string
  rating?: AssistantFeedbackRating
  goldenSet?: boolean
  /**
   * One or more workflow statuses to include. When omitted, no status
   * filter is applied (returns rows in every state). The dashboard
   * defaults to `['open', 'in_progress']` so resolved rows drop out
   * of the active triage view.
   */
  statuses?: AssistantFeedbackStatus[]
  limit?: number
}

export interface AssistantFeedbackRow extends AssistantFeedbackRecord {
  /** Mode the thread was in when the turn happened. */
  mode: string
  /** The user's question that immediately preceded the assistant turn. */
  question: string | null
  /** The assistant text being rated. */
  response: string | null
  /** Raw `parts` from the assistant turn (tool calls + results), parsed. */
  responseParts: unknown[] | null
}

function parseStoredParts(value: unknown): unknown[] | null {
  if (typeof value !== 'string' || value.length === 0) return null
  try {
    const parsed = JSON.parse(value) as unknown
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

/**
 * List feedback rows for the triage dashboard. Joins each feedback to its
 * parent turn, the immediately-preceding user turn (the question), and the
 * thread (for mode). Newest first.
 *
 * The dashboard is dev-only (env-gated at the route level) so this query
 * is not user-scoped — by design. Do NOT expose this through any
 * user-facing surface without first adding a `userId` filter.
 */
export async function listAssistantFeedback(
  filters: ListAssistantFeedbackFilters = {}
): Promise<AssistantFeedbackRow[]> {
  const limit = Math.min(Math.max(filters.limit ?? 100, 1), 500)
  const session = driver.session()
  try {
    const result = await session.executeRead(async (tx) =>
      tx.run(
        `
        MATCH (f:AssistantFeedback)-[:FEEDBACK_ON]->(turn:ConversationTurn)
        WHERE ($source IS NULL OR f.source = $source)
          AND ($classification IS NULL OR f.classification = $classification)
          AND ($rating IS NULL OR f.rating = $rating)
          AND ($goldenSet IS NULL OR f.goldenSet = $goldenSet)
          AND ($statuses IS NULL OR coalesce(f.status, 'open') IN $statuses)
        WITH f, turn
        ORDER BY f.createdAt DESC
        LIMIT toInteger($limit)
        OPTIONAL MATCH (f)-[:IN_CONTEXT_OF]->(thread:ConversationThread)
        OPTIONAL MATCH (thread)-[:HAS_TURN]->(prior:ConversationTurn {role: 'user'})
          WHERE prior.order = turn.order - 1
        RETURN
          f AS feedback,
          turn.id AS turnId,
          turn.content AS responseText,
          turn.parts AS responseParts,
          thread.id AS threadId,
          coalesce(thread.mode, 'default') AS mode,
          prior.content AS question
        `,
        {
          source: filters.source ?? null,
          classification: filters.classification ?? null,
          rating: filters.rating ?? null,
          goldenSet:
            typeof filters.goldenSet === 'boolean' ? filters.goldenSet : null,
          statuses:
            filters.statuses && filters.statuses.length > 0
              ? filters.statuses
              : null,
          limit,
        }
      )
    )
    return result.records.map((r) => {
      const props = r.get('feedback').properties as Record<string, unknown>
      return {
        ...shapeRecord(
          props,
          r.get('turnId') as string,
          (r.get('threadId') as string | null) ?? null
        ),
        mode: (r.get('mode') as string) ?? 'default',
        question: (r.get('question') as string | null) ?? null,
        response: (r.get('responseText') as string | null) ?? null,
        responseParts: parseStoredParts(r.get('responseParts')),
      }
    })
  } finally {
    await session.close()
  }
}

/** Set the `goldenSet` flag from the dashboard for Phase-4 replay harness. */
export async function setAssistantFeedbackGoldenSet(
  feedbackId: string,
  goldenSet: boolean
): Promise<void> {
  const session = driver.session()
  try {
    await session.executeWrite(async (tx) =>
      tx.run(
        `MATCH (f:AssistantFeedback {id: $feedbackId}) SET f.goldenSet = $goldenSet`,
        { feedbackId, goldenSet }
      )
    )
  } finally {
    await session.close()
  }
}

/**
 * Move a feedback row through the triage workflow (open → in_progress →
 * resolved). Stamps `statusUpdatedAt` so the dashboard can show "moved
 * 3 hours ago". The optional `statusNote` is for short context like
 * "fixed in 9d7bd9f" or "wontfix — model limitation".
 *
 * Idempotent: setting the same status twice just updates the timestamp,
 * which is fine — the timestamp records the latest acknowledgement.
 */
export async function setAssistantFeedbackStatus(
  feedbackId: string,
  status: AssistantFeedbackStatus,
  statusNote?: string | null
): Promise<void> {
  const session = driver.session()
  try {
    await session.executeWrite(async (tx) =>
      tx.run(
        `
        MATCH (f:AssistantFeedback {id: $feedbackId})
        SET f.status = $status,
            f.statusUpdatedAt = datetime(),
            f.statusNote = $statusNote
        `,
        {
          feedbackId,
          status,
          statusNote: statusNote ?? null,
        }
      )
    )
  } finally {
    await session.close()
  }
}

/**
 * Bulk-fetch the rows that still need failure classification + embedding.
 * Used by the daily classify cron.
 *
 * Scoped to NEGATIVE-rated feedback on purpose. The downstream classifier
 * (see llm-classify.ts) is a *failure* analyzer — its prompt force-fits
 * every row it is handed into exactly one of a fixed set of failure modes,
 * with no "not a failure" escape hatch. So only signals that represent a
 * potential failure belong here:
 *   - negative `user_thumb` — an explicit thumbs-down, OR a suggestion-card
 *     DISMISS (the inline suggestion cards record accept/dismiss as
 *     positive/negative `user_thumb` feedback via submitAssistantFeedback).
 *   - every `auto_*` signal — empty text, tool errors, Rule-1 leaks: all
 *     emitted as negative by the auto-detectors.
 *
 * Positive rows are SUCCESS signals, not failures: a thumbs-up, or a
 * capture-and-connect card ACCEPT recorded as
 * `"Accepted suggested resonance: …"`. Classifying those force-fits a
 * success into a failure mode and clusters it into the triage dashboard as
 * a bogus "bad row" (the exact false positive behind this fix). Exclude
 * them at the source so they never get a classification or a cluster.
 */
export async function listUnclassifiedFeedback(
  limit = 50
): Promise<AssistantFeedbackRow[]> {
  return listAssistantFeedback({ rating: 'negative', limit }).then((rows) =>
    rows.filter((row) => row.classification === null)
  )
}

/** Persist classification, reason, and question embedding. */
export async function updateFeedbackClassification(
  feedbackId: string,
  classification: string,
  classificationReason: string,
  questionEmbedding: number[]
): Promise<void> {
  const session = driver.session()
  try {
    await session.executeWrite(async (tx) =>
      tx.run(
        `
        MATCH (f:AssistantFeedback {id: $feedbackId})
        SET f.classification = $classification,
            f.classificationReason = $classificationReason
        WITH f
        CALL db.create.setNodeVectorProperty(f, 'questionEmbedding', $questionEmbedding)
        RETURN f
        `,
        { feedbackId, classification, classificationReason, questionEmbedding }
      )
    )
  } finally {
    await session.close()
  }
}

/** Persist cluster id chosen by the cron's nearest-neighbor pass. */
export async function setFeedbackCluster(
  feedbackId: string,
  cluster: string
): Promise<void> {
  const session = driver.session()
  try {
    await session.executeWrite(async (tx) =>
      tx.run(
        `MATCH (f:AssistantFeedback {id: $feedbackId}) SET f.cluster = $cluster`,
        { feedbackId, cluster }
      )
    )
  } finally {
    await session.close()
  }
}

/**
 * Find the closest existing feedback row by question embedding. Used by
 * the cron for cluster assignment. Returns null when no row is within
 * the cosine-similarity threshold.
 */
export async function findNearestClusterFeedback(
  feedbackId: string,
  embedding: number[],
  threshold = 0.85
): Promise<{ feedbackId: string; cluster: string | null; score: number } | null> {
  const session = driver.session()
  try {
    const result = await session.executeRead(async (tx) =>
      tx.run(
        `
        CALL db.index.vector.queryNodes(
          'assistantFeedbackQuestionVectorIndex',
          5,
          $embedding
        ) YIELD node, score
        WHERE node.id <> $feedbackId
          AND node.questionEmbedding IS NOT NULL
          AND score >= $threshold
        RETURN node.id AS feedbackId, node.cluster AS cluster, score
        ORDER BY score DESC
        LIMIT 1
        `,
        { embedding, feedbackId, threshold }
      )
    )
    const record = result.records[0]
    if (!record) return null
    return {
      feedbackId: record.get('feedbackId') as string,
      cluster: (record.get('cluster') as string | null) ?? null,
      score: Number(record.get('score') ?? 0),
    }
  } catch (error) {
    // Vector index may not exist yet in a fresh dev DB — degrade
    // gracefully so the cron can still write classifications.
    console.warn(
      '[assistant-feedback] nearest-cluster query failed:',
      error instanceof Error ? error.message : error
    )
    return null
  } finally {
    await session.close()
  }
}

function shapeRecord(
  props: Record<string, unknown>,
  turnId: string,
  threadId: string | null
): AssistantFeedbackRecord {
  const rawStatus = typeof props.status === 'string' ? props.status : 'open'
  const status: AssistantFeedbackStatus =
    rawStatus === 'in_progress' || rawStatus === 'resolved'
      ? (rawStatus as AssistantFeedbackStatus)
      : 'open'
  return {
    id: props.id as string,
    rating: props.rating as AssistantFeedbackRating,
    source: props.source as AssistantFeedbackSource,
    userComment: (props.userComment as string | null) ?? null,
    ruleViolated: (props.ruleViolated as string | null) ?? null,
    autoSignal: (props.autoSignal as string | null) ?? null,
    classification: (props.classification as string | null) ?? null,
    classificationReason:
      (props.classificationReason as string | null) ?? null,
    cluster: (props.cluster as string | null) ?? null,
    goldenSet: Boolean(props.goldenSet),
    status,
    statusUpdatedAt:
      props.statusUpdatedAt != null
        ? stringifyDateTime(props.statusUpdatedAt)
        : null,
    statusNote: (props.statusNote as string | null) ?? null,
    createdAt: stringifyDateTime(props.createdAt),
    turnId,
    threadId,
  }
}

function stringifyDateTime(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value !== null && 'toString' in value) {
    try {
      return (value as { toString: () => string }).toString()
    } catch {
      return ''
    }
  }
  return String(value)
}
