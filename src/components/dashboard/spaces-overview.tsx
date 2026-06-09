'use client'

import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { formatDistanceToNow } from 'date-fns'
import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GET_ALL_ME_SPACES, GET_ALL_WE_SPACES } from '@/app/graphql/queries'
import { dispatchOpenInfoDrawer } from './entity-info-drawer'

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

  const error = meSpacesError || weSpacesError

  // Per-query "still waiting for first response" flags. Apollo keeps
  // `loading=true` during background `cache-and-network` refreshes too,
  // which would leave skeletons showing forever — gate on `!data` so
  // these flip false once each query has produced anything.
  const meSpacesPending = meSpacesLoading && !meSpacesData
  const weSpacesPending = weSpacesLoading && !weSpacesData

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

  // Whether the current filter still has an outstanding first response.
  // 'all' waits on both queries; the filtered tabs only care about their
  // own — so e.g. switching to "Me Spaces" doesn't show skeletons just
  // because WeSpaces is still loading in the background.
  const showSkeletons =
    filter === 'me'
      ? meSpacesPending
      : filter === 'we'
        ? weSpacesPending
        : meSpacesPending || weSpacesPending

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
          className="flex items-center gap-1 rounded-full border border-gp-glass-border bg-gp-glass-bg p-1 backdrop-blur"
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
                data-tour={f.id === 'me' ? 'me-spaces-filter' : undefined}
                onClick={() => setFilter(f.id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide transition-all cursor-pointer',
                  active
                    ? 'bg-gradient-to-r from-gp-primary/80 to-gp-accent-glow/80 text-white shadow-inner'
                    : 'text-gp-ink-muted hover:text-gp-ink-strong hover:bg-gp-ink-strong/5'
                )}
              >
                <span>{f.label}</span>
                <span
                  className={cn(
                    'inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10px] font-mono',
                    active ? 'bg-white/20' : 'bg-gp-ink-strong/10'
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </header>

      {visibleSpaces.length === 0 && showSkeletons ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : visibleSpaces.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {visibleSpaces.map((space) => (
            <SpaceCard key={space.id} space={space} />
          ))}
          {/* Keep the loading affordance alive while the other query is
              still in flight — e.g. MeSpaces returned but WeSpaces are
              still loading. Without this the cards would render with
              no signal that more is on the way. */}
          {showSkeletons &&
            [1, 2, 3].map((i) => <SkeletonCard key={`pending-${i}`} />)}
        </div>
      )}
    </section>
  )
}

interface SpaceCardProps {
  space: UnifiedSpace
}

function SpaceCard({ space }: SpaceCardProps) {
  const router = useRouter()
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

  const handleOpen = () => {
    router.push(`/protected/dashboard/space/${space.id}`)
  }

  // Outer is a div-as-button so the nested info button doesn't violate
  // the "no buttons inside buttons" rule. Body click opens the space;
  // the (i) button opens the right-side details drawer.
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleOpen()
        }
      }}
      className={cn(
        'group relative text-left rounded-2xl p-5 border overflow-hidden transition-all cursor-pointer',
        'hover:-translate-y-0.5 hover:shadow-xl',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
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

      {/* Info button — opens the right-side details drawer */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          dispatchOpenInfoDrawer({ type: space.type, id: space.id })
        }}
        aria-label="View details"
        title="View details"
        className={cn(
          'absolute top-3 right-3 z-10 flex items-center justify-center size-7 rounded-full',
          'bg-gp-glass-bg border border-gp-glass-border backdrop-blur-md',
          // Touch devices: always visible (no hover state to discover it
          // by). Hover-capable devices: invisible at rest, revealed on
          // group-hover / focus-visible — same affordance as before.
          'opacity-100 [@media(hover:hover)]:opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
          'hover:bg-gp-ink-strong/10 dark:hover:bg-white/15 transition-all cursor-pointer'
        )}
      >
        <Info className="w-3.5 h-3.5 text-gp-ink-strong/80 dark:text-white/80" />
      </button>

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
                  ? 'bg-amber-500/20 border border-amber-400/40 text-amber-900 dark:text-amber-100'
                  : 'bg-teal-500/20 border border-teal-400/40 text-teal-900 dark:text-teal-100'
              )}
            >
              {isMe ? 'Me Space' : 'We Space'}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-gp-ink-soft dark:text-white/45">
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

      <div className="mt-4 pt-3 border-t border-gp-glass-border flex items-center justify-between">
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
    </div>
  )
}

function SkeletonCard() {
  return (
    <div
      aria-hidden="true"
      className="h-44 rounded-2xl bg-gp-ink-strong/[0.04] dark:bg-white/5 border border-gp-glass-border animate-pulse"
    />
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
    <div className="rounded-2xl border border-gp-glass-border bg-gp-glass-bg p-12 text-center">
      <span className="material-symbols-outlined text-5xl text-gp-ink-soft mb-3">
        workspaces
      </span>
      <p className="text-sm text-slate-500 dark:text-white/55">{message}</p>
    </div>
  )
}
