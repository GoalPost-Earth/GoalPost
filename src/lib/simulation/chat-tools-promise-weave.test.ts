import { buildSimulationChatTools } from './chat-tools'
import { SYSTEM_PROMPTS } from './system-prompts'

/**
 * The assistant could not answer a single question about promise weaves: no
 * tool in `buildSimulationChatTools` knew the `:PromiseWeave` label, so "what
 * promise weaves do I have?" fell through to `search_pulse` /
 * `search_field_context`, which searched pulse text for the literal words and
 * reported nothing while the member's weaves sat in the graph. Only
 * `query_for_bloom` could reach them, and only if the member asked for the
 * canvas.
 *
 * These pin the three things that fix depends on: the tool EXISTS on every
 * surface, it does not force-inject the active scope (the GOAL-300 discipline
 * `chat-tools-scope.test.ts` covers for the other search tools), and every
 * mode prompt routes weave language to it rather than to `search_pulse`.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
const searchPromiseWeaves = jest.fn((..._args: unknown[]) =>
  Promise.resolve({ found: false, count: 0, weaves: [], message: '' })
)
/* eslint-enable @typescript-eslint/no-unused-vars */

const canViewContent = jest.fn(async () => true)

jest.mock('@/modules/agent/tools/promise-weave/promise-weave.service', () => ({
  searchPromiseWeaves: (...args: unknown[]) => searchPromiseWeaves(...args),
}))
jest.mock('@/modules/graph', () => ({
  initGraph: jest.fn(async () => ({ query: jest.fn() })),
}))
jest.mock('@/lib/permissions/space-permissions', () => ({
  canViewContent: () => canViewContent(),
}))
jest.mock('@/lib/neo4j/driver', () => ({
  driver: {
    session: jest.fn(() => ({ close: jest.fn(async () => undefined) })),
  },
}))
jest.mock('@/lib/llm/adapters/langchain-adapter', () => ({
  getLangChainEmbeddings: jest.fn(() => ({})),
}))

const USER_ID = 'person_weave'
const ACTIVE_SPACE = 'ws_active'
const ACTIVE_FIELD = 'ctx_active'

function buildTools(
  overrides: Partial<Parameters<typeof buildSimulationChatTools>[0]> = {}
) {
  return buildSimulationChatTools({
    currentUserId: USER_ID,
    spaceId: ACTIVE_SPACE,
    fieldContextId: ACTIVE_FIELD,
    focalEntity: null,
    approvedActionHashes: new Set<string>(),
    spaceName: 'Active Space',
    spaceType: 'WeSpace',
    fieldContextTitle: 'Active Field',
    canvasView: null,
    canvasVisibleEntities: [],
    ...overrides,
  })
}

/* eslint-disable @typescript-eslint/no-explicit-any */
async function runTool(tool: any, input: unknown) {
  return tool.execute(input, { toolCallId: 't', messages: [] })
}
/* eslint-enable @typescript-eslint/no-explicit-any */

beforeEach(() => {
  searchPromiseWeaves.mockClear()
  canViewContent.mockClear()
  canViewContent.mockResolvedValue(true)
})

describe('search_promise_weave — registration', () => {
  it('is registered with an active field and Space', async () => {
    const tools = await buildTools()
    expect(tools.search_promise_weave).toBeDefined()
  })

  it('is registered on a neutral surface too — weaves are not field-gated', async () => {
    const tools = await buildTools({ spaceId: null, fieldContextId: null })
    expect(tools.search_promise_weave).toBeDefined()
  })
})

describe('search_promise_weave — scope and authorization', () => {
  it('answers the bare "what promise weaves do I have?" with no scope at all', async () => {
    const tools = await buildTools()
    await runTool(tools.search_promise_weave, {})

    expect(searchPromiseWeaves).toHaveBeenCalledTimes(1)
    const arg = searchPromiseWeaves.mock.calls[0][1] as Record<string, unknown>
    // The active field/Space are NOT force-injected (GOAL-300 discipline), so
    // the lookup fans out across every field the member can access.
    expect(arg.contextId).toBeUndefined()
    expect(arg.spaceId).toBeUndefined()
    expect(arg.query).toBeUndefined()
    expect(arg.userId).toBe(USER_ID)
  })

  it('does not inject the active scope for a keyword search either', async () => {
    const tools = await buildTools()
    await runTool(tools.search_promise_weave, { query: 'cotton' })

    const arg = searchPromiseWeaves.mock.calls[0][1] as Record<string, unknown>
    expect(arg.contextId).toBeUndefined()
    expect(arg.spaceId).toBeUndefined()
    expect(arg.query).toBe('cotton')
  })

  it('honors an explicitly-provided field and Space scope', async () => {
    const tools = await buildTools()
    await runTool(tools.search_promise_weave, {
      contextId: 'ctx_explicit',
      spaceId: 'ws_explicit',
    })

    const arg = searchPromiseWeaves.mock.calls[0][1] as Record<string, unknown>
    expect(arg.contextId).toBe('ctx_explicit')
    expect(arg.spaceId).toBe('ws_explicit')
  })

  it('refuses a Space the member cannot view, without querying', async () => {
    canViewContent.mockResolvedValue(false)
    const tools = await buildTools()

    const result = await runTool(tools.search_promise_weave, {
      spaceId: 'ws_forbidden',
    })

    expect(result).toEqual({
      status: 'error',
      message: 'You do not have access to that Space.',
    })
    expect(searchPromiseWeaves).not.toHaveBeenCalled()
  })

  it('forwards a null userId so the service fails closed', async () => {
    const tools = await buildTools({ currentUserId: null })
    await runTool(tools.search_promise_weave, {})

    const arg = searchPromiseWeaves.mock.calls[0][1] as Record<string, unknown>
    expect(arg.userId).toBeNull()
  })
})

describe('mode prompts route weave language to the weave tool', () => {
  const modes = ['default', 'aiden', 'braider'] as const

  it.each(modes)('%s names search_promise_weave', (mode) => {
    expect(SYSTEM_PROMPTS[mode]).toContain('search_promise_weave')
  })

  it.each(modes)(
    '%s says a weave is not a pulse, so search_pulse cannot find one',
    (mode) => {
      expect(SYSTEM_PROMPTS[mode]).toContain('PROMISE WEAVES ARE NOT PULSES')
    }
  )
})
