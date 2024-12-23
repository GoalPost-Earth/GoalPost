import { graphql } from '@/gql'

export const GET_LOGGED_IN_USER = graphql(`
  query getLoggedInUser($email: String!) {
    members(where: { email_EQ: $email }) {
      id
      firstName
      lastName
      email
      community {
        id
        name
        hasMembers {
          id
          name
          photo
        }
      }
    }
  }
`)
