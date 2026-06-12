'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  entityKindLabel,
  getEditableFields,
  type EditableField,
} from '@/lib/chat/approval-display'

/**
 * One row inside the batch HITL Dialog (GOAL-237). Each pending tool call
 * becomes one card. The card is collapsed by default to keep the batch
 * dialog scannable; expanding reveals editable fields + per-entity Approve
 * / Reject controls.
 *
 * The card never renders raw ids, __typename, or approval hashes (Rule 1).
 * The parent dialog passes a pre-computed human-readable `summary` (from
 * describeWriteAction) plus the tool name and current args; the card maps
 * those to ordered editable fields via `getEditableFields`.
 */

export interface ApprovalEntityCardProps {
  /** Stable identifier so React can track state across re-renders. */
  approvalHash: string
  tool: string
  args: Record<string, unknown>
  summary: string
  /** Optional inline failure message (slice 2 partial-failure retry). */
  failureMessage?: string | null
  /**
   * Render expanded on mount. The batch dialog keeps rows collapsed for
   * scannability; the inline single-card variant (GOAL-261) passes `true`
   * so the Approve / Reject controls are visible without an extra click.
   */
  defaultExpanded?: boolean
  onApprove: (approvalHash: string, edits: Record<string, string>) => void
  onReject: (approvalHash: string) => void
}

export function ApprovalEntityCard({
  approvalHash,
  tool,
  args,
  summary,
  failureMessage,
  defaultExpanded = false,
  onApprove,
  onReject,
}: ApprovalEntityCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [edits, setEdits] = useState<Record<string, string>>({})

  const kindLabel = entityKindLabel(tool, args)
  const fields = getEditableFields(tool, args)
  const failed = Boolean(failureMessage && failureMessage.length > 0)

  const handleEdit = (fieldName: string, value: string) => {
    setEdits((prev) => ({ ...prev, [fieldName]: value }))
  }

  const currentValue = (f: EditableField) =>
    edits[f.fieldName] ?? f.value

  return (
    <div
      className={cn(
        'rounded-md border bg-white/70 dark:bg-black/20',
        failed
          ? 'border-red-300 dark:border-red-500/40'
          : 'border-slate-200 dark:border-white/10'
      )}
      data-testid="approval-entity-card"
    >
      <button
        type="button"
        className="w-full flex items-center gap-2 px-3 py-2 text-left"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
      >
        <span
          aria-hidden
          className={cn(
            'flex-none inline-block transition-transform text-slate-500',
            expanded ? 'rotate-90' : 'rotate-0'
          )}
        >
          ▶
        </span>
        <span className="flex-none rounded-full bg-slate-100 dark:bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-700 dark:text-slate-300">
          {kindLabel}
        </span>
        <span className="flex-1 truncate text-sm text-slate-800 dark:text-slate-100">
          {summary}
        </span>
      </button>

      {failed && (
        <div className="px-3 pb-2 -mt-1 text-xs text-red-700 dark:text-red-300">
          {failureMessage}
        </div>
      )}

      {expanded && (
        <div className="border-t border-slate-200 dark:border-white/10 px-3 py-3 space-y-3">
          {fields.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No editable fields for this action.
            </p>
          ) : (
            fields.map((f) => (
              <div key={f.fieldName} className="space-y-1">
                <Label htmlFor={`${approvalHash}-${f.fieldName}`} className="text-xs">
                  {f.label}
                </Label>
                {f.multiline ? (
                  <textarea
                    id={`${approvalHash}-${f.fieldName}`}
                    rows={3}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    value={currentValue(f)}
                    onChange={(e) => handleEdit(f.fieldName, e.target.value)}
                  />
                ) : (
                  <Input
                    id={`${approvalHash}-${f.fieldName}`}
                    value={currentValue(f)}
                    onChange={(e) => handleEdit(f.fieldName, e.target.value)}
                  />
                )}
              </div>
            ))
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              size="sm"
              className="h-8"
              onClick={() => onApprove(approvalHash, edits)}
            >
              {failed ? 'Retry' : 'Approve'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8"
              onClick={() => onReject(approvalHash)}
            >
              Reject
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
