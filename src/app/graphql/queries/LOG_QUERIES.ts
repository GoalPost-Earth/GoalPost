import { graphql } from '@/gql'

export const GET_ALL_LOGS = graphql(`
  query {
    logs {
      id
      description
      createdAt
      resources {
        id
        name
        description
      }
      goals {
        id
        name
        description
      }
      createdBy {
        id
        name
      }
    }
  }
`)
export const GET_LOG = graphql(`
  query getLog($id: ID!) {
    logs(where: { id_EQ: $id }) {
      id
      description
      createdAt
      createdBy {
        id
        name
      }
    }
  }
`)
