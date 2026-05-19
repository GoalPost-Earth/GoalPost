'use client'

import { type FC, useEffect, useState, useCallback } from 'react'
import { PanelLeftClose, PanelLeftOpen, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  fetchThreadList,
  type ThreadSummary,
} from '@/lib/simulation/conversation-thread-client'

interface ThreadsSidebarProps {
  activeThreadId: string | null
  onSelectThread: (id: string) => void
  onNewThread: () => Promise<void>
}

const COLLAPSED_KEY = 'goalpost.studio.threadsSidebarCollapsed'

function formatDate(iso: string | null): string {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000)
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

export const ThreadsSidebar: FC<ThreadsSidebarProps> = ({
  activeThreadId,
  onSelectThread,
  onNewThread,
}) => {
  const [threads, setThreads] = useState<ThreadSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem(COLLAPSED_KEY)
    if (stored === 'true') setCollapsed(true)
  }, [])

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev
      if (typeof window !== 'undefined') {
        localStorage.setItem(COLLAPSED_KEY, String(next))
      }
      return next
    })
  }, [])

  const fetchThreads = useCallback(async () => {
    try {
      const list = await fetchThreadList()
      setThreads(list)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void fetchThreads() }, [fetchThreads])

  const handleNewThread = async () => {
    setCreating(true)
    try {
      await onNewThread()
      await fetchThreads()
    } finally {
      setCreating(false)
    }
  }

  if (collapsed) {
    return (
      <aside className="flex flex-col h-full w-10 shrink-0 gp-glass border-r border-gp-glass-border items-center py-3 gap-2">
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label="Expand threads"
          title="Expand threads"
          className="flex items-center justify-center size-7 rounded-md text-gp-ink-muted dark:text-white/55 hover:text-gp-ink-strong dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/10 transition-colors cursor-pointer"
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => void handleNewThread()}
          disabled={creating}
          aria-label="New conversation"
          title="New conversation"
          className={cn(
            'flex items-center justify-center size-7 rounded-full transition-all cursor-pointer',
            'bg-gp-primary/10 hover:bg-gp-primary/20 text-gp-primary',
            'disabled:opacity-40 disabled:cursor-not-allowed'
          )}
        >
          <Plus className="w-4 h-4" />
        </button>
      </aside>
    )
  }

  return (
    <aside className="flex flex-col h-full w-60 shrink-0 gp-glass border-r border-gp-glass-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <h2 className="section-title text-xs font-bold uppercase tracking-widest text-gp-accent-glow">
          Threads
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => void handleNewThread()}
            disabled={creating}
            title="New conversation"
            aria-label="New conversation"
            className={cn(
              'flex items-center justify-center size-7 rounded-full transition-all cursor-pointer',
              'bg-gp-primary/10 hover:bg-gp-primary/20 text-gp-primary',
              'disabled:opacity-40 disabled:cursor-not-allowed'
            )}
          >
            <span className="material-symbols-outlined text-[16px] leading-none">
              {creating ? 'hourglass_empty' : 'add'}
            </span>
          </button>
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label="Collapse threads"
            title="Collapse threads"
            className="flex items-center justify-center size-7 rounded-md text-gp-ink-muted dark:text-white/55 hover:text-gp-ink-strong dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mx-3 h-px bg-gp-glass-border mb-1" />

      {/* List */}
      <nav className="flex-1 overflow-y-auto py-1 space-y-0.5 px-2">
        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gp-primary/40" />
          </div>
        )}

        {!loading && threads.length === 0 && (
          <div className="gp-dot-grid flex flex-col items-center justify-center gap-3 py-12 rounded-xl opacity-60">
            <span className="material-symbols-outlined text-4xl text-gp-ink-soft">
              forum
            </span>
            <p className="text-xs text-gp-ink-soft text-center leading-relaxed px-4">
              No conversations yet.
              <br />
              Start chatting to create one.
            </p>
          </div>
        )}

        {!loading && threads.map((t, i) => {
          const isActive =
            activeThreadId === t.id || (activeThreadId === null && i === 0)
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelectThread(t.id)}
              className={cn(
                'nav-item w-full text-left rounded-lg px-3 py-2.5 transition-all cursor-pointer',
                isActive
                  ? 'active bg-white/80 dark:bg-white/8 text-gp-ink-strong dark:text-white'
                  : 'text-gp-ink-muted dark:text-white/55 hover:bg-white/40 dark:hover:bg-white/5 hover:text-gp-ink-strong dark:hover:text-white/80'
              )}
            >
              <p className="text-xs leading-snug line-clamp-2 font-medium">
                {t.title ?? t.snippet ?? 'New conversation'}
              </p>
              <p className="text-[10px] mt-1 opacity-60">
                {formatDate(t.lastTurnAt ?? t.createdAt)}
                {t.turnCount > 0 && ` · ${t.turnCount} msg${t.turnCount !== 1 ? 's' : ''}`}
              </p>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
