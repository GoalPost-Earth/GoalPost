'use client'

import { type FC } from 'react'
import { useQuery } from '@apollo/client/react'
import { cn } from '@/lib/utils'
import { GET_PROMISE_WEAVE_DETAILS } from '@/app/graphql/queries/PROMISE_WEAVE_QUERIES'
import {
  getIconForType,
  getConfigForType,
  type NodeType,
} from '@/lib/pulse-type-config'
import {
  getWeaveOriginLabel,
  getWeaveStatusClass,
  getWeaveStatusLabel,
} from '@/lib/promise-weave'
import {
  BodySkeleton,
  ErrorBody,
  NotFoundBody,
  SectionHeader,
} from './shared'
import { dispatchOpenInfoDrawer } from './types'

function typenameToNodeType(typename: string): NodeType {
  const map: Record<string, NodeType> = {
    GoalPulse: 'goal',
    ResourcePulse: 'resource',
    StoryPulse: 'story',
    CarePulse: 'care',
    CoreValuePulse: 'coreValue',
  }
  return map[typename] ?? 'goal'
}

function composePersonName(p: {
  name?: string | null
  firstName?: string | null
  lastName?: string | null
}): string {
  const composed = `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim()
  return p.name?.trim() || composed || 'Someone'
}

/**
 * Details for a PromiseWeave — the connective node migrated care points became
 * and that members now author directly (kb/05-data-entities.md). Mirrors
 * ResonanceDetailsBody. Editing lives on the field-context page's Promise
 * weaves section, which owns the pulse/person pickers this drawer has no
 * candidates for; the drawer stays a reading surface.
 */
export const PromiseWeaveDetailsBody: FC<{
  weaveId: string
  label?: string
}> = ({ weaveId, label }) => {
  const { data, loading, error, refetch } = useQuery(
    GET_PROMISE_WEAVE_DETAILS,
    {
      variables: { weaveId },
      fetchPolicy: 'cache-and-network',
    }
  )

  if (loading && !data) return <BodySkeleton label={label} />

  const weave = data?.promiseWeaves?.[0]
  if (!weave) {
    if (error) return <ErrorBody detail={error.message} onRetry={() => refetch()} />
    return <NotFoundBody />
  }

  const wovenPulses = (weave.weaves ?? []).filter(
    (p): p is NonNullable<typeof p> => Boolean(p?.id)
  )
  const person = weave.wovenFor?.[0]
  const author = weave.createdBy?.[0]
  // Migrated weaves have modifiedAt mirrored from createdAt, so only show it
  // once it actually differs — otherwise every one reads as freshly updated.
  const updatedLabel =
    weave.modifiedAt && weave.modifiedAt !== weave.createdAt
      ? new Date(weave.modifiedAt).toLocaleDateString()
      : null

  return (
    <div className="flex flex-col">
      <section className="relative px-6 pt-7 pb-7 border-b border-gp-glass-border bg-gradient-to-br from-gp-primary/20 via-gp-accent-glow/10 to-transparent">
        <div className="flex items-start gap-4">
          <div className="shrink-0 size-14 rounded-2xl border flex items-center justify-center shadow-md bg-gp-primary/20 border-gp-primary/40 text-gp-primary">
            <span className="material-symbols-outlined text-[28px] leading-none">
              account_tree
            </span>
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-gp-ink-strong dark:text-white break-words leading-tight">
              {weave.title || 'Promise weave'}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] border bg-gp-primary/20 border-gp-primary/40 text-gp-primary">
                Promise weave
              </span>
              <span
                className={cn(
                  'inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] border',
                  getWeaveStatusClass(weave.status)
                )}
              >
                {getWeaveStatusLabel(weave.status)}
              </span>
            </div>
            <p className="text-[11px] text-gp-ink-muted dark:text-white/60">
              {/* Name the author when the CREATED_BY edge is there — `origin`
                  alone only says *a* member wove it, never which one. */}
              {author
                ? `Woven by ${composePersonName(author)}`
                : getWeaveOriginLabel(weave.origin)}
              {updatedLabel ? ` · Updated ${updatedLabel}` : ''}
            </p>
          </div>
        </div>
      </section>

      {weave.description && (
        <section className="px-6 py-5 border-b border-gp-glass-border">
          <SectionHeader>Why</SectionHeader>
          <p className="mt-2 text-sm text-gp-ink-strong dark:text-white/85 leading-relaxed">
            {weave.description}
          </p>
        </section>
      )}

      {person && (
        <section className="px-6 py-5 border-b border-gp-glass-border">
          <SectionHeader>For</SectionHeader>
          <button
            type="button"
            onClick={() =>
              dispatchOpenInfoDrawer({
                type: 'Person',
                id: person.id,
                label: composePersonName(person),
              })
            }
            className="group mt-2 inline-flex items-center gap-2 text-sm text-gp-ink-strong dark:text-white hover:text-gp-primary dark:hover:text-gp-primary transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-gp-primary">
              person
            </span>
            <span className="font-semibold">{composePersonName(person)}</span>
            <span className="material-symbols-outlined text-[16px] text-gp-ink-soft group-hover:translate-x-0.5 transition-transform">
              chevron_right
            </span>
          </button>
        </section>
      )}

      <section className="px-6 py-5 space-y-3">
        <SectionHeader>
          Weaves {wovenPulses.length > 0 ? `· ${wovenPulses.length}` : ''}
        </SectionHeader>
        {wovenPulses.length === 0 ? (
          <p className="text-sm text-gp-ink-muted dark:text-white/60 italic">
            This weave isn’t connected to any pulses yet.
          </p>
        ) : (
          <div className="space-y-3">
            {wovenPulses.map((pulse) => (
              <WovenPulseCard key={pulse.id} pulse={pulse} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

const WovenPulseCard: FC<{
  pulse: {
    id: string
    __typename?: string
    title?: string | null
    content?: string | null
  }
}> = ({ pulse }) => {
  const nodeType = typenameToNodeType(pulse.__typename ?? '')
  const config = getConfigForType(nodeType)
  return (
    <button
      type="button"
      onClick={() =>
        dispatchOpenInfoDrawer({
          type: 'Pulse',
          id: pulse.id,
          label: pulse.title ?? undefined,
        })
      }
      className="group w-full text-left rounded-2xl border border-gp-glass-border bg-white/30 dark:bg-white/5 hover:bg-white/40 dark:hover:bg-white/[0.08] transition-all px-5 py-4 cursor-pointer"
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className={cn('material-symbols-outlined text-[16px]', config.color)}
        >
          {getIconForType(nodeType)}
        </span>
        <span
          className={cn(
            'text-[10px] font-bold tracking-widest uppercase',
            config.color
          )}
        >
          {(pulse.__typename ?? 'Pulse').replace('Pulse', '')}
        </span>
        <span className="material-symbols-outlined text-[16px] text-gp-ink-soft ml-auto group-hover:translate-x-0.5 transition-transform">
          chevron_right
        </span>
      </div>
      <h3 className="text-sm font-semibold text-gp-ink-strong dark:text-white leading-tight mb-1">
        {pulse.title || 'Untitled pulse'}
      </h3>
      {pulse.content && (
        <p className="text-xs text-gp-ink-muted dark:text-white/65 line-clamp-2">
          {pulse.content}
        </p>
      )}
    </button>
  )
}
