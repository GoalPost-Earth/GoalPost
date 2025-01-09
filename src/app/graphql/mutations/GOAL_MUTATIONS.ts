import { graphql } from '@/gql'

export const CREATE_GOAL_MUTATION = graphql(`
  mutation CreateGoals($input: [GoalCreateInput!]!) {
    createGoals(input: $input) {
      goals {
        id
        name
        description
        successMeasures
        photo
        status
        location
        time
        createdAt
      }
    }
  }
`)

export const UPDATE_GOAL_MUTATION = graphql(`
  mutation UpdateGoal($id: ID!, $update: GoalUpdateInput!) {
    updateGoals(where: { id_EQ: $id }, update: $update) {
      goals {
        id
        name
        description
        successMeasures
        photo
        status
        location
        time
        createdAt
      }
    }
  }
`)

export const DELETE_GOAL_MUTATION = graphql(`
  mutation DeleteGoal($id: ID!) {
    deleteGoals(where: { id_EQ: $id }) {
      nodesDeleted
    }
  }
`)
