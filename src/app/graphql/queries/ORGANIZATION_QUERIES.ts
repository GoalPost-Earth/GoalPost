import { graphql } from '@/gql'

/**
 * Get an Organization's details — name, description, the pulses it is related
 * to / named in (MENTIONED_IN), and the FieldContext(s) it is attached to
 * (HAS_ORGANIZATION). Read-only: the Organization type has
 * `@mutation(operations: [])` (GOAL-298), so the drawer that consumes this has
 * no edit/delete path — orgs are minted/enriched only by the doc-ingestion
 * write path. The type-level `@authorization` READ filter (contexts_SOME)
 * means an org unreachable through any Space the viewer can see is filtered
 * out entirely, so an empty result is the correct "no longer available" signal.
 */
export const GET_ORGANIZATION_DETAILS = graphql(`
  query GetOrganizationDetails($organizationId: ID!) {
    organizations(where: { id_EQ: $organizationId }) {
      id
      name
      description
      createdAt
      updatedAt
      mentionedIn {
        id
        __typename
        title
        content
      }
      contexts {
        id
        title
      }
    }
  }
`)
