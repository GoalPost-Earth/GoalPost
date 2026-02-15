import { graphql } from '@/gql'

export const GET_LOGGED_IN_USER = graphql(`
  query getLoggedInUser($email: String!) {
    people(where: { email_EQ: $email }) {
      id
      name
      email
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
    }
  }
`)
