'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import {
  MAX_CONTACT_FILE_BYTES,
  MAX_CONTACT_IMPORT_ROWS,
  type ContactLinkTarget,
} from '@/lib/imports/contact-import'
import {
  CONTACT_SOURCE_PROFILES,
  parseContactFile,
  type ParsedContactFile,
} from '@/lib/imports/contact-sources'
import { parseContactWorkbook } from '@/lib/imports/contact-sheet-parser'
import {
  ContactIssueCard,
  ContactRowCard,
  SelectAllContacts,
  ContactsPicker,
  ContactsResults,
  CountChip,
} from './import-contacts-panels'
import { useContactImport } from './use-contact-import'
import {
  CONTACT_SELECT_CLASS,
  ContactLinkSelect,
} from './import-contacts-link-select'

/**
 * GOAL-382 — import people and organizations into a FieldContext from a
 * contacts file (vCard, Outlook / Google / LinkedIn CSV, or JSON).
 *
 * Three steps: pick a file → preview what was read (nothing is written until
 * the member confirms; a CSV's detected source can be changed here, and every
 * contact can optionally be linked to one pulse or person in the field) →
 * results. Parsing is client-side; the confirm step POSTs the mapped contacts
 * to /api/import/contacts in batches (`useContactImport`), and the route
 * answers each with its per-row outcome.
 *
 * Portalled to `document.body` for the same reason as the article import: the
 * floating action bar that opens it sits outside the canvas visibility
 * cascade, so mounting in place would hide the dialog in Bloom view.
 */

interface ImportContactsModalProps {
  isOpen: boolean
  fieldContextId: string
  onClose: () => void
  /** Called once contacts have been written — the caller refetches the field. */
  onImported: () => void
}

const EXCEL_FILE = /\.xlsx?$/i

export function ImportContactsModal({
  isOpen,
  fieldContextId,
  onClose,
  onImported,
}: ImportContactsModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(dialogRef, isOpen)

  // Text for vCard / CSV / JSON; the raw bytes for an Excel workbook. Kept so
  // "Read this file as" can re-read it with another profile.
  const [file, setFile] = useState<{
    name: string
    content: string | ArrayBuffer
  } | null>(null)
  const [parsed, setParsed] = useState<ParsedContactFile | null>(null)
  const [linkValue, setLinkValue] = useState('')
  const [pickError, setPickError] = useState<string | null>(null)
  // Rows the member unticked in the preview. Everything starts ticked, so a
  // file imports in full unless someone is deliberately left out.
  const [excludedRows, setExcludedRows] = useState<ReadonlySet<number>>(
    () => new Set()
  )
  const { isSubmitting, progress, result, error, submit, reset } =
    useContactImport({ fieldContextId, onImported })

  const step = result ? 'results' : parsed ? 'preview' : 'pick'
  const records = parsed?.records ?? []
  const selectedRecords = records.filter(
    (record) => !excludedRows.has(record.row)
  )
  const people = selectedRecords.filter((r) => r.kind === 'person').length
  const organizations = selectedRecords.length - people
  const toggleRow = (row: number) =>
    setExcludedRows((current) => {
      const next = new Set(current)
      if (!next.delete(row)) next.add(row)
      return next
    })

  const handleClose = useCallback(() => {
    if (isSubmitting) return
    setFile(null)
    setParsed(null)
    setLinkValue('')
    setPickError(null)
    reset()
    onClose()
  }, [isSubmitting, onClose, reset])

  const readFile = useCallback(
    (name: string, content: string | ArrayBuffer, profileId?: string) => {
      const next =
        typeof content === 'string'
          ? parseContactFile(name, content, profileId)
          : parseContactWorkbook(content, profileId)
      if (next.fileError) {
        setPickError(next.fileError)
        return
      }
      if (next.records.length + next.errors.length === 0) {
        setPickError('This file has no contacts in it.')
        return
      }
      if (next.records.length > MAX_CONTACT_IMPORT_ROWS) {
        setPickError(
          `This file has ${next.records.length} contacts — a single import is capped at ${MAX_CONTACT_IMPORT_ROWS}. Split it and import in batches.`
        )
        return
      }
      setPickError(null)
      setFile({ name, content })
      setParsed(next)
      setExcludedRows(new Set())
    },
    []
  )

  const handleFileSelected = useCallback(
    async (picked: File | null) => {
      if (!picked) return
      setPickError(null)
      if (picked.size > MAX_CONTACT_FILE_BYTES) {
        setPickError('This file is too large — the limit is 5 MB.')
        return
      }
      try {
        readFile(
          picked.name,
          EXCEL_FILE.test(picked.name)
            ? await picked.arrayBuffer()
            : await picked.text()
        )
      } catch {
        setPickError('The file could not be read — pick it again and retry.')
      }
    },
    [readFile]
  )

  const handleSubmit = useCallback(() => {
    if (!parsed) return
    const separator = linkValue.indexOf(':')
    const kind = linkValue.slice(0, separator)
    const link: ContactLinkTarget | undefined =
      kind === 'pulse' || kind === 'person'
        ? { kind, id: linkValue.slice(separator + 1) }
        : undefined
    setPickError(null)
    void submit(
      parsed.records.filter((record) => !excludedRows.has(record.row)),
      link
    )
  }, [excludedRows, linkValue, parsed, submit])

  // Esc closes. Capture phase + stopPropagation so StudioShell's window-level
  // Escape shortcut does not also close the chat panel behind the dialog.
  useEffect(() => {
    if (!isOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.stopPropagation()
      handleClose()
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [isOpen, handleClose])

  if (!isOpen || typeof document === 'undefined') return null

  const secondaryButton =
    'px-5 py-2 rounded-lg border border-gp-glass-border text-gp-ink-strong dark:text-white hover:bg-gp-glass-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
  const primaryButton =
    'px-5 py-2 rounded-lg bg-gp-primary text-white font-medium hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer'

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-contacts-title"
        tabIndex={-1}
        className="bg-gp-surface dark:bg-gp-surface-dark border border-gp-glass-border rounded-2xl shadow-2xl max-w-lg sm:max-w-2xl w-full max-h-[85vh] p-4 sm:p-6 flex flex-col gap-4 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gp-primary"
      >
        <div className="flex items-center justify-between shrink-0">
          <h3
            id="import-contacts-title"
            className="text-lg font-semibold text-gp-ink-strong dark:text-white"
          >
            Import Contacts
          </h3>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Close"
            type="button"
            className="cursor-pointer text-gp-ink-muted hover:text-gp-ink-strong transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {step === 'pick' && (
          <ContactsPicker onFileSelected={handleFileSelected} />
        )}

        {step === 'preview' && parsed && file && (
          <>
            <div className="flex flex-wrap items-center gap-2 shrink-0 min-w-0">
              <CountChip icon="person" tone="ready">
                {people} {people === 1 ? 'person' : 'people'}
              </CountChip>
              <CountChip icon="apartment" tone="ready">
                {organizations}{' '}
                {organizations === 1 ? 'organization' : 'organizations'}
              </CountChip>
              {parsed.errors.length > 0 && (
                <CountChip icon="error" tone="issue">
                  {parsed.errors.length} with issues
                </CountChip>
              )}
              <span className="text-xs text-gp-ink-muted truncate min-w-0">
                {file.name}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0">
              {parsed.profile?.format === 'csv' && (
                <label className="flex flex-col gap-1 min-w-0 text-xs font-medium text-gp-ink-muted dark:text-gp-ink-soft">
                  Read this file as
                  <select
                    className={CONTACT_SELECT_CLASS}
                    value={parsed.profile.id}
                    onChange={(event) =>
                      readFile(file.name, file.content, event.target.value)
                    }
                  >
                    {CONTACT_SOURCE_PROFILES.filter(
                      (profile) => profile.format === 'csv'
                    ).map((profile) => (
                      <option key={profile.id} value={profile.id}>
                        {profile.label}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <ContactLinkSelect
                fieldContextId={fieldContextId}
                value={linkValue}
                onChange={setLinkValue}
              />
            </div>

            <p className="text-xs text-gp-ink-muted dark:text-gp-ink-soft shrink-0">
              Review before importing — nothing is saved yet, and only the
              ticked contacts are imported. A contact that matches one already
              here (by email, or by name and organization) is updated with the
              values in this file.
              {parsed.errors.length > 0 && ' Rows with issues will be skipped.'}
            </p>

            {records.length > 0 && (
              <SelectAllContacts
                selectedCount={selectedRecords.length}
                total={records.length}
                onChange={(selectAll) =>
                  setExcludedRows(
                    selectAll
                      ? new Set()
                      : new Set(records.map((record) => record.row))
                  )
                }
              />
            )}

            <div className="overflow-y-auto min-h-0 space-y-2 pr-1">
              {parsed.errors.map((rowError) => (
                <ContactIssueCard
                  key={`err-${rowError.row}`}
                  error={rowError}
                />
              ))}
              {parsed.records.map((record) => (
                <ContactRowCard
                  key={`row-${record.row}`}
                  record={record}
                  selected={!excludedRows.has(record.row)}
                  onToggle={() => toggleRow(record.row)}
                />
              ))}
            </div>
          </>
        )}

        {step === 'results' && result && <ContactsResults result={result} />}

        {(pickError ?? error) && (
          <div
            role="alert"
            className="shrink-0 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {pickError ?? error}
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-1 shrink-0">
          {step === 'pick' && (
            <button
              type="button"
              onClick={handleClose}
              className={secondaryButton}
            >
              Cancel
            </button>
          )}
          {step === 'preview' && (
            <>
              <button
                type="button"
                onClick={() => {
                  setParsed(null)
                  setFile(null)
                  setPickError(null)
                  reset()
                }}
                disabled={isSubmitting}
                className={secondaryButton}
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || selectedRecords.length === 0}
                aria-busy={isSubmitting}
                // Busy is not "unavailable": keep full contrast while the
                // progress label is the thing the member is reading.
                className={
                  isSubmitting
                    ? primaryButton.replace('disabled:opacity-50', '')
                    : primaryButton
                }
              >
                {isSubmitting && (
                  <span className="material-symbols-outlined text-base animate-spin">
                    hourglass_bottom
                  </span>
                )}
                {isSubmitting
                  ? `Importing ${progress.done} of ${progress.total}…`
                  : `Import ${selectedRecords.length} contact${selectedRecords.length === 1 ? '' : 's'}`}
              </button>
            </>
          )}
          {step === 'results' && (
            <button
              type="button"
              onClick={handleClose}
              className={primaryButton}
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
