'use client'

import { type FC } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { LayoutGrid, Network, PlusCircle, Workflow } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GET_ALL_ME_SPACES } from '@/app/graphql/queries'
import { useStudioCanvas, type CanvasView } from './studio-canvas-context'

/**
 * Floating action bar pinned to the bottom-center of the canvas pane.
 *
 * Mirrors the WeSpace page pattern: a horizontal cluster of pill-shaped
 * groups built with `gp-glass`. Persistently visible across canvas views
 * because canvas-host renders it as a sibling of both the route content
 * and the NVL graph mode.
 *
 * Groups:
 * - Zoom (only when in Graph view) — drives BloomView's NVL ref via window
 *   events (see `bloom-view.tsx`).
 * - View toggle — flips between dashboard cards and the NVL graph.
 * - Create — quick links to MeSpace/WeSpace creation routes.
 */
export const StudioCanvasActionBar: FC = () => {
  const router = useRouter()
  const { canvasView, setCanvasView } = useStudioCanvas()

  // One MeSpace per user is a domain invariant (see kb/03-workflows.md and
  // kb/05-data-entities.md). Suppress the create-MeSpace shortcut once the
  // user has one; the @authorization filter only returns the caller's own
  // MeSpaces so this count is the right gate.
  const { data: meSpacesData } = useQuery(GET_ALL_ME_SPACES, {
    fetchPolicy: 'cache-and-network',
  })
  const canCreateMeSpace = (meSpacesData?.meSpaces?.length ?? 0) === 0

  // Zoom controls apply to both Graph View and Bloom Exploration — they
  // are sibling NVL surfaces per kb/01-glossary.md.
  const inGraphSurface = canvasView === 'graph' || canvasView === 'bloom'

  const dispatchZoom = (action: 'in' | 'out' | 'fit') => {
    window.dispatchEvent(new CustomEvent(`goalpost:graph-zoom-${action}`))
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-6 z-30 flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-3 md:gap-4">
        {inGraphSurface && (
          <div className="flex items-center gap-2 p-1.5 rounded-full gp-glass dark:gp-glass border border-white/10 dark:border-white/10 shadow-xl">
            <ZoomButton
              label="Zoom out"
              icon="remove"
              onClick={() => dispatchZoom('out')}
            />
            <Divider />
            <ZoomButton
              label="Zoom in"
              icon="add"
              onClick={() => dispatchZoom('in')}
            />
            <Divider />
            <ZoomButton
              label="Fit to view"
              icon="fit_screen"
              onClick={() => dispatchZoom('fit')}
            />
          </div>
        )}

        <ViewToggle activeView={canvasView} onChange={setCanvasView} />

        <div className="flex items-center gap-2 md:gap-3">
          {canCreateMeSpace && (
            <button
              type="button"
              onClick={() => router.push('/protected/spaces/me-space')}
              className="cursor-pointer flex items-center gap-2 px-4 md:px-5 h-10 md:h-11 rounded-full gp-glass dark:gp-glass border border-white/10 dark:border-white/10 hover:bg-white/10 dark:hover:bg-white/20 hover:border-white/20 dark:hover:border-white/20 hover:shadow-[0_0_50px_color-mix(in_srgb,var(--gp-primary)_35%,transparent)] transition-all group"
              aria-label="Create MeSpace"
            >
              <PlusCircle className="w-5 h-5 text-amber-300 group-hover:text-amber-200 transition-colors" />
              <span className="hidden sm:inline text-sm font-semibold text-gp-ink-strong dark:text-gp-ink-strong">
                MeSpace
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={() => router.push('/protected/spaces/we-space')}
            data-tour="create-wespace-button"
            className="cursor-pointer flex items-center gap-2 px-4 md:px-5 h-10 md:h-11 rounded-full gp-glass dark:gp-glass border border-white/10 dark:border-white/10 hover:bg-white/10 dark:hover:bg-white/20 hover:border-white/20 dark:hover:border-white/20 hover:shadow-[0_0_50px_color-mix(in_srgb,var(--gp-primary)_35%,transparent)] transition-all group"
            aria-label="Create WeSpace"
          >
            <PlusCircle className="w-5 h-5 text-teal-300 group-hover:text-teal-200 transition-colors" />
            <span className="hidden sm:inline text-sm font-semibold text-gp-ink-strong dark:text-gp-ink-strong">
              WeSpace
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

const Divider: FC = () => (
  <div className="w-px h-4 bg-gp-ink-soft/20 dark:bg-white/10" />
)

const ZoomButton: FC<{
  label: string
  icon: string
  onClick: () => void
}> = ({ label, icon, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className="cursor-pointer size-9 md:size-10 flex items-center justify-center rounded-full text-gp-ink-muted dark:text-gp-ink-soft hover:text-gp-ink-strong dark:hover:text-gp-ink-strong hover:bg-white/10 dark:hover:bg-white/20 transition-all"
  >
    <span className="material-symbols-outlined">{icon}</span>
  </button>
)

const ViewToggle: FC<{
  activeView: CanvasView
  onChange: (view: CanvasView) => void
}> = ({ activeView, onChange }) => {
  // Order + labels follow the kb canonical names (kb/01-glossary.md):
  // Dashboard View → Graph View → Bloom Exploration.
  const items: { id: CanvasView; label: string; Icon: typeof LayoutGrid }[] = [
    { id: 'dashboard', label: 'Dashboard view', Icon: LayoutGrid },
    { id: 'graph', label: 'Graph view', Icon: Network },
    { id: 'bloom', label: 'Bloom exploration', Icon: Workflow },
  ]

  return (
    <div
      role="tablist"
      aria-label="Canvas view"
      className="flex items-center gap-1 p-1 rounded-full gp-glass dark:gp-glass border border-white/10 dark:border-white/10 shadow-xl"
    >
      {items.map(({ id, label, Icon }, idx) => {
        const active = activeView === id
        const isLast = idx === items.length - 1
        return (
          <span key={id} className="flex items-center">
            <button
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(id)}
              aria-label={label}
              title={label}
              className={cn(
                'cursor-pointer size-9 md:size-10 flex items-center justify-center rounded-full transition-all duration-200',
                active
                  ? 'bg-gp-primary/20 text-gp-primary'
                  : 'text-gp-ink-muted dark:text-gp-ink-soft hover:text-gp-ink-strong dark:hover:text-gp-ink-strong hover:bg-white/10 dark:hover:bg-white/20'
              )}
            >
              <Icon className="w-4 h-4" />
            </button>
            {!isLast && <Divider />}
          </span>
        )
      })}
    </div>
  )
}
