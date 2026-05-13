/**
 * Notification Panel Component
 * Displays recent activity logs in a dropdown panel
 * Shows pulses created, space membership changes, and other activities
 */

'use client'

import { useState, useEffect } from 'react'
import { gql } from '@apollo/client'
import { useApolloClient } from '@apollo/client/react'
import { formatDistanceToNow } from 'date-fns'
import { Bell, X } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { useRouter } from 'next/navigation'

export interface NotificationItem {
  id: string
  description: string
  createdAt: string
  createdBy: {
    id: string
    name: string
    photo?: string
  }
  metadata?: Record<string, any>
}

interface NotificationPanelProps {
  isOpen: boolean
  onClose: () => void
}

const GET_USER_ACTIVITY_LOGS_QUERY = gql`
  query GetUserActivityLogsForNotifications($userId: ID!, $limit: Int = 20) {
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
`

type GetUserActivityLogsResult = {
  getUserLogs?: Array<Record<string, any>>
}

function normalizeLogToNotification(log: any): NotificationItem {
  const createdByValue = Array.isArray(log?.createdBy)
    ? log.createdBy[0]
    : log?.createdBy

  const name =
    createdByValue?.name ||
    `${createdByValue?.firstName || ''} ${createdByValue?.lastName || ''}`.trim() ||
    createdByValue?.id ||
    'User'

  let metadata: Record<string, any> | undefined
  if (typeof log?.metadata === 'string') {
    try {
      metadata = JSON.parse(log.metadata) as Record<string, any>
    } catch {
      metadata = { raw: log.metadata }
    }
  } else if (log?.metadata && typeof log.metadata === 'object') {
    metadata = log.metadata as Record<string, any>
  }

  return {
    id: log?.id,
    description: log?.description || '',
    createdAt: log?.createdAt,
    createdBy: {
      id: createdByValue?.id || 'unknown',
      name,
      photo: createdByValue?.photo || undefined,
    },
    metadata,
  }
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useApp()
  const apolloClient = useApolloClient()
  const router = useRouter()

  // Fetch user's recent logs
  useEffect(() => {
    if (!isOpen || !user?.id) return

    const fetchNotifications = async () => {
      // Only show loading spinner on initial load
      if (isInitialLoad) {
        setIsLoading(true)
      }
      setError(null)

      try {
        const { data, error: queryError } =
          await apolloClient.query<GetUserActivityLogsResult>({
            query: GET_USER_ACTIVITY_LOGS_QUERY,
            variables: {
              userId: user.id,
              limit: 20,
            },
            fetchPolicy: 'network-only',
          })

        if (queryError) {
          throw queryError
        }

        const logs = (data?.getUserLogs || []).map(normalizeLogToNotification)

        // Ensure notifications are sorted by date (newest first)
        const sortedLogs = logs.sort(
          (a: NotificationItem, b: NotificationItem) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setNotifications(sortedLogs)

        // Mark as loaded after first successful fetch
        if (isInitialLoad) {
          setIsInitialLoad(false)
        }
      } catch (err) {
        console.error('Error fetching notifications:', err)
        setError(
          err instanceof Error ? err.message : 'Failed to load notifications'
        )
      } finally {
        if (isInitialLoad) {
          setIsLoading(false)
        }
      }
    }

    fetchNotifications()

    // Mark notifications as viewed when panel opens
    if (user?.id) {
      const storageKey = `lastNotificationView_${user.id}`
      localStorage.setItem(storageKey, new Date().toISOString())
    }

    // Refresh every 30 seconds when panel is open
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [isOpen, user?.id])

  if (!isOpen) return null

  return (
    <div className="absolute top-full right-0 mt-2 w-96 max-h-96 rounded-2xl bg-white dark:bg-black/90 border border-gp-glass-border shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gp-glass-border">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-gp-primary" />
          <h2 className="font-semibold text-gp-ink-strong dark:text-gp-ink-strong">
            Notifications
          </h2>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Close notifications"
        >
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div
        className="flex-1 overflow-y-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gp-primary" />
          </div>
        )}

        {error && (
          <div className="px-4 py-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20">
            {error}
          </div>
        )}

        {!isLoading && !error && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center px-4">
            <Bell size={32} className="text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-sm text-gp-ink-muted dark:text-gp-ink-soft">
              No recent activities
            </p>
          </div>
        )}

        {!isLoading && notifications.length > 0 && (
          <div className="divide-y divide-gp-glass-border">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-3 border-t border-gp-glass-border">
          <button
            className="text-sm font-medium text-gp-primary hover:text-gp-primary/80 transition-colors cursor-pointer"
            onClick={() => router.push('/protected?tab=activity')}
          >
            View all activities
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * Individual notification item
 */
function NotificationItem({
  notification,
}: {
  notification: NotificationItem
}) {
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
  })

  // Extract metadata for icon determination
  const pulseType = notification.metadata?.pulseType
  const roleChange = notification.metadata?.role

  const getIcon = () => {
    if (pulseType?.includes('Goal')) return '🎯'
    if (pulseType?.includes('Resource')) return '📚'
    if (pulseType?.includes('Story')) return '📖'
    if (pulseType?.includes('Care')) return '💚'
    if (roleChange) return '👥'
    return '✨'
  }

  return (
    <div className="px-4 py-3 hover:bg-gp-surface-soft/30 dark:hover:bg-gp-surface-dark/30 transition-colors cursor-pointer group">
      <div className="flex gap-3">
        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full bg-gp-primary/20 flex items-center justify-center shrink-0"
          title={notification.createdBy.name}
        >
          {notification.createdBy.photo ? (
            <img
              src={notification.createdBy.photo}
              alt={notification.createdBy.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-sm font-semibold text-gp-primary">
              {notification.createdBy.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gp-ink-strong dark:text-gp-ink-strong wrap-break-word whitespace-normal">
            <span className="text-lg inline-block mr-1">{getIcon()}</span>
            {notification.description}
          </p>
          <p className="text-xs text-gp-ink-muted dark:text-gp-ink-soft mt-1">
            {notification.createdBy.name} {timeAgo}
          </p>
        </div>

        {/* Unread indicator (optional) */}
        <div className="w-2 h-2 rounded-full bg-gp-primary shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  )
}

/**
 * Hook to get unread notification count
 */
export function useUnreadCount(userId?: string) {
  const [unreadCount, setUnreadCount] = useState(0)
  const apolloClient = useApolloClient()

  useEffect(() => {
    if (!userId) {
      setUnreadCount(0)
      return
    }

    const fetchUnreadCount = async () => {
      try {
        const { data, error } =
          await apolloClient.query<GetUserActivityLogsResult>({
            query: GET_USER_ACTIVITY_LOGS_QUERY,
            variables: {
              userId,
              limit: 20,
            },
            fetchPolicy: 'network-only',
          })

        if (error) return

        const logs = (data?.getUserLogs || []).map(normalizeLogToNotification)

        // Get last viewed time from localStorage
        const storageKey = `lastNotificationView_${userId}`
        const lastViewedStr = localStorage.getItem(storageKey)
        const lastViewed = lastViewedStr ? new Date(lastViewedStr) : new Date(0)

        // Count logs created after last viewed time
        const unread = logs.filter(
          (log: NotificationItem) => new Date(log.createdAt) > lastViewed
        ).length

        setUnreadCount(unread)
      } catch (err) {
        console.error('Error fetching unread count:', err)
      }
    }

    fetchUnreadCount()

    // Refresh count every minute
    const interval = setInterval(fetchUnreadCount, 60000)
    return () => clearInterval(interval)
  }, [userId])

  return unreadCount
}
