import { graphql } from '@/gql'

export const GET_PERSON = graphql(`
  query getPerson($id: ID!) {
    people(where: { id_EQ: $id }) {
      id
      firstName
      lastName
      # isUser
      name
      email
      photo
      phone
      pronouns
      inviteSent

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
            description
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
      connections {
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
      carePoints {
        id
        name
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
      goals(limit: $goalLimit, sort: { createdAt: DESC }) {
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
        people {
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

export const GET_USER_BY_ID = graphql(`
  query getUserById($id: ID!) {
    people(where: { id_EQ: $id, NOT: { isUser_EQ: false } }) {
      id
    }
  }
`)
