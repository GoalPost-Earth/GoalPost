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
import { ADD_PERSON_TO_FIELD_CONTEXT_MUTATION } from '@/app/graphql/mutations/FIELD_CONTEXT_PEOPLE_MUTATIONS'
import { GET_FIELD_CONTEXT_PEOPLE } from '@/app/graphql/queries/FIELD_CONTEXT_PEOPLE_QUERIES'
import {
  BodySkeleton,
  ErrorBody,
  NotFoundBody,
  SectionHeader,
  SecondaryCta,
  StatCell,
} from './shared'
import { dispatchCloseInfoDrawer, dispatchOpenInfoDrawer } from './types'
import { useFieldContextCanEditContent } from '@/hooks/use-field-context-permissions'
import { ExtractedPersonRow } from './extracted-person-row'

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
        # GOAL-346: lets each extracted person below show whether they are
        # already on the field's roster, so promoting reads as a state change
        # rather than a button that appears to do nothing the second time.
        curatedPersonIds
        # Who is actually ATTACHED. Removing a person from a field disconnects
        # HAS_PERSON but leaves EXTRACTED_FROM, so they keep appearing in this
        # list. Without this, a detached person is indistinguishable from an
        # attached-but-uncurated one, and "promote" would silently re-create
        # the edge — re-granting the PII reach the removal revoked.
        people {
          id
        }
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
  fieldContext?: {
    id: string
    title: string
    curatedPersonIds?: string[] | null
    people?: { id: string }[] | null
  }[]
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
  const [promotePerson] = useMutation(ADD_PERSON_TO_FIELD_CONTEXT_MUTATION)
  // Tracks one row at a time so only the promoted person's control shows a
  // pending state — a shared boolean would freeze every row in the list.
  const [promotingPersonId, setPromotingPersonId] = useState<string | null>(
    null
  )

  // GOAL-346: promoting is a write, so the control is gated on the same
  // client-side `canEditContent` rule the field page uses for its Upload
  // control (GOAL-242) — a GUEST would otherwise get a button the resolver
  // rejects. Read before the early return below, because hooks cannot be
  // called conditionally; the hook skips on a null id and reuses the
  // already-cached roster query rather than issuing a round trip.
  const promoteContextId =
    data?.documents?.[0]?.fieldContext?.[0]?.id ?? null
  const canPromote = useFieldContextCanEditContent(promoteContextId)

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

  // GOAL-346: people this document named are attached to the field but kept
  // off its People roster, so the roster stays a list of members rather than
  // of every name an upload mentioned. Promoting marks the existing
  // HAS_PERSON edge curated and returns them to the roster; the person's
  // EXTRACTED_FROM provenance is untouched, so they keep showing here too.
  const curatedIds = new Set(field?.curatedPersonIds ?? [])
  // Who is still attached to the field. A person absent from this set was
  // deliberately removed from it — re-attaching restores their gated PII to
  // every Space that reaches the context, so that is NOT something a display
  // toggle may do quietly. Those rows get no promote control here; the field
  // page's Add Person flow remains the explicit, labelled way back.
  const attachedIds = new Set((field?.people ?? []).map((p) => p.id))

  const handlePromote = async (personId: string, personName: string) => {
    if (!field?.id) return
    setPromotingPersonId(personId)
    try {
      const result = await promotePerson({
        variables: { contextId: field.id, personId },
        // The roster query is what the field page and the field drawer both
        // render, and it is the thing this write changes — refetch it so the
        // person appears there without a reload. `curatedPersonIds` rides on
        // that same query, so this row's state updates from it too.
        refetchQueries: [
          { query: GET_FIELD_CONTEXT_PEOPLE, variables: { contextId: field.id } },
        ],
        awaitRefetchQueries: true,
      })
      const payload = result.data?.addPersonToFieldContext
      if (payload?.success) {
        toast.success(`${personName || 'Person'} added to ${field.title}.`)
      } else {
        // The resolver deliberately returns one generic failure for missing
        // context, missing person, no edit rights, or a User outside the
        // Space — surface its message rather than inventing a reason.
        toast.error(payload?.message || 'Could not add them to this field.')
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not add them to this field.'
      )
    } finally {
      setPromotingPersonId(null)
    }
  }

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
                <ExtractedPersonRow
                  key={p.id}
                  personId={p.id}
                  name={name}
                  fieldTitle={field?.title}
                  onRoster={curatedIds.has(p.id)}
                  isAttached={attachedIds.has(p.id)}
                  isPromoting={promotingPersonId === p.id}
                  canPromote={canPromote && !!field?.id}
                  onPromote={handlePromote}
                />
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
