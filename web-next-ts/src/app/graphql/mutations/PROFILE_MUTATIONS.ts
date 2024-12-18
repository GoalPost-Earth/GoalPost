import { graphql } from '@/gql'

export const CREATE_PROFILE_MUTATION = graphql(`
  mutation CreateMembers($input: [MemberCreateInput!]!) {
    createMembers(input: $input) {
      members {
        id
        firstName
        lastName
        email
      }
    }
  }
`)
