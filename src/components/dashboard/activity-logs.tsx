'use client'

import React from 'react'
import { useQuery } from '@apollo/client/react'
import { formatDistanceToNow } from 'date-fns'
import { GET_USER_ACTIVITY_LOGS_QUERY } from '@/app/graphql/queries/ACTIVITY_LOG_QUERIES'
import { useApp } from '@/contexts/AppContext'

interface ActivityLogsProps {
  showAll?: boolean
  onViewAll?: () => void
}

interface ActivityLogEntry {
  id: string
  description: string
  createdAt: string
  createdBy?: Array<{
    id: string
    firstName?: string | null
    lastName?: string | null
    name?: string | null
    photo?: string | null
  }>
  metadata?: string | Record<string, unknown> | null
}

function normalizeLog(log: ActivityLogEntry) {
  const createdByValue = Array.isArray(log?.createdBy)
    ? log.createdBy[0]
    : undefined

  const name =
    createdByValue?.name ||
    `${createdByValue?.firstName || ''} ${createdByValue?.lastName || ''}`.trim() ||
    createdByValue?.id ||
    'User'

  let metadata: Record<string, unknown> | undefined
  if (typeof log?.metadata === 'string') {
    try {
      metadata = JSON.parse(log.metadata) as Record<string, unknown>
    } catch {
      metadata = { raw: log.metadata }
    }
  } else if (log?.metadata && typeof log.metadata === 'object') {
    metadata = log.metadata as Record<string, unknown>
  }

  return {
    id: log.id,
    description: log.description || '',
    createdAt: log.createdAt,
    createdBy: {
      id: createdByValue?.id || 'unknown',
      name,
      photo: createdByValue?.photo || undefined,
    },
    metadata,
  }
}

function getLogIcon(metadata?: Record<string, unknown>) {
  const pulseType = metadata?.pulseType as string | undefined
  const roleChange = metadata?.role as string | undefined

  if (pulseType?.includes('Goal')) return '🎯'
  if (pulseType?.includes('Resource')) return '📚'
  if (pulseType?.includes('Story')) return '📖'
  if (pulseType?.includes('Care')) return '💚'
  if (roleChange) return '👥'
  return '✨'
}

export function ActivityLogs({
  showAll = false,
  onViewAll,
}: ActivityLogsProps) {
  const { user } = useApp()
  const { data, loading, error } = useQuery(GET_USER_ACTIVITY_LOGS_QUERY, {
    variables: {
      userId: user?.id || '',
      limit: showAll ? 100 : 20,
    },
    skip: !user?.id,
    fetchPolicy: 'network-only',
  })

  const logs = React.useMemo(() => {
    const entries = (data?.getUserLogs as ActivityLogEntry[]) || []
    return entries
      .map(normalizeLog)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
  }, [data])

  const displayLogs = showAll ? logs : logs.slice(0, 5)

  if (!user?.id) {
    return (
      <section className="animate-fade-in [animation-delay:0.3s]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title text-gp-primary text-sm font-bold uppercase tracking-widest">
            Activity Logs
          </h3>
        </div>
        <div className="chat-card rounded-2xl p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-white/20 mb-2">
            notifications
          </span>
          <p className="text-sm text-slate-500 dark:text-white/50">
            Sign in to see your activity logs.
          </p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="animate-fade-in [animation-delay:0.3s]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title text-gp-primary text-sm font-bold uppercase tracking-widest">
            Activity Logs
          </h3>
        </div>
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-300">
          Error loading logs: {error.message}
        </div>
      </section>
    )
  }

  return (
    <section className="animate-fade-in [animation-delay:0.3s]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title text-gp-primary text-sm font-bold uppercase tracking-widest">
          Activity Logs
        </h3>
        {!showAll && (
          <button
            onClick={onViewAll}
            className="cursor-pointer text-xs text-slate-400 hover:text-slate-700 transition-colors font-medium dark:text-white/50 dark:hover:text-white"
          >
            View Logs
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="chat-card rounded-2xl p-5 flex items-center gap-5 animate-pulse"
            >
              <div className="size-10 rounded-xl bg-slate-200 dark:bg-slate-700"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-slate-200 rounded dark:bg-slate-700"></div>
                <div className="h-3 w-full bg-slate-200 rounded dark:bg-slate-700"></div>
              </div>
            </div>
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="chat-card rounded-2xl p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-white/20 mb-2">
            notifications
          </span>
          <p className="text-sm text-slate-500 dark:text-white/50">
            No activity logs yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayLogs.map((log) => {
            const timeAgo = formatDistanceToNow(new Date(log.createdAt), {
              addSuffix: true,
            })
            const icon = getLogIcon(log.metadata)

            return (
              <div
                key={log.id}
                className="chat-card rounded-2xl p-5 flex items-start gap-4"
              >
                <div className="size-10 rounded-xl border flex items-center justify-center shrink-0 bg-gp-primary/10 border-gp-primary/20 text-gp-primary">
                  <span className="text-lg">{icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 dark:text-white/80 wrap-break-word whitespace-normal">
                    {log.description}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-400 dark:text-white/50">
                    <span className="font-medium text-slate-500 dark:text-white/70">
                      {log.createdBy.name}
                    </span>
                    <span>•</span>
                    <span>{timeAgo}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
