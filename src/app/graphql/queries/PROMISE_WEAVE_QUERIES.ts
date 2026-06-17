import { graphql } from '@/gql'

/**
 * Get a PromiseWeave's details — title, status, the pulses it weaves, and the
 * person it concerns. Mirrors GET_RESONANCE_LINK_DETAILS; weaves are read-only
 * (the PromiseWeave type has `@mutation(operations: [])`), so the drawer that
 * consumes this has no edit/delete path yet.
 */
export const GET_PROMISE_WEAVE_DETAILS = graphql(`
  query GetPromiseWeaveDetails($weaveId: ID!) {
    promiseWeaves(where: { id_EQ: $weaveId }) {
      id
      title
      status
      createdAt
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
      context {
        id
      }
    }
  }
`)
