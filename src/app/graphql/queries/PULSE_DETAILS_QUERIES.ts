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
      why
      location
      time
      successMeasures
      activities
      type
      context {
        id
        title
        emergentName
        createdAt
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
      initiatedBy {
        id
        firstName
        lastName
        name
      }
      createdBy {
        id
        firstName
        lastName
        name
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
      why
      location
      time
      status
      context {
        id
        title
        emergentName
        createdAt
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
      initiatedBy {
        id
        firstName
        lastName
        name
      }
      createdBy {
        id
        firstName
        lastName
        name
      }
    }
    storyPulses(where: { id_EQ: $pulseId }) {
      id
      title
      why
      location
      time
      status
      levelFulfilled
      fulfillmentDate
      successMeasures
      issuesIdentified
      issuesResolved
      alignmentChallenges
      alignmentExamples
      whoSupports
      content
      createdAt
      __typename
      intensity
      context {
        id
        title
        emergentName
        createdAt
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
      initiatedBy {
        id
        firstName
        lastName
        name
      }
      createdBy {
        id
        firstName
        lastName
        name
      }
    }
    carePulses(where: { id_EQ: $pulseId }) {
      id
      title
      content
      createdAt
      __typename
      intensity
      sourceType
      context {
        id
        title
        emergentName
        createdAt
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
      initiatedBy {
        id
        firstName
        lastName
        name
      }
      createdBy {
        id
        firstName
        lastName
        name
      }
    }
    coreValuePulses(where: { id_EQ: $pulseId }) {
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
      initiatedBy {
        id
        firstName
        lastName
        name
      }
      createdBy {
        id
        firstName
        lastName
        name
      }
    }
  }
`)
