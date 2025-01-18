import { graphql } from '@/gql'

export const GET_COREVALUE = graphql(`
  query getCoreValue($id: ID!) {
    coreValues(where: { id_EQ: $id }) {
      id
      name
      alignmentChallenges
      alignmentExamples
      description
      why
      people {
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
      alignmentChallenges
      alignmentExamples
      description
      why
      # createdAt
      people {
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
