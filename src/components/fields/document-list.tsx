'use client'

import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { toast } from 'sonner'
import {
  DELETE_DOCUMENT_MUTATION,
  RE_EXTRACT_DOCUMENT_MUTATION,
} from '@/app/graphql/mutations'
import { emitOpenAssistantThread } from '@/lib/simulation/assistant-panel-events'
import { DocumentRow } from './document-list-row'
import type { DocumentRecord } from './document-list-row'

// Re-exported because `document-list` is the established import path for the
// field-context page; the type itself lives with the row component.
export type { DocumentRecord } from './document-list-row'

/**
 * Slice 6 (GOAL-241) — Document list rendered on the FieldContext page.
 *
 *   • Each row shows filename, uploadedAt, page count and a Re-extract action.
 *   • Clicking the filename row expands an inline detail with extracted
 *     entities (people + pulses traced via EXTRACTED_FROM) and every ingest
 *     thread the document has been processed in (one initial upload row plus
 *     one row per Re-extract attempt).
 *   • Re-extract calls `reExtractDocument` and emits an open-thread signal so
 *     the assistant panel auto-switches to the new ingest thread.
 *
 * Re-extract is the uniform retry surface (PRD § Failure handling) — there
 * is intentionally no "Retry" button inside the ingest thread itself.
 */

interface DocumentListProps {
  documents: DocumentRecord[]
  onRefetch: () => Promise<unknown>
}

export function DocumentList({ documents, onRefetch }: DocumentListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [reExtractingId, setReExtractingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [reExtractDocument] = useMutation(RE_EXTRACT_DOCUMENT_MUTATION)
  const [deleteDocument] = useMutation(DELETE_DOCUMENT_MUTATION)

  if (documents.length === 0) return null

  const handleReExtract = async (documentId: string) => {
    setReExtractingId(documentId)
    try {
      const result = await reExtractDocument({ variables: { documentId } })
      const newThreadId = (
        result.data as
          | {
              reExtractDocument?: { threadId?: string }
            }
          | null
          | undefined
      )?.reExtractDocument?.threadId
      if (newThreadId) emitOpenAssistantThread(newThreadId)
      toast.success(
        'Re-extraction started. Review the new proposals in the assistant.'
      )
      await onRefetch()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Re-extract failed'
      toast.error(message)
    } finally {
      setReExtractingId(null)
    }
  }

  const handleDelete = async (documentId: string, filename: string) => {
    // Per PRD: extracted Persons and FieldPulses survive deletion. The
    // confirmation copy makes that explicit so the user isn't surprised.
    const ok = window.confirm(
      `Delete "${filename}"? The file and provenance record will be removed. Any people or pulses extracted from it will stay.`
    )
    if (!ok) return

    setDeletingId(documentId)
    try {
      await deleteDocument({ variables: { documentId } })
      toast.success('Document deleted.')
      if (expandedId === documentId) setExpandedId(null)
      await onRefetch()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Delete failed'
      toast.error(message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="mb-10 rounded-2xl border border-gp-glass-border bg-gp-glass-bg/40 p-5">
      <div className="flex items-center gap-2 mb-3">
        <span
          className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-[20px]"
          aria-hidden="true"
        >
          description
        </span>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gp-ink-strong dark:text-white">
          Uploaded Documents
        </h2>
      </div>
      <ul className="space-y-2">
        {documents.map((document) => (
          <DocumentRow
            key={document.id}
            document={document}
            isExpanded={expandedId === document.id}
            isReExtracting={reExtractingId === document.id}
            isDeleting={deletingId === document.id}
            onToggleExpand={() =>
              setExpandedId((current) =>
                current === document.id ? null : document.id
              )
            }
            onReExtract={() => handleReExtract(document.id)}
            onDelete={() => handleDelete(document.id, document.filename)}
          />
        ))}
      </ul>
    </div>
  )
}
