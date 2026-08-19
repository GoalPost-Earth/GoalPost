import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import {
  parse,
  validate,
  buildSchema,
  Kind,
  Source,
  Lexer,
  TokenKind,
  getIntrospectionQuery,
  type DocumentNode,
  type GraphQLError,
  type ValidationContext,
} from 'graphql'
import { Neo4jGraphQL } from '@neo4j/graphql'
import { createYoga } from 'graphql-yoga'
import { costLimitRule } from '@escape.tech/graphql-armor-cost-limit'
import { maxDepthRule } from '@escape.tech/graphql-armor-max-depth'
import { maxAliasesRule } from '@escape.tech/graphql-armor-max-aliases'
import {
  QUERY_LIMITS,
  OBSERVED_APP_MAXIMA,
  createQueryLimitPlugins,
} from './query-limits'

/**
 * Two halves, and both matter:
 *
 *  1. **The limits do not break the app.** Every GraphQL document the app ships
 *     is re-measured from source on each run and checked against the ceilings.
 *     If someone writes a genuinely heavier query, this fails here instead of
 *     in production — and raising the limit becomes a deliberate decision with
 *     a number attached, not a mystery 400 in the browser.
 *
 *  2. **The limits actually reject.** A depth bomb, an alias bomb and a cost
 *     bomb are each measured over the ceiling and then confirmed rejected, so
 *     "configured" and "enforced" cannot drift apart.
 *
 * The rules are pure document analysis, so a stub schema satisfies validate().
 */

const stubSchema = buildSchema('type Query { _: String }')

// ── measure helpers ─────────────────────────────────────────────────────────

/**
 * `propagateOnRejection: false` routes a breach to `onReject` instead of
 * throwing, so the measured value can be read straight out of the message.
 * Returns null when the document is under the (deliberately zero) ceiling.
 */
function measure(
  doc: DocumentNode,
  makeRule: (opts: Record<string, unknown>) => unknown
): number | null {
  let found: number | null = null
  const rule = makeRule({
    exposeLimits: true,
    propagateOnRejection: false,
    onReject: [
      (_ctx: ValidationContext | null, err: GraphQLError) => {
        const m = err.message.match(/found ([0-9]+(?:\.[0-9]+)?)/)
        if (m) found = Number(m[1])
      },
    ],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any
  validate(stubSchema, doc, [rule])
  return found
}

const costOf = (doc: DocumentNode) =>
  measure(doc, (o) => costLimitRule({ maxCost: 0, ...o })) ?? 0
const depthOf = (doc: DocumentNode) =>
  measure(doc, (o) => maxDepthRule({ n: 0, ...o })) ?? 0
const aliasesOf = (doc: DocumentNode) =>
  measure(doc, (o) => maxAliasesRule({ n: 0, ...o })) ?? 0

function tokensOf(text: string): number {
  const lexer = new Lexer(new Source(text))
  let n = 0
  while (lexer.advance().kind !== TokenKind.EOF) n++
  return n
}

// ── collect every GraphQL document the app ships ────────────────────────────

interface AppDoc {
  name: string
  file: string
  doc: DocumentNode
  text: string
}

function collectAppDocuments(): AppDoc[] {
  const files: string[] = []
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      // `src/gql` is generated — it re-exports the same documents as strings.
      if (entry === 'node_modules' || entry === 'gql') continue
      const p = path.join(dir, entry)
      if (statSync(p).isDirectory()) walk(p)
      else if (/\.(ts|tsx)$/.test(p)) files.push(p)
    }
  }
  walk(path.join(process.cwd(), 'src'))

  const re = /\b(?:graphql|gql)\(\s*`([\s\S]*?)`\s*\)/g
  const out: AppDoc[] = []
  for (const file of files) {
    const src = readFileSync(file, 'utf8')
    let m: RegExpExecArray | null
    while ((m = re.exec(src))) {
      const text = m[1]
      if (!/\b(query|mutation|subscription|fragment)\b/.test(text)) continue
      let doc: DocumentNode
      try {
        doc = parse(text)
      } catch {
        continue // interpolated template — not a standalone document
      }
      const op = doc.definitions.find(
        (d) => d.kind === Kind.OPERATION_DEFINITION
      )
      const name =
        op && 'name' in op && op.name ? op.name.value : '(anonymous)'
      out.push({ name, file: path.relative(process.cwd(), file), doc, text })
    }
  }
  return out
}

const appDocs = collectAppDocuments()

/**
 * A selection chain deep enough to breach the depth ceiling (16 > 15) but
 * cheap enough to stay under the cost ceiling (~2.2k < 5k), so the depth rule
 * can be shown firing on its own rather than being masked by cost.
 */
const DEEP_CHAIN = (() => {
  let inner = 'id'
  for (let i = 0; i < 7; i++) {
    inner = `privateProfile { connections { ${inner} } }`
  }
  return inner
})()

describe('query limits — the app fits inside them', () => {
  it('finds the app documents at all (guards the scanner itself)', () => {
    // If the scan silently returns nothing, every check below passes
    // vacuously. 50 is well under the ~86 present today.
    expect(appDocs.length).toBeGreaterThan(50)
  })

  it.each([
    ['cost', QUERY_LIMITS.cost, (d: AppDoc) => costOf(d.doc)],
    ['depth', QUERY_LIMITS.depth, (d: AppDoc) => depthOf(d.doc)],
    ['aliases', QUERY_LIMITS.aliases, (d: AppDoc) => aliasesOf(d.doc)],
    ['tokens', QUERY_LIMITS.tokens, (d: AppDoc) => tokensOf(d.text)],
  ] as const)('no shipped document exceeds the %s limit', (_l, limit, of) => {
    const worst = appDocs
      .map((d) => ({ d, v: of(d) }))
      .sort((a, b) => b.v - a.v)[0]
    // Named so a failure says WHICH query outgrew the ceiling.
    expect({
      query: worst.d.name,
      file: worst.d.file,
      value: worst.v,
    }).toMatchObject({ value: expect.any(Number) })
    expect(worst.v).toBeLessThan(limit)
  })

  it('the recorded maxima are still accurate (limits stay meaningful)', () => {
    // The headroom table in query-limits.ts is only useful while it is true.
    // Drifting well below is fine; drifting ABOVE means the doc lies.
    expect(Math.max(...appDocs.map((d) => costOf(d.doc)))).toBeLessThanOrEqual(
      OBSERVED_APP_MAXIMA.cost
    )
    expect(Math.max(...appDocs.map((d) => depthOf(d.doc)))).toBeLessThanOrEqual(
      OBSERVED_APP_MAXIMA.depth
    )
    expect(
      Math.max(...appDocs.map((d) => aliasesOf(d.doc)))
    ).toBeLessThanOrEqual(OBSERVED_APP_MAXIMA.aliases)
    expect(Math.max(...appDocs.map((d) => tokensOf(d.text)))).toBeLessThanOrEqual(
      OBSERVED_APP_MAXIMA.tokens
    )
  })

  it('introspection is exempt from cost and depth', () => {
    // Not a nicety — the standard introspection query costs ~87k under this
    // estimator, so without the exemption GraphiQL and codegen would 400.
    const doc = parse(getIntrospectionQuery())
    expect(costOf(doc)).toBe(0)
    expect(depthOf(doc)).toBe(0)
    // maxTokens has no introspection exemption (it runs at parse time), so the
    // ceiling has to clear it outright.
    expect(tokensOf(getIntrospectionQuery())).toBeLessThan(QUERY_LIMITS.tokens)
  })
})

describe('query limits — the bombs are over the line', () => {
  it('a depth bomb exceeds the depth ceiling while staying under cost', () => {
    // privateProfile { connections { … } } adds 2 levels per repetition. Seven
    // repetitions is the sweet spot: depth 16 (over) at cost ~2.2k (under), so
    // this proves the DEPTH rule fires on its own. Nest any further and the
    // cost rule catches it first — cost grows as depthCostFactor^depth — which
    // is the intended overlap, just not what this case is testing.
    const doc = parse(`query { people { ${DEEP_CHAIN} } }`)
    expect(depthOf(doc)).toBeGreaterThan(QUERY_LIMITS.depth)
    expect(costOf(doc)).toBeLessThan(QUERY_LIMITS.cost)
  })

  it('an alias bomb exceeds the alias ceiling', () => {
    const fields = Array.from(
      { length: QUERY_LIMITS.aliases + 5 },
      (_, i) => `a${i}: people { id }`
    ).join('\n')
    expect(aliasesOf(parse(`query { ${fields} }`))).toBeGreaterThan(
      QUERY_LIMITS.aliases
    )
  })

  it('a cost bomb exceeds the cost ceiling while staying under the others', () => {
    // Deliberately legal on depth (14 < 15) and aliases (4 < 20), so this
    // proves the COST rule is the one doing the work. Without it, a request
    // shaped exactly like this — well inside every structural limit — still
    // asks for ~11x the most expensive thing the app itself ever sends.
    let inner = 'id email phone pronouns location'
    for (let i = 0; i < 6; i++) {
      inner = `privateProfile { connections { ${inner} } }`
    }
    const fields = Array.from(
      { length: 4 },
      (_, i) => `a${i}: people { ${inner} }`
    ).join('\n')
    const doc = parse(`query { ${fields} }`)

    expect(costOf(doc)).toBeGreaterThan(QUERY_LIMITS.cost)
    expect(depthOf(doc)).toBeLessThan(QUERY_LIMITS.depth)
    expect(aliasesOf(doc)).toBeLessThan(QUERY_LIMITS.aliases)
  })
})

/**
 * The half that matters most: measuring a bomb over the ceiling proves nothing
 * if the plugins never reach the running server. This drives the REAL schema
 * through a Yoga instance built with `createQueryLimitPlugins()` — the same
 * call apollo-server.ts makes — so "configured" and "enforced" cannot drift.
 *
 * No driver is attached: these requests are rejected (or fail on execution)
 * before any Cypher would run, and the assertions only look at whether the
 * limit fired.
 */
describe('query limits — enforced through Yoga', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let yoga: any

  beforeAll(async () => {
    const typeDefs = readFileSync(
      path.join(process.cwd(), 'src/lib/graphql/schema/schema.gql'),
      'utf8'
    )
    const neoSchema = new Neo4jGraphQL({
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
      features: {
        authorization: { key: process.env.JWT_SECRET ?? 'jwt' },
        excludeDeprecatedFields: {
          implicitEqualFilters: true,
          implicitSet: true,
          deprecatedOptionsArgument: true,
          directedArgument: true,
          connectOrCreate: true,
        },
      },
    })
    yoga = createYoga({
      schema: await neoSchema.getSchema(),
      graphqlEndpoint: '/api/graphql',
      plugins: createQueryLimitPlugins(),
    })
  }, 180_000)

  const post = async (query: string) => {
    const res = await yoga.fetch('http://test.local/api/graphql', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query }),
    })
    return (await res.json()) as { errors?: Array<{ message: string }> }
  }

  const messages = (r: { errors?: Array<{ message: string }> }) =>
    (r.errors ?? []).map((e) => e.message).join(' | ')

  it('rejects a cost bomb', async () => {
    let inner = 'id email phone pronouns location'
    for (let i = 0; i < 6; i++) {
      inner = `privateProfile { connections { ${inner} } }`
    }
    const fields = Array.from(
      { length: 4 },
      (_, i) => `a${i}: people { ${inner} }`
    ).join('\n')
    expect(messages(await post(`query { ${fields} }`))).toMatch(/Cost limit/i)
  })

  it('rejects a depth bomb', async () => {
    // Under the cost ceiling by construction (see DEEP_CHAIN), so a pass here
    // is the depth rule and not the cost rule standing in for it.
    expect(messages(await post(`query { people { ${DEEP_CHAIN} } }`))).toMatch(
      /depth limit/i
    )
  })

  it('rejects an alias bomb', async () => {
    const fields = Array.from(
      { length: QUERY_LIMITS.aliases + 5 },
      (_, i) => `a${i}: people { id }`
    ).join('\n')
    expect(messages(await post(`query { ${fields} }`))).toMatch(/alias/i)
  })

  it('rejects a token bomb', async () => {
    const fields = Array(QUERY_LIMITS.tokens).fill('id').join(' ')
    expect(messages(await post(`query { people { ${fields} } }`))).toMatch(
      /token/i
    )
  })

  it('still serves introspection', async () => {
    const res = await post(getIntrospectionQuery())
    expect(messages(res)).not.toMatch(/limit|token|alias|depth/i)
  })

  it('lets the app’s heaviest real document through', async () => {
    const worst = appDocs
      .map((d) => ({ d, v: costOf(d.doc) }))
      .sort((a, b) => b.v - a.v)[0].d
    // It will fail on execution (no driver) or on missing variables — the
    // point is only that no LIMIT fired.
    expect(messages(await post(worst.text))).not.toMatch(
      /Cost limit|depth limit|aliases|tokens/i
    )
  })
})
