'use client'

import React from 'react'
import { GET_ALL_PULSES } from '@/app/graphql/queries'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { useQuery } from '@apollo/client/react'

type PulseType = 'GoalPulse' | 'ResourcePulse' | 'StoryPulse'

interface PulseConfig {
  icon: string
  color: string
  bgClass: string
}

const pulseConfig: Record<PulseType, PulseConfig> = {
  GoalPulse: {
    icon: 'track_changes',
    color: 'text-gp-goal',
    bgClass:
      'bg-sky-50 border-sky-100 text-gp-goal dark:bg-sky-500/20 dark:border-sky-500/30',
  },
  ResourcePulse: {
    icon: 'category',
    color: 'text-gp-resource',
    bgClass:
      'bg-green-50 border-green-100 text-gp-resource dark:bg-green-500/20 dark:border-green-500/30',
  },
  StoryPulse: {
    icon: 'auto_stories',
    color: 'text-gp-story',
    bgClass:
      'bg-purple-50 border-purple-100 text-gp-story dark:bg-purple-500/20 dark:border-purple-500/30',
  },
}

export function ActivePulses() {
  const { data, loading, error } = useQuery(GET_ALL_PULSES)

  // Combine all pulse types into a single array
  const allPulses = React.useMemo(() => {
    if (!data) return []

    const combined = [
      ...(data.goalPulses || []),
      ...(data.resourcePulses || []),
      ...(data.storyPulses || []),
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
        <button className="cursor-pointer text-xs text-slate-400 hover:text-slate-700 transition-colors font-medium dark:text-white/50 dark:hover:text-white">
          View All
        </button>
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
          {allPulses.slice(0, 5).map((pulse) => {
            const config = pulseConfig[pulse.__typename as PulseType]
            const author =
              pulse.initiatedBy[0]?.__typename === 'Person'
                ? pulse.initiatedBy[0].name
                : pulse.initiatedBy[0]?.name || 'Unknown'
            const timeAgo = formatDistanceToNow(new Date(pulse.createdAt), {
              addSuffix: true,
            })

            return (
              <div
                key={pulse.id}
                className="chat-card rounded-xl p-4 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'size-8 rounded-full border flex items-center justify-center shadow-sm',
                        config.bgClass
                      )}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {config.icon}
                      </span>
                    </div>
                    <span className="font-bold text-slate-700 text-sm dark:text-white/90">
                      {author}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium dark:text-white/40">
                    {timeAgo}
                  </span>
                </div>
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
