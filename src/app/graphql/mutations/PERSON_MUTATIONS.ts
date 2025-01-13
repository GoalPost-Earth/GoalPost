import { graphql } from '@/gql'

export const GENERATE_PERSON_EMBEDDINGS_MUTATION = graphql(`
  mutation GeneratePersonEmbeddings($personId: ID!) {
    generatePersonEmbeddings(personId: $personId)
  }
`)

export const CREATE_PEOPLE_MUTATION = graphql(`
  mutation CreatePeople($input: [PersonCreateInput!]!) {
    createPeople(input: $input) {
      people {
        id
        firstName
        lastName
        email
        phone
        photo
        location
        pronouns
      }
    }
  }
`)

export const UPDATE_PERSON_MUTATION = graphql(`
  mutation UpdatePerson($where: PersonWhere!, $update: PersonUpdateInput!) {
    updatePeople(where: $where, update: $update) {
      people {
        id
        firstName
        lastName
        email
        phone
        photo
        location
        pronouns

        connectedTo {
          id
          name
          photo
        }

        communities {
          id
          name
          description
          members {
            id
            name
            photo
          }
        }

        coreValues {
          id
          name
          description
        }
      }
    }
  }
`)

export const DELETE_PERSON_MUTATION = graphql(`
  mutation DeletePerson($id: ID!) {
    deletePeople(where: { id_EQ: $id }) {
      nodesDeleted
    }
  }
`)
