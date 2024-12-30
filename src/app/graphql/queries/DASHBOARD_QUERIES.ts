import { graphql } from '@/gql'

export const GET_LOGGED_IN_USER = graphql(`
  query getLoggedInUser($email: String!) {
    people(where: { email_EQ: $email }) {
      id
      authId
      firstName
      lastName
      email
      communities {
        id
        name
        members {
          id
          name
          photo
        }
      }
    }
  }
`)
