import { graphql } from '@/gql'

// Goal → GoalPulse in pulse-first architecture
export const CREATE_GOAL_MUTATION = graphql(`
  mutation createGoalPulses($input: [GoalPulseCreateInput!]!) {
    createGoalPulses(input: $input) {
      goalPulses {
        id
        content
        createdAt
        intensity
        status
        horizon
      }
    }
  }
`)

export const UPDATE_GOAL_MUTATION = graphql(`
  mutation updateGoalPulses(
    $where: GoalPulseWhere!
    $update: GoalPulseUpdateInput!
  ) {
    updateGoalPulses(where: $where, update: $update) {
      goalPulses {
        id
        content
        createdAt
        intensity
        status
        horizon
      }
    }
  }
`)

export const DELETE_GOAL_MUTATION = graphql(`
  mutation deleteGoalPulses($where: GoalPulseWhere!) {
    deleteGoalPulses(where: $where) {
      nodesDeleted
    }
  }
`)
