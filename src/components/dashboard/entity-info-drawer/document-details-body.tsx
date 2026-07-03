'use client'

import { useState, type FC } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { gql } from '@apollo/client'
import { toast } from 'sonner'
import {
  ArrowRight,
  Calendar,
  ExternalLink,
  FileText,
  Forward,
  Hash,
  HardDrive,
  MessagesSquare,
} from 'lucide-react'
import { emitOpenAssistantThread } from '@/lib/simulation/assistant-panel-events'
import { DELETE_DOCUMENT_MUTATION } from '@/app/graphql/mutations'
import {
  BodySkeleton,
  ErrorBody,
  NotFoundBody,
  SectionHeader,
  SecondaryCta,
  StatCell,
} from './shared'
import { dispatchCloseInfoDrawer, dispatchOpenInfoDrawer } from './types'

const GET_DOCUMENT_BY_ID = gql`
  query DocumentById($documentId: ID!) {
    documents(where: { id_EQ: $documentId }) {
      id
      filename
      mimeType
      sizeBytes
      pageCount
      downloadUrl
      userHint
      summary
      concepts
      uploadedAt
      uploadedBy {
        id
        firstName
        lastName
        name
      }
      fieldContext {
        id
        title
      }
      extractedPeople {
        id
        firstName
        lastName
      }
      extractedPulses {
        __typename
        id
        title
      }
      ingestThreads {
        id
        title
        createdAt
      }
    }
  }
`

interface DocumentDetail {
  id: string
  filename: string
  mimeType: string
  sizeBytes: number
  pageCount: number | null
  downloadUrl: string | null
  userHint: string | null
  summary: string | null
  concepts: string[] | null
  uploadedAt: string
  uploadedBy?: {
    id: string
    firstName: string | null
    lastName: string | null
    name: string | null
  }[]
  fieldContext?: { id: string; title: string }[]
  extractedPeople?: { id: string; firstName: string; lastName: string }[]
  extractedPulses?: {
    __typename: string | null
    id: string
    title: string
  }[]
  ingestThreads?: { id: string; title: string; createdAt: string }[]
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(value: string | undefined | null): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function pulseLabel(typename: string | null | undefined): string {
  switch (typename) {
    case 'GoalPulse':
      return 'Goal'
    case 'ResourcePulse':
      return 'Resource'
    case 'StoryPulse':
      return 'Story'
    case 'CarePulse':
      return 'Care'
    case 'CoreValuePulse':
      return 'Core value'
    default:
      return 'Pulse'
  }
}

export const DocumentDetailsBody: FC<{
  documentId: string
  label?: string
}> = ({ documentId, label }) => {
  const { data, loading, error, refetch } = useQuery<{
    documents?: DocumentDetail[]
  }>(GET_DOCUMENT_BY_ID, {
    variables: { documentId },
    fetchPolicy: 'cache-and-network',
  })
  const [deleteDocument] = useMutation(DELETE_DOCUMENT_MUTATION)
  const [isDeleting, setIsDeleting] = useState(false)

  if (loading && !data)
    return (
      <BodySkeleton
        label={label}
        titleClassName="text-xl font-black tracking-tight text-gp-ink-strong dark:text-white break-all leading-tight"
      />
    )

  const document = data?.documents?.[0]
  if (!document) {
    if (error) return <ErrorBody detail={error.message} onRetry={() => refetch()} />
    return <NotFoundBody />
  }

  const uploader = document.uploadedBy?.[0]
  const uploaderName =
    uploader?.name?.trim() ||
    [uploader?.firstName, uploader?.lastName]
      .map((p) => (p ?? '').trim())
      .filter(Boolean)
      .join(' ') ||
    'someone'
  const field = document.fieldContext?.[0]
  const threads = document.ingestThreads ?? []
  const people = document.extractedPeople ?? []
  const pulses = document.extractedPulses ?? []

  const handleDelete = async () => {
    const ok = window.confirm(
      `Delete "${document.filename}"? The file and provenance record will be removed. Any extracted people or pulses you've already approved will stay.`
    )
    if (!ok) return
    setIsDeleting(true)
    try {
      await deleteDocument({ variables: { documentId } })
      toast.success('Document deleted.')
      if (field?.id) {
        dispatchOpenInfoDrawer({
          type: 'FieldContext',
          id: field.id,
          label: field.title,
        })
      } else {
        dispatchCloseInfoDrawer()
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Delete failed'
      toast.error(message)
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col">
      <section className="relative px-6 pt-7 pb-7 border-b border-gp-glass-border bg-gradient-to-br from-amber-500/20 via-rose-500/10 to-transparent">
        <div className="flex items-start gap-4">
          <div className="shrink-0 size-14 rounded-2xl border flex items-center justify-center shadow-md bg-amber-500/20 border-amber-300/40 text-amber-200">
            <FileText className="w-7 h-7" />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <h2 className="text-xl font-black tracking-tight text-gp-ink-strong dark:text-white break-all leading-tight">
              {document.filename}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] border bg-amber-500/20 border-amber-400/40 text-amber-100">
                {document.mimeType.split('/')[1]?.toUpperCase() || 'Document'}
              </span>
              {field?.id && (
                <button
                  type="button"
                  onClick={() =>
                    dispatchOpenInfoDrawer({
                      type: 'FieldContext',
                      id: field.id,
                      label: field.title,
                    })
                  }
                  className="text-[11px] uppercase tracking-[0.16em] text-gp-ink-muted dark:text-white/50 hover:text-gp-ink-strong dark:hover:text-white/80 transition-colors cursor-pointer"
                >
                  {field.title}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-5 grid grid-cols-2 gap-3">
        <StatCell
          icon={<HardDrive className="w-3.5 h-3.5" />}
          label="Size"
          value={formatBytes(document.sizeBytes)}
        />
        <StatCell
          icon={<Hash className="w-3.5 h-3.5" />}
          label="Pages"
          value={document.pageCount != null ? String(document.pageCount) : '—'}
        />
        <StatCell
          icon={<Calendar className="w-3.5 h-3.5" />}
          label="Uploaded"
          value={formatDate(document.uploadedAt) || '—'}
          valueClassName="text-[12px]"
        />
        <StatCell
          icon={<MessagesSquare className="w-3.5 h-3.5" />}
          label="Threads"
          value={String(threads.length)}
        />
      </section>

      {document.downloadUrl && (
        <section className="px-6 pb-1">
          <a
            href={document.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 px-5 h-11 rounded-xl bg-gp-primary hover:bg-gp-primary/90 text-white font-semibold text-sm shadow-lg shadow-gp-primary/20 transition-all cursor-pointer ring-2 ring-transparent focus-visible:ring-white/40"
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            Open file
          </a>
        </section>
      )}

      <section className="px-6 pt-3 pb-3">
        <p className="text-[11px] text-gp-ink-muted dark:text-white/50">
          Uploaded by {uploaderName}
        </p>
      </section>

      {document.summary && (
        <section className="px-6 pb-5">
          <SectionHeader>Summary</SectionHeader>
          <p className="mt-2 text-sm text-gp-ink-strong dark:text-white/85 leading-relaxed">
            {document.summary}
          </p>
        </section>
      )}

      {document.concepts && document.concepts.length > 0 && (
        <section className="px-6 pb-5">
          <SectionHeader>Concepts</SectionHeader>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {document.concepts.map((concept) => (
              <li
                key={concept}
                className="rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-[11px] text-amber-700 dark:text-amber-300"
              >
                {concept}
              </li>
            ))}
          </ul>
        </section>
      )}

      {document.userHint && (
        <section className="px-6 pb-5">
          <SectionHeader>Hint</SectionHeader>
          <p className="mt-2 text-xs italic text-gp-ink-muted dark:text-white/55">
            “{document.userHint}”
          </p>
        </section>
      )}

      {threads.length > 0 && (
        <section className="px-6 pb-5">
          <SectionHeader>Ingest threads</SectionHeader>
          <ul className="mt-2 space-y-1.5">
            {threads.map((thread) => (
              <li key={thread.id}>
                <button
                  type="button"
                  onClick={() => emitOpenAssistantThread(thread.id)}
                  className="group w-full text-left rounded-xl border border-gp-glass-border bg-white/5 dark:bg-white/[0.03] hover:bg-white/10 dark:hover:bg-white/[0.06] hover:border-white/20 px-3.5 py-2.5 transition-all cursor-pointer flex items-center gap-3"
                >
                  <MessagesSquare className="w-3.5 h-3.5 text-gp-ink-muted dark:text-white/55 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gp-ink-strong dark:text-white/90 truncate">
                      {thread.title}
                    </p>
                    <p className="text-[10px] text-gp-ink-muted dark:text-white/45">
                      {formatDate(thread.createdAt)}
                    </p>
                  </div>
                  <Forward className="w-3.5 h-3.5 text-white/30 group-hover:text-white/70 transition-colors" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {people.length > 0 && (
        <section className="px-6 pb-5">
          <SectionHeader>Extracted people ({people.length})</SectionHeader>
          <ul className="mt-2 space-y-1">
            {people.map((p) => {
              const name = `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim()
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() =>
                      dispatchOpenInfoDrawer({
                        type: 'Person',
                        id: p.id,
                        label: name,
                      })
                    }
                    className="group w-full text-left rounded-lg px-3 py-2 hover:bg-white/5 dark:hover:bg-white/[0.04] transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <span className="text-xs text-gp-ink-strong dark:text-white/85 flex-1">
                      {name || 'Person'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all" />
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {pulses.length > 0 && (
        <section className="px-6 pb-5">
          <SectionHeader>Extracted pulses ({pulses.length})</SectionHeader>
          <ul className="mt-2 space-y-1">
            {pulses.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() =>
                    dispatchOpenInfoDrawer({
                      type: 'Pulse',
                      id: p.id,
                      label: p.title,
                    })
                  }
                  className="group w-full text-left rounded-lg px-3 py-2 hover:bg-white/5 dark:hover:bg-white/[0.04] transition-colors cursor-pointer flex items-center gap-2"
                >
                  <span className="text-[9px] font-bold uppercase tracking-wider text-gp-ink-muted dark:text-white/45 w-14 shrink-0">
                    {pulseLabel(p.__typename)}
                  </span>
                  <span className="text-xs text-gp-ink-strong dark:text-white/85 flex-1 truncate">
                    {p.title}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="mt-auto px-6 py-5 border-t border-gp-glass-border bg-white/[0.02] dark:bg-white/[0.02]">
        <SecondaryCta
          onClick={handleDelete}
          disabled={isDeleting}
          variant="danger"
          className="w-full"
        >
          {isDeleting ? 'Deleting…' : 'Delete document'}
        </SecondaryCta>
      </footer>
    </div>
  )
}
