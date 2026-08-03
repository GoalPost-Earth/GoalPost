'use client'

import { useCallback, useState } from 'react'
import { chatApiAuthHeaders } from '@/lib/simulation/conversation-thread-client'
import {
  ARTICLE_TEMPLATE_COLUMNS,
  ARTICLE_TEMPLATE_SAMPLE_ROW,
  MAX_ARTICLE_IMPORT_ROWS,
  parseArticleRows,
  parseSpreadsheetArrayBuffer,
  validateArticleTemplateHeaders,
  type ArticleImportResult,
  type ArticleImportRowInput,
  type ArticleRowError,
} from '@/lib/imports/article-import'
import {
  ImportSummaryChips,
  OutcomeRow,
  PreviewRowCard,
  RowIssueCard,
} from './import-articles-preview'

/**
 * GOAL-317 — spreadsheet-driven bulk upload of articles as pulses.
 *
 * Three steps: pick a .csv/.xlsx → preview parsed rows + validation issues
 * (the human-in-the-loop gate — nothing is written until the member
 * confirms) → per-row results. Parsing happens client-side; the confirm
 * step POSTs typed rows to /api/import/articles, which re-validates and
 * writes through the authorized tool path.
 */

/** Client-side sanity cap on the sheet itself — rows are capped separately. */
const MAX_SHEET_BYTES = 5 * 1024 * 1024

type Step = 'pick' | 'preview' | 'results'

interface ImportArticlesModalProps {
  isOpen: boolean
  fieldContextId: string
  onClose: () => void
  /** Called after a batch that landed anything — parent refetches pulses/people. */
  onImported: () => void
}

function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

function downloadCsvTemplate() {
  const csv = [
    ARTICLE_TEMPLATE_COLUMNS.join(','),
    ARTICLE_TEMPLATE_SAMPLE_ROW.map(csvCell).join(','),
  ].join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'article-import-template.csv'
  anchor.click()
  URL.revokeObjectURL(url)
}

export function ImportArticlesModal({
  isOpen,
  fieldContextId,
  onClose,
  onImported,
}: ImportArticlesModalProps) {
  const [step, setStep] = useState<Step>('pick')
  const [fileName, setFileName] = useState('')
  const [validRows, setValidRows] = useState<ArticleImportRowInput[]>([])
  const [rowErrors, setRowErrors] = useState<ArticleRowError[]>([])
  const [result, setResult] = useState<ArticleImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const reset = useCallback(() => {
    setStep('pick')
    setFileName('')
    setValidRows([])
    setRowErrors([])
    setResult(null)
    setError(null)
    setIsDragging(false)
  }, [])

  const handleClose = useCallback(() => {
    if (isSubmitting) return
    reset()
    onClose()
  }, [isSubmitting, onClose, reset])

  const handleFileSelected = useCallback(async (picked: File | null) => {
    if (!picked) return
    setError(null)

    if (!/\.(csv|xlsx)$/i.test(picked.name)) {
      setError('Upload a .csv or .xlsx file.')
      return
    }
    if (picked.size > MAX_SHEET_BYTES) {
      setError('This file is too large — the limit is 5 MB.')
      return
    }

    let buffer: ArrayBuffer
    try {
      buffer = await picked.arrayBuffer()
    } catch {
      setError('The file could not be read — pick it again and retry.')
      return
    }
    const { rows: sheetRows, parseErrors } = parseSpreadsheetArrayBuffer(buffer)
    if (parseErrors.length > 0) {
      setError(parseErrors.join(' '))
      return
    }
    if (sheetRows.length === 0) {
      setError('The file has a header row but no data rows.')
      return
    }
    const headerErrors = validateArticleTemplateHeaders(sheetRows)
    if (headerErrors.length > 0) {
      setError(headerErrors.join(' '))
      return
    }
    const parsed = parseArticleRows(sheetRows)
    if (parsed.rows.length > MAX_ARTICLE_IMPORT_ROWS) {
      setError(
        `This sheet has ${parsed.rows.length} valid rows — a single import is capped at ${MAX_ARTICLE_IMPORT_ROWS}. Split it and upload in batches.`
      )
      return
    }

    setFileName(picked.name)
    setValidRows(parsed.rows)
    setRowErrors(parsed.errors)
    setStep('preview')
  }, [])

  const handleImport = useCallback(async () => {
    if (validRows.length === 0) return
    setIsSubmitting(true)
    setError(null)
    try {
      const authHeaders = await chatApiAuthHeaders()
      const res = await fetch('/api/import/articles', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ fieldContextId, rows: validRows }),
      })
      const body = (await res.json().catch(() => null)) as
        | (ArticleImportResult & { error?: string })
        | null

      // 200 / 207 / 400 can all carry a per-row result body — render it.
      if (body && Array.isArray(body.outcomes) && body.summary) {
        setResult(body)
        setStep('results')
        // skipped_existing rows may still have enriched an existing pulse
        // (filled content/location/time), so they warrant a refetch too.
        if (
          body.summary.created > 0 ||
          body.summary.createdPeople > 0 ||
          body.summary.skippedExisting > 0
        ) {
          onImported()
        }
        return
      }
      throw new Error(body?.error ?? `Import failed (${res.status}).`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed.')
    } finally {
      setIsSubmitting(false)
    }
  }, [fieldContextId, onImported, validRows])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gp-surface dark:bg-gp-surface-dark border border-gp-glass-border rounded-2xl shadow-2xl max-w-lg sm:max-w-2xl w-full max-h-[85vh] p-4 sm:p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between shrink-0">
          <h3 className="text-lg font-semibold text-gp-ink-strong dark:text-white">
            Import Articles
          </h3>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            type="button"
            className="cursor-pointer text-gp-ink-muted hover:text-gp-ink-strong transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {step === 'pick' && (
          <>
            <p className="text-sm text-gp-ink-muted dark:text-gp-ink-soft shrink-0">
              Upload a spreadsheet where each row is an article — title,
              author, date, and URL. Each row becomes a pulse in this field,
              attributed to its author.
            </p>

            <label
              htmlFor="import-articles-file"
              onDragEnter={(event) => {
                event.preventDefault()
                setIsDragging(true)
              }}
              onDragOver={(event) => {
                event.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={(event) => {
                if (event.currentTarget.contains(event.relatedTarget as Node))
                  return
                setIsDragging(false)
              }}
              onDrop={(event) => {
                event.preventDefault()
                setIsDragging(false)
                void handleFileSelected(event.dataTransfer.files?.[0] ?? null)
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
                newspaper
              </span>
              <span className="text-sm text-gp-ink-strong dark:text-white font-medium">
                {isDragging
                  ? 'Drop to preview'
                  : 'Drag a spreadsheet here, or click to choose'}
              </span>
              <span className="text-xs text-gp-ink-muted">
                Accepts .csv and .xlsx — up to {MAX_ARTICLE_IMPORT_ROWS} rows
                per import
              </span>
              <input
                id="import-articles-file"
                type="file"
                accept=".csv,.xlsx"
                className="sr-only"
                onChange={(event) => {
                  void handleFileSelected(event.target.files?.[0] ?? null)
                  event.target.value = ''
                }}
              />
            </label>

            <button
              type="button"
              onClick={downloadCsvTemplate}
              className="inline-flex items-center gap-1.5 self-start text-xs font-medium text-gp-primary hover:underline cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">
                download
              </span>
              Download the CSV template
            </button>
          </>
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

        {step === 'results' && result && (
          <>
            <ImportSummaryChips summary={result.summary} />
            <p className="text-sm text-gp-ink-muted dark:text-gp-ink-soft shrink-0">
              {result.message}
            </p>
            <div className="overflow-y-auto min-h-0 space-y-2 pr-1">
              {[...result.outcomes]
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

        {error && (
          <div
            role="alert"
            className="shrink-0 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-1 shrink-0">
          {step === 'pick' && (
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2 rounded-lg border border-gp-glass-border text-gp-ink-strong dark:text-white hover:bg-gp-glass-bg transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}
          {step === 'preview' && (
            <>
              <button
                type="button"
                onClick={() => {
                  if (isSubmitting) return
                  setError(null)
                  setStep('pick')
                }}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-lg border border-gp-glass-border text-gp-ink-strong dark:text-white hover:bg-gp-glass-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => void handleImport()}
                disabled={isSubmitting || validRows.length === 0}
                className="px-5 py-2 rounded-lg bg-gp-primary text-white font-medium hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting && (
                  <span className="material-symbols-outlined text-base animate-spin">
                    hourglass_bottom
                  </span>
                )}
                {isSubmitting
                  ? 'Importing…'
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
    </div>
  )
}
