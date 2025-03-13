import { graphql } from '@/gql'

export const GET_RESOURCE = graphql(`
  query getResource($id: ID!) {
    resources(where: { id_EQ: $id }) {
      id
      name
      description
      status
      why
      location
      time
      resources {
        id
        name
      }
      carePoints {
        id
        name
        description
        status
      }
      providedByPerson {
        id
        name
        email
        phone
        photo
      }
      goals {
        id
        name
        description
        createdAt
      }
      createdAt
      createdBy {
        id
        name
      }
      providedByCommunity {
        name
        id
        description
      }
    }
  }
`)

export const GET_ALL_RESOURCES = graphql(`
  query getAllResources($where: ResourceWhere) {
    resources(where: $where) {
      id
      name
      description
      status
      why
      location
      time
      resources {
        id
        name
      }
      carePoints {
        id
        description
        status
      }
      providedByPerson {
        id
        name
        phone
        photo
      }
      providedByCommunity {
        id
        name
        description
      }
      createdAt
    }
  }
`)
