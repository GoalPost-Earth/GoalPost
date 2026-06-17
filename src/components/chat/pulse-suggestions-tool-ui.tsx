'use client'

import { useCallback, useMemo, useState } from 'react'
import {
  useAssistantApi,
  useAssistantState,
  type ToolCallMessagePartComponent,
} from '@assistant-ui/react'
import { useMutation } from '@apollo/client/react'
import { Button } from '@/components/ui/button'
import { useApprovalAction } from './approval-action-context'
import { SUBMIT_ASSISTANT_FEEDBACK } from '@/app/graphql/mutations'
import {
  isSuggestionsResult,
  persistDecision,
  readStoredDecision,
  visualsFor,
  type Decision,
  type PulseSuggestionShape,
} from './pulse-suggestions-helpers'

/**
 * Inline pulse-suggestion cards (GOAL-272).
 *
 * Registered as the `suggest_pulses` tool renderer. The `suggest_pulses` tool
 * is READ-ONLY: it returns pulses surfaced from the conversation (any living-
 * system type — person, goal, resource, story, care, value — already deduped
 * against the active Space) for the user to add or dismiss.
 *
 * MULTI-SELECT: cards start selected; the user tunes the selection with the
 * per-card checkbox and accepts the whole batch with one "Add N" action. That
 * batch is queued as a SINGLE `executeActions` request (not one turn per card)
 * — firing a separate `composer.send()` per card races assistant-ui's
 * MessageRepository (duplicate message id in the parent tree → full-page crash)
 * and only the first write would land. One turn, N writes, one stream.
 *
 * Accepting does NOT trust the model to re-emit writes — it queues the exact
 * create args (`create_person` / `create_pulse`) as deterministic
 * `executeActions` (the same path the HITL approval card uses, hitl.ts) and the
 * backend executes them verbatim with full Space-authorization + activity
 * logging. So the suggestion card IS the HITL gate (Rule 5, kb/07): pulses are
 * only ever created on an explicit accept.
 *
 * Accept/Dismiss double as the quality signal for the self-improvement loop
 * (GOAL-268): each writes an AssistantFeedback row (positive on accept, negative
 * on dismiss) via the existing submitAssistantFeedback mutation.
 *
 * Rule 1 (kb/07): the cards never render raw ids, __typename, or approval
 * hashes. `createArgs` carries the internal contextId for execution only — it
 * is never shown.
 *
 * Decisions persist in sessionStorage keyed by (turnId, index) so a reload
 * can't re-fire an already-accepted suggestion (which would create a duplicate),
 * while still letting the user act on the remaining cards in-session.
 *
 * Accept marks "Added" and writes POSITIVE feedback OPTIMISTICALLY the instant
 * the turn is sent (the same optimism the HITL approval card uses). The create
 * is re-authorized server-side; on the rare failure the narration says so. The
 * trade-off is a small chance of a false-positive quality signal rather than a
 * blocked UI.
 */

export const PulseSuggestionsToolPart: ToolCallMessagePartComponent = ({
  result,
}) => {
  const api = useAssistantApi()
  const approval = useApprovalAction()
  const turnId = useAssistantState(({ message }) =>
    typeof message.id === 'string' && message.id.length > 0 ? message.id : null
  )
  const isRunning = useAssistantState(({ thread }) => thread.isRunning)
  const [submitFeedback] = useMutation(SUBMIT_ASSISTANT_FEEDBACK)

  const suggestions = useMemo<PulseSuggestionShape[]>(
    () => (isSuggestionsResult(result) ? result.suggestions ?? [] : []),
    [result]
  )
  const fieldContextTitle = isSuggestionsResult(result)
    ? result.fieldContextTitle ?? null
    : null

  const [decisions, setDecisions] = useState<Record<number, Decision>>(() => {
    const initial: Record<number, Decision> = {}
    suggestions.forEach((_, index) => {
      initial[index] = readStoredDecision(turnId, index)
    })
    return initial
  })
  // Which still-pending cards are checked for the next batch add. Default: all.
  const [selected, setSelected] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {}
    suggestions.forEach((_, index) => {
      initial[index] = true
    })
    return initial
  })

  const recordFeedback = useCallback(
    (rating: 'POSITIVE' | 'NEGATIVE', label: string, verb: string) => {
      if (!turnId) return
      submitFeedback({
        variables: {
          turnId,
          rating,
          userComment: `${verb} suggested ${label}`,
        },
      }).catch((error) => {
        console.warn(
          '[PulseSuggestionsToolPart] feedback submit failed:',
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
    setSelected((prev) => ({ ...prev, [index]: !prev[index] }))
  }, [])

  const feedbackLabel = (s: PulseSuggestionShape) =>
    `${(s.typeLabel || 'pulse').trim()}: ${(s.name || '').trim()}`

  // Add every still-pending, checked suggestion in ONE turn.
  const handleAddSelected = useCallback(() => {
    if (isRunning) return
    const chosen: Array<{ index: number; s: PulseSuggestionShape }> = []
    suggestions.forEach((s, index) => {
      if (
        (decisions[index] ?? 'pending') === 'pending' &&
        selected[index] &&
        s.createArgs &&
        s.writeTool &&
        (s.name || '').trim()
      ) {
        chosen.push({ index, s })
      }
    })
    if (chosen.length === 0) return

    approval?.requestExecuteActions(
      chosen.map(({ s }) => ({
        tool: s.writeTool as string,
        args: s.createArgs as Record<string, unknown>,
      }))
    )

    const names = chosen.map(({ s }) => (s.name || '').trim())
    const turnText =
      names.length === 1 ? `Add ${names[0]}.` : `Add ${names.join(', ')}.`
    try {
      const composer = api.thread().composer()
      composer.setText(turnText)
      composer.send()
    } catch (error) {
      console.warn('[PulseSuggestionsToolPart] failed to send accept turn:', error)
      return
    }
    chosen.forEach(({ index, s }) => {
      setDecision(index, 'accepted')
      recordFeedback('POSITIVE', feedbackLabel(s), 'Accepted')
    })
  }, [
    api,
    approval,
    decisions,
    isRunning,
    recordFeedback,
    selected,
    setDecision,
    suggestions,
  ])

  const handleDismiss = useCallback(
    (suggestion: PulseSuggestionShape, index: number) => {
      setDecision(index, 'dismissed')
      if ((suggestion.name || '').trim()) {
        recordFeedback('NEGATIVE', feedbackLabel(suggestion), 'Dismissed')
      }
    },
    [recordFeedback, setDecision]
  )

  const handleDismissAll = useCallback(() => {
    suggestions.forEach((s, index) => {
      if ((decisions[index] ?? 'pending') === 'pending') {
        setDecision(index, 'dismissed')
        if ((s.name || '').trim()) {
          recordFeedback('NEGATIVE', feedbackLabel(s), 'Dismissed')
        }
      }
    })
  }, [decisions, recordFeedback, setDecision, suggestions])

  if (suggestions.length === 0) return null

  const pendingCount = suggestions.filter(
    (_, i) => (decisions[i] ?? 'pending') === 'pending'
  ).length
  const selectedCount = suggestions.filter(
    (_, i) => (decisions[i] ?? 'pending') === 'pending' && selected[i]
  ).length
  const noun = selectedCount === 1 ? 'pulse' : 'pulses'

  return (
    <div className="mt-2 space-y-2" data-testid="pulse-suggestions">
      <p className="flex items-center gap-1.5 text-xs font-medium text-gp-ink-muted dark:text-white/60">
        <span className="material-symbols-outlined text-[15px] leading-none text-gp-primary">
          add_circle
        </span>
        <span className="min-w-0 truncate">
          Worth adding
          {fieldContextTitle ? ` to ${fieldContextTitle}` : ''}
        </span>
      </p>

      {suggestions.map((suggestion, index) => {
        const decision = decisions[index] ?? 'pending'
        const name = (suggestion.name || '').trim() || 'this pulse'
        const visuals = visualsFor(suggestion.type || 'person')
        const isChecked = decision === 'pending' && !!selected[index]
        return (
          <div
            key={`${suggestion.type || 'pulse'}-${index}`}
            className="rounded-md border border-slate-200 bg-white/70 p-3 dark:border-white/10 dark:bg-black/20"
            data-testid="pulse-suggestion-card"
          >
            <div className="flex items-start gap-2.5">
              {decision === 'pending' ? (
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleSelect(index)}
                  aria-label={`Select ${name}`}
                  className="mt-1 size-4 shrink-0 cursor-pointer accent-gp-primary"
                />
              ) : null}
              <span
                className="flex size-8 shrink-0 items-center justify-center rounded-full border"
                style={{
                  backgroundColor: `color-mix(in srgb, var(${visuals.cssVar}) 12%, transparent)`,
                  borderColor: `color-mix(in srgb, var(${visuals.cssVar}) 25%, transparent)`,
                }}
              >
                <span
                  className={`material-symbols-outlined text-[18px] leading-none ${visuals.colorClass}`}
                >
                  {visuals.icon}
                </span>
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className="truncate text-sm font-semibold text-gp-ink-strong dark:text-white">
                    {name}
                  </span>
                  <span className="shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-600 dark:bg-white/10 dark:text-slate-300">
                    {suggestion.typeLabel || 'pulse'}
                  </span>
                </div>
                {suggestion.sourceSnippet ? (
                  <p className="mt-0.5 line-clamp-2 text-xs italic text-gp-ink-muted dark:text-white/50">
                    “{suggestion.sourceSnippet}”
                  </p>
                ) : null}
              </div>

              {decision === 'pending' ? (
                <button
                  type="button"
                  onClick={() => handleDismiss(suggestion, index)}
                  aria-label={`Dismiss ${name}`}
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
                Added
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
              ? `Add ${selectedCount} ${noun}`
              : 'Select pulses to add'}
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
