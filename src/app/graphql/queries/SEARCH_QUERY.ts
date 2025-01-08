import { graphql } from '@/gql'

export const GET_MATCHING_ENTITIES = graphql(`
  query getMatchingEntities($key: String!) {
    carePointSubstringSearch(key: $key) {
      id
      description
    }
    communitySubstringSearch(key: $key) {
      id
      name
      description
      members {
        photo
      }
    }
    coreValueSubstringSearch(key: $key) {
      description
      id
      name
    }
    peopleSubstringSearch(key: $key) {
      id
      name
      photo
    }
    resourceSubstringSearch(key: $key) {
      id
      name
    }
    goalSubstringSearch(key: $key) {
      id
      photo
      description
      name
      status
      createdAt
    }
  }
`)
