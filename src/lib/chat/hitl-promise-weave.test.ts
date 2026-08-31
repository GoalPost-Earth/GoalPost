import {
  describeWriteAction,
  executeAuthorizedWriteTool,
  isWriteToolName,
  resolveWeaveProposalDisplay,
} from './hitl'
import { entityKindLabel, getEditableFields } from './approval-display'
import { NOT_LIVE_WEAVE_STATUSES } from '@/lib/promise-weave'

/**
 * GOAL-342 — the AI weave proposal and the gate it must never slip past.
 *
 * The thing under test is not "does a weave get created". It is that an
 * assistant-driven weave lands as a PROPOSAL and nothing else: `proposed`,
 * never `active`; anchored only in a field the acting member may edit; holding
 * only pulses that field already holds; and logged with who acted. Every one
 * of those is a place where a plausible-looking implementation silently
 * establishes a connection no human agreed to.
 */

jest.mock('@/lib/neo4j/driver', () => ({
  driver: { session: jest.fn() },
}))
jest.mock('@/modules/agent/tools/field-context/field-context.service', () => ({
  updateFieldContext: jest.fn(),
}))
jest.mock('@/modules/agent/tools/pulse/pulse.service', () => ({
  updatePulse: jest.fn(),
  linkPulseToContext: jest.fn(),
  unlinkPulseFromContext: jest.fn(),
}))
jest.mock('@/lib/field-context/soft-delete-field-context', () => ({
  softDeleteFieldContext: jest.fn(),
}))

const CONTEXT_ID = 'ctx_a87c5bf1-6ab3-42f6-bb61-14d5e884fda4'
const USER_ID = 'person_9f2b1c44-0000-4a11-9c3e-3b7d0e1f2a55'

interface QueryCall {
  cypher: string
  params: Record<string, unknown>
}

/**
 * Minimal Neo4jGraph stand-in. `canEditContext` and the weave write are two
 * separate `graph.query` calls against the same object, so the fake routes on
 * the query text rather than on call order — a test that depended on ordering
 * would pass even if the gate were moved after the write.
 */
function buildGraph({
  allowed = true,
  weaveRow,
}: {
  allowed?: boolean
  weaveRow?: Record<string, unknown> | null
} = {}) {
  const calls: QueryCall[] = []
  const graph = {
    query: jest.fn(async (cypher: string, params: Record<string, unknown>) => {
      calls.push({ cypher, params })
      if (cypher.includes('RETURN ($currentUserId IN ownerIds')) {
        return [{ allowed }]
      }
      if (cypher.includes('CREATE (weave:PromiseWeave')) {
        return weaveRow === null ? [] : [weaveRow ?? defaultWeaveRow()]
      }
      return []
    }),
  }
  return { graph, calls }
}

function defaultWeaveRow(overrides: Record<string, unknown> = {}) {
  return {
    weaveTitle: 'Keeping the house while they travel',
    contextTitle: 'Care Practices',
    wovenForName: 'Sarah Chen',
    wovenPulseTitles: ['Water the plants', 'Spare key with Tom'],
    alreadyWoven: false,
    existingTitle: null,
    existingStatus: null,
    wovenForDropped: false,
    ...overrides,
  }
}

function baseArgs(overrides: Record<string, unknown> = {}) {
  return {
    contextId: CONTEXT_ID,
    contextTitle: 'Care Practices',
    title: 'Keeping the house while they travel',
    why: 'Both promises are held by the same people over the same fortnight.',
    pulseIds: ['pulse_water', 'pulse_key'],
    pulseTitles: ['Water the plants', 'Spare key with Tom'],
    wovenForPersonId: 'person_sarah',
    wovenForName: 'Sarah Chen',
    ...overrides,
  }
}

function weaveWrite(calls: QueryCall[]): QueryCall | undefined {
  return calls.find((call) => call.cypher.includes('CREATE (weave:PromiseWeave'))
}

describe('hitl — propose_promise_weave is a registered write tool (Rule 5)', () => {
  it('is in the WriteToolName union, so runWriteTool will gate it', () => {
    expect(isWriteToolName('propose_promise_weave')).toBe(true)
  })

  it('is dispatched by executeAuthorizedWriteTool rather than falling through to "Unsupported write tool"', async () => {
    const { graph } = buildGraph()
    const result = await executeAuthorizedWriteTool(
      graph as never,
      USER_ID,
      'propose_promise_weave',
      baseArgs()
    )
    expect(result.message).not.toContain('Unsupported write tool')
    expect(result.success).toBe(true)
  })
})

describe('hitl — propose_promise_weave approval copy (Rule 1)', () => {
  it('names the weave, the person and the pulses, and never an id', () => {
    const summary = describeWriteAction('propose_promise_weave', baseArgs())

    expect(summary).toContain('Keeping the house while they travel')
    expect(summary).toContain('Sarah Chen')
    expect(summary).toContain('Water the plants')
    expect(summary).toContain('Care Practices')
    expect(summary).not.toContain('ctx_')
    expect(summary).not.toContain('pulse_')
    expect(summary).not.toContain('person_')
    expect(summary).not.toContain('weave_')
    expect(summary).not.toContain('a87c5bf1')
  })

  it('says the card creates a PROPOSAL, not an established weave — the second gate has to be visible before approving', () => {
    const summary = describeWriteAction('propose_promise_weave', baseArgs())
    expect(summary).toMatch(/^Propose/)
    expect(summary).toMatch(/confirm or dismiss/i)
  })

  it('summarises a long pulse list rather than listing every title', () => {
    const summary = describeWriteAction(
      'propose_promise_weave',
      baseArgs({
        pulseTitles: ['One', 'Two', 'Three', 'Four', 'Five'],
        pulseIds: ['a', 'b', 'c', 'd', 'e'],
      })
    )
    expect(summary).toContain('"One", "Two", "Three"')
    expect(summary).toContain('and 2 more')
    expect(summary).not.toContain('"Four"')
  })

  it('refuses to name titles it cannot vouch for — falls back to a COUNT when they do not match the ids', () => {
    // The titles are display-only and unverified; the ids are what get woven.
    // Naming two of five would have the member approve a five-pulse weave
    // believing it holds two, and this card IS the gate.
    const summary = describeWriteAction(
      'propose_promise_weave',
      baseArgs({
        pulseIds: ['a', 'b', 'c', 'd', 'e'],
        pulseTitles: ['One', 'Two'],
      })
    )
    expect(summary).toContain('holding 5 pulses')
    expect(summary).not.toContain('"One"')
  })

  it('says "1 pulse", not "1 pulses", on the count fallback', () => {
    const summary = describeWriteAction(
      'propose_promise_weave',
      baseArgs({ pulseIds: ['a'], pulseTitles: [] })
    )
    expect(summary).toContain('holding 1 pulse')
    expect(summary).not.toContain('1 pulses')
  })

  it('degrades to a usable sentence when the model passed no titles', () => {
    const summary = describeWriteAction('propose_promise_weave', {
      title: 'A weave',
      pulseIds: ['pulse_1'],
    })
    expect(summary).toContain('A weave')
    expect(summary).not.toContain('pulse_1')
  })

  it('offers the name and the reasoning for editing before approval, and no internal args', () => {
    expect(entityKindLabel('propose_promise_weave', baseArgs())).toBe(
      'weave proposal'
    )
    const fields = getEditableFields('propose_promise_weave', baseArgs())
    expect(fields.map((f) => f.fieldName)).toEqual(['title', 'why'])
    expect(fields.map((f) => f.fieldName)).not.toContain('contextId')
    expect(fields.map((f) => f.fieldName)).not.toContain('pulseIds')
  })
})

describe('hitl — propose_promise_weave writes a PROPOSAL, never an established weave', () => {
  it('persists status "proposed" and origin "ai" — the string "active" is never written', async () => {
    const { graph, calls } = buildGraph()
    await executeAuthorizedWriteTool(
      graph as never,
      USER_ID,
      'propose_promise_weave',
      baseArgs()
    )

    const write = weaveWrite(calls)
    expect(write).toBeDefined()
    expect(write!.cypher).toContain("status: 'proposed'")
    expect(write!.cypher).toContain("origin: 'ai'")
    // The only 'active' in the query is the dedup guard's status list, never a
    // value assigned to the new node.
    expect(write!.cypher).not.toContain("status: 'active'")
  })

  it('anchors the weave to its FieldContext in the same write — an unanchored weave is unreadable AND ungoverned', async () => {
    const { graph, calls } = buildGraph()
    await executeAuthorizedWriteTool(
      graph as never,
      USER_ID,
      'propose_promise_weave',
      baseArgs()
    )
    expect(weaveWrite(calls)!.cypher).toContain(
      'CREATE (context)-[:HAS_WEAVE]->(weave)'
    )
  })

  it('writes an activity Log attributed to the acting member (every mutation logs)', async () => {
    const { graph, calls } = buildGraph()
    await executeAuthorizedWriteTool(
      graph as never,
      USER_ID,
      'propose_promise_weave',
      baseArgs()
    )
    const write = weaveWrite(calls)!
    expect(write.cypher).toContain('CREATE (log:Log')
    expect(write.cypher).toContain('CREATE (log)-[:CREATED_BY]->(actor)')
    expect(write.params.currentUserId).toBe(USER_ID)
  })

  it('tells the member the weave is waiting on them, and names no id in the reply copy', async () => {
    const { graph } = buildGraph()
    const result = await executeAuthorizedWriteTool(
      graph as never,
      USER_ID,
      'propose_promise_weave',
      baseArgs()
    )

    expect(result.success).toBe(true)
    expect(result.awaitingReview).toBe(true)
    expect(result.status).toBe('Proposed')
    expect(String(result.message)).toMatch(/confirm or dismiss/i)
    expect(String(result.message)).toContain('Care Practices')
    expect(String(result.message)).not.toContain('ctx_')
    expect(String(result.message)).not.toContain('weave_')
    // Rule 3: the id may ride in the result, but a human label rides with it.
    expect(result.title).toBe('Keeping the house while they travel')
  })
})

describe('hitl — propose_promise_weave re-authorizes server-side', () => {
  it('refuses a caller who cannot edit the field, and writes NOTHING', async () => {
    const { graph, calls } = buildGraph({ allowed: false })
    const result = await executeAuthorizedWriteTool(
      graph as never,
      USER_ID,
      'propose_promise_weave',
      baseArgs()
    )

    expect(result.success).toBe(false)
    expect(weaveWrite(calls)).toBeUndefined()
    // Same refusal a non-member gets: never distinguish "you are a GUEST here"
    // from "no such field".
    expect(String(result.message)).toBe(
      'You can only propose promise weaves in fields you belong to.'
    )
  })

  it('refuses an unauthenticated caller before touching the graph', async () => {
    const { graph, calls } = buildGraph()
    const result = await executeAuthorizedWriteTool(
      graph as never,
      null,
      'propose_promise_weave',
      baseArgs()
    )
    expect(result.success).toBe(false)
    expect(calls).toHaveLength(0)
  })

  it('runs the edit gate BEFORE the write, not alongside it', async () => {
    const { graph, calls } = buildGraph()
    await executeAuthorizedWriteTool(
      graph as never,
      USER_ID,
      'propose_promise_weave',
      baseArgs()
    )
    expect(calls[0].cypher).toContain('RETURN ($currentUserId IN ownerIds')
    expect(calls[0].params.contextId).toBe(CONTEXT_ID)
  })

  it('reaches pulses and people only THROUGH the authorized context, so no id can weave across a Space boundary', async () => {
    const { graph, calls } = buildGraph()
    await executeAuthorizedWriteTool(
      graph as never,
      USER_ID,
      'propose_promise_weave',
      baseArgs()
    )
    const cypher = weaveWrite(calls)!.cypher
    // Each id is seeked on its index, then CONSTRAINED by an edge from the
    // already-cleared context — never taken on the strength of the id alone.
    expect(cypher).toContain('WHERE (context)-[:HAS_PULSE]->(pulse)')
    expect(cypher).toContain('(context)-[:HAS_PERSON]->(person:Person)')
    // Every id-anchored pulse match must sit inside the CALL block that
    // applies that edge check; a bare one outside it would let an id from
    // another Space through.
    const seeks = cypher.match(/MATCH \(pulse:FieldPulse \{id:/g) ?? []
    expect(seeks).toHaveLength(1)
    expect(cypher.indexOf('MATCH (pulse:FieldPulse {id:')).toBeLessThan(
      cypher.indexOf('WHERE (context)-[:HAS_PULSE]->(pulse)')
    )
  })

  it('reports a field-named refusal, not the ids, when every pulse is outside the field', async () => {
    const { graph } = buildGraph({
      weaveRow: defaultWeaveRow({
        weaveTitle: null,
        wovenForName: null,
        wovenPulseTitles: [],
      }),
    })
    const result = await executeAuthorizedWriteTool(
      graph as never,
      USER_ID,
      'propose_promise_weave',
      baseArgs()
    )

    expect(result.success).toBe(false)
    expect(String(result.message)).toContain('Care Practices')
    expect(String(result.message)).not.toContain('pulse_')
  })

  it('rejects an empty pulse set before reaching the graph — a weave holds something', async () => {
    const { graph, calls } = buildGraph()
    const result = await executeAuthorizedWriteTool(
      graph as never,
      USER_ID,
      'propose_promise_weave',
      baseArgs({ pulseIds: [] })
    )
    expect(result.success).toBe(false)
    expect(calls).toHaveLength(0)
  })

  it('dedupes and caps the pulse ids the write sees', async () => {
    const { graph, calls } = buildGraph()
    await executeAuthorizedWriteTool(
      graph as never,
      USER_ID,
      'propose_promise_weave',
      baseArgs({
        pulseIds: [
          'p1',
          'p1',
          ' p2 ',
          '',
          'p3',
          'p4',
          'p5',
          'p6',
          'p7',
          'p8',
          'p9',
          'p10',
          'p11',
        ],
      })
    )
    const sent = weaveWrite(calls)!.params.pulseIds as string[]
    expect(sent).toHaveLength(10)
    expect(sent).toContain('p2')
    expect(new Set(sent).size).toBe(sent.length)
  })
})

describe('hitl — propose_promise_weave is idempotent against a live weave', () => {
  it('reports an ESTABLISHED weave by its own name rather than minting a duplicate', async () => {
    const { graph } = buildGraph({
      weaveRow: defaultWeaveRow({
        alreadyWoven: true,
        existingTitle: 'The housesitting fortnight',
        existingStatus: 'active',
      }),
    })
    const result = await executeAuthorizedWriteTool(
      graph as never,
      USER_ID,
      'propose_promise_weave',
      baseArgs()
    )

    expect(result.success).toBe(true)
    expect(result.alreadyWoven).toBe(true)
    expect(result.awaitingReview).toBe(false)
    // The EXISTING weave's name, not the proposal's — otherwise the model is
    // handed a weave name the graph does not hold, and will speak it.
    expect(result.title).toBe('The housesitting fortnight')
    expect(String(result.message)).toContain('The housesitting fortnight')
    expect(String(result.message)).toContain('already woven together')
  })

  it('does NOT call an unconfirmed proposal "already woven" — it says it is still waiting', async () => {
    const { graph } = buildGraph({
      weaveRow: defaultWeaveRow({
        alreadyWoven: true,
        existingTitle: 'The housesitting fortnight',
        existingStatus: 'proposed',
      }),
    })
    const result = await executeAuthorizedWriteTool(
      graph as never,
      USER_ID,
      'propose_promise_weave',
      baseArgs()
    )

    // The whole slice exists to stop a proposal being narrated as an agreed
    // connection. This branch skips the create, so it is the one place that
    // could report "already woven together" about a weave nobody confirmed.
    expect(result.awaitingReview).toBe(true)
    expect(result.status).toBe('Proposed')
    expect(String(result.message)).not.toContain('already woven together')
    expect(String(result.message)).toMatch(/waiting on your confirm/i)
  })

  it('falls back to a pulse title when the existing weave is untitled — never an id', async () => {
    const { graph } = buildGraph({
      weaveRow: defaultWeaveRow({
        alreadyWoven: true,
        existingTitle: null,
        existingStatus: 'active',
      }),
    })
    const result = await executeAuthorizedWriteTool(
      graph as never,
      USER_ID,
      'propose_promise_weave',
      baseArgs()
    )
    expect(result.title).toBe('Water the plants')
    expect(String(result.message)).not.toContain('weave_')
  })

  it('skips only DISSOLVED weaves, so an unknown legacy status still reads as live (parity with normalizeWeaveStatus)', async () => {
    const { graph, calls } = buildGraph()
    await executeAuthorizedWriteTool(
      graph as never,
      USER_ID,
      'propose_promise_weave',
      baseArgs()
    )
    const write = weaveWrite(calls)!
    // An EXCLUSION, not an allow-list: an allow-list of the live statuses would
    // classify an unrecognised legacy value as not-live, while every reader in
    // the app treats an unknown value as active.
    expect(write.cypher).toContain('NOT toLower(trim(coalesce(existing.status')
    expect(write.cypher).toContain('IN $notLiveStatuses')
    expect(write.params.notLiveStatuses).toEqual(NOT_LIVE_WEAVE_STATUSES)
  })
})

describe('hitl — propose_promise_weave reports what it left out', () => {
  it('still creates the weave over what DID match, and says how many were dropped', async () => {
    const { graph } = buildGraph({
      weaveRow: defaultWeaveRow({ wovenPulseTitles: ['Water the plants'] }),
    })
    const result = await executeAuthorizedWriteTool(
      graph as never,
      USER_ID,
      'propose_promise_weave',
      baseArgs()
    )

    expect(result.success).toBe(true)
    expect(String(result.message)).toContain('I left out 1 pulse that is not in')
  })

  it('pluralises the dropped-pulse note', async () => {
    const { graph } = buildGraph({
      weaveRow: defaultWeaveRow({ wovenPulseTitles: ['Water the plants'] }),
    })
    const result = await executeAuthorizedWriteTool(
      graph as never,
      USER_ID,
      'propose_promise_weave',
      baseArgs({ pulseIds: ['pulse_water', 'pulse_key', 'pulse_third'] })
    )
    expect(String(result.message)).toContain(
      'I left out 2 pulses that are not in'
    )
  })

  it('counts ids the CAP dropped as left out too, not silently', async () => {
    const { graph } = buildGraph({
      weaveRow: defaultWeaveRow({ wovenPulseTitles: ['Water the plants'] }),
    })
    const result = await executeAuthorizedWriteTool(
      graph as never,
      USER_ID,
      'propose_promise_weave',
      baseArgs({
        pulseIds: Array.from({ length: 12 }, (_, i) => `pulse_id_${i}`),
      })
    )
    // 12 requested, 1 woven — the 2 beyond the cap of 10 are still left out.
    expect(String(result.message)).toContain('I left out 11 pulses')
  })

  it('mentions the dropped pulses on the already-woven branch too', async () => {
    const { graph } = buildGraph({
      weaveRow: defaultWeaveRow({
        alreadyWoven: true,
        existingTitle: 'The housesitting fortnight',
        existingStatus: 'active',
        wovenPulseTitles: ['Water the plants'],
      }),
    })
    const result = await executeAuthorizedWriteTool(
      graph as never,
      USER_ID,
      'propose_promise_weave',
      baseArgs()
    )
    expect(String(result.message)).toContain('I left out 1 pulse')
  })
})

describe('hitl — propose_promise_weave degrades safely', () => {
  it('reports a missing field rather than throwing when the write returns no rows', async () => {
    const { graph } = buildGraph({ weaveRow: null })
    const result = await executeAuthorizedWriteTool(
      graph as never,
      USER_ID,
      'propose_promise_weave',
      baseArgs()
    )
    expect(result.success).toBe(false)
    expect(String(result.message)).toBe(
      'I could not find that field to weave in.'
    )
  })

  it('refuses without an anchor field, before touching the graph', async () => {
    const { graph, calls } = buildGraph()
    const result = await executeAuthorizedWriteTool(
      graph as never,
      USER_ID,
      'propose_promise_weave',
      baseArgs({ contextId: '' })
    )
    expect(result.success).toBe(false)
    expect(String(result.message)).toMatch(/Open a field first/)
    expect(calls).toHaveLength(0)
  })
})

describe('hitl — the approval card is described by the GRAPH, not the model', () => {
  /**
   * `resolveWeaveProposalDisplay` exists because the card IS the gate. Left to
   * the model, `pulseTitles` and `wovenForName` are unverified strings that
   * nothing cross-checks against the ids being woven — text reaching the model
   * from a field or an ingested document could have it name two pulses while
   * the write touches ten.
   */
  function displayGraph({
    allowed = true,
    row,
  }: { allowed?: boolean; row?: Record<string, unknown> } = {}) {
    const calls: QueryCall[] = []
    const graph = {
      query: jest.fn(async (cypher: string, params: Record<string, unknown>) => {
        calls.push({ cypher, params })
        if (cypher.includes('RETURN ($currentUserId IN ownerIds')) {
          return [{ allowed }]
        }
        return [
          row ?? {
            pulseTitles: ['Water the plants', 'Spare key with Tom'],
            wovenForName: 'Sarah Chen',
          },
        ]
      }),
    }
    return { graph, calls }
  }

  it('resolves the titles and the name from the graph', async () => {
    const { graph } = displayGraph()
    const display = await resolveWeaveProposalDisplay(graph as never, USER_ID, {
      contextId: CONTEXT_ID,
      pulseIds: ['pulse_water', 'pulse_key'],
      wovenForPersonId: 'person_sarah',
    })
    expect(display.pulseTitles).toEqual(['Water the plants', 'Spare key with Tom'])
    expect(display.wovenForName).toBe('Sarah Chen')
  })

  it('gates on canEditContext BEFORE reading titles — contextId comes off the request body', async () => {
    const { graph, calls } = displayGraph({ allowed: false })
    const display = await resolveWeaveProposalDisplay(graph as never, USER_ID, {
      contextId: CONTEXT_ID,
      pulseIds: ['pulse_water'],
    })
    // Reading titles out of an arbitrary contextId would itself be the leak.
    expect(display.pulseTitles).toEqual([])
    expect(calls).toHaveLength(1)
    expect(calls[0].cypher).toContain('RETURN ($currentUserId IN ownerIds')
  })

  it('omits the person entirely when they are not on the roster, so the card cannot promise them', async () => {
    const { graph } = displayGraph({
      row: { pulseTitles: ['Water the plants'], wovenForName: null },
    })
    const display = await resolveWeaveProposalDisplay(graph as never, USER_ID, {
      contextId: CONTEXT_ID,
      pulseIds: ['pulse_water'],
      wovenForPersonId: 'person_stranger',
    })
    expect(display.wovenForName).toBeUndefined()
    // The model asked for the weave to be "for Sarah Chen". Because she is not
    // on this field's roster, the resolved card must not say so — where the
    // model-supplied string would have.
    const modelSupplied = describeWriteAction('propose_promise_weave', {
      title: 'A weave',
      pulseIds: ['pulse_water'],
      wovenForName: 'Sarah Chen',
    })
    const resolved = describeWriteAction('propose_promise_weave', {
      title: 'A weave',
      pulseIds: ['pulse_water'],
      ...display,
    })
    expect(modelSupplied).toContain('for Sarah Chen')
    expect(resolved).not.toContain('Sarah Chen')
  })

  it('refuses to read anything without an authenticated caller', async () => {
    const { graph, calls } = displayGraph()
    const display = await resolveWeaveProposalDisplay(graph as never, null, {
      contextId: CONTEXT_ID,
      pulseIds: ['pulse_water'],
    })
    expect(display.pulseTitles).toEqual([])
    expect(calls).toHaveLength(0)
  })
})

describe('hitl — propose_promise_weave says when it dropped the person', () => {
  it('reports an off-roster person instead of quietly weaving for nobody', async () => {
    const { graph } = buildGraph({
      weaveRow: defaultWeaveRow({ wovenForName: null, wovenForDropped: true }),
    })
    const result = await executeAuthorizedWriteTool(
      graph as never,
      USER_ID,
      'propose_promise_weave',
      baseArgs()
    )
    // The card said "for <name>". Silence here would let a success message
    // imply that promise was kept.
    expect(result.success).toBe(true)
    expect(String(result.message)).toContain('not on this field\'s roster')
  })

  it('says nothing about the person when one was woven', async () => {
    const { graph } = buildGraph()
    const result = await executeAuthorizedWriteTool(
      graph as never,
      USER_ID,
      'propose_promise_weave',
      baseArgs()
    )
    expect(String(result.message)).not.toContain('roster')
  })
})

describe('hitl — the propose Cypher stays syntactically safe', () => {
  it('contains no backtick — one inside the template literal terminates it and 500s every route that imports this file', async () => {
    const { graph, calls } = buildGraph()
    await executeAuthorizedWriteTool(
      graph as never,
      USER_ID,
      'propose_promise_weave',
      baseArgs()
    )
    // This has broken the build twice: a backtick in a Cypher COMMENT ends the
    // JS template string, and the failure surfaces as an unrelated TS parse
    // error dozens of lines away.
    expect(weaveWrite(calls)!.cypher).not.toContain('`')
  })

  it('dedupes on an IDENTICAL pulse set, not a superset', async () => {
    const { graph, calls } = buildGraph()
    await executeAuthorizedWriteTool(
      graph as never,
      USER_ID,
      'propose_promise_weave',
      baseArgs()
    )
    // Containment alone refuses a single-pulse proposal whenever ANY live
    // weave happens to touch that pulse — and migration-built weaves wrap
    // single care points, so migrated fields would be the worst hit.
    expect(weaveWrite(calls)!.cypher).toContain(
      'size([(existing)-[:WEAVES]->(x) | x]) = size(pulses)'
    )
  })

  it('seeks each pulse id on its index rather than expanding every HAS_PULSE in the field', async () => {
    const { graph, calls } = buildGraph()
    await executeAuthorizedWriteTool(
      graph as never,
      USER_ID,
      'propose_promise_weave',
      baseArgs()
    )
    const cypher = weaveWrite(calls)!.cypher
    expect(cypher).toContain('UNWIND $pulseIds AS wantedId')
    expect(cypher).toContain('OPTIONAL MATCH (pulse:FieldPulse {id: wantedId})')
    // DISTINCT is load-bearing: without it a repeated id duplicates a title.
    expect(cypher).toContain('collect(DISTINCT pulse)')
  })
})
