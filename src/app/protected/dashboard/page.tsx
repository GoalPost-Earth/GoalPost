'use client'

import React, { useEffect, useState } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { ActivePulses } from '@/components/dashboard/active-pulses'
import { FieldsList } from '@/components/dashboard/fields-list'
import { SpacesList } from '@/components/dashboard/spaces-list'
import { PeopleList } from '@/components/dashboard/people-list'
import { usePageContext } from '@/app/contexts'

type ViewType = 'overview' | 'pulses' | 'fields' | 'spaces' | 'people'

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

      <main className="flex-1 relative z-10 overflow-y-auto scroller p-8">
        <div className="max-w-6xl mx-auto space-y-10">
          {activeView === 'overview' && (
            <>
              <ActivePulses />
              <FieldsList />
              <SpacesList />
              <PeopleList />
            </>
          )}
          {activeView === 'pulses' && <ActivePulses showAll />}
          {activeView === 'fields' && <FieldsList showAll />}
          {activeView === 'spaces' && <SpacesList showAll />}
          {activeView === 'people' && <PeopleList showAll />}
        </div>
      </main>
    </div>
  )
}
