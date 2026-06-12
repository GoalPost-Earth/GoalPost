'use client'

import { useState } from 'react'
import {
  useAssistantApi,
  useAssistantState,
  type ToolCallMessagePartComponent,
} from '@assistant-ui/react'
import { ApprovalEntityCard } from './approval-entity-card'
import { applyFieldEdits, entityKindLabel } from '@/lib/chat/approval-display'
import { useApprovalAction } from './approval-action-context'

/**
 * Generative HITL approval frontend (GOAL-261).
 *
 * Registered as the `tools.Fallback` renderer for every assistant tool-call
 * part. Read tools and already-executed writes render nothing — matching the
 * prior invisible-tool behavior. When a write tool returns the pending-approval
 * shape from src/lib/chat/hitl.ts (`approvalRequired: true`), this renders an
 * inline approval card so the user can approve, edit, or reject the proposed
 * change.
 *
 * On approve, the exact (tool, args) — with any inline edits merged in — is
 * queued as a one-shot `executeAction` and a fresh turn is sent. The backend
 * executes those args verbatim (it does NOT ask the model to re-emit a matching
 * tool call, which it does inconsistently — that was the approval loop). The
 * card only stays actionable while its message is the latest in the thread:
 * once the approval turn lands (or after a reload, where the proposal is no
 * longer last) it goes invisible, so a stale card can never re-fire a write.
 *
 * Rule 1 (kb/07): the card and confirmation copy never render raw ids,
 * __typename, approval hashes, or other internal artifacts.
 */

interface PendingApprovalShape {
  approvalRequired?: boolean
  approvalHash?: string
  tool?: string
  args?: Record<string, unknown>
  summary?: string
}

function isPendingApproval(result: unknown): result is PendingApprovalShape {
  if (!result || typeof result !== 'object') return false
  const r = result as PendingApprovalShape
  return r.approvalRequired === true && typeof r.approvalHash === 'string'
}

export const WriteApprovalToolPart: ToolCallMessagePartComponent = ({
  toolName,
  result,
}) => {
  const api = useAssistantApi()
  const approval = useApprovalAction()
  // Only the latest assistant turn carries a live proposal. Older proposals
  // (after approval, or re-hydrated on reload) must not stay actionable — that
  // is what let a reloaded card double-execute. assistant-ui recomputes this
  // the instant the approval turn is appended.
  const isLast = useAssistantState(({ message }) => message.isLast)
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>(
    'pending'
  )

  if (!isPendingApproval(result)) return null

  const tool = String(result.tool || toolName)
  const args = (result.args as Record<string, unknown>) || {}
  const approvalHash = String(result.approvalHash)
  const summary =
    typeof result.summary === 'string' && result.summary.trim()
      ? result.summary
      : `Approve this ${entityKindLabel(tool, args)}`

  if (status === 'approved') {
    return (
      <div className="mt-2 flex items-center gap-1.5 text-xs text-gp-ink-muted dark:text-white/50">
        <span className="material-symbols-outlined text-[15px] leading-none text-gp-resource">
          check_circle
        </span>
        Approved
      </div>
    )
  }

  if (status === 'rejected') {
    return (
      <div className="mt-2 flex items-center gap-1.5 text-xs text-gp-ink-muted dark:text-white/50">
        <span className="material-symbols-outlined text-[15px] leading-none">
          cancel
        </span>
        Dismissed
      </div>
    )
  }

  // Superseded proposal (a later turn exists). Stay invisible like any other
  // tool part — the model's narration already says what happened.
  if (!isLast) return null

  const sendApprovalTurn = (text: string): boolean => {
    try {
      const composer = api.thread().composer()
      composer.setText(text)
      composer.send()
      return true
    } catch (error) {
      console.warn(
        '[WriteApprovalToolPart] failed to send approval turn:',
        error
      )
      return false
    }
  }

  const handleApprove = (_hash: string, edits: Record<string, string>) => {
    // Merge inline edits onto the proposed args. Internal fields (contextId,
    // pulseType, …) are preserved by applyFieldEdits, and the backend executes
    // exactly this object — so edits actually take effect (no model round-trip).
    const mergedArgs = applyFieldEdits(args, edits)
    approval?.requestExecuteAction({ tool, args: mergedArgs })
    // A short, id-free user turn just carries the request; the server has the
    // exact args and narrates the result. Keep Rule 1 — no summary echo (some
    // summaries embed ids for delete/update-by-id tools).
    const sent = sendApprovalTurn('Approved — please go ahead.')
    if (sent) setStatus('approved')
  }

  const handleReject = () => {
    setStatus('rejected')
  }

  return (
    <div className="mt-2" data-testid="write-approval-card">
      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gp-ink-muted dark:text-white/60">
        <span className="material-symbols-outlined text-[15px] leading-none text-gp-goal">
          verified_user
        </span>
        Needs your approval
      </p>
      <ApprovalEntityCard
        approvalHash={approvalHash}
        tool={tool}
        args={args}
        summary={summary}
        defaultExpanded
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  )
}
