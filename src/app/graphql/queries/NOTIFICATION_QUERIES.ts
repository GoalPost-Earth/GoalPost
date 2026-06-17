import { gql } from '@apollo/client'

/**
 * Recipient-addressed notifications for the bell popover. Scoped server-side to
 * the authenticated user — the client never passes a recipient filter.
 * Distinct from the getMy*Logs activity-log queries (those back the audit page).
 */
export const MY_NOTIFICATIONS_QUERY = gql`
  query MyNotifications($limit: Int = 20) {
    myNotifications(limit: $limit) {
      id
      type
      title
      message
      link
      read
      readAt
      createdAt
      actor {
        id
        firstName
        lastName
        name
        photo
      }
    }
  }
`

/**
 * Unread count for the bell badge. Cheap server-side count, scoped to the
 * authenticated user.
 */
export const UNREAD_NOTIFICATION_COUNT_QUERY = gql`
  query UnreadNotificationCount {
    unreadNotificationCount
  }
`
