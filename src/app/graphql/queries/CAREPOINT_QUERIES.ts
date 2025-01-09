import { graphql } from '@/gql'

export const GET_CAREPOINT = graphql(`
  query getCarePoint($id: ID!) {
    carePoints(where: { id_EQ: $id }) {
      id
      description
      status
      resources {
        id
        name
      }
      enabledByGoals {
        id
        name
      }
      caresForGoals {
        id
        name
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
