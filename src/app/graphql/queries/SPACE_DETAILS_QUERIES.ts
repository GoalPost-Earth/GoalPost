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
          ... on Person {
            id
            name
            email
          }
          ... on Community {
            id
            name
            type
          }
        }
        members {
          id
          role
          addedAt
          member {
            __typename
            ... on Person {
              id
              name
              email
            }
            ... on Community {
              id
              name
              type
            }
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
          ... on Person {
            id
            name
            email
          }
          ... on Community {
            id
            name
            type
          }
        }
        members {
          id
          role
          addedAt
          member {
            __typename
            ... on Person {
              id
              name
              email
            }
            ... on Community {
              id
              name
              type
            }
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
