'use client'

import { useState, useTransition, type FC } from 'react'
import { updateFeedbackStatusAction } from '@/app/dev/ai-quality/actions'
import type { AssistantFeedbackStatus } from '@/lib/feedback/assistant-feedback.service'

interface FeedbackStatusPickerProps {
  feedbackId: string
  currentStatus: AssistantFeedbackStatus
  /** Existing note to seed the textbox with (may be null). */
  currentNote: string | null
}

const STATUS_OPTIONS: {
  value: AssistantFeedbackStatus
  label: string
  className: string
}[] = [
  {
    value: 'open',
    label: 'Open',
    className:
      'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white',
  },
  {
    value: 'in_progress',
    label: 'In progress',
    className:
      'bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-500/20 dark:hover:bg-blue-500/30 dark:text-blue-200',
  },
  {
    value: 'resolved',
    label: 'Resolved',
    className:
      'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 dark:text-emerald-200',
  },
]

/**
 * Per-row status picker on /dev/ai-quality. Three pill-buttons + an
 * optional note. Submits via the `updateFeedbackStatusAction` server
 * action — no client GraphQL/REST roundtrip.
 *
 * The component is optimistic about the click: it sets the local
 * `pending` value immediately so the active pill changes color before
 * the server returns. If the action throws (network blip, etc.) the
 * value snaps back when the page re-renders.
 */
export const FeedbackStatusPicker: FC<FeedbackStatusPickerProps> = ({
  feedbackId,
  currentStatus,
  currentNote,
}) => {
  const [note, setNote] = useState(currentNote ?? '')
  const [pendingStatus, setPendingStatus] =
    useState<AssistantFeedbackStatus | null>(null)
  const [isPending, startTransition] = useTransition()

  const activeStatus = pendingStatus ?? currentStatus

  const submit = (status: AssistantFeedbackStatus) => {
    setPendingStatus(status)
    const formData = new FormData()
    formData.set('feedbackId', feedbackId)
    formData.set('status', status)
    formData.set('statusNote', note)
    startTransition(async () => {
      try {
        await updateFeedbackStatusAction(formData)
      } catch (error) {
        console.warn(
          '[FeedbackStatusPicker] failed to update:',
          error instanceof Error ? error.message : error
        )
        setPendingStatus(null)
      }
    })
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {STATUS_OPTIONS.map((opt) => {
          const isActive = activeStatus === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              disabled={isPending}
              onClick={() => submit(opt.value)}
              className={
                'h-6 px-2 text-[11px] rounded font-medium transition-colors disabled:opacity-50 ' +
                (isActive
                  ? 'ring-1 ring-gp-primary/60 ' + opt.className
                  : opt.className + ' opacity-70')
              }
            >
              {opt.label}
              {isActive && isPending ? ' …' : ''}
            </button>
          )
        })}
      </div>
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Optional note (e.g. fixed in 9d7bd9f, or: wontfix — accepted limitation)"
        maxLength={500}
        className="w-full px-2.5 py-1 text-xs bg-white/60 dark:bg-white/5 border border-gp-glass-border rounded text-gp-ink-strong dark:text-white placeholder-gp-ink-soft dark:placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-gp-primary/40"
      />
      <p className="text-[10px] text-gp-ink-soft dark:text-white/40">
        Pick a status — the note saves with the next status change. Resolved
        rows are hidden from the default view (use the &quot;Show resolved&quot;
        filter to see them).
      </p>
    </div>
  )
}
