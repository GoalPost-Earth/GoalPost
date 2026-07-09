/**
 * On-upload resonance discovery (GOAL-294)
 *
 * Document ingestion creates FieldPulses but never embeds them, and the only
 * embedding backfill + discovery pass is the daily Vercel cron
 * (`/api/cron/discover-resonances`). So an uploaded document's pulses sit
 * unembedded — and therefore invisible to `findSimilarPulsesInContext`'s vector
 * search — until (at best) the next midnight sweep. Robert's "AI Adoption"
 * field had 53 pulses, 0 embeddings, 0 resonances for exactly this reason.
 *
 * This module closes that gap: right after an upload lands, it embeds the
 * upload's context (bounded) and runs discovery scoped to that one context, so
 * pending `ResonanceSuggestion`s exist by the time the member goes looking. It
 * is deliberately fire-and-forget friendly — every failure is caught and
 * reported in the return value, never thrown — so the caller can schedule it
 * via `after()` without risking the upload response.
 */

import neo4j from 'neo4j-driver'
import { initGraph } from '@/modules/graph'
import { generatePulseEmbeddings } from '../embeddings/pulse-embedder'
import {
  discoverResonancesForContext,
  discoverCrossContextResonancesForContext,
} from './pattern-detector'
import { getAccessibleFieldContexts } from '@/lib/permissions/accessible-contexts'
import { createLog } from '@/lib/activity-logs/create-log'

/**
 * Upper bound on embeddings generated per run. Each is an OpenAI round-trip, so
 * the cap keeps a run inside the ingest route's `maxDuration` even for a large
 * backlog; anything beyond it is picked up by the next run / the cron.
 */
const MAX_EMBEDDING_BACKFILL = 100

export interface ContextDiscoveryResult {
  ok: boolean
  contextId: string
  spaceId: string | null
  embeddedCount: number
  suggestionsCreated: number
  /**
   * Cross-context suggestions (GOAL-293) — connections between the upload's
   * pulses and pulses in the member's OTHER accessible contexts. Counted
   * separately from the within-context `suggestionsCreated` so ops can see how
   * much value the cross-context expansion adds.
   */
  crossContextSuggestionsCreated: number
  error?: string
}

/**
 * Embed any un-embedded pulses in a FieldContext, then run resonance discovery
 * scoped to that context and write an activity Log for the run.
 *
 * Space-scope: the owning Space is resolved from the context and passed to
 * discovery, which only ever reads/writes within that Space — no cross-Space
 * leakage. Idempotent-safe: suggestion creation dedups symmetric pairs, so
 * running this on every upload never duplicates existing suggestions/links.
 *
 * AUTHORIZATION CONTRACT: this helper does NOT gate — callers MUST verify that
 * `actorUserId` can edit `contextId` before invoking (the ingest route gates on
 * `canEditContent` before scheduling this). Its blast radius is bounded to the
 * one Space that owns `contextId`, and `actorUserId` is used only as Log
 * attribution, so a mis-call can't leak content across Spaces — but keep the
 * gate at the call site.
 */
export async function runContextResonanceDiscovery(params: {
  contextId: string
  actorUserId: string
}): Promise<ContextDiscoveryResult> {
  const { contextId, actorUserId } = params

  try {
    const graph = await initGraph()

    // Resolve the owning Space — discovery is Space-scoped throughout.
    const spaceRows = await graph.query<{ spaceId: string | null }>(
      `MATCH (s:Space)-[:HAS_CONTEXT]->(:FieldContext {id: $contextId})
       RETURN s.id AS spaceId
       LIMIT 1`,
      { contextId }
    )
    const spaceId = spaceRows?.[0]?.spaceId ?? null
    if (!spaceId) {
      console.warn(
        `[OnUploadDiscovery] No Space owns context ${contextId}; skipping discovery.`
      )
      return {
        ok: false,
        contextId,
        spaceId: null,
        embeddedCount: 0,
        suggestionsCreated: 0,
        crossContextSuggestionsCreated: 0,
        error: 'No Space owns this context',
      }
    }

    // Step 1: embed pulses in this context that lack embeddings. Discovery's
    // vector search skips un-embedded pulses entirely, so this is what makes
    // freshly-ingested pulses eligible at all.
    const missing = await graph.query<{ id: string }>(
      `MATCH (:FieldContext {id: $contextId})-[:HAS_PULSE]->(p:FieldPulse)
       WHERE p.embedding IS NULL
       RETURN p.id AS id
       LIMIT $limit`,
      // neo4j.int() is required: LIMIT rejects a Float, and the LangChain graph
      // layer encodes a plain JS number as a Float (throws '100.0' is not valid).
      { contextId, limit: neo4j.int(MAX_EMBEDDING_BACKFILL) }
    )
    const missingIds = Array.isArray(missing) ? missing.map((r) => r.id) : []
    let embeddedCount = 0
    for (const pulseId of missingIds) {
      try {
        await generatePulseEmbeddings(pulseId)
        embeddedCount++
      } catch (err) {
        console.error(
          `[OnUploadDiscovery] Failed to embed pulse ${pulseId}:`,
          err
        )
      }
    }
    console.log(
      `[OnUploadDiscovery] Embedded ${embeddedCount}/${missingIds.length} missing pulses in context ${contextId}`
    )

    // Step 2: discover resonances scoped to this context only.
    const suggestions = await discoverResonancesForContext(spaceId, contextId)
    console.log(
      `[OnUploadDiscovery] Created ${suggestions.length} suggestions in context ${contextId}`
    )

    // Step 3: cross-context discovery (GOAL-293). Compare the upload's pulses
    // against pulses in the uploader's OTHER accessible FieldContexts and write
    // pending cross-context suggestions anchored to THIS Space/context.
    //
    // DATA-SOVEREIGNTY GATE: a suggestion anchored to Space S surfaces to
    // EVERYONE who can view S (via GET /api/resonance/suggestions?spaceId=S),
    // and it embeds the TARGET pulse's content. The uploader can view every
    // target (accessibleContextIds is their own viewable set), but the OTHER
    // members of a shared source Space may NOT be able to view a target that
    // lives in the uploader's private MeSpace or a different WeSpace — that
    // would leak private content to a co-member with no role on the target's
    // Space (kb/06-adr.md, kb/02-user-roles.md). We therefore only run
    // cross-context discovery when the source Space is a MeSpace the uploader
    // OWNS: its audience is exactly {uploader}, so every target the uploader can
    // view is, by definition, viewable by the sole person who sees these
    // suggestions. Cross-context for a shared (WeSpace) upload would require
    // filtering targets to those whose audience is a superset of the source
    // Space's — a heavier per-target check left as a follow-up. Within-context
    // discovery (step 2) still runs for every Space.
    let crossContext: Awaited<
      ReturnType<typeof discoverCrossContextResonancesForContext>
    > = []
    try {
      const ownGate = await graph.query<{ ownedMeSpace: number }>(
        `MATCH (s:Space {id: $spaceId})
         RETURN CASE
           WHEN s:MeSpace AND EXISTS { (s)<-[:OWNS]-(:Person {id: $actorUserId}) }
           THEN 1 ELSE 0 END AS ownedMeSpace`,
        { spaceId, actorUserId }
      )
      const isOwnedMeSpace = Number(ownGate?.[0]?.ownedMeSpace ?? 0) === 1

      if (!isOwnedMeSpace) {
        console.log(
          `[OnUploadDiscovery] Source Space ${spaceId} is not the uploader's own MeSpace; skipping cross-context discovery (would risk cross-Space exposure).`
        )
      } else {
        const accessible = await getAccessibleFieldContexts(graph, actorUserId)
        const accessibleContextIds = accessible.map((a) => a.contextId)
        crossContext = await discoverCrossContextResonancesForContext({
          sourceSpaceId: spaceId,
          sourceContextId: contextId,
          accessibleContextIds,
        })
        console.log(
          `[OnUploadDiscovery] Created ${crossContext.length} cross-context suggestions from context ${contextId} across ${
            accessibleContextIds.filter((id) => id !== contextId).length
          } other accessible contexts`
        )
      }
    } catch (crossErr) {
      // Cross-context is additive — a failure here must not lose the
      // within-context suggestions already written above.
      console.error(
        '[OnUploadDiscovery] Cross-context discovery failed:',
        crossErr
      )
    }

    // Step 4: activity Log for the run — only when it actually produced
    // suggestions. createLog only edges the Log to its `pulseIds` (LOGGED_FOR);
    // a zero-result run has no pulses to anchor, so its Log would be reachable
    // by neither the context nor the user activity feed — an unreachable node
    // accumulated on every no-op upload. The console line above already records
    // the run for ops; skip the graph Log when there's nothing to surface.
    const count = suggestions.length + crossContext.length
    if (count > 0) {
      try {
        // Anchor the Log ONLY to pulses that live in THIS context, so it stays
        // in the uploader's own activity feed. Within-context suggestions have
        // both ends here; cross-context suggestions have only their SOURCE here
        // (the TARGET lives in another context/Space — LOGGED_FOR-ing it would
        // surface this uploader-attributed Log in that other feed, code-review
        // finding #2).
        const pulseIds = Array.from(
          new Set([
            ...suggestions.flatMap((s) => [s.sourcePulseId, s.targetPulseId]),
            ...crossContext.map((s) => s.sourcePulseId),
          ])
        )
        const crossCount = crossContext.length
        await createLog({
          userId: actorUserId,
          description: `Resonance discovery found ${count} suggestion${count === 1 ? '' : 's'} from a new upload${
            crossCount > 0
              ? ` (${crossCount} across your other fields)`
              : ''
          }`,
          pulseIds,
          contextId,
          metadata: {
            event: 'resonance_discovery_run',
            trigger: 'upload',
            contextId,
            spaceId,
            embeddedCount,
            suggestionsCreated: suggestions.length,
            crossContextSuggestionsCreated: crossCount,
          },
        })
      } catch (logErr) {
        console.warn('[OnUploadDiscovery] activity log write failed:', logErr)
      }
    }

    return {
      ok: true,
      contextId,
      spaceId,
      embeddedCount,
      suggestionsCreated: suggestions.length,
      crossContextSuggestionsCreated: crossContext.length,
    }
  } catch (err) {
    // Fire-and-forget contract: never throw. The upload has already succeeded;
    // a discovery failure is logged and swallowed.
    console.error('[OnUploadDiscovery] Run failed:', err)
    return {
      ok: false,
      contextId,
      spaceId: null,
      embeddedCount: 0,
      suggestionsCreated: 0,
      crossContextSuggestionsCreated: 0,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}
