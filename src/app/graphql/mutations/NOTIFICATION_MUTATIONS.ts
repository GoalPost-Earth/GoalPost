import { gql } from '@apollo/client'

/**
 * Mark a single notification read. Recipient-scoped server-side. Returns the
 * caller's fresh unread count so the bell badge can update without a refetch.
 */
export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id) {
      success
      message
      unreadCount
    }
  }
`

/**
 * Mark all of the current user's notifications read.
 */
export const MARK_ALL_NOTIFICATIONS_READ = gql`
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead {
      success
      message
      unreadCount
    }
  }
`
