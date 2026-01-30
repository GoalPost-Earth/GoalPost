import { graphql } from '@/gql'

/**
 * Get all MeSpaces owned by the current user
 */
export const GET_USER_ME_SPACES_QUERY = graphql(`
  query GetUserMeSpaces {
    meSpaces {
      id
      name
      visibility
      createdAt
      contexts {
        id
        title
      }
    }
  }
`)

/**
 * Get all WeSpaces where the current user is a member
 */
export const GET_USER_WE_SPACES_QUERY = graphql(`
  query GetUserWeSpaces {
    weSpaces {
      id
      name
      visibility
      createdAt
      members {
        id
        role
      }
      contexts {
        id
        title
      }
    }
  }
`)

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
          id
          firstName
          lastName
          email
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
          id
          firstName
          lastName
          email
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
      }
    }
  }
`)
