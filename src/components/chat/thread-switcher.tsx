'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  fetchThreadList,
  type ThreadSummary,
} from '@/lib/simulation/conversation-thread-client'
import {
  deriveDisplayTitle,
  formatRelative,
} from '@/lib/simulation/thread-switcher-helpers'

/**
 * Slice 5 (GOAL-240) — Thread switcher for the assistant panel header.
 *
 * Lists the user's recent ConversationThreads so they can move between
 * their reflective chat and any recent ingest threads. Renders titles
 * (never raw IDs — Rule 1 in `kb/07-ai-assistant-ux.md`) with a recency
 * indicator and a small badge marking ingest threads.
 *
 * A11y:
 *   - Trigger acts as an aria-haspopup combobox.
 *   - Open / close on click; Escape closes; clicking outside closes.
 *   - Arrow Up/Down navigate items; Enter / Space activates.
 *   - Focus is restored to the trigger on close.
 *
 * Mobile: the popover sits below the trigger and constrains itself to the
 * panel width so it remains usable at 375 px.
 */

interface ThreadSwitcherProps {
  activeThreadId: string | null
  onSelectThread: (thread: ThreadSummary) => void
  /**
   * Bumped by the parent when a new thread is created (e.g. after an
   * upload) so the switcher refetches its list. Default refetches on open.
   */
  refreshKey?: number
}

export function ThreadSwitcher({
  activeThreadId,
  onSelectThread,
  refreshKey,
}: ThreadSwitcherProps) {
  const [open, setOpen] = useState(false)
  const [threads, setThreads] = useState<ThreadSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [focusIndex, setFocusIndex] = useState(0)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeThreadId) ?? null,
    [threads, activeThreadId]
  )

  const triggerLabel = activeThread
    ? deriveDisplayTitle(activeThread)
    : 'Conversations'

  // Fetch on open and whenever the parent bumps refreshKey.
  useEffect(() => {
    if (!open && refreshKey === undefined) return
    const controller = new AbortController()
    setLoading(true)
    fetchThreadList(controller.signal).then((list) => {
      if (controller.signal.aborted) return
      setThreads(list)
      setLoading(false)
      const idx = activeThreadId
        ? list.findIndex((t) => t.id === activeThreadId)
        : 0
      setFocusIndex(idx >= 0 ? idx : 0)
    })
    return () => controller.abort()
  }, [open, refreshKey, activeThreadId])

  // Close on outside click.
  useEffect(() => {
    if (!open) return
    const handle = (event: MouseEvent) => {
      if (!containerRef.current) return
      if (containerRef.current.contains(event.target as Node)) return
      setOpen(false)
    }
    window.addEventListener('mousedown', handle)
    return () => window.removeEventListener('mousedown', handle)
  }, [open])

  // Focus first item when list (re)renders open.
  useEffect(() => {
    if (!open || threads.length === 0) return
    const node = listRef.current?.querySelector<HTMLButtonElement>(
      `[data-thread-index="${focusIndex}"]`
    )
    node?.focus()
  }, [open, threads, focusIndex])

  const closeAndRestoreFocus = useCallback(() => {
    setOpen(false)
    // Return focus to the trigger so keyboard users aren't left in limbo.
    queueMicrotask(() => triggerRef.current?.focus())
  }, [])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLUListElement>) => {
      if (threads.length === 0) return
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setFocusIndex((idx) => (idx + 1) % threads.length)
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        setFocusIndex((idx) => (idx - 1 + threads.length) % threads.length)
      } else if (event.key === 'Home') {
        event.preventDefault()
        setFocusIndex(0)
      } else if (event.key === 'End') {
        event.preventDefault()
        setFocusIndex(threads.length - 1)
      } else if (event.key === 'Escape') {
        event.preventDefault()
        closeAndRestoreFocus()
      }
    },
    [threads.length, closeAndRestoreFocus]
  )

  const handleTriggerKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        setOpen(true)
      } else if (event.key === 'Escape' && open) {
        event.preventDefault()
        closeAndRestoreFocus()
      }
    },
    [open, closeAndRestoreFocus]
  )

  const handleSelect = useCallback(
    (thread: ThreadSummary) => {
      onSelectThread(thread)
      closeAndRestoreFocus()
    },
    [onSelectThread, closeAndRestoreFocus]
  )

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Switch conversation thread"
        className="cursor-pointer flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-slate-600 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors max-w-[14rem] truncate"
      >
        <span className="material-symbols-outlined text-[14px]">history</span>
        <span className="truncate">{triggerLabel}</span>
        <span className="material-symbols-outlined text-[14px] opacity-60">
          {open ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Recent conversations"
          className="absolute left-0 top-full mt-2 z-50 w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121b21] shadow-xl backdrop-blur-md"
        >
          <div className="px-3 py-2 border-b border-slate-200 dark:border-white/10 text-[10px] uppercase tracking-[0.16em] font-semibold text-slate-500 dark:text-white/40">
            Recent conversations
          </div>
          {loading && threads.length === 0 ? (
            <div className="px-3 py-4 text-xs text-slate-400 dark:text-white/40">
              Loading…
            </div>
          ) : threads.length === 0 ? (
            <div className="px-3 py-4 text-xs text-slate-400 dark:text-white/40">
              No conversations yet.
            </div>
          ) : (
            <ul
              ref={listRef}
              role="listbox"
              aria-activedescendant={
                threads[focusIndex] ? `thread-option-${focusIndex}` : undefined
              }
              onKeyDown={handleKeyDown}
              className="max-h-72 overflow-y-auto py-1"
            >
              {threads.map((thread, idx) => {
                const isActive = thread.id === activeThreadId
                const isFocused = idx === focusIndex
                const displayTitle = deriveDisplayTitle(thread)
                const recency = formatRelative(thread.lastTurnAt)
                return (
                  <li key={thread.id} role="presentation">
                    <button
                      type="button"
                      id={`thread-option-${idx}`}
                      role="option"
                      aria-selected={isActive}
                      data-thread-index={idx}
                      tabIndex={isFocused ? 0 : -1}
                      onClick={() => handleSelect(thread)}
                      onMouseEnter={() => setFocusIndex(idx)}
                      className={`w-full text-left px-3 py-2 flex flex-col gap-0.5 cursor-pointer transition-colors ${
                        isFocused
                          ? 'bg-slate-100 dark:bg-white/10'
                          : 'hover:bg-slate-50 dark:hover:bg-white/5'
                      } ${
                        isActive
                          ? 'border-l-2 border-l-gp-primary'
                          : 'border-l-2 border-l-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="truncate text-xs font-medium text-slate-900 dark:text-white">
                          {displayTitle}
                        </span>
                        {thread.kind === 'ingest' && (
                          <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full bg-gp-primary/10 dark:bg-gp-primary/20 text-[9px] uppercase tracking-[0.12em] font-semibold text-gp-primary">
                            Ingest
                          </span>
                        )}
                      </div>
                      {recency && (
                        <span className="text-[10px] text-slate-400 dark:text-white/40">
                          {recency}
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
