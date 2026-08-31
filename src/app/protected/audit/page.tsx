'use client'

import { useEffect } from 'react'
import { ActivityLogs } from '@/components/dashboard/activity-logs'
import { usePageContext } from '@/contexts'

/**
 * Activity Log — the full, immutable audit trail of everything that happened
 * across the user's spaces. This is the home for the audit feed that used to
 * live (mislabeled) inside the notification bell. Recipient-addressed
 * notifications now live in the bell; this is the comprehensive record.
 */
export default function AuditLogPage() {
  const { setPageTitle } = usePageContext()

  useEffect(() => {
    setPageTitle('Activity Log')
  }, [setPageTitle])

  return (
    <div className="relative flex h-full w-full overflow-hidden">
      {/* Background wash — re-tints with mode/theme via gp-* tokens */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div
          className="absolute top-[8%] left-[12%] w-100 h-100 rounded-full blur-[120px] animate-blob"
          style={{
            backgroundColor:
              'color-mix(in srgb, var(--gp-primary) 9%, transparent)',
          }}
        />
        <div
          className="absolute bottom-[8%] right-[12%] w-75 h-75 rounded-full blur-[100px] animate-blob [animation-delay:3s]"
          style={{
            backgroundColor:
              'color-mix(in srgb, var(--gp-accent-glow) 9%, transparent)',
          }}
        />
      </div>

      {/* `pb-40` below `sm`: clears the canvas action bar and the chat pill
          stacked above it on phones (GOAL-340). */}
      <main className="flex-1 relative z-10 overflow-y-auto scroller p-4 sm:p-8 pb-40">
        <div className="max-w-3xl mx-auto space-y-5 sm:space-y-6">
          <header className="space-y-1">
            <h1 className="text-xl sm:text-3xl font-bold text-gp-ink-strong">
              Activity Log
            </h1>
            <p className="text-sm text-gp-ink-muted">
              A complete record of changes across your spaces. For things that
              need your attention, check your notifications.
            </p>
          </header>

          <ActivityLogs showAll />
        </div>
      </main>
    </div>
  )
}
