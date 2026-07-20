'use client'

import React from 'react'
import {
  GET_ALL_PULSES,
  GET_ALL_PULSES_BY_CONTEXT,
  GET_ALL_PULSES_BY_SPACE,
} from '@/app/graphql/queries'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { useQuery, useApolloClient } from '@apollo/client/react'
import { getConfigForType, type NodeType } from '@/lib/pulse-type-config'
import { useFocalEntity } from '@/contexts'
import { dispatchOpenInfoDrawer } from '@/components/dashboard/entity-info-drawer'

type PulseType =
  | 'GoalPulse'
  | 'ResourcePulse'
  | 'StoryPulse'
  | 'CoreValuePulse'

// Map each pulse __typename to its NodeType key so icon, text color, and the
// themed color token all come from pulse-type-config (the single source of
// truth) instead of hardcoded palette classes — this keeps the card tints in
// lock-step with the active theme in light, dark, and every theme variant.
const typenameToNodeType: Record<PulseType, NodeType> = {
  GoalPulse: 'goal',
  ResourcePulse: 'resource',
  StoryPulse: 'story',
  CoreValuePulse: 'coreValue',
}

/** Soft, theme-aware tint for an entity's icon chip + type pill. */
function entityTint(cssVar: string): React.CSSProperties {
  return {
    backgroundColor: `color-mix(in srgb, var(${cssVar}) 14%, transparent)`,
    borderColor: `color-mix(in srgb, var(${cssVar}) 30%, transparent)`,
  }
}

interface ActivePulsesProps {
  showAll?: boolean
  onViewAll?: () => void
}

export function ActivePulses({
  showAll = false,
  onViewAll,
}: ActivePulsesProps) {
  const client = useApolloClient()
  const { sessionContext } = useFocalEntity()

  // Three modes, picked by which scope the user is currently in:
  //   FieldContext  → narrow to that single context's pulses
  //   Space (only)  → all pulses across every context in the active Space
  //   neutral       → existing behaviour, full ambient list
  // The May 11 four-mode pivot requires the dashboard to honour the focal
  // entity in lock-step with chat / graph / voice — see GOAL-231.
  const { activeSpaceId, activeFieldContextId } = sessionContext
  const scope: 'context' | 'space' | 'all' = activeFieldContextId
    ? 'context'
    : activeSpaceId
      ? 'space'
      : 'all'

  const ctxQuery = useQuery(GET_ALL_PULSES_BY_CONTEXT, {
    variables: { contextId: activeFieldContextId ?? '' },
    skip: scope !== 'context',
    fetchPolicy: 'network-only',
  })
  const spaceQuery = useQuery(GET_ALL_PULSES_BY_SPACE, {
    variables: { spaceId: activeSpaceId ?? '' },
    skip: scope !== 'space',
    fetchPolicy: 'network-only',
  })
  const allQuery = useQuery(GET_ALL_PULSES, {
    skip: scope !== 'all',
    fetchPolicy: 'network-only',
  })

  const data =
    scope === 'context'
      ? ctxQuery.data
      : scope === 'space'
        ? spaceQuery.data
        : allQuery.data
  const loading =
    scope === 'context'
      ? ctxQuery.loading
      : scope === 'space'
        ? spaceQuery.loading
        : allQuery.loading
  const error =
    scope === 'context'
      ? ctxQuery.error
      : scope === 'space'
        ? spaceQuery.error
        : allQuery.error

  // Clear cache when scope flips so a stale wider/narrower result set never
  // bleeds across the focal switch. The eviction is keyed by field name, not
  // query, so it covers every pulse type the widget lists.
  React.useEffect(() => {
    client.cache.evict({ fieldName: 'goalPulses' })
    client.cache.evict({ fieldName: 'resourcePulses' })
    client.cache.evict({ fieldName: 'storyPulses' })
    client.cache.evict({ fieldName: 'coreValuePulses' })
    client.cache.gc()
  }, [client, scope, activeSpaceId, activeFieldContextId])

  // Combine all pulse types into a single array
  const allPulses = React.useMemo(() => {
    if (!data) return []

    const combined = [
      ...(data.goalPulses || []),
      ...(data.resourcePulses || []),
      ...(data.storyPulses || []),
      ...(data.coreValuePulses || []),
    ]

    // Sort by createdAt descending
    return combined.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [data])

  if (error) {
    return (
      <section className="animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title text-accent-glow text-sm font-bold uppercase tracking-widest">
            Active Pulses
          </h3>
        </div>
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-300">
          Error loading pulses: {error.message}
        </div>
      </section>
    )
  }

  return (
    <section className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title text-accent-glow text-sm font-bold uppercase tracking-widest">
          Active Pulses
        </h3>
        {onViewAll && (allPulses.length > 5 || showAll) && (
          <button
            onClick={onViewAll}
            className="cursor-pointer text-xs text-slate-400 hover:text-slate-700 transition-colors font-medium dark:text-white/50 dark:hover:text-white"
          >
            {showAll ? 'Show less' : 'View all'}
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="chat-card rounded-xl p-4 animate-pulse">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                  <div className="h-4 w-24 bg-slate-200 rounded dark:bg-slate-700"></div>
                </div>
                <div className="h-3 w-12 bg-slate-200 rounded dark:bg-slate-700"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-slate-200 rounded dark:bg-slate-700"></div>
                <div className="h-3 w-3/4 bg-slate-200 rounded dark:bg-slate-700"></div>
              </div>
            </div>
          ))}
        </div>
      ) : allPulses.length === 0 ? (
        <div className="chat-card rounded-xl p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-white/20 mb-2">
            monitor_heart
          </span>
          <p className="text-sm text-slate-500 dark:text-white/50">
            No pulses yet. Start creating to see them here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(showAll ? allPulses : allPulses.slice(0, 5)).map((pulse) => {
            const nodeType =
              typenameToNodeType[pulse.__typename as PulseType] ?? 'goal'
            const config = getConfigForType(nodeType)
            const tint = entityTint(config.cssVar)
            const pulseTypeLabel = pulse.__typename
              .replace('Pulse', '')
              .replace(/([A-Z])/g, ' $1')
              .trim()
            const timeAgo = formatDistanceToNow(new Date(pulse.createdAt), {
              addSuffix: true,
            })

            return (
              <div
                key={pulse.id}
                onClick={() =>
                  dispatchOpenInfoDrawer({ type: 'Pulse', id: pulse.id })
                }
                className="chat-card rounded-xl p-4 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={cn(
                        'size-8 rounded-full border flex items-center justify-center shadow-sm flex-shrink-0',
                        config.color
                      )}
                      style={tint}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {config.icon}
                      </span>
                    </div>
                    <span
                      className={cn(
                        'text-[10px] font-semibold px-2 py-1 rounded-full shrink-0',
                        config.color
                      )}
                      style={tint}
                    >
                      {pulseTypeLabel}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium dark:text-white/40 shrink-0">
                    {timeAgo}
                  </span>
                </div>
                <h4 className="font-bold text-slate-700 text-sm dark:text-white/90 mb-2 line-clamp-1">
                  {pulse.title}
                </h4>
                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed group-hover:text-slate-700 transition-colors dark:text-white/60 dark:group-hover:text-white/80">
                  {pulse.content}
                </p>
                {pulse.context[0] && (
                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-white/10">
                    <span className="text-[10px] text-slate-400 dark:text-white/40">
                      in{' '}
                      <span className={cn('font-semibold', config.color)}>
                        {pulse.context[0].title}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
