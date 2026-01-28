'use client'

import React from 'react'
import { useQuery } from '@apollo/client/react'
import { GET_ALL_PEOPLE } from '@/app/graphql/queries'

export function PeopleList() {
  const { data, loading, error } = useQuery(GET_ALL_PEOPLE)

  if (error) {
    return (
      <section className="animate-fade-in [animation-delay:0.2s]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title text-primary-content text-sm font-bold uppercase tracking-widest dark:text-primary">
            People
          </h3>
        </div>
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-300">
          Error loading people: {error.message}
        </div>
      </section>
    )
  }

  return (
    <section className="animate-fade-in [animation-delay:0.2s]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title text-primary-content text-sm font-bold uppercase tracking-widest dark:text-primary">
          People
        </h3>
        <button className="cursor-pointer text-xs text-slate-400 hover:text-slate-700 transition-colors font-medium dark:text-white/50 dark:hover:text-white">
          Manage People
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="chat-card rounded-2xl p-5 flex items-center gap-5 animate-pulse"
            >
              <div className="size-12 rounded-full bg-slate-200 dark:bg-slate-700"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-slate-200 rounded dark:bg-slate-700"></div>
                <div className="h-3 w-full bg-slate-200 rounded dark:bg-slate-700"></div>
              </div>
            </div>
          ))}
        </div>
      ) : !data?.people || data.people.length === 0 ? (
        <div className="chat-card rounded-2xl p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-white/20 mb-2">
            group
          </span>
          <p className="text-sm text-slate-500 dark:text-white/50">
            No people yet. Invite collaborators to connect.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.people.slice(0, 6).map((person) => {
            const spaceCount = person.ownsSpaces?.length || 0
            const initials = person.name
              ? person.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
              : 'U'

            return (
              <div
                key={person.id}
                className="chat-card rounded-2xl p-5 flex items-center gap-4 cursor-pointer group relative overflow-hidden"
              >
                {/* Left accent line */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gp-primary/50 group-hover:bg-gp-primary transition-colors"></div>

                {/* Avatar */}
                <div className="size-14 rounded-full border-2 border-gp-primary/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm bg-linear-to-br from-gp-primary/20 to-gp-accent-glow/20 text-gp-primary font-bold dark:from-gp-primary/10 dark:to-gp-accent-glow/10">
                  {initials}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-bold text-slate-800 group-hover:text-gp-primary transition-colors dark:text-white dark:group-hover:text-gp-primary truncate">
                    {person.name}
                  </h4>
                  <p className="text-xs text-slate-500 truncate group-hover:text-slate-700 transition-colors dark:text-white/60 dark:group-hover:text-white/80">
                    {person.email}
                  </p>
                  {spaceCount > 0 && (
                    <p className="text-xs text-gp-primary font-medium mt-1">
                      Owns {spaceCount} {spaceCount === 1 ? 'space' : 'spaces'}
                    </p>
                  )}
                </div>

                {/* Status Badge */}
                <div className="shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100/50 border border-green-200 dark:bg-green-500/20 dark:border-green-500/30">
                    <span className="size-1.5 rounded-full bg-green-600 dark:bg-green-400"></span>
                    <span className="text-[10px] text-green-700 font-semibold dark:text-green-300">
                      Active
                    </span>
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
