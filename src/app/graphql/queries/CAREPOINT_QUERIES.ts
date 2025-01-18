import { graphql } from '@/gql'

export const GET_CAREPOINT = graphql(`
  query getCarePoint($id: ID!) {
    carePoints(where: { id_EQ: $id }) {
      id
      name
      description
      status
      why
      location
      time
      levelFulfilled
      fulfillmentDate
      successMeasures
      issuesIdentified
      issuesResolved
      resources {
        id
        name
      }
      enabledByGoals {
        id
        name
        photo
        status
        createdAt
        description
      }
      caresForGoals {
        id
        name
        photo
        status
        createdAt
        description
      }
      resources {
        id
        name
        description
        status
      }
      createdAt
      createdBy {
        id
        name
        photo
      }
    }
  }
`)

export const GET_ALL_CAREPOINTS = graphql(`
  query getAllCarePoints($where: CarePointWhere) {
    carePoints(where: $where) {
      id
      name
      description
      status

      createdAt
      createdBy {
        id
        name
        photo
      }
      enabledByGoals {
        name
        id
      }
    }
  }
`)
