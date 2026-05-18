'use client'

import { type FC } from 'react'
import { ArrowLeftRight, Maximize2, Minimize2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MODES } from './mode-switcher'
import {
  useStudioPanes,
  type StudioMode,
  type PaneId,
} from './studio-panes-context'

interface PaneHeaderProps {
  pane: PaneId
  /** Pane is the only visible pane right now (fullscreen). */
  fullscreen: boolean
}

/**
 * Thin glass strip at the top of a pane: 3 mode chips + fullscreen toggle.
 * Clicking a chip switches just this pane.
 */
export const PaneHeader: FC<PaneHeaderProps> = ({ pane, fullscreen }) => {
  const { left, right, focusedPane, setPaneMode, toggleFullscreen, focusPane } =
    useStudioPanes()
  const currentMode: StudioMode | null = pane === 'left' ? left : right
  const isFocused = focusedPane === pane
  const otherPane: PaneId = pane === 'left' ? 'right' : 'left'
  const canSwap = right !== null

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-2 px-3 py-1.5 border-b border-white/10 backdrop-blur-md',
        isFocused
          ? 'bg-white/5'
          : 'bg-slate-950/40'
      )}
    >
      <div
        role="tablist"
        aria-label={`Mode for ${pane} pane`}
        className="flex items-center gap-0.5 rounded-full border border-white/10 bg-slate-900/60 p-0.5 shadow-sm"
      >
        {MODES.map((m) => {
          const active = currentMode === m.id
          return (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setPaneMode(pane, m.id)}
              className={cn(
                'relative flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide transition-all cursor-pointer',
                active
                  ? 'text-white'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              )}
              title={`${m.label} (${m.shortcut})`}
            >
              {active && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute inset-0 rounded-full bg-gradient-to-r opacity-90',
                    m.accent
                  )}
                />
              )}
              <span className="relative flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] leading-none">
                  {m.icon}
                </span>
                <span className="hidden md:inline">{m.label}</span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-1">
        {canSwap && (
          <button
            type="button"
            onClick={() => focusPane(otherPane)}
            aria-label="Show other pane"
            title="Show other pane"
            className="md:hidden flex items-center justify-center size-7 rounded-md text-white/55 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={() => toggleFullscreen(pane)}
          aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen pane'}
          title={fullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen (F)'}
          className="hidden md:flex items-center justify-center size-7 rounded-md text-white/55 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          {fullscreen ? (
            <Minimize2 className="w-3.5 h-3.5" />
          ) : (
            <Maximize2 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  )
}
