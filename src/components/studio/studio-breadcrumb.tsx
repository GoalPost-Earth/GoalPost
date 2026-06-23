'use client'

import { useSyncExternalStore, type FC } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useFocalEntity } from '@/contexts'
import type {
  FocalEntity,
  FocalEntityType,
} from '@/lib/focal-entity/types'

// Client-only render gate. FocalEntityProvider reads localStorage in its
// initializer, so the pre-mount render differs from the first client render.
// Render a stable placeholder during SSR + hydration to keep markup
// consistent.
const NOOP_SUBSCRIBE = () => () => {}
const GET_TRUE = () => true
const GET_FALSE = () => false

interface TypeStyle {
  label: string
  dotClass: string
}

const TYPE_STYLES: Record<FocalEntityType, TypeStyle> = {
  MeSpace: { label: 'MeSpace', dotClass: 'bg-emerald-400' },
  WeSpace: { label: 'WeSpace', dotClass: 'bg-emerald-400' },
  FieldContext: { label: 'Field', dotClass: 'bg-amber-300' },
  User: { label: 'Person', dotClass: 'bg-sky-300' },
  PersonPulse: { label: 'Person', dotClass: 'bg-sky-300' },
  GoalPulse: { label: 'Goal', dotClass: 'bg-gp-goal' },
  ResourcePulse: { label: 'Resource', dotClass: 'bg-gp-resource' },
  StoryPulse: { label: 'Story', dotClass: 'bg-pink-300' },
  CarePulse: { label: 'Care', dotClass: 'bg-rose-300' },
  CoreValuePulse: { label: 'Core Value', dotClass: 'bg-violet-300' },
}

function styleFor(type: FocalEntityType): TypeStyle {
  return TYPE_STYLES[type] ?? { label: type, dotClass: 'bg-slate-300' }
}

function hrefFor(type: FocalEntityType, id: string): string | null {
  switch (type) {
    case 'MeSpace':
    case 'WeSpace':
      // Both space kinds resolve to the unified studio space route. The legacy
      // /protected/spaces/* graph pages were removed — Bloom is the graph now.
      return `/protected/dashboard/space/${id}`
    case 'FieldContext':
      return `/protected/dashboard/field-context/${id}`
    case 'PersonPulse':
    case 'User':
      return `/protected/dashboard/persons/${id}`
    // Pulses live in the EntityInfoDrawer — no dedicated route.
    case 'GoalPulse':
    case 'ResourcePulse':
    case 'StoryPulse':
    case 'CarePulse':
    case 'CoreValuePulse':
      return null
    default:
      return null
  }
}

interface Crumb {
  key: string
  type: FocalEntityType | 'Dashboard'
  label: string
  href: string | null
  isCurrent: boolean
}

const DASHBOARD_HREF = '/protected/dashboard'

function buildCrumbs(
  routeFocal: FocalEntity | null,
  onDashboard: boolean
): Crumb[] {
  // `routeFocal` is the route-derived focal (see
  // FocalEntityContext.routeFocalEntity) — the user's *location*, not the
  // manual/persisted focal that node taps in Bloom/Graph mutate. The
  // breadcrumb must not lie about location, so it tracks the route alone.
  //
  // Dashboard is "current" (non-clickable) only when we're actually on the
  // dashboard route. The studio shell wraps every protected surface, so many
  // routes (search, profile, audit) have no route focal yet aren't the
  // dashboard — there, Dashboard must stay a clickable link home.
  const crumbs: Crumb[] = [
    {
      key: 'dashboard',
      type: 'Dashboard',
      label: 'Dashboard',
      href: DASHBOARD_HREF,
      isCurrent: onDashboard,
    },
  ]

  if (!routeFocal) return crumbs

  const focal_ = routeFocal

  for (const parent of focal_.parents ?? []) {
    crumbs.push({
      key: `${parent.type}:${parent.id}`,
      type: parent.type,
      label: parent.label,
      href: hrefFor(parent.type, parent.id),
      isCurrent: false,
    })
  }

  crumbs.push({
    key: `${focal_.type}:${focal_.id}`,
    type: focal_.type,
    label: focal_.label ?? styleFor(focal_.type).label,
    href: null,
    isCurrent: true,
  })

  return crumbs
}

/**
 * Hierarchical position locator in the studio top bar.
 *
 *   Dashboard > [Space] > [FieldContext] > [Current entity]
 *
 * Crumbs are derived from the current focal entity and its parent chain
 * (populated by detail pages via `setFocalParents`). The current crumb is
 * the rightmost; everything to its left is a clickable ancestor.
 */
export const StudioBreadcrumb: FC = () => {
  const isMounted = useSyncExternalStore(NOOP_SUBSCRIBE, GET_TRUE, GET_FALSE)
  const { routeFocalEntity } = useFocalEntity()
  const router = useRouter()
  const pathname = usePathname()

  if (!isMounted) {
    return (
      <div
        className="flex items-center gap-2 rounded-full border border-gp-glass-border bg-gp-ink-strong/5 dark:bg-white/5 px-3 py-1.5 text-xs text-gp-ink-muted dark:text-gp-ink-soft backdrop-blur"
        aria-hidden="true"
      >
        <span className="material-symbols-outlined text-[14px] leading-none">
          home
        </span>
        <span className="font-medium tracking-wide">…</span>
      </div>
    )
  }

  const onDashboard = pathname === DASHBOARD_HREF
  const crumbs = buildCrumbs(routeFocalEntity, onDashboard)

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex min-w-0 max-w-full items-center gap-1 overflow-hidden rounded-full border border-gp-glass-border bg-gp-ink-strong/5 dark:bg-white/10 px-2 py-1 backdrop-blur-xl shadow-md"
    >
      {crumbs.map((crumb, idx) => {
        const isFirst = idx === 0
        const isLastInList = idx === crumbs.length - 1
        const isLast = crumb.isCurrent
        const style =
          crumb.type === 'Dashboard'
            ? null
            : styleFor(crumb.type as FocalEntityType)

        const chipInner = (
          <span className="flex min-w-0 items-center gap-1.5 px-2 py-1 rounded-full">
            {isFirst ? (
              <span
                className="material-symbols-outlined shrink-0 text-[14px] leading-none text-gp-ink-muted dark:text-gp-ink-soft"
                aria-hidden="true"
              >
                home
              </span>
            ) : (
              style && (
                <span
                  className={cn('h-2 w-2 rounded-full shrink-0', style.dotClass)}
                  aria-hidden="true"
                />
              )
            )}
            {isLast ? (
              <>
                {style && (
                  <span className="hidden shrink-0 text-[10px] font-bold uppercase tracking-[0.18em] text-gp-ink-muted dark:text-gp-ink-soft sm:inline">
                    {style.label}
                  </span>
                )}
                <span className="max-w-[12ch] truncate text-sm font-semibold text-gp-ink-strong dark:text-gp-ink-strong sm:max-w-[22ch]">
                  {crumb.label}
                </span>
              </>
            ) : (
              <span
                className={cn(
                  'max-w-[10ch] sm:max-w-[16ch] truncate font-medium',
                  isFirst
                    ? 'text-sm text-gp-ink-strong dark:text-gp-ink-strong'
                    : 'text-xs text-gp-ink-muted dark:text-gp-ink-soft'
                )}
              >
                {crumb.label}
              </span>
            )}
          </span>
        )

        return (
          <span
            key={crumb.key}
            className={cn('flex min-w-0 items-center', isLast && 'shrink')}
          >
            {isLast ? (
              <span
                aria-current="page"
                title={crumb.label}
                className="min-w-0 bg-gp-ink-strong/10 dark:bg-white/15 rounded-full"
              >
                {chipInner}
              </span>
            ) : crumb.href ? (
              <button
                type="button"
                onClick={() => crumb.href && router.push(crumb.href)}
                title={`Go to ${crumb.label}`}
                className="min-w-0 rounded-full hover:bg-gp-ink-strong/10 dark:hover:bg-white/20 transition-colors cursor-pointer"
              >
                {chipInner}
              </button>
            ) : (
              <span title={crumb.label} className="min-w-0">
                {chipInner}
              </span>
            )}
            {!isLastInList && (
              <span
                className="material-symbols-outlined shrink-0 text-[14px] leading-none text-gp-ink-muted/60 dark:text-gp-ink-soft/60"
                aria-hidden="true"
              >
                chevron_right
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
