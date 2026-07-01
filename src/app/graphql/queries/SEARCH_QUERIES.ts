import gql from 'graphql-tag'

/**
 * Global search query across all entity types.
 * Searches for people, contexts, pulses (goal/resource/story), and spaces (me/we).
 *
 * @param query - Search term (case-insensitive substring match)
 * @returns SearchResults with up to 10 results of each entity type
 */
export const SEARCH_ALL = gql`
  query SearchAll($query: String!) {
    searchAll(query: $query) {
      people {
        __typename
        id
        firstName
        lastName
        photo
      }
      contexts {
        __typename
        id
        title
      }
      goalPulses {
        __typename
        id
        title
        content
        createdAt
        intensity
      }
      resourcePulses {
        __typename
        id
        title
        content
        createdAt
        intensity
      }
      storyPulses {
        __typename
        id
        title
        content
        createdAt
        intensity
      }
      meSpaces {
        __typename
        id
        name
        visibility
        createdAt
      }
      weSpaces {
        __typename
        id
        name
        visibility
        createdAt
      }
    }
  }
`
