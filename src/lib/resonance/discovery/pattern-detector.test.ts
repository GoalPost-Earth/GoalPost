/**
 * Resonance volume controls — the adaptive similarity cut and the per-anchor
 * eligibility filter.
 *
 * Pure unit tests: the LangChain graph, the LLM analysis provider and the
 * evidence collector are all stubbed, so no Neo4j, OpenAI or LLM call is made
 * (and no OPENAI_API_KEY is needed). Everything is exercised through the
 * exported `discoverResonancesForPulse`, since both behaviours under test are
 * module-private.
 *
 * What is pinned here:
 *
 * - `resolveSimilarityThreshold`: mean + 1.5·sd from the field's OWN pairwise
 *   distribution, floored at 0.7; integers-as-strings from the LangChain layer
 *   coerced; fail-open to the floor when the estimate returns no row (field
 *   under the 8-pulse minimum) or throws.
 * - Its cache TTLs: a SUCCESSFUL estimate stays warm 5 minutes, a FALLBACK
 *   only 15s — so one transient Neo4j error cannot pin a field to the
 *   permissive floor for a whole sweep. Expired entries are swept on the next
 *   miss.
 * - The eligibility filter in `createResonanceSuggestionsInDatabase`: pairs not
 *   incident to the anchor are dropped, pairs under MIN_CONNECTION_CONFIDENCE
 *   (0.75) are dropped, survivors are written strongest-first, the "LLM mangled
 *   the ids" case warns, and the per-call summary reports every counter.
 * - The saturation pre-check: an anchor already at MAX_PENDING_SUGGESTIONS_PER_PULSE
 *   returns [] before any vector search or LLM call (that skipped cost is the
 *   point, so it is asserted on the mocks), counts arriving as strings still
 *   trip it, and a failed count fails OPEN rather than silently disabling
 *   discovery.
 */

const graphQuery = jest.fn()
jest.mock('@/modules/graph', () => ({
  initGraph: async () => ({
    query: (...args: unknown[]) => graphQuery(...args),
  }),
}))

const structuredOutput = jest.fn()
jest.mock('@/lib/llm', () => ({
  getAnalysisProvider: () => ({
    structuredOutput: (...args: unknown[]) => structuredOutput(...args),
  }),
}))

// Evidence enrichment is its own module with its own Cypher; stub it so the
// graph router below only ever sees pattern-detector's own queries.
jest.mock('./evidence-collector', () => ({
  collectPulsePairEvidence: jest.fn(async () => ({
    sharedContexts: [],
    sharedAuthors: [],
    priorResonanceLinks: 0,
  })),
  composeEvidenceString: (_facts: unknown, narrative: string) => narrative,
}))

import { discoverResonancesForPulse } from './pattern-detector'

// ─── constants ──────────────────────────────────────────────────────────────

/** Production values this file asserts against, restated so a drift is loud. */
const SIMILARITY_FLOOR = 0.7
const ADAPTIVE_THRESHOLD_SIGMA = 1.5
const TTL_MS = 5 * 60 * 1000
const FALLBACK_TTL_MS = 15 * 1000
const MIN_CONNECTION_CONFIDENCE = 0.75

const SPACE_ID = 'ws_commons'
const CONTEXT_ID = 'ctx_holding'
const ANCHOR = 'pulse_anchor'
const START = 1_780_000_000_000

/** Every test uses its own field id — the threshold cache is module-level. */
let fieldSeq = 0
const nextFieldId = () => `ctx_field_${(fieldSeq += 1)}`

// ─── graph stub ─────────────────────────────────────────────────────────────

type PendingRows = Array<{ pending: number | string | null }> | 'throw'

type EstimateRows =
  | Array<{
      mean: number | string | null
      sd: number | string | null
      sampled: number | string | null
    }>
  | 'throw'

interface GraphStub {
  /** Root field id the anchor pulse resolves into. */
  scopeContextId: string
  /** Rows (or a thrown error) from the distribution estimate. */
  estimate?: EstimateRows
  /** Candidates the vector search returns. */
  similar?: Array<{ id: string; content: string; similarity: number }>
  /** `false` makes every write return no row (already-proposed / degree cap). */
  writesSucceed?: boolean
  /** Rows (or a thrown error) from the pending-degree pre-check. */
  pending?: PendingRows
  /** `null` models a pulse whose context belongs to no Space. */
  resolvedSpaceId?: string | null
}

let stub: GraphStub

/** Route the stubbed LangChain graph by query shape. */
graphQuery.mockImplementation(
  async (cypher: string, params: Record<string, string>) => {
    if (cypher.includes('coalesce(root.id, context.id) as scopeContextId')) {
      return [
        {
          pulse: {
            id: params.pulseId,
            content: 'anchor pulse',
            createdAt: '2026-01-01T00:00:00Z',
          },
          contextId: CONTEXT_ID,
          scopeContextId: stub.scopeContextId,
          spaceId:
            stub.resolvedSpaceId === undefined
              ? SPACE_ID
              : stub.resolvedSpaceId,
        },
      ]
    }
    if (cypher.includes('count(DISTINCT s) AS pending')) {
      if (stub.pending === 'throw') {
        throw new Error('Neo4j connection acquisition timed out')
      }
      return stub.pending ?? [{ pending: 0 }]
    }
    if (cypher.includes('stDevP(sim)')) {
      if (stub.estimate === 'throw') {
        throw new Error('Neo4j connection acquisition timed out')
      }
      // A field under MIN_PULSES_FOR_ADAPTIVE_THRESHOLD returns no row at all.
      return stub.estimate ?? []
    }
    if (cypher.includes('RETURN p.embedding as embedding')) {
      return [{ embedding: [0.1, 0.2, 0.3] }]
    }
    if (cypher.includes('db.index.vector.queryNodes')) {
      return (stub.similar ?? []).map((s) => ({
        pulse: { id: s.id, content: s.content },
        similarity: s.similarity,
      }))
    }
    if (cypher.includes('CREATE (suggestion:ResonanceSuggestion')) {
      return stub.writesSucceed === false
        ? []
        : [
            {
              suggestionId: `rs_${params.sourcePulseId}_${params.targetPulseId}`,
            },
          ]
    }
    throw new Error(`unexpected graph query: ${cypher}`)
  }
)

// ─── helpers ────────────────────────────────────────────────────────────────

function connection(
  sourcePulseId: string,
  targetPulseId: string,
  confidence: number
) {
  return {
    sourcePulseId,
    targetPulseId,
    confidence,
    evidence: `${sourcePulseId} and ${targetPulseId} share a concern.`,
  }
}

function stubPattern(
  pulseConnections: Array<ReturnType<typeof connection>> | null
) {
  if (pulseConnections === null) {
    structuredOutput.mockRejectedValue(new Error('llm unavailable'))
    return
  }
  structuredOutput.mockResolvedValue({
    label: 'Shared care',
    description: 'Both pulses tend the same need.',
    pulseConnections,
  })
}

const estimateCalls = () =>
  graphQuery.mock.calls.filter(([cypher]) =>
    (cypher as string).includes('stDevP(sim)')
  )

/** Thresholds actually handed to the vector search, in call order. */
const thresholdsUsed = () =>
  graphQuery.mock.calls
    .filter(([cypher]) =>
      (cypher as string).includes('db.index.vector.queryNodes')
    )
    .map(([, params]) => (params as { threshold: number }).threshold)

/** Write calls, in the order they were attempted. */
const writes = () =>
  graphQuery.mock.calls
    .filter(([cypher]) =>
      (cypher as string).includes('CREATE (suggestion:ResonanceSuggestion')
    )
    .map(([, params]) => params as Record<string, unknown>)

const pendingPreCheckCalls = () =>
  graphQuery.mock.calls.filter(([cypher]) =>
    (cypher as string).includes('count(DISTINCT s) AS pending')
  )

const logLines = () =>
  (console.log as jest.Mock).mock.calls.map((call) => String(call[0]))
const warnLines = () =>
  (console.warn as jest.Mock).mock.calls.map((call) => String(call[0]))

const summaryLine = () =>
  logLines().find((line) => line.startsWith('[ResonanceSuggestion] context='))

/**
 * Run discovery for one anchor pulse against a field, with two similar
 * candidates available so the LLM path is always reached.
 */
function discover(overrides: Partial<GraphStub> = {}) {
  stub = {
    scopeContextId: stub?.scopeContextId ?? nextFieldId(),
    similar: [
      { id: 'pulse_b', content: 'b', similarity: 0.9 },
      { id: 'pulse_c', content: 'c', similarity: 0.88 },
    ],
    ...overrides,
  }
  return discoverResonancesForPulse(ANCHOR, SPACE_ID)
}

beforeEach(() => {
  graphQuery.mockClear()
  structuredOutput.mockReset()
  jest.useFakeTimers()
  jest.setSystemTime(START)
  jest.spyOn(console, 'log').mockImplementation(() => {})
  jest.spyOn(console, 'warn').mockImplementation(() => {})
  jest.spyOn(console, 'error').mockImplementation(() => {})
  // Default: a field with no candidates, so tests that only care about the
  // threshold stop before the LLM.
  stub = { scopeContextId: nextFieldId(), similar: [] }
  stubPattern([])
})

afterEach(() => {
  jest.useRealTimers()
  jest.restoreAllMocks()
})

// ─── adaptive similarity threshold ──────────────────────────────────────────

describe('resolveSimilarityThreshold', () => {
  it('cuts at the field’s own mean + 1.5 sd when the estimate returns stats', async () => {
    // The tight themed field measured on demo: mean 0.726, sd 0.070.
    await discover({
      estimate: [{ mean: 0.726, sd: 0.07, sampled: 24 }],
      similar: [],
    })

    expect(thresholdsUsed()).toHaveLength(1)
    expect(thresholdsUsed()[0]).toBeCloseTo(
      0.726 + ADAPTIVE_THRESHOLD_SIGMA * 0.07,
      10
    )
    expect(thresholdsUsed()[0]).toBeGreaterThan(SIMILARITY_FLOOR)
  })

  it('never drops the cut below the floor, however loose the field is', async () => {
    // mean + 1.5 sd = 0.63 — below the floor, so the floor wins.
    await discover({
      estimate: [{ mean: 0.6, sd: 0.02, sampled: 12 }],
      similar: [],
    })

    expect(thresholdsUsed()).toEqual([SIMILARITY_FLOOR])
  })

  it('coerces mean/sd handed back as strings by the LangChain layer', async () => {
    await discover({
      estimate: [{ mean: '0.726', sd: '0.070', sampled: '24' }],
      similar: [],
    })

    expect(thresholdsUsed()[0]).toBeCloseTo(0.726 + 1.5 * 0.07, 10)
    expect(
      logLines().some(
        (line) => line.includes('mean=0.726') && line.includes('sd=0.070')
      )
    ).toBe(true)
    // `sampled` is logged through the same coercion.
    expect(
      logLines().some((line) => line.includes('over 24 sampled pulses'))
    ).toBe(true)
  })

  it('falls back to the floor when the field is under the 8-pulse minimum', async () => {
    // The estimate query's `WHERE n >= $minPulses` drops the row entirely.
    await discover({ estimate: [], similar: [] })

    expect(thresholdsUsed()).toEqual([SIMILARITY_FLOOR])
  })

  it('falls back to the floor when the estimate query throws', async () => {
    await discover({ estimate: 'throw', similar: [] })

    expect(thresholdsUsed()).toEqual([SIMILARITY_FLOOR])
    expect(
      warnLines().some((line) =>
        line.includes('Adaptive threshold estimate failed')
      )
    ).toBe(true)
  })

  it('fails open rather than throwing, so a broken estimate never aborts discovery', async () => {
    await expect(discover({ estimate: 'throw', similar: [] })).resolves.toEqual(
      []
    )
  })
})

describe('resolveSimilarityThreshold caching', () => {
  it('estimates once per field for a whole sweep, not once per anchor pulse', async () => {
    const field = nextFieldId()
    const estimate: EstimateRows = [{ mean: 0.726, sd: 0.07, sampled: 24 }]

    stub = { scopeContextId: field, estimate, similar: [] }
    await discoverResonancesForPulse(ANCHOR, SPACE_ID)
    jest.advanceTimersByTime(TTL_MS - 1)
    await discoverResonancesForPulse('pulse_other', SPACE_ID)

    expect(estimateCalls()).toHaveLength(1)
    expect(thresholdsUsed()).toHaveLength(2)
    expect(thresholdsUsed()[1]).toBeCloseTo(thresholdsUsed()[0], 10)
  })

  it('re-estimates once the 5 minute TTL on a successful estimate expires', async () => {
    const field = nextFieldId()
    stub = {
      scopeContextId: field,
      estimate: [{ mean: 0.726, sd: 0.07, sampled: 24 }],
      similar: [],
    }
    await discoverResonancesForPulse(ANCHOR, SPACE_ID)
    jest.advanceTimersByTime(TTL_MS + 1)
    await discoverResonancesForPulse(ANCHOR, SPACE_ID)

    expect(estimateCalls()).toHaveLength(2)
  })

  it('holds a FAILED estimate for only 15s, so one Neo4j blip cannot pin the field to the floor for 5 minutes', async () => {
    const field = nextFieldId()
    stub = { scopeContextId: field, estimate: 'throw', similar: [] }
    await discoverResonancesForPulse(ANCHOR, SPACE_ID)
    expect(thresholdsUsed()).toEqual([SIMILARITY_FLOOR])

    // Still inside the fallback window: no re-query, still permissive.
    jest.advanceTimersByTime(FALLBACK_TTL_MS - 1)
    await discoverResonancesForPulse(ANCHOR, SPACE_ID)
    expect(estimateCalls()).toHaveLength(1)

    // Past it, and well inside what the SUCCESS TTL would have been: the blip
    // is retried and the field starts adapting again.
    jest.advanceTimersByTime(2)
    stub.estimate = [{ mean: 0.726, sd: 0.07, sampled: 24 }]
    await discoverResonancesForPulse(ANCHOR, SPACE_ID)

    expect(estimateCalls()).toHaveLength(2)
    expect(jest.now() - START).toBeLessThan(TTL_MS)
    expect(thresholdsUsed()[2]).toBeCloseTo(0.726 + 1.5 * 0.07, 10)
  })

  it('holds a TOO-SMALL field for only 15s, so it adapts as soon as it grows mid-import', async () => {
    const field = nextFieldId()
    stub = { scopeContextId: field, estimate: [], similar: [] }
    await discoverResonancesForPulse(ANCHOR, SPACE_ID)

    jest.advanceTimersByTime(FALLBACK_TTL_MS + 1)
    stub.estimate = [{ mean: 0.668, sd: 0.047, sampled: 9 }]
    await discoverResonancesForPulse(ANCHOR, SPACE_ID)

    expect(estimateCalls()).toHaveLength(2)
    expect(thresholdsUsed()).toEqual([
      SIMILARITY_FLOOR,
      expect.closeTo(0.668 + 1.5 * 0.047, 10),
    ])
  })

  it('caches per field, so one field’s cut never leaks into another’s', async () => {
    const tight = nextFieldId()
    const broad = nextFieldId()

    stub = {
      scopeContextId: tight,
      estimate: [{ mean: 0.726, sd: 0.07, sampled: 24 }],
      similar: [],
    }
    await discoverResonancesForPulse(ANCHOR, SPACE_ID)

    stub = {
      scopeContextId: broad,
      estimate: [{ mean: 0.668, sd: 0.047, sampled: 30 }],
      similar: [],
    }
    await discoverResonancesForPulse(ANCHOR, SPACE_ID)

    expect(estimateCalls()).toHaveLength(2)
    expect(thresholdsUsed()[0]).toBeCloseTo(0.831, 3)
    expect(thresholdsUsed()[1]).toBeCloseTo(0.7385, 3)
  })

  it('evicts expired entries on the next miss instead of growing per field forever', async () => {
    const stale = nextFieldId()
    const fresh = nextFieldId()

    stub = {
      scopeContextId: stale,
      estimate: [{ mean: 0.726, sd: 0.07, sampled: 24 }],
      similar: [],
    }
    await discoverResonancesForPulse(ANCHOR, SPACE_ID)

    // Expire it, then miss on a DIFFERENT field — that miss runs the sweep.
    jest.advanceTimersByTime(TTL_MS + 1)
    stub = {
      scopeContextId: fresh,
      estimate: [{ mean: 0.668, sd: 0.047, sampled: 30 }],
      similar: [],
    }
    await discoverResonancesForPulse(ANCHOR, SPACE_ID)

    // The map is module-private, so eviction is observed the only way it can
    // be: the swept entry serves nothing afterwards — the field re-estimates.
    stub = {
      scopeContextId: stale,
      estimate: [{ mean: 0.8, sd: 0.05, sampled: 24 }],
      similar: [],
    }
    await discoverResonancesForPulse(ANCHOR, SPACE_ID)

    expect(estimateCalls()).toHaveLength(3)
    expect(thresholdsUsed()[2]).toBeCloseTo(0.875, 10)
  })
})

// ─── eligibility filter ─────────────────────────────────────────────────────

describe('suggestion eligibility (anchor-incident, confidence floor, ordering)', () => {
  it('drops connections the LLM invented between two NON-anchor pulses', async () => {
    stubPattern([
      connection(ANCHOR, 'pulse_b', 0.9),
      connection('pulse_b', 'pulse_c', 0.95), // neighbour pair — not ours
      connection('pulse_c', ANCHOR, 0.85), // anchor as TARGET still counts
    ])

    const created = await discover({
      estimate: [{ mean: 0.726, sd: 0.07, sampled: 24 }],
    })

    expect(writes().map((w) => [w.sourcePulseId, w.targetPulseId])).toEqual([
      [ANCHOR, 'pulse_b'],
      ['pulse_c', ANCHOR],
    ])
    expect(created).toHaveLength(2)
  })

  it('drops connections scored below the 0.75 confidence floor', async () => {
    stubPattern([
      connection(ANCHOR, 'pulse_b', MIN_CONNECTION_CONFIDENCE), // exactly at it: kept
      connection(ANCHOR, 'pulse_c', 0.74), // just under: dropped
      connection(ANCHOR, 'pulse_d', 0.3),
    ])

    await discover({ estimate: [{ mean: 0.726, sd: 0.07, sampled: 24 }] })

    expect(writes().map((w) => w.targetPulseId)).toEqual(['pulse_b'])
    expect(writes()[0].confidence).toBe(MIN_CONNECTION_CONFIDENCE)
  })

  it('attempts the strongest pairs first, so they claim the degree budget', async () => {
    stubPattern([
      connection(ANCHOR, 'pulse_weak', 0.76),
      connection(ANCHOR, 'pulse_strong', 0.97),
      connection(ANCHOR, 'pulse_mid', 0.85),
      connection(ANCHOR, 'pulse_under', 0.5),
    ])

    await discover({ estimate: [{ mean: 0.726, sd: 0.07, sampled: 24 }] })

    expect(writes().map((w) => w.targetPulseId)).toEqual([
      'pulse_strong',
      'pulse_mid',
      'pulse_weak',
    ])
    expect(writes().map((w) => w.confidence)).toEqual([0.97, 0.85, 0.76])
  })

  it('warns when the LLM returns connections but none reference the anchor id', async () => {
    stubPattern([
      connection('pulse_b', 'pulse_c', 0.9),
      connection('pulse_c', 'pulse_d', 0.8),
    ])

    const created = await discover({
      estimate: [{ mean: 0.726, sd: 0.07, sampled: 24 }],
    })

    expect(created).toEqual([])
    expect(writes()).toHaveLength(0)
    const warning = warnLines().find((line) =>
      line.includes('none referenced it')
    )
    expect(warning).toBeDefined()
    expect(warning).toContain('returned 2 connections')
    expect(warning).toContain(ANCHOR)
  })

  it('does not warn when the LLM simply returned nothing', async () => {
    stubPattern([])

    await discover({ estimate: [{ mean: 0.726, sd: 0.07, sampled: 24 }] })

    expect(
      warnLines().some((line) => line.includes('none referenced it'))
    ).toBe(false)
  })

  it('reports every counter on the per-call summary line', async () => {
    stubPattern([
      connection(ANCHOR, 'pulse_b', 0.97), // written
      connection(ANCHOR, 'pulse_c', 0.8), // written
      connection('pulse_b', 'pulse_c', 0.99), // not anchor-incident
      connection(ANCHOR, 'pulse_d', 0.4), // below the floor
    ])

    await discover({ estimate: [{ mean: 0.726, sd: 0.07, sampled: 24 }] })

    const summary = summaryLine()
    expect(summary).toBeDefined()
    expect(summary).toContain(`context=${CONTEXT_ID}`)
    expect(summary).toContain(`anchor=${ANCHOR}`)
    expect(summary).toContain('llmPairs=4')
    expect(summary).toContain('droppedNotAnchorIncident=1')
    expect(summary).toContain('droppedLowConfidence=1')
    expect(summary).toContain('skippedExistingOrCapped=0')
    expect(summary).toContain('written=2')
  })

  it('counts a write that returns no row as already-proposed-or-capped, not written', async () => {
    stubPattern([
      connection(ANCHOR, 'pulse_b', 0.97),
      connection(ANCHOR, 'pulse_c', 0.8),
    ])

    const created = await discover({
      estimate: [{ mean: 0.726, sd: 0.07, sampled: 24 }],
      writesSucceed: false,
    })

    expect(created).toEqual([])
    expect(summaryLine()).toContain('skippedExistingOrCapped=2')
    expect(summaryLine()).toContain('written=0')
  })
})

// ─── saturation pre-check ───────────────────────────────────────────────────

describe('pending-degree pre-check', () => {
  /** Everything the pre-check is meant to make unnecessary. */
  const expensiveWorkSkipped = () => {
    expect(estimateCalls()).toHaveLength(0)
    expect(thresholdsUsed()).toHaveLength(0)
    expect(structuredOutput).not.toHaveBeenCalled()
    expect(writes()).toHaveLength(0)
  }

  it('skips an anchor already AT the cap without touching the vector search or the LLM', async () => {
    stubPattern([connection(ANCHOR, 'pulse_b', 0.9)])

    const created = await discover({
      pending: [{ pending: 3 }],
      estimate: [{ mean: 0.726, sd: 0.07, sampled: 24 }],
    })

    expect(created).toEqual([])
    expect(pendingPreCheckCalls()).toHaveLength(1)
    expensiveWorkSkipped()
  })

  it('skips an anchor OVER the cap too', async () => {
    stubPattern([connection(ANCHOR, 'pulse_b', 0.9)])

    const created = await discover({ pending: [{ pending: 4 }] })

    expect(created).toEqual([])
    expensiveWorkSkipped()
  })

  it('explains the skip, so "0 new resonances" is not read as "nothing found"', async () => {
    await discover({ pending: [{ pending: 3 }] })

    const line = logLines().find((l) => l.includes('pending suggestions (cap'))
    expect(line).toBeDefined()
    expect(line).toContain(ANCHOR)
    expect(line).toContain('already has 3 pending suggestions (cap 3)')
    expect(line).toContain('skipping discovery until some are reviewed')
  })

  it('trips the cap on a count handed back as a STRING by the LangChain layer', async () => {
    stubPattern([connection(ANCHOR, 'pulse_b', 0.9)])

    const created = await discover({ pending: [{ pending: '3' }] })

    expect(created).toEqual([])
    expensiveWorkSkipped()
  })

  it('lets an anchor JUST UNDER the cap through, and discovery writes as before', async () => {
    stubPattern([connection(ANCHOR, 'pulse_b', 0.9)])

    const created = await discover({
      pending: [{ pending: 2 }],
      estimate: [{ mean: 0.726, sd: 0.07, sampled: 24 }],
    })

    expect(pendingPreCheckCalls()).toHaveLength(1)
    expect(structuredOutput).toHaveBeenCalledTimes(1)
    expect(writes().map((w) => w.targetPulseId)).toEqual(['pulse_b'])
    expect(created).toHaveLength(1)
  })

  it('counts within the anchor’s own Space queue', async () => {
    await discover({ pending: [{ pending: 3 }] })

    expect(pendingPreCheckCalls()[0][1]).toEqual({
      pulseId: ANCHOR,
      spaceId: SPACE_ID,
    })
  })

  it('FAILS OPEN when the count query throws — a counting blip must not suppress discovery platform-wide', async () => {
    stubPattern([connection(ANCHOR, 'pulse_b', 0.9)])

    const created = await discover({
      pending: 'throw',
      estimate: [{ mean: 0.726, sd: 0.07, sampled: 24 }],
    })

    expect(created).toHaveLength(1)
    expect(structuredOutput).toHaveBeenCalledTimes(1)
    expect(
      warnLines().some((line) =>
        line.includes('Pending-degree pre-check failed; continuing')
      )
    ).toBe(true)
  })

  it('fails open on a missing row rather than treating "unknown" as saturated', async () => {
    stubPattern([connection(ANCHOR, 'pulse_b', 0.9)])

    const created = await discover({
      pending: [],
      estimate: [{ mean: 0.726, sd: 0.07, sampled: 24 }],
    })

    expect(created).toHaveLength(1)
  })

  it('returns [] for a pulse held by no Space, without running the pre-check', async () => {
    // The no-space case only exists on the overload that does NOT take a
    // spaceId: there the lookup returns `null as spaceId`, so nothing can be
    // written and the Space-scoped count has nothing to scope to.
    stub = { scopeContextId: nextFieldId(), resolvedSpaceId: null }
    const created = await discoverResonancesForPulse(ANCHOR)

    expect(created).toEqual([])
    expect(
      warnLines().some((line) =>
        line.includes('no space associated with pulse')
      )
    ).toBe(true)
    expect(pendingPreCheckCalls()).toHaveLength(0)
    expensiveWorkSkipped()
  })
})
