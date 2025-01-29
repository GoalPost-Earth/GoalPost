import { graphql } from '@/gql'

export const CREATE_LOG_MUTATION = graphql(`
  mutation createLogs($input: [LogCreateInput!]!) {
    createLogs(input: $input) {
      logs {
        id
        description
        createdAt
        createdBy {
          id
          name
        }
      }
    }
  }
`)
export const UPDATE_LOG_MUTATION = graphql(`
  mutation updateLog($id: ID!, $update: LogUpdateInput!) {
    updateLogs(where: { id_EQ: $id }, update: $update) {
      logs {
        id
        description
        createdAt
        createdBy {
          id
          name
        }
      }
    }
  }
`)
