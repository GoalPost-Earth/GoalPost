'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { gql } from '@apollo/client'
import { useEffect } from 'react'
import { ProfileBackground } from '@/components/persons/profile-background'
import { ProfileLayout } from '@/components/persons/profile-layout'
import { SectionHeader } from '@/components/persons/section-header'
import { ProfileCard } from '@/components/persons/profile-card'
import { usePageContext } from '@/contexts'
import { emitOpenAssistantThread } from '@/lib/simulation/assistant-panel-events'

/**
 * Slice 7 (GOAL-242) — Document detail view, reached by clicking the filename
 * inside an EntityProvenance block. Slice 6 wired the inline expansion on the
 * FieldContext page; this surface is the deep-link destination so provenance
 * links elsewhere in the app have somewhere to go.
 *
 * Read access flows through Document's @authorization directive — non-members
 * of the parent Space simply get an empty query result, which renders as
 * "Document not found" rather than leaking metadata.
 */

const GET_DOCUMENT_BY_ID = gql`
  query DocumentById($documentId: ID!) {
    documents(where: { id_EQ: $documentId }) {
      id
      filename
      mimeType
      sizeBytes
      pageCount
      userHint
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
  userHint: string | null
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

function pulseKindLabel(typename: string | null | undefined): string {
  if (typename === 'GoalPulse') return 'Goal'
  if (typename === 'ResourcePulse') return 'Resource'
  if (typename === 'StoryPulse') return 'Story'
  if (typename === 'CarePulse') return 'Care'
  if (typename === 'CoreValuePulse') return 'Core value'
  return 'Pulse'
}

export default function DocumentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { setPageTitle } = usePageContext()
  const documentId = params?.id as string

  useEffect(() => {
    setPageTitle('Document')
  }, [setPageTitle])

  const { data, loading } = useQuery<{ documents?: DocumentDetail[] }>(
    GET_DOCUMENT_BY_ID,
    {
      variables: { documentId },
      skip: !documentId,
    }
  )

  const document = data?.documents?.[0]
  const uploader = document?.uploadedBy?.[0]
  const uploaderName =
    uploader?.name?.trim() ||
    [uploader?.firstName, uploader?.lastName]
      .map((p) => (p ?? '').trim())
      .filter(Boolean)
      .join(' ') ||
    'someone'
  const field = document?.fieldContext?.[0]
  const threads = document?.ingestThreads ?? []
  const people = document?.extractedPeople ?? []
  const pulses = document?.extractedPulses ?? []

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-50 bg-gp-surface/50 dark:bg-gp-surface-dark/50 backdrop-blur-sm">
        <p className="text-sm font-medium text-gp-ink-muted dark:text-gp-ink-soft">
          Loading…
        </p>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="relative min-h-screen overflow-x-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors flex items-center justify-center">
        <div className="text-sm text-gp-ink-muted">Document not found.</div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors pt-20">
      <ProfileBackground />
      <main className="relative">
        <ProfileLayout>
          <div className="flex flex-col items-center text-center mb-12">
            <span className="text-[9px] uppercase font-semibold text-gp-primary mb-2">
              {document.mimeType.split('/')[1]?.toUpperCase() || 'Document'} •{' '}
              {field?.title ?? 'Field'}
            </span>
            <h1 className="text-3xl md:text-4xl font-light tracking-tight text-gp-ink-strong dark:text-gp-ink-strong mb-2 break-all">
              {document.filename}
            </h1>
            <p className="text-xs text-gp-ink-muted dark:text-gp-ink-soft">
              Uploaded by {uploaderName} on {formatDate(document.uploadedAt)}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="flex flex-col gap-4">
              <SectionHeader icon="info" title="Details" />
              <ProfileCard>
                <div className="space-y-2 text-sm text-gp-ink-strong dark:text-white">
                  <div className="flex justify-between text-xs text-gp-ink-muted">
                    <span>Size</span>
                    <span>{formatBytes(document.sizeBytes)}</span>
                  </div>
                  {document.pageCount != null && (
                    <div className="flex justify-between text-xs text-gp-ink-muted">
                      <span>Pages</span>
                      <span>{document.pageCount}</span>
                    </div>
                  )}
                  {document.userHint && (
                    <div className="pt-1">
                      <span className="text-[10px] uppercase tracking-widest text-gp-ink-muted">
                        Hint
                      </span>
                      <p className="text-xs italic text-gp-ink-muted">
                        “{document.userHint}”
                      </p>
                    </div>
                  )}
                </div>
              </ProfileCard>
            </div>

            <div className="flex flex-col gap-4">
              <SectionHeader icon="forum" title="Ingest threads" />
              <ProfileCard>
                {threads.length === 0 ? (
                  <p className="text-xs text-gp-ink-muted">No ingest threads.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {threads.map((thread) => (
                      <li key={thread.id}>
                        <button
                          type="button"
                          onClick={() => emitOpenAssistantThread(thread.id)}
                          className="text-left text-xs text-gp-primary hover:underline cursor-pointer"
                        >
                          {thread.title}
                          <span className="text-gp-ink-muted">
                            {' '}— {formatDate(thread.createdAt)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </ProfileCard>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="flex flex-col gap-4">
              <SectionHeader icon="group" title="Extracted people" />
              <ProfileCard>
                {people.length === 0 ? (
                  <p className="text-xs text-gp-ink-muted">None.</p>
                ) : (
                  <ul className="space-y-1">
                    {people.map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/protected/dashboard/persons/${p.id}`)
                          }
                          className="text-left text-sm text-gp-ink-strong dark:text-white hover:text-gp-primary cursor-pointer"
                        >
                          {`${p.firstName} ${p.lastName}`.trim()}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </ProfileCard>
            </div>

            <div className="flex flex-col gap-4">
              <SectionHeader icon="bolt" title="Extracted pulses" />
              <ProfileCard>
                {pulses.length === 0 ? (
                  <p className="text-xs text-gp-ink-muted">None.</p>
                ) : (
                  <ul className="space-y-1">
                    {pulses.map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/protected/dashboard/pulses/${p.id}`)
                          }
                          className="text-left text-sm text-gp-ink-strong dark:text-white hover:text-gp-primary cursor-pointer"
                        >
                          <span className="text-[10px] uppercase tracking-widest text-gp-ink-muted mr-2">
                            {pulseKindLabel(p.__typename)}
                          </span>
                          {p.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </ProfileCard>
            </div>
          </div>

          {field && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/protected/dashboard/field-context/${field.id}`
                  )
                }
                className="px-6 py-2 rounded-full text-xs font-semibold border border-gp-primary/30 text-gp-primary hover:bg-gp-primary/5 transition-all cursor-pointer"
              >
                Back to {field.title}
              </button>
            </div>
          )}
        </ProfileLayout>
      </main>
    </div>
  )
}
