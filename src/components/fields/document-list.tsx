'use client'

import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { RE_EXTRACT_DOCUMENT_MUTATION } from '@/app/graphql/mutations'
import { emitOpenAssistantThread } from '@/lib/simulation/assistant-panel-events'

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

export type DocumentIngestThreadRecord = {
  id: string
  title: string
  createdAt: string
}

export type DocumentExtractedPersonRecord = {
  id: string
  firstName: string
  lastName: string
}

export type DocumentExtractedPulseRecord = {
  __typename?: string | null
  id: string
  title: string
}

export type DocumentRecord = {
  id: string
  filename: string
  mimeType: string
  sizeBytes: number
  pageCount?: number | null
  userHint?: string | null
  uploadedAt: string
  extractedPeople?: DocumentExtractedPersonRecord[] | null
  extractedPulses?: DocumentExtractedPulseRecord[] | null
  ingestThreads?: DocumentIngestThreadRecord[] | null
}

interface DocumentListProps {
  documents: DocumentRecord[]
  onRefetch: () => Promise<unknown>
}

function formatDate(value: string | null | undefined): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function pulseKindLabel(typename: string | null | undefined): string {
  if (!typename) return 'Pulse'
  if (typename === 'GoalPulse') return 'Goal'
  if (typename === 'ResourcePulse') return 'Resource'
  if (typename === 'StoryPulse') return 'Story'
  if (typename === 'CarePulse') return 'Care'
  if (typename === 'CoreValuePulse') return 'Core value'
  return 'Pulse'
}

interface DocumentRowProps {
  document: DocumentRecord
  isExpanded: boolean
  isReExtracting: boolean
  onToggleExpand: () => void
  onReExtract: () => void
}

function DocumentRow({
  document,
  isExpanded,
  isReExtracting,
  onToggleExpand,
  onReExtract,
}: DocumentRowProps) {
  const people = document.extractedPeople ?? []
  const pulses = document.extractedPulses ?? []
  const threads = document.ingestThreads ?? []
  const sizeKb = (document.sizeBytes / 1024).toFixed(1)
  const uploaded = formatDate(document.uploadedAt)

  return (
    <li className="rounded-xl border border-gp-glass-border bg-white/50 dark:bg-white/5 transition-colors">
      <div className="flex items-center justify-between gap-3 px-3 py-2">
        <button
          type="button"
          onClick={onToggleExpand}
          aria-expanded={isExpanded}
          className="flex flex-1 min-w-0 items-center gap-2 text-left text-sm text-gp-ink-strong dark:text-white hover:text-gp-primary transition-colors cursor-pointer"
        >
          <span
            className={cn(
              'material-symbols-outlined text-[18px] text-gp-ink-muted transition-transform',
              isExpanded && 'rotate-90'
            )}
            aria-hidden="true"
          >
            chevron_right
          </span>
          <span className="truncate font-medium" title={document.filename}>
            {document.filename}
          </span>
        </button>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-gp-ink-muted whitespace-nowrap">
            {sizeKb} KB
            {typeof document.pageCount === 'number' && document.pageCount > 0
              ? ` · ${document.pageCount} ${document.pageCount === 1 ? 'page' : 'pages'}`
              : ''}
            {uploaded ? ` · ${uploaded}` : ''}
          </span>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onReExtract()
            }}
            disabled={isReExtracting}
            className="rounded-full px-3 py-1 text-xs font-medium border border-amber-500/50 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isReExtracting ? 'Re-extracting…' : 'Re-extract'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gp-glass-border px-4 py-3 space-y-3 text-xs">
          {document.userHint && (
            <div>
              <div className="font-semibold uppercase tracking-wide text-gp-ink-muted mb-1">
                Hint
              </div>
              <p className="text-gp-ink-strong dark:text-white">
                {document.userHint}
              </p>
            </div>
          )}

          <div>
            <div className="font-semibold uppercase tracking-wide text-gp-ink-muted mb-1">
              Extracted people {people.length > 0 ? `(${people.length})` : ''}
            </div>
            {people.length === 0 ? (
              <p className="text-gp-ink-muted">
                None yet — approve the extracted entities in the assistant
                thread to land them here.
              </p>
            ) : (
              <ul className="flex flex-wrap gap-1.5">
                {people.map((person) => {
                  const display =
                    `${person.firstName ?? ''} ${person.lastName ?? ''}`.trim() ||
                    'Person'
                  return (
                    <li
                      key={person.id}
                      className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-emerald-700 dark:text-emerald-300"
                    >
                      {display}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <div>
            <div className="font-semibold uppercase tracking-wide text-gp-ink-muted mb-1">
              Extracted pulses {pulses.length > 0 ? `(${pulses.length})` : ''}
            </div>
            {pulses.length === 0 ? (
              <p className="text-gp-ink-muted">None yet.</p>
            ) : (
              <ul className="flex flex-wrap gap-1.5">
                {pulses.map((pulse) => (
                  <li
                    key={pulse.id}
                    className="rounded-full bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 text-blue-700 dark:text-blue-300"
                    title={pulse.title || undefined}
                  >
                    <span className="font-semibold mr-1">
                      {pulseKindLabel(pulse.__typename)}
                    </span>
                    <span className="truncate inline-block max-w-[180px] align-bottom">
                      {pulse.title}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <div className="font-semibold uppercase tracking-wide text-gp-ink-muted mb-1">
              Ingest threads ({threads.length})
            </div>
            {threads.length === 0 ? (
              <p className="text-gp-ink-muted">
                No threads recorded for this document.
              </p>
            ) : (
              <ul className="space-y-1">
                {threads.map((thread) => (
                  <li
                    key={thread.id}
                    className="flex items-center justify-between gap-2"
                  >
                    <button
                      type="button"
                      onClick={() => emitOpenAssistantThread(thread.id)}
                      className="text-gp-primary hover:underline truncate text-left flex-1 cursor-pointer"
                      title={thread.title}
                    >
                      {thread.title}
                    </button>
                    <span className="text-gp-ink-muted whitespace-nowrap">
                      {formatDate(thread.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </li>
  )
}

export function DocumentList({ documents, onRefetch }: DocumentListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [reExtractingId, setReExtractingId] = useState<string | null>(null)
  const [reExtractDocument] = useMutation(RE_EXTRACT_DOCUMENT_MUTATION)

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
            onToggleExpand={() =>
              setExpandedId((current) =>
                current === document.id ? null : document.id
              )
            }
            onReExtract={() => handleReExtract(document.id)}
          />
        ))}
      </ul>
    </div>
  )
}
