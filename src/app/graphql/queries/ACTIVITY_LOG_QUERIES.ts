import { graphql } from '@/gql'

/**
 * Get current user's recent logs.
 * Prefer this in authenticated UI (notification feeds, activity sidebars).
 */
export const GET_MY_RECENT_LOGS_QUERY = graphql(`
  query GetMyRecentLogs($limit: Int = 30) {
    getMyRecentLogs(limit: $limit) {
      id
      description
      createdAt
      metadata
      createdBy {
        id
        firstName
        lastName
        name
        photo
      }
    }
  }
`)

/**
 * Get logs for a specific user ID.
 * Useful for admin views or explicit user-activity pages.
 */
export const GET_USER_ACTIVITY_LOGS_QUERY = graphql(`
  query GetUserActivityLogs($userId: ID!, $limit: Int = 50) {
    getUserLogs(userId: $userId, limit: $limit) {
      id
      description
      createdAt
      metadata
      createdBy {
        id
        firstName
        lastName
        name
        photo
      }
    }
  }
`)

/**
 * Get logs for a specific field context.
 */
export const GET_CONTEXT_LOGS_QUERY = graphql(`
  query GetContextLogs($contextId: ID!, $limit: Int = 20) {
    getContextLogs(contextId: $contextId, limit: $limit) {
      id
      description
      createdAt
      metadata
      createdBy {
        id
        firstName
        lastName
        name
        photo
      }
    }
  }
`)
