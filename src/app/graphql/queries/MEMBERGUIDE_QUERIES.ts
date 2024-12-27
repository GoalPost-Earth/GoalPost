import { graphql } from '@/gql'

export const GET_MEMBER = graphql(`
  query getMember($id: ID!) {
    members(where: { id_EQ: $id }) {
      id
      firstName
      lastName
      name
      email
      gender
      phone
    }
  }
`)
