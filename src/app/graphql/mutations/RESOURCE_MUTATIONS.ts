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
        resources {
          id
          name
        }
        goals {
          id
          name
          description
        }

        providedByPerson {
          id
          name
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
        resources {
          id
          name
          description
          status
        }
        goals {
          id
          name
          description
          status
        }
        carePoints {
          id
          description
          status
        }
        providedByCommunity {
          name
          id
          description
          members(limit: 5) {
            id
            name
            photo
          }
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
  }
`)

export const DELETE_RESOURCE_MUTATION = graphql(`
  mutation DeleteResource($id: ID!) {
    deleteResources(where: { id_EQ: $id }) {
      nodesDeleted
    }
  }
`)
