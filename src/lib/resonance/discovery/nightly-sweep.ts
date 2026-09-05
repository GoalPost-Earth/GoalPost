/**
 * Scheduled resonance sweep (GOAL-347)
 *
 * This is the body of `/api/cron/discover-resonances` — ADR-008's daily
 * Resonance Discovery job — lifted out of the route handler so the route stays
 * a thin auth + transport shell and this logic is directly testable.
 *
 * The job it does is unchanged in intent: embed whatever is missing an
 * embedding, then look for semantic connections between pulses and write them
 * as pending `ResonanceSuggestion`s. What GOAL-347 adds is the ability to
 * SURVIVE its own cost. The sweep runs in a serverless function with a hard
 * `maxDuration = 300`, and a cold sweep over every Space with an LLM call per
 * pulse costs far more than that. Previously it simply ran until the platform
 * killed it, which meant:
 *
 *   - the phases after the kill point never ran, on any night; and
 *   - the caller got a 504 with no idea how far it had got.
 *
 * So every phase here runs against an explicit deadline and reports what it
 * finished, what it did not, and how much remains. A pass that stops early is
 * a normal, successful outcome — `sweepGlobalResonances` orders Spaces
 * least-recently-swept first, so the next pass picks up the remainder.
 */

import neo4j from 'neo4j-driver'
import { initGraph } from '@/modules/graph'
import { generatePulseEmbeddings } from '../embeddings/pulse-embedder'
import { generatePersonEmbedding } from '../embeddings/person-embedder'
import { sweepGlobalResonances, type SweptSpace } from './global-sweep'
import {
  PULSES_NEEDING_EMBEDDING,
  PEOPLE_NEEDING_EMBEDDING,
} from './embedding-selectors'
import { createLog } from '@/lib/activity-logs/create-log'

/**
 * Rows fetched per embedding batch. Each row is one OpenAI round-trip, so this
 * is a query-size bound, not a run-size bound — the phase loops for as many
 * batches as its slice of the time budget allows.
 */
const EMBEDDING_BATCH_SIZE = 100

/**
 * Fractions of the run budget the two embedding phases may each consume.
 *
 * Embeddings come first and are capped because they are the PREREQUISITE for
 * discovery — an un-embedded pulse is invisible to vector search and can never
 * resonate — but they must not be able to eat the entire run: a large backlog
 * would then starve discovery every night while the backlog itself drains
 * anyway. Whatever a phase leaves unspent rolls into discovery, which gets the
 * remainder of the budget.
 */
const PULSE_EMBEDDING_BUDGET_SHARE = 0.35
const PERSON_EMBEDDING_BUDGET_SHARE = 0.15

/** Neither embedding phase may push the pair past this share of the run. */
const EMBEDDING_BUDGET_CEILING_SHARE =
  PULSE_EMBEDDING_BUDGET_SHARE + PERSON_EMBEDDING_BUDGET_SHARE

/**
 * Held back from discovery for the activity-log phase.
 *
 * Phase 3 is real graph work — an owner read and a multi-clause write per Space
 * that gained suggestions — so it needs budget of its own INSIDE the run, not
 * out of the headroom the route reserves for serializing its response. Without
 * this, discovery would run to the last millisecond and the logging would push
 * the function past `maxDuration`, turning a successful pass into the bare 504
 * this design exists to avoid.
 */
const LOG_PHASE_RESERVE_MS = 20_000

export interface EmbeddingPhaseReport {
  embedded: number
  failed: number
  /**
   * Rows STILL SELECTABLE by this phase when it stopped.
   *
   * Named for what it actually counts: the selectors deliberately exclude rows
   * that can never be embedded (soft-deleted pulses, contentless people), so
   * this reaching 0 means "no embeddable row is outstanding", NOT "every node
   * in the graph has an embedding" — on demo, 5 Person nodes have no embedding
   * and never will. This is the number to watch converge across nights.
   */
  remainingEmbeddable: number
  /** False when the phase stopped on its budget rather than on an empty backlog. */
  completed: boolean
}

export interface ResonanceSweepReport {
  ok: boolean
  pulseEmbeddings: EmbeddingPhaseReport
  personEmbeddings: EmbeddingPhaseReport
  suggestionsCreated: number
  spacesSwept: number
  spacesTotal: number
  /** Activity Logs written this pass (one per Space that gained suggestions). */
  logsWritten: number
  /** True when every Space was reached this pass. */
  discoveryCompleted: boolean
  /** Wall-clock ms consumed by the whole sweep. */
  durationMs: number
  error?: string
}

function remainingMs(deadlineAt: number): number {
  return deadlineAt - Date.now()
}

/**
 * Drain an "IS NULL embedding" backlog in batches until it is empty or the
 * phase deadline passes.
 *
 * `selectable` is a Cypher fragment ending in a WHERE clause that binds `p` to
 * the rows still needing an embedding. It is reused verbatim for the page query
 * and the closing count, so the number reported as `remaining` is by
 * construction the same population the loop was draining — the two can't drift.
 */
async function backfillEmbeddings(params: {
  label: string
  selectable: string
  deadlineAt: number
  embed: (id: string) => Promise<unknown>
}): Promise<EmbeddingPhaseReport> {
  const { label, selectable, deadlineAt, embed } = params
  const graph = await initGraph()

  let embedded = 0
  let failed = 0
  // Ids that threw this run. They stay `embedding IS NULL`, so without
  // excluding them the very next page query re-selects them ahead of untried
  // rows: a batch where 1 of 100 succeeds would otherwise cost 100 calls per
  // row of progress until the deadline. Run-scoped on purpose — a transient
  // provider failure gets a fresh try next run, it is only within this pass
  // that retrying a known-bad row is certain waste.
  const skip: string[] = []

  for (;;) {
    if (remainingMs(deadlineAt) <= 0) break

    const batch = await graph.query<{ id: string }>(
      `${selectable}
         AND NOT p.id IN $skip
       RETURN p.id as id
       LIMIT $limit`,
      // LIMIT rejects a Neo4j Float and the LangChain graph layer encodes a
      // plain JS number as one, so the bound must be an explicit integer.
      { skip, limit: neo4j.int(EMBEDDING_BATCH_SIZE) }
    )
    if (!Array.isArray(batch) || batch.length === 0) break

    // Tracked PER BATCH, not cumulatively: the guard below asks "did this batch
    // move the backlog", and a cumulative counter would answer with successes
    // from earlier batches — so a provider outage starting midway through the
    // phase would spin until the deadline instead of stopping.
    let batchEmbedded = 0
    let batchFailed = 0

    for (const { id } of batch) {
      if (remainingMs(deadlineAt) <= 0) break
      try {
        await embed(id)
        batchEmbedded += 1
      } catch (error) {
        batchFailed += 1
        skip.push(id)
        console.error(`[Resonance Sweep] ✗ Failed to embed ${label} ${id}:`, error)
      }
    }

    embedded += batchEmbedded
    failed += batchFailed

    // A batch that embedded nothing and attempted every row makes no progress.
    // Stop rather than spend the rest of the phase budget on a provider outage
    // or a systematically unembeddable batch. (`batchEmbedded + batchFailed <
    // batch.length` means the deadline cut the batch short, which the loop head
    // handles.)
    if (batchEmbedded === 0 && batchFailed >= batch.length) {
      console.warn(
        `[Resonance Sweep] ${label}: a full batch of ${batch.length} failed with no successes — stopping this phase.`
      )
      break
    }
  }

  // Deliberately NOT filtered by `skip`: this is the outstanding backlog an
  // operator watches, and a row that failed this run is still outstanding.
  const remainingRows = await graph.query<{ remaining: number }>(
    `${selectable} RETURN count(p) as remaining`,
    {}
  )
  // The LangChain Neo4jGraph layer returns Neo4j integers as strings, so a
  // count must be coerced rather than read as a number.
  const remainingEmbeddable = Number(remainingRows?.[0]?.remaining ?? 0)

  console.log(
    `[Resonance Sweep] ${label} embeddings: ${embedded} embedded, ${failed} failed, ${remainingEmbeddable} still embeddable`
  )
  return {
    embedded,
    failed,
    remainingEmbeddable,
    completed: remainingEmbeddable === 0,
  }
}

/**
 * Write one activity Log per Space that gained suggestions this pass.
 *
 * `createLog` attributes to a Person (`CREATED_BY`) and there is no logged-in
 * user behind a scheduled run, so each Space's Log is attributed to that
 * Space's owner and anchored (`LOGGED_FOR`) on the pulses the suggestions
 * connect.
 *
 * WHICH pulses may be anchored is the subtle part. A Log reaches a member's
 * feed by traversal — Log -[:LOGGED_FOR]-> FieldPulse <-[:HAS_PULSE]- context
 * <-[:HAS_CONTEXT]- Space (see getUserLogs / getContextLogs) — so the boundary
 * that matters is not "are both ends of the suggestion in this Space" (they
 * always are, by construction) but "is this pulse reachable from ONLY this
 * Space". Those differ: a FieldPulse can carry HAS_PULSE edges from contexts in
 * two different Spaces, and both dev and demo currently hold two such pulses.
 * Anchoring one would put a Log attributed to THIS Space's owner into the feed
 * of an unrelated Space's members — a Space-boundary crossing in a product
 * whose first principle is data sovereignty (kb/06-adr.md ADR-003), and one
 * this sweep would be the first writer in the graph to create. So the anchor
 * set is filtered to single-Space pulses below.
 *
 * Spaces that produced nothing get no Log, and neither does a Space whose
 * suggestions touch only shared pulses: `createLog` reaches a feed only via its
 * pulse edges, so such a Log would be an unreachable node accumulated on every
 * quiet night. The console line and the response body already record the run.
 *
 * Note `createLog` accepts `spaceId`/`contextId` but links neither — only
 * `pulseIds` become edges. The spaceId is passed for intent and is carried
 * durably in `metadata`, which is what actually persists.
 */
async function logSweptSpaces(
  spaces: SweptSpace[],
  deadlineAt: number
): Promise<number> {
  const graph = await initGraph()
  let written = 0

  for (const space of spaces) {
    if (space.resonances.length === 0) continue
    // Two graph round-trips per Space, so this loop needs its own guard: it is
    // the last thing standing between a completed sweep and the function
    // ceiling. A Log skipped here costs a feed entry, not any discovered
    // resonance — those are already durable.
    if (remainingMs(deadlineAt) <= 0) {
      console.warn(
        '[Resonance Sweep] Budget spent before every activity log was written; the remaining Spaces have their suggestions but no feed entry this pass.'
      )
      break
    }
    try {
      const ownerRows = await graph.query<{ ownerId: string | null }>(
        `MATCH (space:Space {id: $spaceId})
         OPTIONAL MATCH (owner:Person)-[:OWNS]->(space)
         RETURN owner.id as ownerId
         LIMIT 1`,
        { spaceId: space.spaceId }
      )
      const ownerId = ownerRows?.[0]?.ownerId
      if (!ownerId) {
        console.warn(
          `[Resonance Sweep] Space ${space.spaceId} has no owner to attribute its activity log to; skipping the log.`
        )
        continue
      }

      const candidateIds = Array.from(
        new Set(
          space.resonances.flatMap((r) => [r.sourcePulseId, r.targetPulseId])
        )
      )

      // Keep only pulses whose Space set is exactly this Space (see the
      // traversal note above). `collect(DISTINCT s.id) = [$spaceId]` is the
      // whole test: one Space, and it is ours.
      const ownRows = await graph.query<{ id: string }>(
        `UNWIND $candidateIds AS pid
         MATCH (p:FieldPulse {id: pid})<-[:HAS_PULSE]-(:FieldContext)<-[:HAS_CONTEXT]-(s:Space)
         WITH p, collect(DISTINCT s.id) AS spaceIds
         WHERE spaceIds = [$spaceId]
         RETURN p.id AS id`,
        { candidateIds, spaceId: space.spaceId }
      )
      const pulseIds = Array.isArray(ownRows) ? ownRows.map((r) => r.id) : []
      if (pulseIds.length === 0) {
        console.warn(
          `[Resonance Sweep] Space ${space.spaceId}: every suggested pulse is shared with another Space; skipping the activity log rather than surfacing it in an unrelated feed.`
        )
        continue
      }

      const count = space.resonances.length

      await createLog({
        userId: ownerId,
        description: `Nightly resonance discovery found ${count} suggestion${
          count === 1 ? '' : 's'
        }`,
        pulseIds,
        spaceId: space.spaceId,
        metadata: {
          event: 'resonance_discovery_run',
          trigger: 'scheduled_sweep',
          spaceId: space.spaceId,
          suggestionsCreated: count,
        },
      })
      written += 1
    } catch (error) {
      // Best-effort: the suggestions are already durable, and losing a feed
      // entry must not fail the sweep or block the Spaces after this one.
      console.warn(
        `[Resonance Sweep] Activity log write failed for space ${space.spaceId}:`,
        error
      )
    }
  }

  return written
}

/**
 * Run one pass of the scheduled sweep within `budgetMs` of wall clock.
 *
 * Never throws: the caller is a cron endpoint whose only useful response is a
 * report of what happened, and a thrown error would lose the counts for the
 * phases that did succeed.
 */
export async function runResonanceSweep(
  budgetMs: number
): Promise<ResonanceSweepReport> {
  const startedAt = Date.now()
  const deadlineAt = startedAt + budgetMs
  const emptyPhase = (): EmbeddingPhaseReport => ({
    embedded: 0,
    failed: 0,
    remainingEmbeddable: 0,
    completed: false,
  })

  let pulseEmbeddings = emptyPhase()
  let personEmbeddings = emptyPhase()

  try {
    // Phase 1 — embeddings. These gate everything downstream (an un-embedded
    // pulse is invisible to vector search and can never resonate), so they run
    // first; each is capped so a backlog cannot starve discovery every night.
    pulseEmbeddings = await backfillEmbeddings({
      label: 'pulse',
      selectable: PULSES_NEEDING_EMBEDDING,
      // Measured from the START of the run, so this phase can never take more
      // than its share however slow the provider is.
      deadlineAt: startedAt + budgetMs * PULSE_EMBEDDING_BUDGET_SHARE,
      embed: generatePulseEmbeddings,
    })
    personEmbeddings = await backfillEmbeddings({
      label: 'person',
      selectable: PEOPLE_NEEDING_EMBEDDING,
      // Measured from NOW — whenever the pulse phase actually finished — so
      // this phase always gets its full share and a pulse phase that returned
      // early donates the difference to discovery rather than to this one. The
      // second bound is what actually enforces the promise in the share
      // constants above: a pulse phase can only stop BETWEEN embedding calls
      // (and the provider client retries internally), so it can overrun its own
      // deadline. Without the cumulative ceiling the two embedding phases could
      // consume the entire run and discovery would sweep nothing at all.
      deadlineAt: Math.min(
        Date.now() + budgetMs * PERSON_EMBEDDING_BUDGET_SHARE,
        startedAt + budgetMs * EMBEDDING_BUDGET_CEILING_SHARE
      ),
      embed: generatePersonEmbedding,
    })

    // Phase 2 — discovery gets the remainder, minus the logging reserve.
    const discoveryDeadline = deadlineAt - LOG_PHASE_RESERVE_MS
    console.log(
      `[Resonance Sweep] Discovering resonance suggestions with ${Math.round(
        Math.max(0, remainingMs(discoveryDeadline)) / 1000
      )}s of budget left...`
    )
    const discovery = await sweepGlobalResonances({
      deadlineAt: discoveryDeadline,
    })

    // Phase 3 — activity logs for the Spaces that gained suggestions.
    const logsWritten = await logSweptSpaces(discovery.spaces, deadlineAt)

    return {
      ok: true,
      pulseEmbeddings,
      personEmbeddings,
      suggestionsCreated: discovery.resonances.length,
      spacesSwept: discovery.spacesSwept,
      spacesTotal: discovery.spacesTotal,
      logsWritten,
      discoveryCompleted: discovery.completed,
      durationMs: Date.now() - startedAt,
    }
  } catch (error) {
    console.error('[Resonance Sweep] Run failed:', error)
    return {
      ok: false,
      pulseEmbeddings,
      personEmbeddings,
      suggestionsCreated: 0,
      spacesSwept: 0,
      spacesTotal: 0,
      logsWritten: 0,
      discoveryCompleted: false,
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}
