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

export const UPDATE_COMMUNITY_MUTATION = graphql(`
  mutation updateCommunity($id: ID!, $update: CommunityUpdateInput!) {
    updateCommunities(where: { id_EQ: $id }, update: $update) {
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
        coreValues {
          id
          name
          description
        }
        resources {
          id
          name
          description
          status
        }
      }
      info {
        nodesCreated
        nodesDeleted
        relationshipsCreated
        relationshipsDeleted
      }
    }
  }
`)

export const DELETE_COMMUNITY_MUTATION = graphql(`
  mutation DeleteCommunity($id: ID!) {
    deleteCommunities(where: { id_EQ: $id }) {
      nodesDeleted
    }
  }
`)
