import { graphql } from '@/gql'

export const CREATE_CAREPOINT_MUTATION = graphql(`
  mutation createCarePoints($input: [CarePointCreateInput!]!) {
    createCarePoints(input: $input) {
      carePoints {
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
  }
`)

export const UPDATE_CAREPOINT_MUTATION = graphql(`
  mutation UpdateCarePoint($id: ID!, $update: CarePointUpdateInput!) {
    updateCarePoints(where: { id_EQ: $id }, update: $update) {
      carePoints {
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
  }
`)

export const DELETE_CAREPOINT_MUTATION = graphql(`
  mutation DeleteCarePoint($id: ID!) {
    deleteCarePoints(where: { id_EQ: $id }) {
      nodesDeleted
    }
  }
`)
