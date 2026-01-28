'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { GET_ALL_ME_SPACES, GET_ALL_WE_SPACES } from '@/app/graphql/queries'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { useQuery } from '@apollo/client/react'

export function SpacesList() {
  const router = useRouter()
  const {
    data: meSpacesData,
    loading: meSpacesLoading,
    error: meSpacesError,
  } = useQuery(GET_ALL_ME_SPACES)
  const {
    data: weSpacesData,
    loading: weSpacesLoading,
    error: weSpacesError,
  } = useQuery(GET_ALL_WE_SPACES)

  const loading = meSpacesLoading || weSpacesLoading
  const error = meSpacesError || weSpacesError

  const allSpaces = React.useMemo(() => {
    const spaces = []

    if (meSpacesData?.meSpaces) {
      spaces.push(
        ...meSpacesData.meSpaces.map((space) => ({
          ...space,
          type: 'MeSpace' as const,
        }))
      )
    }

    if (weSpacesData?.weSpaces) {
      spaces.push(
        ...weSpacesData.weSpaces.map((space) => ({
          ...space,
          type: 'WeSpace' as const,
        }))
      )
    }

    return spaces.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [meSpacesData, weSpacesData])

  if (error) {
    return (
      <section className="animate-fade-in [animation-delay:0.2s]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title text-gp-accent-glow text-sm font-bold uppercase tracking-widest">
            Spaces
          </h3>
        </div>
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-300">
          Error loading spaces: {error.message}
        </div>
      </section>
    )
  }

  return (
    <section className="animate-fade-in [animation-delay:0.2s]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title text-gp-accent-glow text-sm font-bold uppercase tracking-widest">
          Spaces
        </h3>
        <button className="cursor-pointer text-xs text-slate-400 hover:text-slate-700 transition-colors font-medium dark:text-white/50 dark:hover:text-white">
          Manage Spaces
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="chat-card rounded-2xl p-5 animate-pulse">
              <div className="flex items-center gap-4 mb-3">
                <div className="size-10 rounded-xl bg-slate-200 dark:bg-slate-700"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-slate-200 rounded dark:bg-slate-700"></div>
                  <div className="h-3 w-20 bg-slate-200 rounded dark:bg-slate-700"></div>
                </div>
              </div>
              <div className="h-3 w-full bg-slate-200 rounded dark:bg-slate-700"></div>
            </div>
          ))}
        </div>
      ) : allSpaces.length === 0 ? (
        <div className="chat-card rounded-2xl p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-white/20 mb-2">
            workspaces
          </span>
          <p className="text-sm text-slate-500 dark:text-white/50">
            No spaces yet. Create a space to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allSpaces.slice(0, 5).map((space) => {
            const isMeSpace = space.type === 'MeSpace'
            const icon = isMeSpace ? 'person' : 'groups'
            const iconBg = isMeSpace
              ? 'bg-indigo-50 border-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:border-indigo-500/30 dark:text-indigo-300'
              : 'bg-teal-50 border-teal-100 text-teal-600 dark:bg-teal-500/20 dark:border-teal-500/30 dark:text-teal-300'

            const owner = space.owner[0]
            const ownerName =
              owner?.__typename === 'Person'
                ? owner.name
                : owner?.name || 'Unknown'

            const memberCount = space.members.length
            const contextCount = space.contexts.length

            const timeAgo = formatDistanceToNow(new Date(space.createdAt), {
              addSuffix: true,
            })

            return (
              <div
                key={space.id}
                onClick={() =>
                  router.push(`/protected/dashboard/space/${space.id}`)
                }
                className="chat-card rounded-2xl p-5 cursor-pointer group hover:shadow-lg transition-all"
              >
                {/* Header */}
                <div className="flex items-center gap-4 mb-3">
                  <div
                    className={cn(
                      'size-10 rounded-xl border flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform',
                      iconBg
                    )}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {icon}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-bold text-slate-800 group-hover:text-gp-primary transition-colors dark:text-white dark:group-hover:text-gp-accent-glow truncate">
                      {space.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] text-slate-600 font-semibold dark:bg-white/10 dark:border-white/10 dark:text-white/60">
                        {isMeSpace ? 'MeSpace' : 'WeSpace'}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-white/40">
                        {timeAgo}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-white/60">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      layers
                    </span>
                    <span>
                      {contextCount} {contextCount === 1 ? 'field' : 'fields'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      {isMeSpace ? 'person' : 'group'}
                    </span>
                    <span>
                      {memberCount} {memberCount === 1 ? 'member' : 'members'}
                    </span>
                  </div>
                </div>

                {/* Owner */}
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10">
                  <span className="text-[10px] text-slate-400 dark:text-white/40">
                    Owner:{' '}
                    <span className="font-semibold text-slate-600 dark:text-white/70">
                      {ownerName}
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
