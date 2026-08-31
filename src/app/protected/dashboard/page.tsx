'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { SpacesOverview } from '@/components/dashboard/spaces-overview'
import { ActivePulses } from '@/components/dashboard/active-pulses'
import { FocusedEntities } from '@/components/dashboard/focused-entities'
import { usePageContext } from '@/contexts'

/**
 * The dashboard landing — a focused, filterable view of every space the
 * user can access (cards). Drilling into a space leads to its field
 * contexts, which lead to pulses.
 *
 * The Graph view (custom NVL Bloom) is owned by the canvas-host's
 * Dashboard / Graph toggle in its header — this page is the "Dashboard"
 * side of that flip.
 */
export default function DashboardPage() {
  const { setPageTitle } = usePageContext()
  const searchParams = useSearchParams()
  const focusParam = searchParams.get('focus')
  const [showAllPulses, setShowAllPulses] = useState(false)

  useEffect(() => {
    setPageTitle('Dashboard')
  }, [setPageTitle])

  return (
    <div className="relative flex h-full w-full overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.8),transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03),transparent_70%)]" />
        <div
          className="absolute top-[10%] left-[10%] w-125 h-125 rounded-full blur-[120px] animate-blob"
          style={{
            backgroundColor:
              'color-mix(in srgb, var(--gp-primary) 10%, transparent)',
          }}
        />
        <div
          className="absolute bottom-[10%] right-[10%] w-100 h-100 rounded-full blur-[100px] animate-blob [animation-delay:2s]"
          style={{
            backgroundColor:
              'color-mix(in srgb, var(--gp-accent-glow) 10%, transparent)',
          }}
        />
        <div
          className="absolute top-[40%] left-[60%] w-75 h-75 rounded-full blur-[100px] animate-blob [animation-delay:4s]"
          style={{
            backgroundColor:
              'color-mix(in srgb, var(--gp-goal) 10%, transparent)',
          }}
        />
      </div>

      <main
        // `pb-40` below `sm` (above it `sm:p-8` takes over): the gutter has to
        // clear BOTH bottom-floating surfaces — the canvas action bar and, on
        // phones, the chat pill stacked above it (GOAL-340).
        className="flex-1 relative z-10 overflow-y-auto scroller p-4 sm:p-8 pb-40"
        data-tour="dashboard-overview"
      >
        <div className="max-w-6xl mx-auto">
          {focusParam ? (
            <FocusedEntities focus={focusParam} />
          ) : (
            <div className="space-y-6 sm:space-y-8">
              <SpacesOverview />
              <ActivePulses
                showAll={showAllPulses}
                onViewAll={() => setShowAllPulses((v) => !v)}
              />
            </div>
          )}
        </div>
      </main>

      {/* EntityInfoDrawer is mounted at the canvas-host level so it works
          across Dashboard, Graph, and Bloom views (a mount here would be
          hidden by the per-view visibility cascade in non-dashboard
          modes). */}
    </div>
  )
}
