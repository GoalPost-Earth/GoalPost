'use client'

import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ApprovalEntityCard } from './approval-entity-card'

/**
 * Batch HITL Dialog (GOAL-237). Renders one Dialog grouping every pending
 * pre-staged tool call from a doc-ingestion synthesized turn. The user can:
 *
 * - Expand any entity to see its editable fields.
 * - Approve or Reject individually.
 * - Click "Approve all" to submit everything that isn't rejected, applying
 *   any inline edits.
 *
 * Partial failures (one entity fails its runtime exec) are surfaced inline
 * on the failing card with a Retry button; the rest stay approved.
 *
 * All copy is human-readable per kb/07-ai-assistant-ux.md Rule 1 — no raw
 * ids, no __typename, no internal flags.
 */

export interface BatchPendingApproval {
  approvalHash: string
  tool: string
  args: Record<string, unknown>
  summary: string
  failureMessage?: string | null
}

export interface ApprovalBatchDialogProps {
  open: boolean
  pendingApprovals: BatchPendingApproval[]
  onOpenChange: (open: boolean) => void
  /** Approve every non-rejected approval at once, applying per-entity edits. */
  onApproveAll: (
    approvals: Array<{
      approvalHash: string
      tool: string
      args: Record<string, unknown>
    }>
  ) => void
  /** Approve a single entity inline (used from each card). */
  onApproveOne: (
    approvalHash: string,
    edits: Record<string, string>
  ) => void
  /** Remove an entity from the batch. */
  onReject: (approvalHash: string) => void
  /** Optional override label, useful when the count is zero (mid-transition). */
  countLabel?: string
}

export function ApprovalBatchDialog({
  open,
  pendingApprovals,
  onOpenChange,
  onApproveAll,
  onApproveOne,
  onReject,
  countLabel,
}: ApprovalBatchDialogProps) {
  const count = pendingApprovals.length

  const headerCopy = useMemo(() => {
    if (countLabel) return countLabel
    if (count === 0) return 'No pending changes'
    if (count === 1) return 'Approve 1 proposed change'
    return `Approve ${count} proposed changes`
  }, [count, countLabel])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg max-h-[85vh] flex flex-col p-0 gap-0"
        data-testid="approval-batch-dialog"
      >
        <DialogHeader className="px-6 pt-6 pb-3">
          <DialogTitle>{headerCopy}</DialogTitle>
          <DialogDescription>
            Review each one. Expand to edit fields before approving, or reject
            anything you don&apos;t want. Approve all submits the rest.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-2">
          {count === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-4">
              Nothing left to approve.
            </p>
          ) : (
            <div className="space-y-2">
              {pendingApprovals.map((p) => (
                <ApprovalEntityCard
                  key={p.approvalHash}
                  approvalHash={p.approvalHash}
                  tool={p.tool}
                  args={p.args}
                  summary={p.summary}
                  failureMessage={p.failureMessage ?? null}
                  onApprove={onApproveOne}
                  onReject={onReject}
                />
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="px-6 pb-6 pt-3 border-t border-slate-200 dark:border-white/10 flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="w-full sm:w-auto"
            disabled={count === 0}
            onClick={() =>
              onApproveAll(
                pendingApprovals.map((p) => ({
                  approvalHash: p.approvalHash,
                  tool: p.tool,
                  args: p.args,
                }))
              )
            }
          >
            Approve all
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
