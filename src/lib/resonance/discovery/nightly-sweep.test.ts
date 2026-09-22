/**
 * GOAL-347 — the scheduled resonance sweep.
 *
 * Covers the three properties the ticket turns on, none of which the previous
 * implementation had:
 *
 *   1. the route is fail-CLOSED on CRON_SECRET (it drives model spend and
 *      writes across every Space, so an unset secret must not leave it
 *      anonymously triggerable);
 *   2. the sweep stops on its own time budget and REPORTS that it stopped,
 *      rather than running until the platform kills it at `maxDuration` and
 *      discarding the counts for the phases that did succeed;
 *   3. a batch that fails wholesale ends its phase instead of spinning the
 *      remaining budget on the same rows.
 *
 * Everything external is mocked — Neo4j, both embedders, the pattern detector,
 * the activity log — so this runs with no database and no OpenAI spend.
 */

const query = jest.fn()
jest.mock('@/modules/graph', () => ({
  initGraph: async () => ({ query }),
}))

const generatePulseEmbeddings = jest.fn()
jest.mock('../embeddings/pulse-embedder', () => ({
  generatePulseEmbeddings: (id: string) => generatePulseEmbeddings(id),
}))

const generatePersonEmbedding = jest.fn()
jest.mock('../embeddings/person-embedder', () => ({
  generatePersonEmbedding: (id: string) => generatePersonEmbedding(id),
}))

const sweepGlobalResonances = jest.fn()
jest.mock('./global-sweep', () => ({
  sweepGlobalResonances: (options: unknown) => sweepGlobalResonances(options),
}))

const createLog = jest.fn()
jest.mock('@/lib/activity-logs/create-log', () => ({
  createLog: (input: unknown) => createLog(input),
}))

import { runResonanceSweep } from './nightly-sweep'
import { GET as runSweepRoute } from '@/app/api/cron/discover-resonances/route'

/**
 * Drive `graph.query` by matching on the Cypher. The sweep issues four shapes:
 * a page of ids, a closing count, the owner lookup, and (via the mocked
 * detector) nothing else.
 */
function stubGraph(options: {
  pulseIds?: string[]
  personIds?: string[]
  /** Rows still outstanding after the loop, per kind. */
  remaining?: { pulse?: number; person?: number }
  ownerId?: string | null
}) {
  const { pulseIds = [], personIds = [], remaining = {}, ownerId = 'person_1' } =
    options
  // Pages are served once each: the loop re-queries after every batch, and a
  // stub that kept returning the same page would never terminate.
  let pulsePageServed = false
  let personPageServed = false

  query.mockImplementation(async (cypher: string, params?: Record<string, unknown>) => {
    if (cypher.includes('count(p) as remaining')) {
      const isPulse = cypher.includes(':FieldPulse')
      // Neo4j integers arrive from the LangChain layer as strings.
      return [
        {
          remaining: String(
            isPulse ? (remaining.pulse ?? 0) : (remaining.person ?? 0)
          ),
        },
      ]
    }
    if (cypher.includes('RETURN p.id as id')) {
      if (cypher.includes(':FieldPulse')) {
        if (pulsePageServed) return []
        pulsePageServed = true
        return pulseIds.map((id) => ({ id }))
      }
      if (personPageServed) return []
      personPageServed = true
      return personIds.map((id) => ({ id }))
    }
    if (cypher.includes('OWNS')) return [{ ownerId }]
    // The activity-log anchor filter: keep only pulses whose Space set is
    // exactly this Space. The stub treats every candidate as single-Space.
    if (cypher.includes('UNWIND $candidateIds')) {
      return ((params?.candidateIds as string[]) ?? []).map((id) => ({ id }))
    }
    return []
  })
}

beforeEach(() => {
  jest.clearAllMocks()
  generatePulseEmbeddings.mockResolvedValue(undefined)
  generatePersonEmbedding.mockResolvedValue(undefined)
  sweepGlobalResonances.mockResolvedValue({
    resonances: [],
    spaces: [],
    spacesTotal: 0,
    spacesSwept: 0,
    completed: true,
  })
  createLog.mockResolvedValue('log_1')
})

describe('runResonanceSweep — embedding backfill', () => {
  it('embeds the backlog and reports it cleared', async () => {
    stubGraph({ pulseIds: ['p1', 'p2'], personIds: ['x1'] })

    const report = await runResonanceSweep(60_000)

    expect(generatePulseEmbeddings.mock.calls.map((c) => c[0])).toEqual([
      'p1',
      'p2',
    ])
    expect(generatePersonEmbedding).toHaveBeenCalledWith('x1')
    expect(report.pulseEmbeddings).toMatchObject({
      embedded: 2,
      failed: 0,
      remainingEmbeddable: 0,
      completed: true,
    })
    expect(report.ok).toBe(true)
  })

  it('reports the outstanding backlog when the budget cuts a phase short', async () => {
    stubGraph({ pulseIds: ['p1', 'p2'], remaining: { pulse: 7 } })

    const report = await runResonanceSweep(60_000)

    // `remainingEmbeddable` is what an operator watches converge to 0 across
    // nights, so a short pass must report the real backlog rather than claim
    // completion.
    expect(report.pulseEmbeddings.remainingEmbeddable).toBe(7)
    expect(report.pulseEmbeddings.completed).toBe(false)
  })

  it('counts a failed row without aborting the rest of the batch', async () => {
    stubGraph({ pulseIds: ['p1', 'bad', 'p3'] })
    generatePulseEmbeddings.mockImplementation(async (id: string) => {
      if (id === 'bad') throw new Error('provider rejected the input')
    })

    const report = await runResonanceSweep(60_000)

    expect(report.pulseEmbeddings).toMatchObject({ embedded: 2, failed: 1 })
    expect(report.ok).toBe(true)
  })

  it('excludes a row that threw from the next page query rather than retrying it', async () => {
    // Without the run-scoped skip list, a failed row stays `embedding IS NULL`
    // and is re-selected ahead of untried rows — a batch where 1 of 100
    // succeeds would cost 100 calls per row of progress until the deadline.
    const skips: string[][] = []
    let page = 0
    query.mockImplementation(async (cypher: string, params: Record<string, unknown>) => {
      if (cypher.includes('count(p) as remaining')) return [{ remaining: '0' }]
      if (cypher.includes('RETURN p.id as id')) {
        if (!cypher.includes(':FieldPulse')) return []
        skips.push([...((params.skip as string[]) ?? [])])
        return page++ === 0 ? [{ id: 'good' }, { id: 'bad' }] : []
      }
      return []
    })
    generatePulseEmbeddings.mockImplementation(async (id: string) => {
      if (id === 'bad') throw new Error('nope')
    })

    await runResonanceSweep(60_000)

    expect(skips[0]).toEqual([])
    expect(skips[1]).toEqual(['bad'])
  })

  it('stops the phase when a whole batch fails rather than re-selecting it', async () => {
    // Every row fails and the backlog therefore never shrinks. Without the
    // no-progress guard the loop would re-query the identical page until the
    // phase deadline, hammering an already-failing provider.
    query.mockImplementation(async (cypher: string) => {
      if (cypher.includes('count(p) as remaining')) return [{ remaining: '2' }]
      if (cypher.includes('RETURN p.id as id')) {
        return cypher.includes(':FieldPulse') ? [{ id: 'a' }, { id: 'b' }] : []
      }
      return []
    })
    generatePulseEmbeddings.mockRejectedValue(new Error('provider is down'))

    const report = await runResonanceSweep(60_000)

    expect(generatePulseEmbeddings).toHaveBeenCalledTimes(2)
    expect(report.pulseEmbeddings).toMatchObject({ embedded: 0, failed: 2 })
  })
})

describe('runResonanceSweep — discovery budget', () => {
  it('hands discovery a deadline inside the run budget', async () => {
    stubGraph({})
    const before = Date.now()

    await runResonanceSweep(60_000)

    const { deadlineAt } = sweepGlobalResonances.mock.calls[0][0]
    expect(deadlineAt).toBeGreaterThan(before)
    // Strictly inside the run budget: the activity-log phase is real graph work
    // and needs reserved time, or it would push the function past maxDuration
    // and turn a successful pass into the 504 this design avoids.
    expect(deadlineAt).toBeLessThan(before + 60_000)
  })

  it('leaves discovery a usable slice even after both embedding phases', async () => {
    // The two phases are capped at a combined share of the run, so discovery
    // can never be handed a spent budget. A phase can only stop BETWEEN
    // provider calls, which is why the cap is enforced by an absolute bound
    // rather than by trusting each phase to return on time.
    stubGraph({ pulseIds: ['p1'], personIds: ['x1'] })
    const started = Date.now()

    await runResonanceSweep(60_000)

    const { deadlineAt } = sweepGlobalResonances.mock.calls[0][0]
    expect(deadlineAt).toBeGreaterThan(started + 60_000 * 0.4)
  })

  it('surfaces an incomplete pass without calling it a failure', async () => {
    stubGraph({})
    sweepGlobalResonances.mockResolvedValue({
      resonances: [],
      spaces: [],
      spacesTotal: 9,
      spacesSwept: 4,
      completed: false,
    })

    const report = await runResonanceSweep(60_000)

    // Stopping on the budget is the designed outcome: work written is durable
    // and the unreached Spaces lead the queue next run.
    expect(report.ok).toBe(true)
    expect(report.discoveryCompleted).toBe(false)
    expect(report).toMatchObject({ spacesSwept: 4, spacesTotal: 9 })
  })
})

describe('runResonanceSweep — activity logs', () => {
  const suggestion = (sourcePulseId: string, targetPulseId: string) => ({
    linkId: 'rs_1',
    contextId: 'ctx_1',
    label: 'grief',
    description: 'd',
    sourcePulseId,
    targetPulseId,
    confidence: 0.9,
    evidence: 'e',
  })

  it('writes one log per Space that gained suggestions, attributed to its owner', async () => {
    stubGraph({ ownerId: 'person_owner' })
    sweepGlobalResonances.mockResolvedValue({
      resonances: [suggestion('p1', 'p2')],
      spaces: [
        { spaceId: 'ws_1', spaceName: 'A', resonances: [suggestion('p1', 'p2')] },
        { spaceId: 'ws_2', spaceName: 'B', resonances: [] },
      ],
      spacesTotal: 2,
      spacesSwept: 2,
      completed: true,
    })

    await runResonanceSweep(60_000)

    // ws_2 produced nothing: a Log reaches a feed only via its pulse edges, so
    // a zero-result Log would be an unreachable node accumulated every night.
    expect(createLog).toHaveBeenCalledTimes(1)
    expect(createLog).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'person_owner',
        spaceId: 'ws_1',
        pulseIds: ['p1', 'p2'],
        metadata: expect.objectContaining({ trigger: 'scheduled_sweep' }),
      })
    )
  })

  it('skips the log rather than failing when a Space has no owner', async () => {
    stubGraph({ ownerId: null })
    sweepGlobalResonances.mockResolvedValue({
      resonances: [suggestion('p1', 'p2')],
      spaces: [
        { spaceId: 'ws_1', spaceName: 'A', resonances: [suggestion('p1', 'p2')] },
      ],
      spacesTotal: 1,
      spacesSwept: 1,
      completed: true,
    })

    const report = await runResonanceSweep(60_000)

    expect(createLog).not.toHaveBeenCalled()
    expect(report.ok).toBe(true)
    expect(report.suggestionsCreated).toBe(1)
  })

  it('does not fail the sweep when a log write throws', async () => {
    stubGraph({})
    createLog.mockRejectedValue(new Error('log write failed'))
    sweepGlobalResonances.mockResolvedValue({
      resonances: [suggestion('p1', 'p2')],
      spaces: [
        { spaceId: 'ws_1', spaceName: 'A', resonances: [suggestion('p1', 'p2')] },
      ],
      spacesTotal: 1,
      spacesSwept: 1,
      completed: true,
    })

    const report = await runResonanceSweep(60_000)

    expect(report.ok).toBe(true)
    expect(report.suggestionsCreated).toBe(1)
  })
})

describe('/api/cron/discover-resonances auth gate', () => {
  const call = (headers: Record<string, string> = {}) =>
    runSweepRoute(
      new Request('https://demo.goalpost.earth/api/cron/discover-resonances', {
        headers,
      }) as never
    )

  const originalSecret = process.env.CRON_SECRET
  afterEach(() => {
    if (originalSecret === undefined) delete process.env.CRON_SECRET
    else process.env.CRON_SECRET = originalSecret
  })

  it('rejects when CRON_SECRET is unset — fail CLOSED, never anonymously triggerable', async () => {
    delete process.env.CRON_SECRET
    stubGraph({})

    const response = await call({ authorization: 'Bearer anything' })

    expect(response.status).toBe(401)
    expect(sweepGlobalResonances).not.toHaveBeenCalled()
    expect(generatePulseEmbeddings).not.toHaveBeenCalled()
  })

  it('rejects a mismatched bearer token', async () => {
    process.env.CRON_SECRET = 'right'
    stubGraph({})

    const response = await call({ authorization: 'Bearer wrong' })

    expect(response.status).toBe(401)
    expect(sweepGlobalResonances).not.toHaveBeenCalled()
  })

  it('rejects a request with no authorization header at all', async () => {
    process.env.CRON_SECRET = 'right'
    stubGraph({})

    const response = await call()

    expect(response.status).toBe(401)
    expect(sweepGlobalResonances).not.toHaveBeenCalled()
  })

  it('runs the sweep and reports progress for the scheduler', async () => {
    process.env.CRON_SECRET = 'right'
    stubGraph({ pulseIds: ['p1'] })
    sweepGlobalResonances.mockResolvedValue({
      resonances: [],
      spaces: [],
      spacesTotal: 5,
      spacesSwept: 2,
      completed: false,
    })

    const response = await call({ authorization: 'Bearer right' })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toMatchObject({
      success: true,
      complete: false,
      spacesSwept: 2,
      spacesTotal: 5,
    })
    expect(body.pulseEmbeddings).toMatchObject({
      embedded: 1,
      remainingEmbeddable: 0,
    })
  })
})
