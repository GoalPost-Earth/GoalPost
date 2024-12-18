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
        dependsOnResource {
          id
          name
        }
        appliedToCarePoint {
          id
        }
      }
    }
  }
`)
