'use client'

import type { FC, ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * The Pulses section toolbar — type filter, Select/Done, Share, Import
 * Articles, Add Pulse.
 *
 * Its own component for two reasons. It is rendered twice (in the section
 * header and, via `SectionList`, in the modal header), and `pulses-section`
 * was over the 400-line rule with it inline. Every control here drives state
 * that still lives in `PulsesSection`, so acting from inside the modal changes
 * the same section the modal is showing.
 */

const pillBase =
  'inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'

/** Neutral pill — the default for a section action. */
const pillNeutral =
  'bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 text-gp-ink-strong hover:bg-white/80 dark:hover:bg-white/10'

/** Primary-tinted pill — for the action that starts or ends a mode. */
const pillPrimary =
  'bg-gp-primary/10 dark:bg-gp-primary/15 border border-gp-primary/30 dark:border-gp-primary/40 text-gp-primary hover:bg-gp-primary/20 dark:hover:bg-gp-primary/25'

interface PulsesSectionActionsProps {
  /** The type-filter chips, rendered ahead of the action pills. */
  typeFilter: ReactNode
  hasPulses: boolean
  richSharing: boolean
  selectMode: boolean
  onEnterSelect: () => void
  onExitSelect: () => void
  onSharePulses?: () => void
  onImportArticles?: () => void
  onAddPulse: () => void
}

export const PulsesSectionActions: FC<PulsesSectionActionsProps> = ({
  typeFilter,
  hasPulses,
  richSharing,
  selectMode,
  onEnterSelect,
  onExitSelect,
  onSharePulses,
  onImportArticles,
  onAddPulse,
}) => (
  <div className="flex flex-wrap items-center justify-end gap-2">
    {typeFilter}
    {richSharing && hasPulses ? (
      selectMode ? (
        <button onClick={onExitSelect} className={cn(pillBase, pillNeutral)}>
          <span className="material-symbols-outlined text-[16px]">close</span>
          Done
        </button>
      ) : (
        <button onClick={onEnterSelect} className={cn(pillBase, pillPrimary)}>
          <span className="material-symbols-outlined text-[16px]">
            checklist
          </span>
          Select
        </button>
      )
    ) : null}
    {!richSharing && onSharePulses && (
      <button onClick={onSharePulses} className={cn(pillBase, pillPrimary)}>
        <span className="material-symbols-outlined text-[16px]">share</span>
        Share
      </button>
    )}
    {!selectMode && onImportArticles && (
      <button onClick={onImportArticles} className={cn(pillBase, pillNeutral)}>
        <span className="material-symbols-outlined text-[16px]">newspaper</span>
        Import Articles
      </button>
    )}
    {!selectMode && (
      <button onClick={onAddPulse} className={cn(pillBase, pillNeutral)}>
        <span className="material-symbols-outlined text-[16px]">add</span>
        Add Pulse
      </button>
    )}
  </div>
)
