import { graphql } from '@/gql'

export const GET_RECENT_ACTIONS = graphql(`
  query getRecentActions {
    carePoints(sort: { createdAt: DESC }, limit: 3, where: {}) {
      createdAt
      description
      name
      id
      status
      createdBy {
        photo
        name
        id
      }
    }
    goals(sort: { createdAt: DESC }, limit: 3) {
      createdAt
      id
      description
      photo
      status
      name
      createdBy {
        name
        id
        photo
      }
    }
    resources(limit: 3, sort: { createdAt: DESC }) {
      providedByPerson {
        name
        photo
        id
      }
      name
      id
      status
      description
      createdAt
    }
    coreValues(limit: 3, sort: { createdAt: DESC }) {
      isEmbracedBy {
        name
        id
        photo
      }
      description
      id
      name
      createdAt
    }
    communities(where: { members_SOME: { NOT: null } }, limit: 3, sort: {}) {
      name
      members(limit: 3, sort: { createdAt: DESC }) {
        id
        name
        photo
        createdAt
      }
    }
  }
`)
