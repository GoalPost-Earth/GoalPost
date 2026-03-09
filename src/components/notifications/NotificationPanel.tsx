/**
 * Notification Panel Component
 * Displays recent activity logs in a dropdown panel
 * Shows pulses created, space membership changes, and other activities
 */

'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Bell, X } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'

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

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useApp()

  // Fetch user's recent logs
  useEffect(() => {
    if (!isOpen || !user?.id) return

    const fetchNotifications = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/activity-logs/get-user-logs?userId=${user.id}&limit=30`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        )

        if (!response.ok) {
          throw new Error('Failed to fetch notifications')
        }

        const data = await response.json()
        setNotifications(data.logs || [])
      } catch (err) {
        console.error('Error fetching notifications:', err)
        setError(
          err instanceof Error ? err.message : 'Failed to load notifications'
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()

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
      <div className="flex-1 overflow-y-auto">
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
          <button className="text-sm font-medium text-gp-primary hover:text-gp-primary/80 transition-colors">
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
          className="w-8 h-8 rounded-full bg-gp-primary/20 flex items-center justify-center flex-shrink-0"
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
          <p className="text-sm text-gp-ink-strong dark:text-gp-ink-strong line-clamp-2">
            <span className="text-lg inline-block mr-1">{getIcon()}</span>
            {notification.description}
          </p>
          <p className="text-xs text-gp-ink-muted dark:text-gp-ink-soft mt-1">
            {notification.createdBy.name} {timeAgo}
          </p>
        </div>

        {/* Unread indicator (optional) */}
        <div className="w-2 h-2 rounded-full bg-gp-primary flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  )
}
