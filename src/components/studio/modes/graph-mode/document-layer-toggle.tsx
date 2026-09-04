'use client'

import type { FC } from 'react'
import { Switch } from '@/components/ui/switch'

/**
 * GOAL-346: switches the Document layer on and off in the in-field Bloom
 * view.
 *
 * "On" draws the Document nodes and their EXTRACTED_FROM edges over the rest
 * of the canvas. "Off" removes the whole document-derived subgraph — the
 * documents, the people they named and the pulses they produced. See
 * `documentDerivedIds` (`document-provenance-layer.ts`) for why it is the
 * subgraph rather than just the hub, and what survives the switch.
 *
 * ON by default. It shipped off, on the theory that a document-heavy field
 * would bury its pulses — but the cost of that default was worse than the
 * crowding it avoided: with the layer off, every person a document named
 * renders with NO edges at all, because provenance is their only tie to
 * anything. The canvas opened on a field of floating dots, which is the exact
 * complaint this feature exists to answer. Documents on by default is what
 * makes the default view coherent.
 *
 * Sits top-right, opposite the Legend's bottom-left, so the two pieces of
 * canvas chrome never compete for the same corner at any width.
 *
 * A Switch rather than a pill button: this is persistent visibility state, not
 * a command, and a switch says so at a glance without relying on the reader
 * decoding an active/inactive tint. The primitive is already fully tokened, so
 * it themes correctly in light, dark and every variant for free.
 *
 * GOAL-350 folds this into the legend as one row of a general per-type
 * visibility list; until then it stands alone so the relationship is reachable
 * without waiting on that story.
 */
export const DocumentLayerToggle: FC<{
  active: boolean
  onToggle: (next: boolean) => void
  /** Documents available in this field; the control hides at zero. */
  documentCount: number
}> = ({ active, onToggle, documentCount }) => {
  // Nothing to reveal in a field with no uploads — a dead switch would suggest
  // the canvas is withholding something when it isn't.
  if (documentCount === 0) return null

  return (
    <div className="pointer-events-none absolute top-3 right-3 z-30 sm:top-4 sm:right-4">
      {/*
        The whole pill is the hit target — `htmlFor` rather than wrapping, so
        the Switch keeps its own accessible name and Radix's keyboard handling
        instead of inheriting a label's click semantics.
      */}
      <label
        htmlFor="bloom-show-documents"
        className="pointer-events-auto flex items-center gap-2.5 h-9 pl-3 pr-2.5 rounded-full gp-glass border border-gp-glass-border shadow-xl cursor-pointer select-none"
      >
        <span className="text-xs font-semibold text-gp-ink-strong whitespace-nowrap">
          Show Documents
        </span>
        <span className="shrink-0 rounded-full bg-gp-ink-muted/15 px-1.5 text-[10px] font-bold tabular-nums text-gp-ink-muted">
          {documentCount}
        </span>
        <Switch
          id="bloom-show-documents"
          size="sm"
          checked={active}
          onCheckedChange={onToggle}
          aria-label={`Show documents and everything extracted from them (${documentCount} in this field)`}
        />
      </label>
    </div>
  )
}
