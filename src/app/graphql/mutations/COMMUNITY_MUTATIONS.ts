import { graphql } from '@/gql'

export const CREATE_COMMUNITY_MUTATION = graphql(`
  mutation CreateCommunities($input: [CommunityCreateInput!]!) {
    createCommunities(input: $input) {
      communities {
        id
        name
        description
        why
        location
        time
        activities
        resultsAchieved
        status
      }
    }
  }
`)
