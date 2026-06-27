'use client'

import { useCallback, useMemo, useState } from 'react'
import {
  useAssistantApi,
  useAssistantState,
  type ToolCallMessagePartComponent,
} from '@assistant-ui/react'
import { useMutation } from '@apollo/client/react'
import { Button } from '@/components/ui/button'
import { getConfigForType } from '@/lib/pulse-type-config'
import { useApprovalAction } from './approval-action-context'
import { SUBMIT_ASSISTANT_FEEDBACK } from '@/app/graphql/mutations'
import { strengthLabel } from './resonance-suggestions-helpers'
import {
  isResonantPulseSuggestionsResult,
  persistDecision,
  readStoredDecision,
  suggestionTypeToNodeType,
  type Decision,
  type ResonantPulseSuggestionShape,
} from './resonant-pulse-suggestions-helpers'

/**
 * Inline "capture and resonate" cards (conversation↔pulse).
 *
 * Registered as the `suggest_resonant_pulses` tool renderer. READ-ONLY: it
 * proposes creating a NEW pulse surfaced from the dialogue AND connecting it as
 * a resonance to an EXISTING pulse in the active field. Accepting queues the
 * exact `create_resonant_pulse` args (carrying the resolved existing-pulse id +
 * the new pulse's fields) as a deterministic executeAction — the backend creates
 * the pulse, links it (anchored to the context), and logs both. The card IS the
 * HITL gate (Rule 5, kb/07); nothing is written until an explicit accept.
 *
 * Rule 1 (kb/07): cards never render raw ids — the user sees pulse titles only.
 */

export const ResonantPulseSuggestionsToolPart: ToolCallMessagePartComponent = ({
  result,
}) => {
  const api = useAssistantApi()
  const approval = useApprovalAction()
  const turnId = useAssistantState(({ message }) =>
    typeof message.id === 'string' && message.id.length > 0 ? message.id : null
  )
  const isRunning = useAssistantState(({ thread }) => thread.isRunning)
  const [submitFeedback] = useMutation(SUBMIT_ASSISTANT_FEEDBACK)

  const suggestions = useMemo<ResonantPulseSuggestionShape[]>(
    () =>
      isResonantPulseSuggestionsResult(result)
        ? result.suggestions ?? []
        : [],
    [result]
  )

  const pairLabel = useCallback((s: ResonantPulseSuggestionShape): string => {
    const newName = (s.newPulseName || '').trim() || 'a new pulse'
    const existing = (s.existingPulseName || '').trim() || 'an existing pulse'
    return `${newName} and ${existing}`
  }, [])

  const [decisions, setDecisions] = useState<Record<number, Decision>>(() => {
    const initial: Record<number, Decision> = {}
    suggestions.forEach((_, index) => {
      initial[index] = readStoredDecision(turnId, index)
    })
    return initial
  })
  // Selection + why edits defaulted AT READ TIME (the result streams in after
  // first mount, so useState initializers would run over an empty array). Absent
  // selection = selected; absent why falls back to the inferred why.
  const [selected, setSelected] = useState<Record<number, boolean>>({})
  const isSelected = useCallback(
    (index: number) => selected[index] ?? true,
    [selected]
  )
  const [whyEdits, setWhyEdits] = useState<Record<number, string>>({})
  const whyValue = useCallback(
    (s: ResonantPulseSuggestionShape, index: number) =>
      whyEdits[index] ?? (s.why || '').trim(),
    [whyEdits]
  )

  const recordFeedback = useCallback(
    (rating: 'POSITIVE' | 'NEGATIVE', label: string, verb: string) => {
      if (!turnId) return
      submitFeedback({
        variables: {
          turnId,
          rating,
          userComment: `${verb} suggested resonance: ${label}`,
        },
      }).catch((error) => {
        console.warn(
          '[ResonantPulseSuggestionsToolPart] feedback submit failed:',
          error instanceof Error ? error.message : error
        )
      })
    },
    [submitFeedback, turnId]
  )

  const setDecision = useCallback(
    (index: number, decision: Decision) => {
      setDecisions((prev) => ({ ...prev, [index]: decision }))
      persistDecision(turnId, index, decision)
    },
    [turnId]
  )

  const toggleSelect = useCallback((index: number) => {
    setSelected((prev) => ({ ...prev, [index]: !(prev[index] ?? true) }))
  }, [])

  const argsWithWhy = useCallback(
    (
      s: ResonantPulseSuggestionShape,
      index: number
    ): Record<string, unknown> => {
      const base = { ...(s.createArgs as Record<string, unknown>) }
      const why = whyValue(s, index).trim()
      if (why) base.why = why
      else delete base.why
      return base
    },
    [whyValue]
  )

  const handleAddSelected = useCallback(() => {
    if (isRunning) return
    const chosen: Array<{ index: number; s: ResonantPulseSuggestionShape }> = []
    suggestions.forEach((s, index) => {
      if (
        (decisions[index] ?? 'pending') === 'pending' &&
        isSelected(index) &&
        s.createArgs &&
        (s.newPulseName || '').trim() &&
        (s.existingPulseName || '').trim()
      ) {
        chosen.push({ index, s })
      }
    })
    if (chosen.length === 0) return

    approval?.requestExecuteActions(
      chosen.map(({ index, s }) => ({
        tool: 'create_resonant_pulse',
        args: argsWithWhy(s, index),
      }))
    )

    const turnText =
      chosen.length === 1
        ? `Capture and connect ${pairLabel(chosen[0].s)}.`
        : `Capture ${chosen.length} resonances.`
    try {
      const composer = api.thread().composer()
      composer.setText(turnText)
      composer.send()
    } catch (error) {
      console.warn(
        '[ResonantPulseSuggestionsToolPart] failed to send accept turn:',
        error
      )
      return
    }
    chosen.forEach(({ index, s }) => {
      setDecision(index, 'accepted')
      recordFeedback('POSITIVE', pairLabel(s), 'Accepted')
    })
  }, [
    api,
    approval,
    argsWithWhy,
    decisions,
    isRunning,
    isSelected,
    pairLabel,
    recordFeedback,
    setDecision,
    suggestions,
  ])

  const handleDismiss = useCallback(
    (suggestion: ResonantPulseSuggestionShape, index: number) => {
      setDecision(index, 'dismissed')
      recordFeedback('NEGATIVE', pairLabel(suggestion), 'Dismissed')
    },
    [pairLabel, recordFeedback, setDecision]
  )

  const handleDismissAll = useCallback(() => {
    suggestions.forEach((s, index) => {
      if ((decisions[index] ?? 'pending') === 'pending') {
        setDecision(index, 'dismissed')
        recordFeedback('NEGATIVE', pairLabel(s), 'Dismissed')
      }
    })
  }, [decisions, pairLabel, recordFeedback, setDecision, suggestions])

  if (suggestions.length === 0) return null

  const pendingCount = suggestions.filter(
    (_, i) => (decisions[i] ?? 'pending') === 'pending'
  ).length
  const selectedCount = suggestions.filter(
    (_, i) => (decisions[i] ?? 'pending') === 'pending' && isSelected(i)
  ).length

  return (
    <div className="mt-2 space-y-2" data-testid="resonant-pulse-suggestions">
      <p className="flex items-center gap-1.5 text-xs font-medium text-gp-ink-muted dark:text-white/60">
        <span className="material-symbols-outlined text-[15px] leading-none text-gp-primary">
          add_link
        </span>
        <span className="min-w-0 truncate">Resonances worth capturing</span>
      </p>

      {suggestions.map((suggestion, index) => {
        const decision = decisions[index] ?? 'pending'
        const newName = (suggestion.newPulseName || '').trim() || 'a new pulse'
        const existing =
          (suggestion.existingPulseName || '').trim() || 'an existing pulse'
        const node = suggestionTypeToNodeType(suggestion.newPulseType)
        const cfg = node ? getConfigForType(node) : null
        const typeLabel = suggestion.newPulseTypeLabel || cfg?.label || 'pulse'
        const isChecked = decision === 'pending' && isSelected(index)
        return (
          <div
            key={`resonant-pulse-${index}`}
            className="rounded-md border border-slate-200 bg-white/70 p-3 dark:border-white/10 dark:bg-black/20"
            data-testid="resonant-pulse-suggestion-card"
          >
            <div className="flex items-start gap-2.5">
              {decision === 'pending' ? (
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleSelect(index)}
                  aria-label={`Select capturing ${newName}`}
                  className="mt-1 size-4 shrink-0 cursor-pointer accent-gp-primary"
                />
              ) : null}
              <span
                className="flex size-8 shrink-0 items-center justify-center rounded-full border"
                style={{
                  backgroundColor:
                    'color-mix(in srgb, var(--gp-primary) 12%, transparent)',
                  borderColor:
                    'color-mix(in srgb, var(--gp-primary) 25%, transparent)',
                }}
              >
                <span className="material-symbols-outlined text-[18px] leading-none text-gp-primary">
                  add_link
                </span>
              </span>
              <div className="min-w-0 flex-1">
                {/* New pulse to capture + its type, then the existing pulse it
                    connects to. Each name truncates so nothing overflows @390px. */}
                <div className="flex min-w-0 items-center gap-1.5">
                  {cfg ? (
                    <span
                      className={`material-symbols-outlined shrink-0 text-[16px] leading-none ${cfg.color}`}
                      aria-hidden="true"
                    >
                      {cfg.icon}
                    </span>
                  ) : null}
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-gp-ink-strong dark:text-white">
                    {newName}
                  </span>
                  <span className="shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-600 dark:bg-white/10 dark:text-slate-300">
                    new {typeLabel}
                  </span>
                </div>
                <div className="mt-1 flex min-w-0 items-center gap-1">
                  <span className="material-symbols-outlined shrink-0 text-[14px] leading-none text-gp-primary">
                    sync_alt
                  </span>
                  <span className="min-w-0 truncate text-xs text-gp-ink-muted dark:text-white/60">
                    {existing}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span className="shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-600 dark:bg-white/10 dark:text-slate-300">
                    {strengthLabel(suggestion.strength)} resonance
                  </span>
                  {suggestion.label ? (
                    <span className="min-w-0 truncate text-[11px] text-gp-ink-muted dark:text-white/55">
                      {suggestion.label}
                    </span>
                  ) : null}
                </div>
                {suggestion.sourceSnippet ? (
                  <p className="mt-1 line-clamp-2 text-xs italic text-gp-ink-muted dark:text-white/50">
                    “{suggestion.sourceSnippet}”
                  </p>
                ) : null}

                {decision === 'pending' ? (
                  <label className="mt-2 block">
                    <span className="mb-1 block text-[11px] font-medium text-gp-ink-muted dark:text-white/55">
                      Why they resonate
                    </span>
                    <textarea
                      rows={2}
                      value={whyValue(suggestion, index)}
                      onChange={(e) =>
                        setWhyEdits((prev) => ({
                          ...prev,
                          [index]: e.target.value,
                        }))
                      }
                      placeholder="e.g. both circle back to a need for belonging"
                      className="w-full rounded-md border border-input bg-transparent px-2.5 py-1.5 text-xs text-gp-ink-strong outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:text-white"
                    />
                  </label>
                ) : null}
              </div>

              {decision === 'pending' ? (
                <button
                  type="button"
                  onClick={() => handleDismiss(suggestion, index)}
                  aria-label={`Dismiss capturing ${newName}`}
                  title="Dismiss"
                  className="shrink-0 rounded p-0.5 text-gp-ink-soft hover:bg-slate-100 hover:text-gp-ink-muted dark:text-white/40 dark:hover:bg-white/10"
                >
                  <span className="material-symbols-outlined text-[16px] leading-none">
                    close
                  </span>
                </button>
              ) : null}
            </div>

            {decision === 'accepted' ? (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-gp-ink-muted dark:text-white/50">
                <span className="material-symbols-outlined text-[15px] leading-none text-gp-resource">
                  check_circle
                </span>
                Captured &amp; connected
              </div>
            ) : decision === 'dismissed' ? (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-gp-ink-muted dark:text-white/50">
                <span className="material-symbols-outlined text-[15px] leading-none">
                  cancel
                </span>
                Dismissed
              </div>
            ) : null}
          </div>
        )
      })}

      {pendingCount > 0 ? (
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <Button
            size="sm"
            className="h-8 bg-gp-primary text-white hover:bg-gp-primary/90 disabled:opacity-50"
            disabled={selectedCount === 0 || isRunning}
            onClick={handleAddSelected}
          >
            {selectedCount > 0
              ? `Capture ${selectedCount}`
              : 'Select resonances to capture'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 border-slate-200 dark:border-white/10"
            onClick={handleDismissAll}
          >
            Dismiss all
          </Button>
        </div>
      ) : null}
    </div>
  )
}
