'use client'

import { type FC, type ReactNode, useCallback } from 'react'
import { cn } from '@/lib/utils'
import {
  useStudioPanes,
  type PaneId,
  type StudioMode,
} from './studio-panes-context'
import { PaneHeader } from './pane-header'
import { DashboardMode } from './modes/dashboard-mode'
import { GraphMode } from './modes/graph-mode'
import { ChatMode } from './modes/chat-mode'

interface PaneHostProps {
  pane: PaneId
  /** Route children rendered inside the dashboard mode. */
  children: ReactNode
  /** Whether this pane is the only one visible (fullscreen). */
  fullscreen: boolean
  /** Selected chat thread id (shared across both panes). */
  selectedThreadId: string | null
  onSelectThread: (id: string) => void
  /** Show the threads sidebar inside chat mode for this pane. */
  chatCompact?: boolean
}

/**
 * Renders one pane of the studio. Mounts every mode the pane has visited so
 * switching is instant and preserves scroll/focus state via visibility:hidden.
 */
export const PaneHost: FC<PaneHostProps> = ({
  pane,
  children,
  fullscreen,
  selectedThreadId,
  onSelectThread,
  chatCompact = false,
}) => {
  const { left, right, focusedPane, isVisited, focusPane } = useStudioPanes()
  const currentMode: StudioMode | null = pane === 'left' ? left : right
  const isFocused = focusedPane === pane

  const handleFocus = useCallback(() => {
    if (!isFocused) focusPane(pane)
  }, [isFocused, focusPane, pane])

  if (currentMode === null) return null

  return (
    <section
      aria-label={`${pane} pane`}
      onMouseDown={handleFocus}
      onFocusCapture={handleFocus}
      className={cn(
        'relative h-full w-full flex flex-col overflow-hidden bg-slate-950',
        isFocused && !fullscreen && 'ring-1 ring-inset ring-gp-primary/40'
      )}
    >
      <PaneHeader pane={pane} fullscreen={fullscreen} />

      <div className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0">
          <DashboardMode visible={currentMode === 'dashboard'}>
            {children}
          </DashboardMode>
        </div>

        {isVisited(pane, 'graph') && (
          <div className="absolute inset-0">
            <GraphMode visible={currentMode === 'graph'} />
          </div>
        )}

        {isVisited(pane, 'chat') && (
          <div className="absolute inset-0">
            <ChatMode
              visible={currentMode === 'chat'}
              activeThreadId={selectedThreadId}
              onSelectThread={onSelectThread}
              compact={chatCompact}
            />
          </div>
        )}
      </div>
    </section>
  )
}
