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
        email
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

export const SEARCH_PEOPLE_QUERY = graphql(`
  query SearchPeople($nameContains: String!) {
    people(
      where: {
        OR: [
          { firstName_CONTAINS: $nameContains }
          { lastName_CONTAINS: $nameContains }
          { email_CONTAINS: $nameContains }
        ]
      }
    ) {
      id
      name
      email
      photo
    }
  }
`)
