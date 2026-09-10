'use client'

import {
  describeArticleImportProgress,
  type ArticleImportJobListItem,
  type ArticleImportJobStatus,
} from '@/lib/imports/article-import'
import { ArticleImportInFlightRow } from './article-import-inflight-row'

/**
 * GOAL-326 — the in-flight half of the article import modal.
 *
 * Importing is asynchronous now: the request returns 202 and a cron worker
 * mints the pulses, so this panel is what the member watches instead of a
 * spinner on a blocked request. It has to answer three questions at a glance —
 * has it started, how far has it got, and is it stuck — which is why the
 * queued and importing states read differently rather than sharing one
 * indeterminate spinner.
 *
 * GOAL-357 — which of the two shows is decided by
 * `describeArticleImportProgress`, on landed rows rather than on `status`. A
 * job that yields on the cron run's time budget goes back to `PENDING` with
 * its cursor intact, so keying "Queued" off the status alone rewound a
 * half-finished import to a blank panel between ticks. The shared helper is
 * also what keeps this panel and the field-context status section from
 * describing the same job differently.
 *
 * Colors come from `gp-*` / shadcn tokens so the panel re-tints across light,
 * dark, and every theme variant. The label beside the state icon is ink, not
 * the semantic color: tinted text on a 10%-alpha wash of the same token fails
 * WCAG AA (the same finding as `document-ingest-status-chip.tsx`).
 */

interface ImportArticlesProgressProps {
  job: ArticleImportJobStatus
  /**
   * GOAL-365: the field's OTHER in-flight imports, excluding `job`.
   *
   * This panel used to speak for the one job the modal tracks — whichever was
   * submitted last — while the field page listed every one. Start two imports
   * into a field and the surfaces contradicted each other: the page reading
   * "5 of 10 rows · 50%" beside this panel insisting "Queued". Both were
   * describing real jobs; neither said there was more than one.
   *
   * `job` stays first and keeps the fuller treatment because it is the import
   * this member just started — and because it can be an optimistic frame
   * painted straight from the 202, before the list poll has caught up. The
   * rest are drawn with the field page's own row component.
   */
  otherJobs?: ArticleImportJobListItem[]
}

export function ImportArticlesProgress({
  job,
  otherJobs = [],
}: ImportArticlesProgressProps) {
  const { isQueued, label, icon, processedRows, totalRows, percent } =
    describeArticleImportProgress(job)

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
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gp-ink-strong truncate">
            {label}
          </p>
          <p className="text-xs text-gp-ink-muted dark:text-gp-ink-soft">
            {isQueued
              ? 'Your rows are in the queue — importing starts shortly.'
              : `${processedRows} of ${totalRows} rows`}
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
        // An indeterminate progressbar signals itself by OMITTING valuenow:
        // the queued track is painted full, and announcing "0" beside it would
        // be this ticket's own defect in another modality.
        aria-valuenow={isQueued ? undefined : processedRows}
        aria-valuemin={0}
        aria-valuemax={Math.max(totalRows, 1)}
        aria-label="Rows imported"
      >
        {/* Queued fills the track at low opacity rather than showing a real
            meter — the same indeterminate treatment the field-context status
            section uses, so one import never reads two ways. */}
        <div
          className={`h-full rounded-full bg-gp-primary transition-all duration-500 ${
            isQueued ? 'opacity-40' : ''
          }`}
          style={{ width: isQueued ? '100%' : `${percent}%` }}
        />
      </div>

      <p className="mt-3 text-[11px] text-gp-ink-muted dark:text-gp-ink-soft">
        You can close this — the import keeps running, and reopening Import
        Articles brings you back to it.
      </p>

      {otherJobs.length > 0 && (
        <div className="mt-4 border-t border-gp-glass-border pt-3">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-gp-ink-muted">
            Also running in this field ({otherJobs.length})
          </p>
          {/* Deliberately the field page's own row, not a copy of it: these two
              surfaces have now disagreed about the same import twice, and a
              second implementation would be free to drift a third time. */}
          <ul className="space-y-2">
            {otherJobs.map((other) => (
              <ArticleImportInFlightRow key={other.jobId} job={other} />
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

/**
 * The beat before the progress panel: the hook is still asking whether an
 * import is already running for this field (sessionStorage, then the server).
 *
 * It exists so the modal has something honest to show that is not the file
 * picker. "No import is running" is a claim the drop zone makes implicitly,
 * and making it before the answer is in is how a reopen — or a second tab,
 * where sessionStorage is empty — flashed a fresh drop zone over an import
 * that was already half done (GOAL-357).
 */
export function ImportArticlesRecovering() {
  return (
    <div
      role="status"
      className="shrink-0 flex items-center gap-3 rounded-xl border border-gp-glass-border bg-gp-glass-bg/40 p-4 sm:p-5"
    >
      <span
        className="material-symbols-outlined text-xl shrink-0 text-gp-primary animate-spin"
        aria-hidden="true"
      >
        progress_activity
      </span>
      <p className="text-sm text-gp-ink-muted dark:text-gp-ink-soft min-w-0">
        Checking whether an import is already running…
      </p>
    </div>
  )
}
