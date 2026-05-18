'use client'

import { useCallback, useState } from 'react'

/**
 * Upload-document modal for slice 1 (GOAL-236).
 *
 * Slice-1 constraints (mirrored in `src/lib/ingest/upload-document-input.ts`):
 *   - mimeType allow-list: text/plain
 *   - size cap: 50 KB (base64-inflated stays well under typical request limits)
 *
 * The modal converts the picked File to base64 on the client and hands the
 * result back via `onSubmit`. It deliberately does no network work itself —
 * the parent page wires the mutation so loading / error state is owned where
 * the rest of the field-context state already lives.
 */

const SLICE_ONE_ALLOWED_MIME_TYPES = ['text/plain'] as const
const SLICE_ONE_MAX_SIZE_BYTES = 50 * 1024

export interface UploadDocumentSubmitInput {
  filename: string
  mimeType: string
  fileBase64: string
  hint?: string
}

interface UploadDocumentModalProps {
  isOpen: boolean
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (input: UploadDocumentSubmitInput) => Promise<void>
}

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize)
    binary += String.fromCharCode(...chunk)
  }
  return btoa(binary)
}

function inferMimeType(file: File): string {
  if (file.type) return file.type
  if (/\.txt$/i.test(file.name)) return 'text/plain'
  return ''
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

  const reset = useCallback(() => {
    setFile(null)
    setHint('')
    setError(null)
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
    if (!SLICE_ONE_ALLOWED_MIME_TYPES.includes(mimeType as 'text/plain')) {
      setError('Only .txt files are supported in this preview.')
      return
    }
    if (file.size > SLICE_ONE_MAX_SIZE_BYTES) {
      setError('Files must be 50 KB or smaller in this preview.')
      return
    }

    try {
      setError(null)
      const fileBase64 = await fileToBase64(file)
      await onSubmit({
        filename: file.name,
        mimeType,
        fileBase64,
        hint: hint.trim() ? hint.trim() : undefined,
      })
      reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    }
  }, [file, hint, onSubmit, reset])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gp-surface dark:bg-gp-surface-dark border border-gp-glass-border rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gp-ink-strong dark:text-white">
            Upload Document
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

        <p className="text-sm text-gp-ink-muted dark:text-gp-ink-soft">
          The assistant will read the file and pre-stage entity-creation
          actions in a new thread for you to review and approve.
        </p>

        <label
          htmlFor="upload-document-file"
          className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gp-glass-border bg-gp-glass-bg/40 px-4 py-8 cursor-pointer hover:border-gp-primary transition-colors"
        >
          <span className="material-symbols-outlined text-3xl text-gp-ink-muted">
            upload_file
          </span>
          <span className="text-sm text-gp-ink-strong dark:text-white font-medium">
            {file ? file.name : 'Choose a .txt file'}
          </span>
          <span className="text-xs text-gp-ink-muted">
            {file
              ? `${(file.size / 1024).toFixed(1)} KB`
              : 'Up to 50 KB, text/plain only in this preview'}
          </span>
          <input
            id="upload-document-file"
            type="file"
            accept=".txt,text/plain"
            className="sr-only"
            onChange={(event) => {
              setError(null)
              setFile(event.target.files?.[0] ?? null)
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
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:bg-red-500/20 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
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
            className="px-5 py-2 rounded-lg bg-gp-primary text-white font-medium hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
