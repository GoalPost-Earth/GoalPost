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
        name
        email
        photo
        phone
        pronouns

        status
        avatar
        careManual
        favorites
        passions
        traits
        fieldsOfCare
        interests

        providesResources {
          id
          name
          description
          status
        }
        goals {
          id
          name
          photo
          status
          createdAt
          description
        }
        carePoints {
          id
          # name
          description
        }
        coreValues {
          id
          name
          description
        }
        location
        createdAt

        connectionsConnection {
          edges {
            node {
              id
              name
              photo
            }
            properties {
              why
              interests
            }
          }
        }

        communitiesConnection {
          edges {
            node {
              id
              name
              members(limit: 3) {
                id
                photo
              }
              membersAggregate {
                count
              }
              description
            }
            properties {
              totem
              signupDate
            }
          }
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
