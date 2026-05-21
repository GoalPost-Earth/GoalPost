'use client'

import { type FC } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { LayoutGrid, Network, Plus, PlusCircle, Workflow } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GET_ALL_ME_SPACES } from '@/app/graphql/queries'
import { useFocalEntity } from '@/contexts'
import {
  emitOpenAddFieldContextModal,
  emitOpenAddPulseModal,
} from '@/lib/simulation/pulse-creation-events'
import { useStudioCanvas, type CanvasView } from './studio-canvas-context'
import { FieldContextUploadAction } from './field-context-upload-action'

/**
 * Floating action bar pinned to the bottom-center of the canvas pane.
 *
 * The right-hand "create" cluster is contextual — it surfaces the
 * single action that makes sense at the user's current level:
 *  - Inside a FieldContext → Upload document + Add pulse
 *  - Inside a Space (MeSpace/WeSpace) → Add field context
 *  - Anywhere else → Create MeSpace / WeSpace
 *
 * Context is read from focal-entity `source === 'route'` so a persisted
 * focal (set in localStorage / server for assistant continuity) doesn't
 * spill FieldContext-only actions onto neutral surfaces like the
 * top-level dashboard.
 */
export const StudioCanvasActionBar: FC = () => {
  const router = useRouter()
  const { canvasView, setCanvasView } = useStudioCanvas()
  const { focalEntity } = useFocalEntity()

  // Zoom controls apply to both Graph View and Bloom Exploration — they
  // are sibling NVL surfaces per kb/01-glossary.md.
  const inGraphSurface = canvasView === 'graph' || canvasView === 'bloom'

  // Route-sourced focal is the only signal we trust here. Manual /
  // persisted focals are valid for assistant scope but don't imply the
  // matching page is mounted to receive open-modal events.
  const isRouteFocal = focalEntity?.source === 'route'
  const inFieldContext = isRouteFocal && focalEntity?.type === 'FieldContext'
  const inSpace =
    isRouteFocal &&
    (focalEntity?.type === 'MeSpace' || focalEntity?.type === 'WeSpace')

  const dispatchZoom = (action: 'in' | 'out' | 'fit') => {
    window.dispatchEvent(new CustomEvent(`goalpost:graph-zoom-${action}`))
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-6 z-30 flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-3 md:gap-4">
        {inGraphSurface && (
          <div className="flex items-center gap-2 p-1.5 rounded-full gp-glass dark:gp-glass border border-gp-glass-border shadow-xl">
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

        {/* Always mounted — the component self-gates on focal source and
            also keeps its own `pinnedFieldContextId` so an in-flight upload
            survives mid-flow navigation away from the FieldContext. */}
        <FieldContextUploadAction />

        {inFieldContext ? (
          <div className="flex items-center gap-2 md:gap-3">
            <PrimaryAddButton
              label="Add pulse"
              ariaLabel="Add pulse to this field context"
              iconTint="text-teal-300 group-hover:text-teal-200"
              onClick={() => emitOpenAddPulseModal(focalEntity!.id)}
            />
          </div>
        ) : inSpace ? (
          <SpaceActions spaceId={focalEntity!.id} />
        ) : (
          <DefaultActions router={router} />
        )}
      </div>
    </div>
  )
}

const SpaceActions: FC<{ spaceId: string }> = ({ spaceId }) => (
  <div className="flex items-center gap-2 md:gap-3">
    <PrimaryAddButton
      label="Add field context"
      ariaLabel="Add field context to this space"
      iconTint="text-teal-300 group-hover:text-teal-200"
      onClick={() => emitOpenAddFieldContextModal(spaceId)}
    />
  </div>
)

const DefaultActions: FC<{ router: ReturnType<typeof useRouter> }> = ({
  router,
}) => {
  // One MeSpace per user is a domain invariant (see kb/03-workflows.md and
  // kb/05-data-entities.md). Suppress the create-MeSpace shortcut once the
  // user has one; the @authorization filter only returns the caller's own
  // MeSpaces so this count is the right gate.
  const { data: meSpacesData } = useQuery(GET_ALL_ME_SPACES, {
    fetchPolicy: 'cache-and-network',
  })
  const canCreateMeSpace = (meSpacesData?.meSpaces?.length ?? 0) === 0

  return (
    <div className="flex items-center gap-2 md:gap-3">
      {canCreateMeSpace && (
        <button
          type="button"
          onClick={() => router.push('/protected/spaces/me-space')}
          className="cursor-pointer flex items-center gap-2 px-4 md:px-5 h-10 md:h-11 rounded-full gp-glass dark:gp-glass border border-gp-glass-border hover:bg-gp-ink-strong/10 dark:hover:bg-white/20 hover:border-gp-ink-strong/20 dark:hover:border-white/20 hover:shadow-[0_0_50px_color-mix(in_srgb,var(--gp-primary)_35%,transparent)] transition-all group"
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
        className="cursor-pointer flex items-center gap-2 px-4 md:px-5 h-10 md:h-11 rounded-full gp-glass dark:gp-glass border border-gp-glass-border hover:bg-gp-ink-strong/10 dark:hover:bg-white/20 hover:border-gp-ink-strong/20 dark:hover:border-white/20 hover:shadow-[0_0_50px_color-mix(in_srgb,var(--gp-primary)_35%,transparent)] transition-all group"
        aria-label="Create WeSpace"
      >
        <PlusCircle className="w-5 h-5 text-teal-300 group-hover:text-teal-200 transition-colors" />
        <span className="hidden sm:inline text-sm font-semibold text-gp-ink-strong dark:text-gp-ink-strong">
          WeSpace
        </span>
      </button>
    </div>
  )
}

const PrimaryAddButton: FC<{
  label: string
  ariaLabel: string
  iconTint: string
  onClick: () => void
}> = ({ label, ariaLabel, iconTint, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="cursor-pointer flex items-center gap-2 px-4 md:px-5 h-10 md:h-11 rounded-full gp-glass dark:gp-glass border border-gp-glass-border hover:bg-gp-ink-strong/10 dark:hover:bg-white/20 hover:border-gp-ink-strong/20 dark:hover:border-white/20 hover:shadow-[0_0_50px_color-mix(in_srgb,var(--gp-primary)_35%,transparent)] transition-all group"
    aria-label={ariaLabel}
  >
    <Plus className={cn('w-5 h-5 transition-colors', iconTint)} />
    <span className="hidden sm:inline text-sm font-semibold text-gp-ink-strong dark:text-gp-ink-strong">
      {label}
    </span>
  </button>
)

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
    className="cursor-pointer size-9 md:size-10 flex items-center justify-center rounded-full text-gp-ink-muted dark:text-gp-ink-soft hover:text-gp-ink-strong dark:hover:text-gp-ink-strong hover:bg-gp-ink-strong/10 dark:hover:bg-white/20 transition-all"
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
      className="flex items-center gap-1 p-1 rounded-full gp-glass dark:gp-glass border border-gp-glass-border shadow-xl"
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
                  : 'text-gp-ink-muted dark:text-gp-ink-soft hover:text-gp-ink-strong dark:hover:text-gp-ink-strong hover:bg-gp-ink-strong/10 dark:hover:bg-white/20'
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
