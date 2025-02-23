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
        createdAt
      }
      enablesCarePoints {
        id
        name
        description
        status
      }
      caredForByCarePoints {
        id
        name
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
      resources {
        id
        name
      }
    }
  }
`)
