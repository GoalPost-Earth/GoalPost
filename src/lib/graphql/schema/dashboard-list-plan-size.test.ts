import { readFileSync } from 'node:fs'
import path from 'node:path'
import { Neo4jGraphQL } from '@neo4j/graphql'
import { graphql, print, type DocumentNode, type GraphQLSchema } from 'graphql'
import {
  GET_ALL_ME_SPACES,
  GET_ALL_PULSES,
  GET_ALL_PULSES_BY_CONTEXT,
  GET_ALL_PULSES_BY_SPACE,
  GET_ALL_WE_SPACES,
} from '@/app/graphql/queries/HISTORY_QUERIES'

/**
 * GOAL-370 plan-size guard for the Dashboard View's list documents — no
 * database required.
 *
 * Sibling of `person-pii-gate-plan-size.test.ts`. That suite pins the *gate*:
 * one type-level `@authorization` filter on `PersonPrivateProfile` is emitted
 * once however many PII fields a caller selects. This suite pins the other
 * multiplier ADR-010 warns about — the number of **selection sites** that reach
 * that gate at all. The rule is emitted once per `privateProfile` selection in
 * the document, so a list document that selects it on the Space owner, on every
 * `members.member` and on every pulse's `createdBy` pays for the gate three
 * times over rows nobody renders.
 *
 * Measured on dev before the trim (GOAL-369's harness):
 *
 *   GET_ALL_ME_SPACES  77 EXISTS → 1.3-3.0 s planning
 *   GET_ALL_WE_SPACES  79 EXISTS
 *   GET_ALL_PULSES     50 EXISTS per sub-query → ~0.7 s planning each
 *
 * ...for 94-116 dbHits of actual work. No consumer of these documents renders
 * email, so the selections were removed. This suite fails if one comes back.
 */

const captured: string[] = []

// A driver stub that captures the emitted Cypher instead of running it. The
// library asks for `dbms.components()` during translation, and its records
// must support both `.get()` and iteration, or the build throws.
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

/**
 * The document exactly as the app ships it. `graphql()` (the codegen client
 * preset) keys its typed-document map on the raw source string and falls back
 * to `{}` on a miss, so an un-regenerated `src/gql/` would silently hand back
 * an empty object — assert the shape rather than letting `print` throw.
 */
function source(doc: unknown, name: string): string {
  if (typeof doc === 'string') return doc
  const node = doc as DocumentNode
  expect(`${name}: ${node?.kind}`).toBe(`${name}: Document`)
  return print(node)
}

/**
 * Compiles a document and returns one entry per emitted Cypher statement.
 * `@neo4j/graphql` resolves each root field separately, so a four-root
 * document like GET_ALL_PULSES yields four independent plans — and each is
 * budgeted on its own, because each is planned on its own.
 */
async function compileEach(
  doc: unknown,
  name: string,
  variableValues: Record<string, unknown> = {}
): Promise<string[]> {
  captured.length = 0
  const res = await graphql({
    schema,
    source: source(doc, name),
    variableValues,
    contextValue: { jwt: { user: { id: 'caller-1' } } },
  })
  expect(res.errors).toBeUndefined()
  return [...captured]
}

const countExists = (cypher: string) =>
  (cypher.match(/EXISTS\s*\{/g) ?? []).length

/**
 * `HAS_PERSON` reaches a Person from a FieldContext roster. It appears in
 * exactly one place in a generated read: the `PersonPrivateProfile` branch of
 * the GOAL-275 gate. So its occurrence count IS the number of copies of that
 * gate in the plan — 0 for every document here, 1 per `privateProfile`
 * selection site otherwise. None of the pulse or space relationships these
 * documents traverse (`OWNS`, `HAS_MEMBER`, `IS_MEMBER`, `HAS_CONTEXT`,
 * `CREATED_BY`) use it, so there is nothing to collide with.
 */
const countGateCopies = (cypher: string) =>
  (cypher.match(/\[:HAS_PERSON\]-/g) ?? []).length

/**
 * Budgets, not measurements — a little headroom over the post-trim numbers so
 * an unrelated schema tweak doesn't fail this, while one reintroduced
 * `privateProfile` selection blows straight through (measured: +29 EXISTS per
 * site, 21 → 50 on a pulse sub-query).
 *
 * What is left under these budgets is entirely Space-scope `@authorization` —
 * the Space filter itself plus the `SpaceMembership` and `FieldContext`
 * filters on `members` / `contexts` — and is deliberately untouched (ADR-003).
 * Measured after the trim:
 *
 *   GET_ALL_ME_SPACES         77 → 19   (1 Space filter + 8 members + 10 contexts)
 *   GET_ALL_WE_SPACES         79 → 21   (3 + 8 + 10; WeSpace's filter is owner OR member)
 *   GET_ALL_PULSES            50 → 21   per sub-query
 *   GET_ALL_PULSES_BY_CONTEXT 51 → 22   per sub-query
 *   GET_ALL_PULSES_BY_SPACE   53 → 24   per sub-query
 *
 * WeSpace cannot reach the 19 its MeSpace sibling does: the extra 2 are the
 * membership branch of its own read filter. `membersAggregate { count }` was
 * measured as an alternative to `members { id role }` and emits the identical
 * 21, so the cards keep the list and read `.length`.
 */
const SPACE_LIST_MAX_EXISTS = 22
const PULSE_LIST_MAX_EXISTS = 25

describe('GOAL-370 — Dashboard list documents stay off the PII gate', () => {
  it.each([
    ['GET_ALL_ME_SPACES', GET_ALL_ME_SPACES],
    ['GET_ALL_WE_SPACES', GET_ALL_WE_SPACES],
  ])('%s selects no privateProfile and no nested member', (name, doc) => {
    const text = source(doc, name)
    expect(text).not.toContain('privateProfile')
    // The cards read `members.length` only. A nested `member { … }` re-enters
    // Person — and the gate with it — once per membership row.
    expect(text).not.toMatch(/\bmember\s*{/)
  })

  it.each([
    ['GET_ALL_ME_SPACES', GET_ALL_ME_SPACES],
    ['GET_ALL_WE_SPACES', GET_ALL_WE_SPACES],
  ])(
    `%s plans under ${SPACE_LIST_MAX_EXISTS} EXISTS blocks`,
    async (name, doc) => {
      const statements = await compileEach(doc, name)
      expect(statements).toHaveLength(1)
      const blocks = countExists(statements[0])

      // Guard the guard: the Space's own @authorization filter must still be
      // there. `0 <= 22` would pass a schema with the filter deleted outright.
      expect(blocks).toBeGreaterThan(0)
      expect(blocks).toBeLessThanOrEqual(SPACE_LIST_MAX_EXISTS)
      expect(countGateCopies(statements[0])).toBe(0)
    },
    120_000
  )

  it.each([
    ['GET_ALL_PULSES', GET_ALL_PULSES],
    ['GET_ALL_PULSES_BY_CONTEXT', GET_ALL_PULSES_BY_CONTEXT],
    ['GET_ALL_PULSES_BY_SPACE', GET_ALL_PULSES_BY_SPACE],
  ])('%s selects no privateProfile on any author', (name, doc) => {
    expect(source(doc, name)).not.toContain('privateProfile')
  })

  it.each([
    ['GET_ALL_PULSES', GET_ALL_PULSES, {}],
    [
      'GET_ALL_PULSES_BY_CONTEXT',
      GET_ALL_PULSES_BY_CONTEXT,
      { contextId: 'ctx-1' },
    ],
    [
      'GET_ALL_PULSES_BY_SPACE',
      GET_ALL_PULSES_BY_SPACE,
      { spaceId: 'space-1' },
    ],
  ])(
    `%s plans each of its 4 sub-queries under ${PULSE_LIST_MAX_EXISTS} EXISTS blocks`,
    async (name, doc, variables) => {
      const statements = await compileEach(doc, name, variables)

      // goal / resource / story / coreValue — each root field is planned on
      // its own, so each carries its own budget.
      expect(statements).toHaveLength(4)
      for (const cypher of statements) {
        const blocks = countExists(cypher)
        expect(blocks).toBeGreaterThan(0)
        expect(blocks).toBeLessThanOrEqual(PULSE_LIST_MAX_EXISTS)
        expect(countGateCopies(cypher)).toBe(0)
      }
    },
    120_000
  )

  // Positive control. Every assertion above is a "stays absent" check, and
  // those pass just as happily if the marker stopped being emitted, if the
  // budget were raised past the real cost, or if the gate were dropped from
  // the schema. Re-add one `privateProfile` selection to the exact shape
  // GET_ALL_PULSES used to ship and confirm both counters still move.
  it('still detects a reintroduced privateProfile selection', async () => {
    const [cypher] = await compileEach(
      `
          query {
            goalPulses {
              id title createdAt
              context { id title }
              createdBy { id firstName lastName name privateProfile { id email } }
            }
          }
        `,
      'control'
    )

    expect(countGateCopies(cypher)).toBe(1)
    expect(countExists(cypher)).toBeGreaterThan(PULSE_LIST_MAX_EXISTS)
  }, 120_000)
})
