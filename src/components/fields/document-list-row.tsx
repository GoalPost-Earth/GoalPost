'use client'

import { cn } from '@/lib/utils'
import { emitOpenAssistantThread } from '@/lib/simulation/assistant-panel-events'
import {
  DocumentIngestStatusChip,
  isDocumentIngestInFlight,
} from './document-ingest-status-chip'

/**
 * One row of the FieldContext document list (GOAL-241), plus its expandable
 * detail: summary, concepts, hint, extracted people/pulses, and every ingest
 * thread the document has been processed in.
 *
 * Split out of `document-list.tsx` when the asynchronous-ingest status surface
 * (GOAL-292) pushed that file past the 400-line component limit. The list owns
 * data + mutations; this file owns the presentation of a single document.
 */

export type DocumentIngestThreadRecord = {
  id: string
  title: string
  createdAt: string
}

export type DocumentExtractedPersonRecord = {
  id: string
  firstName: string
  lastName: string
}

export type DocumentExtractedPulseRecord = {
  __typename?: string | null
  id: string
  title: string
}

export type DocumentRecord = {
  id: string
  filename: string
  mimeType: string
  sizeBytes: number
  pageCount?: number | null
  userHint?: string | null
  summary?: string | null
  concepts?: string[] | null
  uploadedAt: string
  extractedPeople?: DocumentExtractedPersonRecord[] | null
  extractedPulses?: DocumentExtractedPulseRecord[] | null
  ingestThreads?: DocumentIngestThreadRecord[] | null
  /** Ingest lifecycle (GOAL-292). Absent on documents uploaded before it. */
  status?: string | null
  statusMessage?: string | null
  ingestCreatedEntityCount?: number | null
  ingestFailedEntityCount?: number | null
}

function formatDate(value: string | null | undefined): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function pulseKindLabel(typename: string | null | undefined): string {
  if (!typename) return 'Pulse'
  if (typename === 'GoalPulse') return 'Goal'
  if (typename === 'ResourcePulse') return 'Resource'
  if (typename === 'StoryPulse') return 'Story'
  if (typename === 'CarePulse') return 'Care'
  if (typename === 'CoreValuePulse') return 'Core value'
  return 'Pulse'
}

export interface DocumentRowProps {
  document: DocumentRecord
  isExpanded: boolean
  isReExtracting: boolean
  isDeleting: boolean
  onToggleExpand: () => void
  onReExtract: () => void
  onDelete: () => void
}

export function DocumentRow({
  document,
  isExpanded,
  isReExtracting,
  isDeleting,
  onToggleExpand,
  onReExtract,
  onDelete,
}: DocumentRowProps) {
  const people = document.extractedPeople ?? []
  const pulses = document.extractedPulses ?? []
  const threads = document.ingestThreads ?? []
  const sizeKb = (document.sizeBytes / 1024).toFixed(1)
  const uploaded = formatDate(document.uploadedAt)
  // While the first ingest pass is queued or running, a Re-extract would put a
  // second pipeline on the same document — both writing its summary, page count
  // and a thread. Block it until the worker reaches a terminal status.
  const inFlight = isDocumentIngestInFlight(document.status)

  return (
    <li className="rounded-xl border border-gp-glass-border bg-white/50 dark:bg-white/5 transition-colors">
      {/* Stacks below `lg:`. The metadata + action cluster is `shrink-0` and its
          min-content width (~305-345px) alone exceeds the row's content box at
          390px, which collapsed the `flex-1 min-w-0` filename button to ZERO
          width — the filename had been invisible on phones since before this
          component existed, and the status chip then painted over the metadata.
          Giving each a full-width line fixes both.
          The breakpoint is `lg:`, not `sm:`: at 768-1023px the `md:` sidebar
          claims width and the one-line layout collapses the filename all over
          again (measured 0px, chip overlapping the metadata by 54-77px). One
          line is only safe once the content area is genuinely wide. */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-1.5 lg:gap-3 px-3 py-2">
        <button
          type="button"
          onClick={onToggleExpand}
          aria-expanded={isExpanded}
          className="flex w-full lg:w-auto lg:flex-1 min-w-0 items-center gap-2 text-left text-sm text-gp-ink-strong dark:text-white hover:text-gp-primary transition-colors cursor-pointer"
        >
          <span
            className={cn(
              'material-symbols-outlined text-[18px] text-gp-ink-muted transition-transform',
              isExpanded && 'rotate-90'
            )}
            aria-hidden="true"
          >
            chevron_right
          </span>
          <span className="truncate font-medium" title={document.filename}>
            {document.filename}
          </span>
          <DocumentIngestStatusChip
            status={document.status}
            statusMessage={document.statusMessage}
          />
        </button>
        <div className="flex w-full lg:w-auto items-center justify-between lg:justify-end gap-2 lg:gap-3 lg:shrink-0 pl-6 lg:pl-0">
          <span className="min-w-0 truncate lg:whitespace-nowrap text-xs text-gp-ink-muted">
            {sizeKb} KB
            {typeof document.pageCount === 'number' && document.pageCount > 0
              ? ` · ${document.pageCount} ${document.pageCount === 1 ? 'page' : 'pages'}`
              : ''}
            {uploaded ? ` · ${uploaded}` : ''}
          </span>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onReExtract()
            }}
            disabled={isReExtracting || isDeleting || inFlight}
            title={
              inFlight
                ? 'This document is still being read — re-extract will be available once it finishes.'
                : undefined
            }
            className="shrink-0 rounded-full px-2.5 lg:px-3 py-1 text-xs font-medium border border-amber-500/50 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isReExtracting ? 'Re-extracting…' : 'Re-extract'}
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onDelete()
            }}
            disabled={isDeleting || isReExtracting}
            aria-label={`Delete ${document.filename}`}
            title="Delete document (extracted entities are kept)"
            className="shrink-0 rounded-full px-2.5 lg:px-3 py-1 text-xs font-medium border border-red-500/50 text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gp-glass-border px-4 py-3 space-y-3 text-xs">
          {/* A failed ingest must read as a real, actionable error rather than
              an empty detail panel (GOAL-292). `statusMessage` is written by
              the worker as member-safe copy, so it renders verbatim. */}
          {document.status === 'FAILED' && (
            /* Same reasoning as the chip: destructive text on a destructive 10%
               wash measured 3.88:1 in light mode. The icon and border carry the
               error; the message itself is body ink. */
            <div
              role="alert"
              className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-gp-ink-strong dark:text-white"
            >
              <div className="flex items-start gap-2">
                <span
                  className="material-symbols-outlined text-[16px] shrink-0 text-destructive"
                  aria-hidden="true"
                >
                  error
                </span>
                <p className="min-w-0">
                  {document.statusMessage ??
                    'We could not read this document. Try re-extracting it, or upload the file again.'}
                </p>
              </div>
            </div>
          )}

          {isDocumentIngestInFlight(document.status) && (
            <p className="text-gp-ink-muted">
              {document.status === 'PROCESSING'
                ? 'Reading this document now — extracted people and pulses will appear here when it finishes.'
                : 'Queued for extraction. This usually starts within a minute.'}
            </p>
          )}

          {document.summary && (
            <div>
              <div className="font-semibold uppercase tracking-wide text-gp-ink-muted mb-1">
                Summary
              </div>
              <p className="text-sm leading-relaxed text-gp-ink-strong dark:text-white">
                {document.summary}
              </p>
            </div>
          )}

          {document.concepts && document.concepts.length > 0 && (
            <div>
              <div className="font-semibold uppercase tracking-wide text-gp-ink-muted mb-1">
                Concepts
              </div>
              <ul className="flex flex-wrap gap-1.5">
                {document.concepts.map((concept) => (
                  <li
                    key={concept}
                    className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-amber-700 dark:text-amber-300"
                  >
                    {concept}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {document.userHint && (
            <div>
              <div className="font-semibold uppercase tracking-wide text-gp-ink-muted mb-1">
                Hint
              </div>
              <p className="text-gp-ink-strong dark:text-white">
                {document.userHint}
              </p>
            </div>
          )}

          <div>
            <div className="font-semibold uppercase tracking-wide text-gp-ink-muted mb-1">
              Extracted people {people.length > 0 ? `(${people.length})` : ''}
            </div>
            {people.length === 0 ? (
              <p className="text-gp-ink-muted">
                None yet — extracted people appear here once this document has
                been read.
              </p>
            ) : (
              <ul className="flex flex-wrap gap-1.5">
                {people.map((person) => {
                  const display =
                    `${person.firstName ?? ''} ${person.lastName ?? ''}`.trim() ||
                    'Person'
                  return (
                    <li
                      key={person.id}
                      className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-emerald-700 dark:text-emerald-300"
                    >
                      {display}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <div>
            <div className="font-semibold uppercase tracking-wide text-gp-ink-muted mb-1">
              Extracted pulses {pulses.length > 0 ? `(${pulses.length})` : ''}
            </div>
            {pulses.length === 0 ? (
              <p className="text-gp-ink-muted">None yet.</p>
            ) : (
              <ul className="flex flex-wrap gap-1.5">
                {pulses.map((pulse) => (
                  <li
                    key={pulse.id}
                    className="rounded-full bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 text-blue-700 dark:text-blue-300"
                    title={pulse.title || undefined}
                  >
                    <span className="font-semibold mr-1">
                      {pulseKindLabel(pulse.__typename)}
                    </span>
                    <span className="truncate inline-block max-w-[180px] align-bottom">
                      {pulse.title}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <div className="font-semibold uppercase tracking-wide text-gp-ink-muted mb-1">
              Ingest threads ({threads.length})
            </div>
            {threads.length === 0 ? (
              <p className="text-gp-ink-muted">
                No threads recorded for this document.
              </p>
            ) : (
              <ul className="space-y-1">
                {threads.map((thread) => (
                  <li
                    key={thread.id}
                    className="flex items-center justify-between gap-2"
                  >
                    <button
                      type="button"
                      onClick={() => emitOpenAssistantThread(thread.id)}
                      className="text-gp-primary hover:underline truncate text-left flex-1 cursor-pointer"
                      title={thread.title}
                    >
                      {thread.title}
                    </button>
                    <span className="text-gp-ink-muted whitespace-nowrap">
                      {formatDate(thread.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </li>
  )
}
