'use client'

import { useCallback, useMemo, useState, type FC } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ResonanceTabStatus } from '@/components/ui/resonance-suggestion-tabs'

/**
 * Per-field hide / show for the resonance review queue (GOAL-384).
 *
 * Each suggestion names the field its MATCHED pulse lives in, and this row of
 * switches lets a member take one field's matches out of the list — the same
 * interaction as the Bloom legend's type filters (bloom-legend.tsx):
 *
 * - every field present in the list is a `role="switch"` row with its count;
 * - switching one off dims it and strikes it through, but KEEPS the row, so
 *   the way back on never disappears with the suggestions it hid;
 * - counts are read off the UNFILTERED list, so a hidden row still says how
 *   much is behind it;
 * - "Show all" resets every hidden field at once;
 * - session-only, like the legend: a queue never reopens on another day
 *   looking empty because of a filter nobody remembers setting.
 *
 * Fields, not Spaces: the queue is always one Space's (ADR-020 keeps
 * cross-Space resonance out of scope), so it is the field a match came from
 * that varies from card to card.
 */

/**
 * Key for a match whose pulse is held by no live field of this Space — usually
 * a cross-Space match, but also a pulse whose only field here was deleted, so
 * the label says where it is NOT rather than claiming another Space.
 */
export const OTHER_SPACE_FIELD_KEY = '__other_space__'
export const OTHER_SPACE_FIELD_LABEL = 'Outside this Space'

interface FieldMatched {
  matchedContextId?: string | null
  matchedContextTitle?: string | null
}

export function matchedFieldKey(s: FieldMatched): string {
  return s.matchedContextId || OTHER_SPACE_FIELD_KEY
}

export function matchedFieldLabel(s: FieldMatched): string {
  if (!s.matchedContextId) return OTHER_SPACE_FIELD_LABEL
  return s.matchedContextTitle?.trim() || 'Untitled field'
}

export interface FieldFilterRow {
  key: string
  label: string
  count: number
}

/** One row per field present in `suggestions`, most suggestions first. */
export function fieldFilterRows(suggestions: FieldMatched[]): FieldFilterRow[] {
  const rows = new Map<string, FieldFilterRow>()
  for (const s of suggestions) {
    const key = matchedFieldKey(s)
    const row = rows.get(key)
    if (row) row.count += 1
    else rows.set(key, { key, label: matchedFieldLabel(s), count: 1 })
  }
  return [...rows.values()].sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label)
  )
}

/**
 * Hidden-field state plus everything the modal derives from it. `tabSuggestions`
 * is the active tab's list; rows are built from it BEFORE field filtering, so a
 * hidden field keeps its switch (and its count) instead of vanishing with its
 * suggestions. Hidden keys apply on every tab, like the legend's type filters
 * apply on every scope.
 */
export function useResonanceFieldFilter<T extends FieldMatched>(
  tabSuggestions: T[]
) {
  const [hidden, setHidden] = useState<ReadonlySet<string>>(() => new Set())
  const toggle = useCallback((key: string) => {
    setHidden((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])
  const showAll = useCallback(() => setHidden(new Set()), [])

  const rows = useMemo(() => fieldFilterRows(tabSuggestions), [tabSuggestions])
  const visible = useMemo(
    () => tabSuggestions.filter((s) => !hidden.has(matchedFieldKey(s))),
    [tabSuggestions, hidden]
  )
  // Only rows this list holds — a field hidden on another tab is not a filter
  // acting on this one.
  const hiddenCount = rows.filter((row) => hidden.has(row.key)).length
  const isVisible = useCallback(
    (s: FieldMatched) => !hidden.has(matchedFieldKey(s)),
    [hidden]
  )

  return { hidden, toggle, showAll, rows, visible, hiddenCount, isVisible }
}

/** The empty state for a tab whose every suggestion sits in a hidden field. */
export const HiddenFieldsEmptyState: FC<{
  status: ResonanceTabStatus
  onShowAll: () => void
}> = ({ status, onShowAll }) => (
  <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-600 dark:bg-slate-800/50">
    <p className="text-sm text-slate-600 dark:text-slate-400">
      Every {status} suggestion here was matched in a field you have hidden.
    </p>
    <Button variant="outline" size="sm" className="mt-3" onClick={onShowAll}>
      Show all fields
    </Button>
  </div>
)

export const ResonanceFieldFilter: FC<{
  /** The list BEFORE field filtering — see the note above. */
  rows: FieldFilterRow[]
  hidden: ReadonlySet<string>
  hiddenCount: number
  onToggle: (key: string) => void
  onShowAll: () => void
}> = ({ rows, hidden, hiddenCount, onToggle, onShowAll }) => {
  // One field and nothing hidden is the common case on a field page (most
  // matches are within the field), and its only switch could do nothing but
  // empty the list. Keep it while hidden, so the way back on stays.
  if (rows.length === 0 || (rows.length === 1 && hiddenCount === 0))
    return null

  return (
    <div
      className="rounded-lg border border-gp-glass-border p-3"
      data-testid="resonance-field-filter"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p
          id="resonance-field-filter-label"
          className="min-w-0 truncate text-[10px] font-bold uppercase tracking-[0.18em] text-gp-ink-muted"
        >
          Matched in
          {hiddenCount > 0 && (
            <span className="normal-case tracking-normal font-semibold text-gp-primary">
              {' '}
              · {hiddenCount} hidden
            </span>
          )}
        </p>
        {hiddenCount > 0 && (
          <button
            type="button"
            onClick={onShowAll}
            className="gp-menu-item shrink-0 cursor-pointer rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gp-primary"
          >
            Show all
          </button>
        )}
      </div>
      <ul
        aria-labelledby="resonance-field-filter-label"
        className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto overscroll-contain"
      >
        {rows.map((row) => {
          const visible = !hidden.has(row.key)
          return (
            <li key={row.key} className="min-w-0 max-w-full">
              <button
                type="button"
                role="switch"
                aria-checked={visible}
                onClick={() => onToggle(row.key)}
                title={
                  visible
                    ? `Hide suggestions matched in ${row.label}`
                    : `Show suggestions matched in ${row.label}`
                }
                aria-label={`${row.label} — ${row.count} ${
                  row.count === 1 ? 'suggestion' : 'suggestions'
                }`}
                className={cn(
                  'gp-menu-item flex max-w-full cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-left',
                  visible
                    ? 'border-gp-glass-border'
                    : 'border-dashed border-gp-glass-border'
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'material-symbols-outlined shrink-0 text-[14px] leading-none',
                    visible ? 'text-gp-ink-muted' : 'text-gp-ink-soft'
                  )}
                >
                  {visible ? 'visibility' : 'visibility_off'}
                </span>
                <span
                  className={cn(
                    'min-w-0 truncate text-xs font-medium',
                    visible
                      ? 'text-gp-ink-strong'
                      : 'text-gp-ink-muted line-through'
                  )}
                >
                  {row.label}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    'shrink-0 text-[10px] font-bold tabular-nums',
                    visible ? 'text-gp-ink-muted' : 'text-gp-ink-soft'
                  )}
                >
                  {row.count}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
