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
      communities {
        id
        name
        description
      }
      goals {
        id
        name
        description
        status
      }
      createdAt
      createdBy {
        id
        name
        photo
      }
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
      isEmbracedBy {
        goals {
          id
          name
        }
      }
      communities {
        id
        name
        description
      }
      goals {
        id
        name
        description
        status
      }
    }
  }
`)
