import { graphql } from '@/gql'

export const CREATE_CAREPOINT_MUTATION = graphql(`
  mutation CreateCarePoints($input: [CarePointCreateInput!]!) {
    createCarePoints(input: $input) {
      carePoints {
        id
        description
        status
      }
    }
  }
`)

export const UPDATE_CAREPOINT_MUTATION = graphql(`
  mutation UpdateCarePoint($id: ID!, $update: CarePointUpdateInput!) {
    updateCarePoints(where: { id_EQ: $id }, update: $update) {
      carePoints {
        id
        description
        status
      }
    }
  }
`)

export const DELETE_CAREPOINT_MUTATION = graphql(`
  mutation DeleteCarePoint($id: ID!) {
    deleteCarePoints(where: { id_EQ: $id }) {
      nodesDeleted
    }
  }
`)
