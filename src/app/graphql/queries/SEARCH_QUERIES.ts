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
        id
        firstName
        lastName
        email
      }
      contexts {
        id
        title
      }
      goalPulses {
        id
        content
        createdAt
        intensity
      }
      resourcePulses {
        id
        content
        createdAt
        intensity
      }
      storyPulses {
        id
        content
        createdAt
        intensity
      }
      meSpaces {
        id
        name
        visibility
        createdAt
      }
      weSpaces {
        id
        name
        visibility
        createdAt
      }
      communities {
        id
        name
        type
      }
    }
  }
`
