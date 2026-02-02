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
