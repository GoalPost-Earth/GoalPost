import { graphql } from '@/gql'

export const GET_MEMBER = graphql(`
  query getMember($id: ID!) {
    members(where: { id_EQ: $id }) {
      id
      firstName
      lastName
      email
      address
      city
      country
      county
      gender
      phone
      state
      zipPostal
    }
  }
`)
