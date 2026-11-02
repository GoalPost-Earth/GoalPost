'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import {
  MAX_CONTACT_FILE_BYTES,
  MAX_CONTACT_IMPORT_ROWS,
  summarizeContactOutcomes,
  type ContactLinkTarget,
  type ContactRowError,
} from '@/lib/imports/contact-import'
import {
  CONTACT_SOURCE_PROFILES,
  parseContactFile,
} from '@/lib/imports/contact-sources'
import { parseContactWorkbook } from '@/lib/imports/contact-sheet-parser'
import {
  ContactsImporting,
  ContactsPicker,
  ContactsResults,
} from './import-contacts-panels'
import { useContactImport } from './use-contact-import'
import {
  CONTACT_SELECT_CLASS,
  ContactLinkSelect,
} from './import-contacts-link-select'

/**
 * GOAL-382 — import people and organizations into a FieldContext from a
 * contacts file (vCard, Outlook / Google / LinkedIn CSV, Excel, or JSON).
 *
 * Choosing a file starts the import; there is no confirmation step (the client
 * asked for none). So the two settings that shape an import, the CSV format and
 * the optional link to one pulse or person, sit beside the file picker and are
 * set first. Parsing is client-side, the mapped contacts POST to
 * /api/import/contacts in batches (`useContactImport`), and the results account
 * for every row: its outcome, why it could not be read, or that it was not sent.
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

function linkTarget(value: string): ContactLinkTarget | undefined {
  const separator = value.indexOf(':')
  const kind = value.slice(0, separator)
  return kind === 'pulse' || kind === 'person'
    ? { kind, id: value.slice(separator + 1) }
    : undefined
}

export function ImportContactsModal({
  isOpen,
  fieldContextId,
  onClose,
  onImported,
}: ImportContactsModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const primaryActionRef = useRef<HTMLButtonElement>(null)
  // Reading a file takes real time for a cloud placeholder, and importing starts
  // when it finishes. Closing or picking again retires the read in progress.
  const readSessionRef = useRef(0)
  useFocusTrap(dialogRef, isOpen)

  const [profileId, setProfileId] = useState('')
  const [linkValue, setLinkValue] = useState('')
  const [pickError, setPickError] = useState<string | null>(null)
  // Rows the parser could not read. They never reach the route, so the results
  // have to list them alongside the route's outcomes.
  const [issues, setIssues] = useState<ContactRowError[]>([])
  const [isReading, setIsReading] = useState(false)
  const {
    isSubmitting,
    isStopping,
    progress,
    result,
    error,
    notImported,
    submit,
    stop,
    reset,
  } = useContactImport({ fieldContextId, onImported })

  const step = isSubmitting
    ? 'importing'
    : isReading
      ? 'reading'
      : result || issues.length > 0
        ? 'results'
        : 'pick'

  // The control holding focus unmounts when the step changes, which would drop
  // keyboard focus out of the dialog.
  useEffect(() => {
    if (!isOpen) return
    const target =
      primaryActionRef.current ??
      dialogRef.current?.querySelector<HTMLElement>('button:not([disabled])')
    target?.focus()
  }, [isOpen, step])

  useEffect(
    () => () => {
      readSessionRef.current += 1
    },
    []
  )

  const handleClose = useCallback(() => {
    if (isSubmitting) return
    readSessionRef.current += 1
    setIsReading(false)
    setProfileId('')
    setLinkValue('')
    setPickError(null)
    setIssues([])
    reset()
    onClose()
  }, [isSubmitting, onClose, reset])

  const importFile = useCallback(
    (name: string, content: string | ArrayBuffer) => {
      const requestedProfile = profileId || undefined
      const parsed =
        typeof content === 'string'
          ? parseContactFile(name, content, requestedProfile)
          : parseContactWorkbook(content, requestedProfile)
      if (parsed.fileError) {
        setPickError(parsed.fileError)
        return
      }
      if (parsed.records.length + parsed.errors.length === 0) {
        setPickError('This file has no contacts in it.')
        return
      }
      if (parsed.records.length > MAX_CONTACT_IMPORT_ROWS) {
        setPickError(
          `This file has ${parsed.records.length} contacts — a single import is capped at ${MAX_CONTACT_IMPORT_ROWS}. Split it and import in batches.`
        )
        return
      }
      setIssues(parsed.errors)
      void submit(parsed.records, linkTarget(linkValue))
    },
    [linkValue, profileId, submit]
  )

  const handleFileSelected = useCallback(
    async (picked: File | null) => {
      if (!picked) return
      readSessionRef.current += 1
      const session = readSessionRef.current
      setPickError(null)
      reset()
      if (picked.size > MAX_CONTACT_FILE_BYTES) {
        setPickError('This file is too large — the limit is 5 MB.')
        return
      }
      setIsReading(true)
      try {
        const content = EXCEL_FILE.test(picked.name)
          ? await picked.arrayBuffer()
          : await picked.text()
        if (session !== readSessionRef.current) return
        setIsReading(false)
        importFile(picked.name, content)
      } catch {
        if (session !== readSessionRef.current) return
        setIsReading(false)
        setPickError('The file could not be read — pick it again and retry.')
      }
    },
    [importFile, reset]
  )

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
    'px-5 py-2 rounded-lg border border-gp-glass-border text-gp-ink-strong dark:text-white hover:bg-gp-glass-bg transition-colors cursor-pointer'
  const primaryButton =
    'px-5 py-2 rounded-lg bg-gp-primary text-white font-medium hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer'

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
          <div className="min-h-0 -m-0.5 p-0.5 overflow-y-auto flex flex-col gap-4">
            <ContactsPicker onFileSelected={handleFileSelected}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0">
                <label className="flex flex-col gap-1 min-w-0 text-xs font-medium text-gp-ink-muted dark:text-gp-ink-soft">
                  CSV or Excel format
                  <select
                    className={CONTACT_SELECT_CLASS}
                    value={profileId}
                    onChange={(event) => setProfileId(event.target.value)}
                  >
                    <option value="">Detect automatically</option>
                    {CONTACT_SOURCE_PROFILES.filter(
                      (profile) => profile.format === 'csv'
                    ).map((profile) => (
                      <option key={profile.id} value={profile.id}>
                        {profile.label}
                      </option>
                    ))}
                  </select>
                </label>
                <ContactLinkSelect
                  fieldContextId={fieldContextId}
                  value={linkValue}
                  onChange={setLinkValue}
                />
              </div>
            </ContactsPicker>
          </div>
        )}

        {step === 'reading' && <ContactsImporting label="Reading the file…" />}

        {step === 'importing' && (
          <ContactsImporting
            label={`Importing ${progress.done} of ${progress.total}…`}
            onStop={stop}
            isStopping={isStopping}
            stopButtonRef={primaryActionRef}
          />
        )}

        {step === 'results' && (
          <ContactsResults
            result={
              result ?? {
                summary: summarizeContactOutcomes([]),
                outcomes: [],
              }
            }
            issues={issues}
            notImported={notImported}
            importFailed={Boolean(error)}
          />
        )}

        {(pickError ?? error) && (
          <div
            role="alert"
            className="shrink-0 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {pickError ?? error}
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-1 shrink-0">
          {(step === 'pick' || step === 'reading') && (
            <button
              type="button"
              onClick={handleClose}
              className={secondaryButton}
            >
              Cancel
            </button>
          )}
          {step === 'results' && (
            <>
              {/* Keeps the format and link settings, which closing would clear. */}
              <button
                type="button"
                onClick={() => {
                  setIssues([])
                  reset()
                }}
                className={secondaryButton}
              >
                {error ? 'Try again' : 'Import another file'}
              </button>
              <button
                ref={primaryActionRef}
                type="button"
                onClick={handleClose}
                className={primaryButton}
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
