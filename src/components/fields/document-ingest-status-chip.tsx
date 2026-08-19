'use client'

import { cn } from '@/lib/utils'

/**
 * Ingest lifecycle badge for a Document (GOAL-292).
 *
 * Ingestion is asynchronous — the upload route answers 202 and a cron worker
 * does the extraction — so the document list is the durable place a member sees
 * where their upload got to. A toast alone would not survive a page reload
 * mid-ingest, which is exactly when someone goes looking for reassurance.
 *
 * COMPLETE renders nothing: a finished document is the resting state, and a
 * "Complete" badge on every historical row would be noise. Only in-flight and
 * failed states earn pixels.
 *
 * Colors come from `gp-*` / shadcn tokens so the chip re-tints across light,
 * dark, and every theme variant.
 *
 * The LABEL is an ink token, not the semantic color. Tinting text with the same
 * token as its 10%-alpha background fails WCAG AA — measured 3.4:1 for
 * primary-on-primary/10 in default light and 1.54:1 in `theme-warm`, where
 * `#ffc233` on a yellow wash is effectively invisible. The state still reads at
 * a glance from the colored icon and border; only the word is rendered in body
 * ink, which is guaranteed legible in every mode and theme.
 */

interface DocumentIngestStatusChipProps {
  status: string | null | undefined
  /** Member-safe copy from the worker; shown as the chip's tooltip on FAILED. */
  statusMessage?: string | null
  className?: string
}

export function isDocumentIngestInFlight(
  status: string | null | undefined
): boolean {
  return status === 'PENDING' || status === 'PROCESSING'
}

export function DocumentIngestStatusChip({
  status,
  statusMessage,
  className,
}: DocumentIngestStatusChipProps) {
  // Treat an absent status as finished: documents uploaded before GOAL-292
  // carry no status property, and they are completed uploads.
  if (!status || status === 'COMPLETE') return null

  // role="status" so a screen reader announces Queued → Extracting → gone as
  // the worker progresses; the chip is the only signal that anything changed.
  // text-xs at every width: 10px puts the label in AA's "normal text" bucket,
  // exactly the size at which these tints cannot pass.
  const base =
    'inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium text-gp-ink-strong dark:text-white'

  if (status === 'FAILED') {
    return (
      <span
        role="status"
        className={cn(
          base,
          'border-destructive/40 bg-destructive/10',
          className
        )}
        title={statusMessage ?? 'This document could not be read.'}
      >
        <span
          className="material-symbols-outlined text-[13px] text-destructive"
          aria-hidden="true"
        >
          error
        </span>
        Failed
      </span>
    )
  }

  const isProcessing = status === 'PROCESSING'
  return (
    <span
      role="status"
      className={cn(
        base,
        isProcessing
          ? 'border-gp-primary/40 bg-gp-primary/10'
          : 'border-gp-ink-muted/30 bg-gp-ink-muted/10',
        className
      )}
      title={
        isProcessing
          ? 'Reading this document and extracting entities.'
          : 'Queued — extraction starts shortly.'
      }
    >
      <span
        className={cn(
          'material-symbols-outlined text-[13px]',
          isProcessing ? 'text-gp-primary animate-spin' : 'text-gp-ink-muted'
        )}
        aria-hidden="true"
      >
        {isProcessing ? 'autorenew' : 'schedule'}
      </span>
      {isProcessing ? 'Extracting' : 'Queued'}
    </span>
  )
}
