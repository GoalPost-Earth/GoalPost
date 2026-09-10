'use client'

import type { FC, RefObject } from 'react'

/**
 * The search box inside a section modal.
 *
 * A modal holding ninety pulses or two dozen people is scrollable, which makes
 * it navigable but not searchable — you still have to read your way down it.
 * This narrows the list to what you typed.
 *
 * Plain substring matching over whatever text the section declares as
 * searchable, and it preserves the section's own ordering rather than ranking:
 * inside a list the viewer already understands (most recent first, say),
 * reshuffling on every keystroke costs more than it gives.
 *
 * Escape-to-clear is deliberately NOT handled here. Radix's DismissableLayer
 * listens on `document` in the capture phase, so the dialog is already closing
 * before a synthetic handler on this input could run; `SectionList` intercepts
 * it on the dialog itself via `onEscapeKeyDown`.
 */

interface SectionListSearchProps {
  inputRef: RefObject<HTMLInputElement | null>
  value: string
  onChange: (next: string) => void
  /** Plural noun for the placeholder — "people", "pulses". */
  noun: string
  matchCount: number
  totalCount: number
}

export const SectionListSearch: FC<SectionListSearchProps> = ({
  inputRef,
  value,
  onChange,
  noun,
  matchCount,
  totalCount,
}) => (
  <div className="flex items-center gap-2 rounded-full border border-gp-glass-border bg-gp-surface-strong/60 dark:bg-gp-surface-dark/50 px-3 py-1.5 focus-within:ring-2 focus-within:ring-gp-primary/50 transition-colors">
    <span
      className="material-symbols-outlined shrink-0 text-[16px] leading-none text-gp-ink-muted"
      aria-hidden="true"
    >
      search
    </span>
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={`Search these ${noun}…`}
      aria-label={`Search ${noun} in this list`}
      className="min-w-0 flex-1 bg-transparent text-xs text-gp-ink-strong placeholder:text-gp-ink-soft outline-none"
    />
    {value.trim() && (
      <>
        <span className="shrink-0 text-[10px] font-bold tabular-nums text-gp-ink-muted">
          {matchCount}/{totalCount}
        </span>
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          title="Clear search"
          className="gp-menu-item shrink-0 flex items-center justify-center size-5 rounded-full cursor-pointer text-gp-ink-muted"
        >
          <span
            className="material-symbols-outlined text-[14px] leading-none"
            aria-hidden="true"
          >
            close
          </span>
        </button>
      </>
    )}
  </div>
)
