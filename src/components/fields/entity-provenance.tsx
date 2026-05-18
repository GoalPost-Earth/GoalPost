'use client'

import Link from 'next/link'

/**
 * Slice 7 (GOAL-242) — provenance block rendered on extracted entity detail
 * views. Mounted on Person / GoalPulse / ResourcePulse / StoryPulse pages.
 *
 * Reads `extractedFrom: [Document!]!` and renders one row per source document,
 * newest-uploaded first. Renders nothing when the list is empty so manually
 * created entities keep their existing UI unchanged.
 *
 * Rule 1 (kb/07-ai-assistant-ux.md): no raw ids are surfaced — the filename
 * + uploader name + date are the only user-facing fields. Document ids are
 * only used as React keys + Link hrefs for the slice-6 Document detail view.
 */

export interface ProvenanceUploader {
  id: string
  name?: string | null
  firstName?: string | null
  lastName?: string | null
}

export interface ProvenanceDocument {
  id: string
  filename: string
  uploadedAt: string
  uploadedBy?: ProvenanceUploader[] | null
}

interface EntityProvenanceProps {
  documents: ProvenanceDocument[] | null | undefined
}

function uploaderName(uploaders: ProvenanceUploader[] | null | undefined): string {
  const first = uploaders?.[0]
  if (!first) return 'someone'
  const composed = first.name?.trim()
  if (composed) return composed
  const built = [first.firstName, first.lastName]
    .map((part) => (part ?? '').trim())
    .filter(Boolean)
    .join(' ')
  return built || 'someone'
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function EntityProvenance({ documents }: EntityProvenanceProps) {
  const list = (documents ?? []).filter((doc) => !!doc?.filename)
  if (list.length === 0) return null

  const sorted = [...list].sort((a, b) => {
    const aTime = new Date(a.uploadedAt).getTime()
    const bTime = new Date(b.uploadedAt).getTime()
    return Number.isFinite(bTime) && Number.isFinite(aTime) ? bTime - aTime : 0
  })

  return (
    <section
      aria-label="Provenance"
      data-testid="entity-provenance"
      className="rounded-xl border border-gp-glass-border bg-white/50 dark:bg-white/5 px-4 py-3 mb-6"
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="material-symbols-outlined text-[16px] text-gp-ink-muted"
          aria-hidden="true"
        >
          history_edu
        </span>
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-gp-ink-muted dark:text-gp-ink-soft">
          Provenance
        </h4>
      </div>
      <ul className="space-y-1.5">
        {sorted.map((doc) => {
          const name = uploaderName(doc.uploadedBy)
          const date = formatDate(doc.uploadedAt)
          return (
            <li
              key={doc.id}
              className="text-sm text-gp-ink-strong dark:text-gp-ink-strong leading-snug"
            >
              <span>Extracted from </span>
              <Link
                href={`/protected/dashboard/documents/${doc.id}`}
                className="font-medium text-gp-primary hover:underline"
                title={doc.filename}
              >
                {doc.filename}
              </Link>
              <span className="text-gp-ink-muted">
                {' '}— uploaded by {name}
                {date ? ` on ${date}` : ''}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
