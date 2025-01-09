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
      connectedTo {
        id
        name
        photo
      }
      location
      createdAt
      communities {
        id
        name
        members {
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
