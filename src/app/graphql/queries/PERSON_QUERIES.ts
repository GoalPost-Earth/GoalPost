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
      photo
      traits
      passions
      fieldsOfCare
      interests
      careManual
      favorites
      connections {
        id
        firstName
        lastName
        name
        email
        photo
      }
      connectionEdges {
        connectedPersonId
        why
        interests
      }
      ownsSpaces {
        ... on MeSpace {
          id
          name
          visibility
          createdAt
          contexts {
            id
            title
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

/**
 * Fetched separately from GET_PERSON_PROFILE so a data-integrity issue in
 * a single pulse (e.g. a GoalPulse with a NULL title — schema says
 * String!, so the non-null cascade would otherwise null the entire
 * Person and surface as "entity no longer available" in the drawer) can
 * fail in isolation. The person drawer hides the pulses section
 * gracefully when this query errors out, instead of blanking the whole
 * drawer.
 */
export const GET_PERSON_OWNED_PULSES = graphql(`
  query getPersonOwnedPulses($personId: ID!) {
    people(where: { id_EQ: $personId }) {
      id
      ownsSpaces {
        ... on WeSpace {
          id
          name
          contexts {
            id
            title
            pulses(where: { createdBy_SOME: { id_EQ: $personId } }) {
              id
              title
              intensity
            }
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

export const GET_RELATED_PEOPLE = graphql(`
  query getRelatedPeople {
    relatedPeople {
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
