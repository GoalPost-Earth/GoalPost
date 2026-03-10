/**
 * Notification Toast Component
 * Displays brief notifications for user actions
 * Can be dismissed or auto-dismiss after 5 seconds
 */

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

export type NotificationType = 'success' | 'error' | 'info' | 'warning'

export interface NotificationProps {
  id: string
  type: NotificationType
  title: string
  message: string
  duration?: number // milliseconds, 0 = no auto-dismiss
  onDismiss: (id: string) => void
}

export function NotificationToast({
  id,
  type,
  title,
  message,
  duration = 5000,
  onDismiss,
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (duration === 0) return

    const timer = setTimeout(() => {
      setIsVisible(false)
      onDismiss(id)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, id, onDismiss])

  if (!isVisible) return null

  const bgColor = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
    warning: 'bg-amber-50 border-amber-200',
  }[type]

  const titleColor = {
    success: 'text-green-900',
    error: 'text-red-900',
    info: 'text-blue-900',
    warning: 'text-amber-900',
  }[type]

  const messageColor = {
    success: 'text-green-700',
    error: 'text-red-700',
    info: 'text-blue-700',
    warning: 'text-amber-700',
  }[type]

  return (
    <div
      className={`rounded-lg border p-4 shadow-md ${bgColor} flex items-start gap-3 animate-in fade-in slide-in-from-top-2`}
    >
      <div className="flex-1">
        <h3 className={`font-semibold ${titleColor}`}>{title}</h3>
        <p className={`text-sm mt-1 ${messageColor}`}>{message}</p>
      </div>
      <button
        onClick={() => {
          setIsVisible(false)
          onDismiss(id)
        }}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600"
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
    </div>
  )
}

/**
 * Notification Container
 * Manages multiple notifications in a stack
 */
export function NotificationContainer({
  notifications,
  onDismiss,
}: {
  notifications: NotificationProps[]
  onDismiss: (id: string) => void
}) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          {...notification}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  )
}
