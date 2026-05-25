'use client'

import { type FC } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import {
  ArrowRight,
  FileText,
  Layers,
  Sparkles,
  Users,
  Waves,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { GET_FIELD_CONTEXT_DETAILS } from '@/app/graphql/queries/FIELD_CONTEXT_DETAILS_QUERIES'
import { GET_FIELD_CONTEXT_PEOPLE } from '@/app/graphql/queries/FIELD_CONTEXT_PEOPLE_QUERIES'
import { GET_DOCUMENTS_BY_FIELD_CONTEXT } from '@/app/graphql/queries/DOCUMENT_QUERIES'
import { formatResonanceLabel } from '@/utils/graph-utils'
import {
  BodySkeleton,
  NotFoundBody,
  PrimaryCta,
  SectionHeader,
  StatCell,
} from './shared'
import { dispatchCloseInfoDrawer, dispatchOpenInfoDrawer } from './types'

/**
 * Field context inspection — pulse counts, recent pulses, resonances,
 * people, documents, parent space. Heavy mutation surfaces from the
 * deleted route (create-pulse modal, add-person flow, doc-upload UI)
 * are not reproduced here; the assistant and the nested fields routes
 * under /protected/spaces remain the entry points for those workflows.
 */
export const FieldContextDetailsBody: FC<{ contextId: string }> = ({
  contextId,
}) => {
  const router = useRouter()
  const { data, loading } = useQuery(GET_FIELD_CONTEXT_DETAILS, {
    variables: { contextId },
    fetchPolicy: 'cache-and-network',
  })

  const { data: peopleData } = useQuery<{
    fieldContexts?: {
      id: string
      people?: {
        id: string
        name: string | null
        firstName: string | null
        lastName: string | null
        email: string | null
        photo: string | null
      }[]
    }[]
  }>(GET_FIELD_CONTEXT_PEOPLE, {
    variables: { contextId },
    fetchPolicy: 'cache-and-network',
  })

  const { data: docsData } = useQuery<{
    documentsByFieldContext?: {
      id: string
      filename: string
      uploadedAt: string
    }[]
  }>(GET_DOCUMENTS_BY_FIELD_CONTEXT, {
    variables: { fieldContextId: contextId },
    fetchPolicy: 'cache-and-network',
  })

  if (loading && !data) return <BodySkeleton />

  const context = data?.fieldContexts?.[0]
  if (!context) return <NotFoundBody />

  const goal = data?.goalPulses ?? []
  const resource = data?.resourcePulses ?? []
  const story = data?.storyPulses ?? []
  const care = data?.carePulses ?? []
  const coreValue = data?.coreValuePulses ?? []
  const allPulses = [...goal, ...resource, ...story, ...care, ...coreValue].sort(
    (a, b) =>
      new Date(b.createdAt ?? 0).getTime() -
      new Date(a.createdAt ?? 0).getTime()
  )

  const resonances = context.resonancesInContext ?? []
  const space = context.space?.[0]
  const isMe = space?.__typename === 'MeSpace'
  const people = peopleData?.fieldContexts?.[0]?.people ?? []
  const documents = docsData?.documentsByFieldContext ?? []

  return (
    <div className="flex flex-col">
      <section className="relative px-6 pt-7 pb-7 border-b border-gp-glass-border bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent">
        <div className="flex items-start gap-4">
          <div className="shrink-0 size-14 rounded-2xl border flex items-center justify-center shadow-md bg-indigo-500/20 border-indigo-300/40 text-indigo-200">
            <Layers className="w-7 h-7" />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-gp-ink-strong dark:text-white break-words leading-tight">
              {context.title || context.emergentName || 'Untitled field'}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] border bg-indigo-500/20 border-indigo-400/40 text-indigo-100">
                Field context
              </span>
              {space?.name && (
                <button
                  type="button"
                  onClick={() =>
                    dispatchOpenInfoDrawer({
                      type: isMe ? 'MeSpace' : 'WeSpace',
                      id: space.id,
                      label: space.name,
                    })
                  }
                  className="text-[11px] uppercase tracking-[0.16em] text-gp-ink-muted dark:text-white/50 hover:text-gp-ink-strong dark:hover:text-white/80 transition-colors cursor-pointer"
                  title={`Open ${space.name}`}
                >
                  {isMe ? 'Me Space' : 'We Space'} · {space.name}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-5 grid grid-cols-2 gap-3">
        <StatCell
          icon={<Sparkles className="w-3.5 h-3.5" />}
          label="Pulses"
          value={String(allPulses.length)}
        />
        <StatCell
          icon={<Waves className="w-3.5 h-3.5" />}
          label="Resonances"
          value={String(resonances.length)}
        />
        <StatCell
          icon={<Users className="w-3.5 h-3.5" />}
          label="People"
          value={String(people.length)}
        />
        <StatCell
          icon={<FileText className="w-3.5 h-3.5" />}
          label="Documents"
          value={String(documents.length)}
        />
      </section>

      {allPulses.length > 0 && (
        <section className="px-6 pb-5">
          <SectionHeader>Recent pulses ({allPulses.length})</SectionHeader>
          <ul className="mt-2 space-y-1.5">
            {allPulses.slice(0, 8).map((pulse) => (
              <li key={pulse.id}>
                <button
                  type="button"
                  onClick={() =>
                    dispatchOpenInfoDrawer({
                      type: 'Pulse',
                      id: pulse.id,
                      label: pulse.title ?? undefined,
                    })
                  }
                  className="group w-full text-left rounded-xl border border-gp-glass-border bg-white/5 dark:bg-white/[0.03] hover:bg-white/10 dark:hover:bg-white/[0.06] hover:border-white/20 px-3.5 py-2.5 transition-all cursor-pointer flex items-center gap-3"
                >
                  <span className="text-[9px] font-bold uppercase tracking-wider text-gp-ink-muted dark:text-white/45 w-14 shrink-0">
                    {typenameLabel(pulse.__typename)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gp-ink-strong dark:text-white/90 truncate">
                      {pulse.title || 'Untitled'}
                    </p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all" />
                </button>
              </li>
            ))}
            {allPulses.length > 8 && (
              <li className="text-[11px] text-gp-ink-muted dark:text-white/45 px-3 pt-1">
                + {allPulses.length - 8} more
              </li>
            )}
          </ul>
        </section>
      )}

      {resonances.length > 0 && (
        <section className="px-6 pb-5">
          <SectionHeader>Resonances ({resonances.length})</SectionHeader>
          <ul className="mt-2 space-y-1.5">
            {resonances.slice(0, 6).map((res) => {
              const src = res.source?.[0]
              const tgt = res.target?.[0]
              const srcTitle =
                (src && 'title' in src ? src.title : undefined) ?? 'Pulse'
              const tgtTitle =
                (tgt && 'title' in tgt ? tgt.title : undefined) ?? 'Pulse'
              return (
                <li key={res.id}>
                  <button
                    type="button"
                    onClick={() =>
                      dispatchOpenInfoDrawer({
                        type: 'ResonanceLink',
                        id: res.id,
                        label: res.label ?? undefined,
                      })
                    }
                    className={cn(
                      'group w-full text-left rounded-xl border border-gp-glass-border bg-white/5 dark:bg-white/[0.03]',
                      'hover:bg-white/10 dark:hover:bg-white/[0.06] hover:border-white/20',
                      'px-3.5 py-2.5 transition-all cursor-pointer'
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gp-primary truncate">
                        {formatResonanceLabel(res.label ?? null)}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                    <p className="mt-1 text-[11px] text-gp-ink-muted dark:text-white/55 truncate">
                      {srcTitle} ↔ {tgtTitle}
                    </p>
                  </button>
                </li>
              )
            })}
            {resonances.length > 6 && (
              <li className="text-[11px] text-gp-ink-muted dark:text-white/45 px-3 pt-1">
                + {resonances.length - 6} more
              </li>
            )}
          </ul>
        </section>
      )}

      {people.length > 0 && (
        <section className="px-6 pb-5">
          <SectionHeader>People ({people.length})</SectionHeader>
          <ul className="mt-2 grid grid-cols-2 gap-1.5">
            {people.slice(0, 8).map((person) => {
              const name =
                person.name?.trim() ||
                `${person.firstName ?? ''} ${person.lastName ?? ''}`.trim() ||
                'Member'
              return (
                <li key={person.id}>
                  <button
                    type="button"
                    onClick={() =>
                      dispatchOpenInfoDrawer({
                        type: 'Person',
                        id: person.id,
                        label: name,
                      })
                    }
                    className="group w-full text-left rounded-lg border border-gp-glass-border bg-white/5 dark:bg-white/[0.03] hover:bg-white/10 dark:hover:bg-white/[0.06] hover:border-white/20 px-2 py-1.5 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <div className="size-6 shrink-0 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-[9px] font-bold text-white/80">
                      {name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-[11px] font-medium text-gp-ink-strong dark:text-white/85 truncate">
                      {name}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {documents.length > 0 && (
        <section className="px-6 pb-5">
          <SectionHeader>Documents ({documents.length})</SectionHeader>
          <ul className="mt-2 space-y-1.5">
            {documents.slice(0, 5).map((doc) => (
              <li key={doc.id}>
                <button
                  type="button"
                  onClick={() =>
                    dispatchOpenInfoDrawer({
                      type: 'Document',
                      id: doc.id,
                      label: doc.filename,
                    })
                  }
                  className="group w-full text-left rounded-xl border border-gp-glass-border bg-white/5 dark:bg-white/[0.03] hover:bg-white/10 dark:hover:bg-white/[0.06] hover:border-white/20 px-3.5 py-2.5 transition-all cursor-pointer flex items-center gap-3"
                >
                  <FileText className="w-3.5 h-3.5 text-gp-ink-muted dark:text-white/55 shrink-0" />
                  <span className="text-xs font-medium text-gp-ink-strong dark:text-white/85 truncate flex-1">
                    {doc.filename}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all" />
                </button>
              </li>
            ))}
            {documents.length > 5 && (
              <li className="text-[11px] text-gp-ink-muted dark:text-white/45 px-3 pt-1">
                + {documents.length - 5} more
              </li>
            )}
          </ul>
        </section>
      )}

      <footer className="mt-auto px-6 py-5 border-t border-gp-glass-border bg-white/[0.02] dark:bg-white/[0.02]">
        <PrimaryCta
          onClick={() => {
            dispatchCloseInfoDrawer()
            router.push(`/protected/dashboard/field-context/${context.id}`)
          }}
          className="w-full"
        >
          Open full page
          <ArrowRight className="w-4 h-4" />
        </PrimaryCta>
      </footer>
    </div>
  )
}

function typenameLabel(typename: string | null | undefined): string {
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
      return 'Value'
    default:
      return 'Pulse'
  }
}
