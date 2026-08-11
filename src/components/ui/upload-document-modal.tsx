'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import {
  INGEST_ACCEPT_ATTRIBUTE,
  MAX_INGEST_BYTES,
  SUPPORTED_INGEST_SUMMARY,
  inferIngestMimeFromExtension,
  isSupportedIngestMime,
  normalizeIngestMime,
} from '@/lib/ingest/supported-file-types'

/**
 * Upload-document modal for the doc-ingestion flow (GOAL-236 / GOAL-238).
 *
 * The accepted file set + byte ceiling come from the shared
 * `@/lib/ingest/supported-file-types` module, which the presign route and the
 * orchestrator import too — so the client gate, server gate, and routing can't
 * drift. Today that's PDF + images (Gemini multimodal), Word/Excel/PowerPoint
 * (in-process text extraction), and plain-text formats. Extraction caps
 * (~50K characters / ~20 PDF pages) are enforced server-side.
 *
 * The modal hands the picked File back via `onSubmit`; it deliberately does no
 * network work itself — the parent wires the upload so loading/error state is
 * owned where the rest of the field-context state lives.
 *
 * Server-side rejections (oversize after extraction, unsupported sniffed mime,
 * parse failure) flow back through `onSubmit` rejection and render inline below
 * the form ("not a toast that disappears").
 */

const MAX_BYTES = MAX_INGEST_BYTES

export interface UploadDocumentSubmitInput {
  filename: string
  mimeType: string
  /** Raw File handed to the caller so it can PUT directly to S3. */
  file: File
  hint?: string
}

interface UploadDocumentModalProps {
  isOpen: boolean
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (input: UploadDocumentSubmitInput) => Promise<void>
}

function inferMimeType(file: File): string {
  // Prefer a supported mime from the browser-reported type; otherwise fall
  // back to the extension. Browsers sometimes report Office files as
  // `application/octet-stream` or an empty type, so the extension map is the
  // reliable signal for those — try it before giving up.
  const fromType = file.type ? normalizeIngestMime(file.type) : ''
  if (fromType && isSupportedIngestMime(fromType)) return fromType
  const fromExt = inferIngestMimeFromExtension(file.name)
  if (fromExt) return fromExt
  // Return whatever the browser said (possibly unsupported) so the error copy
  // can name it.
  return fromType
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

export function UploadDocumentModal({
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}: UploadDocumentModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [hint, setHint] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)

  // Keep Tab / Shift+Tab inside the dialog and move focus into it on open —
  // WAI-ARIA modal dialog pattern, same hook EntityInfoDrawer / PersonPanel use.
  useFocusTrap(dialogRef, isOpen)

  const reset = useCallback(() => {
    setFile(null)
    setHint('')
    setError(null)
    setIsDragging(false)
  }, [])

  // Shared by the file input and the drop zone so both go through one path:
  // clear any prior error, take the first file. Type/size validation stays in
  // `handleSubmit` (and the server) so a bad drop surfaces the same inline copy
  // as a bad pick rather than failing silently.
  const handleFileSelected = useCallback((picked: File | null) => {
    if (!picked) return
    setError(null)
    setFile(picked)
  }, [])

  const handleClose = useCallback(() => {
    if (isSubmitting) return
    reset()
    onClose()
  }, [isSubmitting, onClose, reset])

  const handleSubmit = useCallback(async () => {
    if (!file) {
      setError('Choose a file to upload.')
      return
    }
    const mimeType = inferMimeType(file)
    if (!isSupportedIngestMime(mimeType)) {
      setError(`We don't support this file type. We accept ${SUPPORTED_INGEST_SUMMARY}.`)
      return
    }
    if (file.size > MAX_BYTES) {
      setError(
        `This document is too large (${formatBytes(file.size)}). The upload limit is ${formatBytes(MAX_BYTES)}.`
      )
      return
    }

    try {
      setError(null)
      await onSubmit({
        filename: file.name,
        mimeType,
        file,
        hint: hint.trim() ? hint.trim() : undefined,
      })
      reset()
    } catch (err) {
      // Server-side rejections (oversize after extraction, unsupported sniffed
      // mime, parse failure) land here and render inline.
      setError(err instanceof Error ? err.message : 'Upload failed')
    }
  }, [file, hint, onSubmit, reset])

  // Esc closes — `handleClose` already no-ops mid-upload, so an in-flight
  // submit can't be dismissed out from under the user.
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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-document-title"
        tabIndex={-1}
        className="bg-gp-surface dark:bg-gp-surface-dark border border-gp-glass-border rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 focus:outline-none"
      >
        <div className="flex items-center justify-between">
          <h3
            id="upload-document-title"
            className="text-lg font-semibold text-gp-ink-strong dark:text-white"
          >
            Upload Document
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

        <p className="text-sm text-gp-ink-muted dark:text-gp-ink-soft">
          The assistant will read the file and pre-stage entity-creation
          actions in a new thread for you to review and approve.
        </p>

        <label
          htmlFor="upload-document-file"
          onDragEnter={(event) => {
            if (isSubmitting) return
            event.preventDefault()
            setIsDragging(true)
          }}
          onDragOver={(event) => {
            if (isSubmitting) return
            event.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={(event) => {
            // Ignore leave events bubbling up from child elements — only reset
            // when the pointer actually exits the drop zone.
            if (event.currentTarget.contains(event.relatedTarget as Node)) return
            setIsDragging(false)
          }}
          onDrop={(event) => {
            event.preventDefault()
            setIsDragging(false)
            if (isSubmitting) return
            handleFileSelected(event.dataTransfer.files?.[0] ?? null)
          }}
          className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
            isSubmitting
              ? 'cursor-not-allowed opacity-60'
              : 'cursor-pointer hover:border-gp-primary'
          } ${
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
            upload_file
          </span>
          <span className="text-sm text-gp-ink-strong dark:text-white font-medium">
            {isDragging ? 'Drop to upload' : file ? file.name : 'Drag a file here, or click to choose'}
          </span>
          <span className="text-xs text-gp-ink-muted">
            {file && !isDragging
              ? formatBytes(file.size)
              : `Accepts ${SUPPORTED_INGEST_SUMMARY} — up to ${MAX_BYTES / (1024 * 1024)} MB`}
          </span>
          <input
            id="upload-document-file"
            type="file"
            accept={INGEST_ACCEPT_ATTRIBUTE}
            className="sr-only"
            onChange={(event) => {
              handleFileSelected(event.target.files?.[0] ?? null)
            }}
            disabled={isSubmitting}
          />
        </label>

        <div>
          <label
            htmlFor="upload-document-hint"
            className="block text-sm font-medium text-gp-ink-strong dark:text-white mb-1"
          >
            Hint (optional)
          </label>
          <input
            id="upload-document-hint"
            type="text"
            value={hint}
            onChange={(event) => setHint(event.target.value)}
            placeholder='e.g. "Meeting notes from the Q2 strategy off-site"'
            disabled={isSubmitting}
            maxLength={200}
            className="w-full rounded-lg border border-gp-glass-border bg-gp-glass-bg px-3 py-2 text-sm text-gp-ink-strong dark:text-white outline-none focus:border-gp-primary disabled:opacity-50"
          />
          <p className="mt-1 text-xs text-gp-ink-muted">
            Optional one-liner that helps the extraction model frame the file.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:bg-red-500/20 dark:text-red-300"
          >
            {error}
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-5 py-2 rounded-lg border border-gp-glass-border text-gp-ink-strong dark:text-white hover:bg-gp-glass-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !file}
            className="px-5 py-2 rounded-lg bg-gp-primary text-white font-medium hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting && (
              <span className="material-symbols-outlined text-base animate-spin">
                hourglass_bottom
              </span>
            )}
            {isSubmitting ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  )
}
