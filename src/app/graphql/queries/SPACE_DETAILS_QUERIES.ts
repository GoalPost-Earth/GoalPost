import { graphql } from '@/gql'

export const GET_SPACE_DETAILS = graphql(`
  query getSpaceDetailsComplete($spaceId: ID!) {
    spaces(where: { id_EQ: $spaceId }) {
      id
      name
      visibility
      createdAt
      ... on MeSpace {
        id
        name
        visibility
        createdAt
        owner {
          __typename
          id
          firstName
          lastName
          email
        }
        members {
          id
          role
          addedAt
          member {
            __typename
            id
            firstName
            lastName
            email
          }
        }
        contexts {
          id
          title
          emergentName
          createdAt
          pulses {
            __typename
            id
            title
            intensity
          }
        }
      }
      ... on WeSpace {
        id
        name
        visibility
        createdAt
        owner {
          __typename
          id
          firstName
          lastName
          email
        }
        members {
          id
          role
          addedAt
          member {
            __typename
            id
            firstName
            lastName
            email
          }
        }
        contexts {
          id
          title
          emergentName
          createdAt
          pulses {
            __typename
            id
            title
            intensity
          }
        }
      }
    }
  }
`)
