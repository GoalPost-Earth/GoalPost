'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { ActivePulses } from '@/components/dashboard/active-pulses'
import { FieldsList } from '@/components/dashboard/fields-list'
import { SpacesList } from '@/components/dashboard/spaces-list'
import { PeopleList } from '@/components/dashboard/people-list'
import { ActivityLogs } from '@/components/dashboard/activity-logs'
import { usePageContext } from '@/contexts'

type ViewType =
  | 'overview'
  | 'pulses'
  | 'fields'
  | 'spaces'
  | 'people'
  | 'activity'

export default function DashboardPage() {
  const { setPageTitle } = usePageContext()
  const [activeView, setActiveView] = useState<ViewType>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Set page title
  useEffect(() => {
    setPageTitle('Dashboard')
  }, [setPageTitle])

  return (
    <div className="relative flex flex-1 overflow-hidden pt-24">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile left side indicator */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-40 md:hidden h-16 bg-linear-to-r from-gp-primary via-gp-primary to-gp-accent-glow hover:left-0.5 rounded-r-xl transition-all duration-300 shadow-lg hover:shadow-2xl p-1 flex items-center justify-center group"
        aria-label="Toggle sidebar"
      >
        <span className="material-symbols-outlined text-white text-2xl group-hover:translate-x-0.5 transition-transform">
          {sidebarOpen ? 'chevron_left' : 'chevron_right'}
        </span>
      </button>

      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Light mode: bright radial gradient, Dark mode: subtle gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.8),transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03),transparent_70%)]"></div>
        <div
          className="absolute top-[10%] left-[10%] w-125 h-125 rounded-full blur-[120px] animate-blob"
          style={{
            backgroundColor:
              'color-mix(in srgb, var(--gp-primary) 10%, transparent)',
          }}
        ></div>
        <div
          className="absolute bottom-[10%] right-[10%] w-100 h-100 rounded-full blur-[100px] animate-blob [animation-delay:2s]"
          style={{
            backgroundColor:
              'color-mix(in srgb, var(--gp-accent-glow) 10%, transparent)',
          }}
        ></div>
        <div
          className="absolute top-[40%] left-[60%] w-75 h-75 rounded-full blur-[100px] animate-blob [animation-delay:4s]"
          style={{
            backgroundColor:
              'color-mix(in srgb, var(--gp-goal) 10%, transparent)',
          }}
        ></div>
      </div>

      <Sidebar
        activeView={activeView}
        onViewChange={(view) => {
          setActiveView(view)
          setSidebarOpen(false)
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main
        className="flex-1 relative z-10 overflow-y-auto scroller p-8"
        data-tour="dashboard-overview"
      >
        <div className="max-w-6xl mx-auto space-y-10">
          <section className="rounded-[2rem] border border-white/40 bg-white/65 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="max-w-2xl space-y-2">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-gp-primary">
                  Data Imports
                </p>
                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Upload CSV data for WeSpaces, FieldContexts, and Pulses
                </h2>
                <p className="text-sm leading-6 text-slate-600 dark:text-white/65">
                  Use the dedicated importer to validate memberships,
                  lowercase-match names, create missing WeSpaces or
                  FieldContexts when allowed, and get row-by-row failure
                  details.
                </p>
              </div>
              <Link
                href="/protected/dashboard/import"
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-xl transition hover:scale-[1.01]"
              >
                <span className="material-symbols-outlined text-base">
                  cloud_upload
                </span>
                Open Import Page
              </Link>
            </div>
          </section>

          {activeView === 'overview' && (
            <>
              <ActivePulses onViewAll={() => setActiveView('pulses')} />
              <FieldsList onViewAll={() => setActiveView('fields')} />
              <SpacesList onViewAll={() => setActiveView('spaces')} />
              <PeopleList onViewAll={() => setActiveView('people')} />
              <ActivityLogs onViewAll={() => setActiveView('activity')} />
            </>
          )}
          {activeView === 'pulses' && <ActivePulses showAll />}
          {activeView === 'fields' && <FieldsList showAll />}
          {activeView === 'spaces' && <SpacesList showAll />}
          {activeView === 'people' && <PeopleList showAll />}
          {activeView === 'activity' && <ActivityLogs showAll />}
        </div>
      </main>
    </div>
  )
}
