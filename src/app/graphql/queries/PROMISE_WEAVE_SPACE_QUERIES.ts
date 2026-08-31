import gql from 'graphql-tag'

/**
 * Every PromiseWeave surfaced inside one Space, for the Dashboard card view
 * (GOAL-343).
 *
 * Reach is the HAS_WEAVE → FieldContext → Space chain and nothing else: the
 * `context_SOME` filter walks the weave's own context edge back to this space,
 * and PromiseWeave's `@authorization` READ filter (schema.gql) still applies on
 * top, because this is a library-generated read — no separate visibility rule,
 * and no raw Cypher to restate one in.
 *
 * Newest-first and capped at 20 so the card grid stays bounded and its order
 * is deterministic rather than planner-arbitrary; a space with more weaves
 * than that needs a "show all" affordance, which belongs to the authoring
 * story alongside the create/edit path.
 *
 * `graphql-tag` rather than the codegen'd `graphql()` helper, matching
 * SEARCH_QUERIES.ts: codegen introspects a running dev server, and this query
 * needs no generated types to be correct.
 */
export const GET_SPACE_PROMISE_WEAVES = gql`
  query GetSpacePromiseWeaves($spaceId: ID!) {
    promiseWeaves(
      where: {
        context_SOME: {
          OR: [
            { meSpace_SOME: { id_EQ: $spaceId } }
            { weSpace_SOME: { id_EQ: $spaceId } }
          ]
        }
      }
      sort: [{ createdAt: DESC }]
      limit: 20
    ) {
      __typename
      id
      title
      status
      createdAt
      wovenFor {
        id
        name
      }
      weaves {
        id
        title
      }
      context {
        id
        title
      }
    }
  }
`
