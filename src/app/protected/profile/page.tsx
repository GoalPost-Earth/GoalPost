'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { GET_LOGGED_IN_USER } from '@/app/graphql/queries'
import { useApp, usePageContext } from '@/contexts'
import { formatDistanceToNow } from 'date-fns'

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated } = useApp()
  const { setPageTitle } = usePageContext()

  const { data, loading, error } = useQuery(GET_LOGGED_IN_USER, {
    variables: { email: user?.email ?? '' },
    skip: !user?.email,
    fetchPolicy: 'cache-and-network',
  })

  useEffect(() => {
    setPageTitle('My Profile')
  }, [setPageTitle])

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="flex flex-col h-full w-full overflow-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors p-8">
        <div className="max-w-4xl mx-auto w-full space-y-8 animate-pulse">
          {/* Header skeleton */}
          <div className="chat-card rounded-2xl p-8">
            <div className="flex items-center gap-6">
              <div className="size-24 rounded-full bg-slate-200 dark:bg-slate-700"></div>
              <div className="flex-1 space-y-3">
                <div className="h-8 w-48 bg-slate-200 rounded dark:bg-slate-700"></div>
                <div className="h-4 w-64 bg-slate-200 rounded dark:bg-slate-700"></div>
              </div>
            </div>
          </div>

          {/* Stats skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="chat-card rounded-2xl p-6">
                <div className="h-4 w-20 bg-slate-200 rounded dark:bg-slate-700 mb-3"></div>
                <div className="h-8 w-16 bg-slate-200 rounded dark:bg-slate-700"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col h-full w-full overflow-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors p-8">
        <div className="max-w-4xl mx-auto w-full">
          <div className="p-6 rounded-xl bg-red-50 border border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-300">
            Error loading profile: {error.message}
          </div>
        </div>
      </div>
    )
  }

  const personData = data?.people?.[0]

  if (!personData) {
    return (
      <div className="flex flex-col h-full w-full overflow-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors p-8">
        <div className="max-w-4xl mx-auto w-full">
          <div className="p-6 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-700 dark:bg-yellow-500/10 dark:border-yellow-500/30 dark:text-yellow-300">
            Profile data not found. Please try logging in again.
          </div>
        </div>
      </div>
    )
  }

  const spaceCount = personData.ownsSpaces?.length || 0
  const meSpaces =
    personData.ownsSpaces?.filter(
      (space) => space.__typename === 'MeSpace'
    ) || []
  const weSpaces =
    personData.ownsSpaces?.filter(
      (space) => space.__typename === 'WeSpace'
    ) || []

  const initials = personData.name
    ? personData.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'U'

  return (
    <div className="flex flex-col h-full w-full overflow-auto bg-gp-surface dark:bg-gp-surface-dark transition-colors p-8">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        {/* Profile Header Card */}
        <div className="chat-card rounded-2xl p-8 relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-gp-primary/5 to-gp-accent-glow/5 dark:from-gp-primary/10 dark:to-gp-accent-glow/10"></div>

          <div className="relative flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="size-24 rounded-full border-4 border-gp-primary/20 flex items-center justify-center shrink-0 shadow-lg bg-gradient-to-br from-gp-primary/20 to-gp-accent-glow/20 text-gp-primary font-bold text-3xl dark:from-gp-primary/10 dark:to-gp-accent-glow/10">
              {initials}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gp-ink-strong dark:text-white mb-2">
                {personData.name}
              </h1>
              <p className="text-base text-gp-ink-muted dark:text-white/60 mb-3">
                {personData.email}
              </p>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100/50 border border-green-200 dark:bg-green-500/20 dark:border-green-500/30">
                  <span className="size-2 rounded-full bg-green-600 dark:bg-green-400"></span>
                  <span className="text-xs text-green-700 font-semibold dark:text-green-300">
                    Active
                  </span>
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all shadow-lg"
                style={{
                  background:
                    'linear-gradient(135deg, color-mix(in srgb, var(--gp-primary) 95%, white 5%), color-mix(in srgb, var(--gp-primary) 75%, black 25%))',
                  boxShadow:
                    '0 10px 28px color-mix(in srgb, var(--gp-primary) 40%, transparent)',
                }}
              >
                <span className="material-symbols-outlined text-[18px]">
                  edit
                </span>
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Spaces */}
          <div className="chat-card rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gp-ink-muted dark:text-white/60 font-semibold uppercase tracking-wider">
                Total Spaces
              </span>
              <span className="material-symbols-outlined text-gp-primary group-hover:scale-110 transition-transform">
                workspaces
              </span>
            </div>
            <div className="text-3xl font-bold text-gp-ink-strong dark:text-white">
              {spaceCount}
            </div>
          </div>

          {/* MeSpaces */}
          <div className="chat-card rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gp-ink-muted dark:text-white/60 font-semibold uppercase tracking-wider">
                MeSpaces
              </span>
              <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                person
              </span>
            </div>
            <div className="text-3xl font-bold text-gp-ink-strong dark:text-white">
              {meSpaces.length}
            </div>
          </div>

          {/* WeSpaces */}
          <div className="chat-card rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gp-ink-muted dark:text-white/60 font-semibold uppercase tracking-wider">
                WeSpaces
              </span>
              <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
                groups
              </span>
            </div>
            <div className="text-3xl font-bold text-gp-ink-strong dark:text-white">
              {weSpaces.length}
            </div>
          </div>
        </div>

        {/* Spaces List */}
        {spaceCount > 0 && (
          <div className="chat-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gp-ink-strong dark:text-white">
                My Spaces
              </h2>
              <button
                onClick={() => router.push('/protected/dashboard')}
                className="text-xs text-gp-primary hover:text-gp-primary-dark font-semibold transition-colors"
              >
                View All →
              </button>
            </div>

            <div className="space-y-3">
              {personData.ownsSpaces?.slice(0, 5).map((space) => {
                const isMeSpace = space.__typename === 'MeSpace'
                const icon = isMeSpace ? 'person' : 'groups'
                const iconBg = isMeSpace
                  ? 'bg-indigo-50 border-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:border-indigo-500/30 dark:text-indigo-300'
                  : 'bg-teal-50 border-teal-100 text-teal-600 dark:bg-teal-500/20 dark:border-teal-500/30 dark:text-teal-300'

                const timeAgo = formatDistanceToNow(new Date(space.createdAt), {
                  addSuffix: true,
                })

                return (
                  <div
                    key={space.id}
                    onClick={() => {
                      const spaceType = isMeSpace ? 'me-space' : 'we-space'
                      router.push(
                        `/protected/spaces/${spaceType}/${space.id}`
                      )
                    }}
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group border border-transparent hover:border-gp-primary/20"
                  >
                    <div
                      className={`size-10 rounded-xl border flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ${iconBg}`}
                    >
                      <span className="material-symbols-outlined text-base">
                        {icon}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gp-ink-strong dark:text-white group-hover:text-gp-primary transition-colors truncate">
                        {space.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] text-slate-600 font-semibold dark:bg-white/10 dark:border-white/10 dark:text-white/60">
                          {isMeSpace ? 'MeSpace' : 'WeSpace'}
                        </span>
                        <span className="text-[10px] text-gp-ink-muted dark:text-white/40">
                          {timeAgo}
                        </span>
                      </div>
                    </div>

                    <span className="material-symbols-outlined text-gp-ink-muted dark:text-white/40 group-hover:text-gp-primary transition-colors">
                      arrow_forward
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Account Info */}
        <div className="chat-card rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gp-ink-strong dark:text-white mb-4">
            Account Information
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-white/10">
              <span className="text-sm text-gp-ink-muted dark:text-white/60 font-medium">
                User ID
              </span>
              <span className="text-sm text-gp-ink-strong dark:text-white font-mono">
                {personData.id}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-white/10">
              <span className="text-sm text-gp-ink-muted dark:text-white/60 font-medium">
                Email
              </span>
              <span className="text-sm text-gp-ink-strong dark:text-white">
                {personData.email}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-gp-ink-muted dark:text-white/60 font-medium">
                Full Name
              </span>
              <span className="text-sm text-gp-ink-strong dark:text-white">
                {personData.name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
