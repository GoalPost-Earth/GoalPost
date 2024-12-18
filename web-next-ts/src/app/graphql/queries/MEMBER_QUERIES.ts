import { graphql } from '@/gql'

export const GET_MEMBERS = graphql(`
  query GetMembers {
    members {
      id
      firstName
      lastName
      email
    }
  }
`)
