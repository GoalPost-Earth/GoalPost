import { graphql } from '@/gql'

/**
 * Create a new GoalPulse
 */
export const CREATE_GOAL_PULSE_MUTATION = graphql(`
  mutation CreateGoalPulse($input: [GoalPulseCreateInput!]!) {
    createGoalPulses(input: $input) {
      goalPulses {
        id
        title
        content
        status
        horizon
        intensity
        createdAt
        createdBy {
          id
          name
        }
        context {
          id
          title
        }
      }
      info {
        nodesCreated
        relationshipsCreated
      }
    }
  }
`)

/**
 * Create a new ResourcePulse
 */
export const CREATE_RESOURCE_PULSE_MUTATION = graphql(`
  mutation CreateResourcePulse($input: [ResourcePulseCreateInput!]!) {
    createResourcePulses(input: $input) {
      resourcePulses {
        id
        title
        content
        resourceType
        availability
        intensity
        createdAt
        createdBy {
          id
          name
        }
        context {
          id
          title
        }
      }
      info {
        nodesCreated
        relationshipsCreated
      }
    }
  }
`)

/**
 * Create a new StoryPulse
 */
export const CREATE_STORY_PULSE_MUTATION = graphql(`
  mutation CreateStoryPulse($input: [StoryPulseCreateInput!]!) {
    createStoryPulses(input: $input) {
      storyPulses {
        id
        title
        content
        intensity
        createdAt
        createdBy {
          id
          name
        }
        context {
          id
          title
        }
      }
      info {
        nodesCreated
        relationshipsCreated
      }
    }
  }
`)

/**
 * Update a GoalPulse
 */
export const UPDATE_GOAL_PULSE_MUTATION = graphql(`
  mutation UpdateGoalPulse(
    $where: GoalPulseWhere!
    $update: GoalPulseUpdateInput!
  ) {
    updateGoalPulses(where: $where, update: $update) {
      goalPulses {
        id
        title
        content
        status
        horizon
        intensity
        successMeasures
        activities
        type
        why
        location
        time
        createdAt
        createdBy {
          id
          name
        }
        context {
          id
          title
        }
      }
    }
  }
`)

/**
 * Update a ResourcePulse
 */
export const UPDATE_RESOURCE_PULSE_MUTATION = graphql(`
  mutation UpdateResourcePulse(
    $where: ResourcePulseWhere!
    $update: ResourcePulseUpdateInput!
  ) {
    updateResourcePulses(where: $where, update: $update) {
      resourcePulses {
        id
        title
        content
        resourceType
        availability
        intensity
        status
        why
        location
        time
        createdAt
        createdBy {
          id
          name
        }
        context {
          id
          title
        }
      }
    }
  }
`)

/**
 * Update a StoryPulse
 */
export const UPDATE_STORY_PULSE_MUTATION = graphql(`
  mutation UpdateStoryPulse(
    $where: StoryPulseWhere!
    $update: StoryPulseUpdateInput!
  ) {
    updateStoryPulses(where: $where, update: $update) {
      storyPulses {
        id
        title
        content
        intensity
        status
        why
        location
        time
        levelFulfilled
        fulfillmentDate
        successMeasures
        issuesIdentified
        issuesResolved
        alignmentChallenges
        alignmentExamples
        whoSupports
        createdAt
        createdBy {
          id
          name
        }
        context {
          id
          title
        }
      }
    }
  }
`)

/**
 * Delete a GoalPulse (orphaned ResonanceLinks will be cleaned up separately)
 */
export const DELETE_GOAL_PULSE_MUTATION = graphql(`
  mutation DeleteGoalPulse($where: GoalPulseWhere!) {
    deleteGoalPulses(where: $where) {
      nodesDeleted
      relationshipsDeleted
    }
  }
`)

/**
 * Delete ResonanceLinks by pulse ID
 */
export const DELETE_RESONANCES_BY_PULSE_MUTATION = graphql(`
  mutation DeleteResonancesByPulse($pulseId: ID!) {
    deleteResonanceLinks(
      where: {
        OR: [
          { source_SOME: { id_EQ: $pulseId } }
          { target_SOME: { id_EQ: $pulseId } }
        ]
      }
    ) {
      nodesDeleted
      relationshipsDeleted
    }
  }
`)

/**
 * Delete a ResourcePulse (orphaned ResonanceLinks will be cleaned up separately)
 */
export const DELETE_RESOURCE_PULSE_MUTATION = graphql(`
  mutation DeleteResourcePulse($where: ResourcePulseWhere!) {
    deleteResourcePulses(where: $where) {
      nodesDeleted
      relationshipsDeleted
    }
  }
`)

/**
 * Delete a StoryPulse (orphaned ResonanceLinks will be cleaned up separately)
 */
export const DELETE_STORY_PULSE_MUTATION = graphql(`
  mutation DeleteStoryPulse($where: StoryPulseWhere!) {
    deleteStoryPulses(where: $where) {
      nodesDeleted
      relationshipsDeleted
    }
  }
`)

/**
 * Share a pulse with another FieldContext
 * Creates an additional HAS_PULSE relationship, making the pulse visible in multiple contexts.
 * Any existing resonances with other pulses in the target context will be discoverable.
 * Supports sharing any pulse type (Goal, Resource, Story, Care, CoreValue)
 */
export const SHARE_PULSE_WITH_CONTEXT_MUTATION = graphql(`
  mutation SharePulseWithContext($pulseId: ID!, $contextId: ID!) {
    updateFieldContexts(
      where: { id_EQ: $contextId }
      update: {
        pulses: { connect: [{ where: { node: { id_EQ: $pulseId } } }] }
      }
    ) {
      fieldContexts {
        id
        title
        pulses {
          id
          title
          content
          createdAt
          ... on GoalPulse {
            status
            horizon
          }
          ... on ResourcePulse {
            resourceType
          }
        }
      }
    }
  }
`)

/**
 * Remove a pulse from a FieldContext (unshare from a field)
 * Only removes the relationship to this specific context.
 * If the pulse is in other contexts, it remains there.
 */
export const REMOVE_PULSE_FROM_CONTEXT_MUTATION = graphql(`
  mutation RemovePulseFromContext($pulseId: ID!, $contextId: ID!) {
    updateFieldContexts(
      where: { id_EQ: $contextId }
      update: {
        pulses: { disconnect: [{ where: { node: { id_EQ: $pulseId } } }] }
      }
    ) {
      fieldContexts {
        id
        title
        pulses {
          id
          title
        }
      }
    }
  }
`)

/**
 * Get all resonances for a context, including cross-context resonances
 * Returns resonances where BOTH source and target pulses are present in the context.
 * This allows resonances created in the original context to be visible when pulses are shared.
 */
export const GET_CONTEXT_RESONANCES_QUERY = graphql(`
  query GetContextResonances($contextId: ID!) {
    fieldContexts(where: { id_EQ: $contextId }) {
      id
      title
      pulses {
        id
        title
      }
      resonances {
        id
        label
        description
        confidence
        evidence
        createdAt
        source {
          id
          title
          content
          ... on GoalPulse {
            status
          }
          ... on ResourcePulse {
            resourceType
          }
        }
        target {
          id
          title
          content
          ... on GoalPulse {
            status
          }
          ... on ResourcePulse {
            resourceType
          }
        }
      }
    }
  }
`)
