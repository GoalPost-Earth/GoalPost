import { graphql } from '@/gql'

export const GET_PERSON = graphql(`
  query getPerson($id: ID!) {
    people(where: { id_EQ: $id }) {
      id
      firstName
      lastName
      name
      email
      traits
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
`)

export const GET_PERSON_PROFILE = graphql(`
  query getPersonProfile($personId: ID!) {
    people(where: { id_EQ: $personId }) {
      id
      firstName
      lastName
      name
      email
      traits
      passions
      fieldsOfCare
      ownsSpaces {
        ... on MeSpace {
          id
          name
          visibility
          createdAt
          contexts {
            id
            title
            pulses {
              id
              title
              intensity
            }
          }
        }
        ... on WeSpace {
          id
          name
          visibility
          createdAt
          contexts {
            id
            title
            pulses {
              id
              title
              intensity
            }
          }
        }
      }
      memberOf {
        id
        role
        space {
          ... on MeSpace {
            id
            name
            visibility
            createdAt
          }
          ... on WeSpace {
            id
            name
            visibility
            createdAt
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
      name
      email
      traits
      passions
      fieldsOfCare
      ownsSpaces {
        id
        name
        visibility
      }
    }
  }
`)

export const GET_PEOPLE_AND_THEIR_GOALS = graphql(`
  query getPeopleAndTheirGoals($personWhere: PersonWhere, $goalLimit: Int) {
    people(where: $personWhere) {
      id
      name
      ownsSpaces {
        id
        name
      }
    }
  }
`)

export const GET_PEOPLE_AND_THEIR_RESOURCES = graphql(`
  query getPeopleAndTheirResources {
    people {
      name
      id
      email
      traits
      passions
      fieldsOfCare
      ownsSpaces {
        name
        id
      }
    }
  }
`)

export const GET_PEOPLE_AND_THEIR_COREVALUES = graphql(`
  query getPeopleAndTheirCoreValues {
    people {
      id
      name
      email
      traits
      passions
      fieldsOfCare
      ownsSpaces {
        id
        name
      }
    }
  }
`)

export const GET_USER_BY_ID = graphql(`
  query getUserById($id: ID!) {
    people(where: { id_EQ: $id }) {
      id
      name
      email
      traits
      passions
      fieldsOfCare
    }
  }
`)
