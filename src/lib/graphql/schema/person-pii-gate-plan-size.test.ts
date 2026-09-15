import { readFileSync } from 'node:fs'
import path from 'node:path'
import { Neo4jGraphQL } from '@neo4j/graphql'
import {
  graphql,
  parse,
  print,
  validate,
  specifiedRules,
  type GraphQLSchema,
} from 'graphql'
import { EXCLUDE_DEPRECATED_FIELDS } from '@/lib/graphql/schema-features'
import { gateFieldGuardRule } from '@/lib/graphql/gate-field-guard'
import {
  GET_LOGGED_IN_USER,
  GET_SHELL_USER,
} from '@/app/graphql/queries/DASHBOARD_QUERIES'

/**
 * GOAL-275 / GOAL-372 plan-size guard — no database required.
 *
 * The Person PII gate was originally an identical field-level `@authorization`
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
 * hung forever. GOAL-275 moved the rule to a single TYPE-level filter on
 * `PersonPrivateProfile`, which made the cost flat in field count (29 EXISTS
 * however many fields are selected).
 *
 * GOAL-372 then compacted that one filter from a 5-branch nested `where` into a
 * single `@cypher` predicate (`PersonPrivateProfile.callerCanRead`), which the
 * library emits verbatim instead of expanding into ~29 nested `EXISTS`. Same
 * policy, same admitted callers — measured on dev over all 12 user accounts ×
 * all 639 people, 399 grants either way and zero disagreements.
 *
 *   document             EXISTS      emitted Cypher
 *   GET_PERSON_PROFILE   65 →  40    12,782 → 10,684
 *   GET_LOGGED_IN_USER   45 →  20     9,428 →  7,332
 *   GET_ALL_ME_SPACES    77 →  27    13,135 →  8,366
 *
 * Predicate count is what this suite guards, and deliberately so: it is
 * deterministic, and it is the quantity that went super-linear under GOAL-275.
 * Wall clock is NOT the evidence — with a warm plan cache both versions are
 * 24–25 ms on dev. See kb/06-adr.md (ADR-010).
 *
 * (The EXISTS that remain are the Space / FieldContext / SpaceMembership
 * visibility rules, not this gate — those are a separate, blocked story.)
 *
 * This suite compiles the real schema.gql against a stub driver and asserts
 * both properties directly — flat in field count, and one compact gate — so a
 * regression fails here rather than in production. It captures the emitted
 * Cypher without touching Neo4j.
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
      // Imported, not re-declared: with `implicitEqualFilters` off the library
      // ALSO generates a bare `callerCanRead` alias next to `callerCanRead_EQ`,
      // so a surface assertion written against a local copy of these flags can
      // stay green while the shipped schema widens. See schema-features.ts.
      excludeDeprecatedFields: EXCLUDE_DEPRECATED_FIELDS,
    },
  }).getSchema()
}, 120_000)

/** Compiles a query and returns the Cypher the library would have run. */
async function compile(
  source: string,
  variableValues?: Record<string, unknown>
): Promise<string> {
  captured.length = 0
  const res = await graphql({
    schema,
    source,
    variableValues,
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

/**
 * The REAL shipped document, read out of the query file as text.
 *
 * Read rather than imported on purpose: importing pulls in the `graphql()`
 * codegen wrapper and the generated `src/gql` types, which are regenerated on a
 * different cadence than this schema. Slicing the template literal pins the
 * assertions below to the document the app actually sends, with no build-order
 * coupling — if someone adds a field to GET_PERSON_PROFILE, the budget here
 * moves with it, which is exactly the signal we want.
 */
function shippedDocument(file: string, exportName: string): string {
  const src = readFileSync(
    path.join(process.cwd(), 'src/app/graphql/queries', file),
    'utf8'
  )
  const start = src.indexOf(`export const ${exportName} = graphql(\``)
  if (start < 0) {
    throw new Error(`${exportName} not found in ${file} — was it renamed?`)
  }
  const bodyStart = src.indexOf('`', start) + 1
  const end = src.indexOf('`)', bodyStart)
  const doc = src.slice(bodyStart, end)
  // Give the variables defaults so the document compiles standalone.
  return doc
    .replace('$personId: ID!', '$personId: ID! = "p1"')
    .replace('$id: ID!', '$id: ID! = "p1"')
}

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

    // GOAL-372: the whole gate is now one @cypher predicate the library inlines
    // verbatim, so one copy is 4 EXISTS (branches 2–5; branch 1 is an equality).
    // It was 29 under the declarative rule. Anything approaching a second copy
    // means the filter is being expanded per field again.
    expect(countExists(cypher)).toBeLessThanOrEqual(8)

    // Each branch of the policy should appear exactly once.
    const occurrences = (needle: string) => cypher.split(needle).length - 1
    expect(occurrences('[:CREATED_BY]->')).toBe(1)
    expect(occurrences('[:HAS_PERSON]-')).toBe(1)
    expect(occurrences('MATCH (caller:Person)')).toBe(1)

    // The policy boundaries live in the pattern, not in a comment: a
    // soft-deleted context (GOAL-319) must not be reachable from the gate, and
    // CONNECTED_TO is never a branch.
    expect(cypher).toContain('[:HAS_CONTEXT]-')
    expect(cypher).not.toContain('HAS_DELETED_CONTEXT')
    expect(cypher).not.toContain('HAS_SUBCONTEXT')
    expect(cypher).not.toContain('CONNECTED_TO')
  }, 120_000)

  it('keeps the REAL GET_PERSON_PROFILE document inside its budget', async () => {
    const cypher = await compile(
      shippedDocument('PERSON_QUERIES.ts', 'GET_PERSON_PROFILE')
    )

    // 302 before GOAL-275, 65 after it, 40 after GOAL-372. The 40 that remain
    // are the Space / FieldContext visibility rules on `ownsSpaces`,
    // `memberOf` and `contexts` — a separate story — not this gate.
    expect(countExists(cypher)).toBeLessThanOrEqual(40)
    expect(cypher.length).toBeLessThan(12_000)
  }, 120_000)

  it('keeps the REAL GET_LOGGED_IN_USER document inside its budget', async () => {
    // Fires on every protected page load, so it is the one that has to be
    // cheap. 45 EXISTS before GOAL-372, 20 after.
    const cypher = await compile(
      shippedDocument('DASHBOARD_QUERIES.ts', 'GET_LOGGED_IN_USER')
    )
    expect(countExists(cypher)).toBeLessThanOrEqual(20)
  }, 120_000)

  it('applies the caller filter BEFORE the gate so the index seek survives', async () => {
    const cypher = await compile(gatedQuery(1))

    // This is the assertion that makes the GOAL-372 @cypher gate safe, and the
    // exact reason ADR-010 forbids the same trick on a top-level-queryable
    // type. The library emits a cypher-field filter as
    // `… CALL { <gate> } WITH * WHERE <gate result> = true`, and Neo4j will not
    // push a predicate below a CALL subquery. So the ONLY thing keeping the
    // gate off every :Person in the database is that the caller's own `where`
    // has already been applied, on the initial MATCH, before any CALL opens.
    //
    // `PersonPrivateProfile` is `@query(read: false)` and reachable only
    // through `Person.privateProfile`, so the rows reaching the gate are the
    // rows `people(where:)` already matched. PROFILE on dev confirms it: 1 row
    // enters the gate CALL and every node access is a NodeUniqueIndexSeek, no
    // NodeByLabelScan (2 → 4 total dbHits on a single-row lookup; the +2 is the
    // caller's own index seek).
    //
    // If this ordering ever inverts, the gate becomes a full label scan
    // (measured on the rejected `Person`-level variant: 168 → 146,453 dbHits).
    const matchIndex = cypher.indexOf('MATCH (this:Person)')
    const whereIndex = cypher.indexOf('WHERE this.id =')
    const callIndex = cypher.indexOf('CALL {')
    expect(matchIndex).toBeGreaterThanOrEqual(0)
    expect(whereIndex).toBeGreaterThan(matchIndex)
    expect(whereIndex).toBeLessThan(callIndex)

    // …and the gate really is below that CALL, not hoisted up beside the seek.
    expect(cypher.indexOf('MATCH (caller:Person)')).toBeGreaterThan(callIndex)
  }, 120_000)

  it('does not widen the client-visible where / sort surface', () => {
    // GOAL-372 AC — verified against the BUILT schema, never the directive
    // list (kb/02-user-roles.md).
    const fieldsOf = (typeName: string) => {
      const type = schema.getType(typeName) as unknown as
        | { getFields: () => Record<string, unknown> }
        | undefined
      return type ? Object.keys(type.getFields()) : null
    }

    // Not SELECTABLE: `@selectable(onRead: false, onAggregate: false)` keeps
    // the gate out of the output type entirely.
    expect(fieldsOf('PersonPrivateProfile')).not.toContain('callerCanRead')
    expect(fieldsOf('Person')).not.toContain('callerCanRead')

    // Not SORTABLE: no sort input is generated for this type at all, and the
    // gate must not leak into PersonSort either.
    expect(schema.getType('PersonPrivateProfileSort')).toBeUndefined()
    expect(fieldsOf('PersonSort')).not.toContain('callerCanRead')

    // FILTERABLE in the SDL — and it has to be. `@filterable(byValue: false)`
    // removes `callerCanRead_EQ` from PersonPrivateProfileWhere, and the
    // `@authorization` filter on the type is validated against that same input
    // type, so the schema then fails to build with
    // `Field "callerCanRead_EQ" is not defined by type`. The library offers no
    // way to expose a predicate to `@authorization` but not to the client.
    //
    // Pinned so exactly one predicate appears, and no bare `callerCanRead`
    // alias (which `implicitEqualFilters: false` would add). Reaching it from a
    // client document is closed separately, by the validation rule asserted
    // below.
    const whereFields = fieldsOf('PersonPrivateProfileWhere') ?? []
    expect(whereFields.filter((f) => f.startsWith('callerCanRead'))).toEqual([
      'callerCanRead_EQ',
    ])
  })

  it('rejects the gate predicate in a client document', () => {
    // The SDL cannot hide `callerCanRead_EQ` from the client without breaking
    // its own `@authorization` directive (above), so the guard in
    // gate-field-guard.ts rejects it at validation instead. This is what makes
    // the gate closed BY DESIGN.
    //
    // Do not be reassured by the fact that the filter also fails at runtime
    // today: @neo4j/graphql v6.6.4 emits a cypher-field filter without binding
    // the variable it compares (`CALL { … } WITH * WHERE var2 = $param0`, with
    // `var2` never defined), so Neo4j rejects it with
    // `Variable 'var2' not defined`. That is a library bug, not a defence — a
    // routine upgrade that fixes the emission would quietly make the predicate
    // live. Hence the rule.
    const probe = (query: string) =>
      validate(schema, parse(query), [...specifiedRules, gateFieldGuardRule])

    for (const query of [
      `query { people(where: { privateProfile: { callerCanRead_EQ: true } }) { id } }`,
      `query { people(where: { privateProfile: { NOT: { callerCanRead_EQ: true } } }) { id } }`,
      `query { peopleAggregate(where: { privateProfile: { callerCanRead_EQ: false } }) { count } }`,
      `query { fieldContexts { people(where: { privateProfile: { callerCanRead_EQ: true } }) { id } } }`,
    ]) {
      const errors = probe(query)
      expect(errors.map((e) => e.message)).toEqual([
        'Field "callerCanRead_EQ" is not available on this schema.',
      ])
    }

    // …and it does not get in the way of the documents the app actually sends.
    expect(
      probe(shippedDocument('PERSON_QUERIES.ts', 'GET_PERSON_PROFILE'))
    ).toEqual([])
    expect(
      probe(shippedDocument('DASHBOARD_QUERIES.ts', 'GET_LOGGED_IN_USER'))
    ).toEqual([])
  })

  it('leaves the open directory read completely ungated', async () => {
    // Cross-Space discovery by name must stay free of the gate entirely —
    // SEARCH_PEOPLE_QUERY depends on it (kb/02-user-roles.md).
    const cypher = await compile(`
      query { people(where: { id_EQ: "p1" }) { id firstName lastName name photo } }
    `)
    expect(countExists(cypher)).toBe(0)
  }, 120_000)
})

/**
 * GOAL-371 — the app-shell bootstrap document.
 *
 * `UserDataProvider` runs one query on app init, ahead of the dashboard's own
 * documents, purely to learn the caller's MeSpace id. It used to send
 * GET_LOGGED_IN_USER, PII block and all, which dragged the whole
 * `PersonPrivateProfile` gate onto the critical path for the sake of a single
 * id. Splitting GET_SHELL_USER out of it dropped the emitted Cypher from
 * 45 `EXISTS {` / 9.4k chars to 4 / 1.6k, and `CYPHER replan=force` on dev from
 * 702–761 ms to 118–141 ms (118 dbHits → 53).
 *
 * (That read is skipped while `localStorage.meSpaceId` is set, so it is a cold-
 * session cost rather than a per-navigation one — GOAL-371's premise that it
 * fired on every protected page load did not survive measurement.)
 *
 * These tests compile the *shipped* documents — imported, not copied — so
 * re-adding `privateProfile` to the shell read fails here rather than silently
 * putting the gate back on every protected page load.
 */
describe('GOAL-371 shell document — plan size', () => {
  const VARS = { id: 'p1' }

  it('carries no PII gate at all', async () => {
    const cypher = await compile(print(GET_SHELL_USER), VARS)

    // The gate's two distinctive branches. Zero occurrences of either means
    // `PersonPrivateProfile` is not in the selection set, which is the point.
    expect(cypher.split('[:CREATED_BY]->').length - 1).toBe(0)
    expect(cypher.split('[:HAS_PERSON]-').length - 1).toBe(0)

    // Measured at 4: the MeSpace owner rule (1) plus the WeSpace
    // owner-or-member rule (3). The ticket's budget is 16; anything near it
    // means a gated selection crept back in.
    expect(countExists(cypher)).toBeLessThanOrEqual(16)
  }, 120_000)

  it('is dramatically cheaper than the profile document it was split from', async () => {
    const shell = await compile(print(GET_SHELL_USER), VARS)
    const full = await compile(print(GET_LOGGED_IN_USER), VARS)

    // Guard the guard: if GET_LOGGED_IN_USER ever stopped selecting PII the
    // comparison below would pass for the wrong reason. 45 EXISTS pre-GOAL-372,
    // 16 after — still clearly more than the shell's 4.
    expect(countExists(full)).toBeGreaterThan(10)

    expect(countExists(shell)).toBeLessThan(countExists(full) / 2)
    expect(shell.length).toBeLessThan(3_000)
  }, 120_000)

  it('still resolves ownsSpaces through the Space authorization filters', async () => {
    const cypher = await compile(print(GET_SHELL_USER), VARS)

    // Space-based authorization is the one rule the shell read must keep:
    // MeSpace owner-only, WeSpace owner-or-member (kb/02-user-roles.md).
    expect(cypher).toContain('(this1)<-[:OWNS]-')
    expect(cypher).toContain('[:HAS_MEMBER]->')

    // And the caller filter still precedes the subquery, so the id index seek
    // survives — same invariant the gated query is held to above.
    const matchIndex = cypher.indexOf('MATCH (this:Person)')
    const whereIndex = cypher.indexOf('WHERE this.id =')
    const callIndex = cypher.indexOf('CALL {')
    expect(whereIndex).toBeGreaterThan(matchIndex)
    expect(whereIndex).toBeLessThan(callIndex)
  }, 120_000)
})
