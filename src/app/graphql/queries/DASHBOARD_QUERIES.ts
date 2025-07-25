import { graphql } from '@/gql'

export const GET_LOGGED_IN_USER = graphql(`
  query getLoggedInUser($email: String!) {
    people(where: { email_EQ: $email }) {
      id
      isUser
      firstName
      lastName
      name
      email
      photo
      createdAt
      connections {
        id
        name
        photo
      }
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
