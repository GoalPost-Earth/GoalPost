'use client'

import { type FC } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStudioCanvas } from './studio-canvas-context'
import { ChatMode } from './modes/chat-mode'

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
 */
export const FloatingChatPanel: FC<FloatingChatPanelProps> = ({
  fullViewport,
  selectedThreadId,
  onSelectThread,
}) => {
  const { floatingChatOpen, setFloatingChatOpen } = useStudioCanvas()

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
      <header className="flex items-center justify-between gap-2 px-3 py-1.5 border-b border-gp-glass-border bg-gp-glass-bg backdrop-blur-md shrink-0">
        <span className="text-[11px] uppercase tracking-[0.18em] font-semibold text-gp-ink-muted">
          Chat
        </span>
        <button
          type="button"
          onClick={() => setFloatingChatOpen(false)}
          aria-label="Close chat"
          title="Close chat (Esc)"
          className="flex items-center justify-center size-7 rounded-md text-gp-ink-muted hover:text-gp-ink-strong hover:bg-gp-ink-strong/10 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </header>

      <div className="relative flex-1 overflow-hidden">
        {/* Always compact in the floating panel — quick chats, not full
            thread navigation. The threads sidebar lives in the docked
            layout's ChatHost instead. */}
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
