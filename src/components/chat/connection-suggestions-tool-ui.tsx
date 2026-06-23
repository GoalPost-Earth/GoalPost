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
  isConnectionSuggestionsResult,
  persistDecision,
  readStoredDecision,
  type Decision,
  type ConnectionSuggestionShape,
} from './connection-suggestions-helpers'

/**
 * Inline connection-suggestion cards.
 *
 * Registered as the `suggest_connections` tool renderer. `suggest_connections`
 * is READ-ONLY: it returns relationships surfaced from the conversation (already
 * deduped against existing CONNECTED_TO edges) for the user to record or
 * dismiss. Each card carries the relationship "why" inferred from the dialogue,
 * editable inline before the user accepts.
 *
 * Accepting does NOT trust the model to re-emit writes — it queues the exact
 * `create_connection` args (carrying resolved person ids) as deterministic
 * `executeActions` (the same path the pulse-suggestion + HITL approval cards
 * use). The backend re-authorizes both endpoints + writes the activity log. So
 * the suggestion card IS the HITL gate (Rule 5, kb/07): a connection is only
 * created on an explicit accept.
 *
 * Rule 1 (kb/07): the cards never render raw ids — `createArgs` carries the
 * internal person ids for execution only.
 *
 * Decisions persist in sessionStorage keyed by (turnId, index) so a reload
 * can't re-fire an already-accepted suggestion.
 */

export const ConnectionSuggestionsToolPart: ToolCallMessagePartComponent = ({
  result,
}) => {
  const api = useAssistantApi()
  const approval = useApprovalAction()
  const turnId = useAssistantState(({ message }) =>
    typeof message.id === 'string' && message.id.length > 0 ? message.id : null
  )
  const isRunning = useAssistantState(({ thread }) => thread.isRunning)
  const [submitFeedback] = useMutation(SUBMIT_ASSISTANT_FEEDBACK)

  const suggestions = useMemo<ConnectionSuggestionShape[]>(
    () =>
      isConnectionSuggestionsResult(result) ? result.suggestions ?? [] : [],
    [result]
  )

  const [decisions, setDecisions] = useState<Record<number, Decision>>(() => {
    const initial: Record<number, Decision> = {}
    suggestions.forEach((_, index) => {
      initial[index] = readStoredDecision(turnId, index)
    })
    return initial
  })
  const [selected, setSelected] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {}
    suggestions.forEach((_, index) => {
      initial[index] = true
    })
    return initial
  })
  // The relationship text per card, seeded from the inferred why. The user can
  // edit or clear it before accepting (always-ask, skippable).
  const [whyEdits, setWhyEdits] = useState<Record<number, string>>(() => {
    const initial: Record<number, string> = {}
    suggestions.forEach((s, index) => {
      initial[index] = (s.why || '').trim()
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
          userComment: `${verb} suggested connection: ${label}`,
        },
      }).catch((error) => {
        console.warn(
          '[ConnectionSuggestionsToolPart] feedback submit failed:',
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

  // Merge the edited relationship into the proposed args. A blank relationship
  // omits `why` entirely (skippable) rather than overwriting with empty text.
  const argsWithWhy = useCallback(
    (s: ConnectionSuggestionShape, index: number): Record<string, unknown> => {
      const base = { ...(s.createArgs as Record<string, unknown>) }
      const why = (whyEdits[index] ?? '').trim()
      if (why) base.why = why
      else delete base.why
      return base
    },
    [whyEdits]
  )

  const handleAddSelected = useCallback(() => {
    if (isRunning) return
    const chosen: Array<{ index: number; s: ConnectionSuggestionShape }> = []
    suggestions.forEach((s, index) => {
      if (
        (decisions[index] ?? 'pending') === 'pending' &&
        selected[index] &&
        s.createArgs &&
        (s.name || '').trim()
      ) {
        chosen.push({ index, s })
      }
    })
    if (chosen.length === 0) return

    approval?.requestExecuteActions(
      chosen.map(({ index, s }) => ({
        tool: 'create_connection',
        args: argsWithWhy(s, index),
      }))
    )

    const names = chosen.map(({ s }) => (s.name || '').trim())
    const turnText =
      names.length === 1
        ? `Connect ${names[0]}.`
        : `Connect ${names.join(', ')}.`
    try {
      const composer = api.thread().composer()
      composer.setText(turnText)
      composer.send()
    } catch (error) {
      console.warn(
        '[ConnectionSuggestionsToolPart] failed to send accept turn:',
        error
      )
      return
    }
    chosen.forEach(({ index, s }) => {
      setDecision(index, 'accepted')
      recordFeedback('POSITIVE', (s.name || '').trim(), 'Accepted')
    })
  }, [
    api,
    approval,
    argsWithWhy,
    decisions,
    isRunning,
    recordFeedback,
    selected,
    setDecision,
    suggestions,
  ])

  const handleDismiss = useCallback(
    (suggestion: ConnectionSuggestionShape, index: number) => {
      setDecision(index, 'dismissed')
      if ((suggestion.name || '').trim()) {
        recordFeedback('NEGATIVE', (suggestion.name || '').trim(), 'Dismissed')
      }
    },
    [recordFeedback, setDecision]
  )

  const handleDismissAll = useCallback(() => {
    suggestions.forEach((s, index) => {
      if ((decisions[index] ?? 'pending') === 'pending') {
        setDecision(index, 'dismissed')
        if ((s.name || '').trim()) {
          recordFeedback('NEGATIVE', (s.name || '').trim(), 'Dismissed')
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

  return (
    <div className="mt-2 space-y-2" data-testid="connection-suggestions">
      <p className="flex items-center gap-1.5 text-xs font-medium text-gp-ink-muted dark:text-white/60">
        <span className="material-symbols-outlined text-[15px] leading-none text-gp-primary">
          link
        </span>
        <span className="min-w-0 truncate">Relationships worth recording</span>
      </p>

      {suggestions.map((suggestion, index) => {
        const decision = decisions[index] ?? 'pending'
        const name = (suggestion.name || '').trim() || 'this connection'
        const isChecked = decision === 'pending' && !!selected[index]
        return (
          <div
            key={`connection-${index}`}
            className="rounded-md border border-slate-200 bg-white/70 p-3 dark:border-white/10 dark:bg-black/20"
            data-testid="connection-suggestion-card"
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
                  backgroundColor:
                    'color-mix(in srgb, var(--gp-primary) 12%, transparent)',
                  borderColor:
                    'color-mix(in srgb, var(--gp-primary) 25%, transparent)',
                }}
              >
                <span className="material-symbols-outlined text-[18px] leading-none text-gp-primary">
                  link
                </span>
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className="truncate text-sm font-semibold text-gp-ink-strong dark:text-white">
                    {name}
                  </span>
                  <span className="shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-600 dark:bg-white/10 dark:text-slate-300">
                    connection
                  </span>
                </div>
                {suggestion.sourceSnippet ? (
                  <p className="mt-0.5 line-clamp-2 text-xs italic text-gp-ink-muted dark:text-white/50">
                    “{suggestion.sourceSnippet}”
                  </p>
                ) : null}

                {decision === 'pending' ? (
                  <label className="mt-2 block">
                    <span className="mb-1 block text-[11px] font-medium text-gp-ink-muted dark:text-white/55">
                      Your relationship
                    </span>
                    <textarea
                      rows={2}
                      value={whyEdits[index] ?? ''}
                      onChange={(e) =>
                        setWhyEdits((prev) => ({
                          ...prev,
                          [index]: e.target.value,
                        }))
                      }
                      placeholder="e.g. a wise friend who mirrors me"
                      className="w-full rounded-md border border-input bg-transparent px-2.5 py-1.5 text-xs text-gp-ink-strong outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:text-white"
                    />
                  </label>
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
                Connected
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
              ? `Connect ${selectedCount}`
              : 'Select connections to add'}
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
