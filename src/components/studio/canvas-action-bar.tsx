'use client'

import { useState, type FC } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useApolloClient, useMutation, useQuery } from '@apollo/client/react'
import { toast } from 'sonner'
import {
  LayoutGrid,
  Network,
  Plus,
  PlusCircle,
  UserPlus,
  Workflow,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { GET_ALL_ME_SPACES } from '@/app/graphql/queries'
import { LOG_SPACE_ACTIVITY } from '@/app/graphql/mutations/ACTIVITY_LOG_MUTATIONS'
import { useApp, useFocalEntity } from '@/contexts'
import { CreateSpaceModal } from '@/components/canvas/create-space-modal'
import {
  emitOpenAddFieldContextModal,
  emitOpenAddPulseModal,
  emitOpenAddSpaceMembersModal,
} from '@/lib/simulation/pulse-creation-events'
import { useStudioCanvas, type CanvasView } from './studio-canvas-context'
import { routeHasCanvasScope } from './canvas-scope'
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
  const pathname = usePathname()
  const { canvasView, setCanvasView } = useStudioCanvas()
  const { focalEntity } = useFocalEntity()

  // `canvasView` is the sticky preference; the *effective* view is what the
  // canvas actually shows. On routes the graph/bloom surfaces can't scope to
  // (persons, profile, settings, search) the canvas falls back to dashboard
  // for display, so the toggle highlights dashboard and Graph/Bloom are
  // disabled there — selecting them would be a no-op against the route.
  const scopeAvailable = routeHasCanvasScope(pathname)
  const effectiveView: CanvasView = scopeAvailable ? canvasView : 'dashboard'

  // Zoom controls apply to both Graph View and Bloom Exploration — they
  // are sibling NVL surfaces per kb/01-glossary.md.
  const inGraphSurface = effectiveView === 'graph' || effectiveView === 'bloom'

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

        <ViewToggle
          activeView={effectiveView}
          scopeAvailable={scopeAvailable}
          onChange={setCanvasView}
        />

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
    {/* MeSpace owners see this too — first member add auto-converts the
        space to a WeSpace per the addSpaceMember resolver. The dashboard
        view enforces the actual permission (owner-only) on mount. */}
    <SecondaryActionButton
      label="Add person"
      ariaLabel="Add a person to this space"
      icon={<UserPlus className="w-4 h-4" />}
      onClick={() => emitOpenAddSpaceMembersModal(spaceId)}
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

  const { user } = useApp()
  const apolloClient = useApolloClient()
  const [logSpaceActivity] = useMutation(LOG_SPACE_ACTIVITY)
  const [showCreateWeSpaceModal, setShowCreateWeSpaceModal] = useState(false)
  const [isCreatingWeSpace, setIsCreatingWeSpace] = useState(false)

  const handleCreateWeSpace = async ({ name }: { name: string }) => {
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error('Space name is required')
      return
    }
    if (!user?.id) {
      toast.error('You must be signed in to create a WeSpace')
      return
    }

    setIsCreatingWeSpace(true)
    try {
      const res = await fetch('/api/we-space/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed, userId: user.id }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to create WeSpace')
        return
      }

      if (data.weSpace?.id) {
        logSpaceActivity({
          variables: {
            input: {
              action: 'created',
              spaceId: data.weSpace.id,
              spaceType: 'WeSpace',
              spaceName: trimmed,
            },
          },
        }).catch((err) => {
          console.error('Error logging space creation:', err)
        })
      }

      toast.success('WeSpace created')
      setShowCreateWeSpaceModal(false)
      // Refresh any active WeSpace lists (dashboard overview + WeSpace page).
      await apolloClient.refetchQueries({
        include: ['GetAllWeSpaces', 'GetUserWeSpaces'],
      })
    } catch (err) {
      toast.error(
        `Failed to create WeSpace${err instanceof Error ? `: ${err.message}` : ''}`
      )
    } finally {
      setIsCreatingWeSpace(false)
    }
  }

  return (
    <>
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
          onClick={() => setShowCreateWeSpaceModal(true)}
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

      {showCreateWeSpaceModal && (
        <CreateSpaceModal
          isOpen={showCreateWeSpaceModal}
          onClose={() => setShowCreateWeSpaceModal(false)}
          onCreate={handleCreateWeSpace}
          isLoading={isCreatingWeSpace}
          title="Create New WeSpace"
          subtitle="Start a collaborative space with your community"
        />
      )}
    </>
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

const SecondaryActionButton: FC<{
  label: string
  ariaLabel: string
  icon: React.ReactNode
  onClick: () => void
}> = ({ label, ariaLabel, icon, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={ariaLabel}
    title={label}
    className="cursor-pointer flex items-center gap-2 px-3 md:px-4 h-10 md:h-11 rounded-full text-gp-ink-muted dark:text-gp-ink-soft hover:text-gp-ink-strong dark:hover:text-gp-ink-strong hover:bg-gp-ink-strong/10 dark:hover:bg-white/20 transition-all"
  >
    {icon}
    <span className="hidden sm:inline text-sm font-medium">{label}</span>
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
  /**
   * Whether the current route can render the graph/bloom surfaces. When false
   * (persons, profile, settings, search) only the dashboard view is selectable
   * — Graph + Bloom are disabled so the toggle never dead-clicks against a
   * route they can't scope to.
   */
  scopeAvailable: boolean
  onChange: (view: CanvasView) => void
}> = ({ activeView, scopeAvailable, onChange }) => {
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
        const disabled = !scopeAvailable && id !== 'dashboard'
        const isLast = idx === items.length - 1
        return (
          <span key={id} className="flex items-center">
            <button
              type="button"
              role="tab"
              aria-selected={active}
              disabled={disabled}
              onClick={() => onChange(id)}
              aria-label={label}
              title={
                disabled ? `${label} — open a space to use this view` : label
              }
              className={cn(
                'size-9 md:size-10 flex items-center justify-center rounded-full transition-all duration-200',
                disabled
                  ? 'opacity-40 cursor-not-allowed text-gp-ink-muted dark:text-gp-ink-soft'
                  : active
                    ? 'cursor-pointer bg-gp-primary/20 text-gp-primary'
                    : 'cursor-pointer text-gp-ink-muted dark:text-gp-ink-soft hover:text-gp-ink-strong dark:hover:text-gp-ink-strong hover:bg-gp-ink-strong/10 dark:hover:bg-white/20'
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
