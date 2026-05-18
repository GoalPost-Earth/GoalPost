'use client'

import { type FC, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { StudioOverview } from '../studio-overview'

interface DashboardModeProps {
  visible: boolean
  children: ReactNode
}

/**
 * Dashboard mode is the "default surface" of the studio — it renders the
 * actual route content (`{children}`). At the `/protected` root we instead
 * render the synthetic overview (active pulses, fields, spaces, people,
 * activity) lifted from the legacy `/protected/dashboard` page.
 *
 * Switching to Graph / Assistant / Voice overlays this content — pressing
 * `1` returns to it without remounting, so scroll position and any focused
 * inputs are preserved.
 */
export const DashboardMode: FC<DashboardModeProps> = ({ visible, children }) => {
  const pathname = usePathname()
  const showOverview = pathname === '/protected' || pathname === '/protected/'

  return (
    <div
      className={cn(
        'relative h-full w-full flex flex-col overflow-hidden',
        !visible && 'pointer-events-none'
      )}
      style={{ visibility: visible ? 'visible' : 'hidden' }}
      aria-hidden={!visible}
    >
      {showOverview ? <StudioOverview /> : children}
    </div>
  )
}
