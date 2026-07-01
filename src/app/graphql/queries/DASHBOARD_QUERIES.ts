import { graphql } from '@/gql'

export const GET_LOGGED_IN_USER = graphql(`
  query getLoggedInUser($email: String!) {
    people(where: { email_EQ: $email }) {
      id
      name
      firstName
      lastName
      email
      phone
      pronouns
      location
      passions
      traits
      photo
      fieldsOfCare
      interests
      careManual
      favorites
      onboardingCurrentStepIndex
      onboardingCompletedSteps
      onboardingIsCompleted
      onboardingSkipped
      ownsSpaces {
        id
        name
        visibility
        createdAt
        ... on MeSpace {
          __typename
          id
          name
        }
        ... on WeSpace {
          __typename
          id
          name
        }
      }
      memberOf {
        id
        role
        space {
          id
          name
          visibility
          createdAt
          ... on MeSpace {
            __typename
            id
            name
          }
          ... on WeSpace {
            __typename
            id
            name
          }
        }
      }
      connections {
        id
        firstName
        lastName
        name
        photo
      }
      connectionEdges {
        connectedPersonId
        why
        interests
      }
    }
  }
`)

// GOAL-275: directory FIND by name only. Searching by email (email_CONTAINS)
// enabled cross-Space email enumeration; `email` is also now Space-scoped, and
// selecting a gated field would filter the whole Person out of results for
// non-co-Space callers (breaking discovery). So this query selects ONLY the
// open directory fields (id/name/photo) and matches on name — every Person
// stays findable, and no PII is exposed.
export const SEARCH_PEOPLE_QUERY = graphql(`
  query SearchPeople($nameContains: String!) {
    people(
      where: {
        OR: [
          { firstName_CONTAINS: $nameContains }
          { lastName_CONTAINS: $nameContains }
        ]
      }
    ) {
      id
      name
      photo
    }
  }
`)
