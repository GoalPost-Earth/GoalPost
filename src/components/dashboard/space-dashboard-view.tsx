'use client'

import { useEffect, useState, type FC } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@apollo/client/react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { ArrowLeft, Info, Layers, Lock, Sparkles, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApp } from '@/contexts'
import { useCreateField } from '@/hooks'
import { GET_SPACE_DETAILS } from '@/app/graphql/queries/SPACE_DETAILS_QUERIES'
import {
  DELETE_ME_SPACE_MUTATION,
  DELETE_WE_SPACE_MUTATION,
  LOG_FIELD_ACTIVITY,
  LOG_SPACE_ACTIVITY,
} from '@/app/graphql/mutations'
import { CreateFieldModal } from '@/components/canvas/create-field-modal'
import { SpacePermissionsModal } from '@/components/spaces/space-permissions-modal'
import {
  useVisibleEntities,
  type VisibleEntity,
} from '@/components/studio/visible-entities-context'
import { dispatchOpenInfoDrawer } from './entity-info-drawer'
import { FieldContextCard } from './field-context-card'

interface SpaceDashboardViewProps {
  spaceId: string
}

/**
 * In-space dashboard surface. The destination of every "open this
 * space" interaction — whether the user clicked a bubble in Graph View
 * or a card on the dashboard. Replaces the legacy ProfileLayout-based
 * `space/[id]` page with a design-aligned view that mirrors the
 * SpacesOverview language (radial-gradient backdrop, glass cards, top
 * accent strips, MeSpace/WeSpace palette).
 *
 * Owns field-context navigation, the "Details" info drawer trigger,
 * and — for WeSpace owners — the member-management modal. The legacy
 * `/protected/spaces/we-space/[id]` page is no longer reachable; this
 * view is the page-level route.
 */
export const SpaceDashboardView: FC<SpaceDashboardViewProps> = ({
  spaceId,
}) => {
  const router = useRouter()
  const { user } = useApp()
  const [showCreateFieldModal, setShowCreateFieldModal] = useState(false)
  const [showEditFieldModal, setShowEditFieldModal] = useState(false)
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showPermissionsModal, setShowPermissionsModal] = useState(false)

  // `cache-and-network` — the dashboard cards and graph bubbles use
  // the same Apollo queries (GET_ALL_ME_SPACES / GET_ALL_WE_SPACES) so
  // the SPACE_DETAILS query usually hits an already-warm cache on
  // first paint. Network refresh runs in the background.
  const { data, loading, error, refetch } = useQuery(GET_SPACE_DETAILS, {
    variables: { spaceId },
    skip: !spaceId,
    fetchPolicy: 'cache-and-network',
  })

  const { createField, loading: isCreatingField } = useCreateField()
  const [deleteMeSpace] = useMutation(DELETE_ME_SPACE_MUTATION)
  const [deleteWeSpace] = useMutation(DELETE_WE_SPACE_MUTATION)
  const [logFieldActivity] = useMutation(LOG_FIELD_ACTIVITY)
  const [logSpaceActivity] = useMutation(LOG_SPACE_ACTIVITY)
  const { publish: publishVisibleEntities } = useVisibleEntities()

  type SpaceData = NonNullable<typeof data>['spaces'][number]
  const space = data?.spaces?.[0] as SpaceData | undefined
  const spaceTypeLabel: 'MeSpace' | 'WeSpace' | null =
    space?.__typename === 'MeSpace'
      ? 'MeSpace'
      : space?.__typename === 'WeSpace'
        ? 'WeSpace'
        : null
  const contexts =
    (space && 'contexts' in space ? space.contexts : undefined) ?? []

  // Publish the Space + every Field Context card the user can see into
  // VisibleEntitiesProvider. The chat assistant reads this snapshot via
  // SESSION CONTEXT's `canvasVisibleEntities` and grounds questions like
  // "what's in this space?" against entities already on screen instead
  // of failing back to a fresh graph search (or, worse, claiming the
  // space is empty when it isn't). Bloom does the equivalent for its
  // own surface in bloom-view.tsx.
  //
  // Apollo returns a fresh `contexts` array reference on every cache
  // refresh, so the effect deps key off content-stable primitives
  // (ids + titles joined) rather than the array itself — otherwise
  // every render would tear down the slice (cleanup → empty) and
  // republish, briefly showing the assistant an empty canvas.
  const activeSpaceId = space?.id ?? null
  const activeSpaceName = space?.name ?? null
  const contextsKey = contexts
    .map((ctx) => `${ctx?.id ?? ''}::${ctx?.title ?? ''}`)
    .join('|')
  useEffect(() => {
    if (!activeSpaceId || !spaceTypeLabel) {
      publishVisibleEntities('dashboard', [])
      return
    }
    const entities: VisibleEntity[] = [
      {
        id: activeSpaceId,
        name: activeSpaceName ?? 'Untitled space',
        type: spaceTypeLabel,
        source: 'dashboard',
      },
      ...contexts
        .filter((ctx): ctx is NonNullable<typeof ctx> => Boolean(ctx?.id))
        .map((ctx) => ({
          id: ctx.id,
          name: ctx.title ?? 'Untitled field context',
          type: 'FieldContext',
          source: 'dashboard' as const,
        })),
    ]
    publishVisibleEntities('dashboard', entities)
    return () => {
      publishVisibleEntities('dashboard', [])
    }
    // `contexts` intentionally omitted — `contextsKey` is its content-
    // stable proxy. Including the raw array would re-fire on every
    // Apollo cache refresh and churn the slice.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeSpaceId,
    activeSpaceName,
    spaceTypeLabel,
    contextsKey,
    publishVisibleEntities,
  ])

  if (loading && !data) return <SpaceDashboardSkeleton />
  if (error || !space) return <SpaceDashboardError onBack={() => router.push('/protected/dashboard')} />

  const isMe = spaceTypeLabel === 'MeSpace'
  const owner = ('owner' in space ? space.owner : undefined)?.[0]
  const members = ('members' in space ? space.members : undefined) ?? []
  const totalPulses = contexts.reduce(
    (acc, ctx) => acc + (ctx?.pulses?.length ?? 0),
    0
  )
  const isOwner = !!user?.id && owner?.id === user.id

  // SpaceMembership.member is `[Person!]!` per the SDL, but
  // SpacePermissionsModal expects a single object — flatten here
  // (same shape the legacy WeSpace page produced).
  const membersForPermissions = members.map((m) => {
    const mp = m?.member?.[0]
    const fullName =
      mp?.name ||
      `${mp?.firstName ?? ''} ${mp?.lastName ?? ''}`.trim() ||
      'Member'
    return {
      id: m.id,
      role: m.role as 'ADMIN' | 'MEMBER' | 'GUEST',
      addedAt: m.addedAt ?? undefined,
      member: {
        __typename: mp?.__typename || 'Person',
        id: mp?.id || '',
        name: fullName,
        email: mp?.email ?? undefined,
      },
    }
  })

  const created = space.createdAt ? new Date(space.createdAt) : null
  const createdLabel =
    created && !Number.isNaN(created.getTime())
      ? formatDistanceToNow(created, { addSuffix: true })
      : '—'

  const handleCreateField = async (description: string, name?: string) => {
    const title = name || description
    const spaceType = isMe ? 'meSpace' : 'weSpace'
    try {
      const created = await createField(title, spaceId, spaceType, description)
      if (created?.id) {
        logFieldActivity({
          variables: {
            input: {
              action: 'created',
              fieldId: created.id,
              fieldName: title,
              contextId: created.id,
              spaceName: space.name,
            },
          },
        }).catch((err) => console.warn('Field log failed:', err))
      }
      setShowCreateFieldModal(false)
      await refetch()
    } catch (err) {
      console.error('Field create failed:', err)
      toast.error('Failed to create field context')
    }
  }

  const handleDeleteSpace = async () => {
    if (contexts.length > 0) {
      toast.error(
        `Cannot delete a space with ${contexts.length} field context${contexts.length === 1 ? '' : 's'}.`
      )
      setShowDeleteConfirm(false)
      return
    }
    setIsDeleting(true)
    try {
      const where = { id_EQ: spaceId }
      if (isMe) await deleteMeSpace({ variables: { where } })
      else await deleteWeSpace({ variables: { where } })
      logSpaceActivity({
        variables: {
          input: {
            action: 'deleted',
            spaceId,
            spaceType: space.__typename,
            spaceName: space.name,
          },
        },
      }).catch(() => undefined)
      toast.success('Space deleted')
      router.push('/protected/dashboard')
    } catch (err) {
      console.error('Space delete failed:', err)
      toast.error('Failed to delete space')
      setIsDeleting(false)
    }
  }

  return (
    <div className="relative flex h-full w-full overflow-hidden">
      {/* Backdrop — same blob pattern as the dashboard root, but the
          accent blob (top-left) follows the space's palette so this
          view reads as a focused "you are now inside this space." */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.8),transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03),transparent_70%)]" />
        <div
          className="absolute top-[10%] left-[10%] w-125 h-125 rounded-full blur-[120px] animate-blob"
          style={{
            backgroundColor: isMe
              ? 'color-mix(in srgb, var(--gp-accent-glow) 12%, transparent)'
              : 'color-mix(in srgb, var(--gp-primary) 12%, transparent)',
          }}
        />
        <div
          className="absolute bottom-[10%] right-[10%] w-100 h-100 rounded-full blur-[100px] animate-blob [animation-delay:2s]"
          style={{
            backgroundColor:
              'color-mix(in srgb, var(--gp-accent-glow) 10%, transparent)',
          }}
        />
        <div
          className="absolute top-[40%] left-[60%] w-75 h-75 rounded-full blur-[100px] animate-blob [animation-delay:4s]"
          style={{
            backgroundColor:
              'color-mix(in srgb, var(--gp-goal) 10%, transparent)',
          }}
        />
      </div>

      <main className="flex-1 relative z-10 overflow-y-auto scroller p-6 sm:p-8 pb-24">
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
          {/* Top bar — back to dashboard + (i) drawer for full details */}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => router.push('/protected/dashboard')}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-white/55 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Spaces
            </button>
            <div className="flex items-center gap-2">
              {!isMe && isOwner && (
                <button
                  type="button"
                  onClick={() => setShowPermissionsModal(true)}
                  className="inline-flex items-center gap-2 px-3 h-8 rounded-full bg-white/10 dark:bg-white/5 border border-white/15 hover:bg-white/20 dark:hover:bg-white/10 text-xs font-medium text-slate-700 dark:text-white/75 transition-colors cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  Members
                </button>
              )}
              <button
                type="button"
                onClick={() =>
                  dispatchOpenInfoDrawer({
                    type: isMe ? 'MeSpace' : 'WeSpace',
                    id: spaceId,
                  })
                }
                className="inline-flex items-center gap-2 px-3 h-8 rounded-full bg-white/10 dark:bg-white/5 border border-white/15 hover:bg-white/20 dark:hover:bg-white/10 text-xs font-medium text-slate-700 dark:text-white/75 transition-colors cursor-pointer"
              >
                <Info className="w-3.5 h-3.5" />
                Details
              </button>
            </div>
          </div>

          {/* Hero — space identity */}
          <header className="flex flex-col items-center text-center gap-3">
            <div
              className={cn(
                'size-16 rounded-3xl border flex items-center justify-center shadow-lg',
                isMe
                  ? 'bg-amber-500/20 border-amber-300/40 text-amber-200'
                  : 'bg-teal-500/20 border-teal-300/40 text-teal-200'
              )}
            >
              <span className="material-symbols-outlined text-4xl">
                {isMe ? 'self_improvement' : 'groups'}
              </span>
            </div>
            <div className="space-y-2">
              <span
                className={cn(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] border',
                  isMe
                    ? 'bg-amber-500/20 border-amber-400/40 text-amber-100'
                    : 'bg-teal-500/20 border-teal-400/40 text-teal-100'
                )}
              >
                {isMe ? 'Me Space' : 'We Space'}
              </span>
              <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                {space.name || 'Untitled space'}
              </h1>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-white/45">
                Created {createdLabel}
              </p>
            </div>

            {/* At-a-glance counters */}
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-xl w-full">
              <Stat icon={<Layers className="w-3.5 h-3.5" />} label="Fields" value={contexts.length} />
              <Stat icon={<Sparkles className="w-3.5 h-3.5" />} label="Pulses" value={totalPulses} />
              <Stat
                icon={<Users className="w-3.5 h-3.5" />}
                label="Members"
                value={isMe ? '—' : members.length}
              />
              <Stat
                icon={<Lock className="w-3.5 h-3.5" />}
                label="Privacy"
                value={String(space.visibility || 'PRIVATE')}
                valueClassName="uppercase tracking-wider text-xs"
              />
            </div>
          </header>

          {/* Field Contexts grid */}
          <section className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="space-y-1">
                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Field Contexts
                </h2>
                <p className="text-sm text-slate-600 dark:text-white/60">
                  Each field gathers a thread of pulses on one theme.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateFieldModal(true)}
                className="inline-flex items-center gap-2 px-4 h-10 rounded-full bg-gp-primary hover:bg-gp-primary/90 text-white font-semibold text-sm shadow-md shadow-gp-primary/20 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Create field
              </button>
            </div>

            {contexts.length === 0 ? (
              <EmptyFields
                isOwner={isOwner}
                onCreate={() => setShowCreateFieldModal(true)}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {contexts.map((ctx) => (
                  <FieldContextCard
                    key={ctx.id}
                    context={ctx}
                    spaceKind={isMe ? 'MeSpace' : 'WeSpace'}
                    onEdit={(id) => {
                      setEditingFieldId(id)
                      setShowEditFieldModal(true)
                    }}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Danger zone — only owners see this, and only when there
              are no fields blocking deletion. Keeps the destructive
              path discoverable without dominating the page. */}
          {isOwner && contexts.length === 0 && (
            <section className="pt-6 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs text-red-500/80 hover:text-red-400 transition-colors cursor-pointer"
              >
                Delete this space
              </button>
            </section>
          )}
        </div>
      </main>

      {showCreateFieldModal && (
        <CreateFieldModal
          isOpen={showCreateFieldModal}
          onClose={() => setShowCreateFieldModal(false)}
          onCreateField={handleCreateField}
          isLoading={isCreatingField}
        />
      )}

      {showEditFieldModal && editingFieldId && (
        <CreateFieldModal
          isOpen={showEditFieldModal}
          onClose={() => {
            setShowEditFieldModal(false)
            setEditingFieldId(null)
          }}
          isEditing={true}
          fieldId={editingFieldId}
          initialName={
            contexts.find((c) => c.id === editingFieldId)?.title || ''
          }
          initialDescription={
            contexts.find((c) => c.id === editingFieldId)?.emergentName || ''
          }
          onEditSuccess={async () => {
            setShowEditFieldModal(false)
            setEditingFieldId(null)
            await refetch()
          }}
          onDeleteSuccess={async () => {
            setShowEditFieldModal(false)
            setEditingFieldId(null)
            await refetch()
          }}
        />
      )}

      {!isMe && isOwner && showPermissionsModal && (
        <SpacePermissionsModal
          isOpen={showPermissionsModal}
          onClose={() => setShowPermissionsModal(false)}
          spaceId={spaceId}
          spaceName={space.name || 'Untitled space'}
          members={membersForPermissions}
          onRefetch={async () => {
            await refetch()
          }}
        />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative bg-gp-surface dark:bg-gp-surface-dark rounded-2xl shadow-2xl max-w-md w-full mx-4 p-7 border border-gp-glass-border">
            <h2 className="text-xl font-bold text-gp-ink-strong dark:text-white mb-2">
              Delete {isMe ? 'Me Space' : 'We Space'}?
            </h2>
            <p className="text-sm text-gp-ink-muted dark:text-white/60 mb-5">
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 h-9 rounded-lg border border-gp-glass-border text-sm hover:bg-gp-glass-bg transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSpace}
                disabled={isDeleting}
                className="px-4 h-9 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const Stat: FC<{
  icon: React.ReactNode
  label: string
  value: string | number
  valueClassName?: string
}> = ({ icon, label, value, valueClassName }) => (
  <div className="rounded-xl border border-white/10 bg-white/5 dark:bg-white/[0.03] px-3 py-2.5 text-left backdrop-blur-sm">
    <div className="flex items-center gap-1.5 text-slate-500 dark:text-white/45">
      {icon}
      <span className="text-[10px] uppercase tracking-wider font-semibold">
        {label}
      </span>
    </div>
    <p
      className={cn(
        'mt-1 text-lg font-black text-slate-900 dark:text-white tabular-nums',
        valueClassName
      )}
    >
      {value}
    </p>
  </div>
)

const EmptyFields: FC<{ isOwner: boolean; onCreate: () => void }> = ({
  isOwner,
  onCreate,
}) => (
  <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-12 text-center">
    <span className="material-symbols-outlined text-5xl text-white/25 mb-3">
      category
    </span>
    <p className="text-sm text-slate-500 dark:text-white/55 max-w-md mx-auto mb-4">
      {isOwner
        ? 'No field contexts yet. Create your first one to start gathering pulses around a theme.'
        : 'This space has no field contexts yet.'}
    </p>
    {isOwner && (
      <button
        type="button"
        onClick={onCreate}
        className="inline-flex items-center gap-2 px-4 h-9 rounded-full bg-gp-primary hover:bg-gp-primary/90 text-white text-xs font-semibold transition-colors cursor-pointer"
      >
        <span className="material-symbols-outlined text-[16px]">add</span>
        Create your first field
      </button>
    )}
  </div>
)

const SpaceDashboardSkeleton: FC = () => (
  <div className="relative flex h-full w-full overflow-hidden">
    <div className="absolute inset-0 pointer-events-none z-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.8),transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03),transparent_70%)]" />
    </div>
    <main className="flex-1 relative z-10 overflow-y-auto scroller p-6 sm:p-8 pb-24">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col items-center gap-3 mt-8">
          <div className="size-16 rounded-3xl bg-white/5 animate-pulse" />
          <div className="h-5 w-24 rounded-full bg-white/5 animate-pulse" />
          <div className="h-9 w-72 rounded-md bg-white/5 animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-xl w-full mt-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-14 rounded-xl bg-white/5 animate-pulse"
              />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-44 rounded-2xl bg-white/5 border border-white/10 animate-pulse"
            />
          ))}
        </div>
      </div>
    </main>
  </div>
)

const SpaceDashboardError: FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="relative flex h-full w-full items-center justify-center">
    <div className="text-center space-y-4">
      <p className="text-sm text-slate-500 dark:text-white/55">
        This space is no longer available — it may have been deleted or you
        lost access.
      </p>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 px-4 h-9 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-slate-700 dark:text-white/75 hover:bg-white/20 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to spaces
      </button>
    </div>
  </div>
)
