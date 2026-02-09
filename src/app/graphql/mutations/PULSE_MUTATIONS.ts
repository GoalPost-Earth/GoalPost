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
 * Delete a GoalPulse
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
 * Delete a ResourcePulse
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
 * Delete a StoryPulse
 */
export const DELETE_STORY_PULSE_MUTATION = graphql(`
  mutation DeleteStoryPulse($where: StoryPulseWhere!) {
    deleteStoryPulses(where: $where) {
      nodesDeleted
      relationshipsDeleted
    }
  }
`)
