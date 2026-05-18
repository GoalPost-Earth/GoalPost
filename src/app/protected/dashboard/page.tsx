'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { SpacesOverview } from '@/components/dashboard/spaces-overview'
import { FocusedEntities } from '@/components/dashboard/focused-entities'
import { usePageContext } from '@/contexts'

/**
 * The dashboard landing — a focused, filterable view of every space the
 * user can access. Drilling into a space reveals its field contexts; field
 * contexts reveal their pulses. The old sidebar (Overview / Pulses /
 * Fields / Spaces / People / Activity tabs + CSV-imports link) was
 * retired — those entry points moved to:
 *   - Spaces are the canonical entry point (this page)
 *   - Pulses / Fields / People are reached by drilling through a space
 *   - CSV import is now an attachment affordance in the chat composer
 *   - Search lives in the chrome
 */
export default function DashboardPage() {
  const { setPageTitle } = usePageContext()
  const searchParams = useSearchParams()
  const focusParam = searchParams.get('focus')

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
        className="flex-1 relative z-10 overflow-y-auto scroller p-6 sm:p-8"
        data-tour="dashboard-overview"
      >
        <div className="max-w-6xl mx-auto">
          {focusParam ? (
            <FocusedEntities focus={focusParam} />
          ) : (
            <SpacesOverview />
          )}
        </div>
      </main>
    </div>
  )
}
