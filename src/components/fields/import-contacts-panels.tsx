'use client'

import { useState, type ReactNode } from 'react'
import { ORGANIZATION_CONFIG } from '@/lib/pulse-type-config'
import {
  MAX_CONTACT_IMPORT_ROWS,
  contactDisplayName,
  type ContactImportResult,
  type ContactImportStatus,
  type ContactKind,
  type ContactRecord,
  type ContactRowError,
} from '@/lib/imports/contact-import'
import {
  CONTACT_TEMPLATE_COLUMNS,
  CONTACT_TEMPLATE_SAMPLE_ROWS,
} from '@/lib/imports/contact-sources'

/**
 * Presentational pieces of the contact import modal (GOAL-382): the file
 * picker, the preview rows, and the results. Kept apart from the modal shell
 * so both stay under the 400-line component budget. Same visual language as
 * the article import (`import-articles-*`).
 */

const KIND_ICON: Record<ContactKind, string> = {
  person: 'person',
  organization: ORGANIZATION_CONFIG.icon,
}

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
}: {
  onFileSelected: (file: File | null) => void
}) {
  const [isDragging, setIsDragging] = useState(false)

  return (
    <>
      <p className="text-sm text-gp-ink-muted dark:text-gp-ink-soft shrink-0">
        Import people and organizations from your address book. Export your
        contacts as a vCard (.vcf) file, or as CSV from Outlook, Google Contacts
        or LinkedIn — or fill in the template below as a CSV or Excel sheet.
        Contacts already in this field are updated rather than added twice.
      </p>

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
        className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors cursor-pointer hover:border-gp-primary ${
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
            ? 'Drop to preview'
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
        className="inline-flex items-center gap-1.5 self-start text-xs font-medium text-gp-primary hover:underline cursor-pointer"
      >
        <span className="material-symbols-outlined text-[14px]">download</span>
        Download the CSV template
      </button>
    </>
  )
}

/** One metadata line under a contact's name — label stays, value truncates. */
function DetailLine({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <div className="mt-0.5 flex items-center gap-1 text-[10px] text-gp-ink-muted dark:text-gp-ink-soft min-w-0">
      <span className="material-symbols-outlined text-[12px] shrink-0">
        {icon}
      </span>
      <span className="truncate">{children}</span>
    </div>
  )
}

/**
 * One previewed contact, with the tick box that decides whether it is
 * imported. The whole card is the label, so a tap anywhere toggles it — on a
 * phone the box alone is a small target. Unticked cards dim but stay in place,
 * so the member can see what they left out.
 */
export function ContactRowCard({
  record,
  selected,
  onToggle,
}: {
  record: ContactRecord
  selected: boolean
  onToggle: () => void
}) {
  const affiliation = [record.jobTitle, record.organization]
    .filter(Boolean)
    .join(' · ')
  const name = contactDisplayName(record)
  return (
    <label
      className={`flex items-start gap-2.5 rounded-xl border px-3 py-2 min-w-0 cursor-pointer transition-colors ${
        selected
          ? 'border-gp-glass-border bg-gp-glass-bg/40'
          : 'border-dashed border-gp-glass-border bg-transparent opacity-70'
      }`}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggle}
        aria-label={`Import ${name}`}
        className="mt-0.5 size-4 shrink-0 cursor-pointer accent-gp-primary"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] font-semibold text-gp-ink-muted shrink-0">
            #{record.row}
          </span>
          <span
            className="material-symbols-outlined text-[14px] text-gp-ink-muted shrink-0"
            role="img"
            aria-label={record.kind === 'person' ? 'Person' : 'Organization'}
          >
            {KIND_ICON[record.kind]}
          </span>
          <h4
            className={`text-xs font-bold text-gp-ink-strong dark:text-white truncate min-w-0 ${
              selected ? '' : 'line-through decoration-gp-ink-muted'
            }`}
          >
            {name}
          </h4>
        </div>
        {affiliation && <DetailLine icon="work">{affiliation}</DetailLine>}
        {record.email && <DetailLine icon="mail">{record.email}</DetailLine>}
        {record.phone && <DetailLine icon="call">{record.phone}</DetailLine>}
        {record.location && (
          <DetailLine icon="location_on">{record.location}</DetailLine>
        )}
      </div>
    </label>
  )
}

/** "Select all" for the preview — indeterminate when only some are ticked. */
export function SelectAllContacts({
  selectedCount,
  total,
  onChange,
}: {
  selectedCount: number
  total: number
  onChange: (selectAll: boolean) => void
}) {
  const allSelected = selectedCount === total
  return (
    <label className="flex items-center gap-2 min-w-0 shrink-0 cursor-pointer text-xs font-medium text-gp-ink-strong dark:text-white">
      <input
        type="checkbox"
        checked={allSelected}
        ref={(input) => {
          if (input) input.indeterminate = selectedCount > 0 && !allSelected
        }}
        onChange={() => onChange(!allSelected)}
        className="size-4 shrink-0 cursor-pointer accent-gp-primary"
      />
      <span className="truncate">
        {allSelected ? 'All selected' : `${selectedCount} of ${total} selected`}
      </span>
      <span className="text-gp-ink-muted font-normal hidden sm:inline">
        — untick anyone you don’t want to import
      </span>
    </label>
  )
}

export function ContactIssueCard({ error }: { error: ContactRowError }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive min-w-0">
      <span className="material-symbols-outlined text-[14px] shrink-0">
        error
      </span>
      <p className="min-w-0">
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

export function ContactsResults({ result }: { result: ContactImportResult }) {
  const { summary, outcomes } = result
  // Skipped rows first — they are the ones that need the member's attention.
  const ordered = [...outcomes].sort(
    (a, b) =>
      Number(b.status === 'skipped') - Number(a.status === 'skipped') ||
      a.row - b.row
  )
  return (
    <>
      <div className="flex flex-wrap items-center gap-2 shrink-0">
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
      </div>
      <ul className="overflow-y-auto min-h-0 space-y-1.5 pr-1">
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
