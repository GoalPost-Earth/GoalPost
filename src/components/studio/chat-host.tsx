'use client'

import { type FC } from 'react'
import { Maximize2, Minimize2, PanelRightOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStudioCanvas } from './studio-canvas-context'
import { ChatMode } from './modes/chat-mode'

interface ChatHostProps {
  fullscreen: boolean
  selectedThreadId: string | null
  onSelectThread: (id: string, opts?: { isNew?: boolean }) => void
  /** Hide the thread switcher sidebar (narrow viewports). */
  compact?: boolean
}

/**
 * The chat surface. Always mounted — it's the primary view of the studio.
 * Header surfaces controls for showing the canvas (when hidden) and
 * fullscreening this side.
 */
export const ChatHost: FC<ChatHostProps> = ({
  fullscreen,
  selectedThreadId,
  onSelectThread,
  compact = false,
}) => {
  const { canvasOpen, setCanvasOpen, toggleFullscreen } = useStudioCanvas()

  return (
    <section
      aria-label="Chat"
      className={cn(
        'relative h-full w-full flex flex-col overflow-hidden bg-gp-surface dark:bg-gp-surface-dark'
      )}
    >
      <header className="flex items-center justify-between gap-2 px-3 py-1.5 border-b border-gp-glass-border bg-gp-glass-bg backdrop-blur-md">
        <span className="text-[11px] uppercase tracking-[0.18em] font-semibold text-gp-ink-muted">
          Chat
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => toggleFullscreen('chat')}
            aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen chat'}
            title={fullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen (F)'}
            className="hidden md:flex items-center justify-center size-7 rounded-md text-gp-ink-muted hover:text-gp-ink-strong hover:bg-gp-ink-strong/10 transition-colors cursor-pointer"
          >
            {fullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
          {!canvasOpen && (
            <button
              type="button"
              onClick={() => setCanvasOpen(true)}
              aria-label="Show canvas"
              title="Show canvas"
              className="flex items-center gap-1.5 rounded-full border border-gp-glass-border bg-gp-glass-bg px-2.5 py-1 text-[11px] font-semibold text-gp-ink-muted hover:text-gp-ink-strong hover:bg-gp-ink-strong/10 transition-colors cursor-pointer"
            >
              <PanelRightOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Show canvas</span>
            </button>
          )}
        </div>
      </header>

      <div className="relative flex-1 overflow-hidden">
        <ChatMode
          visible
          activeThreadId={selectedThreadId}
          onSelectThread={onSelectThread}
          compact={compact}
        />
      </div>
    </section>
  )
}
