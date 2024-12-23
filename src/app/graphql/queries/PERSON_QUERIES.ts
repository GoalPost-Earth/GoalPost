import { graphql } from '@/gql'

export const GET_PERSON = graphql(`
  query getPerson($id: ID!) {
    people(where: { id_EQ: $id }) {
      id
      firstName
      lastName
      name
      email
      photo
      phone
      manual
      interests
      gender
      pronouns
      location
      createdAt
    }
  }
`)

export const GET_ALL_PEOPLE = graphql(`
  query getAllPeople($where: PersonWhere) {
    people(where: $where) {
      id
      firstName
      lastName
      name
      email
      photo
      phone
      manual
      interests
      gender
      pronouns
      location
      guidedBy {
        id
        name
      }
      # createdAt
    }
  }
`)
