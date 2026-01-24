'use client'

import React, { useEffect } from 'react'
import { Sidebar } from '@/components/history/sidebar'
import { ActivePulses } from '@/components/history/active-pulses'
import { FieldsList } from '@/components/history/fields-list'
import { usePageContext } from '@/app/contexts'

export default function HistoryPage() {
  const { setPageTitle } = usePageContext()

  // Set page title
  useEffect(() => {
    setPageTitle('History')
  }, [setPageTitle])

  return (
    <div className="relative flex flex-1 overflow-hidden pt-24">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Light mode: bright radial gradient, Dark mode: subtle gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.8),transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03),transparent_70%)]"></div>
        <div className="absolute top-[10%] left-[10%] w-125 h-125 bg-blue-400/10 dark:bg-primary/5 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[10%] right-[10%] w-100 h-100 bg-teal-400/10 dark:bg-accent-glow/5 rounded-full blur-[100px] animate-blob [animation-delay:2s]"></div>
        <div className="absolute top-[40%] left-[60%] w-75 h-75 bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-[100px] animate-blob [animation-delay:4s]"></div>
      </div>

      <Sidebar />

      <main className="flex-1 relative z-10 overflow-y-auto scroller p-8">
        <div className="max-w-6xl mx-auto space-y-10">
          <ActivePulses />
          <FieldsList />
        </div>
      </main>
    </div>
  )
}
