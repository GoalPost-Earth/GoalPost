'use client'

import { useState, type FC, type ReactNode } from 'react'
import { LayoutGrid, Maximize2, Minimize2, Network, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  useStudioCanvas,
  type CanvasView,
} from './studio-canvas-context'
import { GraphMode } from './modes/graph-mode'

interface CanvasHostProps {
  /** Route content rendered inside the canvas (Next.js `children`). */
  children: ReactNode
  /** True when the canvas is occupying the full viewport (chat hidden). */
  fullscreen: boolean
}

const VIEW_META: {
  id: CanvasView
  label: string
  Icon: typeof LayoutGrid
}[] = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutGrid },
  { id: 'graph', label: 'Graph', Icon: Network },
]

/**
 * The canvas pane — hosts either the active route (dashboard cards, pulse
 * detail, etc.) or the NVL graph. Header has a Dashboard|Graph toggle, a
 * fullscreen button, and a close button.
 *
 * Graph is lazy-mounted on first visit and kept alive via `visibility:hidden`
 * so the user's pan/zoom state isn't lost when they flip back to dashboard.
 */
export const CanvasHost: FC<CanvasHostProps> = ({ children, fullscreen }) => {
  const { canvasView, setCanvasView, toggleFullscreen, setCanvasOpen } =
    useStudioCanvas()

  // Lazy-mount graph on first visit, then keep it mounted across toggles.
  const [graphVisited, setGraphVisited] = useState(canvasView === 'graph')
  if (canvasView === 'graph' && !graphVisited) setGraphVisited(true)

  return (
    <section
      aria-label="Canvas"
      className={cn(
        'relative h-full w-full flex flex-col overflow-hidden bg-slate-950'
      )}
    >
      <header className="flex items-center justify-between gap-2 px-3 py-1.5 border-b border-white/10 bg-slate-900/40 backdrop-blur-md">
        <div
          role="tablist"
          aria-label="Canvas view"
          className="flex items-center gap-0.5 rounded-full border border-white/10 bg-slate-900/60 p-0.5 shadow-sm"
        >
          {VIEW_META.map(({ id, label, Icon }) => {
            const active = canvasView === id
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setCanvasView(id)}
                className={cn(
                  'relative flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide transition-all cursor-pointer',
                  active
                    ? 'text-white'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                )}
                title={label}
              >
                {active && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute inset-0 rounded-full bg-gradient-to-r opacity-90',
                      id === 'dashboard'
                        ? 'from-gp-primary/80 to-gp-accent-glow/80'
                        : 'from-emerald-400/80 to-teal-400/80'
                    )}
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{label}</span>
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => toggleFullscreen('canvas')}
            aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen canvas'}
            title={fullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen (F)'}
            className="hidden md:flex items-center justify-center size-7 rounded-md text-white/55 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            {fullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setCanvasOpen(false)}
            aria-label="Close canvas"
            title="Close canvas"
            className="flex items-center justify-center size-7 rounded-md text-white/55 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      <div className="relative flex-1 overflow-hidden">
        <div
          className={cn(
            'absolute inset-0',
            canvasView !== 'dashboard' && 'pointer-events-none'
          )}
          style={{ visibility: canvasView === 'dashboard' ? 'visible' : 'hidden' }}
          aria-hidden={canvasView !== 'dashboard'}
        >
          {children}
        </div>

        {graphVisited && (
          <div className="absolute inset-0">
            <GraphMode visible={canvasView === 'graph'} />
          </div>
        )}
      </div>
    </section>
  )
}
