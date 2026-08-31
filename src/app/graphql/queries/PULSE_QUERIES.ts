import { graphql } from '@/gql'

/**
 * Fetch all pulses within a specific FieldContext along with resonance links
 * Returns goal, resource, and story pulses with their details plus all resonance links in the context
 *
 * Note: Resonances are queried separately to avoid authorization filter issues when
 * traversing through nested relationships (fieldContexts -> resonances -> source/target)
 */
export const GET_PULSES_BY_CONTEXT = graphql(`
  query GetPulsesByContext($contextId: ID!) {
    goalPulses(where: { context_SOME: { id_EQ: $contextId } }) {
      __typename
      id
      title
      content
      type: __typename
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
      type: __typename
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
      type: __typename
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
      type: __typename
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
      type: __typename
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
    }
  }
`)

export const GET_PULSE_DETAILS = graphql(`
  query getPulseDetails($pulseId: ID!) {
    goalPulses(where: { id_EQ: $pulseId }) {
      __typename
      id
      title
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
        id
        firstName
        lastName
        name
        privateProfile {
          id
          email
        }
      }
      createdBy {
        id
        firstName
        lastName
        name
        privateProfile {
          id
          email
        }
      }
    }
    resourcePulses(where: { id_EQ: $pulseId }) {
      __typename
      id
      title
      content
      createdAt
      intensity
      resourceType
      location
      context {
        id
        title
      }
      initiatedBy {
        id
        firstName
        lastName
        name
        privateProfile {
          id
          email
        }
      }
      createdBy {
        id
        firstName
        lastName
        name
        privateProfile {
          id
          email
        }
      }
    }
    storyPulses(where: { id_EQ: $pulseId }) {
      __typename
      id
      title
      content
      createdAt
      intensity
      context {
        id
        title
      }
      initiatedBy {
        id
        firstName
        lastName
        name
        privateProfile {
          id
          email
        }
      }
      createdBy {
        id
        firstName
        lastName
        name
        privateProfile {
          id
          email
        }
      }
    }
    carePulses(where: { id_EQ: $pulseId }) {
      __typename
      id
      title
      content
      createdAt
      intensity
      context {
        id
        title
      }
      initiatedBy {
        id
        firstName
        lastName
        name
        privateProfile {
          id
          email
        }
      }
      createdBy {
        id
        firstName
        lastName
        name
        privateProfile {
          id
          email
        }
      }
    }
    coreValuePulses(where: { id_EQ: $pulseId }) {
      __typename
      id
      title
      content
      createdAt
      intensity
      context {
        id
        title
      }
      initiatedBy {
        id
        firstName
        lastName
        name
        privateProfile {
          id
          email
        }
      }
      createdBy {
        id
        firstName
        lastName
        name
        privateProfile {
          id
          email
        }
      }
    }
  }
`)
