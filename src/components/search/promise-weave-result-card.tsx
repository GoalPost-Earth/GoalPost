'use client'

import { weaveDisplayTitle, weavePersonName } from '@/lib/promise-weave-display'

/**
 * PromiseWeave result card for `/protected/search` (GOAL-343).
 *
 * Weaves are reified connector nodes, not pulses, so they get their own
 * visual treatment rather than reusing the generic result `<article>`: the
 * `account_tree` icon and gp-primary accent the "Promise weaves" section on
 * the FieldContext page and the read-only weave drawer already use, plus the
 * person the weave is woven for and its status.
 *
 * Lives here rather than inside `search/page.tsx` because that page is
 * already well past the 400-line component ceiling (CLAUDE.md). The row →
 * view-model mapping ships alongside the card so the page only has to hand
 * over the raw `searchAll.promiseWeaves` rows.
 */

/** The `searchAll.promiseWeaves` row shape (see SEARCH_QUERIES.ts). */
export interface PromiseWeaveSearchRow {
  id: string
  title?: string | null
  status?: string | null
  createdAt?: string | null
  wovenFor?: Array<{ id: string; name?: string | null }> | null
  weaves?: Array<{ id: string; title?: string | null }> | null
}

export interface PromiseWeaveResult {
  id: string
  /** Never a `weave_*` id — kb/07 Rule 1. */
  title: string
  /** The person the weave is woven for, or null when it names no one. */
  personName: string | null
  status: string | null
  /** Titles of the pulses this weave connects, for the body line. */
  wovenTitles: string[]
}

/**
 * Row → view model. The title/person fallbacks live in
 * `@/lib/promise-weave-display` so this card and the Dashboard weave card
 * cannot drift on how a null-titled weave is named.
 */
export function toPromiseWeaveResults(
  rows: readonly PromiseWeaveSearchRow[] | null | undefined
): PromiseWeaveResult[] {
  return (rows ?? []).map((row) => {
    const title = weaveDisplayTitle(row)
    return {
      id: row.id,
      title,
      personName: weavePersonName(row),
      status: row.status?.trim() || null,
      // The heading may already BE the first woven pulse's title (that is the
      // null-title fallback), so drop the duplicate rather than printing it
      // twice on the same card.
      wovenTitles: (row.weaves ?? [])
        .map((p) => p?.title?.trim())
        .filter((t): t is string => Boolean(t) && t !== title),
    }
  })
}

export function PromiseWeaveResultCard({
  weave,
  animationsEnabled,
  onOpen,
}: {
  weave: PromiseWeaveResult
  animationsEnabled: boolean
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group text-left cursor-pointer h-full"
    >
      <article
        className={`h-full flex flex-col rounded-2xl border border-gp-primary/25 bg-gp-glass-bg backdrop-blur-xl p-4 sm:p-5 shadow-[0_20px_40px_-16px_rgba(0,0,0,0.12)] dark:shadow-[0_30px_70px_-28px_rgba(0,0,0,0.6)] transition-all ${
          animationsEnabled
            ? 'group-hover:-translate-y-1 group-hover:border-gp-primary/40'
            : ''
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-gp-primary text-lg shrink-0">
              account_tree
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gp-primary truncate">
              Promise Weave
            </span>
          </div>
          <span className="material-symbols-outlined text-gp-ink-soft text-xl shrink-0">
            arrow_outward
          </span>
        </div>

        <div className="mt-3 flex flex-col gap-1 min-w-0">
          <h3 className="text-lg font-semibold text-gp-ink-strong dark:text-gp-ink-strong leading-tight break-words">
            {weave.title}
          </h3>
          <p className="text-xs font-medium text-gp-ink-muted dark:text-gp-ink-soft truncate">
            {weave.personName
              ? `Woven for ${weave.personName}`
              : 'Not woven for anyone yet'}
          </p>
        </div>

        <p className="mt-3 text-sm text-gp-ink-muted dark:text-gp-ink-soft leading-relaxed line-clamp-3">
          {weave.wovenTitles.length > 0
            ? `Weaves ${weave.wovenTitles.join(', ')}`
            : 'Open this weave to follow the relationships around it.'}
        </p>

        {weave.status && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="px-2 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider border bg-gp-primary/10 text-gp-primary border-gp-primary/20">
              {weave.status}
            </span>
          </div>
        )}
      </article>
    </button>
  )
}
