import type { Neo4jGraph } from '@langchain/community/graphs/neo4j_graph'
import { searchPromiseWeaves } from './promise-weave.service'

/**
 * A promise weave is a connector node, not a pulse, so `searchPulses` is blind
 * to it. Before `searchPromiseWeaves` the assistant had no weave-aware read
 * tool at all and answered "what promise weaves do I have?" by searching pulse
 * text for the literal words — reporting nothing while the member's weaves sat
 * in the graph. These pin the parts of the replacement that are easy to
 * regress: the fail-closed gate, the `:PromiseWeave`/`HAS_WEAVE` anchor, the
 * unscoped enumeration the reported question needs, and the status rules from
 * kb/04-state-machines.md.
 *
 * Hermetic: `graph.query` is a jest mock, so no Neo4j is involved.
 */

const queryMock = jest.fn()
const graph = { query: queryMock } as unknown as Neo4jGraph

const USER_ID = 'person_weave_test'

function row(overrides: Record<string, unknown> = {}) {
  return {
    id: 'weave_1',
    title: 'Spinning Cotton into Yarn',
    description: 'The two makers share the same wheel.',
    status: 'active',
    origin: 'user',
    createdAt: '2026-08-31T14:30:37Z',
    modifiedAt: null,
    wovenForName: 'Ama Boateng',
    createdByName: 'Mastress',
    contextTitles: ['My migrated content'],
    spaceNames: ["Mastress's Space"],
    wovenPulseTitles: ['Hand Make Our Wardrobe', 'Raw Natural Materials'],
    ...overrides,
  }
}

beforeEach(() => {
  queryMock.mockReset()
})

describe('searchPromiseWeaves — authorization', () => {
  it('fails closed without an authenticated caller', async () => {
    const result = await searchPromiseWeaves(graph, { userId: null })

    expect(result.found).toBe(false)
    expect(result.count).toBe(0)
    expect(result.weaves).toEqual([])
    // Never reaches Neo4j — an unauthenticated caller cannot enumerate weaves.
    expect(queryMock).not.toHaveBeenCalled()
  })

  it('fails closed on a whitespace-only userId', async () => {
    const result = await searchPromiseWeaves(graph, { userId: '   ' })

    expect(result.found).toBe(false)
    expect(queryMock).not.toHaveBeenCalled()
  })

  it('binds the caller to $currentUserId and gates on Space reach', async () => {
    queryMock.mockResolvedValue([row()])

    await searchPromiseWeaves(graph, { userId: USER_ID })

    const [cypher, params] = queryMock.mock.calls[0]
    expect(params.currentUserId).toBe(USER_ID)
    // The reach test the type's @authorization READ filter would apply — raw
    // Cypher does not inherit it, so it must be restated in the query.
    expect(cypher).toContain('OWNS')
    expect(cypher).toContain('HAS_MEMBER')
    expect(cypher).toContain('IS_MEMBER')
    expect(cypher).toContain('$currentUserId')
  })

  it('re-gates the pulses a weave WEAVES, which cross Space boundaries', async () => {
    queryMock.mockResolvedValue([row()])

    await searchPromiseWeaves(graph, { userId: USER_ID })

    const [cypher] = queryMock.mock.calls[0]
    const wovenPulseMatch = cypher.slice(cypher.indexOf('[:WEAVES]->(pulse'))
    expect(wovenPulseMatch).toContain('pulseSpace')
    expect(wovenPulseMatch).toContain('$currentUserId')
  })

  it('reads through HAS_CONTEXT so soft-deleted fields drop out', async () => {
    queryMock.mockResolvedValue([row()])

    await searchPromiseWeaves(graph, { userId: USER_ID })

    const [cypher] = queryMock.mock.calls[0]
    expect(cypher).toContain('HAS_CONTEXT')
    // Deletion re-points the edge to HAS_DELETED_CONTEXT (GOAL-319); matching
    // the live edge by name is what keeps a deleted field's weaves hidden.
    expect(cypher).not.toContain('HAS_DELETED_CONTEXT')
  })
})

describe('searchPromiseWeaves — the query search_pulse could never answer', () => {
  it('anchors on the :PromiseWeave label via HAS_WEAVE, not on :FieldPulse', async () => {
    queryMock.mockResolvedValue([row()])

    await searchPromiseWeaves(graph, { userId: USER_ID })

    const [cypher] = queryMock.mock.calls[0]
    expect(cypher).toContain(':PromiseWeave')
    expect(cypher).toContain(':HAS_WEAVE')
    expect(cypher).toContain('MATCH (weave:PromiseWeave)')
  })

  it('enumerates with NO scope — "what promise weaves do I have?"', async () => {
    queryMock.mockResolvedValue([row(), row({ id: 'weave_2' })])

    const result = await searchPromiseWeaves(graph, { userId: USER_ID })

    // Unlike searchPulses, a bare blank query is NOT refused: the reported
    // question carries no field, Space or type to narrow by.
    expect(queryMock).toHaveBeenCalled()
    expect(result.found).toBe(true)
    expect(result.count).toBe(2)
  })

  it('matches a woven pulse title and the woven-for person in keyword mode', async () => {
    queryMock.mockResolvedValue([row()])

    await searchPromiseWeaves(graph, { userId: USER_ID, query: 'cotton' })

    const [cypher, params] = queryMock.mock.calls[0]
    expect(params.query).toBe('cotton')
    // An untitled weave DISPLAYS as its first woven pulse, so a member
    // searching the name on the card has to be able to find it.
    expect(cypher).toContain('[:WEAVES]->(qp:FieldPulse)')
    expect(cypher).toContain('[:WOVEN_FOR]->(qf:Person)')
    expect(cypher).toContain('weave.description')
  })

  it('passes every scope through as a bound parameter', async () => {
    queryMock.mockResolvedValue([])

    await searchPromiseWeaves(graph, {
      userId: USER_ID,
      contextId: 'ctx_1',
      contextTitle: 'Care',
      spaceId: 'me_1',
      spaceName: 'Mastress',
      limit: 5,
    })

    const [cypher, params] = queryMock.mock.calls[0]
    expect(params).toMatchObject({
      contextId: 'ctx_1',
      contextTitle: 'Care',
      spaceId: 'me_1',
      spaceName: 'Mastress',
      limit: 5,
    })
    // LIMIT with a JS number crashes Neo4j ("'5.0' is not a valid value").
    expect(cypher).toContain('LIMIT toInteger($limit)')
  })

  it('clamps the limit to the 1..25 window', async () => {
    queryMock.mockResolvedValue([])

    await searchPromiseWeaves(graph, { userId: USER_ID, limit: 500 })
    expect(queryMock.mock.calls[0][1].limit).toBe(25)

    await searchPromiseWeaves(graph, { userId: USER_ID, limit: 0 })
    expect(queryMock.mock.calls[1][1].limit).toBe(10)
  })
})

describe('searchPromiseWeaves — model-facing shape (kb/07)', () => {
  it('carries a human-readable title alongside the id', async () => {
    queryMock.mockResolvedValue([row()])

    const { weaves } = await searchPromiseWeaves(graph, { userId: USER_ID })

    expect(weaves[0]).toMatchObject({
      id: 'weave_1',
      title: 'Spinning Cotton into Yarn',
      wovenForName: 'Ama Boateng',
      contextTitles: ['My migrated content'],
      spaceNames: ["Mastress's Space"],
    })
  })

  it('falls back to the first woven pulse title, never to the id', async () => {
    queryMock.mockResolvedValue([row({ title: '   ' })])

    const { weaves } = await searchPromiseWeaves(graph, { userId: USER_ID })

    expect(weaves[0].title).toBe('Hand Make Our Wardrobe')
    expect(weaves[0].title).not.toContain('weave_')
  })

  it('falls back to the generic label when there is nothing else to call it', async () => {
    queryMock.mockResolvedValue([row({ title: null, wovenPulseTitles: [] })])

    const { weaves } = await searchPromiseWeaves(graph, { userId: USER_ID })

    expect(weaves[0].title).toBe('Promise weave')
  })

  it('reports an empty result honestly rather than as a match', async () => {
    queryMock.mockResolvedValue([])

    const keyword = await searchPromiseWeaves(graph, {
      userId: USER_ID,
      query: 'loom',
    })
    expect(keyword.found).toBe(false)
    expect(keyword.message).toContain('loom')

    const listing = await searchPromiseWeaves(graph, { userId: USER_ID })
    expect(listing.found).toBe(false)
    expect(listing.weaves).toEqual([])
  })

  it('flags a full page as possibly truncated instead of stating a total', async () => {
    queryMock.mockResolvedValue(
      Array.from({ length: 3 }, (_, i) => row({ id: `weave_${i}` }))
    )

    const result = await searchPromiseWeaves(graph, {
      userId: USER_ID,
      limit: 3,
    })

    expect(result.message).toContain('there may be more')
  })
})

describe('searchPromiseWeaves — status (kb/04-state-machines.md)', () => {
  it('marks only a proposed weave as awaiting review', async () => {
    queryMock.mockResolvedValue([row({ status: 'proposed', origin: 'ai' })])

    const { weaves, message } = await searchPromiseWeaves(graph, {
      userId: USER_ID,
    })

    expect(weaves[0].awaitingReview).toBe(true)
    expect(weaves[0].status).toBe('Proposed')
    expect(weaves[0].origin).toBe('Proposed by the assistant')
    expect(message).toContain('waiting on a confirm or dismiss')
  })

  it('reads a null status as active, never as proposed', async () => {
    queryMock.mockResolvedValue([row({ status: null, origin: null })])

    const { weaves } = await searchPromiseWeaves(graph, { userId: USER_ID })

    // Otherwise every migration-built weave would sit behind a confirmation
    // gate it never had.
    expect(weaves[0].awaitingReview).toBe(false)
    expect(weaves[0].status).toBe('Active')
    expect(weaves[0].origin).toBe('Carried over from a migrated care point')
  })

  it('shows a legacy migration status verbatim rather than renaming it', async () => {
    queryMock.mockResolvedValue([row({ status: 'Inactive' })])

    const { weaves } = await searchPromiseWeaves(graph, { userId: USER_ID })

    expect(weaves[0].status).toBe('Inactive')
    expect(weaves[0].awaitingReview).toBe(false)
  })

  it('is case-insensitive about the lifecycle values', async () => {
    queryMock.mockResolvedValue([row({ status: 'PROPOSED' })])

    const { weaves } = await searchPromiseWeaves(graph, { userId: USER_ID })

    expect(weaves[0].awaitingReview).toBe(true)
  })
})
