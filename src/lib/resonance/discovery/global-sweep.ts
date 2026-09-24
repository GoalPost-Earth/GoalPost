/**
 * Resumable global resonance sweep (GOAL-347).
 *
 * The fan-out layer between the scheduled job (`nightly-sweep.ts`) and the
 * per-context detector (`pattern-detector.ts`): it decides WHICH Spaces a pass
 * looks at, in what order, and when to stop.
 *
 * That ordering is the whole point. A cold sweep — no `lastRunTimestamp`, every
 * Space, an LLM analysis per pulse — costs far more than the 300s serverless
 * ceiling the job runs under. The previous implementation enumerated Spaces in
 * whatever order the graph returned and ran until the platform killed it, which
 * meant it died at the same point every night and the Spaces behind that point
 * were never swept even once. Ordering LEAST-RECENTLY-SWEPT FIRST, against a
 * persisted per-Space bookmark, is what converts a budget-limited pass from
 * lost work into forward progress.
 *
 * AUTHORIZATION: a pass never crosses a Space boundary. It fans out
 * Space -> root FieldContext -> that context's own subtree, and
 * `createResonanceSuggestionsInDatabase` independently requires both pulses to
 * sit in a live context OF THAT SPACE before it writes. Cross-context discovery
 * (GOAL-293) is deliberately NOT run here: it needs a specific member's
 * accessible-context set to stay inside data sovereignty (kb/06-adr.md
 * ADR-003), and a scheduled sweep has no member. Every suggestion is written
 * `status: 'pending'` for human review per ADR-004 — the sweep never promotes a
 * ResonanceLink.
 */

import neo4j from 'neo4j-driver'
import { initGraph } from '@/modules/graph'
import {
  discoverResonancesForSpace,
  budgetExhausted,
  type DiscoveredResonance,
  type ResonanceBudget,
} from './pattern-detector'

/**
 * Per-Space outcome of one pass, surfaced so the caller can attribute activity
 * Logs without re-deriving which Space each suggestion came from
 * (`DiscoveredResonance` carries a contextId, not a spaceId).
 */
export interface SweptSpace {
  spaceId: string
  spaceName: string
  resonances: DiscoveredResonance[]
}

export interface GlobalSweepResult {
  /** Every suggestion created this pass, across all Spaces reached. */
  resonances: DiscoveredResonance[]
  /**
   * Per-Space breakdown in QUEUE order (least-recently-swept first), not in the
   * order the pool happened to finish them. Spaces the pass never reached are
   * absent rather than present-and-empty.
   */
  spaces: SweptSpace[]
  /** Spaces enumerated for this pass. */
  spacesTotal: number
  /**
   * Spaces processed to completion. A Space the deadline cut short is NOT
   * counted here and keeps its old bookmark, so it leads the queue next pass.
   *
   * Deliberately NOT the same as `spaces.length`: a Space that finished its
   * work but failed the post-hoc budget check is recorded in `spaces` (its
   * suggestions are real and durable) yet not counted here (its bookmark was
   * not moved). Since GOAL-376 that gap can be as wide as the pool, because
   * every Space in flight when the deadline passes is treated that way — so a
   * pass legitimately reports e.g. `spacesSwept: 12` alongside 15 entries in
   * `spaces`, and `nightly-sweep.ts` writing one activity Log per entry will
   * report more logs than Spaces swept. That is correct, not a miscount.
   */
  spacesSwept: number
  /** True when every enumerated Space was processed to completion. */
  completed: boolean
}

export interface GlobalSweepOptions extends ResonanceBudget {
  /**
   * Incremental mode: only sweep Spaces with pulse activity since this
   * timestamp. Omit for a full sweep over every Space.
   */
  lastRunTimestamp?: string
  /** Hard cap on Spaces per pass, independent of the time budget. */
  maxSpaces?: number
  /**
   * Whether to persist the least-recently-swept bookmark. The scheduled job
   * wants this; an ad-hoc caller sharing the same graph should not silently
   * reorder the scheduler's queue. Defaults to true.
   */
  stampProgress?: boolean
  /**
   * Spaces to sweep at once. Defaults to RESONANCE_SWEEP_CONCURRENCY, then to
   * DEFAULT_SWEEP_CONCURRENCY. Present so a test can pin the pool size.
   */
  concurrency?: number
}

/**
 * Record that a Space has just been swept to completion.
 *
 * Best-effort by design — a Space whose stamp fails to write is swept again
 * sooner than necessary, which costs model spend but never loses work. Losing
 * the whole pass over a bookkeeping write would be the worse trade.
 */
async function stampSpaceSwept(
  spaceId: string,
  suggestionCount: number
): Promise<void> {
  try {
    const graph = await initGraph()
    await graph.query(
      `MERGE (state:ResonanceSweepState {spaceId: $spaceId})
       SET state.lastSweptAt = datetime(),
           state.lastSuggestionCount = $suggestionCount`,
      { spaceId, suggestionCount: neo4j.int(suggestionCount) }
    )
  } catch (error) {
    console.warn(
      `[Global Discovery] Could not stamp sweep state for space ${spaceId} — it will be re-swept sooner than necessary:`,
      error
    )
  }
}

/**
 * How many Spaces a pass sweeps at once (GOAL-376).
 *
 * The sweep is not CPU- or database-bound, it is bound by a remote model call:
 * one structured-output request per anchor pulse, awaited serially. Measured on
 * demo, that left a 270s pass covering ONE Space of nineteen, with ten Spaces
 * never swept at all since the job was first scheduled. Overlapping Spaces
 * turns that dead wait into coverage without touching the budget.
 *
 * Why the unit of concurrency is a SPACE and never a pulse: the suggestion
 * write is read-then-create with no uniqueness constraint on the pair, and both
 * the symmetric dedup and the per-pulse degree cap are documented as tolerating
 * — not preventing — a race between concurrent runs (see
 * `createResonanceSuggestionsInDatabase`). Those guards only hold while one
 * field is walked by one worker. A FieldContext belongs to exactly one Space
 * (verified on dev and demo: zero contexts carry HAS_CONTEXT from two Spaces)
 * and a Space is claimed by exactly one worker here, so every anchor within a
 * field stays sequential. Parallelising pulses instead would make the tolerated
 * duplicate the norm.
 *
 * That argument covers the FIELD but NOT the pair, and the difference matters:
 * a FieldPulse may be held by contexts in two different Spaces (demo and dev
 * each hold two such pulses, shared by the same two Spaces, which sit adjacent
 * in this queue). Two workers can therefore anchor the same pair at once, and
 * the dedup in `createResonanceSuggestionsInDatabase` is global on the pair but
 * read-then-create. `reserveResonancePair` there is what actually closes that
 * window; this comment would otherwise be asserting a guarantee the code does
 * not provide.
 *
 * Kept modest by default: demo's Neo4j is a 2GB shared box, and the ceiling
 * that actually matters is the provider's rate limit, not the pool.
 */
const DEFAULT_SWEEP_CONCURRENCY = 4
/** Upper bound on the env override, so a typo cannot open an unbounded fan-out. */
const MAX_SWEEP_CONCURRENCY = 16

function resolveSweepConcurrency(override?: number): number {
  const envValue = process.env.RESONANCE_SWEEP_CONCURRENCY?.trim()
  const requested =
    override ?? (envValue ? Number(envValue) : DEFAULT_SWEEP_CONCURRENCY)

  // Integer-strict on purpose. `Number.parseInt` would read "4x" as 4 and a
  // fractional 2.5 would reach `Array.from({ length: 2.5 })`, which silently
  // builds 2 workers — a pool size nobody asked for and nobody can see.
  if (!Number.isInteger(requested) || requested < 1) {
    console.warn(
      `[Global Discovery] Ignoring invalid sweep concurrency ${JSON.stringify(
        override ?? envValue
      )}; using ${DEFAULT_SWEEP_CONCURRENCY}.`
    )
    return DEFAULT_SWEEP_CONCURRENCY
  }
  return Math.min(requested, MAX_SWEEP_CONCURRENCY)
}

/**
 * One resumable pass of resonance discovery across Spaces.
 */
export async function sweepGlobalResonances(
  options: GlobalSweepOptions = {}
): Promise<GlobalSweepResult> {
  const {
    lastRunTimestamp,
    maxSpaces,
    deadlineAt,
    stampProgress = true,
    concurrency: concurrencyOverride,
  } = options
  const budget: ResonanceBudget = { deadlineAt }
  const graph = await initGraph()

  // Enumerate the Spaces to sweep. Every registered user owns a MeSpace, so a
  // global fan-out runs an LLM-backed analysis across the whole user base. On
  // an incremental run we anchor on the FieldPulse.modifiedAt / createdAt range
  // indexes to find only Spaces with recent pulse activity — that scales with
  // the change window, not the total graph. A full sweep processes all Spaces.
  //
  // Both branches order by the ResonanceSweepState bookmark so an interrupted
  // pass resumes rather than restarts; Spaces never swept have no state node
  // and sort first via the epoch-0 coalesce.
  //
  // `max(state.lastSweptAt)` rather than a bare property read: the uniqueness
  // constraint on :ResonanceSweepState(spaceId) is what normally guarantees one
  // bookmark per Space, but it only exists where `scripts/init-db.js` has been
  // run. Aggregating collapses any duplicates a constraint-less database picked
  // up from overlapping passes — without it those duplicates would multiply the
  // Space's rows here, inflating spacesTotal and making `completed` unreachable.
  const spacesResult = lastRunTimestamp
    ? await graph.query<{ spaceId: string; spaceName: string }>(
        `
        MATCH (p:FieldPulse)
        WHERE p.modifiedAt > datetime($lastRunTimestamp)
           OR p.createdAt > datetime($lastRunTimestamp)
        MATCH (space:Space)-[:HAS_CONTEXT]->(:FieldContext)-[:HAS_PULSE]->(p)
        WITH DISTINCT space
        OPTIONAL MATCH (state:ResonanceSweepState {spaceId: space.id})
        WITH space, max(state.lastSweptAt) AS lastSweptAt
        RETURN space.id as spaceId, space.name as spaceName
        ORDER BY coalesce(lastSweptAt, datetime({epochMillis: 0})) ASC,
                 space.id ASC
      `,
        { lastRunTimestamp }
      )
    : await graph.query<{ spaceId: string; spaceName: string }>(
        `
        MATCH (space:Space)
        OPTIONAL MATCH (state:ResonanceSweepState {spaceId: space.id})
        WITH space, max(state.lastSweptAt) AS lastSweptAt
        RETURN space.id as spaceId, space.name as spaceName
        ORDER BY coalesce(lastSweptAt, datetime({epochMillis: 0})) ASC,
                 space.id ASC
      `,
        {}
      )

  if (!Array.isArray(spacesResult) || spacesResult.length === 0) {
    console.log('[Global Discovery] No spaces found')
    return {
      resonances: [],
      spaces: [],
      spacesTotal: 0,
      spacesSwept: 0,
      completed: true,
    }
  }

  const spaces =
    maxSpaces && maxSpaces > 0 ? spacesResult.slice(0, maxSpaces) : spacesResult

  console.log(
    `[Global Discovery] Discovering resonances for ${spaces.length} spaces (least-recently-swept first)...`
  )

  const allDiscoveredResonances: DiscoveredResonance[] = []
  // Written by queue position rather than appended, so the per-Space breakdown
  // stays in least-recently-swept order however the pool happens to interleave.
  // Slots for Spaces the pass never reached stay empty and are dropped below.
  const visitedSlots: Array<SweptSpace | undefined> = new Array(spaces.length)
  let completedSpaces = 0
  // The shared queue cursor. Safe without a lock: workers only ever yield at an
  // `await`, and the read-and-increment below has none.
  let nextIndex = 0

  const concurrency = Math.min(
    resolveSweepConcurrency(concurrencyOverride),
    spaces.length
  )
  console.log(
    `[Global Discovery] Sweeping up to ${concurrency} space(s) at a time.`
  )

  const sweepWorker = async (): Promise<void> => {
    for (;;) {
      if (budgetExhausted(budget)) return
      const index = nextIndex
      if (index >= spaces.length) return
      nextIndex = index + 1

      const { spaceId, spaceName } = spaces[index]
      try {
        console.log(
          `[Global Discovery] Processing space: ${spaceName} (${spaceId})`
        )
        const resonances = await discoverResonancesForSpace(
          spaceId,
          lastRunTimestamp,
          budget
        )
        allDiscoveredResonances.push(...resonances)
        visitedSlots[index] = { spaceId, spaceName, resonances }

        // ONLY a Space that ran to completion is stamped. A worker can claim a
        // Space with milliseconds left, which then stops at its own first
        // context guard having done nothing — stamping that would move a Space
        // that was never actually swept to the BACK of the queue, which is
        // worse than not resuming at all. Same for a Space cut off mid-context:
        // it keeps its older bookmark and leads the queue next pass.
        //
        // Under concurrency this is conservative in a new way: when the budget
        // expires, EVERY Space still in flight goes unstamped, not just one. A
        // Space that did finish in time can therefore be swept again next pass.
        // That trade is deliberate — the cost is repeated model spend on one
        // pass, whereas the opposite error (stamping a Space that swept
        // nothing) silently starves it for as long as the bookmark stands.
        if (budgetExhausted(budget)) {
          console.log(
            `[Global Discovery] Space ${spaceId} was cut short by the budget; leaving its bookmark untouched so it leads the queue next run.`
          )
          return
        }
        completedSpaces += 1
        if (stampProgress) await stampSpaceSwept(spaceId, resonances.length)
      } catch (error) {
        console.error(
          `[Global Discovery] Failed to process space ${spaceId}:`,
          error
        )
        // Stamp anyway. A Space that throws every pass (bad data, a provider
        // error on its content) would otherwise stay pinned at the head of the
        // least-recently-swept queue and starve every Space behind it — the
        // exact failure this ordering exists to prevent. It counts as completed
        // for the same reason: the pass is done with it.
        visitedSlots[index] = { spaceId, spaceName, resonances: [] }
        completedSpaces += 1
        if (stampProgress) await stampSpaceSwept(spaceId, 0)
      }
    }
  }

  // `Promise.all` is safe to await un-guarded here: `sweepWorker` never
  // rejects — every unit of work is wrapped — so one poisoned Space cannot
  // abandon the other workers mid-flight and lose their stamps.
  await Promise.all(
    Array.from({ length: concurrency }, () => sweepWorker())
  )

  const visited = visitedSlots.filter((slot): slot is SweptSpace =>
    Boolean(slot)
  )

  if (completedSpaces < spaces.length) {
    console.log(
      `[Global Discovery] Stopped after ${completedSpaces}/${spaces.length} spaces; the rest lead the queue next run.`
    )
  }

  // Compared against the capped list, not the full enumeration: a pass that
  // swept every Space it was asked for did what it was asked.
  const completed = completedSpaces === spaces.length

  console.log(
    `[Global Discovery] Discovered ${allDiscoveredResonances.length} total resonance suggestions across ${completedSpaces}/${spaces.length} spaces` +
      (completed ? '' : ' (pass incomplete — resumes next run)')
  )

  return {
    resonances: allDiscoveredResonances,
    spaces: visited,
    spacesTotal: spaces.length,
    spacesSwept: completedSpaces,
    completed,
  }
}

/**
 * Discover resonances for all spaces, as a flat suggestion list.
 *
 * Back-compat wrapper for callers predating the budgeted sweep. It runs with NO
 * time budget, so on a large graph it will exceed a serverless duration ceiling
 * — only call it somewhere that can run unbounded.
 *
 * `stampProgress: false` is deliberate: the bookmark is the scheduled sweep's
 * private queue, and a wrapper call that stamped every Space would reset that
 * queue wholesale, making the next nightly pass believe the whole graph was
 * just swept.
 */
export async function discoverGlobalResonances(
  lastRunTimestamp?: string
): Promise<DiscoveredResonance[]> {
  const result = await sweepGlobalResonances({
    lastRunTimestamp,
    stampProgress: false,
  })
  return result.resonances
}
