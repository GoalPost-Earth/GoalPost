'use client'

import { type FC, useCallback, useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStudioCanvas } from './studio-canvas-context'
import { ChatMode } from './modes/chat-mode'
import { ThreadSwitcher } from '@/components/chat/thread-switcher'
import {
  createConversationThread,
  type ThreadSummary,
} from '@/lib/simulation/conversation-thread-client'
import { onAssistantThreadUpdated } from '@/lib/simulation/assistant-panel-events'

interface FloatingChatPanelProps {
  /** When true, the panel takes the full viewport (mobile). */
  fullViewport: boolean
  selectedThreadId: string | null
  onSelectThread: (id: string, opts?: { isNew?: boolean }) => void
}

/**
 * Slide-out chat panel anchored to the bottom-right corner on desktop, and
 * filling the viewport on mobile. Renders the same ChatMode used in docked
 * layout so the conversation state is shared (the panel and the dock can
 * never both be visible at once, so there's no tree-duplication concern).
 *
 * The docked layout exposes thread controls through the always-visible 240px
 * ThreadsSidebar. The floating panel has no room for that rail, so its ChatMode
 * runs `compact` (no sidebar). The equivalent controls therefore live in this
 * header (GOAL-312): a switcher for previous conversations and a ＋ to start a
 * new one. Mobile always uses this floating layout, so without them phone users
 * had no way to reach thread history or begin a fresh thread.
 */
export const FloatingChatPanel: FC<FloatingChatPanelProps> = ({
  fullViewport,
  selectedThreadId,
  onSelectThread,
}) => {
  const { floatingChatOpen, setFloatingChatOpen } = useStudioCanvas()
  const [creating, setCreating] = useState(false)
  // Bumped whenever the thread list may have changed (a new thread was created,
  // a turn landed) so the switcher refetches and its trigger label tracks the
  // active thread — mirrors the docked sidebar's refetch-on-update behavior.
  const [threadsRefreshKey, setThreadsRefreshKey] = useState(0)

  useEffect(
    () => onAssistantThreadUpdated(() => setThreadsRefreshKey((n) => n + 1)),
    []
  )

  const handleNewThread = useCallback(async () => {
    setCreating(true)
    try {
      const threadId = await createConversationThread()
      // Mark the selection as new so the runtime mounts straight into an empty
      // conversation — no hydration fetch, no full-panel loading flash. Mirrors
      // ChatMode.handleNewThread in the docked layout.
      if (threadId) {
        onSelectThread(threadId, { isNew: true })
        setThreadsRefreshKey((n) => n + 1)
      }
    } finally {
      setCreating(false)
    }
  }, [onSelectThread])

  const handleSelectExisting = useCallback(
    (thread: ThreadSummary) => onSelectThread(thread.id),
    [onSelectThread]
  )

  if (!floatingChatOpen) return null

  return (
    <div
      role="dialog"
      aria-label="Chat"
      className={cn(
        'fixed z-50 flex flex-col bg-gp-surface dark:bg-gp-surface-dark shadow-2xl border border-gp-glass-border overflow-hidden',
        fullViewport
          ? 'inset-0'
          : 'bottom-6 right-6 w-[400px] h-[68vh] max-h-[640px] rounded-2xl'
      )}
    >
      {/* `relative z-10` is load-bearing, not cosmetic: `backdrop-blur-md`
          (backdrop-filter) makes this header its own stacking context, which
          traps the ThreadSwitcher popover's `z-50` *inside* the header. As a
          static (z-auto) element the header paints at the same level as — but
          earlier in the DOM than — the ChatMode body below, so the chat content
          would paint OVER the popover and the previous-conversations dropdown
          would be invisible (GOAL-312). Promoting the header to a positioned
          z-10 element lifts its whole stacking context above the body. */}
      <header className="relative z-10 flex items-center justify-between gap-2 px-3 py-1.5 border-b border-gp-glass-border bg-gp-glass-bg backdrop-blur-md shrink-0">
        {/* Thread controls — the floating/mobile equivalent of the docked
            ThreadsSidebar: switch to a previous conversation (switcher) or
            start a new one (＋). */}
        <div className="flex items-center gap-1 min-w-0">
          <ThreadSwitcher
            activeThreadId={selectedThreadId}
            onSelectThread={handleSelectExisting}
            refreshKey={threadsRefreshKey}
          />
          <button
            type="button"
            onClick={() => void handleNewThread()}
            disabled={creating}
            aria-label="New conversation"
            title="New conversation"
            className={cn(
              'shrink-0 flex items-center justify-center size-7 rounded-full transition-all cursor-pointer',
              'bg-gp-primary/10 hover:bg-gp-primary/20 text-gp-primary',
              'disabled:opacity-40 disabled:cursor-not-allowed'
            )}
          >
            <span
              className={cn(
                'material-symbols-outlined text-[16px] leading-none',
                creating && 'animate-spin'
              )}
            >
              {creating ? 'progress_activity' : 'add'}
            </span>
          </button>
        </div>
        <button
          type="button"
          onClick={() => setFloatingChatOpen(false)}
          aria-label="Close chat"
          title="Close chat (Esc)"
          className="shrink-0 flex items-center justify-center size-7 rounded-md text-gp-ink-muted hover:text-gp-ink-strong hover:bg-gp-ink-strong/10 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </header>

      <div className="relative flex-1 overflow-hidden">
        {/* Always compact in the floating panel — the threads sidebar's role is
            filled by the header controls above. */}
        <ChatMode
          visible
          activeThreadId={selectedThreadId}
          onSelectThread={onSelectThread}
          compact
        />
      </div>
    </div>
  )
}
