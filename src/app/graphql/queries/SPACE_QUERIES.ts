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
          name
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
          name
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
        name
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
          name
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
        name
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
          name
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
 * Get WeSpace members with their connections for canvas visualization
 * Returns owner and members with their person-to-person connections
 */
export const GET_WE_SPACE_MEMBERS_WITH_CONNECTIONS_QUERY = graphql(`
  query GetWeSpaceMembersWithConnections($spaceId: ID!) {
    weSpaces(where: { id_EQ: $spaceId }) {
      id
      name
      owner {
        id
        firstName
        lastName
        name
        email
        photo
      }
      members {
        id
        role
        member {
          id
          firstName
          lastName
          name
          email
          photo
        }
      }
    }
  }
`)

/**
 * Get person connections by person IDs
 * Fetches separately to avoid nested query issues
 */
export const GET_PERSON_CONNECTIONS = graphql(`
  query GetPersonConnections($personIds: [ID!]!) {
    people(where: { id_IN: $personIds }) {
      id
      connections {
        id
        firstName
        lastName
        name
        email
        photo
      }
    }
  }
`)
