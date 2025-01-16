import { graphql } from '@/gql'

export const CREATE_RESOURCE_MUTATION = graphql(`
  mutation CreateResources($input: [ResourceCreateInput!]!) {
    createResources(input: $input) {
      resources {
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
        }
      }
    }
  }
`)

export const UPDATE_RESOURCE_MUTATION = graphql(`
  mutation UpdateResource($id: ID!, $update: ResourceUpdateInput!) {
    updateResources(where: { id_EQ: $id }, update: $update) {
      resources {
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
      }
    }
  }
`)

export const DELETE_RESOURCE_MUTATION = graphql(`
  mutation DeleteResource($id: ID!) {
    deleteResources(where: { id_EQ: $id }) {
      nodesDeleted
    }
  }
`)
