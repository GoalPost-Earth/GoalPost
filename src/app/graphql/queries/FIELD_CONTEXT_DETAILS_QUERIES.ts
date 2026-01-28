import { graphql } from '@/gql'

export const GET_FIELD_CONTEXT_DETAILS = graphql(`
  query getFieldContextDetails($contextId: ID!) {
    fieldContexts(where: { id_EQ: $contextId }) {
      id
      title
      emergentName
      createdAt
      pulses {
        __typename
        id
        title
        content
        createdAt
      }
      space {
        id
        name
        visibility
        ... on MeSpace {
          __typename
          id
          name
          visibility
        }
        ... on WeSpace {
          __typename
          id
          name
          visibility
        }
      }
    }
  }
`)
