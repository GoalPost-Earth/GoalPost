import { graphql } from '@/gql'

// Removed: generatePersonEmbeddings mutation not in new schema

export const CREATE_PEOPLE_MUTATION = graphql(`
  mutation CreatePeople($input: [PersonCreateInput!]!) {
    createPeople(input: $input) {
      people {
        id
        name
        email
        ownsSpaces {
          id
          name
          visibility
        }
      }
    }
  }
`)

export const UPDATE_PERSON_MUTATION = graphql(`
  mutation UpdatePerson($where: PersonWhere!, $update: PersonUpdateInput!) {
    updatePeople(where: $where, update: $update) {
      people {
        id
        name
        email
        firstName
        lastName
        phone
        pronouns
        traits
        photo
        location
        passions
        fieldsOfCare
        ownsSpaces {
          id
          name
          visibility
          createdAt
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

export const CREATE_PERSON_CONNECTION_MUTATION = graphql(`
  mutation CreatePersonConnection(
    $fromPersonId: ID!
    $toPersonId: ID!
    $why: String
    $interests: String
  ) {
    createPersonConnection(
      fromPersonId: $fromPersonId
      toPersonId: $toPersonId
      why: $why
      interests: $interests
    ) {
      success
      message
      connection {
        connectedPersonId
        why
        interests
      }
    }
  }
`)

export const UPDATE_PERSON_CONNECTION_MUTATION = graphql(`
  mutation UpdatePersonConnection(
    $fromPersonId: ID!
    $toPersonId: ID!
    $why: String
    $interests: String
  ) {
    updatePersonConnection(
      fromPersonId: $fromPersonId
      toPersonId: $toPersonId
      why: $why
      interests: $interests
    ) {
      success
      message
      connection {
        connectedPersonId
        why
        interests
      }
    }
  }
`)

export const DELETE_PERSON_CONNECTION_MUTATION = graphql(`
  mutation DeletePersonConnection($fromPersonId: ID!, $toPersonId: ID!) {
    deletePersonConnection(
      fromPersonId: $fromPersonId
      toPersonId: $toPersonId
    ) {
      success
      message
    }
  }
`)
