import { buildSimulationChatTools } from './chat-tools'

/**
 * GOAL-300 regression — the assistant search tools must fan out across ALL of
 * the member's accessible fields by default. The bug: search_pulse /
 * search_field_context / graph_rag_search silently injected the active session
 * scope (ctx.fieldContextId / ctx.spaceId), confining a general query like
 * "What is the Artisans Cooperative?" to the one active field and missing
 * matches in the member's other accessible fields.
 *
 * These tests build the tools with an ACTIVE field + space in context, invoke
 * each search tool with only a query, and assert the underlying service is
 * called WITHOUT a contextId/spaceId — i.e. the active scope is no longer
 * force-injected. Authorization is unaffected: the services stay $userId-gated.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
const searchPulses = jest.fn((..._args: unknown[]) =>
  Promise.resolve({
    found: false,
    count: 0,
    pulses: [],
    needsDisambiguation: false,
    message: '',
  })
)
const searchFieldContexts = jest.fn((..._args: unknown[]) =>
  Promise.resolve({
    found: false,
    count: 0,
    contexts: [],
    needsDisambiguation: false,
    message: '',
  })
)
const graphRagSearch = jest.fn((..._args: unknown[]) =>
  Promise.resolve({ results: [] })
)
/* eslint-enable @typescript-eslint/no-unused-vars */

jest.mock('@/modules/agent/tools/pulse/pulse.service', () => ({
  searchPulses: (...args: unknown[]) => searchPulses(...args),
}))
jest.mock('@/modules/agent/tools/field-context/field-context.service', () => ({
  searchFieldContexts: (...args: unknown[]) => searchFieldContexts(...args),
}))
jest.mock('@/modules/agent/tools/rag/graph-rag.service', () => ({
  graphRagSearch: (...args: unknown[]) => graphRagSearch(...args),
}))

jest.mock('@/modules/graph', () => ({
  initGraph: jest.fn(async () => ({ query: jest.fn() })),
}))
jest.mock('@/lib/permissions/space-permissions', () => ({
  canViewContent: jest.fn(async () => true),
}))
jest.mock('@/lib/neo4j/driver', () => ({
  driver: {
    session: jest.fn(() => ({ close: jest.fn(async () => undefined) })),
  },
}))
jest.mock('@/lib/llm/adapters/langchain-adapter', () => ({
  getLangChainEmbeddings: jest.fn(() => ({})),
}))

const USER_ID = 'person_goal300'
const ACTIVE_SPACE = 'ws_active'
const ACTIVE_FIELD = 'ctx_active'

function toolsWithActiveScope() {
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
  })
}

/* eslint-disable @typescript-eslint/no-explicit-any */
async function runTool(tool: any, input: unknown) {
  return tool.execute(input, { toolCallId: 't', messages: [] })
}
/* eslint-enable @typescript-eslint/no-explicit-any */

beforeEach(() => {
  searchPulses.mockClear()
  searchFieldContexts.mockClear()
  graphRagSearch.mockClear()
})

describe('GOAL-300 — search tools do not force the active scope', () => {
  it('search_pulse searches all accessible fields (contextId undefined) when the user names no field', async () => {
    const tools = await toolsWithActiveScope()
    await runTool(tools.search_pulse, { query: 'Artisans Cooperative' })

    expect(searchPulses).toHaveBeenCalledTimes(1)
    const arg = searchPulses.mock.calls[0][1] as Record<string, unknown>
    expect(arg.contextId).toBeUndefined()
    expect(arg.userId).toBe(USER_ID)
  })

  it('search_pulse still honors an explicitly-provided contextId', async () => {
    const tools = await toolsWithActiveScope()
    await runTool(tools.search_pulse, {
      query: 'x',
      contextId: 'ctx_explicit',
    })

    const arg = searchPulses.mock.calls[0][1] as Record<string, unknown>
    expect(arg.contextId).toBe('ctx_explicit')
  })

  it('search_field_context searches all accessible spaces (spaceId undefined) by default', async () => {
    const tools = await toolsWithActiveScope()
    await runTool(tools.search_field_context, { query: 'Artisans' })

    expect(searchFieldContexts).toHaveBeenCalledTimes(1)
    const arg = searchFieldContexts.mock.calls[0][1] as Record<string, unknown>
    expect(arg.spaceId).toBeUndefined()
    expect(arg.userId).toBe(USER_ID)
  })

  it('graph_rag_search searches all accessible fields (contextId undefined) by default', async () => {
    const tools = await toolsWithActiveScope()
    await runTool(tools.graph_rag_search, { query: 'Artisans Cooperative' })

    expect(graphRagSearch).toHaveBeenCalledTimes(1)
    const arg = graphRagSearch.mock.calls[0][2] as Record<string, unknown>
    expect(arg.contextId).toBeUndefined()
    expect(arg.userId).toBe(USER_ID)
  })
})

/**
 * Regression for the captured AI-quality failure behind
 * feedback_32f2ee28-... : a raw Neo4j "LIMIT: Invalid input. '25.0' ..." error
 * reached the model, which paraphrased it into member-facing copy ("a
 * search-tool limit error on this surface") — a technical failure no
 * participant could make sense of. kb/07 Rule 1: internal artifacts (Cypher /
 * Neo4j error text) must NEVER appear in chat. The tool's catch path must hand
 * the model a clean, member-safe message, keeping the technical detail in the
 * server log only.
 */
describe('tool errors are sanitized before reaching the model (kb/07 Rule 1)', () => {
  it('search_pulse maps a raw Neo4j LIMIT crash to member-safe copy', async () => {
    // Reproduce the exact exception from the captured transcript.
    searchPulses.mockImplementationOnce(() =>
      Promise.reject(
        new Error(
          "LIMIT: Invalid input. '25.0' is not a valid value. Must be a non-negative integer."
        )
      )
    )
    const tools = await toolsWithActiveScope()
    const result = (await runTool(tools.search_pulse, {
      query: 'value',
      pulseType: 'CoreValuePulse',
    })) as { status: string; message: string }

    expect(result.status).toBe('error')
    // The raw technical internals must NOT reach the model.
    expect(result.message).not.toMatch(/LIMIT/i)
    expect(result.message).not.toContain('25.0')
    expect(result.message).not.toMatch(/valid value/i)
    // What the model DOES get is clean, non-technical, retry-friendly copy.
    expect(result.message).toMatch(/try again/i)
  })
})
