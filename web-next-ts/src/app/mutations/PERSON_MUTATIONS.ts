import { graphql } from '@/gql'

export const CREATE_PEOPLE_MUTATION = graphql(`
  mutation CreatePeople($input: [PersonCreateInput!]!) {
    createPeople(input: $input) {
      people {
        id
        firstName
        lastName
        email
        phone
        location
        manual
        interests
        pronouns
      }
    }
  }
`)
