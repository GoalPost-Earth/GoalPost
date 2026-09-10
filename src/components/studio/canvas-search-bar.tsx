'use client'

import type { FC, KeyboardEvent, RefObject } from 'react'
import { cn } from '@/lib/utils'

/**
 * The canvas find pill — input, occurrence counter, previous/next, close.
 *
 * Presentational half of `canvas-search.tsx`, split out to keep both files
 * under the 400-line rule. It knows nothing about NVL, the DOM scan or the
 * collapsed-section registry; it reports what it was handed and calls back.
 */

interface CanvasSearchBarProps {
  inputRef: RefObject<HTMLInputElement | null>
  listId: string
  /** What the control searches, for the accessible name. */
  noun: string
  isBloom: boolean
  query: string
  onQueryChange: (next: string) => void
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  /** True once the settled query is non-empty — gates the counter. */
  hasQuery: boolean
  matchCount: number
  activeIndex: number
  onStep: (delta: number) => void
  onClose: () => void
}

export const CanvasSearchBar: FC<CanvasSearchBarProps> = ({
  inputRef,
  listId,
  noun,
  isBloom,
  query,
  onQueryChange,
  onKeyDown,
  hasQuery,
  matchCount,
  activeIndex,
  onStep,
  onClose,
}) => (
  <div className="flex items-center gap-1 rounded-full bg-gp-surface-strong/50 dark:bg-gp-surface-dark/50 border border-gp-glass-border pl-2.5 pr-1 py-1 focus-within:ring-2 focus-within:ring-gp-primary/50 transition-colors">
    <span
      className="material-symbols-outlined shrink-0 text-[16px] leading-none text-gp-ink-muted"
      aria-hidden="true"
    >
      search
    </span>
    <input
      ref={inputRef}
      type="text"
      role="combobox"
      aria-expanded={matchCount > 0}
      aria-controls={listId}
      aria-autocomplete="list"
      aria-activedescendant={
        matchCount > 0 ? `${listId}-${activeIndex}` : undefined
      }
      aria-label={`Search within ${noun}`}
      // Names the scope Bloom actually painted — "this field context",
      // "this space", "your spaces", "this custom view" — rather than a
      // generic "canvas", so the control says what it will look through.
      placeholder={isBloom ? `Search ${noun}…` : 'Search this page…'}
      value={query}
      onChange={(e) => onQueryChange(e.target.value)}
      onKeyDown={onKeyDown}
      className="w-28 sm:w-44 min-w-0 bg-transparent text-xs text-gp-ink-strong placeholder:text-gp-ink-soft outline-none"
    />

    {/* Occurrence counter — the count is of EVERY hit, not of the rows the
        panel renders, so the arrows and this number always agree. */}
    {hasQuery && (
      <span
        className={cn(
          'shrink-0 px-1 text-[10px] font-bold tabular-nums',
          matchCount === 0 ? 'text-gp-ink-soft' : 'text-gp-ink-muted'
        )}
        aria-live="polite"
      >
        {matchCount === 0 ? '0/0' : `${activeIndex + 1}/${matchCount}`}
      </span>
    )}

    <button
      type="button"
      onClick={() => onStep(-1)}
      disabled={matchCount === 0}
      aria-label="Previous match"
      title="Previous match (Shift+Enter)"
      className="gp-menu-item shrink-0 flex items-center justify-center size-6 rounded-full cursor-pointer text-gp-ink-muted disabled:cursor-not-allowed disabled:opacity-40"
    >
      <span
        className="material-symbols-outlined text-[16px] leading-none"
        aria-hidden="true"
      >
        keyboard_arrow_up
      </span>
    </button>
    <button
      type="button"
      onClick={() => onStep(1)}
      disabled={matchCount === 0}
      aria-label="Next match"
      title="Next match (Enter)"
      className="gp-menu-item shrink-0 flex items-center justify-center size-6 rounded-full cursor-pointer text-gp-ink-muted disabled:cursor-not-allowed disabled:opacity-40"
    >
      <span
        className="material-symbols-outlined text-[16px] leading-none"
        aria-hidden="true"
      >
        keyboard_arrow_down
      </span>
    </button>
    <button
      type="button"
      onClick={onClose}
      aria-label="Close search"
      title="Close search (Esc)"
      className="gp-menu-item shrink-0 flex items-center justify-center size-6 rounded-full cursor-pointer text-gp-ink-muted"
    >
      <span
        className="material-symbols-outlined text-[16px] leading-none"
        aria-hidden="true"
      >
        close
      </span>
    </button>
  </div>
)
