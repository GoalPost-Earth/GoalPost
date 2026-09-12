/**
 * GOAL-368 — manual, field-initiated resonance discovery sweep.
 *
 * Pure unit tests: the Neo4j driver, the LangChain graph, the pattern
 * detector, the pulse embedder and the activity-log writer are all stubbed, so
 * no database, OpenAI or LLM call is made. What is pinned here:
 *
 * - `resolveFieldSweepScope`: first row or null.
 * - `claimManualResonanceSweep(spaceId, userId)`: Space + Person locked in
 *   that order before any check; how the record maps to a claim or a refusal
 *   reason (`user_running` / `space_running` / `space_cooldown`) and its
 *   `retryAfterSeconds` (floored at 1); null for a missing Space/Person; the
 *   session is always closed.
 * - `finishManualResonanceSweep(spaceId, userId, { failed })`: stamps both
 *   finishedAt; a failed sweep backdates the Space start so 60s remain.
 * - `runManualResonanceSweep`: backfill orders the triggering field first and
 *   stops at min(deadline, start + 90s); triggering root field swept first;
 *   cross-field pass only when the Space has >1 root field; stops STARTING
 *   work once the deadline passes (completed: false); per-field errors never
 *   abort the sweep; one `trigger: 'manual'` Log only when suggestions were
 *   created, anchored only to pulses held in this Space alone (none → no Log).
 */
import neo4j from 'neo4j-driver'

const txRun = jest.fn()
const executeWrite = jest.fn(async (work: (tx: unknown) => unknown) =>
  work({ run: (...args: unknown[]) => txRun(...args) })
)
const sessionClose = jest.fn().mockResolvedValue(undefined)
jest.mock('@/lib/neo4j/driver', () => ({
  driver: {
    session: () => ({
      executeWrite: (work: (tx: unknown) => unknown) => executeWrite(work),
      close: () => sessionClose(),
    }),
  },
}))

const graphQuery = jest.fn()
jest.mock('@/modules/graph', () => ({
  initGraph: async () => ({
    query: (...args: unknown[]) => graphQuery(...args),
  }),
}))

const discoverResonancesForContext = jest.fn()
const discoverCrossFieldResonancesForRoot = jest.fn()
jest.mock('./pattern-detector', () => ({
  discoverResonancesForContext: (...args: unknown[]) =>
    discoverResonancesForContext(...args),
  discoverCrossFieldResonancesForRoot: (...args: unknown[]) =>
    discoverCrossFieldResonancesForRoot(...args),
}))

const generatePulseEmbeddings = jest.fn()
jest.mock('../embeddings/pulse-embedder', () => ({
  generatePulseEmbeddings: (...args: unknown[]) =>
    generatePulseEmbeddings(...args),
}))

const createLog = jest.fn()
jest.mock('@/lib/activity-logs/create-log', () => ({
  createLog: (...args: unknown[]) => createLog(...args),
}))

import {
  MANUAL_SWEEP_BUDGET_MS,
  MANUAL_SWEEP_COOLDOWN_SECONDS,
  claimManualResonanceSweep,
  finishManualResonanceSweep,
  resolveFieldSweepScope,
  runManualResonanceSweep,
} from './manual-sweep'
import type { DiscoveredResonance } from './pattern-detector'

// ─── helpers ────────────────────────────────────────────────────────────────

const SPACE_ID = 'ws_commons'
const ACTOR = 'user_member'
const START = 1_780_000_000_000
const BUDGET = 60_000

/** Fake wall clock driven by the tests (and by stubbed discovery work). */
let now = START

function record(values: Record<string, unknown>) {
  return { get: (key: string) => values[key] }
}

function stubClaimRecord(values: Record<string, unknown> | null) {
  txRun.mockResolvedValue({ records: values === null ? [] : [record(values)] })
}

function resonance(
  sourcePulseId: string,
  targetPulseId: string,
  contextId = 'ctx_any'
): DiscoveredResonance {
  return {
    linkId: `sugg_${sourcePulseId}_${targetPulseId}`,
    contextId,
    label: 'Shared care',
    description: 'Both pulses tend the same need.',
    sourcePulseId,
    targetPulseId,
    confidence: 0.82,
    evidence: 'Both mention the tool library.',
  }
}

/**
 * Route the stubbed LangChain graph by query shape:
 * the un-embedded-pulse backfill, the Space's root fields, and the
 * field → scope lookup.
 */
function stubGraph(opts: {
  missing?: string[]
  roots?: string[]
  scopeRows?: unknown
  /** Pulses ALSO held in another Space — the Log-anchor filter drops them. */
  sharedPulses?: string[]
  /** Override the Log-anchor filter's raw result. */
  anchorRows?: unknown
}) {
  graphQuery.mockImplementation(
    async (cypher: string, params: Record<string, unknown>) => {
    if (cypher.includes('UNWIND $pulseIds')) {
      if ('anchorRows' in opts) return opts.anchorRows
      return (params.pulseIds as string[])
        .filter((id) => !(opts.sharedPulses ?? []).includes(id))
        .map((id) => ({ id }))
    }
    if (cypher.includes('p.embedding IS NULL')) {
      return (opts.missing ?? []).map((id) => ({ id }))
    }
    if (cypher.includes('NOT (:FieldContext)-[:HAS_SUBCONTEXT]->(c)')) {
      return (opts.roots ?? []).map((id) => ({ id }))
    }
    if (cypher.includes('AS rootContextId')) {
      return opts.scopeRows
    }
    throw new Error(`unexpected graph query: ${cypher}`)
    }
  )
}

const anchorFilterCalls = () =>
  graphQuery.mock.calls.filter(([cypher]) =>
    (cypher as string).includes('UNWIND $pulseIds')
  )

function sweep(overrides: Partial<Parameters<typeof runManualResonanceSweep>[0]> = {}) {
  return runManualResonanceSweep({
    spaceId: SPACE_ID,
    rootContextId: 'ctx_b',
    triggerContextId: 'ctx_b_sub',
    actorUserId: ACTOR,
    deadline: START + BUDGET,
    ...overrides,
  })
}

const withinContextIds = () =>
  discoverResonancesForContext.mock.calls.map((call) => call[1])
const crossFieldRootIds = () =>
  discoverCrossFieldResonancesForRoot.mock.calls.map(
    (call) => (call[0] as { rootContextId: string }).rootContextId
  )

beforeEach(() => {
  jest.clearAllMocks()
  now = START
  jest.spyOn(Date, 'now').mockImplementation(() => now)
  jest.spyOn(console, 'error').mockImplementation(() => {})
  jest.spyOn(console, 'warn').mockImplementation(() => {})

  sessionClose.mockResolvedValue(undefined)
  executeWrite.mockImplementation(async (work) =>
    work({ run: (...args: unknown[]) => txRun(...args) })
  )
  discoverResonancesForContext.mockResolvedValue([])
  discoverCrossFieldResonancesForRoot.mockResolvedValue([])
  generatePulseEmbeddings.mockResolvedValue(undefined)
  createLog.mockResolvedValue('log_1')
})

afterEach(() => {
  jest.restoreAllMocks()
})

// ─── constants ──────────────────────────────────────────────────────────────

describe('manual sweep timing constants', () => {
  const ROUTE_MAX_DURATION_SECONDS = 300

  it('holds the cooldown longer than the route can run, so two manual sweeps never overlap', () => {
    expect(MANUAL_SWEEP_COOLDOWN_SECONDS).toBe(600)
    expect(MANUAL_SWEEP_COOLDOWN_SECONDS).toBeGreaterThan(ROUTE_MAX_DURATION_SECONDS)
  })

  it('leaves headroom inside maxDuration for the pulse in flight and the Log write', () => {
    expect(MANUAL_SWEEP_BUDGET_MS).toBe(240_000)
    expect(MANUAL_SWEEP_BUDGET_MS).toBeLessThan(ROUTE_MAX_DURATION_SECONDS * 1000)
  })
})

// ─── resolveFieldSweepScope ─────────────────────────────────────────────────

describe('resolveFieldSweepScope', () => {
  it('returns the field’s Space and root field', async () => {
    stubGraph({ scopeRows: [{ spaceId: SPACE_ID, rootContextId: 'ctx_root' }] })

    await expect(resolveFieldSweepScope('ctx_sub')).resolves.toEqual({
      spaceId: SPACE_ID,
      rootContextId: 'ctx_root',
    })
    const [cypher, params] = graphQuery.mock.calls[0]
    expect(params).toEqual({ fieldContextId: 'ctx_sub' })
    // A soft-deleted field must not resolve to a sweepable scope.
    expect(cypher).toContain('c.deletedAt IS NULL')
  })

  it('returns null for an unknown, deleted, or Space-less field', async () => {
    stubGraph({ scopeRows: [] })
    await expect(resolveFieldSweepScope('ctx_missing')).resolves.toBeNull()
  })

  it('returns null when the graph returns a non-array', async () => {
    stubGraph({ scopeRows: undefined })
    await expect(resolveFieldSweepScope('ctx_missing')).resolves.toBeNull()
  })
})

// ─── claimManualResonanceSweep ──────────────────────────────────────────────

describe('claimManualResonanceSweep', () => {
  const USER_ID = 'person_member'

  function claimRecord(values: {
    claimable: unknown
    spaceFree?: unknown
    spaceUnfinished?: unknown
    spaceElapsedSeconds?: number | null
    userRunningForSeconds?: number | null
  }) {
    stubClaimRecord({
      spaceFree: false,
      spaceUnfinished: false,
      spaceElapsedSeconds: null,
      userRunningForSeconds: null,
      ...values,
    })
  }

  it('claims the slot when both the Space and the member are free', async () => {
    claimRecord({ claimable: true, spaceFree: true })

    await expect(claimManualResonanceSweep(SPACE_ID, USER_ID)).resolves.toEqual({
      claimed: true,
    })
    expect(sessionClose).toHaveBeenCalledTimes(1)
  })

  it('passes the Space id, member id, cooldown and max runtime (as Neo4j integers)', async () => {
    claimRecord({ claimable: true, spaceFree: true })

    await claimManualResonanceSweep(SPACE_ID, USER_ID)

    expect(executeWrite).toHaveBeenCalledTimes(1)
    const [, params] = txRun.mock.calls[0]
    expect(params.spaceId).toBe(SPACE_ID)
    expect(params.userId).toBe(USER_ID)
    expect(neo4j.isInt(params.cooldownSeconds)).toBe(true)
    expect(params.cooldownSeconds.toNumber()).toBe(MANUAL_SWEEP_COOLDOWN_SECONDS)
    expect(neo4j.isInt(params.maxRuntimeSeconds)).toBe(true)
    expect(params.maxRuntimeSeconds.toNumber()).toBe(300)
  })

  it('locks the Space, then the Person, BEFORE reading either claim (write-then-guard)', async () => {
    claimRecord({ claimable: true, spaceFree: true })

    await claimManualResonanceSweep(SPACE_ID, USER_ID)

    const cypher: string = txRun.mock.calls[0][0]
    const spaceLock = cypher.indexOf('SET s.resonanceSweepLock')
    const personLock = cypher.indexOf('SET u.resonanceSweepLock')
    const firstCheck = Math.min(
      cypher.indexOf('AS spaceUnfinished'),
      cypher.indexOf('AS spaceFree'),
      cypher.indexOf('AS userFree'),
      cypher.indexOf('AS claimable')
    )
    expect(spaceLock).toBeGreaterThan(-1)
    // Space before Person in every call, so two claims never deadlock.
    expect(personLock).toBeGreaterThan(spaceLock)
    expect(firstCheck).toBeGreaterThan(personLock)
    expect(cypher).toContain('MATCH (u:Person {id: $userId})')
  })

  it('stamps the claim on both the Space and the Person', async () => {
    claimRecord({ claimable: true, spaceFree: true })

    await claimManualResonanceSweep(SPACE_ID, USER_ID)

    const cypher: string = txRun.mock.calls[0][0]
    expect(cypher).toContain('s.resonanceSweepStartedAt = datetime()')
    expect(cypher).toContain('u.resonanceSweepStartedAt = datetime()')
  })

  it('returns null when the Space or the Person does not exist', async () => {
    stubClaimRecord(null)

    await expect(claimManualResonanceSweep('ws_gone', USER_ID)).resolves.toBeNull()
    expect(sessionClose).toHaveBeenCalledTimes(1)
  })

  describe('when the Space is free but the member has a sweep in flight elsewhere', () => {
    it.each`
      case                                   | runningFor | retryAfter
      ${'just started'}                      | ${0}       | ${300}
      ${'two minutes in'}                    | ${120}     | ${180}
      ${'fractional elapsed rounds up'}      | ${12.3}    | ${288}
      ${'under a second of runtime left'}    | ${299.5}   | ${1}
      ${'past max runtime floors at 1'}      | ${310}     | ${1}
      ${'missing runningFor counts as zero'} | ${null}    | ${300}
    `(
      'refuses with user_running — $case → retryAfterSeconds=$retryAfter',
      async ({ runningFor, retryAfter }) => {
        claimRecord({
          claimable: false,
          spaceFree: true,
          spaceElapsedSeconds: 900,
          userRunningForSeconds: runningFor,
        })

        await expect(claimManualResonanceSweep(SPACE_ID, USER_ID)).resolves.toEqual({
          claimed: false,
          reason: 'user_running',
          retryAfterSeconds: retryAfter,
        })
      }
    )
  })

  describe('when the Space is inside its cooldown', () => {
    it.each`
      case                                                | unfinished | elapsed  | reason              | retryAfter
      ${'unfinished, just claimed'}                       | ${true}    | ${0}     | ${'space_running'}  | ${600}
      ${'unfinished, 30s in'}                             | ${true}    | ${30}    | ${'space_running'}  | ${570}
      ${'unfinished, 299s in (last running second)'}      | ${true}    | ${299}   | ${'space_running'}  | ${301}
      ${'unfinished, 300s in (past max runtime)'}         | ${true}    | ${300}   | ${'space_cooldown'} | ${300}
      ${'unfinished, 450s in (presumed killed)'}          | ${true}    | ${450}   | ${'space_cooldown'} | ${150}
      ${'finished, 100s ago'}                             | ${false}   | ${100}   | ${'space_cooldown'} | ${500}
      ${'finished after a FAILED sweep (backdated 540s)'} | ${false}   | ${540}   | ${'space_cooldown'} | ${60}
      ${'fractional elapsed rounds up'}                   | ${false}   | ${12.3}  | ${'space_cooldown'} | ${588}
      ${'under a second left'}                            | ${false}   | ${599.2} | ${'space_cooldown'} | ${1}
      ${'clock skew past the window floors at 1'}         | ${false}   | ${750}   | ${'space_cooldown'} | ${1}
    `(
      'refuses — $case → $reason, retryAfterSeconds=$retryAfter',
      async ({ unfinished, elapsed, reason, retryAfter }) => {
        claimRecord({
          claimable: false,
          spaceFree: false,
          spaceUnfinished: unfinished,
          spaceElapsedSeconds: elapsed,
        })

        await expect(claimManualResonanceSweep(SPACE_ID, USER_ID)).resolves.toEqual({
          claimed: false,
          reason,
          retryAfterSeconds: retryAfter,
        })
      }
    )

    it('reports the Space refusal even when the member is also running elsewhere', async () => {
      claimRecord({
        claimable: false,
        spaceFree: false,
        spaceUnfinished: false,
        spaceElapsedSeconds: 100,
        userRunningForSeconds: 20,
      })

      await expect(claimManualResonanceSweep(SPACE_ID, USER_ID)).resolves.toEqual({
        claimed: false,
        reason: 'space_cooldown',
        retryAfterSeconds: 500,
      })
    })

    it('treats a missing elapsed value as zero', async () => {
      claimRecord({
        claimable: false,
        spaceFree: false,
        spaceUnfinished: true,
        spaceElapsedSeconds: null,
      })

      await expect(claimManualResonanceSweep(SPACE_ID, USER_ID)).resolves.toEqual({
        claimed: false,
        reason: 'space_running',
        retryAfterSeconds: MANUAL_SWEEP_COOLDOWN_SECONDS,
      })
    })
  })

  it('only treats claimable === true as a claim', async () => {
    claimRecord({
      claimable: 'true',
      spaceFree: false,
      spaceElapsedSeconds: 10,
    })

    const claim = await claimManualResonanceSweep(SPACE_ID, USER_ID)
    expect(claim).toMatchObject({ claimed: false })
  })

  it('only treats spaceFree === true as the member-running case', async () => {
    claimRecord({
      claimable: false,
      spaceFree: 'true',
      spaceElapsedSeconds: 10,
      userRunningForSeconds: 10,
    })

    const claim = await claimManualResonanceSweep(SPACE_ID, USER_ID)
    expect(claim).toMatchObject({ claimed: false, reason: 'space_cooldown' })
  })

  it('closes the session and propagates when the write fails', async () => {
    executeWrite.mockRejectedValueOnce(new Error('deadlock'))

    await expect(claimManualResonanceSweep(SPACE_ID, USER_ID)).rejects.toThrow(
      'deadlock'
    )
    expect(sessionClose).toHaveBeenCalledTimes(1)
  })
})

// ─── finishManualResonanceSweep ─────────────────────────────────────────────

describe('finishManualResonanceSweep', () => {
  const USER_ID = 'person_member'

  beforeEach(() => {
    txRun.mockResolvedValue({ records: [] })
  })

  it('stamps finishedAt on both the Space and the member, and closes the session', async () => {
    await finishManualResonanceSweep(SPACE_ID, USER_ID, { failed: false })

    const [cypher, params] = txRun.mock.calls[0]
    expect(cypher).toContain('SET s.resonanceSweepFinishedAt = datetime()')
    expect(cypher).toContain('SET u.resonanceSweepFinishedAt = datetime()')
    expect(cypher).toContain('(u:Person {id: $userId})')
    expect(params.spaceId).toBe(SPACE_ID)
    expect(params.userId).toBe(USER_ID)
    expect(params.failed).toBe(false)
    expect(sessionClose).toHaveBeenCalledTimes(1)
  })

  it('defaults to a non-failed finish when no options are passed', async () => {
    await finishManualResonanceSweep(SPACE_ID, USER_ID)

    expect(txRun.mock.calls[0][1].failed).toBe(false)
  })

  it('passes failed=true and the window that leaves a 60s retry after a failed sweep', async () => {
    await finishManualResonanceSweep(SPACE_ID, USER_ID, { failed: true })

    const [, params] = txRun.mock.calls[0]
    expect(params.failed).toBe(true)
    expect(neo4j.isInt(params.cooldownSeconds)).toBe(true)
    expect(neo4j.isInt(params.retrySeconds)).toBe(true)
    expect(params.cooldownSeconds.toNumber()).toBe(MANUAL_SWEEP_COOLDOWN_SECONDS)
    expect(params.retrySeconds.toNumber()).toBe(60)
    // The start is backdated by (cooldown - retry), so exactly `retry` remains.
    expect(
      params.cooldownSeconds.toNumber() - params.retrySeconds.toNumber()
    ).toBe(540)
  })

  it('backdates the Space start only when the sweep failed', async () => {
    await finishManualResonanceSweep(SPACE_ID, USER_ID, { failed: true })

    const cypher: string = txRun.mock.calls[0][0]
    const guard = cypher.indexOf('AND $failed')
    const backdate = cypher.indexOf('SET s.resonanceSweepStartedAt')
    expect(guard).toBeGreaterThan(-1)
    expect(backdate).toBeGreaterThan(guard)
    expect(cypher).toContain(
      'datetime() - duration({seconds: $cooldownSeconds - $retrySeconds})'
    )
    // The member's own start is never rewritten.
    expect(cypher).not.toContain('u.resonanceSweepStartedAt')
    // The member is matched independently of the Space, so a Space deleted
    // mid-sweep still releases them.
    expect(cypher).toContain('OPTIONAL MATCH (s:Space {id: $spaceId})')
    expect(cypher).toContain('OPTIONAL MATCH (u:Person {id: $userId})')
  })

  it('closes the session and propagates when the write fails', async () => {
    executeWrite.mockRejectedValueOnce(new Error('write failed'))

    await expect(
      finishManualResonanceSweep(SPACE_ID, USER_ID, { failed: true })
    ).rejects.toThrow('write failed')
    expect(sessionClose).toHaveBeenCalledTimes(1)
  })
})

// ─── runManualResonanceSweep ────────────────────────────────────────────────

describe('runManualResonanceSweep', () => {
  describe('embedding backfill', () => {
    it('embeds the Space’s un-embedded pulses before discovering, bounded to 100', async () => {
      stubGraph({ missing: ['pulse_1', 'pulse_2'], roots: ['ctx_b'] })

      const result = await sweep({ rootContextId: 'ctx_b' })

      expect(generatePulseEmbeddings.mock.calls.map((c) => c[0])).toEqual([
        'pulse_1',
        'pulse_2',
      ])
      expect(result.embeddedCount).toBe(2)
      expect(generatePulseEmbeddings.mock.invocationCallOrder[1]).toBeLessThan(
        discoverResonancesForContext.mock.invocationCallOrder[0]
      )

      const backfill = graphQuery.mock.calls.find(([cypher]) =>
        (cypher as string).includes('p.embedding IS NULL')
      )!
      expect(backfill[1].spaceId).toBe(SPACE_ID)
      expect(neo4j.isInt(backfill[1].limit)).toBe(true)
      expect(backfill[1].limit.toNumber()).toBe(100)
    })

    it('orders the backfill by the triggering root field’s subtree first, then newest first', async () => {
      stubGraph({ missing: [], roots: ['ctx_b'] })

      await sweep({ rootContextId: 'ctx_b' })

      const [cypher, params] = graphQuery.mock.calls.find(([c]) =>
        (c as string).includes('p.embedding IS NULL')
      )!
      expect(params.rootContextId).toBe('ctx_b')
      expect(cypher).toMatch(
        /\{id: \$rootContextId\}\)-\[:HAS_SUBCONTEXT\*0\.\.10\]->/
      )
      expect(cypher).toMatch(/ORDER BY inTriggerField DESC, p\.createdAt DESC\s+LIMIT \$limit/)
    })

    it('embeds in the order the backfill query returns', async () => {
      stubGraph({ missing: ['p_trigger_new', 'p_trigger_old', 'p_other'], roots: ['ctx_b'] })

      await sweep()

      expect(generatePulseEmbeddings.mock.calls.map((c) => c[0])).toEqual([
        'p_trigger_new',
        'p_trigger_old',
        'p_other',
      ])
    })

    it('caps the backfill at 90s even when the sweep deadline is further out, leaving the rest for discovery', async () => {
      stubGraph({
        missing: ['pulse_1', 'pulse_2', 'pulse_3', 'pulse_4', 'pulse_5'],
        roots: ['ctx_b'],
      })
      generatePulseEmbeddings.mockImplementation(async () => {
        now += 40_000
      })

      const result = await sweep({ deadline: START + 240_000 })

      // Starts at 0s, 40s, 80s; the 4th would start at 120s ≥ 90s.
      expect(generatePulseEmbeddings).toHaveBeenCalledTimes(3)
      expect(result.embeddedCount).toBe(3)
      expect(discoverResonancesForContext).toHaveBeenCalledTimes(1)
      expect(result.completed).toBe(true)
    })

    it('treats reaching the 90s backfill cap exactly as out of embedding time', async () => {
      stubGraph({ missing: ['pulse_1', 'pulse_2'], roots: ['ctx_b'] })
      generatePulseEmbeddings.mockImplementation(async () => {
        now = START + 90_000
      })

      const result = await sweep({ deadline: START + 240_000 })

      expect(result.embeddedCount).toBe(1)
      expect(discoverResonancesForContext).toHaveBeenCalled()
    })

    it('skips a pulse whose embedding fails and keeps going', async () => {
      stubGraph({ missing: ['pulse_1', 'pulse_bad', 'pulse_3'], roots: ['ctx_b'] })
      generatePulseEmbeddings.mockImplementation(async (id: string) => {
        if (id === 'pulse_bad') throw new Error('OpenAI 500')
      })

      const result = await sweep()

      expect(generatePulseEmbeddings).toHaveBeenCalledTimes(3)
      expect(result.embeddedCount).toBe(2)
      expect(discoverResonancesForContext).toHaveBeenCalled()
    })

    it('stops embedding once the deadline passes', async () => {
      stubGraph({ missing: ['pulse_1', 'pulse_2', 'pulse_3'], roots: ['ctx_b'] })
      generatePulseEmbeddings.mockImplementation(async () => {
        now = START + BUDGET // the first embedding eats the whole budget
      })

      const result = await sweep()

      expect(generatePulseEmbeddings).toHaveBeenCalledTimes(1)
      expect(result.embeddedCount).toBe(1)
      expect(discoverResonancesForContext).not.toHaveBeenCalled()
      expect(result.completed).toBe(false)
    })
  })

  describe('field order and cross-field pass', () => {
    it('sweeps the triggering root field first, then the Space’s other root fields', async () => {
      stubGraph({ roots: ['ctx_a', 'ctx_b', 'ctx_c'] })

      await sweep({ rootContextId: 'ctx_b' })

      expect(withinContextIds()).toEqual(['ctx_b', 'ctx_a', 'ctx_c'])
      for (const call of discoverResonancesForContext.mock.calls) {
        expect(call[0]).toBe(SPACE_ID)
        expect(call[2]).toBeUndefined() // full sweep, not incremental
        expect(call[3]).toBe(START + BUDGET) // deadline threaded through
      }
    })

    it('sweeps the triggering root field even if the root listing omits it', async () => {
      stubGraph({ roots: ['ctx_a'] })

      await sweep({ rootContextId: 'ctx_b' })

      expect(withinContextIds()).toEqual(['ctx_b', 'ctx_a'])
    })

    it('runs the cross-field pass for every root field when the Space has several', async () => {
      stubGraph({ roots: ['ctx_a', 'ctx_b'] })

      await sweep({ rootContextId: 'ctx_b' })

      expect(crossFieldRootIds()).toEqual(['ctx_b', 'ctx_a'])
      expect(discoverCrossFieldResonancesForRoot).toHaveBeenCalledWith({
        spaceId: SPACE_ID,
        rootContextId: 'ctx_b',
        maxSourcePulses: 10,
        deadline: START + BUDGET,
      })
    })

    it('skips the cross-field pass when the Space has a single root field', async () => {
      stubGraph({ roots: ['ctx_b'] })

      const result = await sweep({ rootContextId: 'ctx_b' })

      expect(withinContextIds()).toEqual(['ctx_b'])
      expect(discoverCrossFieldResonancesForRoot).not.toHaveBeenCalled()
      expect(result.completed).toBe(true)
    })

    it('skips the cross-field pass when the root listing is empty', async () => {
      stubGraph({ roots: [] })

      await sweep({ rootContextId: 'ctx_b' })

      expect(withinContextIds()).toEqual(['ctx_b'])
      expect(discoverCrossFieldResonancesForRoot).not.toHaveBeenCalled()
    })

    it('counts within-field and cross-field suggestions separately', async () => {
      stubGraph({ roots: ['ctx_a', 'ctx_b'] })
      discoverResonancesForContext.mockImplementation(async (_s, ctx: string) =>
        ctx === 'ctx_b'
          ? [resonance('p1', 'p2'), resonance('p3', 'p4')]
          : [resonance('p5', 'p6')]
      )
      discoverCrossFieldResonancesForRoot.mockImplementation(
        async ({ rootContextId }: { rootContextId: string }) =>
          rootContextId === 'ctx_b' ? [resonance('p1', 'p5')] : []
      )

      await expect(sweep()).resolves.toEqual({
        embeddedCount: 0,
        suggestionsCreated: 3,
        crossFieldSuggestionsCreated: 1,
        completed: true,
      })
    })
  })

  describe('time budget', () => {
    it('stops starting new fields once the deadline has passed and reports completed=false', async () => {
      stubGraph({ roots: ['ctx_a', 'ctx_b', 'ctx_c'] })
      discoverResonancesForContext.mockImplementation(async (_s, ctx: string) => {
        now = START + BUDGET + 1 // the triggering field used up the budget
        return [resonance(`${ctx}_1`, `${ctx}_2`)]
      })

      const result = await sweep({ rootContextId: 'ctx_b' })

      expect(withinContextIds()).toEqual(['ctx_b'])
      // Out of time before the triggering field's cross-field pass, too.
      expect(discoverCrossFieldResonancesForRoot).not.toHaveBeenCalled()
      expect(result).toMatchObject({ suggestionsCreated: 1, completed: false })
    })

    it('treats reaching the deadline exactly as out of time', async () => {
      stubGraph({ roots: ['ctx_a', 'ctx_b'] })
      discoverResonancesForContext.mockImplementation(async () => {
        now = START + BUDGET
        return []
      })

      const result = await sweep({ rootContextId: 'ctx_b' })

      expect(withinContextIds()).toEqual(['ctx_b'])
      expect(result.completed).toBe(false)
    })

    it('finishes a field’s cross-field pass but starts no further field when time runs out mid-pass', async () => {
      stubGraph({ roots: ['ctx_a', 'ctx_b'] })
      discoverCrossFieldResonancesForRoot.mockImplementation(async () => {
        now = START + BUDGET + 1
        return [resonance('p1', 'p9')]
      })

      const result = await sweep({ rootContextId: 'ctx_b' })

      expect(withinContextIds()).toEqual(['ctx_b'])
      expect(crossFieldRootIds()).toEqual(['ctx_b'])
      expect(result).toMatchObject({
        crossFieldSuggestionsCreated: 1,
        completed: false,
      })
    })

    it('does no discovery work at all when the deadline has already passed', async () => {
      stubGraph({ missing: ['pulse_1'], roots: ['ctx_a', 'ctx_b'] })

      const result = await sweep({ deadline: START - 1 })

      expect(generatePulseEmbeddings).not.toHaveBeenCalled()
      expect(discoverResonancesForContext).not.toHaveBeenCalled()
      expect(discoverCrossFieldResonancesForRoot).not.toHaveBeenCalled()
      expect(createLog).not.toHaveBeenCalled()
      expect(result).toEqual({
        embeddedCount: 0,
        suggestionsCreated: 0,
        crossFieldSuggestionsCreated: 0,
        completed: false,
      })
    })

    it('reports completed=true when every field was swept inside the budget', async () => {
      stubGraph({ roots: ['ctx_a', 'ctx_b', 'ctx_c'] })
      discoverResonancesForContext.mockImplementation(async () => {
        now += 1_000
        return []
      })

      const result = await sweep()

      expect(withinContextIds()).toHaveLength(3)
      expect(crossFieldRootIds()).toHaveLength(3)
      expect(result.completed).toBe(true)
    })
  })

  describe('per-field failures', () => {
    it('keeps sweeping the other fields when one field’s within-field pass throws', async () => {
      stubGraph({ roots: ['ctx_a', 'ctx_b', 'ctx_c'] })
      discoverResonancesForContext.mockImplementation(async (_s, ctx: string) => {
        if (ctx === 'ctx_b') throw new Error('vector index offline')
        return [resonance(`${ctx}_1`, `${ctx}_2`)]
      })

      const result = await sweep({ rootContextId: 'ctx_b' })

      expect(withinContextIds()).toEqual(['ctx_b', 'ctx_a', 'ctx_c'])
      // The failing field's cross-field pass is skipped; the others still run.
      expect(crossFieldRootIds()).toEqual(['ctx_a', 'ctx_c'])
      expect(result).toMatchObject({ suggestionsCreated: 2, completed: true })
    })

    it('keeps a field’s within-field suggestions when its cross-field pass throws', async () => {
      stubGraph({ roots: ['ctx_a', 'ctx_b'] })
      discoverResonancesForContext.mockResolvedValue([resonance('p1', 'p2')])
      discoverCrossFieldResonancesForRoot.mockImplementation(
        async ({ rootContextId }: { rootContextId: string }) => {
          if (rootContextId === 'ctx_b') throw new Error('LLM timeout')
          return [resonance('p7', 'p8')]
        }
      )

      const result = await sweep({ rootContextId: 'ctx_b' })

      expect(withinContextIds()).toEqual(['ctx_b', 'ctx_a'])
      expect(result).toMatchObject({
        suggestionsCreated: 2,
        crossFieldSuggestionsCreated: 1,
        completed: true,
      })
    })
  })

  describe('activity log', () => {
    it('writes no Log when the sweep created no suggestions', async () => {
      stubGraph({ missing: ['pulse_1'], roots: ['ctx_a', 'ctx_b'] })

      const result = await sweep()

      expect(result.embeddedCount).toBe(1)
      expect(createLog).not.toHaveBeenCalled()
    })

    it('writes one manual-trigger Log anchored to the triggering field and every suggested pulse', async () => {
      stubGraph({ missing: ['p_new'], roots: ['ctx_a', 'ctx_b'] })
      discoverResonancesForContext.mockImplementation(async (_s, ctx: string) =>
        ctx === 'ctx_b'
          ? [resonance('p1', 'p2'), resonance('p2', 'p3')]
          : [resonance('p4', 'p5')]
      )
      discoverCrossFieldResonancesForRoot.mockImplementation(
        async ({ rootContextId }: { rootContextId: string }) =>
          rootContextId === 'ctx_b' ? [resonance('p1', 'p4')] : []
      )

      await sweep({ rootContextId: 'ctx_b', triggerContextId: 'ctx_b_sub' })

      expect(createLog).toHaveBeenCalledTimes(1)
      const log = createLog.mock.calls[0][0]
      expect(log.userId).toBe(ACTOR)
      expect(log.contextId).toBe('ctx_b_sub')
      expect([...log.pulseIds].sort()).toEqual(['p1', 'p2', 'p3', 'p4', 'p5'])
      expect(new Set(log.pulseIds).size).toBe(log.pulseIds.length) // de-duplicated
      expect(log.description).toBe(
        'Resonance discovery found 4 suggestions across this space (1 between different fields)'
      )
      expect(log.metadata).toEqual({
        event: 'resonance_discovery_run',
        trigger: 'manual',
        contextId: 'ctx_b_sub',
        spaceId: SPACE_ID,
        embeddedCount: 1,
        suggestionsCreated: 3,
        crossFieldSuggestionsCreated: 1,
        completed: true,
      })
    })

    it('uses the singular and omits the cross-field clause for one within-field suggestion', async () => {
      stubGraph({ roots: ['ctx_b'] })
      discoverResonancesForContext.mockResolvedValue([resonance('p1', 'p2')])

      await sweep()

      expect(createLog.mock.calls[0][0].description).toBe(
        'Resonance discovery found 1 suggestion across this space'
      )
    })

    it('logs a partial run when the budget ran out after suggestions were created', async () => {
      stubGraph({ roots: ['ctx_a', 'ctx_b'] })
      discoverResonancesForContext.mockImplementation(async () => {
        now = START + BUDGET
        return [resonance('p1', 'p2')]
      })

      await sweep()

      expect(createLog.mock.calls[0][0].metadata).toMatchObject({
        trigger: 'manual',
        completed: false,
      })
    })

    it('filters the Log anchors through the other-Space holder query with the de-duplicated pulse ids', async () => {
      stubGraph({ roots: ['ctx_b'] })
      discoverResonancesForContext.mockResolvedValue([
        resonance('p1', 'p2'),
        resonance('p2', 'p3'),
      ])

      await sweep()

      expect(anchorFilterCalls()).toHaveLength(1)
      const [cypher, params] = anchorFilterCalls()[0]
      expect(params.spaceId).toBe(SPACE_ID)
      expect([...params.pulseIds].sort()).toEqual(['p1', 'p2', 'p3'])
      expect(new Set(params.pulseIds).size).toBe(params.pulseIds.length)
      expect(cypher).toMatch(/WHERE NOT EXISTS/)
      expect(cypher).toContain('other.id <> $spaceId')
    })

    it('drops pulses also held in another Space from the Log anchors', async () => {
      stubGraph({ roots: ['ctx_b'], sharedPulses: ['p2'] })
      discoverResonancesForContext.mockResolvedValue([
        resonance('p1', 'p2'),
        resonance('p2', 'p3'),
      ])

      await sweep()

      expect(createLog).toHaveBeenCalledTimes(1)
      const log = createLog.mock.calls[0][0]
      expect([...log.pulseIds].sort()).toEqual(['p1', 'p3'])
      // The description still counts every suggestion the sweep created.
      expect(log.description).toBe(
        'Resonance discovery found 2 suggestions across this space'
      )
      expect(log.metadata.suggestionsCreated).toBe(2)
    })

    it('writes NO Log when every suggested pulse is also held in another Space', async () => {
      stubGraph({ roots: ['ctx_b'], sharedPulses: ['p1', 'p2'] })
      discoverResonancesForContext.mockResolvedValue([resonance('p1', 'p2')])

      const result = await sweep()

      expect(anchorFilterCalls()).toHaveLength(1)
      expect(createLog).not.toHaveBeenCalled()
      expect(result).toEqual({
        embeddedCount: 0,
        suggestionsCreated: 1,
        crossFieldSuggestionsCreated: 0,
        completed: true,
      })
    })

    it('writes no Log when the anchor filter returns a non-array', async () => {
      stubGraph({ roots: ['ctx_b'], anchorRows: undefined })
      discoverResonancesForContext.mockResolvedValue([resonance('p1', 'p2')])

      await sweep()

      expect(createLog).not.toHaveBeenCalled()
    })

    it('skips the anchor filter entirely when there are no suggestions', async () => {
      stubGraph({ roots: ['ctx_a', 'ctx_b'] })

      await sweep()

      expect(anchorFilterCalls()).toHaveLength(0)
      expect(createLog).not.toHaveBeenCalled()
    })

    it('still returns the result when the anchor filter query throws', async () => {
      stubGraph({ roots: ['ctx_b'] })
      const routed = graphQuery.getMockImplementation()!
      graphQuery.mockImplementation(async (cypher: string, params: unknown) => {
        if (cypher.includes('UNWIND $pulseIds')) throw new Error('graph down')
        return routed(cypher, params)
      })
      discoverResonancesForContext.mockResolvedValue([resonance('p1', 'p2')])

      await expect(sweep()).resolves.toMatchObject({
        suggestionsCreated: 1,
        completed: true,
      })
      expect(createLog).not.toHaveBeenCalled()
    })

    it('still returns the result when the Log write fails', async () => {
      stubGraph({ roots: ['ctx_b'] })
      discoverResonancesForContext.mockResolvedValue([resonance('p1', 'p2')])
      createLog.mockRejectedValue(new Error('log write failed'))

      await expect(sweep()).resolves.toEqual({
        embeddedCount: 0,
        suggestionsCreated: 1,
        crossFieldSuggestionsCreated: 0,
        completed: true,
      })
    })
  })

  it('lets an infrastructure failure (root-field listing) propagate', async () => {
    graphQuery.mockImplementation(async (cypher: string) => {
      if (cypher.includes('p.embedding IS NULL')) return []
      throw new Error('graph down')
    })

    await expect(sweep()).rejects.toThrow('graph down')
    expect(discoverResonancesForContext).not.toHaveBeenCalled()
  })
})
