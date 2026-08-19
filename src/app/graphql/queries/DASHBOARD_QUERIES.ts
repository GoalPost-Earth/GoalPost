import { graphql } from '@/gql'

// Keyed on the caller's own Person id, NOT their email. `Person.email` is no
// longer filterable: the generated `email_STARTS_WITH` / `_CONTAINS` operators
// that came with `email_EQ` were an account-enumeration oracle for any
// authenticated caller. The id is already in hand — login and signup both
// return it and it is the same value as the JWT's `user.id` — so this lookup
// loses nothing, seeks the id index instead of scanning a property, and cannot
// be aimed at somebody else's account.
export const GET_LOGGED_IN_USER = graphql(`
  query getLoggedInUser($id: ID!) {
    people(where: { id_EQ: $id }) {
      id
      name
      firstName
      lastName
      photo
      # GOAL-275 PII — read through the single type-level gate. This is the
      # caller's OWN node (matched on their own id), so the "is the person"
      # branch always authorizes it and privateProfile is never null here.
      privateProfile {
        id
        email
        phone
        pronouns
        location
        passions
        traits
        fieldsOfCare
        interests
        careManual
        favorites
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
