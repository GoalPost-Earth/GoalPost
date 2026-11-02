'use client'

import { useState, type ReactNode, type Ref } from 'react'
import {
  MAX_CONTACT_IMPORT_ROWS,
  type ContactImportResult,
  type ContactImportStatus,
  type ContactRowError,
} from '@/lib/imports/contact-import'
import {
  CONTACT_TEMPLATE_COLUMNS,
  CONTACT_TEMPLATE_SAMPLE_ROWS,
} from '@/lib/imports/contact-sources'

/**
 * Presentational pieces of the contact import modal (GOAL-382): the file
 * picker, the progress, and the results. Kept apart from the modal shell
 * so both stay under the 400-line component budget. Same visual language as
 * the article import (`import-articles-*`).
 */

function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

function downloadContactTemplate() {
  const csv = [CONTACT_TEMPLATE_COLUMNS, ...CONTACT_TEMPLATE_SAMPLE_ROWS]
    .map((row) => row.map(csvCell).join(','))
    .join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'contact-import-template.csv'
  anchor.click()
  URL.revokeObjectURL(url)
}

export function ContactsPicker({
  onFileSelected,
  children,
}: {
  onFileSelected: (file: File | null) => void
  /** Import settings, shown above the drop zone so they are set first. */
  children: ReactNode
}) {
  const [isDragging, setIsDragging] = useState(false)

  return (
    <>
      <p className="text-sm text-gp-ink-muted dark:text-gp-ink-soft shrink-0">
        Import people and organizations from your address book. Export your
        contacts as a vCard (.vcf) file, or as CSV from Outlook, Google Contacts
        or LinkedIn — or fill in the template below as a CSV or Excel sheet. The
        import starts as soon as you choose a file. Contacts already in this
        field are updated rather than added twice.
      </p>

      {children}

      <label
        htmlFor="import-contacts-file"
        onDragEnter={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={(event) => {
          if (event.currentTarget.contains(event.relatedTarget as Node)) return
          setIsDragging(false)
        }}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragging(false)
          onFileSelected(event.dataTransfer.files?.[0] ?? null)
        }}
        className={`shrink-0 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors cursor-pointer hover:border-gp-primary ${
          isDragging
            ? 'border-gp-primary bg-gp-primary/10 dark:bg-gp-primary/15'
            : 'border-gp-glass-border bg-gp-glass-bg/40'
        }`}
      >
        <span
          className={`material-symbols-outlined text-3xl transition-colors ${
            isDragging ? 'text-gp-primary' : 'text-gp-ink-muted'
          }`}
        >
          contacts
        </span>
        <span className="text-sm text-gp-ink-strong dark:text-white font-medium">
          {isDragging
            ? 'Drop to import'
            : 'Drag a contacts file here, or click to choose'}
        </span>
        <span className="text-xs text-gp-ink-muted">
          Accepts .vcf, .csv, Excel (.xlsx/.xls) and .json — up to{' '}
          {MAX_CONTACT_IMPORT_ROWS} contacts per import
        </span>
        <input
          id="import-contacts-file"
          type="file"
          aria-label="Choose a contacts file"
          accept=".vcf,.vcard,.csv,.xlsx,.xls,.json,text/vcard,text/csv,application/json,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          className="sr-only"
          onChange={(event) => {
            onFileSelected(event.target.files?.[0] ?? null)
            event.target.value = ''
          }}
        />
      </label>

      <button
        type="button"
        onClick={downloadContactTemplate}
        className="shrink-0 inline-flex items-center gap-1.5 self-start text-xs font-medium text-gp-primary hover:underline cursor-pointer"
      >
        <span className="material-symbols-outlined text-[14px]">download</span>
        Download the CSV template
      </button>
    </>
  )
}

/**
 * Reading the file, then sending its batches. Stop sits here rather than in the
 * dialog's footer because Done appears there when the import ends, and a late
 * click on Stop must not land on it and close the results.
 */
export function ContactsImporting({
  label,
  onStop,
  isStopping = false,
  stopButtonRef,
}: {
  label: string
  /** Absent while the file is still being read. */
  onStop?: () => void
  isStopping?: boolean
  stopButtonRef?: Ref<HTMLButtonElement>
}) {
  return (
    <div
      role="status"
      className="flex flex-col items-center gap-3 rounded-xl border border-gp-glass-border bg-gp-glass-bg/40 px-4 py-8 text-center"
    >
      <span className="material-symbols-outlined text-3xl text-gp-primary animate-spin">
        hourglass_bottom
      </span>
      <span className="text-sm font-medium text-gp-ink-strong dark:text-white">
        {label}
      </span>
      {onStop && (
        <button
          ref={stopButtonRef}
          type="button"
          onClick={onStop}
          aria-busy={isStopping}
          className="px-4 py-1.5 rounded-lg border border-gp-glass-border text-sm text-gp-ink-strong dark:text-white hover:bg-gp-glass-bg transition-colors cursor-pointer"
        >
          {isStopping ? 'Stopping…' : 'Stop importing'}
        </button>
      )}
    </div>
  )
}

export function ContactIssueCard({ error }: { error: ContactRowError }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive min-w-0">
      <span className="material-symbols-outlined text-[14px] shrink-0">
        error
      </span>
      <p className="min-w-0 break-words">
        <span className="font-semibold">#{error.row}</span> {error.message}
      </p>
    </div>
  )
}

/** Compact count chip — tinted by meaning, text kept in ink-safe colors. */
export function CountChip({
  icon,
  tone,
  children,
}: {
  icon: string
  tone: 'ready' | 'neutral' | 'issue'
  children: ReactNode
}) {
  const toneClass = {
    ready: 'border-gp-resource/30 bg-gp-resource/10',
    neutral: 'border-gp-glass-border bg-gp-glass-bg/40',
    issue: 'border-destructive/30 bg-destructive/10 text-destructive',
  }[tone]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium shrink-0 ${
        tone === 'issue' ? '' : 'text-gp-ink-strong dark:text-white'
      } ${toneClass}`}
    >
      <span className="material-symbols-outlined text-[14px]">{icon}</span>
      {children}
    </span>
  )
}

const STATUS_COPY: Record<
  ContactImportStatus,
  { label: string; icon: string }
> = {
  created: { label: 'Added', icon: 'person_add' },
  updated: { label: 'Updated', icon: 'sync' },
  linked: { label: 'Linked', icon: 'link' },
  skipped: { label: 'Skipped', icon: 'block' },
}

export function ContactsResults({
  result,
  issues,
  notImported,
  importFailed,
}: {
  result: ContactImportResult
  /** Rows the file parser rejected, which never reached the import. */
  issues: ContactRowError[]
  /** Rows not sent because the import stopped or a batch failed. */
  notImported: number
  /** After a failure some of those rows may still have been saved. */
  importFailed: boolean
}) {
  const { summary, outcomes } = result
  // Skipped rows first — they are the ones that need the member's attention.
  const ordered = [...outcomes].sort(
    (a, b) =>
      Number(b.status === 'skipped') - Number(a.status === 'skipped') ||
      a.row - b.row
  )
  return (
    <>
      <div role="status" className="flex flex-wrap items-center gap-2 shrink-0">
        <CountChip icon="person_add" tone="ready">
          {summary.created} added
        </CountChip>
        <CountChip icon="sync" tone="neutral">
          {summary.updated} updated
        </CountChip>
        {summary.linked > 0 && (
          <CountChip icon="link" tone="neutral">
            {summary.linked} linked
          </CountChip>
        )}
        {summary.skipped > 0 && (
          <CountChip icon="block" tone="issue">
            {summary.skipped} skipped
          </CountChip>
        )}
        {issues.length > 0 && (
          <CountChip icon="error" tone="issue">
            {issues.length} with issues
          </CountChip>
        )}
        {notImported > 0 && (
          <CountChip icon="do_not_disturb_on" tone="neutral">
            {notImported} {importFailed ? 'not confirmed' : 'not imported'}
          </CountChip>
        )}
      </div>
      <ul className="overflow-y-auto min-h-0 space-y-1.5 pr-1">
        {issues.map((issue) => (
          <li key={`issue-${issue.row}`}>
            <ContactIssueCard error={issue} />
          </li>
        ))}
        {ordered.map((outcome) => (
          <li
            key={outcome.row}
            className="flex items-start gap-2 rounded-xl border border-gp-glass-border bg-gp-glass-bg/40 px-3 py-2 text-xs min-w-0"
          >
            <span
              className={`material-symbols-outlined text-[14px] shrink-0 ${
                outcome.status === 'skipped'
                  ? 'text-destructive'
                  : 'text-gp-ink-muted'
              }`}
            >
              {STATUS_COPY[outcome.status].icon}
            </span>
            <div className="min-w-0">
              <p className="text-gp-ink-strong dark:text-white truncate">
                <span className="font-semibold">
                  {STATUS_COPY[outcome.status].label}
                </span>{' '}
                {outcome.name}
              </p>
              {outcome.message && (
                <p className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                  {outcome.message}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
