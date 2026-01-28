'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { GET_ALL_FIELD_CONTEXTS } from '@/app/graphql/queries'
import { formatDistanceToNow } from 'date-fns'

export function FieldsList() {
  const router = useRouter()
  const { data, loading, error } = useQuery(GET_ALL_FIELD_CONTEXTS)

  if (error) {
    return (
      <section className="animate-fade-in [animation-delay:0.1s]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title text-primary-content text-sm font-bold uppercase tracking-widest dark:text-primary">
            Fields
          </h3>
        </div>
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-300">
          Error loading fields: {error.message}
        </div>
      </section>
    )
  }

  return (
    <section className="animate-fade-in [animation-delay:0.1s]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title text-primary-content text-sm font-bold uppercase tracking-widest dark:text-primary">
          Fields
        </h3>
        <button className="cursor-pointer text-xs text-slate-400 hover:text-slate-700 transition-colors font-medium dark:text-white/50 dark:hover:text-white">
          Manage Fields
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="chat-card rounded-2xl p-5 flex items-center gap-5 animate-pulse"
            >
              <div className="size-12 rounded-2xl bg-slate-200 dark:bg-slate-700"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-slate-200 rounded dark:bg-slate-700"></div>
                <div className="h-3 w-full bg-slate-200 rounded dark:bg-slate-700"></div>
              </div>
            </div>
          ))}
        </div>
      ) : !data?.fieldContexts || data.fieldContexts.length === 0 ? (
        <div className="chat-card rounded-2xl p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-white/20 mb-2">
            layers
          </span>
          <p className="text-sm text-slate-500 dark:text-white/50">
            No field contexts yet. Create one to organize your pulses.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...data.fieldContexts]
            .sort((a, b) => {
              const aTime = a.pulses[0]
                ? new Date(a.pulses[0].createdAt).getTime()
                : new Date(a.createdAt).getTime()
              const bTime = b.pulses[0]
                ? new Date(b.pulses[0].createdAt).getTime()
                : new Date(b.createdAt).getTime()
              return bTime - aTime // Most recent first
            })
            .slice(0, 5)
            .map((field) => {
              const pulseCount = field.pulses.length
              const lastPulse = field.pulses[0]
              const timeAgo = lastPulse
                ? formatDistanceToNow(new Date(lastPulse.createdAt), {
                    addSuffix: true,
                  })
                : 'No activity'

              return (
                <div
                  key={field.id}
                  onClick={() =>
                    router.push(
                      `/protected/dashboard/field-context/${field.id}`
                    )
                  }
                  className="chat-card rounded-2xl p-5 flex items-center gap-5 cursor-pointer group relative overflow-hidden"
                >
                  {/* Left accent line */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/50 group-hover:bg-primary transition-colors"></div>

                  {/* Icon */}
                  <div className="size-12 rounded-2xl border flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm bg-sky-50 border-sky-100 text-primary dark:bg-primary/10 dark:border-primary/20 dark:text-primary">
                    <span className="material-symbols-outlined text-xl">
                      layers
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-lg font-bold text-slate-800 group-hover:text-primary-content transition-colors dark:text-white dark:group-hover:text-primary">
                        {field.emergentName || field.title}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-green-100/50 border border-green-200 text-[10px] text-green-700 font-semibold dark:bg-green-500/20 dark:border-green-500/30 dark:text-green-300">
                        Active
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 truncate group-hover:text-slate-700 transition-colors dark:text-white/60 dark:group-hover:text-white/80">
                      {pulseCount} {pulseCount === 1 ? 'pulse' : 'pulses'}
                      {field.space[0] && (
                        <span className="text-slate-400 dark:text-white/40">
                          {' '}
                          • in {field.space[0].name}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Right Section - Time */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-xs text-slate-400 font-medium dark:text-white/50">
                      {timeAgo}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs text-slate-400 dark:text-white/40">
                        monitor_heart
                      </span>
                      <span className="text-xs text-slate-400 font-medium dark:text-white/40">
                        {pulseCount}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
        </div>
      )}
    </section>
  )
}
