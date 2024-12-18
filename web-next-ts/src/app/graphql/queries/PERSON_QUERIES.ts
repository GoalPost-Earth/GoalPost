import { graphql } from '@/gql'

export const GET_PERSON = graphql(`
  query getPerson($id: ID!) {
    people(where: { id_EQ: $id }) {
      id
      firstName
      lastName
      fullName
      email
      phone
      manual
      interests
      gender
      pronouns
      location
    }
  }
`)

export const GET_ALL_PEOPLE = graphql(`
  query getAllPeople {
    people {
      id
      firstName
      lastName
      fullName
      email
      phone
      manual
      interests
      gender
      pronouns
      location
      # createdAt
    }
  }
`)
