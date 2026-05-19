'use client'

import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { formatDistanceToNow } from 'date-fns'
import { PlusCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GET_ALL_ME_SPACES, GET_ALL_WE_SPACES } from '@/app/graphql/queries'
import { useStudioCanvas } from '@/components/studio/studio-canvas-context'

type SpaceFilter = 'all' | 'me' | 'we'

interface UnifiedSpace {
  id: string
  name: string
  description?: string | null
  createdAt: string
  type: 'MeSpace' | 'WeSpace'
  owner: Array<{ firstName?: string | null; lastName?: string | null }>
  members: unknown[]
  contexts: unknown[]
}

const FILTER_META: { id: SpaceFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'me', label: 'Me Spaces' },
  { id: 'we', label: 'We Spaces' },
]

/**
 * Primary surface of the dashboard — a focused, visually-differentiated
 * view of every space the user can access. MeSpaces use a warm
 * amber/rose treatment to read as "inner sanctuary"; WeSpaces use a
 * cool teal/emerald treatment for "collective field."
 *
 * Clicking a space drills into its field contexts at
 * `/protected/dashboard/space/[id]`, which in turn leads to pulses.
 *
 * The Graph view (custom NVL) is owned by the canvas-host (see
 * `studio-canvas-context.canvasView`). Toggling there switches between
 * this dashboard surface and the Bloom NVL — this component always
 * renders cards.
 */
export function SpacesOverview() {
  const router = useRouter()
  const [filter, setFilter] = useState<SpaceFilter>('all')

  const {
    data: meSpacesData,
    loading: meSpacesLoading,
    error: meSpacesError,
  } = useQuery(GET_ALL_ME_SPACES, { fetchPolicy: 'cache-and-network' })
  const {
    data: weSpacesData,
    loading: weSpacesLoading,
    error: weSpacesError,
  } = useQuery(GET_ALL_WE_SPACES, { fetchPolicy: 'cache-and-network' })

  const loading = meSpacesLoading || weSpacesLoading
  const error = meSpacesError || weSpacesError

  const { meSpaces, weSpaces } = useMemo(() => {
    const me: UnifiedSpace[] =
      meSpacesData?.meSpaces?.map((s) => ({ ...s, type: 'MeSpace' as const })) ?? []
    const we: UnifiedSpace[] =
      weSpacesData?.weSpaces?.map((s) => ({ ...s, type: 'WeSpace' as const })) ?? []
    return { meSpaces: me, weSpaces: we }
  }, [meSpacesData, weSpacesData])

  const visibleSpaces = useMemo(() => {
    const pool =
      filter === 'me' ? meSpaces : filter === 'we' ? weSpaces : [...meSpaces, ...weSpaces]
    return [...pool].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [filter, meSpaces, weSpaces])

  if (error) {
    return (
      <section className="space-y-4">
        <h2 className="section-title text-sm font-bold uppercase tracking-widest text-gp-accent-glow">
          Spaces
        </h2>
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-300">
          Error loading spaces: {error.message}
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6 animate-fade-in">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Your Spaces
          </h2>
          <p className="text-sm text-slate-600 dark:text-white/60">
            Begin in a space to see its field contexts and pulses.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Filter spaces"
          className="flex items-center gap-1 rounded-full border border-white/15 bg-slate-900/40 p-1 backdrop-blur"
        >
          {FILTER_META.map((f) => {
            const count =
              f.id === 'me'
                ? meSpaces.length
                : f.id === 'we'
                  ? weSpaces.length
                  : meSpaces.length + weSpaces.length
            const active = filter === f.id
            return (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(f.id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide transition-all cursor-pointer',
                  active
                    ? 'bg-gradient-to-r from-gp-primary/80 to-gp-accent-glow/80 text-white shadow-inner'
                    : 'text-white/55 hover:text-white/85 hover:bg-white/5'
                )}
              >
                <span>{f.label}</span>
                <span
                  className={cn(
                    'inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10px] font-mono',
                    active ? 'bg-white/20' : 'bg-white/10'
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </header>

      {loading && visibleSpaces.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-44 rounded-2xl bg-white/5 border border-white/10 animate-pulse"
            />
          ))}
        </div>
      ) : visibleSpaces.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {visibleSpaces.map((space) => (
            <SpaceCard
              key={space.id}
              space={space}
              onOpen={() =>
                router.push(`/protected/dashboard/space/${space.id}`)
              }
            />
          ))}
        </div>
      )}
    </section>
  )
}

/**
 * Floating action bar pinned to the bottom-center of the canvas pane.
 * Hosts the create-space buttons so users can spin up a new MeSpace or
 * WeSpace without leaving the dashboard. The view toggle (Dashboard /
 * Graph) is intentionally NOT duplicated here — it already lives in the
 * canvas-host header, so adding a second toggle was redundant and risked
 * conflicting with the canvas-host's Bloom NVL view.
 *
 * Rendered as a sibling of the dashboard's <main> so it floats at the
 * canvas-pane bottom regardless of card-grid scroll position.
 *
 * Hidden when the canvas is in graph mode (canvas-host owns that surface).
 */
export function SpacesActionBar() {
  const router = useRouter()
  const { canvasView } = useStudioCanvas()

  if (canvasView !== 'dashboard') return null

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-2 md:gap-3">
        <button
          type="button"
          onClick={() => router.push('/protected/spaces/me-space')}
          className="cursor-pointer flex items-center gap-2 px-4 md:px-5 h-10 md:h-11 rounded-full gp-glass dark:gp-glass border border-white/10 dark:border-white/10 hover:bg-white/10 dark:hover:bg-white/20 hover:border-white/20 dark:hover:border-white/20 hover:shadow-[0_0_50px_color-mix(in_srgb,var(--gp-primary)_35%,transparent)] transition-all group"
        >
          <PlusCircle className="w-5 h-5 text-amber-300 group-hover:text-amber-200 transition-colors" />
          <span className="hidden sm:inline text-sm font-semibold text-gp-ink-strong dark:text-gp-ink-strong">
            MeSpace
          </span>
        </button>
        <button
          type="button"
          onClick={() => router.push('/protected/spaces/we-space')}
          className="cursor-pointer flex items-center gap-2 px-4 md:px-5 h-10 md:h-11 rounded-full gp-glass dark:gp-glass border border-white/10 dark:border-white/10 hover:bg-white/10 dark:hover:bg-white/20 hover:border-white/20 dark:hover:border-white/20 hover:shadow-[0_0_50px_color-mix(in_srgb,var(--gp-primary)_35%,transparent)] transition-all group"
          data-tour="create-wespace-button"
        >
          <PlusCircle className="w-5 h-5 text-teal-300 group-hover:text-teal-200 transition-colors" />
          <span className="hidden sm:inline text-sm font-semibold text-gp-ink-strong dark:text-gp-ink-strong">
            WeSpace
          </span>
        </button>
      </div>
    </div>
  )
}

interface SpaceCardProps {
  space: UnifiedSpace
  onOpen: () => void
}

function SpaceCard({ space, onOpen }: SpaceCardProps) {
  const isMe = space.type === 'MeSpace'
  const owner = space.owner?.[0]
  const ownerName =
    owner && (owner.firstName || owner.lastName)
      ? `${owner.firstName ?? ''} ${owner.lastName ?? ''}`.trim()
      : 'Unknown'
  const memberCount = space.members?.length ?? 0
  const contextCount = space.contexts?.length ?? 0
  const timeAgo = formatDistanceToNow(new Date(space.createdAt), {
    addSuffix: true,
  })

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'group relative text-left rounded-2xl p-5 border overflow-hidden transition-all cursor-pointer',
        'hover:-translate-y-0.5 hover:shadow-xl',
        isMe
          ? 'border-amber-300/30 dark:border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-transparent hover:from-amber-500/20 hover:via-rose-500/10'
          : 'border-teal-300/30 dark:border-teal-500/20 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-transparent hover:from-teal-500/20 hover:via-emerald-500/10'
      )}
    >
      {/* Top accent strip */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-0 left-0 right-0 h-1 bg-gradient-to-r',
          isMe ? 'from-amber-400 to-rose-400' : 'from-teal-400 to-emerald-400'
        )}
      />

      <div className="flex items-start gap-4 mb-4">
        <div
          className={cn(
            'size-12 rounded-2xl border flex items-center justify-center shadow-md group-hover:scale-110 transition-transform',
            isMe
              ? 'bg-amber-500/20 border-amber-300/40 text-amber-200'
              : 'bg-teal-500/20 border-teal-300/40 text-teal-200'
          )}
        >
          <span className="material-symbols-outlined text-2xl">
            {isMe ? 'self_improvement' : 'groups'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-black text-slate-900 dark:text-white truncate">
            {space.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
                isMe
                  ? 'bg-amber-500/20 border border-amber-400/40 text-amber-100'
                  : 'bg-teal-500/20 border border-teal-400/40 text-teal-100'
              )}
            >
              {isMe ? 'Me Space' : 'We Space'}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-white/45">
              {isMe ? 'Inner Sanctuary' : 'Collective Field'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-white/65">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-base">layers</span>
          <span>
            {contextCount} {contextCount === 1 ? 'field' : 'fields'}
          </span>
        </div>
        {!isMe && (
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">group</span>
            <span>
              {memberCount} {memberCount === 1 ? 'member' : 'members'}
            </span>
          </div>
        )}
        <div className="ml-auto text-[10px] text-slate-400 dark:text-white/40">
          {timeAgo}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
        <span className="text-[10px] text-slate-500 dark:text-white/40">
          Owner:{' '}
          <span className="font-semibold text-slate-700 dark:text-white/70">
            {ownerName}
          </span>
        </span>
        <span
          className={cn(
            'material-symbols-outlined text-base transition-transform group-hover:translate-x-1',
            isMe ? 'text-amber-300/70' : 'text-teal-300/70'
          )}
        >
          arrow_forward
        </span>
      </div>
    </button>
  )
}

function EmptyState({ filter }: { filter: SpaceFilter }) {
  const message =
    filter === 'me'
      ? 'No Me Spaces yet. Create your inner sanctuary.'
      : filter === 'we'
        ? 'No We Spaces yet. Start a collective field.'
        : 'No spaces yet. Create a space to get started.'

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center">
      <span className="material-symbols-outlined text-5xl text-white/25 mb-3">
        workspaces
      </span>
      <p className="text-sm text-slate-500 dark:text-white/55">{message}</p>
    </div>
  )
}
