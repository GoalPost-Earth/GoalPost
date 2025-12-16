import { graphql } from '@/gql'

export const GET_COMMUNITY = graphql(`
  query getCommunity($id: ID!) {
    communities(where: { id_EQ: $id }) {
      id
      name
      type
      members {
        ... on Person {
          id
          name
          email
        }
        ... on Community {
          id
          name
          type
        }
      }
      ownsSpaces {
        id
        name
        visibility
        createdAt
      }
    }
  }
`)

export const GET_ALL_COMMUNITIES = graphql(`
  query getAllCommunites($where: CommunityWhere) {
    communities(where: $where) {
      id
      name
      type
      members {
        ... on Person {
          id
          name
          email
        }
        ... on Community {
          id
          name
          type
        }
      }
      ownsSpaces {
        id
        name
        visibility
      }
    }
  }
`)

// Stubbed until WeSpace member queries are implemented
export const GET_COMMUNITIES_AND_THEIR_MEMBERS = graphql(`
  query getCommunitiesAndTheirMembers {
    communities {
      id
      name
      type
    }
  }
`)

// Stubbed - communities relationship doesn't exist on Person in current schema
export const GET_PEOPLE_NOT_IN_COMMUNITIES = graphql(`
  query getPeopleNotInCommunities {
    people {
      id
      name
      email
    }
  }
`)
