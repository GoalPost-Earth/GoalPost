'use client'

import { useState, type FC } from 'react'
import { cn } from '@/lib/utils'

/**
 * The expand/collapse pair behind every truncated list in the entity info
 * drawer (GOAL-315). Before this, a list that overflowed its cap rendered a
 * dead "+ N more" label: it told the user content existed but gave them no
 * way to reach it.
 *
 * The closest precedent in the app is `active-pulses.tsx`, which flips
 * between "View all" and "Show less" — except there the state is owned by
 * the parent route. Here each drawer section owns its own.
 */

/** Collapse state for one truncated list. */
export function useExpandableList<T>(items: T[], limit: number) {
  const [expanded, setExpanded] = useState(false)
  return {
    visible: expanded ? items : items.slice(0, limit),
    hiddenCount: Math.max(0, items.length - limit),
    expanded,
    toggle: () => setExpanded((prev) => !prev),
  }
}

/**
 * Interactive "+ N more" / "Show less" toggle. The visible string is the
 * accessible name (WCAG 2.5.3 Label in Name) with the item noun appended
 * off-screen, so "click show less" spoken by a voice-input user matches.
 */
export const ShowMoreToggle: FC<{
  expanded: boolean
  hiddenCount: number
  onToggle: () => void
  /** Plural noun appended to the accessible name, e.g. "pulses". */
  itemLabel: string
  className?: string
}> = ({ expanded, hiddenCount, onToggle, itemLabel, className }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-expanded={expanded}
    className={cn(
      'inline-flex items-center gap-1 rounded-lg px-3 py-1.5',
      'text-[11px] font-semibold text-gp-ink-muted dark:text-white/55',
      'hover:text-gp-primary hover:bg-gp-primary/10',
      'dark:hover:text-gp-primary dark:hover:bg-gp-primary/15',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-gp-primary/50',
      'transition-all cursor-pointer',
      className
    )}
  >
    <span
      className="material-symbols-outlined text-[16px] leading-none"
      aria-hidden="true"
    >
      {expanded ? 'expand_less' : 'expand_more'}
    </span>
    {expanded ? 'Show less' : `+ ${hiddenCount} more`}
    <span className="sr-only">{` ${itemLabel}`}</span>
  </button>
)
