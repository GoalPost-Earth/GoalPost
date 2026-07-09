import { getAccessibleFieldContexts } from './accessible-contexts'
import type { Neo4jGraph } from '@langchain/community/graphs/neo4j_graph'

/**
 * getAccessibleFieldContexts enumerates every FieldContext a member can view —
 * MeSpace they own + WeSpace their membership grants — and fails closed without
 * an authenticated user. Hermetic: the only surface it touches is graph.query.
 */

function graphReturning(rows: unknown): { graph: Neo4jGraph; query: jest.Mock } {
  const query = jest.fn(async () => rows)
  return { graph: { query } as unknown as Neo4jGraph, query }
}

describe('getAccessibleFieldContexts', () => {
  it('returns [] and never queries when userId is missing/blank', async () => {
    const { graph, query } = graphReturning([])
    expect(await getAccessibleFieldContexts(graph, null)).toEqual([])
    expect(await getAccessibleFieldContexts(graph, '   ')).toEqual([])
    expect(query).not.toHaveBeenCalled()
  })

  it('maps rows to {contextId, spaceId, spaceType} and derives the space type from labels', async () => {
    const { graph, query } = graphReturning([
      { contextId: 'ctx_a', spaceId: 'me_1', spaceLabels: ['Space', 'MeSpace'] },
      { contextId: 'ctx_b', spaceId: 'ws_1', spaceLabels: ['Space', 'WeSpace'] },
      { contextId: 'ctx_c', spaceId: 's_1', spaceLabels: ['Space'] },
    ])

    const result = await getAccessibleFieldContexts(graph, 'person_1')

    expect(query).toHaveBeenCalledTimes(1)
    expect(result).toEqual([
      { contextId: 'ctx_a', spaceId: 'me_1', spaceType: 'MeSpace' },
      { contextId: 'ctx_b', spaceId: 'ws_1', spaceType: 'WeSpace' },
      { contextId: 'ctx_c', spaceId: 's_1', spaceType: 'Space' },
    ])
  })

  it('drops rows missing a context or space id', async () => {
    const { graph } = graphReturning([
      { contextId: 'ctx_a', spaceId: 'me_1', spaceLabels: ['MeSpace'] },
      { contextId: '', spaceId: 'me_1', spaceLabels: ['MeSpace'] },
      { contextId: 'ctx_b', spaceId: '', spaceLabels: ['MeSpace'] },
    ])

    const result = await getAccessibleFieldContexts(graph, 'person_1')

    expect(result).toEqual([
      { contextId: 'ctx_a', spaceId: 'me_1', spaceType: 'MeSpace' },
    ])
  })

  it('passes the trimmed userId through as the $userId parameter', async () => {
    const { graph, query } = graphReturning([])
    await getAccessibleFieldContexts(graph, '  person_9  ')
    expect(query).toHaveBeenCalledWith(expect.any(String), {
      userId: 'person_9',
    })
  })
})
