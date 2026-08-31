import { randomUUID } from 'node:crypto'
import type { Driver } from 'neo4j-driver'

/**
 * FieldContext soft-delete orchestrator (GOAL-319). Shared by the GraphQL
 * `deleteFieldContext` mutation and the assistant's `delete_field_context`
 * HITL tool so both paths delete identically.
 *
 * Soft delete = one atomic write transaction that:
 *
 *   permission gate (owner or ADMIN) ──┐
 *   collect the sub-context subtree    │
 *     (HAS_SUBCONTEXT*, GOAL-295)      │
 *   stamp deletedAt on contexts+pulses ├─ single write transaction
 *   drop ResonanceSuggestions          │
 *   re-point each HAS_CONTEXT →        │
 *     HAS_DELETED_CONTEXT              │
 *   activity Log                       ┘
 *
 * Why edge re-pointing instead of filtering: every read surface reaches
 * content through `(Space)-[:HAS_CONTEXT]->(FieldContext)` — the GraphQL
 * `@authorization` filters on FieldContext/pulses/documents/weaves, the raw
 * `viewablePulsePredicate` gate, resonance discovery, and the bloom
 * generator's fail-closed Space anchoring. Replacing that edge with
 * `HAS_DELETED_CONTEXT` makes the context and everything beneath it
 * invisible to all of them at once, with no per-query filter changes. The
 * `deletedAt` stamps cover the few reads that do NOT traverse from a Space
 * (vector-index lookups, the embedding backfill sweep) and drive the 90-day
 * purge cron (`purge-deleted-field-contexts.ts`).
 *
 * ResonanceSuggestions are hard-deleted here, not parked: their inbox is
 * anchored `(Space)-[:HAS_SUGGESTION]->` directly on the Space, so they
 * would survive the edge re-pointing — and they are regenerable AI
 * proposals, not user data (nightly discovery re-proposes within live
 * contexts only).
 *
 * Authorization matches the FieldContext DELETE matrix in
 * kb/02-user-roles.md: Space owner or ADMIN only (MEMBERs can create and
 * update fields but not drop them). A missing context and a forbidden
 * caller both return the same `forbidden` failure so existence is not
 * leaked to non-members — same convention as `handleDeleteDocument`.
 */

export interface SoftDeleteFieldContextDependencies {
  driver: Driver
}

export interface SoftDeleteFieldContextInput {
  currentUserId: string
  contextId: string
}

export type SoftDeleteFailureReason = 'forbidden' | 'invalid_input'

export interface SoftDeleteSuccess {
  ok: true
  contextId: string
  title: string
  deletedPulseCount: number
  /** Nested sub-contexts soft-deleted along with the target (GOAL-295). */
  deletedSubContextCount: number
}

export interface SoftDeleteFailure {
  ok: false
  reason: SoftDeleteFailureReason
  error: string
}

export type SoftDeleteFieldContextResult =
  | SoftDeleteSuccess
  | SoftDeleteFailure

export async function softDeleteFieldContext(
  deps: SoftDeleteFieldContextDependencies,
  input: SoftDeleteFieldContextInput
): Promise<SoftDeleteFieldContextResult> {
  const contextId = input.contextId?.trim() || ''
  if (!contextId) {
    return {
      ok: false,
      reason: 'invalid_input',
      error: 'contextId is required.',
    }
  }
  const userId = input.currentUserId?.trim() || ''
  if (!userId) {
    return {
      ok: false,
      reason: 'forbidden',
      error: 'You do not have permission to delete this field context.',
    }
  }

  const logId = `log_${Date.now()}_${randomUUID().slice(0, 8)}`
  const metadata = JSON.stringify({ contextId })

  const session = deps.driver.session()
  try {
    const result = await session.executeWrite((tx) =>
      tx.run(
        `
        MATCH (space:Space)-[:HAS_CONTEXT]->(c:FieldContext {id: $contextId})
        OPTIONAL MATCH (owner:Person {id: $userId})-[:OWNS]->(space)
        OPTIONAL MATCH (space)-[:HAS_MEMBER]->(sm:SpaceMembership)-[:IS_MEMBER]->(:Person {id: $userId})
        WHERE sm.role = 'ADMIN'
        WITH c, (owner IS NOT NULL OR sm IS NOT NULL) AS allowed
        WHERE allowed
        WITH DISTINCT c
        MATCH (u:Person:User {id: $userId})
        // GOAL-295: deletion cascades over the context's whole sub-context
        // subtree (HAS_SUBCONTEXT overlay). Already-soft-deleted descendants
        // were handled by their own delete and are skipped.
        MATCH (c)-[:HAS_SUBCONTEXT*0..10]->(dc:FieldContext)
        WHERE dc.deletedAt IS NULL
        WITH c, u, collect(DISTINCT dc) AS ctxs
        // A pulse can be HAS_PULSE-attached to several contexts
        // (linkPulseToContext). Only pulses whose every LIVE holder sits
        // inside the deleted subtree are stamped — a pulse shared with a
        // live context outside it stays fully live there. A co-holder that
        // is itself soft-deleted does not block (the pulse is hidden either
        // way and must join the purge).
        UNWIND ctxs AS holder
        OPTIONAL MATCH (holder)-[:HAS_PULSE]->(pulse:FieldPulse)
        WHERE NOT EXISTS {
          MATCH (other:FieldContext)-[:HAS_PULSE]->(pulse)
          WHERE NOT other IN ctxs AND other.deletedAt IS NULL
        }
        WITH c, u, ctxs, collect(DISTINCT pulse) AS pulses
        // Suggestions anchored on any subtree context…
        UNWIND ctxs AS sugHolder
        OPTIONAL MATCH (sugHolder)-[:HAS_SUGGESTION]->(ctxSug:ResonanceSuggestion)
        WITH c, u, ctxs, pulses, collect(DISTINCT ctxSug) AS ctxSugs
        // …plus any suggestion touching one of the stamped pulses (the
        // suggestion inbox is Space-anchored, so these would otherwise
        // survive the edge re-pointing and offer links to hidden pulses).
        UNWIND (CASE WHEN size(pulses) = 0 THEN [null] ELSE pulses END) AS p
        OPTIONAL MATCH (pulseSug:ResonanceSuggestion)-[:SOURCE|TARGET]->(p)
        WITH c, u, ctxs, pulses, ctxSugs, collect(DISTINCT pulseSug) AS pulseSugs
        WITH c, u, ctxs, pulses,
             ctxSugs + [s IN pulseSugs WHERE NOT s IN ctxSugs] AS sugs
        FOREACH (dc IN ctxs | SET dc.deletedAt = datetime())
        FOREACH (p IN pulses | SET p.deletedAt = datetime())
        FOREACH (s IN sugs | DETACH DELETE s)
        WITH c, u, ctxs, size(pulses) AS pulseCount,
             size(ctxs) - 1 AS subContextCount, c.title AS title
        // Re-point every subtree member's Space edge so the whole branch
        // disappears from every HAS_CONTEXT-anchored read at once.
        UNWIND ctxs AS repoint
        MATCH (s:Space)-[rel:HAS_CONTEXT]->(repoint)
        MERGE (s)-[:HAS_DELETED_CONTEXT]->(repoint)
        DELETE rel
        WITH DISTINCT c, u, pulseCount, subContextCount, title
        CREATE (log:Log {
          id: $logId,
          description: 'Deleted field "' + coalesce(title, 'Untitled') + '"' +
            CASE
              WHEN subContextCount = 1 THEN ' with 1 nested field'
              WHEN subContextCount > 1 THEN ' with ' + toString(subContextCount) + ' nested fields'
              ELSE ''
            END +
            CASE
              WHEN pulseCount = 1 THEN ' and 1 pulse'
              WHEN pulseCount > 1 THEN ' and ' + toString(pulseCount) + ' pulses'
              ELSE ''
            END,
          metadata: $metadata,
          createdAt: datetime()
        })
        CREATE (log)-[:CREATED_BY]->(u)
        RETURN c.id AS contextId, title, pulseCount, subContextCount
        LIMIT 1
        `,
        { contextId, userId, logId, metadata }
      )
    )

    const record = result.records[0]
    if (!record) {
      return {
        ok: false,
        reason: 'forbidden',
        error: 'You do not have permission to delete this field context.',
      }
    }

    return {
      ok: true,
      contextId: record.get('contextId') as string,
      title: (record.get('title') as string | null) ?? '',
      deletedPulseCount: Number(record.get('pulseCount') ?? 0),
      deletedSubContextCount: Number(record.get('subContextCount') ?? 0),
    }
  } finally {
    await session.close()
  }
}
