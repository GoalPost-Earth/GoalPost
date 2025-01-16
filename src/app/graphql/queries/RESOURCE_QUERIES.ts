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
      dependsOnResources {
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
        email
        phone
        photo
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
      dependsOnResources {
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
    }
  }
`)
