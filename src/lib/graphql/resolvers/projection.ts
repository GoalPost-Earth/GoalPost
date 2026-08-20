/**
 * Guard for hand-written field resolvers that shadow a `@relationship` /
 * `@cypher` field the library already owns.
 *
 * `@neo4j/graphql` compiles an entire query tree into ONE Cypher statement and
 * hands every nested field down on `source`. Registering a custom field
 * resolver does not stop that projection — it only shadows it. So a custom
 * resolver that ignores `source` and re-queries the graph silently throws the
 * library's whole subtree away, and with it:
 *
 *   1. every nested field the caller selected below that point. This is how
 *      `spaces { contexts { parentContext { id } } }` came back with
 *      `parentContext: undefined` and blew up on the non-null check — the
 *      re-query returns bare node properties, so any nested field without a
 *      hand-written resolver of its own resolves to null. The failure only
 *      surfaced once GOAL-295 put `parentContext` / `subContexts` in the
 *      space-details query; the shadowing had been silently dropping
 *      `owner { privateProfile { email } }` long before that.
 *   2. the `@authorization` filters the library compiles into the projection —
 *      the raw re-query reads the relationship unfiltered.
 *   3. the single-statement guarantee — one extra session per parent row.
 *
 * These resolvers still earn their place for parents materialized by a CUSTOM
 * root resolver (`searchAll`, `relatedPeople`, `documentsByFieldContext`, the
 * chat / ingest mutations, …). Those return raw node properties and carry no
 * projection at all, so the nested selection has nothing to read. Wrapping the
 * fetch in `relationshipField` serves exactly that case and no other: the
 * library's projection wins whenever it is present.
 */
export function projectedList<T>(
  source: Record<string, unknown>,
  field: string
): T[] | undefined {
  const projected = source[field]
  return Array.isArray(projected) ? (projected as T[]) : undefined
}

/**
 * Wrap a fallback fetcher so the library's projection for `field` is preferred
 * whenever `@neo4j/graphql` resolved the parent itself. See `projectedList`.
 */
export function relationshipField<T>(
  field: string,
  fetch: (source: Record<string, unknown>) => Promise<T[]>
) {
  return (source: Record<string, unknown>): T[] | Promise<T[]> =>
    projectedList<T>(source, field) ?? fetch(source)
}
