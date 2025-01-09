import { graphql } from '@/gql'

export const GET_GOAL = graphql(`
  query getGoal($id: ID!) {
    goals(where: { id_EQ: $id }) {
      id
      name
      description
      successMeasures
      photo
      status
      location
      time
      createdAt
      motivatesPeople {
        id
        name
        photo
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
`)

export const GET_ALL_GOALS = graphql(`
  query getAllGoals($where: GoalWhere) {
    goals(where: $where) {
      id
      name
      description
      successMeasures
      photo
      status
      location
      time
      createdAt
      motivatesPeople {
        id
        name
        photo
      }
    }
  }
`)
