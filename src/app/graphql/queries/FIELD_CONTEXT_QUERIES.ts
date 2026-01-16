import { graphql } from '@/gql'

/**
 * Query to fetch all FieldContexts (fields)
 * Can be filtered by various conditions
 */
export const GET_FIELD_CONTEXTS = graphql(`
  query GetFieldContexts($where: FieldContextWhere) {
    fieldContexts(where: $where) {
      id
      title
      emergentName
      createdAt
      space {
        id
        name
        visibility
      }
    }
  }
`)

/**
 * Query to fetch the current user's MeSpace fields
 * Gets all fields linked to the authenticated user's personal MeSpace
 * Since there's only one MeSpace per user and currently only one in the system,
 * we fetch all and filter client-side
 */
export const GET_ME_SPACE_FIELDS = graphql(`
  query GetMeSpaceFields {
    meSpaces {
      id
      name
      owner {
        ... on Person {
          id
        }
        ... on Community {
          id
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
 * Query to fetch fields for a specific WeSpace
 * Filters by space_SOME with id_EQ to get only fields linked to that WeSpace
 */
export const GET_FIELDS_FOR_SPACE = graphql(`
  query GetFieldsForSpace($spaceId: ID!) {
    fieldContexts(where: { space_SOME: { id_EQ: $spaceId } }) {
      id
      title
      emergentName
      createdAt
      space {
        id
        name
        visibility
      }
    }
  }
`)

/**
 * Query to fetch a single FieldContext by ID
 */
export const GET_FIELD_CONTEXT_BY_ID = graphql(`
  query GetFieldContextById($id: ID!) {
    fieldContexts(where: { id_EQ: $id }) {
      id
      title
      emergentName
      createdAt
      space {
        id
        name
        visibility
      }
    }
  }
`)

/**
 * Query to fetch fields for a space with pagination
 * Useful for large field collections
 * Uses offset/limit parameters per GraphQL schema
 */
export const GET_FIELDS_FOR_SPACE_PAGINATED = graphql(`
  query GetFieldsForSpacePaginated($spaceId: ID!, $offset: Int, $limit: Int) {
    fieldContexts(
      where: { space_SOME: { id_EQ: $spaceId } }
      offset: $offset
      limit: $limit
    ) {
      id
      title
      emergentName
      createdAt
      space {
        id
        name
        visibility
      }
    }
  }
`)
