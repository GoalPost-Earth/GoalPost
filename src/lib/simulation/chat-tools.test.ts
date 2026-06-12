import { buildSimulationChatTools } from './chat-tools'

/**
 * GOAL-258 regression — `list_field_contexts_in_active_space` must coerce
 * per-context pulse counts correctly.
 *
 * LangChain's `Neo4jGraph.query` stringifies every Neo4j integer (isInt →
 * item.toString()), so a Cypher `count(p)` arrives as a DECIMAL STRING like
 * "5" — not a number and not a `{ low, high }` object. The original coercion
 * `Number(fc.pulseCount?.low ?? 0)` read `"5".low === undefined` and collapsed
 * every count to 0, so the space-wide total was always 0. The fix uses
 * `Number(fc.pulseCount || 0)` and sums a `totalPulses` field.
 *
 * This test mocks `initGraph` so `graph.query` returns the LangChain-shaped
 * payload (string pulseCounts) and asserts the tool returns numeric counts and
 * a correct `totalPulses`. It is fully hermetic — no Neo4j, no OpenAI.
 */

// initGraph().query(...) is the only graph surface the tool touches.
const queryMock = jest.fn()
jest.mock('@/modules/graph', () => ({
  initGraph: jest.fn(async () => ({ query: queryMock })),
}))

// assertCanViewSpace calls canViewContent(session, userId, spaceId); permit it.
jest.mock('@/lib/permissions/space-permissions', () => ({
  canViewContent: jest.fn(async () => true),
}))

// assertCanViewSpace opens a driver session purely for the permission check;
// give it a no-op session so the execute path runs without a real DB.
jest.mock('@/lib/neo4j/driver', () => ({
  driver: {
    session: jest.fn(() => ({
      close: jest.fn(async () => undefined),
    })),
  },
}))

// buildSimulationChatTools calls getLangChainEmbeddings() at construction time;
// stub it so we don't reach into the real OpenAI adapter.
jest.mock('@/lib/llm/adapters/langchain-adapter', () => ({
  getLangChainEmbeddings: jest.fn(() => ({})),
}))

const SPACE_ID = 'me_goal258'
const USER_ID = 'person_goal258'

const baseContext = () => ({
  currentUserId: USER_ID,
  spaceId: SPACE_ID,
  fieldContextId: null,
  focalEntity: null,
  approvedActionHashes: new Set<string>(),
  spaceName: "John-Dag's Space",
  spaceType: 'MeSpace' as const,
  fieldContextTitle: null,
  canvasView: null,
  canvasVisibleEntities: [],
})

describe('GOAL-258 — list_field_contexts_in_active_space pulse-count coercion', () => {
  beforeEach(() => {
    queryMock.mockReset()
  })

  it('coerces STRING pulseCounts (as LangChain emits them) to numbers and sums totalPulses', async () => {
    // LangChain's Neo4jGraph.query returns Neo4j integers as decimal STRINGS.
    queryMock.mockResolvedValue([
      {
        spaceName: "John-Dag's Space",
        fieldContexts: [
          {
            id: 'ctx_a',
            title: 'Empty Field',
            emergentName: null,
            pulseCount: '0',
          },
          {
            id: 'ctx_b',
            title: 'One Pulse',
            emergentName: 'Beginnings',
            pulseCount: '1',
          },
          {
            id: 'ctx_c',
            title: 'Five Pulses',
            emergentName: 'Momentum',
            pulseCount: '5',
          },
        ],
      },
    ])

    const tools = await buildSimulationChatTools(baseContext())
    const tool = tools.list_field_contexts_in_active_space
    expect(tool).toBeDefined()

    const result = await tool!.execute!(
      {},
      // The AI SDK passes a ToolExecutionOptions arg; the tool ignores it.
      { toolCallId: 'call_1', messages: [] } as never
    )

    // Narrow off the error branch.
    expect(result).toMatchObject({ status: 'ok' })
    if (
      typeof result !== 'object' ||
      result === null ||
      !('fieldContexts' in result)
    ) {
      throw new Error('expected an ok result with fieldContexts')
    }

    const ok = result as {
      status: 'ok'
      count: number
      totalPulses: number
      fieldContexts: Array<{
        id: string
        pulseCount: number
      }>
    }

    // Each per-context count must be a NUMBER matching [0, 1, 5] — not 0.
    expect(ok.fieldContexts.map((fc) => fc.pulseCount)).toEqual([0, 1, 5])
    for (const fc of ok.fieldContexts) {
      expect(typeof fc.pulseCount).toBe('number')
    }

    // The space-wide total is the sum: 0 + 1 + 5 = 6 (the regression value
    // would have been 0).
    expect(ok.totalPulses).toBe(6)
    expect(typeof ok.totalPulses).toBe('number')

    expect(ok.count).toBe(3)
  })

  it('is only registered when an active Space is in session context', async () => {
    const tools = await buildSimulationChatTools({
      ...baseContext(),
      spaceId: null,
    })
    expect(tools.list_field_contexts_in_active_space).toBeUndefined()
  })
})
