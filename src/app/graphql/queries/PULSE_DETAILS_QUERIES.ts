import { graphql } from '@/gql'

export const GET_PULSE_DETAILS_WITH_CONTEXT = graphql(`
  query getPulseDetailsWithContext($pulseId: ID!) {
    fieldPulses(where: { id_EQ: $pulseId }) {
      id
      title
      content
      createdAt
      __typename
      context {
        id
        title
        emergentName
        createdAt
        pulses {
          id
          title
          content
          createdAt
          __typename
        }
        space {
          __typename
          id
          name
          visibility
        }
        meSpace {
          __typename
          id
          name
          visibility
        }
        weSpace {
          __typename
          id
          name
          visibility
        }
      }
    }
  }
`)
