import { graphql } from '@/gql'

export const GET_MEMBERS = graphql(`
  query GetMembers {
    people {
      id
      firstName
      lastName
      email
    }
  }
`)
