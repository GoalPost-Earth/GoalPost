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

/** Space ids the run stamped, in order. */
function stampedSpaceIds(): string[] {
  return query.mock.calls
    .filter(([cypher]) => String(cypher).includes('ResonanceSweepState {spaceId'))
    .filter(([cypher]) => String(cypher).includes('MERGE'))
    .map(([, params]) => (params as { spaceId: string }).spaceId)
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
    // 'a' runs to completion; the budget expires during it, so 'b' is never
    // entered and 'a' itself finished after the deadline passed.
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
