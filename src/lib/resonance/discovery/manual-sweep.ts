/**
 * Manual, field-initiated resonance discovery sweep (GOAL-368).
 *
 * Discovery otherwise runs on three triggers — upload / import completion
 * (on-upload-discovery.ts, scoped to the one context) and the nightly cron
 * (every Space). An import whose sweep was deferred (process-article-imports
 * yields to its queue successor) waits for that nightly run, so a member saw
 * nothing to review for up to a day. This lets them start the sweep now.
 *
 * Scope: the button lives on a field, but the sweep covers the field's whole
 * Space — every root field's within-field pass (ADR-017) plus a cross-field
 * pass that pairs each field's pulses with the Space's other fields (ADR-020).
 * The triggering field goes first so that the time budget is spent where the
 * member is looking.
 *
 * Cooldown: one manual sweep per Space per MANUAL_SWEEP_COOLDOWN_SECONDS,
 * claimed atomically on the Space node. It is per Space, not per field,
 * because every field's button starts the same Space-wide sweep. On top of it,
 * one member runs at most one sweep at a time (claimed on their Person node in
 * the same write) — without it, one account with many Spaces could start one
 * sweep per Space at once. The nightly cron never reads either — a manual run
 * neither delays nor replaces the nightly sweep.
 */

import neo4j from 'neo4j-driver'
import { driver } from '@/lib/neo4j/driver'
import { initGraph } from '@/modules/graph'
import { generatePulseEmbeddings } from '../embeddings/pulse-embedder'
import {
  discoverResonancesForContext,
  discoverCrossFieldResonancesForRoot,
  type DiscoveredResonance,
} from './pattern-detector'
import { createLog } from '@/lib/activity-logs/create-log'

/**
 * Longer than the route's 300s `maxDuration`, so a sweep still in flight
 * always holds the cooldown — two manual sweeps never overlap in one Space.
 */
export const MANUAL_SWEEP_COOLDOWN_SECONDS = 10 * 60

/**
 * Wall-clock budget for STARTING discovery work, measured from the request.
 * Leaves 60s of the route's 300s `maxDuration` for the pulse already in
 * flight (vector search + one LLM call) and the Log write.
 */
export const MANUAL_SWEEP_BUDGET_MS = 240_000

/** How long a claimed-but-unfinished sweep can still be running. */
const MAX_SWEEP_RUNTIME_SECONDS = 300

/**
 * After a sweep FAILS (throws — not merely runs out of time), the Space's
 * cooldown shrinks to this, so a transient Neo4j/OpenAI error doesn't lock the
 * member out for ten minutes over a run that did nothing.
 */
const FAILED_SWEEP_RETRY_SECONDS = 60

/** Embedding backfill cap per sweep — same bound as on-upload discovery. */
const MAX_EMBEDDING_BACKFILL = 100

/**
 * Share of the budget the backfill may use, so discovery — the part the member
 * pressed the button for — always gets most of it.
 */
const MAX_EMBEDDING_MS = 90_000

/**
 * Source pulses per root field for the cross-field pass. Each is one vector
 * search plus, when it has candidates, one LLM call — added to the within-field
 * pass's 30 per field.
 */
const MAX_CROSS_FIELD_SOURCE_PULSES = 10

export interface FieldSweepScope {
  spaceId: string
  /** Root of the triggering field's hierarchy — swept first. */
  rootContextId: string
}

/**
 * `space_running` / `space_cooldown`: this Space swept within the window
 * (still in flight, or finished). `user_running`: the Space is free but this
 * member already has a sweep in flight elsewhere.
 */
export type ManualSweepRefusal =
  | 'space_running'
  | 'space_cooldown'
  | 'user_running'

export type ManualSweepClaim =
  | { claimed: true }
  | { claimed: false; reason: ManualSweepRefusal; retryAfterSeconds: number }

export interface ManualSweepResult {
  embeddedCount: number
  suggestionsCreated: number
  crossFieldSuggestionsCreated: number
  /** False when the time budget ran out before every field was swept. */
  completed: boolean
}

/**
 * Resolve a live FieldContext to its Space and root field. Null when the
 * context doesn't exist, is soft-deleted, or has no Space.
 */
export async function resolveFieldSweepScope(
  fieldContextId: string
): Promise<FieldSweepScope | null> {
  const graph = await initGraph()
  const rows = await graph.query<FieldSweepScope>(
    `MATCH (s:Space)-[:HAS_CONTEXT]->(c:FieldContext {id: $fieldContextId})
     WHERE c.deletedAt IS NULL
     OPTIONAL MATCH (root:FieldContext)-[:HAS_SUBCONTEXT*1..10]->(c)
     WHERE NOT (:FieldContext)-[:HAS_SUBCONTEXT]->(root)
     RETURN s.id AS spaceId, coalesce(root.id, c.id) AS rootContextId
     LIMIT 1`,
    { fieldContextId }
  )
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null
}

/**
 * Atomically claim the Space's manual-sweep slot — and the member's — or
 * report why not.
 *
 * Write-then-guard, like `claimArticleImportJob`: Neo4j is read-committed and
 * only locks a node when a SET executes, so a plain conditional SET lets two
 * concurrent clicks both read "no recent sweep" and both win. The throwaway
 * `resonanceSweepLock` writes take the node locks first; the checks after them
 * then read any peer's committed claim. Space before Person in every call, so
 * two claims can never take the pair in opposite orders.
 *
 * Returns null when the Space or the Person doesn't exist.
 */
export async function claimManualResonanceSweep(
  spaceId: string,
  userId: string
): Promise<ManualSweepClaim | null> {
  const session = driver.session()
  try {
    const result = await session.executeWrite((tx) =>
      tx.run(
        `
        MATCH (s:Space {id: $spaceId})
        MATCH (u:Person {id: $userId})
        // Lock-forcing writes only — nothing reads them.
        SET s.resonanceSweepLock = randomUUID()
        SET u.resonanceSweepLock = randomUUID()
        WITH s, u,
             s.resonanceSweepStartedAt IS NOT NULL
               AND s.resonanceSweepFinishedAt IS NULL AS spaceUnfinished,
             CASE WHEN s.resonanceSweepStartedAt IS NULL THEN null
                  ELSE duration.inSeconds(s.resonanceSweepStartedAt, datetime()).seconds
             END AS spaceElapsed,
             CASE WHEN u.resonanceSweepStartedAt IS NOT NULL
                       AND u.resonanceSweepFinishedAt IS NULL
                  THEN duration.inSeconds(u.resonanceSweepStartedAt, datetime()).seconds
             END AS userRunningFor
        WITH s, u, spaceUnfinished, spaceElapsed, userRunningFor,
             spaceElapsed IS NULL OR spaceElapsed >= $cooldownSeconds AS spaceFree,
             // A claim older than maxDuration was killed without finishing.
             userRunningFor IS NULL OR userRunningFor >= $maxRuntimeSeconds AS userFree
        WITH s, u, spaceUnfinished, spaceElapsed, userRunningFor, spaceFree,
             spaceFree AND userFree AS claimable
        FOREACH (_ IN CASE WHEN claimable THEN [1] ELSE [] END |
          SET s.resonanceSweepStartedAt = datetime(),
              s.resonanceSweepFinishedAt = null,
              u.resonanceSweepStartedAt = datetime(),
              u.resonanceSweepFinishedAt = null
        )
        RETURN claimable, spaceFree, spaceUnfinished,
               toFloat(spaceElapsed) AS spaceElapsedSeconds,
               toFloat(userRunningFor) AS userRunningForSeconds
        `,
        {
          spaceId,
          userId,
          cooldownSeconds: neo4j.int(MANUAL_SWEEP_COOLDOWN_SECONDS),
          maxRuntimeSeconds: neo4j.int(MAX_SWEEP_RUNTIME_SECONDS),
        }
      )
    )
    const record = result.records[0]
    if (!record) return null
    if (record.get('claimable') === true) return { claimed: true }

    if (record.get('spaceFree') === true) {
      const runningFor = Number(record.get('userRunningForSeconds') ?? 0)
      return {
        claimed: false,
        reason: 'user_running',
        retryAfterSeconds: Math.max(
          1,
          Math.ceil(MAX_SWEEP_RUNTIME_SECONDS - runningFor)
        ),
      }
    }

    const elapsed = Number(record.get('spaceElapsedSeconds') ?? 0)
    return {
      claimed: false,
      reason:
        record.get('spaceUnfinished') === true &&
        elapsed < MAX_SWEEP_RUNTIME_SECONDS
          ? 'space_running'
          : 'space_cooldown',
      retryAfterSeconds: Math.max(
        1,
        Math.ceil(MANUAL_SWEEP_COOLDOWN_SECONDS - elapsed)
      ),
    }
  } finally {
    await session.close()
  }
}

/**
 * Mark the claimed sweep finished for the Space and the member. The Space's
 * cooldown keeps running from its start — unless the sweep `failed`, in which
 * case its start is backdated so only FAILED_SWEEP_RETRY_SECONDS remain.
 */
export async function finishManualResonanceSweep(
  spaceId: string,
  userId: string,
  { failed = false }: { failed?: boolean } = {}
): Promise<void> {
  const session = driver.session()
  try {
    await session.executeWrite((tx) =>
      tx.run(
        // Both OPTIONAL: a Space deleted mid-sweep must still release the
        // member, or they'd be refused elsewhere until their claim lapses.
        `OPTIONAL MATCH (s:Space {id: $spaceId})
         OPTIONAL MATCH (u:Person {id: $userId})
         FOREACH (_ IN CASE WHEN s IS NULL THEN [] ELSE [1] END |
           SET s.resonanceSweepFinishedAt = datetime()
         )
         FOREACH (_ IN CASE WHEN s IS NOT NULL AND $failed THEN [1] ELSE [] END |
           SET s.resonanceSweepStartedAt =
             datetime() - duration({seconds: $cooldownSeconds - $retrySeconds})
         )
         FOREACH (_ IN CASE WHEN u IS NULL THEN [] ELSE [1] END |
           SET u.resonanceSweepFinishedAt = datetime()
         )`,
        {
          spaceId,
          userId,
          failed,
          cooldownSeconds: neo4j.int(MANUAL_SWEEP_COOLDOWN_SECONDS),
          retrySeconds: neo4j.int(FAILED_SWEEP_RETRY_SECONDS),
        }
      )
    )
  } finally {
    await session.close()
  }
}

/**
 * Embed, then discover across the Space. The caller MUST have gated
 * `canEditContent` on `spaceId` and claimed the cooldown — this helper does
 * neither. Per-pulse failures are swallowed inside discovery, so a partial
 * result is still returned; only an infrastructure failure throws.
 */
export async function runManualResonanceSweep(params: {
  spaceId: string
  rootContextId: string
  triggerContextId: string
  actorUserId: string
  deadline: number
}): Promise<ManualSweepResult> {
  const { spaceId, rootContextId, triggerContextId, actorUserId, deadline } =
    params
  const graph = await initGraph()
  const outOfTime = () => Date.now() >= deadline

  // Step 1: embed the Space's un-embedded live pulses. Vector search skips
  // them entirely, so freshly-imported pulses are invisible until this runs.
  // The triggering field's subtree first, newest first: those are the pulses
  // the member just imported and is waiting on, and a Space with a large (or
  // persistently failing) backlog must not crowd them out of the cap.
  const missing = await graph.query<{ id: string }>(
    `MATCH (:Space {id: $spaceId})-[:HAS_CONTEXT]->(c:FieldContext)-[:HAS_PULSE]->(p:FieldPulse)
     WHERE c.deletedAt IS NULL AND p.deletedAt IS NULL AND p.embedding IS NULL
     WITH DISTINCT p
     WITH p, EXISTS {
       MATCH (:FieldContext {id: $rootContextId})-[:HAS_SUBCONTEXT*0..10]->(x:FieldContext)-[:HAS_PULSE]->(p)
       WHERE x.deletedAt IS NULL
     } AS inTriggerField
     ORDER BY inTriggerField DESC, p.createdAt DESC
     LIMIT $limit
     RETURN p.id AS id`,
    { spaceId, rootContextId, limit: neo4j.int(MAX_EMBEDDING_BACKFILL) }
  )
  const embeddingDeadline = Math.min(deadline, Date.now() + MAX_EMBEDDING_MS)
  let embeddedCount = 0
  for (const { id } of Array.isArray(missing) ? missing : []) {
    if (Date.now() >= embeddingDeadline) break
    try {
      await generatePulseEmbeddings(id)
      embeddedCount++
    } catch (err) {
      console.error(`[ManualSweep] Failed to embed pulse ${id}:`, err)
    }
  }

  // Step 2: every root field, the triggering one first.
  const rootRows = await graph.query<{ id: string }>(
    `MATCH (:Space {id: $spaceId})-[:HAS_CONTEXT]->(c:FieldContext)
     WHERE c.deletedAt IS NULL
       AND NOT (:FieldContext)-[:HAS_SUBCONTEXT]->(c)
     RETURN c.id AS id`,
    { spaceId }
  )
  const rootIds = (Array.isArray(rootRows) ? rootRows : []).map((r) => r.id)
  const orderedRoots = [
    rootContextId,
    ...rootIds.filter((id) => id !== rootContextId),
  ]
  const hasOtherFields = rootIds.length > 1

  const within: DiscoveredResonance[] = []
  const crossField: DiscoveredResonance[] = []
  for (const contextId of orderedRoots) {
    if (outOfTime()) break
    try {
      within.push(
        ...(await discoverResonancesForContext(
          spaceId,
          contextId,
          undefined,
          deadline
        ))
      )
      if (hasOtherFields && !outOfTime()) {
        crossField.push(
          ...(await discoverCrossFieldResonancesForRoot({
            spaceId,
            rootContextId: contextId,
            maxSourcePulses: MAX_CROSS_FIELD_SOURCE_PULSES,
            deadline,
          }))
        )
      }
    } catch (err) {
      console.error(`[ManualSweep] Failed to sweep field ${contextId}:`, err)
    }
  }
  const completed = !outOfTime()

  // Step 3: activity Log — only when the run produced suggestions, as in
  // on-upload discovery (a zero-result Log has no pulses to hang LOGGED_FOR
  // on and would be reachable from no feed). LOGGED_FOR surfaces the Log in
  // the feed of EVERY context holding the pulse, and a pulse can also be held
  // in another Space — so anchor only to pulses held in this Space alone.
  const count = within.length + crossField.length
  if (count > 0) {
    try {
      const pulseIds = await pulsesHeldOnlyInSpace(
        spaceId,
        Array.from(
          new Set(
            [...within, ...crossField].flatMap((s) => [
              s.sourcePulseId,
              s.targetPulseId,
            ])
          )
        )
      )
      // Every pulse also held elsewhere → no feed this Space alone owns; skip
      // rather than write a Log no feed can reach.
      if (pulseIds.length > 0) {
        await createLog({
          userId: actorUserId,
          description: `Resonance discovery found ${count} suggestion${count === 1 ? '' : 's'} across this space${
            crossField.length > 0
              ? ` (${crossField.length} between different fields)`
              : ''
          }`,
          pulseIds,
          contextId: triggerContextId,
          metadata: {
            event: 'resonance_discovery_run',
            trigger: 'manual',
            contextId: triggerContextId,
            spaceId,
            embeddedCount,
            suggestionsCreated: within.length,
            crossFieldSuggestionsCreated: crossField.length,
            completed,
          },
        })
      }
    } catch (logErr) {
      console.warn('[ManualSweep] activity log write failed:', logErr)
    }
  }

  return {
    embeddedCount,
    suggestionsCreated: within.length,
    crossFieldSuggestionsCreated: crossField.length,
    completed,
  }
}

/**
 * The subset of `pulseIds` with no live holding context outside `spaceId`.
 * One statement, bounded by the input list.
 */
async function pulsesHeldOnlyInSpace(
  spaceId: string,
  pulseIds: string[]
): Promise<string[]> {
  if (pulseIds.length === 0) return []
  const graph = await initGraph()
  const rows = await graph.query<{ id: string }>(
    `UNWIND $pulseIds AS pulseId
     MATCH (p:FieldPulse {id: pulseId})
     WHERE NOT EXISTS {
       MATCH (other:Space)-[:HAS_CONTEXT]->(:FieldContext)-[:HAS_PULSE]->(p)
       WHERE other.id <> $spaceId
     }
     RETURN p.id AS id`,
    { spaceId, pulseIds }
  )
  return Array.isArray(rows) ? rows.map((r) => r.id) : []
}
