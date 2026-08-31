import { graphql } from '@/gql'

/**
 * Get a PromiseWeave's details — title, description, lifecycle state, the
 * pulses it weaves, and the person it concerns. Mirrors
 * GET_RESONANCE_LINK_DETAILS.
 */
export const GET_PROMISE_WEAVE_DETAILS = graphql(`
  query GetPromiseWeaveDetails($weaveId: ID!) {
    promiseWeaves(where: { id_EQ: $weaveId }) {
      id
      title
      description
      status
      origin
      createdAt
      modifiedAt
      weaves {
        id
        __typename
        title
        content
      }
      wovenFor {
        id
        name
        firstName
        lastName
      }
      createdBy {
        id
        name
        firstName
        lastName
      }
      context {
        id
      }
    }
  }
`)
