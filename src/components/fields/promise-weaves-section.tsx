'use client'

import { SectionHeader } from '@/components/persons/section-header'
import { ProfileCard } from '@/components/persons/profile-card'
import { cn } from '@/lib/utils'
import {
  getWeaveStatusClass,
  getWeaveStatusLabel,
  isAwaitingReview,
} from '@/lib/promise-weave'
import { EmptySection, getPulseTypeLabel } from './field-section-primitives'

export type WeavePulseRecord = {
  __typename?: string | null
  id: string
  title?: string | null
}

export type WeaveRecord = {
  id: string
  title?: string | null
  description?: string | null
  status?: string | null
  origin?: string | null
  weaves?: WeavePulseRecord[] | null
  wovenFor?: Array<{
    id: string
    name?: string | null
    firstName?: string | null
    lastName?: string | null
  }> | null
}

type PromiseWeavesSectionProps = {
  weaves: WeaveRecord[]
  /** Pulse count in this field — a weave needs at least one to hold. */
  pulseCount: number
  onWeaveClick?: (weaveId: string) => void
  /** Omit to hide every write affordance (viewers, GUESTs). */
  onAddWeave?: () => void
  onEditWeave?: (weaveId: string) => void
  /** Confirm an AI-proposed weave — `proposed` → `active`. */
  onConfirmWeave?: (weaveId: string) => void
  /** Decline an AI-proposed weave — `proposed` → `dissolved`. */
  onDismissWeave?: (weaveId: string) => void
  /** Weave id currently being mutated, so its row can show a pending state. */
  pendingWeaveId?: string | null
}

export function composeWeavePersonName(p?: {
  name?: string | null
  firstName?: string | null
  lastName?: string | null
}): string {
  if (!p) return ''
  const composed = `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim()
  return p.name?.trim() || composed || ''
}

function getWeaveEndpointLabel(pulse?: WeavePulseRecord): string {
  if (!pulse) return 'Unknown pulse'
  return `${getPulseTypeLabel(pulse.__typename ?? '')}: ${
    pulse.title ?? 'Untitled'
  }`
}

/**
 * The "Promise weaves" section of a FieldContext detail page.
 *
 * A weave is a reified connector node (kb/01-glossary.md) — it holds the pulses
 * and the person a promise implicates so the neighbourhood is navigable. Rows
 * open the entity-info drawer; members who can edit also get create/edit here,
 * and AI-proposed weaves carry an inline confirm/dismiss gate rather than
 * appearing as if they were already agreed (kb/04-state-machines.md).
 */
export function PromiseWeavesSection({
  weaves,
  pulseCount,
  onWeaveClick,
  onAddWeave,
  onEditWeave,
  onConfirmWeave,
  onDismissWeave,
  pendingWeaveId = null,
}: PromiseWeavesSectionProps) {
  const canWeave = !!onAddWeave && pulseCount > 0

  return (
    <div className="flex flex-col gap-4 md:col-span-2">
      <div className="flex items-center justify-between gap-2">
        <SectionHeader icon="account_tree" title="Promise weaves" />
        <div className="flex items-center gap-1.5 shrink-0">
          {onAddWeave ? (
            <button
              onClick={() => onAddWeave()}
              disabled={!canWeave}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gp-primary/30 bg-gp-primary/10 hover:bg-gp-primary/20 text-gp-primary dark:border-gp-primary/40 dark:bg-gp-primary/20 dark:hover:bg-gp-primary/30 transition-colors text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              aria-label={
                canWeave ? 'New promise weave' : 'Add a pulse before weaving'
              }
              title={
                canWeave
                  ? ''
                  : 'A weave holds at least one pulse — add one first'
              }
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span className="hidden sm:inline">Weave</span>
            </button>
          ) : null}
        </div>
      </div>

      {weaves.length === 0 ? (
        <EmptySection
          icon="account_tree"
          title="No promise weaves yet"
          body={
            pulseCount === 0
              ? 'A promise weave gathers the pulses and the person a promise implicates. Add a pulse first, then weave it.'
              : 'A promise weave gathers the pulses and the person a promise implicates, so its surroundings are navigable rather than a dead end.'
          }
          cta={
            canWeave && onAddWeave
              ? { label: 'Weave pulses', icon: 'add', onClick: onAddWeave }
              : undefined
          }
        />
      ) : (
        <ProfileCard>
          <div className="space-y-3">
            {weaves.map((weave, idx) => {
              const woven = weave.weaves ?? []
              const personName = composeWeavePersonName(
                weave.wovenFor?.[0] ?? undefined
              )
              const awaitingReview = isAwaitingReview(weave.status)
              const isPending = pendingWeaveId === weave.id

              return (
                <div
                  key={weave.id}
                  className={cn(
                    'rounded px-2 -mx-2 transition-colors',
                    idx > 0 && 'border-t border-gp-glass-border pt-3',
                    isPending && 'opacity-60'
                  )}
                >
                  <div
                    onClick={() => onWeaveClick?.(weave.id)}
                    className={cn(
                      onWeaveClick &&
                        'cursor-pointer hover:bg-gp-glass-bg/50 dark:hover:bg-white/5 rounded transition-colors'
                    )}
                  >
                    <div className="flex justify-between items-start gap-3 mb-1">
                      <div className="flex-1 space-y-1 min-w-0">
                        <span className="text-[9px] uppercase font-semibold text-gp-primary block truncate">
                          Weave{personName ? ` · ${personName}` : ''}
                        </span>
                        <h4 className="text-xs font-bold text-gp-ink-strong dark:text-white leading-relaxed break-words">
                          {weave.title || 'Promise weave'}
                        </h4>
                      </div>
                      <div className="shrink-0 flex items-center gap-1.5">
                        <span
                          className={cn(
                            'text-[9px] uppercase font-semibold border rounded-full px-2 py-0.5',
                            getWeaveStatusClass(weave.status)
                          )}
                        >
                          {getWeaveStatusLabel(weave.status)}
                        </span>
                        {onEditWeave && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              onEditWeave(weave.id)
                            }}
                            disabled={isPending}
                            aria-label={`Edit ${weave.title || 'promise weave'}`}
                            className="size-6 rounded-full inline-flex items-center justify-center text-gp-ink-muted hover:text-gp-primary hover:bg-gp-primary/10 disabled:opacity-50 transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              edit
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                    {woven.length > 0 && (
                      <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft leading-relaxed mt-1">
                        Weaves{' '}
                        {woven.map((p) => getWeaveEndpointLabel(p)).join(', ')}
                      </p>
                    )}
                    {weave.description && (
                      <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft leading-relaxed mt-1">
                        {weave.description}
                      </p>
                    )}
                  </div>

                  {awaitingReview && (onConfirmWeave || onDismissWeave) && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {/* Gate-specific copy, NOT `getWeaveOriginLabel` — its
                          null-origin fallback ("Carried over from a migrated
                          care point") would read as a self-contradiction on a
                          row that is asking to be confirmed. */}
                      <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft min-w-0">
                        {weave.origin?.trim().toLowerCase() === 'ai'
                          ? 'Suggested by the assistant — keep it?'
                          : 'Not confirmed yet — keep it?'}
                      </span>
                      <div className="flex items-center gap-1.5 ml-auto shrink-0">
                        {onDismissWeave && (
                          <button
                            type="button"
                            onClick={() => onDismissWeave(weave.id)}
                            disabled={isPending}
                            className="px-3 h-7 rounded-full text-[11px] font-semibold text-gp-ink-muted hover:text-gp-ink-strong dark:hover:text-white border border-gp-glass-border hover:bg-gp-glass-bg disabled:opacity-50 transition-colors cursor-pointer"
                          >
                            Dismiss
                          </button>
                        )}
                        {onConfirmWeave && (
                          <button
                            type="button"
                            onClick={() => onConfirmWeave(weave.id)}
                            disabled={isPending}
                            className="px-3 h-7 rounded-full text-[11px] font-semibold bg-gp-primary hover:bg-gp-primary/90 text-white disabled:opacity-50 transition-colors cursor-pointer"
                          >
                            {isPending ? 'Saving…' : 'Confirm'}
                          </button>
                        )}
                      </div>
                    </div>
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
