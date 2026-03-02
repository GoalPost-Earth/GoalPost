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
      source {
        __typename
        ... on GoalPulse {
          id
          title
          content
          status
          horizon
          intensity
          createdAt
        }
        ... on ResourcePulse {
          id
          title
          content
          resourceType
          availability
          intensity
          createdAt
        }
        ... on StoryPulse {
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
          createdAt
        }
        ... on ResourcePulse {
          id
          title
          content
          resourceType
          availability
          intensity
          createdAt
        }
        ... on StoryPulse {
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
