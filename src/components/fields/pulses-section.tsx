'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { SectionHeader } from '@/components/persons/section-header'
import { ProfileCard } from '@/components/persons/profile-card'
import {
  personDisplayName,
  resolvePulseAuthor,
  type PulseAuthorLike,
} from '@/lib/pulse-author'
import {
  EmptySection,
  getEditablePulseType,
  getPulseTypeClass,
  getPulseTypeLabel,
  type EditablePulseType,
} from './field-section-primitives'

type PulseRecord = {
  __typename: string
  id: string
  title: string
  content: string
  createdAt: string
  initiatedBy?: PulseAuthorLike[] | null
  createdBy?: PulseAuthorLike[] | null
}

export type PulsesSectionProps = {
  pulses: PulseRecord[]
  onAddPulse: () => void
  onUploadDocument?: () => void
  onEditPulse: (
    e: React.MouseEvent,
    pulseId: string,
    type: EditablePulseType,
    title: string,
    content: string
  ) => void
  onDeletePulse: (
    e: React.MouseEvent,
    pulseId: string,
    type: EditablePulseType
  ) => void
  onPulseClick: (pulseId: string) => void
  /**
   * Rich sharing entry. When provided, the section offers a per-pulse
   * move/share affordance plus a multi-select "Select" mode that opens the
   * bulk share/move modal pre-populated with the chosen pulses. `mode` chooses
   * which tab the modal opens on. When omitted, the section falls back to the
   * legacy single `onSharePulses` bulk button (used by surfaces not yet wired
   * for pre-selection).
   */
  onOpenShare?: (pulseIds: string[], mode: 'share' | 'move') => void
  /** Legacy bulk-share entry — only used when `onOpenShare` is absent. */
  onSharePulses?: () => void
}

const pillBase =
  'inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'

export function PulsesSection({
  pulses,
  onAddPulse,
  onUploadDocument,
  onEditPulse,
  onDeletePulse,
  onPulseClick,
  onOpenShare,
  onSharePulses,
}: PulsesSectionProps) {
  const richSharing = Boolean(onOpenShare)
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const selectedCount = selectedIds.size

  const exitSelect = () => {
    setSelectMode(false)
    setSelectedIds(new Set())
  }

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleBulk = (mode: 'share' | 'move') => {
    if (!onOpenShare || selectedCount === 0) return
    onOpenShare([...selectedIds], mode)
    exitSelect()
  }

  return (
    <div className="flex flex-col gap-4 md:col-span-2">
      <div className="flex items-center justify-between gap-3">
        <SectionHeader icon="waves" title="Pulses" />
        <div className="flex items-center gap-2">
          {richSharing && pulses.length > 0 ? (
            selectMode ? (
              <button
                onClick={exitSelect}
                className={cn(
                  pillBase,
                  'bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 text-gp-ink-strong hover:bg-white/80 dark:hover:bg-white/10'
                )}
              >
                <span className="material-symbols-outlined text-[16px]">
                  close
                </span>
                Done
              </button>
            ) : (
              <button
                onClick={() => setSelectMode(true)}
                className={cn(
                  pillBase,
                  'bg-gp-primary/10 dark:bg-gp-primary/15 border border-gp-primary/30 dark:border-gp-primary/40 text-gp-primary hover:bg-gp-primary/20 dark:hover:bg-gp-primary/25'
                )}
              >
                <span className="material-symbols-outlined text-[16px]">
                  checklist
                </span>
                Select
              </button>
            )
          ) : null}
          {!richSharing && onSharePulses && (
            <button
              onClick={onSharePulses}
              className={cn(
                pillBase,
                'bg-gp-primary/10 dark:bg-gp-primary/15 border border-gp-primary/30 dark:border-gp-primary/40 text-gp-primary hover:bg-gp-primary/20 dark:hover:bg-gp-primary/25'
              )}
            >
              <span className="material-symbols-outlined text-[16px]">
                share
              </span>
              Share
            </button>
          )}
          {!selectMode && (
            <button
              onClick={onAddPulse}
              className={cn(
                pillBase,
                'bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 text-gp-ink-strong hover:bg-white/80 dark:hover:bg-white/10'
              )}
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Add Pulse
            </button>
          )}
        </div>
      </div>

      {richSharing && selectMode && (
        <div className="gp-glass flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gp-glass-border px-3 py-2">
          <span className="text-xs font-medium text-gp-ink-muted">
            {selectedCount} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulk('move')}
              disabled={selectedCount === 0}
              className={cn(
                pillBase,
                'px-3 py-1.5 bg-gp-primary/10 dark:bg-gp-primary/15 border border-gp-primary/30 dark:border-gp-primary/40 text-gp-primary hover:bg-gp-primary/20 dark:hover:bg-gp-primary/25'
              )}
            >
              <span className="material-symbols-outlined text-[16px]">
                drive_file_move
              </span>
              Move to…
            </button>
            <button
              onClick={() => handleBulk('share')}
              disabled={selectedCount === 0}
              className={cn(
                pillBase,
                'px-3 py-1.5 bg-gp-primary/10 dark:bg-gp-primary/15 border border-gp-primary/30 dark:border-gp-primary/40 text-gp-primary hover:bg-gp-primary/20 dark:hover:bg-gp-primary/25'
              )}
            >
              <span className="material-symbols-outlined text-[16px]">
                share
              </span>
              Share to…
            </button>
          </div>
        </div>
      )}

      {pulses.length === 0 ? (
        <EmptySection
          icon="waves"
          title="No pulses yet"
          body="A pulse is a Goal, Resource, Story, Care, or Core Value contributed into this field. Add the first one — or drop a document and let the assistant extract pulses from it."
          cta={{ label: 'Add a pulse', icon: 'add', onClick: onAddPulse }}
          secondaryCta={
            onUploadDocument
              ? {
                  label: 'Upload a document',
                  icon: 'upload_file',
                  onClick: onUploadDocument,
                }
              : undefined
          }
        />
      ) : (
        <ProfileCard>
          <div className="space-y-3">
            {pulses.map((pulse, idx) => {
              const pulseType = getEditablePulseType(pulse.__typename)
              // Every recognized pulse type (Goal, Resource, Story, Care,
              // Core Value) is editable/deletable — see GOAL-252.
              const canEditPulse = pulseType !== null
              const selected = selectedIds.has(pulse.id)

              return (
                <div
                  key={pulse.id}
                  onClick={() =>
                    selectMode
                      ? toggleSelected(pulse.id)
                      : onPulseClick(pulse.id)
                  }
                  className={cn(
                    'cursor-pointer rounded px-2 -mx-2 transition-colors',
                    idx > 0 && 'border-t border-gp-glass-border pt-3',
                    selected
                      ? 'bg-gp-primary/5 dark:bg-gp-primary/10'
                      : 'hover:bg-gp-glass-bg/50 dark:hover:bg-white/5'
                  )}
                >
                  <div className="flex justify-between items-start gap-4 mb-1 p-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {selectMode && (
                        <span
                          className={cn(
                            'material-symbols-outlined mt-0.5 shrink-0 text-[18px]',
                            selected ? 'text-gp-primary' : 'text-gp-ink-muted'
                          )}
                        >
                          {selected ? 'check_box' : 'check_box_outline_blank'}
                        </span>
                      )}
                      <div className="min-w-0">
                        <span
                          className={`text-[9px] uppercase font-semibold block mb-0.5 ${getPulseTypeClass(pulse.__typename)}`}
                        >
                          {getPulseTypeLabel(pulse.__typename)}
                        </span>
                        <h4 className="text-xs font-bold text-gp-ink-strong dark:text-white">
                          {pulse.title}
                        </h4>
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                          <span className="material-symbols-outlined text-[12px] shrink-0">
                            person
                          </span>
                          <span className="truncate">
                            {personDisplayName(resolvePulseAuthor(pulse))}
                          </span>
                        </div>
                      </div>
                    </div>
                    {!selectMode && (
                      <div
                        className="flex items-start gap-2 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {richSharing && (
                          <button
                            onClick={() => onOpenShare?.([pulse.id], 'share')}
                            className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-gp-primary/30 bg-gp-primary/10 text-gp-primary transition-all hover:bg-gp-primary/20 dark:border-gp-primary/40 dark:bg-gp-primary/15 dark:hover:bg-gp-primary/25 cursor-pointer"
                            aria-label={`Move or share ${pulse.title}`}
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: '14px' }}
                            >
                              share
                            </span>
                          </button>
                        )}
                        {canEditPulse && pulseType && (
                          <>
                            <button
                              onClick={(e) =>
                                onEditPulse(
                                  e,
                                  pulse.id,
                                  pulseType,
                                  pulse.title,
                                  pulse.content
                                )
                              }
                              className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/60 bg-white/50 text-gp-ink-strong transition-all hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-gp-ink-strong dark:hover:bg-white/10"
                              aria-label={`Edit ${pulse.title}`}
                            >
                              <span
                                className="material-symbols-outlined cursor-pointer"
                                style={{ fontSize: '14px' }}
                              >
                                edit
                              </span>
                            </button>
                            <button
                              onClick={(e) =>
                                onDeletePulse(e, pulse.id, pulseType)
                              }
                              className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-red-300 bg-red-50 text-red-600 transition-all hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 cursor-pointer"
                              aria-label={`Delete ${pulse.title}`}
                            >
                              <span
                                className="material-symbols-outlined"
                                style={{ fontSize: '14px' }}
                              >
                                delete
                              </span>
                            </button>
                          </>
                        )}
                        <span className="pt-1 text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                          {new Date(pulse.createdAt).toLocaleDateString(
                            'en-US',
                            { month: 'short', day: 'numeric', year: 'numeric' }
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                  {pulse.content && (
                    <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft leading-relaxed mt-1 px-4 pb-4">
                      {pulse.content.substring(0, 150)}
                      {pulse.content.length > 150 ? '...' : ''}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </ProfileCard>
      )}
    </div>
  )
}
