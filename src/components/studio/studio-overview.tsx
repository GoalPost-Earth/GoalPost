'use client'

import { useState, type FC } from 'react'
import { useSearchParams } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/sidebar'
import { ActivePulses } from '@/components/dashboard/active-pulses'
import { FieldsList } from '@/components/dashboard/fields-list'
import { SpacesList } from '@/components/dashboard/spaces-list'
import { PeopleList } from '@/components/dashboard/people-list'
import { ActivityLogs } from '@/components/dashboard/activity-logs'

type ViewType =
  | 'overview'
  | 'pulses'
  | 'fields'
  | 'spaces'
  | 'people'
  | 'activity'

const STORAGE_KEY = 'goalpost.studio.dashboardView.v1'

function isViewType(v: string | null | undefined): v is ViewType {
  return (
    v === 'overview' ||
    v === 'pulses' ||
    v === 'fields' ||
    v === 'spaces' ||
    v === 'people' ||
    v === 'activity'
  )
}

function readStored(): ViewType {
  if (typeof window === 'undefined') return 'overview'
  try {
    const v = window.localStorage.getItem(STORAGE_KEY)
    if (isViewType(v)) return v
  } catch {
    // ignore
  }
  return 'overview'
}

/**
 * The /protected root landing — synthetic overview of the user's pulses,
 * fields, spaces, people, and activity. Replaces the standalone
 * /protected/dashboard route now that the studio is the protected layout.
 *
 * Honors `?tab=` URL params (e.g. from notification panel "View all
 * activities" → /protected?tab=activity) for backward compatibility with the
 * legacy dashboard link contract.
 */
export const StudioOverview: FC = () => {
  const searchParams = useSearchParams()
  const [storedView, setStoredView] = useState<ViewType>(() => readStored())
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // The `?tab=` query param wins when present — keeps in-app deep links like
  // `View all activities` working without needing an effect to sync state.
  const tabFromUrl = searchParams?.get('tab')
  const activeView: ViewType = isViewType(tabFromUrl) ? tabFromUrl : storedView

  const onViewChange = (view: ViewType) => {
    setStoredView(view)
    setSidebarOpen(false)
    try {
      window.localStorage.setItem(STORAGE_KEY, view)
    } catch {
      // ignore
    }
  }

  return (
    <div className="relative flex flex-1 overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05),transparent_70%)]" />
        <div
          className="absolute top-[10%] left-[10%] w-[420px] h-[420px] rounded-full blur-[120px] animate-blob"
          style={{
            backgroundColor:
              'color-mix(in srgb, var(--gp-primary) 12%, transparent)',
          }}
        />
        <div
          className="absolute bottom-[10%] right-[10%] w-[360px] h-[360px] rounded-full blur-[100px] animate-blob [animation-delay:2s]"
          style={{
            backgroundColor:
              'color-mix(in srgb, var(--gp-accent-glow) 12%, transparent)',
          }}
        />
      </div>

      <Sidebar
        activeView={activeView}
        onViewChange={onViewChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 relative z-10 overflow-y-auto scroller p-6 md:p-8">
        <div className="max-w-6xl mx-auto space-y-10">
          {activeView === 'overview' && (
            <>
              <ActivePulses onViewAll={() => onViewChange('pulses')} />
              <FieldsList onViewAll={() => onViewChange('fields')} />
              <SpacesList onViewAll={() => onViewChange('spaces')} />
              <PeopleList onViewAll={() => onViewChange('people')} />
              <ActivityLogs onViewAll={() => onViewChange('activity')} />
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
