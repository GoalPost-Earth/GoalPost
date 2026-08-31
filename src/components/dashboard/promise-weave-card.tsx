'use client'

import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { weaveDisplayTitle, weavePersonName } from '@/lib/promise-weave-display'
import { getWeaveStatusClass, getWeaveStatusLabel } from '@/lib/promise-weave'
import { dispatchOpenInfoDrawer } from './entity-info-drawer'

/** The `promiseWeaves` row shape (see PROMISE_WEAVE_SPACE_QUERIES.ts). */
export interface SpacePromiseWeave {
  id: string
  title?: string | null
  status?: string | null
  createdAt?: string | null
  wovenFor?: Array<{ id: string; name?: string | null }> | null
  weaves?: Array<{ id: string; title?: string | null }> | null
  context?: Array<{ id: string; title?: string | null }> | null
}

/**
 * Single PromiseWeave tile inside `<SpaceDashboardView />` (GOAL-343).
 *
 * Mirrors `FieldContextCard`'s shape — top accent strip, icon block, meta row,
 * type footer — but carries the weave's own gp-primary palette and
 * `account_tree` icon, the same treatment the "Promise weaves" section on the
 * FieldContext page and the read-only weave drawer already use. Weaves have no
 * page of their own, so clicking opens that existing drawer rather than
 * navigating.
 */
/**
 * The whole "Promise Weaves" block on the space dashboard — heading, blurb and
 * card grid — so `<SpaceDashboardView />` (already past the 400-line ceiling)
 * gains a single element rather than a section body. Renders nothing when the
 * space holds no weaves; there is no empty state because weaves are authored
 * from a field context, not from here (GOAL-341), so a dashboard-level "add
 * one" prompt would point nowhere.
 */
export function PromiseWeavesSection({
  weaves,
}: {
  weaves: readonly SpacePromiseWeave[]
}) {
  if (weaves.length === 0) return null
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Promise Weaves
        </h2>
        <p className="text-sm text-slate-600 dark:text-white/60">
          Each weave holds the relationships around one promise.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {weaves.map((weave) => (
          <PromiseWeaveCard key={weave.id} weave={weave} />
        ))}
      </div>
    </section>
  )
}

export function PromiseWeaveCard({ weave }: { weave: SpacePromiseWeave }) {
  const title = weaveDisplayTitle(weave)
  const personName = weavePersonName(weave)
  const contextTitle = (weave.context ?? []).find((c) =>
    c?.title?.trim()
  )?.title
  const open = () =>
    dispatchOpenInfoDrawer({ type: 'PromiseWeave', id: weave.id, label: title })
  const timeAgo = (() => {
    if (!weave.createdAt) return '—'
    const d = new Date(weave.createdAt)
    return Number.isNaN(d.getTime())
      ? '—'
      : formatDistanceToNow(d, { addSuffix: true })
  })()

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          open()
        }
      }}
      className={cn(
        'group relative text-left rounded-2xl p-4 sm:p-5 border overflow-hidden transition-all cursor-pointer',
        'hover:-translate-y-0.5 hover:shadow-xl',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gp-primary/40',
        'border-gp-primary/25 bg-gradient-to-br from-gp-primary/10 via-gp-accent-glow/5 to-transparent',
        'hover:from-gp-primary/20 hover:via-gp-accent-glow/10'
      )}
    >
      <span
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gp-primary to-gp-accent-glow"
      />

      <div className="flex items-start gap-3 sm:gap-4 mb-4 min-w-0">
        <div className="shrink-0 size-11 sm:size-12 rounded-2xl border flex items-center justify-center shadow-md group-hover:scale-110 transition-transform bg-gp-primary/20 border-gp-primary/40 text-gp-primary">
          <span className="material-symbols-outlined text-2xl">
            account_tree
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
            {title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-white/55 truncate mt-0.5">
            {personName
              ? `Woven for ${personName}`
              : 'Not woven for anyone yet'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 text-xs text-slate-600 dark:text-white/65 min-w-0">
        {contextTitle && (
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="material-symbols-outlined text-base shrink-0">
              category
            </span>
            <span className="truncate">{contextTitle}</span>
          </div>
        )}
        <div className="ml-auto shrink-0 text-[10px] text-slate-400 dark:text-white/40">
          {timeAgo}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gp-glass-border flex items-center justify-between gap-2">
        <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-white/40 truncate">
          Promise Weave
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {weave.status && (
            // Through the shared helpers, never the raw string: a `proposed`
            // weave is a PROPOSAL nobody has agreed to yet (GOAL-342), and
            // hardcoding the gp-primary "established" badge here rendered it
            // identically to a live one — the exact conflation the HITL gate
            // exists to prevent. `getWeaveStatusClass` gives proposed its own
            // accent-glow tint and dissolved a muted one, and the label shows a
            // legacy migration value verbatim (kb/04-state-machines.md).
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border',
                getWeaveStatusClass(weave.status)
              )}
            >
              {getWeaveStatusLabel(weave.status)}
            </span>
          )}
          <span className="material-symbols-outlined text-base text-gp-primary/80 transition-transform group-hover:translate-x-1">
            arrow_forward
          </span>
        </div>
      </div>
    </div>
  )
}
