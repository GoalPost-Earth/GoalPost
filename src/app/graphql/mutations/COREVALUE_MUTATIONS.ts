import { graphql } from '@/gql'

export const CREATE_COREVALUE_MUTATION = graphql(`
  mutation CreateCoreValues($input: [CoreValueCreateInput!]!) {
    createCoreValues(input: $input) {
      coreValues {
        id
        name
        caresFor
        whoSupports
        alignmentChallenges
        alignmentExamples
        description
        why
        createdAt
      }
    }
  }
`)
