import { graphql } from '@/gql'

export const GET_GOAL = graphql(`
  query getGoal($id: ID!) {
    goals(where: { id_EQ: $id }) {
      id
      name
      type
      description
      caresFor
      successMeasures
      photo
      status
      location
      time
      createdAt
      motivatesPerson {
        id
        name
        photo
      }
    }
  }
`)

export const GET_ALL_GOALS = graphql(`
  query getAllGoals($where: GoalWhere) {
    goals(where: $where) {
      id
      name
      type
      description
      caresFor
      successMeasures
      photo
      status
      location
      time
      createdAt
      motivatesPerson {
        id
        name
        photo
      }
    }
  }
`)
