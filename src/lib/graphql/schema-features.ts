import type { Neo4jGraphQLConstructor } from '@neo4j/graphql'

type ExcludeDeprecatedFields = NonNullable<
  NonNullable<Neo4jGraphQLConstructor['features']>['excludeDeprecatedFields']
>

/**
 * The `excludeDeprecatedFields` flags the LIVE `/api/graphql` schema is built
 * with, in one place so tests can assert against the real surface.
 *
 * These are not cosmetic. `@neo4j/graphql` v6 keeps deprecated duplicates of
 * several generated inputs unless they are switched off, and at least one of
 * them is load-bearing for the GOAL-275 / GOAL-372 Person PII gate:
 * `implicitEqualFilters: false` makes the library generate a bare
 * `callerCanRead: Boolean` alias alongside `callerCanRead_EQ` in
 * `PersonPrivateProfileWhere` — a second name for the same predicate, which the
 * gate's surface test would not be looking for.
 *
 * `person-pii-gate-plan-size.test.ts` used to re-declare this literal, so
 * dropping a flag in `apollo-server.ts` would have widened the shipped
 * where-surface with a green test. It imports this constant instead, the way
 * `query-limits.test.ts` imports `QUERY_LIMITS` — so "configured" and
 * "asserted" cannot drift.
 *
 * NOTE: `apollo.ts` (legacy) and the other schema test suites still carry their
 * own copies. Folding those in is a separate cleanup.
 */
export const EXCLUDE_DEPRECATED_FIELDS = {
  implicitEqualFilters: true,
  implicitSet: true,
  deprecatedOptionsArgument: true,
  directedArgument: true,
  connectOrCreate: true,
} as const satisfies ExcludeDeprecatedFields
