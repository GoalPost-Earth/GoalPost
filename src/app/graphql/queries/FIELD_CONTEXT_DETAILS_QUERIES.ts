import { graphql } from '@/gql'

export const GET_FIELD_CONTEXT_DETAILS = graphql(`
  query getFieldContextDetails($contextId: ID!) {
    goalPulses(where: { context_SOME: { id_EQ: $contextId } }) {
      __typename
      id
      title
      content
      createdAt
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
    resourcePulses(where: { context_SOME: { id_EQ: $contextId } }) {
      __typename
      id
      title
      content
      createdAt
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
    storyPulses(where: { context_SOME: { id_EQ: $contextId } }) {
      __typename
      id
      title
      content
      createdAt
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
    carePulses(where: { context_SOME: { id_EQ: $contextId } }) {
      __typename
      id
      title
      content
      createdAt
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
    coreValuePulses(where: { context_SOME: { id_EQ: $contextId } }) {
      __typename
      id
      title
      content
      createdAt
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
    fieldContexts(where: { id_EQ: $contextId }) {
      id
      title
      emergentName
      createdAt
      parentContext {
        id
        title
      }
      ancestorContexts {
        id
        title
      }
      subContexts {
        id
        title
        emergentName
        createdAt
        pulses {
          id
        }
        subContexts {
          id
        }
      }
      resonancesInContext {
        id
        label
        description
        confidence
        evidence
        createdAt
        source {
          ... on GoalPulse {
            id
            __typename
            title
            content
            createdAt
          }
          ... on ResourcePulse {
            id
            __typename
            title
            content
            createdAt
          }
          ... on StoryPulse {
            id
            __typename
            title
            content
            createdAt
          }
          ... on CarePulse {
            id
            __typename
            title
            content
            createdAt
          }
          ... on CoreValuePulse {
            id
            __typename
            title
            content
            createdAt
          }
        }
        target {
          ... on GoalPulse {
            id
            __typename
            title
            content
            createdAt
          }
          ... on ResourcePulse {
            id
            __typename
            title
            content
            createdAt
          }
          ... on StoryPulse {
            id
            __typename
            title
            content
            createdAt
          }
          ... on CarePulse {
            id
            __typename
            title
            content
            createdAt
          }
          ... on CoreValuePulse {
            id
            __typename
            title
            content
            createdAt
          }
        }
      }
      weaves {
        id
        title
        status
        createdAt
        weaves {
          id
          __typename
          title
        }
        wovenFor {
          id
          name
          firstName
          lastName
        }
      }
      space {
        id
        name
        visibility
        ... on MeSpace {
          __typename
          id
          name
          visibility
        }
        ... on WeSpace {
          __typename
          id
          name
          visibility
        }
      }
    }
  }
`)
