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

      relatedCommunities {
        id
        name
        description
        members(limit: 5) {
          id
          name
          photo
        }
      }

      members {
        id
        name
        photo
      }

      resources {
        id
        name
        description
        status
        providedByPerson(limit: 1) {
          id
          name
          photo
        }
      }

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
      members {
        id
        name
        photo
      }
      relatedCommunities {
        id
        name
      }
    }
  }
`)

export const GET_COMMUNITIES_AND_THEIR_MEMBERS = graphql(`
  query getCommunitiesAndTheirMembers {
    communities(where: { members_SOME: { NOT: { id_EQ: "" } } }) {
      id
      name
      members {
        email
        name
        id
        photo
      }
    }
  }
`)
