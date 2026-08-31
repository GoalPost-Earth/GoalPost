import { readFileSync } from 'node:fs'
import path from 'node:path'
import { Neo4jGraphQL } from '@neo4j/graphql'
import { graphql, type GraphQLSchema } from 'graphql'

/**
 * GOAL-275 plan-size guard — no database required.
 *
 * The Person PII gate was previously an identical field-level `@authorization`
 * filter on 14 `Person` fields. `@neo4j/graphql` v6 expands a field-level
 * filter once per gated field in the selection set with no deduplication, and
 * Neo4j's planning cost is super-linear in the resulting predicate count.
 * Measured on a 1,000-person fixture against dev Aura:
 *
 *   1 gated field →  29 EXISTS →  1.1 s cold plan
 *   4             → 116         →  2.8 s
 *   8             → 232         → 12.1 s
 *  12             → 348         → 31.4 s
 *
 * GET_LOGGED_IN_USER fires on every protected page and sat at the bottom of
 * that table, past the 60 s `maxDuration` on /api/graphql — the profile page
 * hung forever. Moving the rule to a single TYPE-level filter on
 * `PersonPrivateProfile` makes the cost flat in field count.
 *
 * This suite compiles the real schema.gql against a stub driver and asserts
 * that flatness directly, so re-introducing a per-field rule fails here rather
 * than in production. It captures the emitted Cypher without touching Neo4j.
 */

// A driver stub that captures the emitted Cypher instead of running it. The
// library asks for `dbms.components()` during translation, and its records
// must support both `.get()` and iteration, or the build throws.
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

/** Every scalar behind the gate, in schema order. */
const GATED_FIELDS = [
  'email',
  'phone',
  'pronouns',
  'location',
  'gender',
  'description',
  'careManual',
  'favorites',
  'passions',
  'traits',
  'fieldsOfCare',
  'interests',
]

let schema: GraphQLSchema

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
}, 120_000)

/** Compiles a query and returns the Cypher the library would have run. */
async function compile(source: string): Promise<string> {
  captured.length = 0
  const res = await graphql({
    schema,
    source,
    contextValue: { jwt: { user: { id: 'caller-1' } } },
  })
  expect(res.errors).toBeUndefined()
  return captured.join('\n')
}

const countExists = (cypher: string) =>
  (cypher.match(/EXISTS\s*\{/g) ?? []).length

const gatedQuery = (n: number) => `
  query {
    people(where: { id_EQ: "p1" }) {
      id firstName lastName photo
      privateProfile { ${GATED_FIELDS.slice(0, n).join(' ')} }
    }
  }
`

describe('GOAL-275 gate — emitted plan size', () => {
  it('costs the same whether 1 or all 12 gated fields are selected', async () => {
    const one = countExists(await compile(gatedQuery(1)))
    const all = countExists(await compile(gatedQuery(GATED_FIELDS.length)))

    // Guard the guard: `0 === 0` would satisfy the equality below if the
    // @authorization block were deleted outright.
    expect(one).toBeGreaterThan(0)

    // The whole point of the type-level filter: flat in field count. Under the
    // old field-level rule this was 29 → 348.
    expect(all).toBe(one)
  }, 120_000)

  it('emits the gate exactly once — a single copy of the 5-branch rule', async () => {
    const cypher = await compile(gatedQuery(GATED_FIELDS.length))

    // One copy of the rule is 29 EXISTS. Anything approaching a second copy
    // means the filter is being expanded per field again.
    expect(countExists(cypher)).toBeLessThanOrEqual(40)

    // Each branch of the policy should appear exactly once.
    const occurrences = (needle: string) =>
      cypher.split(needle).length - 1
    expect(occurrences('[:CREATED_BY]->')).toBe(1)
    expect(occurrences('[:HAS_PERSON]-')).toBe(1)
  }, 120_000)

  it('keeps the whole shipped profile query inside a sane budget', async () => {
    // GET_PERSON_PROFILE as the drawer and profile page actually send it.
    const cypher = await compile(`
      query {
        people(where: { id_EQ: "p1" }) {
          id firstName lastName name photo
          privateProfile {
            email description traits passions fieldsOfCare interests
            careManual favorites
            connections { id name }
            connectionEdges { connectedPersonId why interests }
          }
          ownsSpaces { ... on MeSpace { id name } ... on WeSpace { id name } }
          memberOf { id role }
        }
      }
    `)

    // Was 302 EXISTS / ~39k characters before the consolidation.
    expect(countExists(cypher)).toBeLessThan(60)
    expect(cypher.length).toBeLessThan(12_000)
  }, 120_000)

  it('applies the caller filter BEFORE the gate so the index seek survives', async () => {
    const cypher = await compile(gatedQuery(1))

    // The user's `where` must be a predicate on the initial MATCH. If a
    // cypher-field filter ever pushes it below a CALL subquery, Neo4j cannot
    // hoist it back out and the gate runs for every Person in the database
    // (measured: 168 dbHits → 146,453 on a 1,000-person fixture).
    const matchIndex = cypher.indexOf('MATCH (this:Person)')
    const whereIndex = cypher.indexOf('WHERE this.id =')
    const callIndex = cypher.indexOf('CALL {')
    expect(matchIndex).toBeGreaterThanOrEqual(0)
    expect(whereIndex).toBeGreaterThan(matchIndex)
    expect(whereIndex).toBeLessThan(callIndex)
  }, 120_000)

  it('leaves the open directory read completely ungated', async () => {
    // Cross-Space discovery by name must stay free of the gate entirely —
    // SEARCH_PEOPLE_QUERY depends on it (kb/02-user-roles.md).
    const cypher = await compile(`
      query { people(where: { id_EQ: "p1" }) { id firstName lastName name photo } }
    `)
    expect(countExists(cypher)).toBe(0)
  }, 120_000)
})
