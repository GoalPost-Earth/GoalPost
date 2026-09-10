'use client'

import { Fragment, useMemo, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useFindQuery } from '@/components/studio/find-query-context'
import { SectionListSearch } from './section-list-search'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

/**
 * A FieldContext section list that shows a few rows and puts the rest behind a
 * modal.
 *
 * A field that has been through an article import carries dozens of pulses,
 * people and documents. Rendered in full, every section pushed the next one
 * off the screen, so the page became a single unbroken scroll and the sections
 * below the first stopped being findable at all. Showing the first few of each
 * keeps the whole field legible at a glance, and the full list is one click
 * away in a surface built to be scrolled.
 *
 * The SAME `renderItem` draws both the preview and the modal, so a row can
 * never drift between the two, and any per-row state the caller owns (an
 * expanded document, a pending delete) behaves identically in both.
 *
 * Preview rows are not a truncation the viewer has to discover: the button
 * says how many there are in total, and a section at or under the threshold
 * shows no button at all rather than an empty affordance.
 */

const DEFAULT_PREVIEW_COUNT = 3

interface SectionListProps<T> {
  items: T[]
  getKey: (item: T, index: number) => string
  renderItem: (item: T, index: number) => ReactNode
  /** Section name, reused as the modal title. */
  title: string
  /** Material Symbols name, shown beside the modal title. */
  icon: string
  /** Plural noun for the button and count copy — "documents", "pulses". */
  noun: string
  previewCount?: number
  /**
   * The section's own header actions ("Add pulse", "Select", "Weave"…),
   * repeated in the modal header. The modal covers the section it came from,
   * so without these the full list is the one place you cannot act on the
   * thing you are looking at. Callers pass the SAME node they render in the
   * section header, so the two can never drift.
   */
  actions?: ReactNode
  /**
   * Everything about a row worth matching — a name, a role, a filename, a
   * body. Powers the modal's own search box AND, while canvas find is running,
   * decides which rows this section reveals in place (see
   * `find-query-context`). Without it the modal is scrollable but not
   * searchable, and a row past the preview stays invisible to the header's
   * find control.
   */
  getSearchText?: (item: T) => string
  /** `ul` when the caller's rows render as `<li>` elements. */
  as?: 'div' | 'ul'
  /** Spacing for the row container, matching whatever the section used. */
  listClassName?: string
}

export function SectionList<T>({
  items,
  getKey,
  renderItem,
  title,
  icon,
  noun,
  previewCount = DEFAULT_PREVIEW_COUNT,
  actions,
  getSearchText,
  as = 'div',
  listClassName = 'space-y-3',
}: SectionListProps<T>) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { query: findQuery } = useFindQuery()

  const preview = items.slice(0, previewCount)
  const hidden = items.length - preview.length
  const Container = as

  // What the modal lists. Substring, section order preserved — see
  // `section-list-search` on why this doesn't rank.
  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle || !getSearchText) return items
    return items.filter((item) =>
      getSearchText(item).toLowerCase().includes(needle)
    )
  }, [items, query, getSearchText])

  // While canvas find is running, reveal the rows that MATCH instead of the
  // first few. The matches are then really on the page — the find control's
  // DOM scan highlights and scrolls to them like any other hit, and nothing
  // has to yank the viewer into a modal to show them something.
  //
  // A section with no matches keeps its ordinary preview: emptying every
  // unrelated section would rearrange the whole page around one keystroke.
  const revealed = useMemo(() => {
    const needle = findQuery.trim().toLowerCase()
    if (!needle || !getSearchText) return null
    const hits = items.filter((item) =>
      getSearchText(item).toLowerCase().includes(needle)
    )
    return hits.length > 0 ? hits : null
  }, [findQuery, items, getSearchText])

  const shown = revealed ?? preview

  const list = (rows: T[]) => (
    <Container className={listClassName}>
      {/* A keyed Fragment carries the caller's key without introducing a
          wrapper element — a `<ul>` container has to have `<li>` children,
          and the caller's `renderItem` already returns those. */}
      {rows.map((item, index) => (
        <Fragment key={getKey(item, index)}>{renderItem(item, index)}</Fragment>
      ))}
    </Container>
  )

  return (
    <>
      {revealed && (
        <p className="mb-2 text-[11px] font-semibold text-gp-primary">
          {revealed.length} of {items.length} {noun} match “{findQuery.trim()}”
        </p>
      )}

      {list(shown)}

      {!revealed && hidden > 0 && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          className={cn(
            'group mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full',
            'border border-gp-glass-border bg-gp-surface-strong/50 dark:bg-gp-surface-dark/40',
            'px-4 h-9 text-xs font-semibold text-gp-ink-strong',
            'hover:bg-gp-surface-strong/80 dark:hover:bg-gp-surface-dark/70 hover:border-gp-primary/40',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gp-primary/50',
            'transition-all cursor-pointer'
          )}
        >
          <span
            className="material-symbols-outlined text-[16px] leading-none text-gp-ink-muted group-hover:text-gp-primary transition-colors"
            aria-hidden="true"
          >
            expand_more
          </span>
          Show all {items.length} {noun}
        </button>
      )}

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          // A stale filter would greet the viewer on the next open with a
          // list that looks shorter than the button promised.
          if (!next) setQuery('')
        }}
      >
        {/* Mirrors `approval-batch-dialog`: a fixed header over a body that is
            the only thing that scrolls, so the title stays put while a long
            list moves under it. `max-h-[85vh]` leaves the modal clear of the
            viewport edges on a phone as well as a desktop. */}
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 bg-gp-surface-strong dark:bg-gp-surface-dark border-gp-glass-border">
          <DialogHeader className="px-4 sm:px-6 pt-5 pb-3 border-b border-gp-glass-border">
            {/* Always stacked, never side by side. The dialog is at most
                `sm:max-w-2xl`, and a section like Pulses carries four
                controls — put them on the title's row and the title is the
                only flexible item left, so it collapses to one word per line
                instead of the buttons wrapping. `pr-8` keeps the title clear
                of the dialog's own absolutely-positioned close button. */}
            <div className="flex flex-col gap-3">
              <div className="min-w-0 pr-8">
                <DialogTitle className="flex items-center gap-2 text-base font-bold text-gp-ink-strong dark:text-white">
                  <span
                    className="material-symbols-outlined text-[20px] leading-none text-gp-primary"
                    aria-hidden="true"
                  >
                    {icon}
                  </span>
                  {title}
                </DialogTitle>
                <DialogDescription className="mt-1 text-xs text-gp-ink-muted">
                  {items.length}{' '}
                  {items.length === 1 ? noun.replace(/s$/, '') : noun} in this
                  field.
                </DialogDescription>
              </div>
              {actions && (
                <div className="flex flex-wrap items-center gap-2">
                  {actions}
                </div>
              )}
              {getSearchText && (
                <SectionListSearch
                  inputRef={searchInputRef}
                  value={query}
                  onChange={setQuery}
                  noun={noun}
                  matchCount={matches.length}
                  totalCount={items.length}
                />
              )}
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4">
            {matches.length === 0 ? (
              <p className="px-1 py-6 text-center text-xs text-gp-ink-muted">
                None of these {noun} match “{query.trim()}”.
              </p>
            ) : (
              list(matches)
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
