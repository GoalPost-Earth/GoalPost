'use client'

import { type FC } from 'react'
import { useQuery } from '@apollo/client/react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { GET_ORGANIZATION_DETAILS } from '@/app/graphql/queries/ORGANIZATION_QUERIES'
import { LinkifiedText } from '@/components/ui/linkified-text'
import {
  getIconForType,
  getConfigForType,
  ORGANIZATION_CONFIG,
  type NodeType,
} from '@/lib/pulse-type-config'
import { BodySkeleton, ErrorBody, NotFoundBody, SectionHeader } from './shared'
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

/**
 * Read-only details for an Organization (GOAL-298 / GOAL-299) — a first-class
 * relational entity (cooperative / company / group named in a Space), NOT a
 * pulse. The type carries `@mutation(operations: [])`, so orgs are minted and
 * enriched only by the doc-ingestion write path — there is no edit/delete
 * affordance here. Mirrors PromiseWeaveDetailsBody. An empty result is the
 * correct "no longer available" state: the type-level `contexts_SOME` READ
 * filter fully removes an org the viewer can't reach through any visible Space.
 */
export const OrganizationDetailsBody: FC<{
  organizationId: string
  label?: string
}> = ({ organizationId, label }) => {
  const { data, loading, error, refetch } = useQuery(GET_ORGANIZATION_DETAILS, {
    variables: { organizationId },
    fetchPolicy: 'cache-and-network',
  })

  if (loading && !data) return <BodySkeleton label={label} />

  const org = data?.organizations?.[0]
  if (!org) {
    if (error)
      return <ErrorBody detail={error.message} onRetry={() => refetch()} />
    return <NotFoundBody />
  }

  const relatedPulses = (org.mentionedIn ?? []).filter(
    (p): p is NonNullable<typeof p> => Boolean(p?.id)
  )
  const contexts = (org.contexts ?? []).filter(
    (c): c is NonNullable<typeof c> => Boolean(c?.id)
  )
  const createdAgo = org.createdAt
    ? formatDistanceToNow(new Date(org.createdAt as string), {
        addSuffix: true,
      })
    : null

  return (
    <div className="flex flex-col">
      <section className="relative px-6 pt-7 pb-7 border-b border-gp-glass-border bg-gradient-to-br from-gp-org/20 via-gp-accent-glow/10 to-transparent">
        <div className="flex items-start gap-4">
          <div className="shrink-0 size-14 rounded-2xl border flex items-center justify-center shadow-md bg-gp-org/20 border-gp-org/40 text-gp-org">
            <span className="material-symbols-outlined text-[28px] leading-none">
              {ORGANIZATION_CONFIG.icon}
            </span>
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-gp-ink-strong dark:text-white break-words leading-tight">
              {org.name || label || 'Organization'}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] border bg-gp-org/15 border-gp-org/40 text-gp-org">
                <span className="material-symbols-outlined text-[13px] leading-none">
                  {ORGANIZATION_CONFIG.icon}
                </span>
                Organization
              </span>
              {createdAgo && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] border border-gp-glass-border text-gp-ink-muted dark:text-white/60">
                  {createdAgo}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {org.description && (
        <section className="px-6 py-5 border-b border-gp-glass-border">
          <SectionHeader>About</SectionHeader>
          <LinkifiedText
            text={org.description}
            className="mt-2 text-sm text-gp-ink-strong dark:text-white/85 leading-relaxed break-words"
          />
        </section>
      )}

      <section className="px-6 py-5 space-y-3">
        <SectionHeader>
          Related pulses{relatedPulses.length > 0 ? ` · ${relatedPulses.length}` : ''}
        </SectionHeader>
        {relatedPulses.length === 0 ? (
          <p className="text-sm text-gp-ink-muted dark:text-white/60 italic">
            This organization isn’t linked to any pulses yet.
          </p>
        ) : (
          <div className="space-y-3">
            {relatedPulses.map((pulse) => (
              <RelatedPulseCard key={pulse.id} pulse={pulse} />
            ))}
          </div>
        )}
      </section>

      {contexts.length > 0 && (
        <section className="px-6 py-5 border-t border-gp-glass-border space-y-2">
          <SectionHeader>Appears in</SectionHeader>
          <div className="flex flex-wrap gap-2">
            {contexts.map((ctx) => (
              <button
                key={ctx.id}
                type="button"
                onClick={() =>
                  dispatchOpenInfoDrawer({
                    type: 'FieldContext',
                    id: ctx.id,
                    label: ctx.title ?? undefined,
                  })
                }
                className="group inline-flex items-center gap-1.5 max-w-full rounded-full border border-gp-glass-border bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 transition-colors px-3 py-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px] text-gp-ink-soft shrink-0">
                  hub
                </span>
                <span className="truncate text-xs font-medium text-gp-ink-strong dark:text-white/85">
                  {ctx.title || 'Field'}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

const RelatedPulseCard: FC<{
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
        <span className="material-symbols-outlined text-[16px] text-gp-ink-soft ml-auto group-hover:translate-x-0.5 transition-transform shrink-0">
          chevron_right
        </span>
      </div>
      <h3 className="text-sm font-semibold text-gp-ink-strong dark:text-white leading-tight mb-1 break-words">
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
