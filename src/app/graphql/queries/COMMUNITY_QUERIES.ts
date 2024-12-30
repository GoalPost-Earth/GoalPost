import { graphql } from '@/gql'

export const GET_COMMUNITY = graphql(`
  query getCommunity($id: ID!) {
    communities(where: { id_EQ: $id }) {
      id
      name
      description
      why
      location
      time
      activities
      resultsAchieved
      status
      createdBy {
        id
        name
        photo
      }
    }
  }
`)

export const GET_ALL_COMMUNITIES = graphql(`
  query getAllCommunites($where: CommunityWhere) {
    communities(where: $where) {
      id
      name
      description
      why
      location
      time
      activities
      resultsAchieved
      status
      createdBy {
        id
        name
        photo
      }
    }
  }
`)
