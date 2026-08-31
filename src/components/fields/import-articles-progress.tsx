'use client'

import {
  ARTICLE_IMPORT_STATUS,
  type ArticleImportJobStatus,
} from '@/lib/imports/article-import'

/**
 * GOAL-326 — the in-flight half of the article import modal.
 *
 * Importing is asynchronous now: the request returns 202 and a cron worker
 * mints the pulses, so this panel is what the member watches instead of a
 * spinner on a blocked request. It has to answer three questions at a glance —
 * has it started, how far has it got, and is it stuck — which is why the
 * queued and processing states read differently rather than sharing one
 * indeterminate spinner.
 *
 * Colors come from `gp-*` / shadcn tokens so the panel re-tints across light,
 * dark, and every theme variant. The label beside the state icon is ink, not
 * the semantic color: tinted text on a 10%-alpha wash of the same token fails
 * WCAG AA (the same finding as `document-ingest-status-chip.tsx`).
 */

interface ImportArticlesProgressProps {
  job: ArticleImportJobStatus
}

export function ImportArticlesProgress({ job }: ImportArticlesProgressProps) {
  const isQueued = job.status === ARTICLE_IMPORT_STATUS.pending
  const total = Math.max(job.summary.totalRows, 1)
  const percent = Math.min(100, Math.round((job.processedRows / total) * 100))

  return (
    <div className="shrink-0 rounded-xl border border-gp-glass-border bg-gp-glass-bg/40 p-4 sm:p-5">
      {/* The live region wraps the label AND the row counter. With role="status"
          on the label alone, a screen reader hears "Queued → Importing…" but
          never the progress — a progressbar is not a live region, so the one
          number that shows the import is actually moving would go unannounced. */}
      <div role="status" className="flex items-center gap-3 min-w-0">
        <span
          className={`material-symbols-outlined text-xl shrink-0 ${
            isQueued ? 'text-gp-ink-muted' : 'text-gp-primary animate-spin'
          }`}
          aria-hidden="true"
        >
          {isQueued ? 'schedule' : 'autorenew'}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gp-ink-strong truncate">
            {isQueued ? 'Queued' : 'Importing…'}
          </p>
          <p className="text-xs text-gp-ink-muted dark:text-gp-ink-soft">
            {isQueued
              ? 'Your rows are in the queue — importing starts shortly.'
              : `${job.processedRows} of ${job.summary.totalRows} rows`}
          </p>
        </div>
        {!isQueued && (
          <span className="text-sm font-bold text-gp-ink-strong shrink-0 tabular-nums">
            {percent}%
          </span>
        )}
      </div>

      <div
        className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gp-ink-soft/20"
        role="progressbar"
        aria-valuenow={job.processedRows}
        aria-valuemin={0}
        aria-valuemax={job.summary.totalRows}
        aria-label="Rows imported"
      >
        <div
          className="h-full rounded-full bg-gp-primary transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="mt-3 text-[11px] text-gp-ink-muted dark:text-gp-ink-soft">
        You can close this — the import keeps running, and reopening Import
        Articles brings you back to it.
      </p>
    </div>
  )
}
