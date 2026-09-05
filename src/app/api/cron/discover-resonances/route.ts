/**
 * Scheduled Function: Discover Resonances
 * ADR-008's daily Resonance Discovery job. Runs at midnight UTC.
 *
 * Resonances are created as SUGGESTIONS (ResonanceSuggestion nodes, status
 * `pending`) that users must accept or decline before they become
 * ResonanceLink nodes — the sweep never confirms a link itself (ADR-004).
 *
 * SCHEDULING (GOAL-347). Vercel Cron only ever fires against a project's
 * PRODUCTION deployment, and `goal-post` is a single project whose production
 * target is `main` -> goalpost.earth. The `crons` block in vercel.json
 * therefore never reaches dev.goalpost.earth or demo.goalpost.earth, and this
 * route had consequently never executed on demo at all — leaving whole Spaces
 * of pulses un-embedded and, because an un-embedded pulse is invisible to
 * vector search, unable to resonate. Non-production environments are driven by
 * `.github/workflows/nightly-resonance.yml`, the same external-scheduler
 * pattern the queue workers already use (`drain-queues.yml`). Production stays
 * on vercel.json; do not add it to the workflow or every pass would run twice.
 */

import { NextRequest, NextResponse } from 'next/server'
import { runResonanceSweep } from '@/lib/resonance/discovery/nightly-sweep'

// Cron invocations are always GET. 300s is the Pro plan ceiling for serverless
// functions (raising it requires Fluid Compute, a project-level setting, not a
// code change).
export const dynamic = 'force-dynamic'
export const maxDuration = 300

/**
 * Wall-clock the sweep may consume, leaving headroom under `maxDuration` to
 * serialize the response. Being killed at the ceiling instead would return a
 * bare 504 and discard the report of everything the pass did accomplish.
 */
const SWEEP_BUDGET_MS = 270_000

export async function GET(request: NextRequest) {
  // Fail-CLOSED, matching the queue workers. This route drives model spend
  // (an embedding call per un-embedded pulse, an LLM analysis per pulse
  // examined) and writes to every Space in the graph, so an unset secret must
  // not leave it anonymously triggerable. Local runs need CRON_SECRET in
  // .env.local.
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    console.warn('[Resonance Cron] Unauthorized cron request attempted')
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  console.log('[Resonance Cron] Starting scheduled resonance discovery...')

  const report = await runResonanceSweep(SWEEP_BUDGET_MS)

  console.log(
    `[Resonance Cron] ${report.ok ? '✓' : '✗'} Pass finished in ${Math.round(
      report.durationMs / 1000
    )}s: ${report.suggestionsCreated} suggestion(s) across ${
      report.spacesSwept
    }/${report.spacesTotal} spaces`
  )

  // A pass that stops on its budget is a SUCCESS, not a failure: work already
  // written is durable, and the remaining Spaces lead the queue next run
  // (sweepGlobalResonances orders least-recently-swept first). `complete`
  // tells an operator whether the graph is caught up; `remainingEmbeddable` on
  // each embedding phase is the number to watch converge to 0.
  return NextResponse.json(
    {
      success: report.ok,
      complete:
        report.discoveryCompleted &&
        report.pulseEmbeddings.completed &&
        report.personEmbeddings.completed,
      suggestionsCreated: report.suggestionsCreated,
      spacesSwept: report.spacesSwept,
      spacesTotal: report.spacesTotal,
      logsWritten: report.logsWritten,
      pulseEmbeddings: report.pulseEmbeddings,
      personEmbeddings: report.personEmbeddings,
      durationMs: report.durationMs,
      ...(report.error ? { error: report.error } : {}),
      timestamp: new Date().toISOString(),
    },
    { status: report.ok ? 200 : 500 }
  )
}
