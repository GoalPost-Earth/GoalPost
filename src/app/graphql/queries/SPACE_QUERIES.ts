import { graphql } from '@/gql'

/**
 * Get space members with their roles
 * Query a space by ID and return its members with their roles
 */
export const GET_SPACE_MEMBERS_QUERY = graphql(`
  query GetSpaceMembers($spaceId: ID!) {
    meSpaces(where: { id_EQ: $spaceId }) {
      id
      name
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
          }
        }
      }
    }
    weSpaces(where: { id_EQ: $spaceId }) {
      id
      name
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
          }
        }
      }
    }
  }
`)

/**
 * Get WeSpace details with field contexts
 * Query a WeSpace by ID and return its details including field contexts
 */
export const GET_WE_SPACE_DETAILS_QUERY = graphql(`
  query GetWeSpaceDetails($spaceId: ID!) {
    weSpaces(where: { id_EQ: $spaceId }) {
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
          }
        }
      }
      contexts {
        id
        title
        emergentName
        createdAt
      }
    }
  }
`)

/**
 * Get MeSpace details with field contexts
 * Query a MeSpace by ID and return its details including field contexts and members
 */
export const GET_ME_SPACE_DETAILS_QUERY = graphql(`
  query GetMeSpaceDetails($spaceId: ID!) {
    meSpaces(where: { id_EQ: $spaceId }) {
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
          }
        }
      }
      contexts {
        id
        title
        emergentName
        createdAt
      }
    }
  }
`)
