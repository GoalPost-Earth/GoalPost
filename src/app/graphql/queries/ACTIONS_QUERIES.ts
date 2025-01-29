import { graphql } from '@/gql'

export const GET_RECENT_ACTIONS = graphql(`
  query getRecentActions {
    logs(sort: { createdAt: DESC }, limit: 10) {
      id
      description
      createdAt
      createdBy {
        id
        name
        photo
      }
    }
    carePoints(sort: { createdAt: DESC }, limit: 10, where: {}) {
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
    goals(sort: { createdAt: DESC }, limit: 10) {
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
    resources(limit: 10, sort: { createdAt: DESC }) {
      providedByPerson {
        name
        photo
        id
      }
      providedByCommunity {
        id
        name
      }
      createdBy {
        id
        name
        photo
      }
      name
      id
      status
      description
      createdAt
    }
    coreValues(limit: 10, sort: { createdAt: DESC }) {
      people {
        name
        id
        photo
      }
      description
      id
      name
      createdAt
    }
    communities(where: { members_SOME: { NOT: null } }, limit: 10, sort: {}) {
      name
      id
      members(limit: 10, sort: { createdAt: DESC }) {
        id
        name
        photo
        createdAt
      }
    }
  }
`)
