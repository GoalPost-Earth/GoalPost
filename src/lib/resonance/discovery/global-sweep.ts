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
  /** Per-Space breakdown, in the order the Spaces were processed. */
  spaces: SweptSpace[]
  /** Spaces enumerated for this pass. */
  spacesTotal: number
  /**
   * Spaces processed to completion. A Space the deadline cut short is NOT
   * counted here and keeps its old bookmark, so it leads the queue next pass.
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
  const visited: SweptSpace[] = []
  let completedSpaces = 0

  for (const { spaceId, spaceName } of spaces) {
    if (budgetExhausted(budget)) {
      console.log(
        `[Global Discovery] Time budget spent after ${completedSpaces}/${spaces.length} spaces; the rest lead the queue next run.`
      )
      break
    }
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
      visited.push({ spaceId, spaceName, resonances })

      // ONLY a Space that ran to completion is stamped. The loop guard admits
      // a Space with milliseconds left, which then breaks at its own first
      // context guard having done nothing — stamping that would move a Space
      // that was never actually swept to the BACK of the queue, which is worse
      // than not resuming at all. Same for a Space cut off mid-context: it
      // keeps its older bookmark and leads the queue next pass.
      if (budgetExhausted(budget)) {
        console.log(
          `[Global Discovery] Space ${spaceId} was cut short by the budget; leaving its bookmark untouched so it leads the queue next run.`
        )
        break
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
      // least-recently-swept queue and starve every Space behind it — the exact
      // failure this ordering exists to prevent. It counts as completed for the
      // same reason: the pass is done with it.
      visited.push({ spaceId, spaceName, resonances: [] })
      completedSpaces += 1
      if (stampProgress) await stampSpaceSwept(spaceId, 0)
    }
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
