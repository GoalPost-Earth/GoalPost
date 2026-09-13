import { readFileSync } from 'node:fs'
import path from 'node:path'
import { Neo4jGraphQL } from '@neo4j/graphql'
import { graphql, print, type GraphQLSchema } from 'graphql'
import {
  GET_ALL_ME_SPACES,
  GET_ALL_WE_SPACES,
  GET_ALL_PULSES,
  GET_ALL_PULSES_BY_CONTEXT,
  GET_ALL_PULSES_BY_SPACE,
  GET_LOGGED_IN_USER,
} from '@/app/graphql/queries'

/**
 * GOAL-369 plan-size guard for the DASHBOARD LIST documents — no database
 * required.
 *
 * Sibling of `src/lib/graphql/schema/person-pii-gate-plan-size.test.ts`. That
 * one pins the SHAPE of the gate in `schema.gql`; this one pins what the client
 * is allowed to ASK FOR, which is the other half of the same cost.
 *
 * Selecting `privateProfile { … }` on a nested `Person` expands the type-level
 * `PersonPrivateProfile` @authorization filter — a 5-branch nested rule — into
 * ~29 `EXISTS {` blocks of generated Cypher. Neo4j's PLANNING cost is
 * super-linear in predicate count, and the Aura plan cache misses often enough
 * that the deployed app pays planning on most requests. So a `privateProfile`
 * selection that nothing renders is close to pure latency.
 *
 * Measured against dev Aura (`CYPHER replan=force` minus `CYPHER replan=skip`,
 * median of 3, real caller id) before and after the selections were trimmed:
 *
 *                             EXISTS      chars      plan gap     dbHits
 *   GET_ALL_ME_SPACES       77 →  19   13.1k → 3.2k   1160 → 265ms  108 →  95
 *   GET_ALL_WE_SPACES       79 →  21   13.4k → 3.4k    919 → 224ms  278 → 176
 *   GET_ALL_PULSES (×4)     50 →  21    7.7k → 2.9k   2521 → 921ms  (unchanged)
 *
 * dbHits barely moves — EXECUTION was never the problem. The win is planning.
 *
 * These budgets are deliberately loose (a ceiling, not the current value) so
 * incidental schema churn doesn't fail the suite, but re-adding a PII selection
 * to a list document blows straight through them. Verified by hand: adding one
 * `privateProfile` back takes GET_ALL_ME_SPACES 19 → 48 and a pulse root
 * 21 → 50, both through the ceiling of 30.
 *
 * SCOPE — this suite is about COST, not enforcement. It compiles against a stub
 * driver with a fixed fake caller, so it can never show that the gate DENIES
 * anyone. `src/lib/graphql/schema/person-pii-read-auth.integration.test.ts` is
 * the suite that proves enforcement; do not read a green run here as evidence
 * that PII is protected.
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
      authorization: { key: 'goal369-plan-size-guard' },
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

/**
 * Compiles one of the REAL exported documents and returns the Cypher the
 * library would have run — one entry per root field, since `@neo4j/graphql`
 * emits a separate statement per root field.
 */
async function compileDocument(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  document: any,
  variableValues: Record<string, unknown> = {}
): Promise<string[]> {
  captured.length = 0
  const res = await graphql({
    schema,
    source: print(document),
    variableValues,
    contextValue: { jwt: { user: { id: 'caller-1' } } },
  })
  expect(res.errors).toBeUndefined()
  return captured.slice()
}

const countExists = (cypher: string) =>
  (cypher.match(/EXISTS\s*\{/g) ?? []).length

/** Per-root-field ceiling. One copy of the PII gate alone is ~29. */
const PER_STATEMENT_EXISTS_BUDGET = 30

describe('GOAL-369 — dashboard list documents stay cheap to plan', () => {
  const cases: Array<{
    name: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document: any
    variables?: Record<string, unknown>
    roots: number
  }> = [
    { name: 'GET_ALL_ME_SPACES', document: GET_ALL_ME_SPACES, roots: 1 },
    { name: 'GET_ALL_WE_SPACES', document: GET_ALL_WE_SPACES, roots: 1 },
    { name: 'GET_ALL_PULSES', document: GET_ALL_PULSES, roots: 4 },
    {
      name: 'GET_ALL_PULSES_BY_CONTEXT',
      document: GET_ALL_PULSES_BY_CONTEXT,
      variables: { contextId: 'ctx-1' },
      roots: 4,
    },
    {
      name: 'GET_ALL_PULSES_BY_SPACE',
      document: GET_ALL_PULSES_BY_SPACE,
      variables: { spaceId: 'sp-1' },
      roots: 4,
    },
  ]

  it.each(cases)(
    '$name keeps every root field under the plan budget',
    async ({ document, variables, roots }) => {
      const statements = await compileDocument(document, variables)

      // A document with N root fields emits N statements. If that ever stops
      // being true the per-statement budget below would silently pass by
      // measuring the wrong thing.
      expect(statements).toHaveLength(roots)

      for (const cypher of statements) {
        const exists = countExists(cypher)
        // Guard the guard: 0 would satisfy the ceiling if the space-visibility
        // rule were ever deleted outright rather than made cheaper.
        expect(exists).toBeGreaterThan(0)
        expect(exists).toBeLessThan(PER_STATEMENT_EXISTS_BUDGET)
      }
    },
    120_000
  )

  it.each(cases)(
    '$name selects no PII, so the PersonPrivateProfile gate never expands',
    ({ document }) => {
      // The direct statement of the rule. The EXISTS budget above catches this
      // too, but this assertion says WHY in its failure message.
      expect(print(document)).not.toMatch(/privateProfile/)
    }
  )

  it('positive control — the regex above really does detect a PII selection', () => {
    // Without this, a typo in the matcher would make every "selects no PII"
    // assertion above pass vacuously. GET_LOGGED_IN_USER legitimately reads the
    // caller's OWN profile, so it must match.
    expect(print(GET_LOGGED_IN_USER)).toMatch(/privateProfile/)
  })

  it('still selects the fields the space cards actually render', () => {
    // GOAL-369 trimmed these documents hard. `owner { id }` in particular is
    // read through an `as` cast in bloom-view (it derives `currentUserId` from
    // it, which drives the root "You" hub node and every owns/member spoke), so
    // TypeScript would NOT catch its removal — assert it here instead.
    for (const document of [GET_ALL_ME_SPACES, GET_ALL_WE_SPACES]) {
      const source = print(document)
      expect(source).toMatch(/owner\s*{[^}]*\bid\b/)
      expect(source).toMatch(/owner\s*{[^}]*\bfirstName\b/)
      expect(source).toMatch(/owner\s*{[^}]*\blastName\b/)
      // `members` / `contexts` are rendered as counts — the array must survive.
      expect(source).toMatch(/members\s*{/)
      expect(source).toMatch(/contexts\s*{/)
    }
  })
})
