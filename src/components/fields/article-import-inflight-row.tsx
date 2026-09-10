'use client'

import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import {
  describeArticleImportProgress,
  type ArticleImportJobListItem,
} from '@/lib/imports/article-import'

/**
 * One running import, drawn identically wherever it appears.
 *
 * Extracted from `article-import-status-section.tsx` (GOAL-365) so the Import
 * Articles modal renders the field's other in-flight imports with the very
 * same component the field page uses. Before this the modal followed exactly
 * one job — whichever was submitted last — while the page listed them all, so
 * two concurrent imports made the two surfaces contradict each other: the
 * page showed "5 of 10 rows, 50%" beside the modal insisting "Queued". Both
 * were telling the truth about different jobs, which is the least useful kind
 * of correct.
 *
 * Sharing the row is the point. A second implementation would be free to
 * drift, and this is the second time these two surfaces have disagreed about
 * the same import — GOAL-357 was the first.
 */

/**
 * The narrowest shape this row needs, so it accepts both the list item the
 * field page polls and the single tracked job the modal holds. The tracked
 * job has no `createdAtMs` — it can be an optimistic frame painted from the
 * 202 before any poll has returned — so the queued-ago line is omitted rather
 * than faked.
 */
export type InFlightJobLike = Pick<
  ArticleImportJobListItem,
  'jobId' | 'status' | 'processedRows' | 'summary'
> &
  Partial<Pick<ArticleImportJobListItem, 'createdAtMs'>>

function relativeTime(epochMs: number | undefined): string | null {
  if (!epochMs) return null
  const date = new Date(epochMs)
  if (Number.isNaN(date.getTime())) return null
  return formatDistanceToNow(date, { addSuffix: true })
}

export function ArticleImportInFlightRow({ job }: { job: InFlightJobLike }) {
  // GOAL-357 — landed rows, not `status`, decide whether this reads as queued:
  // a job that yields on the cron run's time budget returns to PENDING with
  // its cursor intact, and calling that "Queued" threw away progress the
  // server already knew about.
  const { isQueued, label, icon, processedRows, totalRows, percent } =
    describeArticleImportProgress(job)
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
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-gp-ink-strong dark:text-white truncate">
            {label}
          </p>
          <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft truncate">
            {isQueued
              ? `${totalRows} row${totalRows === 1 ? '' : 's'} — importing starts shortly.`
              : `${processedRows} of ${totalRows} rows`}
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
        // Omitted while queued — a bar with no landed rows is indeterminate,
        // and announcing 0 would read as stalled rather than waiting.
        aria-valuenow={isQueued ? undefined : processedRows}
        aria-valuemin={0}
        aria-valuemax={Math.max(totalRows, 1)}
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
