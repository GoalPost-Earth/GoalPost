import { graphql } from '@/gql'

export const GET_LOGGED_IN_USER = graphql(`
  query getLoggedInUser($email: String!) {
    people(where: { email_EQ: $email }) {
      id
      name
      email
      ownsSpaces {
        id
        name
        visibility
        createdAt
      }
    }
  }
`)
