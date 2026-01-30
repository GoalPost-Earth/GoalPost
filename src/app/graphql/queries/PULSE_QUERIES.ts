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
      createdBy {
        id
        firstName
        lastName
        name
        email
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
      createdBy {
        id
        firstName
        lastName
        name
        email
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
      createdBy {
        id
        firstName
        lastName
        name
        email
      }
    }
  }
`)
