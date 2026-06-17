'use client'

import { useState, type FC, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { Maximize2, Minimize2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStudioCanvas, type CanvasView } from './studio-canvas-context'
import { routeHasCanvasScope } from './canvas-scope'
import { useBloomOverlay } from './bloom-overlay-context'
import { BloomView } from './modes/graph-mode/bloom-view'
import { StudioCanvasActionBar } from './canvas-action-bar'
import { StudioBreadcrumb } from './studio-breadcrumb'
import { EntityInfoDrawer } from '@/components/dashboard/entity-info-drawer'

interface CanvasHostProps {
  /** Route content rendered inside the canvas (Next.js `children`). */
  children: ReactNode
  /** True when the canvas is occupying the full viewport (chat hidden). */
  fullscreen: boolean
}

/**
 * The canvas pane — hosts one of the two canonical surfaces:
 *  - Dashboard View (route content: cards, detail pages)
 *  - Bloom Exploration (native NVL, open-ended — see kb/01-glossary.md)
 *
 * The view selector + create actions live in the floating
 * `StudioCanvasActionBar` pinned to the bottom-center; the header only
 * carries fullscreen + close.
 *
 * Bloom is lazy-mounted on first visit and kept alive via
 * `visibility:hidden` so pan / zoom / focal state survives flipping
 * back to the dashboard.
 */
export const CanvasHost: FC<CanvasHostProps> = ({ children, fullscreen }) => {
  const { canvasView, toggleFullscreen, setCanvasOpen } = useStudioCanvas()
  const { overlay, clearOverlay } = useBloomOverlay()
  const pathname = usePathname()

  // `canvasView` is the user's sticky preference (persisted). The *effective*
  // view is what we actually render: on routes the bloom surface can't
  // scope to (persons, profile, settings, search) we fall back to the
  // dashboard view for display — without overwriting the stored preference, so
  // the user's bloom view returns the moment they navigate back to a
  // Space / FieldContext. See `routeHasCanvasScope`.
  const effectiveView: CanvasView = routeHasCanvasScope(pathname)
    ? canvasView
    : 'dashboard'
  const showOverlayChip = effectiveView === 'bloom' && overlay !== null

  // Lazy-mount Bloom; it retains its state across toggles back to dashboard.
  const [bloomVisited, setBloomVisited] = useState(effectiveView === 'bloom')
  if (effectiveView === 'bloom' && !bloomVisited) setBloomVisited(true)

  return (
    <section
      aria-label="Canvas"
      className={cn(
        'relative h-full w-full flex flex-col overflow-hidden bg-gp-surface dark:bg-gp-surface-dark'
      )}
    >
      <header className="flex items-center justify-between gap-2 px-3 py-1.5 border-b border-gp-glass-border bg-gp-glass-bg backdrop-blur-md">
        <div className="flex items-center gap-2 min-w-0">
          <div className="hidden md:flex min-w-0">
            <StudioBreadcrumb />
          </div>
          {showOverlayChip && (
            <button
              type="button"
              onClick={clearOverlay}
              aria-label="Custom view from chat — click to return to the default Bloom view"
              title="Custom view from chat — click to return to the default Bloom view"
              className="group flex items-center gap-1.5 shrink-0 min-w-0 max-w-[55vw] sm:max-w-xs rounded-full pl-2 pr-1.5 py-1 text-xs font-semibold bg-gp-primary text-white shadow-sm ring-1 ring-inset ring-white/20 hover:bg-[color-mix(in_srgb,var(--gp-primary)_88%,black)] transition-colors cursor-pointer"
            >
              <span
                className="material-symbols-outlined text-[16px] leading-none shrink-0"
                aria-hidden="true"
              >
                auto_awesome
              </span>
              <span className="truncate">
                <span className="sm:hidden">Custom view</span>
                <span className="hidden sm:inline">Custom view from chat</span>
              </span>
              <span
                className="material-symbols-outlined text-[16px] leading-none shrink-0 opacity-80 group-hover:opacity-100"
                aria-hidden="true"
              >
                close
              </span>
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
            effectiveView !== 'dashboard' && 'pointer-events-none'
          )}
          style={{
            visibility: effectiveView === 'dashboard' ? 'visible' : 'hidden',
          }}
          aria-hidden={effectiveView !== 'dashboard'}
        >
          {children}
        </div>

        {bloomVisited && (
          <div
            className={cn(
              'absolute inset-0',
              effectiveView !== 'bloom' && 'pointer-events-none'
            )}
            style={{
              visibility: effectiveView === 'bloom' ? 'visible' : 'hidden',
            }}
            aria-hidden={effectiveView !== 'bloom'}
          >
            <BloomView />
          </div>
        )}

        <StudioCanvasActionBar />
      </div>

      {/* The info drawer sits OUTSIDE the per-view visibility cascade — when
          canvasView is bloom, the dashboard subtree above is
          `visibility: hidden`, which would otherwise hide the drawer too
          even though it's `position: fixed`. Mounting it at the canvas-host
          level means the drawer works across both views. */}
      <EntityInfoDrawer />
    </section>
  )
}
