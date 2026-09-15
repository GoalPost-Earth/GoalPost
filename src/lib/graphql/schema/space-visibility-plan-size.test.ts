import { readFileSync } from 'node:fs'
import path from 'node:path'
import { Neo4jGraphQL } from '@neo4j/graphql'
import { graphql, printSchema, type GraphQLSchema } from 'graphql'

/**
 * GOAL-373 plan-size + read-surface guard for the space-visibility rule.
 * No database required.
 *
 * The rule — "owner or any member of the owning Space may read" — used to be
 * written as four sibling branches (`meSpace_SOME` owner, `meSpace_SOME`
 * member, `weSpace_SOME` owner, `weSpace_SOME` member) on `FieldContext` and
 * on all five pulse types, and as an interface-typed `space_SOME` on
 * `SpaceMembership`. Both forms cost one Space traversal per implementing
 * label. Measured on dev against a 210-context / 1,890-pulse / 3-Space fixture
 * (GOAL-373 phase 1):
 *
 *                              EXISTS {   dbHits   plan (replan=force)
 *   fieldContexts(id_EQ)   4-branch  10       19     153 ms
 *                          anchored   4       12      72 ms
 *   goalPulses(id_EQ)      4-branch  11       22     179 ms
 *                          anchored   5       15      88 ms
 *   spaceMemberships       interface  8        —        —
 *                          anchored   4        —        —
 *
 * Two shapes were rejected on measurement, and this suite pins the reasons:
 *
 *  - A `@cypher` Boolean gate referenced by the filter (the technique that
 *    worked for `PersonPrivateProfile`, GOAL-372) compiles to
 *    `MATCH (this) CALL { … } WITH * WHERE <caller where>`. Neo4j will not push
 *    a predicate below a `CALL`, so the gate ran for every node of the label:
 *    238 rows into the CALL instead of 1 and 19 → 2,146 dbHits on a single-row
 *    FieldContext lookup, 22 → 14,761 on a single-row GoalPulse lookup.
 *    `keeps the caller's where above the first CALL` is what fails if anyone
 *    reaches for it again (ADR-010).
 *
 *  - The `Space` INTERFACE does not collapse the branches. `@neo4j/graphql`
 *    expands an interface-typed relationship filter once per implementing
 *    type, emitting `(:Space:MeSpace)` OR `(:Space:WeSpace)` — byte-identical
 *    Cypher to naming the two relationships by hand. Only a CONCRETE type over
 *    `@node(labels: ["Space"])` matches the shared label once, which is what
 *    `SpaceAuthAnchor` is for. `matches the shared :Space label exactly once`
 *    is the pin.
 */

const captured: string[] = []

function makeRecord(obj: Record<string, unknown>) {
  const values = Object.values(obj)
  return {
    get: (k: string | number) => (typeof k === 'number' ? values[k] : obj[k]),
    keys: Object.keys(obj),
    [Symbol.iterator]: function* () {
      yield* values
    },
  }
}

const stubTx = {
  run: async (cypher: string) => {
    if (cypher.includes('dbms.components')) {
      return {
        records: [makeRecord({ version: '5.26.0', edition: 'enterprise' })],
      }
    }
    captured.push(cypher)
    return {
      records: [],
      summary: {
        counters: { updates: () => ({}), containsUpdates: () => false },
      },
    }
  },
}

const stubDriver = {
  session: () => ({
    executeRead: async (fn: (tx: typeof stubTx) => unknown) => fn(stubTx),
    executeWrite: async (fn: (tx: typeof stubTx) => unknown) => fn(stubTx),
    run: (c: string) => stubTx.run(c),
    close: async () => {},
  }),
  close: async () => {},
}

let schema: GraphQLSchema
let sdl: string

beforeAll(async () => {
  const typeDefs = readFileSync(
    path.join(process.cwd(), 'src/lib/graphql/schema/schema.gql'),
    'utf8'
  )
  schema = await new Neo4jGraphQL({
    typeDefs,
    resolvers: {
      Person: {
        name: (s: { firstName: string; lastName: string }) =>
          `${s.firstName} ${s.lastName}`,
      },
      User: {
        name: (s: { firstName: string; lastName: string }) =>
          `${s.firstName} ${s.lastName}`,
      },
      Document: { downloadUrl: () => null },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    driver: stubDriver as any,
    features: {
      authorization: { key: 'plan-size-guard-secret' },
      excludeDeprecatedFields: {
        implicitEqualFilters: true,
        implicitSet: true,
        deprecatedOptionsArgument: true,
        directedArgument: true,
        connectOrCreate: true,
      },
    },
  }).getSchema()
  sdl = printSchema(schema)
}, 180_000)

/** Compiles a query and returns every Cypher statement the library would run. */
async function compileAll(source: string): Promise<string[]> {
  captured.length = 0
  const res = await graphql({
    schema,
    source,
    contextValue: { jwt: { user: { id: 'caller-1' } } },
  })
  expect(res.errors).toBeUndefined()
  return [...captured]
}

const compile = async (source: string) => (await compileAll(source)).join('\n')

const countExists = (cypher: string) =>
  (cypher.match(/EXISTS\s*\{/g) ?? []).length

const occurrences = (haystack: string, needle: string) =>
  haystack.split(needle).length - 1

/**
 * The dashboard list documents in their GOAL-370 (post-trim) shape — no
 * `privateProfile`, no nested `members.member`. Held as literals rather than
 * imported from `HISTORY_QUERIES.ts` so this suite measures THE RULE and does
 * not move when a surface adds or drops an unrelated field. The companion
 * `dashboard-list-plan-size.test.ts` is what pins the shipped documents to
 * this shape.
 */
const TRIMMED = {
  GET_ALL_ME_SPACES: `
    query GetAllMeSpaces {
      meSpaces {
        id name visibility createdAt
        owner { id firstName lastName }
        members { id role }
        contexts { id title createdAt }
      }
    }`,
  GET_ALL_WE_SPACES: `
    query GetAllWeSpaces {
      weSpaces {
        id name visibility createdAt
        owner { id firstName lastName name }
        members { id role }
        contexts { id title createdAt }
      }
    }`,
  GET_ALL_PULSES: `
    query GetAllPulses {
      goalPulses { __typename id title content createdAt intensity
        context { id title } createdBy { id firstName lastName name } }
      resourcePulses { __typename id title content createdAt intensity
        context { id title } createdBy { id firstName lastName name } }
      storyPulses { __typename id title content createdAt intensity
        context { id title } createdBy { id firstName lastName name } }
      coreValuePulses { __typename id title content createdAt intensity
        context { id title } createdBy { id firstName lastName name } }
    }`,
}

/**
 * The AC budget. 12 is the headroom the epic set for a post-trim list
 * document; the shipped rule lands at 9-11, so a regression has to be real
 * before this fires.
 *
 * This is a COST ceiling, not a policy guard. A filter weakened to owner-only
 * would drop to 2 `EXISTS` and sail through every assertion below, including
 * the `toBeGreaterThan(0)` guards. Policy is pinned live, with minted JWTs, by
 * `space-visibility-read-auth.integration.test.ts`.
 */
const BUDGET = 12

describe('GOAL-373 space-visibility rule — emitted plan size', () => {
  it('keeps each post-trim dashboard list document inside the EXISTS budget', async () => {
    // 19 / 21 / 21-per-sub-query before the anchor landed.
    const me = countExists(await compile(TRIMMED.GET_ALL_ME_SPACES))
    const we = countExists(await compile(TRIMMED.GET_ALL_WE_SPACES))

    // Guard the guard: `0 <= 12` would pass with the filters deleted outright.
    expect(me).toBeGreaterThan(0)
    expect(we).toBeGreaterThan(0)

    expect(me).toBeLessThanOrEqual(BUDGET)
    expect(we).toBeLessThanOrEqual(BUDGET)
  }, 180_000)

  it('keeps EACH GET_ALL_PULSES sub-query inside the EXISTS budget', async () => {
    // The four root fields are planned as four independent statements, so the
    // budget is per statement — summing them would hide a regression in one.
    const statements = await compileAll(TRIMMED.GET_ALL_PULSES)
    expect(statements).toHaveLength(4)
    for (const stmt of statements) {
      const n = countExists(stmt)
      expect(n).toBeGreaterThan(0)
      expect(n).toBeLessThanOrEqual(BUDGET)
    }
  }, 180_000)

  it('pins the rule itself, independent of any document', async () => {
    // Document-independent bounds: these move only if the RULE changes.
    // 4-branch form was 10 / 11 / 8.
    expect(
      countExists(
        await compile(
          `query { fieldContexts(where: { id_EQ: "ctx-1" }) { id title } }`
        )
      )
    ).toBeLessThanOrEqual(4)
    expect(
      countExists(
        await compile(
          `query { goalPulses(where: { id_EQ: "pulse-1" }) { id title } }`
        )
      )
    ).toBeLessThanOrEqual(5)
    expect(
      countExists(await compile(`query { spaceMemberships { id role } }`))
    ).toBeLessThanOrEqual(4)
  }, 180_000)

  it.each([
    ['fieldContexts', `query { fieldContexts(where: { id_EQ: "c" }) { id title } }`, '<-[:HAS_CONTEXT]-('],
    ['goalPulses', `query { goalPulses(where: { id_EQ: "p" }) { id title } }`, '<-[:HAS_CONTEXT]-('],
    ['resourcePulses', `query { resourcePulses(where: { id_EQ: "p" }) { id title } }`, '<-[:HAS_CONTEXT]-('],
    ['storyPulses', `query { storyPulses(where: { id_EQ: "p" }) { id title } }`, '<-[:HAS_CONTEXT]-('],
    ['carePulses', `query { carePulses(where: { id_EQ: "p" }) { id title } }`, '<-[:HAS_CONTEXT]-('],
    ['coreValuePulses', `query { coreValuePulses(where: { id_EQ: "p" }) { id title } }`, '<-[:HAS_CONTEXT]-('],
    ['spaceMemberships', `query { spaceMemberships { id role } }`, '<-[:HAS_MEMBER]-('],
  ])(
    'matches the shared :Space label exactly once on %s',
    async (_root, source, edge) => {
      const cypher = await compile(source)
      // One traversal off the node, not one per implementing label. If this
      // flips back to two, the filter is naming MeSpace/WeSpace (or the
      // `Space` interface, which expands to the same thing) instead of
      // SpaceAuthAnchor. All five pulse types were rewritten, so all five are
      // checked — `goalPulses` alone would not have caught a missed one.
      expect(occurrences(cypher, edge)).toBe(1)
      expect(occurrences(cypher, ':Space:MeSpace')).toBe(0)
      expect(occurrences(cypher, ':Space:WeSpace')).toBe(0)
    },
    180_000
  )

  it('leaves the role-checked validate blocks alone', async () => {
    // The READ rule is deliberately role-BLIND (a GUEST reads everything in
    // the Space). The only thing that makes that safe is the `validate` side
    // staying role-CHECKED. Both suites here are otherwise 100% read, so a
    // future "compact the validate blocks too" would drop `role IN [...]`,
    // hand GUESTs write access to every pulse, and stay green. This is the pin.
    const cypher = await compile(`
      mutation {
        updateGoalPulses(where: { id_EQ: "p1" }, update: { title_SET: "x" }) {
          goalPulses { id }
        }
      }
    `)
    expect(cypher).toContain('apoc.util.validatePredicate')
    expect(cypher).toContain('role IN ')
    // And the write rule still discriminates the two Space labels, because
    // MeSpace and WeSpace do NOT share a write policy.
    expect(occurrences(cypher, ':Space:MeSpace')).toBeGreaterThan(0)
    expect(occurrences(cypher, ':Space:WeSpace')).toBeGreaterThan(0)
  }, 180_000)

  it('never anchors the read rule on HAS_DELETED_CONTEXT', async () => {
    // GOAL-319: soft delete re-points the Space edge. The rule must follow
    // HAS_CONTEXT only, or deleted fields (and their pulses) come back.
    for (const source of [
      `query { fieldContexts(where: { id_EQ: "ctx-1" }) { id title } }`,
      `query { goalPulses(where: { id_EQ: "pulse-1" }) { id title } }`,
      `query { spaceMemberships { id role } }`,
    ]) {
      expect(await compile(source)).not.toContain('HAS_DELETED_CONTEXT')
    }
  }, 180_000)

  it("keeps the caller's where above the first CALL so the index seek survives", async () => {
    // ADR-010: a `@cypher` field inside an @authorization filter compiles to
    // `MATCH (this) CALL { … } WITH * WHERE …`, and Neo4j cannot hoist the
    // caller's predicate back above the CALL. Measured on the GOAL-373
    // fixture: 1 → 238 rows into the CALL and 19 → 2,146 dbHits.
    for (const [source, match, where] of [
      [
        `query { fieldContexts(where: { id_EQ: "ctx-1" }) { id title } }`,
        'MATCH (this:FieldContext)',
        'WHERE (this.id =',
      ],
      [
        `query { goalPulses(where: { id_EQ: "pulse-1" }) { id title } }`,
        'MATCH (this:FieldPulse:GoalPulse)',
        'WHERE (this.id =',
      ],
    ] as const) {
      const cypher = await compile(source)
      const matchIndex = cypher.indexOf(match)
      const whereIndex = cypher.indexOf(where)
      const callIndex = cypher.indexOf('CALL {')
      expect(matchIndex).toBeGreaterThanOrEqual(0)
      expect(whereIndex).toBeGreaterThan(matchIndex)
      if (callIndex >= 0) expect(whereIndex).toBeLessThan(callIndex)
    }
  }, 180_000)
})

describe('GOAL-373 SpaceAuthAnchor — not a read surface', () => {
  // `(^|\n)` and NOT `\n`: `printSchema` puts `type Query {` at offset 0, so a
  // leading-newline anchor silently returns '' and every assertion against it
  // passes vacuously.
  const typeBlock = (name: string) =>
    sdl.match(new RegExp(`(^|\\n)type ${name} \\{[\\s\\S]*?\\n\\}`))?.[0] ?? ''

  it('generates no root query or mutation of its own', () => {
    // Guard the guard: these blocks must actually have been found.
    expect(typeBlock('Query').length).toBeGreaterThan(100)
    expect(typeBlock('Mutation').length).toBeGreaterThan(100)

    expect(typeBlock('Query')).not.toMatch(/spaceAuthAnchor/i)
    expect(typeBlock('Mutation')).not.toMatch(/spaceAuthAnchor/i)
    // And no object type at all — nothing can name it in a selection set.
    expect(typeBlock('SpaceAuthAnchor')).toBe('')
  })

  it('is absent from every parent object type — field, connection AND aggregate', () => {
    // `@selectable(onRead: false)` alone drops `spaces` but LEAVES
    // `spacesAggregate` / `spacesConnection`, and the connection projects the
    // Space itself — which a MeSpace member can read a context of but is not
    // allowed to read the MeSpace of. `aggregate: false` on the relationship
    // is what removes the other two; this test is why both are there.
    for (const parent of ['FieldContext', 'SpaceMembership']) {
      const block = typeBlock(parent)
      expect(block).not.toBe('')
      expect(block).not.toMatch(/\bspaces\s*[(:]/)
      expect(block).not.toMatch(/\bspacesAggregate\b/)
      expect(block).not.toMatch(/\bspacesConnection\b/)
    }
  })

  it('stays filter-only, and adds no predicate the Space types did not already offer', () => {
    const where =
      sdl.match(/\ninput SpaceAuthAnchorWhere \{[\s\S]*?\n\}/)?.[0] ?? ''
    expect(where).not.toBe('')
    // id / owner / members only — the same reach `meSpace_SOME`,
    // `weSpace_SOME` and `space_SOME` already give on the same nodes, and
    // strictly narrower than MeSpaceWhere / WeSpaceWhere, which also expose
    // name / description / why / location / visibility / status. A new scalar
    // here would be a new predicate oracle on Spaces.
    const scalarPredicates = [...where.matchAll(/^\s{2}(\w+)_(EQ|IN)\s*:/gm)]
      .map((m) => m[1])
      .filter((f, i, a) => a.indexOf(f) === i)
    expect(scalarPredicates).toEqual(['id'])

    // Reachable for filtering from both gated types, which is the whole point.
    for (const input of ['FieldContextWhere', 'SpaceMembershipWhere']) {
      const block =
        sdl.match(new RegExp(`\\ninput ${input} \\{[\\s\\S]*?\\n\\}`))?.[0] ?? ''
      expect(block).toContain('spaces_SOME')
      // But NOT `spacesAggregate`: a `<field>Aggregate` where-input compiles
      // to the ADR-010 `MATCH (this) CALL { … } WITH * WHERE …` shape, running
      // per row over the whole label — caller-triggerable. `@filterable(
      // byAggregate: false)` is what keeps it out.
      expect(block).not.toMatch(/\bspacesAggregate\b/)
    }
  })

  it('is not a write target from either parent, by any input', () => {
    // Not just Create/Update: connect / disconnect / delete inputs are write
    // doors too, and a missing input name must FAIL here rather than skip.
    const inputs = [
      'FieldContextCreateInput',
      'FieldContextUpdateInput',
      'FieldContextConnectInput',
      'FieldContextDisconnectInput',
      'FieldContextDeleteInput',
      'SpaceMembershipCreateInput',
      'SpaceMembershipUpdateInput',
      'SpaceMembershipConnectInput',
      'SpaceMembershipDisconnectInput',
    ]
    const found = inputs.filter((input) =>
      new RegExp(`\\ninput ${input} \\{`).test(sdl)
    )
    // At minimum the four core inputs must exist, or this test is vacuous.
    expect(found.length).toBeGreaterThanOrEqual(4)
    for (const input of found) {
      const block = sdl.match(
        new RegExp(`\\ninput ${input} \\{[\\s\\S]*?\\n\\}`)
      )![0]
      expect(block).not.toMatch(/\bspaces\b/)
    }
  })
})
