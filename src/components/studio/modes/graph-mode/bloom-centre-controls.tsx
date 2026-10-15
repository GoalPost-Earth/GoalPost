'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * Centre on a node (GOAL-383) — the on-canvas chrome for Bloom's centred view.
 *
 *   - `BloomCentreControls` is the top-left pill. Idle it is the "Centre"
 *     button that arms pick mode; while picking it says so and offers Cancel;
 *     in a centred view it names the centre, counts what is shown, and carries
 *     the "Full canvas" control back out.
 *   - `BloomNodeMenu` is the right-click menu on a node.
 *
 * Both are presentational: BloomView owns the state and the canvas derivation
 * (`bloom-centre-view.ts`).
 */

type CentreControlsProps = {
  mode: 'idle' | 'picking' | 'centred'
  /** Caption of the centred node — only read in 'centred'. */
  centreLabel?: string
  /** Nodes on screen in the centred view. */
  shownCount?: number
  onStartPicking: () => void
  onCancelPicking: () => void
  onExit: () => void
}

const PILL =
  'pointer-events-auto flex min-w-0 max-w-full items-center gap-2 rounded-full gp-glass border shadow-xl'

export function BloomCentreControls({
  mode,
  centreLabel,
  shownCount = 0,
  onStartPicking,
  onCancelPicking,
  onExit,
}: CentreControlsProps) {
  return (
    // Full-width row on phones (so a long caption truncates rather than
    // overflowing), a capped one from `sm:` up.
    <div className="pointer-events-none absolute left-3 right-3 top-3 z-30 flex sm:left-4 sm:top-4 sm:right-auto sm:max-w-md">
      {mode === 'idle' && (
        <button
          type="button"
          onClick={onStartPicking}
          title="Pick a node to see it with its neighbours"
          className={cn(
            PILL,
            'gp-glass-hover h-9 cursor-pointer px-2.5 sm:px-3',
            'border-gp-glass-border text-gp-ink-muted hover:text-gp-primary'
          )}
        >
          <span className="material-symbols-outlined shrink-0 text-lg leading-none">
            center_focus_strong
          </span>
          <span className="text-xs font-semibold">
            Centre<span className="hidden sm:inline"> on a node</span>
          </span>
        </button>
      )}

      {mode === 'picking' && (
        <div
          role="status"
          className={cn(PILL, 'h-9 border-gp-primary/40 pl-3 pr-1')}
        >
          <span className="material-symbols-outlined shrink-0 animate-pulse-slow text-lg leading-none text-gp-primary">
            ads_click
          </span>
          <span className="min-w-0 truncate text-xs font-semibold text-gp-ink-strong">
            Pick a node to centre on
          </span>
          <button
            type="button"
            onClick={onCancelPicking}
            className="gp-menu-item shrink-0 cursor-pointer rounded-full px-2.5 py-1 text-xs font-semibold text-gp-ink-muted"
          >
            Cancel
          </button>
        </div>
      )}

      {mode === 'centred' && (
        <div className={cn(PILL, 'border-gp-primary/40 py-1 pl-3 pr-1')}>
          <span className="material-symbols-outlined shrink-0 text-lg leading-none text-gp-primary">
            center_focus_strong
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-xs font-semibold text-gp-ink-strong">
              {centreLabel || 'Centred view'}
            </p>
            <p className="truncate text-[10px] text-gp-ink-muted">
              {shownCount} {shownCount === 1 ? 'node' : 'nodes'} · click one to
              expand it
            </p>
          </div>
          <button
            type="button"
            onClick={onExit}
            className="flex h-7 shrink-0 cursor-pointer items-center gap-1 rounded-full bg-gp-primary px-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[color-mix(in_srgb,var(--gp-primary)_88%,black)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gp-primary"
          >
            <span className="material-symbols-outlined text-[16px] leading-none">
              arrow_back
            </span>
            Full canvas
          </button>
        </div>
      )}
    </div>
  )
}

type NodeMenuProps = {
  /** Viewport coordinates of the right-click. */
  x: number
  y: number
  label: string
  onCentre: () => void
  onClose: () => void
}

const MENU_MARGIN = 8

export function BloomNodeMenu({
  x,
  y,
  label,
  onCentre,
  onClose,
}: NodeMenuProps) {
  const menuRef = useRef<HTMLDivElement | null>(null)
  const itemRef = useRef<HTMLButtonElement | null>(null)

  // Keep the menu on screen: open at the pointer, but pull it back inside the
  // viewport edge once its real size is known. Written straight to the
  // element before paint, so there is no frame at the unclamped spot.
  useLayoutEffect(() => {
    const el = menuRef.current
    if (!el) return
    const { width, height } = el.getBoundingClientRect()
    el.style.left = `${Math.max(
      MENU_MARGIN,
      Math.min(x, window.innerWidth - width - MENU_MARGIN)
    )}px`
    el.style.top = `${Math.max(
      MENU_MARGIN,
      Math.min(y, window.innerHeight - height - MENU_MARGIN)
    )}px`
  }, [x, y])

  // Focus the only action so Enter takes it and Escape has somewhere to fire
  // from. Closing does not steal focus anywhere: the menu was opened by a
  // pointer, and focus simply stays where the browser leaves it.
  useEffect(() => {
    itemRef.current?.focus()
  }, [])

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as globalThis.Node)) onClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('pointerdown', onPointerDown, true)
    window.addEventListener('keydown', onKey)
    window.addEventListener('wheel', onClose, { passive: true })
    window.addEventListener('resize', onClose)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown, true)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('wheel', onClose)
      window.removeEventListener('resize', onClose)
    }
  }, [onClose])

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label={`Actions for ${label}`}
      className="fixed z-50 w-56 max-w-[calc(100vw-1rem)] rounded-xl border border-gp-glass-border bg-gp-surface-strong p-1 shadow-xl animate-fade-in"
      style={{ left: x, top: y }}
    >
      <p className="truncate px-2.5 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-gp-ink-muted">
        {label}
      </p>
      <button
        ref={itemRef}
        type="button"
        role="menuitem"
        onClick={onCentre}
        className="gp-menu-item flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-gp-ink-strong"
      >
        <span className="material-symbols-outlined text-lg leading-none">
          center_focus_strong
        </span>
        Centre on this node
      </button>
    </div>
  )
}
