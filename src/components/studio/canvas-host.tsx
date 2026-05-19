'use client'

import { useState, type FC, type ReactNode } from 'react'
import { Maximize2, Minimize2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStudioCanvas } from './studio-canvas-context'
import { GraphMode } from './modes/graph-mode'
import { StudioCanvasActionBar } from './canvas-action-bar'

interface CanvasHostProps {
  /** Route content rendered inside the canvas (Next.js `children`). */
  children: ReactNode
  /** True when the canvas is occupying the full viewport (chat hidden). */
  fullscreen: boolean
}

/**
 * The canvas pane — hosts either the active route (dashboard cards, pulse
 * detail, etc.) or the NVL graph. The Dashboard|Graph toggle and create
 * actions live in the floating `StudioCanvasActionBar` pinned to the
 * bottom-center; the header only carries fullscreen + close.
 *
 * Graph is lazy-mounted on first visit and kept alive via `visibility:hidden`
 * so the user's pan/zoom state isn't lost when they flip back to dashboard.
 */
export const CanvasHost: FC<CanvasHostProps> = ({ children, fullscreen }) => {
  const { canvasView, toggleFullscreen, setCanvasOpen } = useStudioCanvas()

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
      <header className="flex items-center justify-end gap-2 px-3 py-1.5 border-b border-white/10 bg-slate-900/40 backdrop-blur-md">
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

        <StudioCanvasActionBar />
      </div>
    </section>
  )
}
