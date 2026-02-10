import { graphql } from '@/gql'

export const GET_PULSE_DETAILS_WITH_CONTEXT = graphql(`
  query getPulseDetailsWithContext($pulseId: ID!) {
    goalPulses(where: { id_EQ: $pulseId }) {
      id
      title
      content
      createdAt
      __typename
      status
      horizon
      intensity
      context {
        id
        title
        emergentName
        createdAt
        pulses {
          id
          title
          content
          createdAt
          __typename
          ... on GoalPulse {
            status
            horizon
            intensity
          }
          ... on ResourcePulse {
            resourceType
            availability
            intensity
          }
          ... on StoryPulse {
            intensity
          }
        }
        space {
          __typename
          id
          name
          visibility
        }
        meSpace {
          __typename
          id
          name
          visibility
        }
        weSpace {
          __typename
          id
          name
          visibility
        }
      }
    }
    resourcePulses(where: { id_EQ: $pulseId }) {
      id
      title
      content
      createdAt
      __typename
      resourceType
      availability
      intensity
      context {
        id
        title
        emergentName
        createdAt
        pulses {
          id
          title
          content
          createdAt
          __typename
          ... on GoalPulse {
            status
            horizon
            intensity
          }
          ... on ResourcePulse {
            resourceType
            availability
            intensity
          }
          ... on StoryPulse {
            intensity
          }
        }
        space {
          __typename
          id
          name
          visibility
        }
        meSpace {
          __typename
          id
          name
          visibility
        }
        weSpace {
          __typename
          id
          name
          visibility
        }
      }
    }
    storyPulses(where: { id_EQ: $pulseId }) {
      id
      title
      content
      createdAt
      __typename
      intensity
      context {
        id
        title
        emergentName
        createdAt
        pulses {
          id
          title
          content
          createdAt
          __typename
          ... on GoalPulse {
            status
            horizon
            intensity
          }
          ... on ResourcePulse {
            resourceType
            availability
            intensity
          }
          ... on StoryPulse {
            intensity
          }
        }
        space {
          __typename
          id
          name
          visibility
        }
        meSpace {
          __typename
          id
          name
          visibility
        }
        weSpace {
          __typename
          id
          name
          visibility
        }
      }
    }
  }
`)
