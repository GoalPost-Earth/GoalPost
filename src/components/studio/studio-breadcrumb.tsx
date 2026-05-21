'use client'

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FC,
} from 'react'
import { cn } from '@/lib/utils'
import { useFocalEntity, useNavigationHistory } from '@/contexts'
import type {
  NavigationHistoryEntry,
} from '@/contexts/NavigationHistoryContext'
import type { FocalEntityType } from '@/lib/focal-entity/types'

// Client-only render gate. Both FocalEntityProvider and
// NavigationHistoryProvider read localStorage in their initializers, so the
// pre-mount render differs from the first client render. Render a stable
// placeholder during SSR + hydration to keep markup consistent.
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

function chipLabel(entry: NavigationHistoryEntry): string {
  if (entry.label) return entry.label
  // Never expose any slice of the raw id in the chrome (Rule 1 — no
  // internal artifacts in user-facing UI). Until the label resolves,
  // fall back to the entity type alone.
  return styleFor(entry.type).label
}

const MAX_VISIBLE_TRAIL = 4

/**
 * Temporal navigation breadcrumb in the studio top bar. Replaces the
 * earlier hierarchical FocalContextBadge with a click-history trail:
 * oldest on the left, current on the right (highlighted). The user can
 * click any earlier chip to jump back; overflow collapses into a
 * compact "earlier…" dropdown.
 *
 * The trail is driven by NavigationHistoryContext, which itself rides on
 * FocalEntityContext — every focal change shows up here automatically.
 */
export const StudioBreadcrumb: FC = () => {
  const isMounted = useSyncExternalStore(NOOP_SUBSCRIBE, GET_TRUE, GET_FALSE)
  const { history, goTo } = useNavigationHistory()
  const { focalEntity } = useFocalEntity()
  const [showOverflow, setShowOverflow] = useState(false)
  const overflowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showOverflow) return
    const onDocClick = (e: MouseEvent) => {
      if (
        overflowRef.current &&
        !overflowRef.current.contains(e.target as Node)
      ) {
        setShowOverflow(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [showOverflow])

  if (!isMounted) {
    return (
      <div
        className="flex items-center gap-2 rounded-full border border-gp-glass-border bg-gp-ink-strong/5 dark:bg-white/5 px-3 py-1.5 text-xs text-gp-ink-muted dark:text-gp-ink-soft backdrop-blur"
        aria-hidden="true"
      >
        <span className="material-symbols-outlined text-[14px] leading-none">
          history
        </span>
        <span className="font-medium tracking-wide">…</span>
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-gp-glass-border bg-gp-ink-strong/5 dark:bg-white/5 px-3 py-1.5 text-xs text-gp-ink-muted dark:text-gp-ink-soft backdrop-blur">
        <span className="material-symbols-outlined text-[14px] leading-none">
          history
        </span>
        <span className="hidden md:inline font-medium tracking-wide">
          {focalEntity ? '…' : 'No history yet — click a pulse, space, or person'}
        </span>
        <span className="md:hidden font-medium tracking-wide">No history</span>
      </div>
    )
  }

  const trail = history
  const overflow =
    trail.length > MAX_VISIBLE_TRAIL
      ? trail.slice(0, trail.length - MAX_VISIBLE_TRAIL)
      : []
  const visible =
    trail.length > MAX_VISIBLE_TRAIL
      ? trail.slice(trail.length - MAX_VISIBLE_TRAIL)
      : trail

  return (
    <nav
      aria-label="Navigation history"
      className="flex items-center gap-1 rounded-full border border-gp-glass-border bg-gp-ink-strong/5 dark:bg-white/10 px-2 py-1 backdrop-blur-xl shadow-md"
    >
      {overflow.length > 0 && (
        <div className="relative" ref={overflowRef}>
          <button
            type="button"
            onClick={() => setShowOverflow((v) => !v)}
            className="flex items-center gap-1 px-2 py-1 rounded-full text-gp-ink-muted dark:text-gp-ink-soft hover:text-gp-ink-strong dark:hover:text-gp-ink-strong hover:bg-gp-ink-strong/10 dark:hover:bg-white/20 transition-colors cursor-pointer"
            aria-haspopup="menu"
            aria-expanded={showOverflow}
            title={`${overflow.length} earlier ${overflow.length === 1 ? 'view' : 'views'}`}
          >
            <span className="material-symbols-outlined text-[16px] leading-none">
              more_horiz
            </span>
            <span className="text-[10px] font-semibold tabular-nums">
              {overflow.length}
            </span>
          </button>
          {showOverflow && (
            <div
              role="menu"
              className="absolute left-0 top-[calc(100%+6px)] z-50 min-w-[240px] max-w-[320px] rounded-2xl border border-gp-glass-border bg-white dark:bg-black/90 shadow-xl py-2"
            >
              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-gp-ink-muted dark:text-gp-ink-soft">
                Earlier
              </div>
              {overflow.map((entry) => {
                const style = styleFor(entry.type)
                return (
                  <button
                    key={`${entry.type}-${entry.id}-${entry.visitedAt}`}
                    type="button"
                    onClick={() => {
                      setShowOverflow(false)
                      goTo(entry)
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm text-gp-ink-strong dark:text-gp-ink-strong hover:bg-gp-ink-strong/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    role="menuitem"
                  >
                    <span
                      className={cn('h-2 w-2 rounded-full shrink-0', style.dotClass)}
                      aria-hidden="true"
                    />
                    <span className="flex-1 min-w-0 truncate">
                      {chipLabel(entry)}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gp-ink-muted dark:text-gp-ink-soft shrink-0">
                      {style.label}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {visible.map((entry, idx) => {
        const isLast = idx === visible.length - 1
        const style = styleFor(entry.type)
        const label = chipLabel(entry)

        const chipInner = (
          <span className="flex items-center gap-1.5 px-2 py-1 rounded-full">
            <span
              className={cn('h-2 w-2 rounded-full shrink-0', style.dotClass)}
              aria-hidden="true"
            />
            {isLast ? (
              <>
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-gp-ink-muted dark:text-gp-ink-soft">
                  {style.label}
                </span>
                <span className="max-w-[14ch] sm:max-w-[22ch] truncate text-sm font-semibold text-gp-ink-strong dark:text-gp-ink-strong">
                  {label}
                </span>
              </>
            ) : (
              <span className="max-w-[12ch] sm:max-w-[16ch] truncate text-xs font-medium text-gp-ink-muted dark:text-gp-ink-soft">
                {label}
              </span>
            )}
          </span>
        )

        return (
          <span
            key={`${entry.type}-${entry.id}-${entry.visitedAt}`}
            className="flex items-center"
          >
            {isLast ? (
              <span
                aria-current="page"
                title={label}
                className="bg-gp-ink-strong/10 dark:bg-white/15 rounded-full"
              >
                {chipInner}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => goTo(entry)}
                title={`Back to ${label}`}
                className="rounded-full hover:bg-gp-ink-strong/10 dark:hover:bg-white/20 transition-colors cursor-pointer"
              >
                {chipInner}
              </button>
            )}
            {!isLast && (
              <span
                className="material-symbols-outlined text-[14px] leading-none text-gp-ink-muted/60 dark:text-gp-ink-soft/60"
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
