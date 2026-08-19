import { EnvelopArmor } from '@escape.tech/graphql-armor'
import type { GraphQLError, ValidationContext } from 'graphql'
import logger from '@/lib/logger'

/**
 * Query cost / shape limits for `/api/graphql`.
 *
 * The schema is a graph API over Neo4j, so a single accepted document can cost
 * far more than it looks: every nested selection becomes another expansion, and
 * `Person.privateProfile` is a `@cypher` field whose `@authorization` filter
 * cannot be pushed below the `CALL` — an unfiltered `people { privateProfile {
 * email } }` runs the gate for every Person in the database (measured 2,439
 * dbHits on a 1,216-Person fixture, against 5 for the id-seek equivalent). The
 * schema notes on `PersonPrivateProfile` call out that the right mitigation is
 * general complexity limiting rather than a `privateProfile`-shaped patch,
 * because the cheaper paths — deep nesting, alias fan-out, fragment recursion —
 * are just as able to blow the function's 300 s ceiling. This is that limit.
 *
 * It is a denial-of-service control, not an authorization control. Nothing here
 * decides who may read what; the `@authorization` filters and the resolver
 * guards still do all of that. It only bounds how much work one request may ask
 * for before execution starts.
 *
 * ── Choosing the numbers ────────────────────────────────────────────────────
 * Every limit is set against the measured maximum over all 86 GraphQL documents
 * the app actually ships, with a wide margin so ordinary feature work never
 * trips one:
 *
 *   | limit      | app max | configured | headroom |
 *   | ---------- | ------- | ---------- | -------- |
 *   | cost       |     655 |       5000 |    ~7.6x |
 *   | depth      |       6 |         15 |     2.5x |
 *   | aliases    |       6 |         20 |     3.3x |
 *   | tokens     |     392 |       3000 |     7.6x |
 *
 * `query-limits.test.ts` re-derives the app-side maxima from the source on
 * every run, so a genuinely heavier query fails the test rather than failing in
 * production. Raise the limit deliberately when that happens — do not raise it
 * to whatever the new query happens to need.
 *
 * Introspection is exempt from the cost and depth rules (armor's default). It
 * has to be: the standard introspection query costs ~87k under the same
 * estimator, so any cost ceiling low enough to be useful would break GraphiQL
 * and codegen. That is safe here because introspection returns schema shape,
 * not data, and its cost is bounded by the schema rather than by the request.
 */

const isProduction = process.env.NODE_ENV === 'production'

/** Measured maxima across the app's own documents — see the table above. */
export const OBSERVED_APP_MAXIMA = {
  cost: 655,
  depth: 6,
  aliases: 6,
  tokens: 392,
} as const

export const QUERY_LIMITS = {
  cost: 5000,
  depth: 15,
  aliases: 20,
  directives: 50,
  tokens: 3000,
} as const

/**
 * A rejection is a signal worth seeing — either someone is probing, or a real
 * feature outgrew a limit and needs it raised deliberately. Logged server-side
 * only; the client gets armor's own message.
 */
const onReject = [
  (_ctx: ValidationContext | null, error: GraphQLError) => {
    logger.warn('[graphql] request rejected by query limits', {
      error: error.message,
    })
  },
]

export function createQueryLimitPlugins() {
  const armor = new EnvelopArmor({
    costLimit: {
      maxCost: QUERY_LIMITS.cost,
      // Defaults, pinned explicitly so a library bump cannot silently move the
      // ceiling out from under the measurements above.
      objectCost: 2,
      scalarCost: 1,
      depthCostFactor: 1.5,
      ignoreIntrospection: true,
      onReject,
    },
    maxDepth: { n: QUERY_LIMITS.depth, ignoreIntrospection: true, onReject },
    // Alias fan-out is the cheapest amplification there is: one accepted
    // document can repeat the same expensive root field N times under N names,
    // and depth limiting does not see it.
    maxAliases: { n: QUERY_LIMITS.aliases, onReject },
    maxDirectives: { n: QUERY_LIMITS.directives, onReject },
    // Parse-time, so it also bounds documents that would be too large to
    // validate. No introspection exemption exists at this stage — the ceiling
    // is set well above the introspection query for that reason.
    maxTokens: { n: QUERY_LIMITS.tokens, onReject },
    // "Did you mean …?" turns a rejected field name into a schema-discovery
    // oracle. Kept on in development, where GraphiQL and codegen make the
    // schema readable anyway and the suggestions are useful.
    blockFieldSuggestion: { enabled: isProduction },
  })

  return armor.protect().plugins
}
