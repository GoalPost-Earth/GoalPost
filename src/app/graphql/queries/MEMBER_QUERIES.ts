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

export const GET_MEMBER = graphql(`
  query getMember($id: ID!) {
    members(where: { id_EQ: $id }) {
      id
      firstName
      lastName
      name
      email
      photo
      phone
      gender
      pronouns
      location
      interests
      createdAt

      coreValues {
        id
        name
      }
    }
  }
`)

export const GET_ALL_MEMBERS = graphql(`
  query getAllMembers($where: MemberWhere) {
    members(where: $where) {
      id
      firstName
      lastName
      name
      email
      photo
      phone
      gender
      pronouns
      location
      coreValues {
        id
        name
      }
      # createdAt
    }
  }
`)
