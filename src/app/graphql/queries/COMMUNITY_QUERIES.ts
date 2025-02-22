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

      goals {
        id
        name
        photo
        status
        createdAt
        description
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

      createdAt
      createdBy {
        id
        name
        photo
      }
      coreValues {
        id
        name
        description
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

export const GET_PEOPLE_NOT_IN_COMMUNITIES = graphql(`
  query getPeopleNotInCommunities {
    people(where: { communitiesAggregate: { count_EQ: 0 } }) {
      id
      name
      photo
      email
    }
  }
`)
