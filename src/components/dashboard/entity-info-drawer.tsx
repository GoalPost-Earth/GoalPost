'use client'

import { useCallback, useEffect, useRef, useState, type FC } from 'react'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import { useQuery } from '@apollo/client/react'
import { formatDistanceToNow } from 'date-fns'
import { ArrowRight, Layers, Lock, Sparkles, Users, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApp } from '@/contexts'
import { GET_SPACE_DETAILS } from '@/app/graphql/queries/SPACE_DETAILS_QUERIES'
import { dispatchOpenSpaceWarp } from './space-warp-transition'

export type InfoEntityType = 'MeSpace' | 'WeSpace' | 'FieldContext' | 'Pulse' | 'Person'

export interface InfoEntity {
  type: InfoEntityType
  id: string
}

/**
 * Event contract for opening the drawer from anywhere in the canvas
 * surface (cards, bubbles, native NVL nodes). Matches the project's
 * existing window-event pattern (`goalpost:voice-mic-toggle`,
 * `goalpost:graph-zoom-*`) so callers stay loosely coupled.
 *
 * Usage:
 *   window.dispatchEvent(
 *     new CustomEvent('goalpost:open-info-drawer', {
 *       detail: { type: 'MeSpace', id: spaceId },
 *     })
 *   )
 */
export const OPEN_INFO_DRAWER_EVENT = 'goalpost:open-info-drawer'

export function dispatchOpenInfoDrawer(entity: InfoEntity) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent(OPEN_INFO_DRAWER_EVENT, { detail: entity })
  )
}

/**
 * Right-side glass drawer showing detailed information about whatever
 * card / bubble / node the user clicked the (i) button on. Visual
 * treatment mirrors `PersonPanel` (fixed-right, glass, gsap slide-in);
 * body is the canonical `SpaceDetailsView` for space entities (the UI
 * we already have for this — header, sections, actions).
 *
 * Mounted at the dashboard page level. Listens for the global
 * `goalpost:open-info-drawer` event so any descendant can summon it
 * without prop drilling.
 *
 * Closes on ✕, backdrop click, or Esc.
 */
export const EntityInfoDrawer: FC = () => {
  const [entity, setEntity] = useState<InfoEntity | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Listen for the open-drawer event globally.
  useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<InfoEntity>).detail
      if (!detail || !detail.id || !detail.type) return
      setEntity(detail)
    }
    window.addEventListener(OPEN_INFO_DRAWER_EVENT, onOpen)
    return () => window.removeEventListener(OPEN_INFO_DRAWER_EVENT, onOpen)
  }, [])

  // Close on Escape.
  useEffect(() => {
    if (!entity) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setEntity(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [entity])

  // Slide in when an entity is set.
  useEffect(() => {
    if (!entity || !panelRef.current) return
    gsap.fromTo(
      panelRef.current,
      { x: '100%', opacity: 0 },
      { x: '0%', opacity: 1, duration: 0.32, ease: 'power3.out' }
    )
  }, [entity])

  const close = useCallback(() => setEntity(null), [])

  if (!entity) return null

  return (
    <>
      {/* Backdrop — light dim so the canvas behind is still visible. */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
        onClick={close}
        aria-hidden="true"
      />

      <aside
        ref={panelRef}
        role="dialog"
        aria-label={`${entity.type} details`}
        className={cn(
          'fixed right-0 top-0 h-full w-full sm:w-[520px] z-50',
          'bg-gp-surface dark:bg-slate-950/95 backdrop-blur-2xl',
          'border-l border-gp-glass-border shadow-2xl',
          'flex flex-col overflow-hidden'
        )}
      >
        <header className="flex items-center justify-between gap-2 px-6 py-4 border-b border-gp-glass-border shrink-0">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gp-ink-muted dark:text-white/45">
              {entity.type === 'MeSpace'
                ? 'Me Space'
                : entity.type === 'WeSpace'
                  ? 'We Space'
                  : entity.type}
            </p>
            <p className="text-base font-bold text-gp-ink-strong dark:text-white/95">
              Details
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close details"
            title="Close (Esc)"
            className="flex items-center justify-center size-9 rounded-full text-gp-ink-muted dark:text-white/55 hover:text-gp-ink-strong dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          {entity.type === 'MeSpace' || entity.type === 'WeSpace' ? (
            <SpaceDetailsBody spaceId={entity.id} onClose={close} />
          ) : (
            <UnsupportedBody type={entity.type} />
          )}
        </div>
      </aside>
    </>
  )
}

/**
 * Body for MeSpace / WeSpace. Drawer-tailored single-column layout —
 * SpaceDetailsView was designed for the full-screen `/protected/
 * dashboard/space/[id]` route and its `grid-cols-2` sections cramp at
 * drawer widths. This view uses the same `GET_SPACE_DETAILS` query
 * (cache-and-network — first paint instant if dashboard already
 * warmed it) but its own typography and spacing.
 */
const SpaceDetailsBody: FC<{ spaceId: string; onClose: () => void }> = ({
  spaceId,
  onClose,
}) => {
  const router = useRouter()
  const { user } = useApp()
  const { data, loading } = useQuery(GET_SPACE_DETAILS, {
    variables: { spaceId },
    fetchPolicy: 'cache-and-network',
  })

  if (loading && !data) {
    return <SpaceDetailsSkeleton />
  }

  type SpaceData = NonNullable<typeof data>['spaces'][number]
  const space = data?.spaces?.[0] as SpaceData | undefined
  if (!space) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-gp-ink-muted dark:text-white/55">
          This space is no longer available — it may have been deleted or you
          lost access.
        </p>
      </div>
    )
  }

  const isMe = space.__typename === 'MeSpace'
  const accent = isMe
    ? {
        gradient: 'from-amber-500/30 via-rose-500/20 to-transparent',
        ring: 'ring-amber-400/40',
        chipBg: 'bg-amber-500/20 border-amber-400/40 text-amber-100',
        iconBg: 'bg-amber-500/20 border-amber-300/40 text-amber-200',
        iconName: 'self_improvement',
        subtitle: 'Inner Sanctuary',
      }
    : {
        gradient: 'from-teal-500/30 via-emerald-500/20 to-transparent',
        ring: 'ring-teal-400/40',
        chipBg: 'bg-teal-500/20 border-teal-400/40 text-teal-100',
        iconBg: 'bg-teal-500/20 border-teal-300/40 text-teal-200',
        iconName: 'groups',
        subtitle: 'Collective Field',
      }

  const ownerArr = ('owner' in space ? space.owner : undefined) ?? []
  const owner = ownerArr[0]
  const ownerName =
    owner && (owner.firstName || owner.lastName)
      ? `${owner.firstName ?? ''} ${owner.lastName ?? ''}`.trim()
      : owner?.name ?? 'Unknown'
  const isOwner = !!user?.id && owner?.id === user.id

  const members = ('members' in space ? space.members : undefined) ?? []
  const contexts = ('contexts' in space ? space.contexts : undefined) ?? []
  const totalPulses = contexts.reduce(
    (acc, ctx) => acc + (ctx?.pulses?.length ?? 0),
    0
  )

  const created = space.createdAt ? new Date(space.createdAt) : null
  const createdLabel =
    created && !Number.isNaN(created.getTime())
      ? formatDistanceToNow(created, { addSuffix: true })
      : '—'

  const goToSpace = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Drawer's "Open space" button → fire the same warp the cards and
    // bubbles do, originating from the button itself. Closing the
    // drawer first would unmount the source element before we could
    // measure it; we close it AFTER capturing the rect.
    const rect = e.currentTarget.getBoundingClientRect()
    dispatchOpenSpaceWarp({
      spaceId: space.id,
      rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      type: isMe ? 'MeSpace' : 'WeSpace',
      title: space.name || 'Space',
      icon: isMe ? 'self_improvement' : 'groups',
    })
    onClose()
  }

  const goToContext = (ctxId: string) => {
    onClose()
    router.push(`/protected/dashboard/field-context/${ctxId}`)
  }

  return (
    <div className="flex flex-col">
      {/* Hero — name + type chip on a tinted gradient background */}
      <section
        className={cn(
          'relative px-6 pt-7 pb-8 border-b border-gp-glass-border',
          'bg-gradient-to-br',
          accent.gradient
        )}
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'shrink-0 size-14 rounded-2xl border flex items-center justify-center shadow-md',
              accent.iconBg
            )}
          >
            <span className="material-symbols-outlined text-3xl">
              {accent.iconName}
            </span>
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-gp-ink-strong dark:text-white break-words leading-tight">
              {space.name || 'Untitled space'}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] border',
                  accent.chipBg
                )}
              >
                {isMe ? 'Me Space' : 'We Space'}
              </span>
              <span className="text-[11px] uppercase tracking-[0.16em] text-gp-ink-muted dark:text-white/50">
                {accent.subtitle}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* At-a-glance — four mini cells */}
      <section className="px-6 py-5 grid grid-cols-2 gap-3">
        <StatCell
          icon={<Layers className="w-3.5 h-3.5" />}
          label="Field contexts"
          value={String(contexts.length)}
        />
        <StatCell
          icon={<Sparkles className="w-3.5 h-3.5" />}
          label="Total pulses"
          value={String(totalPulses)}
        />
        <StatCell
          icon={<Users className="w-3.5 h-3.5" />}
          label="Members"
          value={isMe ? '—' : String(members.length)}
        />
        <StatCell
          icon={<Lock className="w-3.5 h-3.5" />}
          label="Visibility"
          value={String(space.visibility || 'PRIVATE')}
          valueClassName="uppercase tracking-wider text-[11px]"
        />
      </section>

      {/* Owner — single row */}
      <section className="px-6 pb-5">
        <SectionHeader>Owner</SectionHeader>
        <div className="mt-2 flex items-center gap-3 rounded-xl border border-gp-glass-border bg-white/5 dark:bg-white/[0.03] px-4 py-3">
          <div
            className={cn(
              'shrink-0 size-9 rounded-full border flex items-center justify-center',
              'bg-white/10 border-white/15 text-gp-ink-strong dark:text-white/85'
            )}
          >
            <span className="text-xs font-bold">
              {(ownerName || '?').slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gp-ink-strong dark:text-white/90 truncate">
              {ownerName}
              {isOwner && (
                <span className="ml-2 text-[10px] uppercase tracking-wider text-gp-primary">
                  You
                </span>
              )}
            </p>
            {owner?.email && (
              <p className="text-xs text-gp-ink-muted dark:text-white/50 truncate">
                {owner.email}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Field contexts — list with empty state */}
      <section className="px-6 pb-5">
        <SectionHeader>Field contexts</SectionHeader>
        {contexts.length === 0 ? (
          <EmptyContextsState isOwner={isOwner} />
        ) : (
          <ul className="mt-2 space-y-2">
            {contexts.map((ctx) => (
              <li key={ctx.id}>
                <button
                  type="button"
                  onClick={() => goToContext(ctx.id)}
                  className={cn(
                    'group w-full text-left rounded-xl border border-gp-glass-border bg-white/5 dark:bg-white/[0.03]',
                    'hover:bg-white/10 dark:hover:bg-white/[0.06] hover:border-white/20',
                    'px-4 py-3 transition-all cursor-pointer flex items-center gap-3'
                  )}
                >
                  <div className="size-8 shrink-0 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <Layers className="w-4 h-4 text-gp-ink-muted dark:text-white/60" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gp-ink-strong dark:text-white/90 truncate">
                      {ctx.title || ctx.emergentName || 'Untitled field'}
                    </p>
                    <p className="text-[11px] text-gp-ink-muted dark:text-white/45">
                      {(ctx.pulses?.length ?? 0)} pulse
                      {(ctx.pulses?.length ?? 0) === 1 ? '' : 's'}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Members (We Space only) */}
      {!isMe && members.length > 0 && (
        <section className="px-6 pb-5">
          <SectionHeader>Members ({members.length})</SectionHeader>
          <ul className="mt-2 space-y-1.5">
            {members.slice(0, 6).map((m) => {
              // SpaceMembership.member is always `[Person!]!` per the SDL —
              // see space-details-view.tsx:40 for the canonical extractor.
              const mp = m.member?.[0]
              const name = mp
                ? mp.name ||
                  `${mp.firstName ?? ''} ${mp.lastName ?? ''}`.trim() ||
                  'Member'
                : 'Member'
              const role = m.role || 'MEMBER'
              return (
                <li
                  key={m.id}
                  className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="size-7 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/80">
                      {String(name).slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs font-medium text-gp-ink-strong dark:text-white/85 truncate">
                      {String(name)}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-gp-ink-muted dark:text-white/45">
                    {role}
                  </span>
                </li>
              )
            })}
            {members.length > 6 && (
              <li className="text-[11px] text-gp-ink-muted dark:text-white/45 px-3 pt-1">
                + {members.length - 6} more
              </li>
            )}
          </ul>
        </section>
      )}

      {/* Footer — primary CTA + meta */}
      <footer className="mt-auto px-6 py-5 border-t border-gp-glass-border bg-white/[0.02] dark:bg-white/[0.02] space-y-3">
        <button
          type="button"
          onClick={goToSpace}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-5 h-11 rounded-xl',
            'bg-gp-primary hover:bg-gp-primary/90 text-white font-semibold text-sm',
            'shadow-lg shadow-gp-primary/20 transition-all cursor-pointer',
            'ring-2 ring-transparent focus-visible:ring-white/40'
          )}
        >
          Open space
          <ArrowRight className="w-4 h-4" />
        </button>
        <p className="text-center text-[11px] text-gp-ink-muted dark:text-white/45">
          Created {createdLabel}
        </p>
      </footer>
    </div>
  )
}

const SectionHeader: FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-gp-ink-muted dark:text-white/50">
    {children}
  </h3>
)

const StatCell: FC<{
  icon: React.ReactNode
  label: string
  value: string
  valueClassName?: string
}> = ({ icon, label, value, valueClassName }) => (
  <div className="rounded-xl border border-gp-glass-border bg-white/[0.03] px-3.5 py-3">
    <div className="flex items-center gap-1.5 text-gp-ink-muted dark:text-white/45">
      {icon}
      <span className="text-[10px] uppercase tracking-wider font-semibold">
        {label}
      </span>
    </div>
    <p
      className={cn(
        'mt-1.5 text-xl font-black text-gp-ink-strong dark:text-white tabular-nums',
        valueClassName
      )}
    >
      {value}
    </p>
  </div>
)

const EmptyContextsState: FC<{ isOwner: boolean }> = ({ isOwner }) => (
  <div className="mt-2 rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-6 text-center">
    <Layers className="w-6 h-6 mx-auto mb-2 text-white/25" />
    <p className="text-sm text-gp-ink-muted dark:text-white/55">
      {isOwner
        ? 'No field contexts yet. Open the space to create your first one.'
        : 'No field contexts yet.'}
    </p>
  </div>
)

const SpaceDetailsSkeleton: FC = () => (
  <div className="p-6 space-y-5">
    <div className="flex items-start gap-4">
      <div className="size-14 rounded-2xl bg-white/5 animate-pulse" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-6 w-3/4 rounded-md bg-white/5 animate-pulse" />
        <div className="h-3 w-1/3 rounded-md bg-white/5 animate-pulse" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="h-20 rounded-xl bg-white/5 animate-pulse" />
      <div className="h-20 rounded-xl bg-white/5 animate-pulse" />
      <div className="h-20 rounded-xl bg-white/5 animate-pulse" />
      <div className="h-20 rounded-xl bg-white/5 animate-pulse" />
    </div>
    <div className="h-16 rounded-xl bg-white/5 animate-pulse" />
    <div className="h-32 rounded-xl bg-white/5 animate-pulse" />
  </div>
)

const UnsupportedBody: FC<{ type: InfoEntityType }> = ({ type }) => (
  <div className="p-6 text-center text-sm text-gp-ink-muted dark:text-white/55">
    Details for <span className="font-semibold">{type}</span> aren&apos;t
    wired into this drawer yet.
  </div>
)
