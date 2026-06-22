import { searchFieldContexts } from './field-context.service'

/**
 * GOAL-273 regression — `search_field_context` must NOT leak cross-tenant
 * FieldContexts via its name-only path.
 *
 * The bug: `searchFieldContexts` ran a graph-wide `MATCH (context:FieldContext)`
 * filtered only by title/emergentName substring. With no `$userId` anchor, a
 * name search by tenant A surfaced tenant B's private MeSpace/WeSpace
 * FieldContexts. The Space-authorization gate in chat-tools.ts only fired when a
 * `spaceId` was resolved, so the name-only path bypassed authz entirely.
 *
 * The fix anchors the Cypher to Spaces the caller OWNS or is a MEMBER of
 * (mirroring `canViewContent` in src/lib/permissions/space-permissions.ts) and
 * makes the service fail closed when no userId is supplied.
 *
 * These tests mock the LangChain `Neo4jGraph` so they are fully hermetic — no
 * Neo4j, no OpenAI. They assert the service's contract: (1) no userId ⇒ no
 * query and no results, and (2) the executed Cypher is user-anchored with the
 * caller's id, which is what scopes out other tenants' contexts at the DB level.
 */

type GraphLike = { query: jest.Mock }

const makeGraph = (rows: Array<Record<string, unknown>>): GraphLike => ({
  query: jest.fn(async () => rows),
})

const USER_A = 'person_tenant_a'

describe('GOAL-273 — searchFieldContexts is Space-authorization scoped', () => {
  it('fails closed when no userId is supplied (legacy/no-identity path)', async () => {
    const graph = makeGraph([])

    const result = await searchFieldContexts(graph as never, {
      query: 'Care Practices',
      // no userId — e.g. the legacy agent path in modules/agent/tools/index.ts
    })

    expect(result.found).toBe(false)
    expect(result.contexts).toHaveLength(0)
    // Critical: it must NOT run a graph-wide query that could leak contexts.
    expect(graph.query).not.toHaveBeenCalled()
  })

  it('anchors the Cypher to OWNS / SpaceMembership and passes the caller userId', async () => {
    const graph = makeGraph([])

    await searchFieldContexts(graph as never, {
      query: 'Care Practices',
      userId: USER_A,
    })

    expect(graph.query).toHaveBeenCalledTimes(1)
    const [cypher, params] = graph.query.mock.calls[0] as [
      string,
      Record<string, unknown>,
    ]

    // The caller's id is bound as a parameter (never interpolated).
    expect(params.userId).toBe(USER_A)

    // The query begins from the user and only matches Spaces they own or are a
    // member of — mirroring canViewContent. This is the primary guarantee that
    // another tenant's FieldContexts can never be returned, even on the
    // name-only path (no spaceId / spaceName).
    expect(cypher).toMatch(/MATCH\s*\(user:Person\s*\{id:\s*\$userId\}\)/)
    expect(cypher).toMatch(/\(user\)-\[:OWNS\]->\(space\)/)
    expect(cypher).toMatch(
      /\(space\)-\[:HAS_MEMBER\]->\(:SpaceMembership\)-\[:IS_MEMBER\]->\(user\)/
    )
  })

  it("returns the caller's own matching contexts (rows the scoped query yields)", async () => {
    // Simulate the DB returning only tenant A's own context (the scoping
    // happens in Cypher; here we assert the service shapes that row correctly).
    const graph = makeGraph([
      {
        id: 'ctx_a1',
        title: 'Care Practices',
        emergentName: null,
        createdAt: '2026-01-01T00:00:00Z',
        pulseCount: '3',
        spaceId: 'me_a',
        spaceName: "Tenant A's Space",
        spaceVisibility: 'PRIVATE',
        spaceLabels: ['Space', 'MeSpace'],
      },
    ])

    const result = await searchFieldContexts(graph as never, {
      query: 'Care Practices',
      userId: USER_A,
    })

    expect(result.found).toBe(true)
    expect(result.count).toBe(1)
    expect(result.contexts[0].title).toBe('Care Practices')
    expect(result.contexts[0].pulseCount).toBe(3)
  })
})
