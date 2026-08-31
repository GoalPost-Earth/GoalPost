'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import {
  ARTICLE_IMPORT_STATUS,
  MAX_ARTICLE_IMPORT_ROWS,
  isArticleImportInFlight,
  parseArticleRows,
  validateArticleTemplateHeaders,
  type ArticleImportRowInput,
  type ArticleRowError,
} from '@/lib/imports/article-import'
import { parseSpreadsheetArrayBuffer } from '@/lib/imports/article-sheet-parser'
import {
  ImportSummaryChips,
  OutcomeRow,
  PreviewRowCard,
  RowIssueCard,
} from './import-articles-preview'
import { ImportArticlesPicker } from './import-articles-picker'
import { ImportArticlesProgress } from './import-articles-progress'
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
 * mid-import reopens straight into their progress (the hook recovers the job
 * id) instead of a fresh drop zone.
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
  const dialogRef = useRef<HTMLDivElement>(null)

  // Keep Tab / Shift+Tab inside the dialog and move focus into it on open —
  // WAI-ARIA modal dialog pattern, same hook EntityInfoDrawer / PersonPanel use.
  // Especially load-bearing here: the modal is portalled to `document.body`, so
  // without a trap Tab walks straight into the field-context page behind it.
  useFocusTrap(dialogRef, isOpen)

  const { job, isSubmitting, error, submit, clear } = useArticleImportJob({
    fieldContextId,
    onRowsLanded: onImported,
  })

  const inFlight = job !== null && isArticleImportInFlight(job.status)
  const step = job ? (inFlight ? 'progress' : 'results') : hasPreview ? 'preview' : 'pick'

  const reset = useCallback(() => {
    setHasPreview(false)
    setFileName('')
    setValidRows([])
    setRowErrors([])
    setPickError(null)
    clear()
  }, [clear])

  const handleClose = useCallback(() => {
    if (isSubmitting) return
    // A finished import is dismissed for good; one still running is only
    // hidden, so reopening returns to its progress.
    if (!inFlight) reset()
    onClose()
  }, [inFlight, isSubmitting, onClose, reset])

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

  const failed = job?.status === ARTICLE_IMPORT_STATUS.failed
  const visibleError = pickError ?? error

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-articles-title"
        tabIndex={-1}
        className="bg-gp-surface dark:bg-gp-surface-dark border border-gp-glass-border rounded-2xl shadow-2xl max-w-lg sm:max-w-2xl w-full max-h-[85vh] p-4 sm:p-6 flex flex-col gap-4 focus:outline-none"
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
              Review before importing — nothing is saved yet.
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

        {step === 'results' && job && (
          <>
            {failed && (
              <div
                role="alert"
                className="shrink-0 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {job.statusMessage ??
                  'This import could not be finished. Upload the remaining rows again.'}
              </div>
            )}
            <ImportSummaryChips summary={job.summary} />
            <p className="text-sm text-gp-ink-muted dark:text-gp-ink-soft shrink-0">
              {job.message}
            </p>
            <div className="overflow-y-auto min-h-0 space-y-2 pr-1">
              {[...job.outcomes]
                .sort(
                  (a, b) =>
                    (a.status === 'failed' ? 0 : 1) -
                      (b.status === 'failed' ? 0 : 1) || a.row - b.row
                )
                .map((outcome) => (
                  <OutcomeRow key={`out-${outcome.row}`} outcome={outcome} />
                ))}
            </div>
          </>
        )}

        {visibleError && (
          <div
            role="alert"
            className="shrink-0 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {visibleError}
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-1 shrink-0">
          {(step === 'pick' || step === 'progress') && (
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2 rounded-lg border border-gp-glass-border text-gp-ink-strong dark:text-white hover:bg-gp-glass-bg transition-colors cursor-pointer"
            >
              {step === 'progress' ? 'Close' : 'Cancel'}
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
