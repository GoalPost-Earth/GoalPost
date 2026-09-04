'use client'

import type { FC } from 'react'
import { cn } from '@/lib/utils'
import { dispatchOpenInfoDrawer } from './types'

/**
 * GOAL-346: one person a document named, as rendered in the Document drawer.
 *
 * Document ingestion attaches everyone it identifies to the field via
 * HAS_PERSON — the edge that also means "on the field's roster" — so the
 * People section hides them and this list is where they live instead. The row
 * is therefore also where a member promotes one back onto the roster.
 *
 * Extracted from `document-details-body.tsx`, which CLAUDE.md's 400-line rule
 * had already outgrown before this feature touched it.
 *
 * THREE STATES, deliberately distinct — collapsing any two of them was a real
 * bug in review:
 *
 *  - `onRoster`   — already promoted. Stated, not blank, so a missing button
 *                   reads as a state rather than a missing permission.
 *  - promotable   — attached, uncurated, and the viewer may edit.
 *  - `!isAttached`— named by this document but REMOVED from the field. No
 *                   promote control: re-attaching restores the person's gated
 *                   PII to every Space that reaches the context, which is not
 *                   something a display toggle may do quietly. The field's Add
 *                   Person flow stays the explicit way back.
 */
export const ExtractedPersonRow: FC<{
  personId: string
  name: string
  fieldTitle?: string
  onRoster: boolean
  isAttached: boolean
  isPromoting: boolean
  canPromote: boolean
  onPromote: (personId: string, name: string) => void
}> = ({
  personId,
  name,
  fieldTitle,
  onRoster,
  isAttached,
  isPromoting,
  canPromote,
  onPromote,
}) => {
  const canPromoteThisPerson = canPromote && isAttached && !onRoster

  return (
    // A flex pair rather than one button: a promote control nested inside the
    // navigate button would be invalid markup and unreachable by keyboard.
    <li className="flex items-center gap-1 min-w-0">
      <button
        type="button"
        onClick={() =>
          dispatchOpenInfoDrawer({ type: 'Person', id: personId, label: name })
        }
        // Hover tint and chevron are tokened rather than `white/N`: on light
        // glass a white-on-white arrow is invisible and a white hover tint
        // does nothing at all.
        className="group flex-1 min-w-0 text-left rounded-lg px-3 py-2 hover:bg-gp-ink-strong/5 dark:hover:bg-white/[0.04] transition-colors cursor-pointer flex items-center gap-2"
      >
        <span className="min-w-0 flex-1 truncate text-xs text-gp-ink-strong dark:text-white/85">
          {name || 'Person'}
        </span>
        <span className="material-symbols-outlined shrink-0 text-[16px] leading-none text-gp-ink-muted/60 dark:text-white/30 group-hover:text-gp-ink-muted dark:group-hover:text-white/70 group-hover:translate-x-0.5 transition-all">
          arrow_forward
        </span>
      </button>

      {onRoster ? (
        <span
          className="shrink-0 rounded-full border border-gp-primary/30 bg-gp-primary/10 px-2 py-1 text-[10px] uppercase tracking-wide text-gp-primary"
          title={`${name || 'This person'} is on the field's People list`}
        >
          On roster
        </span>
      ) : canPromoteThisPerson ? (
        <button
          type="button"
          onClick={() => onPromote(personId, name)}
          disabled={isPromoting}
          title={`Add ${name || 'this person'} to the field's People list`}
          aria-label={`Add ${name || 'this person'} to the field's People list`}
          className="shrink-0 flex items-center justify-center size-7 rounded-lg border border-gp-glass-border bg-gp-primary/10 text-gp-primary hover:bg-gp-primary/20 hover:border-gp-primary/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          {/*
            `awaitRefetchQueries` holds this pending until the roster query
            returns — measured at 10-16s against a slow database — so the
            pending state has to read as working. A static glyph reads as hung.
          */}
          <span
            className={cn(
              'material-symbols-outlined text-[16px]',
              isPromoting && 'animate-spin'
            )}
          >
            {isPromoting ? 'progress_activity' : 'person_add'}
          </span>
        </button>
      ) : !isAttached ? (
        <span
          className="shrink-0 rounded-full border border-gp-glass-border px-2 py-1 text-[10px] uppercase tracking-wide text-gp-ink-muted"
          title={`${name || 'This person'} was removed from ${fieldTitle ?? 'this field'}. Use Add Person on the field to put them back.`}
        >
          Removed
        </span>
      ) : null}
    </li>
  )
}
