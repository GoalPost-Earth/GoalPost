import { readFileSync } from 'node:fs'
import path from 'node:path'
import { Neo4jGraphQL } from '@neo4j/graphql'
import { graphql, print, type GraphQLSchema } from 'graphql'
import { GET_FIELD_CONTEXT_PEOPLE } from '@/app/graphql/queries/FIELD_CONTEXT_PEOPLE_QUERIES'

/**
 * GOAL-346 roster filter — no database required.
 *
 * Document Ingestion (WF-10) and Bulk Article Import (WF-11) both land the
 * people they extract on `(FieldContext)-[:HAS_PERSON]->(Person)`, which is
 * also the field's People roster. At import volume the roster stopped showing
 * the field's people and started showing the document's (54 of 54 on the demo
 * DB when the ticket was filed). Extraction-found people now carry
 * `Person.extractionFound` and the roster query filters on it.
 *
 * This suite compiles the REAL shipped query against the REAL schema.gql and
 * asserts three things that a well-meaning refactor could silently undo:
 *
 *   1. the predicate survives into the emitted Cypher at all;
 *   2. it is opt-out — an unmarked person (hand-added, or predating GOAL-346)
 *      is NOT filtered, so the fix cannot empty a roster it was never about;
 *   3. `HAS_PERSON` itself is untouched. Narrowing that edge is the failure
 *      mode the ticket calls out as fail-closed: it is the only Space tie a
 *      PersonPulse has, so it would blank their gated PII outright
 *      (kb/02-user-roles.md branch 5), and ten authorization gates read it.
 *
 * The stub driver captures the emitted Cypher instead of running it — the same
 * harness `person-pii-gate-plan-size.test.ts` uses.
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
      authorization: { key: 'roster-filter-guard-secret' },
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

describe('GOAL-346 — FieldContext People roster excludes extraction-found people', () => {
  it('compiles the shipped roster query and emits the extractionFound predicate', async () => {
    const cypher = await compile(print(GET_FIELD_CONTEXT_PEOPLE), {
      contextId: 'ctx-1',
    })

    // Guard the guard: an empty capture would satisfy a bare `not.toContain`.
    expect(cypher).toContain('[:HAS_PERSON]')
    expect(cypher).toContain('extractionFound')
  }, 120_000)

  it('is NULL-safe — a person with no marker is NOT filtered out', async () => {
    const cypher = await compile(print(GET_FIELD_CONTEXT_PEOPLE), {
      contextId: 'ctx-1',
    })

    const rosterPredicate = cypher
      .split('\n')
      .filter((line) => line.includes('extractionFound'))
      .join('\n')

    // THE regression this file exists for. The obvious spelling of the filter,
    // `where: { NOT: { extractionFound_EQ: true } }`, compiles to
    // `WHERE NOT (p.extractionFound = $param)` — and in Cypher's three-valued
    // logic `NOT (null = true)` is NULL, which a WHERE treats as false. Every
    // person with no marker (i.e. everyone, before the backfill runs, and every
    // hand-added person forever) is then dropped: measured 0 of 4 on dev's
    // North Star field. The filter must name the NULL case explicitly.
    expect(rosterPredicate).toContain('IS NULL')
    expect(rosterPredicate).not.toMatch(/WHERE\s+NOT\s*\(/)
  }, 120_000)

  it('does not narrow the HAS_PERSON edge itself', async () => {
    const cypher = await compile(print(GET_FIELD_CONTEXT_PEOPLE), {
      contextId: 'ctx-1',
    })

    // The filter is a `where` on the projected nodes. The traversal must stay
    // a plain HAS_PERSON hop — anything relationship-scoped here would also
    // narrow the PersonPrivateProfile `contexts_SOME` READ branch.
    expect(cypher).toMatch(/-\[[^\]]*:HAS_PERSON\]->/)
  }, 120_000)

  it('keeps extractionFound out of the generated write inputs', () => {
    // `@settable(onCreate: false, onUpdate: false)`: no client may hide a
    // person from a roster (or un-hide one) through createPeople/updatePeople.
    // The only writers are the extraction paths and addPersonToFieldContext.
    const createInput = schema.getType('PersonCreateInput')
    const updateInput = schema.getType('PersonUpdateInput')
    expect(createInput).toBeDefined()
    expect(updateInput).toBeDefined()

    const fieldsOf = (t: unknown) =>
      Object.keys(
        (t as { getFields: () => Record<string, unknown> }).getFields()
      )
    expect(fieldsOf(createInput)).not.toContain('extractionFound')
    expect(fieldsOf(updateInput)).not.toContain('extractionFound_SET')
    expect(fieldsOf(updateInput)).not.toContain('extractionFound')
  })

  it('keeps extractionFound filterable — the roster filter depends on it', () => {
    const personWhere = schema.getType('PersonWhere')
    expect(personWhere).toBeDefined()
    const fields = Object.keys(
      (personWhere as { getFields: () => Record<string, unknown> }).getFields()
    )
    expect(fields).toContain('extractionFound_EQ')
    // Exactly one operator. A Boolean has no string family, but pin it anyway:
    // every operator on a root any authenticated caller can read cross-Space is
    // a query surface, and GOAL-275's `email` lesson was that the family ships
    // together or not at all.
    expect(fields.filter((f) => f.startsWith('extractionFound'))).toEqual([
      'extractionFound_EQ',
    ])
    // Not sortable — ordering is its own oracle (the SORTING note in
    // schema.gql) and nothing needs to order by provenance.
    const personSort = schema.getType('PersonSort')
    expect(
      Object.keys(
        (personSort as { getFields: () => Record<string, unknown> }).getFields()
      )
    ).not.toContain('extractionFound')
  })
})

/**
 * The invariant the rest of the design rests on: a person is hidden from the
 * roster ONLY when they also get the `EXTRACTED_FROM` edge that puts them on
 * `Document.extractedPeople`.
 *
 * That document listing is the only surface a hidden person is reachable from.
 * Marking someone with no source Document strands them — gone from the roster,
 * on no document, so nobody can promote them and (until detach is added there)
 * nobody can remove them either. The first cut of GOAL-346 did exactly that to
 * Bulk Article Import row authors.
 *
 * Asserted against the source rather than through the schema: the failure mode
 * is a future "this is extraction" signal that is not the document, and that is
 * visible right here without standing up a live-Neo4j test per write path.
 */
describe('GOAL-346 — the marker is never written without a source Document', () => {
  const read = (rel: string) =>
    readFileSync(path.join(process.cwd(), rel), 'utf8')

  it('create_person keys the marker on the same `d` as the EXTRACTED_FROM edge', () => {
    const hitl = read('src/lib/chat/hitl.ts')
    expect(hitl).toContain('SET p.extractionFound = (d IS NOT NULL)')
    // `d` is the OPTIONAL MATCH on $documentId, and it is exactly what the
    // EXTRACTED_FROM write is guarded on. Same binding, same condition.
    expect(hitl).toContain('OPTIONAL MATCH (d:Document {id: $documentId})')
    expect(hitl).toContain('CREATE (p)-[:EXTRACTED_FROM]->(d)')
  })

  it('no write path sets the marker true on its own terms', () => {
    for (const rel of [
      'src/lib/chat/hitl.ts',
      'src/lib/imports/article-import-service.ts',
      'src/lib/imports/article-content-ingest.ts',
      'src/lib/graphql/resolvers/field-context-people-resolver.ts',
    ]) {
      // The backfill is the one place a literal `= true` is legitimate, and it
      // carries its own EXTRACTED_FROM guard (asserted below).
      expect(read(rel)).not.toMatch(/extractionFound\s*=\s*true/)
    }
  })

  it('the backfill only marks people that carry the Document edge', () => {
    const backfill = read('scripts/backfill-extraction-found.ts')
    expect(backfill).toContain('EXISTS { (p)-[:EXTRACTED_FROM]->(:Document) }')
    expect(backfill).toContain('WHERE NOT p:User')
  })
})
