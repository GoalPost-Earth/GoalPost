import { graphql } from '@/gql'

export const CREATE_GOAL_MUTATION = graphql(`
  mutation createGoals($input: [GoalCreateInput!]!) {
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
        coreValues {
          id
          name
          description
        }
        motivatesPeople {
          id
          name
          photo
        }
        motivatesCommunities {
          id
          name
          description
        }
        enablesCarePoints {
          id
          description
          status
        }
        caredForByCarePoints {
          id
          description
          status
        }
        createdBy {
          id
          name
        }
      }
    }
  }
`)

export const UPDATE_GOAL_MUTATION = graphql(`
  mutation updateGoal($id: ID!, $update: GoalUpdateInput!) {
    updateGoals(where: { id_EQ: $id }, update: $update) {
      goals {
        id
        name
        description
        successMeasures
        photo
        status
        location
        why
        time
        createdAt
        coreValues {
          id
          name
          description
        }
        motivatesPeople {
          id
          name
          photo
        }
        motivatesCommunities {
          id
          name
          description
        }
        enablesCarePoints {
          id
          description
          status
        }
        caredForByCarePoints {
          id
          description
          status
        }
        resources {
          id
          name
          description
          status
        }
        createdBy {
          id
          name
        }
      }
    }
  }
`)

export const DELETE_GOAL_MUTATION = graphql(`
  mutation deleteGoal($id: ID!) {
    deleteGoals(where: { id_EQ: $id }) {
      nodesDeleted
    }
  }
`)
