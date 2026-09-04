'use client'

import type { FC } from 'react'
import { cn } from '@/lib/utils'

/**
 * GOAL-346: switches the Document provenance layer (Document nodes + their
 * EXTRACTED_FROM edges) on and off in the in-field Bloom view.
 *
 * Off by default — a document-heavy field would otherwise bury its pulses
 * under a node per upload plus every person that upload named.
 *
 * Deliberately shaped as ONE NAMED LAYER rather than a nameless eye icon,
 * because GOAL-350 turns the legend into a list of exactly these rows for
 * every node and relationship type. When that lands this control folds into
 * the legend and this file goes away; until then it stands alone so the
 * relationship is reachable without waiting on that story.
 *
 * Sits in the bottom-left stack directly above the legend pill, matching its
 * chrome. The offsets clear the legend's own `h-9` pill in both the mobile
 * and `sm:` positions — the canvas has no other chrome in this corner, and
 * the chat FAB owns the opposite one.
 */
export const DocumentLayerToggle: FC<{
  active: boolean
  onToggle: (next: boolean) => void
  /** Documents available in this field; the control hides at zero. */
  documentCount: number
}> = ({ active, onToggle, documentCount }) => {
  // Nothing to reveal in a field with no uploads — showing a dead toggle
  // would suggest the canvas is hiding something when it isn't.
  if (documentCount === 0) return null

  return (
    <div className="pointer-events-none absolute bottom-[7.75rem] left-3 z-30 sm:bottom-[4.25rem] sm:left-4">
      <button
        type="button"
        onClick={() => onToggle(!active)}
        aria-pressed={active}
        title={
          active
            ? 'Hide documents and the people they named'
            : 'Show documents and the people they named'
        }
        className={cn(
          'gp-glass-hover pointer-events-auto cursor-pointer flex items-center gap-2',
          'h-9 px-2.5 sm:px-3 rounded-full gp-glass border shadow-xl',
          // Tokened in both states so the active tint re-derives per theme
          // and stays legible on light and dark glass alike.
          active
            ? 'border-gp-primary/40 text-gp-primary'
            : 'border-gp-glass-border text-gp-ink-muted hover:text-gp-primary'
        )}
      >
        {/*
          Always `description`. There is no `description_off` in Material
          Symbols, and an unresolvable ligature does not fall back to nothing
          — the font renders the resolvable prefix plus the leftover as LITERAL
          TEXT, so the control painted `[icon]_OFF` at 90px instead of an 18px
          glyph. The icon names WHAT is toggled; the tokened active styling and
          `aria-pressed` carry whether it is on.
        */}
        <span className="material-symbols-outlined text-lg leading-none">
          description
        </span>
        {/* Label is desktop-only, mirroring the legend pill, so the two
            controls stay the same size at 390px. */}
        <span className="hidden sm:inline text-xs font-semibold">
          Documents
        </span>
        <span
          className={cn(
            'shrink-0 rounded-full px-1.5 text-[10px] font-bold tabular-nums',
            active
              ? 'bg-gp-primary/15 text-gp-primary'
              : 'bg-gp-ink-muted/15 text-gp-ink-muted'
          )}
        >
          {documentCount}
        </span>
      </button>
    </div>
  )
}
