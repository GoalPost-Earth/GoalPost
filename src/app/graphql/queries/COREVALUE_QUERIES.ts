import { graphql } from '@/gql'

export const GET_COREVALUE = graphql(`
  query getCoreValue($id: ID!) {
    coreValues(where: { id_EQ: $id }) {
      id
      name
      whoSupports
      alignmentChallenges
      alignmentExamples
      description
      why
      isEmbracedBy {
        id
        name
      }
      # createdAt
    }
  }
`)

export const GET_ALL_COREVALUES = graphql(`
  query getAllCoreValues($where: CoreValueWhere) {
    coreValues(where: $where) {
      id
      name
      whoSupports
      alignmentChallenges
      alignmentExamples
      description
      why
      # createdAt
    }
  }
`)
