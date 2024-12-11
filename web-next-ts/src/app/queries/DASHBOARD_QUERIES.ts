import { graphql } from '@/gql'

export const GET_LOGGED_IN_USER = graphql(`
  query getLoggedInUser($authId: String!) {
    members(where: { authId_EQ: $authId }) {
      id
      firstName
      lastName
      email
    }
  }
`)
