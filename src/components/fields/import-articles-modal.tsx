'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import {
  MAX_ARTICLE_IMPORT_ROWS,
  isArticleImportInFlight,
  parseArticleRows,
  validateArticleTemplateHeaders,
  type ArticleImportRowInput,
  type ArticleRowError,
} from '@/lib/imports/article-import'
import { parseSpreadsheetArrayBuffer } from '@/lib/imports/article-sheet-parser'
import {
  ImportArticlesResults,
  PreviewRowCard,
  RowIssueCard,
} from './import-articles-preview'
import { ImportArticlesPicker } from './import-articles-picker'
import {
  ImportArticlesProgress,
  ImportArticlesRecovering,
} from './import-articles-progress'
import { useArticleImportJob } from './use-article-import-job'

/**
 * GOAL-317 — spreadsheet-driven bulk upload of articles as pulses.
 *
 * Four steps: pick a .csv/.xlsx → preview parsed rows + validation issues (the
 * human-in-the-loop gate — nothing is written until the member confirms) →
 * queued/importing progress → per-row results. Parsing happens client-side;
 * the confirm step POSTs typed rows to /api/import/articles.
 *
 * GOAL-326 made the import asynchronous: that POST answers 202 with a job id
 * and a cron worker mints the pulses, so the last two steps are driven by
 * polling the job rather than by one long-blocked request. Which step shows is
 * derived from the job, not stored — that way a member who closed the modal
 * mid-import reopens straight into their progress instead of a fresh drop
 * zone. GOAL-357 added a brief `recovering` state in front of the picker,
 * because the hook has to ask (sessionStorage first, then the server) before
 * "no job" is a fact rather than a guess.
 *
 * Rendered through a portal to `document.body` (GOAL-327). The field-context
 * page that owns this modal is mounted inside `CanvasHost`'s per-view
 * visibility cascade, which flips the whole dashboard subtree to
 * `visibility: hidden` while the Bloom Exploration view is showing. Without
 * the portal, opening the import from the floating action bar — which sits
 * *outside* that cascade and is therefore visible in both views — would mount
 * the modal into the hidden subtree and show the user nothing. Same reasoning
 * as `EntityInfoDrawer` being hoisted to the canvas-host level.
 */

/** Client-side sanity cap on the sheet itself — rows are capped separately. */
const MAX_SHEET_BYTES = 5 * 1024 * 1024

interface ImportArticlesModalProps {
  isOpen: boolean
  fieldContextId: string
  onClose: () => void
  /** Called as rows land — parent refetches pulses/people. */
  onImported: () => void
}

export function ImportArticlesModal({
  isOpen,
  fieldContextId,
  onClose,
  onImported,
}: ImportArticlesModalProps) {
  const [hasPreview, setHasPreview] = useState(false)
  const [fileName, setFileName] = useState('')
  const [validRows, setValidRows] = useState<ArticleImportRowInput[]>([])
  const [rowErrors, setRowErrors] = useState<ArticleRowError[]>([])
  const [pickError, setPickError] = useState<string | null>(null)
  /**
   * The running import the member has chosen to step past in order to queue
   * another sheet (GOAL-357). Holding the job *id* rather than a boolean is
   * what makes the return automatic: the moment `submit` mints a new job the
   * ids differ and the modal follows the new one, while a submit that fails
   * leaves them on the preview with the error instead of bouncing back.
   *
   * The queue is built for this — `MAX_IN_FLIGHT_ARTICLE_IMPORTS_PER_USER` is
   * 5 — and without a way through, recovering into a running import would
   * turn "Import Articles" into a dead end for as long as that import lasts.
   */
  const [supersededJobId, setSupersededJobId] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  // Keep Tab / Shift+Tab inside the dialog and move focus into it on open —
  // WAI-ARIA modal dialog pattern, same hook EntityInfoDrawer / PersonPanel use.
  // Especially load-bearing here: the modal is portalled to `document.body`, so
  // without a trap Tab walks straight into the field-context page behind it.
  useFocusTrap(dialogRef, isOpen)

  const { job, isRecovering, isSubmitting, error, submit, clear } =
    useArticleImportJob({
      fieldContextId,
      onRowsLanded: onImported,
    })

  const inFlight = job !== null && isArticleImportInFlight(job.status)
  const steppedPast = inFlight && job.jobId === supersededJobId
  // GOAL-357 — the picker is only correct once we know no import is running.
  // This modal is unmounted while closed, so every reopen starts with no
  // snapshot; showing the drop zone in that gap flashed a fresh import over
  // one already in flight (and in a second tab, where sessionStorage is empty,
  // it stayed there until the lookup answered).
  const step =
    job && !steppedPast
      ? inFlight
        ? 'progress'
        : 'results'
      : hasPreview
        ? 'preview'
        : isRecovering
          ? 'recovering'
          : 'pick'

  const reset = useCallback(() => {
    setHasPreview(false)
    setFileName('')
    setValidRows([])
    setRowErrors([])
    setPickError(null)
    setSupersededJobId(null)
    clear()
  }, [clear])

  const handleClose = useCallback(() => {
    if (isSubmitting) return
    // A finished import is dismissed for good; one still running is only
    // hidden, so reopening returns to its progress. Closing mid-lookup
    // dismisses nothing — `reset()` clears the stored job id, and doing that
    // before we know what is running would throw away the way back to it.
    if (!inFlight && !isRecovering) reset()
    onClose()
  }, [inFlight, isRecovering, isSubmitting, onClose, reset])

  const handleFileSelected = useCallback(async (picked: File | null) => {
    if (!picked) return
    setPickError(null)

    if (!/\.(csv|xlsx)$/i.test(picked.name)) {
      setPickError('Upload a .csv or .xlsx file.')
      return
    }
    if (picked.size > MAX_SHEET_BYTES) {
      setPickError('This file is too large — the limit is 5 MB.')
      return
    }

    let buffer: ArrayBuffer
    try {
      buffer = await picked.arrayBuffer()
    } catch {
      setPickError('The file could not be read — pick it again and retry.')
      return
    }
    const { rows: sheetRows, parseErrors } = parseSpreadsheetArrayBuffer(buffer)
    if (parseErrors.length > 0) {
      setPickError(parseErrors.join(' '))
      return
    }
    if (sheetRows.length === 0) {
      setPickError('The file has a header row but no data rows.')
      return
    }
    const headerErrors = validateArticleTemplateHeaders(sheetRows)
    if (headerErrors.length > 0) {
      setPickError(headerErrors.join(' '))
      return
    }
    const parsed = parseArticleRows(sheetRows)
    if (parsed.rows.length > MAX_ARTICLE_IMPORT_ROWS) {
      setPickError(
        `This sheet has ${parsed.rows.length} valid rows — a single import is capped at ${MAX_ARTICLE_IMPORT_ROWS}. Split it and upload in batches.`
      )
      return
    }

    setFileName(picked.name)
    setValidRows(parsed.rows)
    setRowErrors(parsed.errors)
    setHasPreview(true)
  }, [])

  // Esc closes — `handleClose` already no-ops mid-import, so an in-flight
  // batch can't be dismissed out from under the user.
  //
  // Capture phase on `document`, plus stopPropagation: StudioShell binds its
  // single-key shortcuts (Escape closes the floating chat / exits fullscreen)
  // on `window` in the bubble phase and only ignores them for text inputs.
  // Initial focus here lands on a button, so a bubbling Escape would close
  // the chat panel *and* this dialog. Capture runs first, so the dialog wins.
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopPropagation()
      handleClose()
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [isOpen, handleClose])

  if (!isOpen) return null
  // `dynamic(..., { ssr: false })` means this only ever runs in the browser,
  // but guard anyway so the component stays safe to mount eagerly.
  if (typeof document === 'undefined') return null

  const visibleError = pickError ?? error

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-articles-title"
        tabIndex={-1}
        className="bg-gp-surface dark:bg-gp-surface-dark border border-gp-glass-border rounded-2xl shadow-2xl max-w-lg sm:max-w-2xl w-full max-h-[85vh] p-4 sm:p-6 flex flex-col gap-4 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gp-primary"
      >
        <div className="flex items-center justify-between shrink-0">
          <h3
            id="import-articles-title"
            className="text-lg font-semibold text-gp-ink-strong dark:text-white"
          >
            Import Articles
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

        {step === 'recovering' && <ImportArticlesRecovering />}

        {step === 'pick' && (
          <ImportArticlesPicker onFileSelected={handleFileSelected} />
        )}

        {step === 'preview' && (
          <>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gp-resource/30 bg-gp-resource/10 px-3 py-1 text-xs font-medium text-gp-resource">
                <span className="material-symbols-outlined text-[14px]">
                  check_circle
                </span>
                {validRows.length} ready
              </span>
              {rowErrors.length > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
                  <span className="material-symbols-outlined text-[14px]">
                    error
                  </span>
                  {rowErrors.length} with issues
                </span>
              )}
              <span className="text-xs text-gp-ink-muted truncate min-w-0">
                {fileName}
              </span>
            </div>

            <p className="text-xs text-gp-ink-muted dark:text-gp-ink-soft shrink-0">
              Review before importing — nothing is saved yet. Each article
              link will be opened and read.
              {rowErrors.length > 0 && ' Rows with issues will be skipped.'}
            </p>

            <div className="overflow-y-auto min-h-0 space-y-2 pr-1">
              {rowErrors.map((rowError) => (
                <RowIssueCard key={`err-${rowError.row}`} error={rowError} />
              ))}
              {validRows.map((row) => (
                <PreviewRowCard key={`row-${row.row}`} row={row} />
              ))}
            </div>
          </>
        )}

        {step === 'progress' && job && <ImportArticlesProgress job={job} />}

        {step === 'results' && job && <ImportArticlesResults job={job} />}

        {visibleError && (
          <div
            role="alert"
            className="shrink-0 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {visibleError}
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-1 shrink-0">
          {(step === 'pick' ||
            step === 'progress' ||
            step === 'recovering') && (
            <button
              type="button"
              // While the member is stepping past a running import, this is
              // the way back to it rather than a way out of the modal.
              onClick={
                steppedPast ? () => setSupersededJobId(null) : handleClose
              }
              className="px-5 py-2 rounded-lg border border-gp-glass-border text-gp-ink-strong dark:text-white hover:bg-gp-glass-bg transition-colors cursor-pointer"
            >
              {steppedPast
                ? 'Back to import'
                : step === 'pick'
                  ? 'Cancel'
                  : 'Close'}
            </button>
          )}
          {step === 'progress' && job && (
            <button
              type="button"
              onClick={() => setSupersededJobId(job.jobId)}
              className="px-5 py-2 rounded-lg border border-gp-glass-border text-gp-ink-strong dark:text-white hover:bg-gp-glass-bg transition-colors cursor-pointer"
            >
              Import another sheet
            </button>
          )}
          {step === 'preview' && (
            <>
              <button
                type="button"
                onClick={() => {
                  if (isSubmitting) return
                  setPickError(null)
                  setHasPreview(false)
                }}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-lg border border-gp-glass-border text-gp-ink-strong dark:text-white hover:bg-gp-glass-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => void submit(validRows)}
                disabled={isSubmitting || validRows.length === 0}
                className="px-5 py-2 rounded-lg bg-gp-primary text-white font-medium hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting && (
                  <span className="material-symbols-outlined text-base animate-spin">
                    hourglass_bottom
                  </span>
                )}
                {isSubmitting
                  ? 'Queueing…'
                  : `Import ${validRows.length} row${validRows.length === 1 ? '' : 's'}`}
              </button>
            </>
          )}
          {step === 'results' && (
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2 rounded-lg bg-gp-primary text-white font-medium hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
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
