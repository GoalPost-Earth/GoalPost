import { graphql } from '@/gql'

/**
 * Resolve a person by email to get their ID
 */
export const RESOLVE_PERSON_BY_EMAIL_QUERY = graphql(`
  query ResolvePersonByEmail($email: String!) {
    people(where: { email_EQ: $email }) {
      id
      name
      email
    }
  }
`)

/**
 * Add a member to a space with a specific role
 */
export const ADD_SPACE_MEMBER_MUTATION = graphql(`
  mutation AddSpaceMember($spaceId: ID!, $memberId: ID!, $role: SpaceRole!) {
    addSpaceMember(spaceId: $spaceId, memberId: $memberId, role: $role) {
      success
      message
      membership {
        id
        role
        addedAt
      }
    }
  }
`)

/**
 * Update a member's role in a space
 */
export const UPDATE_SPACE_MEMBER_ROLE_MUTATION = graphql(`
  mutation UpdateSpaceMemberRole(
    $spaceId: ID!
    $memberId: ID!
    $role: SpaceRole!
  ) {
    updateSpaceMemberRole(spaceId: $spaceId, memberId: $memberId, role: $role) {
      success
      message
      membership {
        id
        role
        addedAt
      }
    }
  }
`)

/**
 * Remove a member from a space
 */
export const REMOVE_SPACE_MEMBER_MUTATION = graphql(`
  mutation RemoveSpaceMember($spaceId: ID!, $memberId: ID!) {
    removeSpaceMember(spaceId: $spaceId, memberId: $memberId) {
      success
      message
    }
  }
`)

/**
 * Update a MeSpace
 */
export const UPDATE_ME_SPACE_MUTATION = graphql(`
  mutation UpdateMeSpace($where: MeSpaceWhere!, $update: MeSpaceUpdateInput!) {
    updateMeSpaces(where: $where, update: $update) {
      meSpaces {
        id
        name
        visibility
        createdAt
        owner {
          id
          name
        }
        contexts {
          id
          title
        }
      }
    }
  }
`)

/**
 * Update a WeSpace
 */
export const UPDATE_WE_SPACE_MUTATION = graphql(`
  mutation UpdateWeSpace($where: WeSpaceWhere!, $update: WeSpaceUpdateInput!) {
    updateWeSpaces(where: $where, update: $update) {
      weSpaces {
        id
        name
        visibility
        createdAt
        owner {
          id
          name
        }
        contexts {
          id
          title
        }
      }
    }
  }
`)

/**
 * Delete a MeSpace
 */
export const DELETE_ME_SPACE_MUTATION = graphql(`
  mutation DeleteMeSpace($where: MeSpaceWhere!) {
    deleteMeSpaces(where: $where) {
      nodesDeleted
      relationshipsDeleted
    }
  }
`)

/**
 * Delete a WeSpace
 */
export const DELETE_WE_SPACE_MUTATION = graphql(`
  mutation DeleteWeSpace($where: WeSpaceWhere!) {
    deleteWeSpaces(where: $where) {
      nodesDeleted
      relationshipsDeleted
    }
  }
`)
