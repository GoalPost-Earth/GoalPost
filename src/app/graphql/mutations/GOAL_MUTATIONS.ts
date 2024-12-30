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
