import { graphql } from '@/gql'

/**
 * Get resonance link details including source and target pulses with titles
 */
export const GET_RESONANCE_LINK_DETAILS = graphql(`
  query GetResonanceLinkDetails($resonanceId: ID!) {
    resonanceLinks(where: { id_EQ: $resonanceId }) {
      id
      label
      description
      confidence
      context {
        id
      }
      source {
        __typename
        ... on GoalPulse {
          id
          title
          content
          status
          horizon
          intensity
          location
          createdAt
        }
        ... on ResourcePulse {
          id
          title
          content
          resourceType
          availability
          intensity
          location
          createdAt
        }
        ... on StoryPulse {
          id
          title
          content
          intensity
          location
          createdAt
        }
        ... on CoreValuePulse {
          id
          title
          content
          intensity
          createdAt
        }
      }
      target {
        __typename
        ... on GoalPulse {
          id
          title
          content
          status
          horizon
          intensity
          location
          createdAt
        }
        ... on ResourcePulse {
          id
          title
          content
          resourceType
          availability
          intensity
          location
          createdAt
        }
        ... on StoryPulse {
          id
          title
          content
          intensity
          location
          createdAt
        }
        ... on CoreValuePulse {
          id
          title
          content
          intensity
          createdAt
        }
      }
    }
  }
`)
