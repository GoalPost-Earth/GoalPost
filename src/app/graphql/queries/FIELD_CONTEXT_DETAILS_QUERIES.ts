import { graphql } from '@/gql'

export const GET_FIELD_CONTEXT_DETAILS = graphql(`
  query getFieldContextDetails($contextId: ID!) {
    goalPulses(where: { context_SOME: { id_EQ: $contextId } }) {
      __typename
      id
      title
      content
      createdAt
      createdBy {
        id
      }
    }
    resourcePulses(where: { context_SOME: { id_EQ: $contextId } }) {
      __typename
      id
      title
      content
      createdAt
      createdBy {
        id
      }
    }
    storyPulses(where: { context_SOME: { id_EQ: $contextId } }) {
      __typename
      id
      title
      content
      createdAt
      createdBy {
        id
      }
    }
    carePulses(where: { context_SOME: { id_EQ: $contextId } }) {
      __typename
      id
      title
      content
      createdAt
      createdBy {
        id
      }
    }
    coreValuePulses(where: { context_SOME: { id_EQ: $contextId } }) {
      __typename
      id
      title
      content
      createdAt
      createdBy {
        id
      }
    }
    fieldContexts(where: { id_EQ: $contextId }) {
      id
      title
      emergentName
      createdAt
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
