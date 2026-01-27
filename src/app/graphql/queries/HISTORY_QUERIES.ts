import { graphql } from '@/gql'

/**
 * Query to fetch all pulses for the history page
 * Includes GoalPulse, ResourcePulse, and StoryPulse with their contexts and initiators
 */
export const GET_ALL_PULSES = graphql(`
  query GetAllPulses {
    goalPulses {
      __typename
      id
      content
      createdAt
      intensity
      context {
        id
        title
      }
      initiatedBy {
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
    resourcePulses {
      __typename
      id
      content
      createdAt
      intensity
      context {
        id
        title
      }
      initiatedBy {
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
    storyPulses {
      __typename
      id
      content
      createdAt
      intensity
      context {
        id
        title
      }
      initiatedBy {
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
`)

/**
 * Query to fetch all FieldContexts with their pulses
 */
export const GET_ALL_FIELD_CONTEXTS = graphql(`
  query GetAllFieldContexts {
    fieldContexts {
      id
      title
      emergentName
      createdAt
      space {
        id
        name
        visibility
      }
      pulses {
        ... on GoalPulse {
          __typename
          id
          createdAt
        }
        ... on ResourcePulse {
          __typename
          id
          createdAt
        }
        ... on StoryPulse {
          __typename
          id
          createdAt
        }
      }
    }
  }
`)

/**
 * Query to fetch all MeSpaces with their contexts and members
 */
export const GET_ALL_ME_SPACES = graphql(`
  query GetAllMeSpaces {
    meSpaces {
      id
      name
      visibility
      createdAt
      owner {
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
      contexts {
        id
        title
        createdAt
      }
    }
  }
`)

/**
 * Query to fetch all WeSpaces with their contexts and members
 */
export const GET_ALL_WE_SPACES = graphql(`
  query GetAllWeSpaces {
    weSpaces {
      id
      name
      visibility
      createdAt
      owner {
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
      contexts {
        id
        title
        createdAt
      }
    }
  }
`)
