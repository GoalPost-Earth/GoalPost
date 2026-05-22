import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

/**
 * /dev/* is internal tooling for the AI self-improvement loop and
 * future debug surfaces. It is NOT a user-facing route — there is no
 * auth gate beneath it. The only gate is environment:
 *
 *   - NODE_ENV === 'development'           → always accessible (local dev)
 *   - ENABLE_DEV_DASHBOARDS === 'true'     → explicit opt-in for staging
 *   - otherwise                            → 404
 *
 * Production builds therefore answer with a hard 404, no leakage of
 * route existence. Deploy a preview with the env flag set if you need
 * to triage feedback against real data outside local dev.
 */
export default function DevLayout({ children }: { children: ReactNode }) {
  if (
    process.env.NODE_ENV !== 'development' &&
    process.env.ENABLE_DEV_DASHBOARDS !== 'true'
  ) {
    notFound()
  }
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-gp-ink-strong dark:text-white">
      <div className="border-b border-slate-200 dark:border-white/10 bg-amber-50 dark:bg-amber-500/10 px-4 py-2 text-xs text-amber-900 dark:text-amber-200">
        <span className="font-semibold">Internal tooling</span> — dev /
        staging only. Not visible in production.
      </div>
      {children}
    </div>
  )
}
