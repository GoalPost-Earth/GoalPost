/**
 * GOAL-347 — the resumable Space fan-out.
 *
 * The property under test is forward progress. A pass that stops on its budget
 * is expected and fine; what must never happen is a pass that stamps a Space it
 * did not actually sweep, because the stamp moves that Space to the BACK of the
 * least-recently-swept queue — leaving it worse off than if the sweep had no
 * bookmark at all. That is the exact regression the ordering exists to prevent.
 */

const query = jest.fn()
jest.mock('@/modules/graph', () => ({
  initGraph: async () => ({ query }),
}))

const discoverResonancesForSpace = jest.fn()
jest.mock('./pattern-detector', () => ({
  discoverResonancesForSpace: (...args: unknown[]) =>
    discoverResonancesForSpace(...args),
  budgetExhausted: (budget?: { deadlineAt?: number }) =>
    budget?.deadlineAt !== undefined && Date.now() >= budget.deadlineAt,
}))

import { sweepGlobalResonances, discoverGlobalResonances } from './global-sweep'

/**
 * Space ids the run stamped.
 *
 * SET semantics, not sequence: since GOAL-376 the pass sweeps Spaces through a
 * bounded worker pool, so which worker finishes first is scheduling detail. WHO
 * got stamped is the invariant worth asserting; the order they landed in is not.
 */
function stampedSpaceIds(): string[] {
  return query.mock.calls
    .filter(([cypher]) => String(cypher).includes('ResonanceSweepState {spaceId'))
    .filter(([cypher]) => String(cypher).includes('MERGE'))
    .map(([, params]) => (params as { spaceId: string }).spaceId)
    .sort()
}

function stubSpaces(spaces: Array<{ spaceId: string; spaceName: string }>) {
  query.mockImplementation(async (cypher: string) => {
    if (cypher.includes('MERGE')) return []
    if (cypher.includes('MATCH (space:Space)')) return spaces
    return []
  })
}

beforeEach(() => {
  jest.clearAllMocks()
  discoverResonancesForSpace.mockResolvedValue([])
})

describe('sweepGlobalResonances', () => {
  it('sweeps and stamps every Space when the budget is ample', async () => {
    stubSpaces([
      { spaceId: 'a', spaceName: 'A' },
      { spaceId: 'b', spaceName: 'B' },
    ])

    const result = await sweepGlobalResonances({ deadlineAt: Date.now() + 60_000 })

    expect(stampedSpaceIds()).toEqual(['a', 'b'])
    expect(result).toMatchObject({
      spacesSwept: 2,
      spacesTotal: 2,
      completed: true,
    })
  })

  it('does NOT stamp a Space the deadline cut short', async () => {
    stubSpaces([
      { spaceId: 'a', spaceName: 'A' },
      { spaceId: 'b', spaceName: 'B' },
    ])
    const deadlineAt = Date.now() + 50
    // Both Spaces are claimed before the deadline and both are still in flight
    // when it passes, so neither may be stamped. Under the GOAL-376 pool this
    // is the shape that matters: a worker must judge the budget AFTER its own
    // Space returns, not only before claiming one.
    discoverResonancesForSpace.mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 80))
      return []
    })

    const result = await sweepGlobalResonances({ deadlineAt })

    // The critical assertion: a Space whose sweep the deadline interrupted
    // keeps its OLD bookmark, so it leads the queue next pass. Stamping it
    // would push a Space that may have swept none of its contexts to the back.
    expect(stampedSpaceIds()).toEqual([])
    expect(result.spacesSwept).toBe(0)
    expect(result.completed).toBe(false)
  })

  it('stamps a Space that threw, so a poisoned Space cannot starve the queue', async () => {
    stubSpaces([
      { spaceId: 'bad', spaceName: 'Bad' },
      { spaceId: 'good', spaceName: 'Good' },
    ])
    discoverResonancesForSpace.mockImplementation(async (spaceId: string) => {
      if (spaceId === 'bad') throw new Error('poisoned content')
      return []
    })

    const result = await sweepGlobalResonances({ deadlineAt: Date.now() + 60_000 })

    expect(stampedSpaceIds()).toEqual(['bad', 'good'])
    expect(result.completed).toBe(true)
  })

  it('reports completion against the capped list when maxSpaces is set', async () => {
    stubSpaces([
      { spaceId: 'a', spaceName: 'A' },
      { spaceId: 'b', spaceName: 'B' },
      { spaceId: 'c', spaceName: 'C' },
    ])

    const result = await sweepGlobalResonances({ maxSpaces: 2 })

    // A pass that swept every Space it was ASKED for did what it was asked.
    expect(result).toMatchObject({ spacesSwept: 2, spacesTotal: 2, completed: true })
  })

  it('sweeps Spaces concurrently rather than one after another', async () => {
    stubSpaces([
      { spaceId: 'a', spaceName: 'A' },
      { spaceId: 'b', spaceName: 'B' },
      { spaceId: 'c', spaceName: 'C' },
      { spaceId: 'd', spaceName: 'D' },
    ])
    // The whole point of GOAL-376: the sweep is bound by a remote model call,
    // so four Spaces that each wait 50ms must cost ~50ms of wall clock, not
    // ~200ms. Asserting on overlap (peak in-flight) rather than on elapsed time
    // keeps this from being a timing-flake on a loaded CI box.
    let inFlight = 0
    let peakInFlight = 0
    discoverResonancesForSpace.mockImplementation(async () => {
      inFlight += 1
      peakInFlight = Math.max(peakInFlight, inFlight)
      await new Promise((resolve) => setTimeout(resolve, 50))
      inFlight -= 1
      return []
    })

    const result = await sweepGlobalResonances({
      deadlineAt: Date.now() + 60_000,
      concurrency: 4,
    })

    expect(peakInFlight).toBe(4)
    expect(stampedSpaceIds()).toEqual(['a', 'b', 'c', 'd'])
    expect(result).toMatchObject({ spacesSwept: 4, completed: true })
  })

  it('never exceeds the requested pool size', async () => {
    stubSpaces(
      Array.from({ length: 6 }, (_, i) => ({
        spaceId: `s${i}`,
        spaceName: `S${i}`,
      }))
    )
    let inFlight = 0
    let peakInFlight = 0
    discoverResonancesForSpace.mockImplementation(async () => {
      inFlight += 1
      peakInFlight = Math.max(peakInFlight, inFlight)
      await new Promise((resolve) => setTimeout(resolve, 10))
      inFlight -= 1
      return []
    })

    const result = await sweepGlobalResonances({
      deadlineAt: Date.now() + 60_000,
      concurrency: 2,
    })

    expect(peakInFlight).toBe(2)
    expect(result.spacesSwept).toBe(6)
  })

  it('keeps sweeping the other Spaces when one worker hits a poisoned Space', async () => {
    stubSpaces([
      { spaceId: 'a', spaceName: 'A' },
      { spaceId: 'bad', spaceName: 'Bad' },
      { spaceId: 'c', spaceName: 'C' },
    ])
    // A rejection inside a pooled worker must not escape and abandon its
    // siblings mid-flight — that would lose their stamps and silently undo the
    // forward progress the bookmark exists to record.
    discoverResonancesForSpace.mockImplementation(async (spaceId: string) => {
      await new Promise((resolve) => setTimeout(resolve, 10))
      if (spaceId === 'bad') throw new Error('poisoned content')
      return []
    })

    const result = await sweepGlobalResonances({
      deadlineAt: Date.now() + 60_000,
      concurrency: 3,
    })

    expect(stampedSpaceIds()).toEqual(['a', 'bad', 'c'])
    expect(result).toMatchObject({ spacesSwept: 3, completed: true })
  })

  it('reports the per-Space breakdown in queue order, not completion order', async () => {
    stubSpaces([
      { spaceId: 'first', spaceName: 'First' },
      { spaceId: 'second', spaceName: 'Second' },
    ])
    // 'first' leads the queue (least recently swept) but finishes last. The
    // breakdown must still lead with it, because that ordering is what the
    // caller reads to attribute activity Logs.
    discoverResonancesForSpace.mockImplementation(async (spaceId: string) => {
      await new Promise((resolve) =>
        setTimeout(resolve, spaceId === 'first' ? 40 : 5)
      )
      return []
    })

    const result = await sweepGlobalResonances({
      deadlineAt: Date.now() + 60_000,
      concurrency: 2,
    })

    expect(result.spaces.map((s) => s.spaceId)).toEqual(['first', 'second'])
  })

  it('orders Spaces least-recently-swept first', async () => {
    stubSpaces([])
    await sweepGlobalResonances({})

    const [enumeration] = query.mock.calls.find(([cypher]) =>
      String(cypher).includes('MATCH (space:Space)')
    ) as [string]
    expect(enumeration).toContain('max(state.lastSweptAt)')
    expect(enumeration).toContain('ORDER BY coalesce(lastSweptAt')
  })
})

describe('discoverGlobalResonances (back-compat wrapper)', () => {
  it('never stamps, so an ad-hoc call cannot reset the scheduler queue', async () => {
    stubSpaces([{ spaceId: 'a', spaceName: 'A' }])

    await discoverGlobalResonances()

    expect(stampedSpaceIds()).toEqual([])
  })
})
