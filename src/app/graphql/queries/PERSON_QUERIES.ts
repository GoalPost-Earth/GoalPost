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
      pronouns

      status
      avatar
      careManual
      favorites
      passions
      traits
      fieldsOfCare
      interests

      connectedTo {
        id
        name
        photo
      }
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
      communities {
        id
        name
        members {
          id
          photo
        }
        description
      }
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
      pronouns
      location
      # createdAt
      connectedTo {
        id
        name
      }
      communities {
        name
        id
      }
      goals {
        id
        name
      }
      coreValues {
        name
        id
      }
      providesResources {
        name
        id
      }
    }
  }
`)

export const GET_PEOPLE_AND_THEIR_GOALS = graphql(`
  query getPeopleAndTheirGoals($personWhere: PersonWhere, $goalLimit: Int) {
    people(where: $personWhere) {
      id
      name
      photo
      goals(limit: $goalLimit) {
        id
        name
        description
        successMeasures
        photo
        status
        location
        time
        createdAt
      }
    }
  }
`)

export const GET_PEOPLE_AND_THEIR_RESOURCES = graphql(`
  query getPeopleAndTheirResources {
    people(where: { providesResources_SOME: { NOT: { id_EQ: "" } } }) {
      name
      photo
      id
      providesResources {
        name
        id
        description
        status
        providedByPerson {
          name
          id
          photo
        }
      }
    }
  }
`)

export const GET_PEOPLE_AND_THEIR_COREVALUES = graphql(`
  query getPeopleAndTheirCoreValues {
    people(where: { coreValues_SOME: { NOT: { id_EQ: "" } } }) {
      coreValues {
        isEmbracedBy {
          id
          name
          photo
        }
        id
        description
        name
      }
      id
      name
      photo
    }
  }
`)
