import { graphql } from '@/gql'

export const GET_PULSE_DETAILS = graphql(`
  query getPulseDetails($pulseId: ID!) {
    goalPulses(where: { id_EQ: $pulseId }) {
      __typename
      id
      content
      createdAt
      intensity
      status
      horizon
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
    resourcePulses(where: { id_EQ: $pulseId }) {
      __typename
      id
      content
      createdAt
      intensity
      resourceType
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
    storyPulses(where: { id_EQ: $pulseId }) {
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
