'use client'

import { useState, type FC, type ReactNode } from 'react'
import { Maximize2, Minimize2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStudioCanvas } from './studio-canvas-context'
import { useBloomOverlay } from './bloom-overlay-context'
import { SpatialView } from './modes/graph-mode/spatial-view'
import { BloomView } from './modes/graph-mode/bloom-view'
import { StudioCanvasActionBar } from './canvas-action-bar'
import { EntityInfoDrawer } from '@/components/dashboard/entity-info-drawer'

interface CanvasHostProps {
  /** Route content rendered inside the canvas (Next.js `children`). */
  children: ReactNode
  /** True when the canvas is occupying the full viewport (chat hidden). */
  fullscreen: boolean
}

/**
 * The canvas pane — hosts one of the three canonical surfaces:
 *  - Dashboard View (route content: cards, detail pages)
 *  - Graph View (curated NVL, GoalPost-styled — see kb/01-glossary.md)
 *  - Bloom Exploration (native NVL, open-ended — see kb/01-glossary.md)
 *
 * The view selector + create actions live in the floating
 * `StudioCanvasActionBar` pinned to the bottom-center; the header only
 * carries fullscreen + close.
 *
 * Graph and Bloom are each lazy-mounted on first visit and kept alive
 * via `visibility:hidden` so pan / zoom / focal state survives flipping
 * between any two views.
 */
export const CanvasHost: FC<CanvasHostProps> = ({ children, fullscreen }) => {
  const { canvasView, toggleFullscreen, setCanvasOpen } = useStudioCanvas()
  const { overlay, clearOverlay } = useBloomOverlay()
  const showOverlayChip = canvasView === 'bloom' && overlay !== null

  // Lazy-mount Graph + Bloom independently; each retains state across toggles.
  const [graphVisited, setGraphVisited] = useState(canvasView === 'graph')
  const [bloomVisited, setBloomVisited] = useState(canvasView === 'bloom')
  if (canvasView === 'graph' && !graphVisited) setGraphVisited(true)
  if (canvasView === 'bloom' && !bloomVisited) setBloomVisited(true)

  return (
    <section
      aria-label="Canvas"
      className={cn(
        'relative h-full w-full flex flex-col overflow-hidden bg-gp-surface dark:bg-gp-surface-dark'
      )}
    >
      <header className="flex items-center justify-between gap-2 px-3 py-1.5 border-b border-gp-glass-border bg-gp-glass-bg backdrop-blur-md">
        <div className="flex items-center gap-2 min-w-0">
          {showOverlayChip && (
            <button
              type="button"
              onClick={clearOverlay}
              title="Restore the default Bloom view"
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-200 text-xs font-medium hover:bg-amber-500/25 transition-colors cursor-pointer max-w-xs truncate"
            >
              <span className="truncate">Custom view from chat</span>
              <X className="w-3 h-3 shrink-0" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => toggleFullscreen('canvas')}
            aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen canvas'}
            title={fullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen (F)'}
            className="hidden md:flex items-center justify-center size-7 rounded-md text-gp-ink-muted hover:text-gp-ink-strong hover:bg-gp-ink-strong/10 transition-colors cursor-pointer"
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
            className="flex items-center justify-center size-7 rounded-md text-gp-ink-muted hover:text-gp-ink-strong hover:bg-gp-ink-strong/10 transition-colors cursor-pointer"
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
          <div
            className={cn(
              'absolute inset-0',
              canvasView !== 'graph' && 'pointer-events-none'
            )}
            style={{ visibility: canvasView === 'graph' ? 'visible' : 'hidden' }}
            aria-hidden={canvasView !== 'graph'}
          >
            <SpatialView />
          </div>
        )}

        {bloomVisited && (
          <div
            className={cn(
              'absolute inset-0',
              canvasView !== 'bloom' && 'pointer-events-none'
            )}
            style={{ visibility: canvasView === 'bloom' ? 'visible' : 'hidden' }}
            aria-hidden={canvasView !== 'bloom'}
          >
            <BloomView />
          </div>
        )}

        <StudioCanvasActionBar />
      </div>

      {/* The info drawer sits OUTSIDE the per-view visibility cascade — when
          canvasView is graph or bloom, the dashboard subtree above is
          `visibility: hidden`, which would otherwise hide the drawer too
          even though it's `position: fixed`. Mounting it at the canvas-host
          level means the drawer works across all three views. */}
      <EntityInfoDrawer />
    </section>
  )
}
