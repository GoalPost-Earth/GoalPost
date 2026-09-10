'use client'

import type { FC, RefObject } from 'react'
import { cn } from '@/lib/utils'
import { BLOOM_SEARCH_RENDER_LIMIT } from './modes/graph-mode/bloom-search-match'

/**
 * The result panel for canvas find — the list half of `canvas-search.tsx`.
 *
 * Split out to keep both files under the 400-line rule, and because it is
 * genuinely the presentational half: it knows nothing about NVL, the DOM scan,
 * or which backend produced a hit. It takes one flat shape and renders it.
 *
 * The panel renders at most `BLOOM_SEARCH_RENDER_LIMIT` rows, but the *count*
 * it reports and the arrows in the pill both walk every hit. A capped list must
 * never make the control understate how much it found, so the truncation says
 * so in words rather than quietly ending.
 */

export interface CanvasSearchHit {
  key: string
  /** Node caption (Bloom) or a text snippet with context (Dashboard). */
  label: string
  /** Decoded node type (Bloom) or the nearest heading above the hit. */
  sublabel: string | null
  /** Painted node colour — Bloom only; the Dashboard has no swatch. */
  color?: string
}

interface CanvasSearchResultsProps {
  listId: string
  listRef: RefObject<HTMLUListElement | null>
  isBloom: boolean
  /** What the control is searching, for the accessible list name. */
  noun: string
  /** The settled (debounced) query — what the copy quotes back. */
  query: string
  hits: CanvasSearchHit[]
  activeIndex: number
  onSelect: (index: number) => void
}

export const CanvasSearchResults: FC<CanvasSearchResultsProps> = ({
  listId,
  listRef,
  isBloom,
  noun,
  query,
  hits,
  activeIndex,
  onSelect,
}) => {
  const trimmed = query.trim()
  const hasQuery = trimmed.length > 0
  const rendered = hits.slice(0, BLOOM_SEARCH_RENDER_LIMIT)
  const truncated = hits.length - rendered.length

  return (
    <div
      className={cn(
        'absolute right-0 top-full z-40 mt-2 w-72 max-w-[85vw] rounded-2xl',
        'gp-glass border border-gp-glass-border shadow-xl p-2 animate-fade-in',
        // Nearly opaque, unlike the usual glass panel. This one floats over
        // the Bloom canvas, where bright node circles sitting behind row text
        // at normal `gp-glass` alpha are a real legibility problem. The token
        // flips on `.dark` and re-tints per theme, so this stays one rule.
        // The blur is kept — the frosted edge is what ties it to the rest of
        // the chrome.
        'bg-gp-surface-strong/95'
      )}
    >
      <div className="flex items-center justify-between gap-2 px-1.5 pb-1.5">
        <p className="min-w-0 truncate text-[10px] font-bold uppercase tracking-[0.18em] text-gp-ink-muted">
          {isBloom ? 'On this canvas' : 'On this page'}
        </p>
        {truncated > 0 && (
          <span className="shrink-0 text-[10px] font-bold tabular-nums text-gp-ink-soft">
            first {rendered.length}
          </span>
        )}
      </div>

      {hits.length === 0 ? (
        <p className="px-1.5 py-3 text-xs text-gp-ink-muted">
          {!hasQuery ? (
            isBloom ? (
              'Type to find a node on this canvas.'
            ) : (
              'Type to find text on this page.'
            )
          ) : isBloom ? (
            // Only the Bloom half can be narrowed by the legend, and only then
            // is the legend worth mentioning — pointing at a filter that isn't
            // engaged sends the viewer on a goose chase.
            <>
              Nothing on this canvas matches “{trimmed}”. Nodes hidden by the
              legend’s type filters aren’t searchable.
            </>
          ) : (
            <>Nothing on this page matches “{trimmed}”.</>
          )}
        </p>
      ) : (
        <>
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={`Matches in ${noun}`}
            className="max-h-[50vh] overflow-y-auto overscroll-contain sm:max-h-[60vh]"
          >
            {rendered.map((hit, index) => (
              <li key={hit.key} role="presentation">
                <button
                  type="button"
                  id={`${listId}-${index}`}
                  data-index={index}
                  role="option"
                  // Focus stays on the combobox input, tracked by
                  // aria-activedescendant. Without this, Tab would walk a
                  // hundred result rows before reaching the rest of the page.
                  tabIndex={-1}
                  aria-selected={index === activeIndex}
                  onClick={() => onSelect(index)}
                  className={cn(
                    'gp-menu-item flex w-full cursor-pointer items-center gap-2.5 rounded-md px-1.5 py-1.5 text-left',
                    index === activeIndex &&
                      'bg-[color-mix(in_srgb,var(--gp-primary)_12%,transparent)]'
                  )}
                >
                  {isBloom && (
                    <span
                      aria-hidden
                      className="size-3 shrink-0 rounded-full ring-1 ring-inset ring-black/10 dark:ring-white/20"
                      style={{ background: hit.color ?? 'var(--gp-ink-soft)' }}
                    />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium text-gp-ink-strong">
                      {hit.label}
                    </span>
                    {hit.sublabel && (
                      <span className="block truncate text-[10px] text-gp-ink-muted">
                        {hit.sublabel}
                      </span>
                    )}
                  </span>
                  <span
                    aria-hidden
                    className="material-symbols-outlined shrink-0 text-base leading-none text-gp-ink-soft"
                  >
                    my_location
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {truncated > 0 && (
            <p className="px-1.5 pt-1.5 text-[10px] text-gp-ink-soft">
              {truncated} more not listed — the arrows still step through all{' '}
              {hits.length}.
            </p>
          )}
        </>
      )}
    </div>
  )
}
