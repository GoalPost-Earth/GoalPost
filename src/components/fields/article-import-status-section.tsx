'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { chatApiAuthHeaders } from '@/lib/simulation/conversation-thread-client'
import {
  ARTICLE_IMPORT_STATUS,
  FINISHED_JOB_RETENTION_DAYS,
  isArticleImportInFlight,
  type ArticleImportJobListItem,
  type ArticleImportJobStatus,
} from '@/lib/imports/article-import'
import { ImportSummaryChips, OutcomeRow } from './import-articles-preview'
import { useArticleImportJobList } from './use-article-import-job-list'

/**
 * GOAL-336 — durable article-import status on the FieldContext page.
 *
 * A queued bulk import used to be visible only inside the Import Articles
 * modal, recoverable only through a sessionStorage job id — invisible after a
 * tab close and gone entirely on another device. This section is the
 * server-driven surface: it lists every import this member queued for this
 * field (requester-scoped — a WeSpace peer's imports never appear), shows a
 * live meter while one runs, and keeps the finished receipt reachable for as
 * long as the job node is retained. Same reasoning as the document list's
 * ingest chip: a toast would not survive the reload that happens exactly when
 * someone goes looking for reassurance.
 *
 * Receipts expand in place — the per-row outcomes are fetched per job from
 * the status route only when opened, so listing stays cheap. There is no
 * dismissal: rows age out with the server's retention window, which keeps
 * this a pure read surface consistent across tabs and devices.
 *
 * Colors come from `gp-*` / shadcn tokens so the section re-tints across
 * light, dark, and every theme variant. State labels are body ink, not the
 * semantic color — tinted text on a 10%-alpha wash of the same token fails
 * WCAG AA (the `document-ingest-status-chip.tsx` finding).
 */

interface ArticleImportStatusSectionProps {
  fieldContextId: string
  /** Bump to refetch immediately — the page does when the import modal
   *  closes or reports landed rows. */
  refreshKey: number
  /** Called as a followed job lands rows, so the field fills in live. */
  onRowsLanded: () => void
}

interface ReceiptState {
  loading: boolean
  error: string | null
  receipt: ArticleImportJobStatus | null
}

function relativeTime(epochMs: number): string | null {
  if (!epochMs) return null
  const date = new Date(epochMs)
  if (Number.isNaN(date.getTime())) return null
  return formatDistanceToNow(date, { addSuffix: true })
}

export function ArticleImportStatusSection({
  fieldContextId,
  refreshKey,
  onRowsLanded,
}: ArticleImportStatusSectionProps) {
  const { jobs } = useArticleImportJobList({
    fieldContextId,
    refreshKey,
    onRowsLanded,
  })
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [receipts, setReceipts] = useState<Record<string, ReceiptState>>({})

  if (jobs.length === 0) return null

  const loadReceipt = async (jobId: string) => {
    setReceipts((current) => ({
      ...current,
      [jobId]: { loading: true, error: null, receipt: null },
    }))
    let next: ReceiptState
    try {
      const authHeaders = await chatApiAuthHeaders()
      const res = await fetch(
        `/api/import/articles/${encodeURIComponent(jobId)}`,
        { credentials: 'include', headers: authHeaders }
      )
      if (res.status === 404) {
        next = {
          loading: false,
          error: 'This receipt is no longer available.',
          receipt: null,
        }
      } else if (!res.ok) {
        throw new Error(`status ${res.status}`)
      } else {
        next = {
          loading: false,
          error: null,
          receipt: (await res.json()) as ArticleImportJobStatus,
        }
      }
    } catch {
      next = {
        loading: false,
        error: 'The receipt could not be loaded. Try again in a moment.',
        receipt: null,
      }
    }
    setReceipts((current) => ({ ...current, [jobId]: next }))
  }

  const handleToggle = (job: ArticleImportJobListItem) => {
    const opening = expandedId !== job.jobId
    setExpandedId(opening ? job.jobId : null)
    // Fetch on open unless a receipt is already cached or a fetch is already
    // in flight (a rapid close/reopen must not start a second request). A
    // previously errored attempt retries — re-reading is cheap.
    const state = receipts[job.jobId]
    if (opening && !state?.receipt && !state?.loading) {
      void loadReceipt(job.jobId)
    }
  }

  return (
    <div className="rounded-2xl border border-gp-glass-border bg-gp-glass-bg/40 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <span
          className="material-symbols-outlined text-gp-primary text-[20px]"
          aria-hidden="true"
        >
          newspaper
        </span>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gp-ink-strong dark:text-white">
          Article Imports
        </h2>
      </div>
      <ul className="space-y-2">
        {jobs.map((job) =>
          isArticleImportInFlight(job.status) ? (
            <InFlightRow key={job.jobId} job={job} />
          ) : (
            <ReceiptRow
              key={job.jobId}
              job={job}
              isExpanded={expandedId === job.jobId}
              receipt={receipts[job.jobId]}
              onToggle={() => handleToggle(job)}
            />
          )
        )}
      </ul>
      <p className="mt-3 text-[11px] text-gp-ink-muted dark:text-gp-ink-soft">
        Import receipts stay here for {FINISHED_JOB_RETENTION_DAYS} days after
        an import finishes.
      </p>
    </div>
  )
}

/**
 * A PENDING/PROCESSING job: state icon, row meter, progress bar. The whole
 * row is a live region so a screen reader hears Queued → Importing → gone,
 * plus the one number that shows the import is actually moving.
 */
function InFlightRow({ job }: { job: ArticleImportJobListItem }) {
  const isQueued = job.status === ARTICLE_IMPORT_STATUS.pending
  const total = Math.max(job.summary.totalRows, 1)
  const percent = Math.min(100, Math.round((job.processedRows / total) * 100))
  const queuedAgo = relativeTime(job.createdAtMs)

  return (
    <li className="rounded-xl border border-gp-glass-border bg-gp-glass-bg/40 px-3 py-2.5 min-w-0">
      <div role="status" className="flex items-center gap-2.5 min-w-0">
        <span
          className={cn(
            'material-symbols-outlined text-[18px] shrink-0',
            isQueued ? 'text-gp-ink-muted' : 'text-gp-primary animate-spin'
          )}
          aria-hidden="true"
        >
          {isQueued ? 'schedule' : 'autorenew'}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-gp-ink-strong dark:text-white truncate">
            {isQueued ? 'Queued' : 'Importing…'}
          </p>
          <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft truncate">
            {isQueued
              ? `${job.summary.totalRows} row${job.summary.totalRows === 1 ? '' : 's'} — importing starts shortly.`
              : `${job.processedRows} of ${job.summary.totalRows} rows`}
            {queuedAgo ? ` · queued ${queuedAgo}` : ''}
          </p>
        </div>
        {!isQueued && (
          <span className="text-xs font-bold text-gp-ink-strong shrink-0 tabular-nums">
            {percent}%
          </span>
        )}
      </div>
      <div
        className="mt-2 h-1 w-full overflow-hidden rounded-full bg-gp-ink-soft/20"
        role="progressbar"
        aria-valuenow={job.processedRows}
        aria-valuemin={0}
        aria-valuemax={job.summary.totalRows}
        aria-label="Rows imported"
      >
        <div
          className={cn(
            'h-full rounded-full bg-gp-primary transition-all duration-500',
            isQueued && 'opacity-40'
          )}
          style={{ width: isQueued ? '100%' : `${percent}%` }}
        />
      </div>
    </li>
  )
}

/**
 * A finished job. COMPLETE leads with the one-line batch summary; FAILED
 * leads with the member-safe `statusMessage` rendered as-is, plus how far the
 * import got — a failure is never a silent disappearance. Both expand into
 * the full per-row receipt, fetched on first open.
 */
function ReceiptRow({
  job,
  isExpanded,
  receipt,
  onToggle,
}: {
  job: ArticleImportJobListItem
  isExpanded: boolean
  receipt: ReceiptState | undefined
  onToggle: () => void
}) {
  const failed = job.status === ARTICLE_IMPORT_STATUS.failed
  const finishedAgo = relativeTime(job.statusUpdatedAtMs || job.createdAtMs)

  return (
    <li
      className={cn(
        'rounded-xl border min-w-0',
        failed
          ? 'border-destructive/30 bg-destructive/10'
          : 'border-gp-glass-border bg-gp-glass-bg/40'
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left cursor-pointer min-w-0"
      >
        <span
          className={cn(
            'material-symbols-outlined text-[18px] shrink-0 mt-0.5',
            failed
              ? 'text-destructive'
              : job.success
                ? 'text-gp-resource'
                : 'text-gp-ink-muted'
          )}
          aria-hidden="true"
        >
          {failed ? 'error' : job.success ? 'check_circle' : 'report'}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-gp-ink-strong dark:text-white break-words">
            {failed
              ? (job.statusMessage ??
                'This import could not be finished. Upload the remaining rows again.')
              : job.message}
          </p>
          <p className="mt-0.5 text-[11px] text-gp-ink-muted dark:text-gp-ink-soft">
            {failed
              ? `Stopped after ${job.processedRows} of ${job.summary.totalRows} row${job.summary.totalRows === 1 ? '' : 's'}.`
              : ''}
            {finishedAgo
              ? `${failed ? ' ' : ''}${failed ? 'Failed' : 'Finished'} ${finishedAgo}.`
              : ''}
          </p>
        </div>
        <span
          className={cn(
            'material-symbols-outlined text-[18px] shrink-0 text-gp-ink-muted transition-transform',
            isExpanded && 'rotate-180'
          )}
          aria-hidden="true"
        >
          expand_more
        </span>
      </button>

      {isExpanded && (
        <div className="border-t border-gp-glass-border px-3 py-3 space-y-2.5 min-w-0">
          {receipt?.loading && (
            <p
              role="status"
              className="flex items-center gap-2 text-[11px] text-gp-ink-muted dark:text-gp-ink-soft"
            >
              <span
                className="material-symbols-outlined text-[14px] animate-spin"
                aria-hidden="true"
              >
                progress_activity
              </span>
              Loading the receipt…
            </p>
          )}
          {receipt?.error && (
            <p role="alert" className="text-[11px] text-destructive">
              {receipt.error}
            </p>
          )}
          {receipt?.receipt && (
            <>
              <ImportSummaryChips summary={receipt.receipt.summary} />
              {receipt.receipt.outcomes.length > 0 && (
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {[...receipt.receipt.outcomes]
                    .sort(
                      (a, b) =>
                        (a.status === 'failed' ? 0 : 1) -
                          (b.status === 'failed' ? 0 : 1) || a.row - b.row
                    )
                    // Index in the key: corrupt outcomes all parse to a
                    // row-0 placeholder, and two of them must not collide.
                    .map((outcome, index) => (
                      <OutcomeRow
                        key={`out-${outcome.row}-${index}`}
                        outcome={outcome}
                      />
                    ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </li>
  )
}
