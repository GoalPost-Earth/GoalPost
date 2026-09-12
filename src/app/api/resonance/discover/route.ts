/**
 * Manual resonance discovery API (GOAL-368)
 * POST /api/resonance/discover  { fieldContextId }
 *
 * Starts, on demand, the sweep a member would otherwise wait for the nightly
 * cron to run. Triggered from a field, it sweeps that field's whole Space:
 * within-field pairs for every root field plus cross-field pairs inside the
 * Space (ADR-020). Creates `pending` ResonanceSuggestions for human review
 * (ADR-004) — never links.
 *
 * One manual sweep per Space per cooldown window (429 otherwise). Global
 * discovery stays cron-only (src/app/api/cron/discover-resonances), which
 * ignores this cooldown entirely.
 */

import { NextRequest, NextResponse } from 'next/server'
import { resolveAuthenticatedUserId } from '@/app/api/auth/utils'
import { getSession, initializeDB } from '@/app/api/auth/neo4j'
import { canEditContent } from '@/lib/permissions/space-permissions'
import {
  MANUAL_SWEEP_BUDGET_MS,
  MANUAL_SWEEP_COOLDOWN_SECONDS,
  claimManualResonanceSweep,
  finishManualResonanceSweep,
  resolveFieldSweepScope,
  runManualResonanceSweep,
  type ManualSweepRefusal,
} from '@/lib/resonance/discovery/manual-sweep'

// The sweep (embeddings + one LLM call per pulse with candidates) runs inside
// this request, bounded by MANUAL_SWEEP_BUDGET_MS; 300s is the plan ceiling.
export const dynamic = 'force-dynamic'
export const maxDuration = 300

const COOLDOWN_MESSAGES: Record<ManualSweepRefusal, string> = {
  space_running: 'Resonance discovery is already running for this space.',
  space_cooldown: 'Resonance discovery ran recently for this space.',
  user_running: 'You already have resonance discovery running in another space.',
}

export async function POST(request: NextRequest) {
  const startedAt = Date.now()
  try {
    let fieldContextId: unknown
    try {
      const text = await request.text()
      fieldContextId = text.trim() ? JSON.parse(text)?.fieldContextId : null
    } catch {
      fieldContextId = null
    }
    if (typeof fieldContextId !== 'string' || !fieldContextId) {
      return NextResponse.json(
        {
          success: false,
          error:
            'fieldContextId is required. Global discovery runs only as a scheduled job.',
        },
        { status: 400 }
      )
    }

    const userId = resolveAuthenticatedUserId(request)
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // The sweep reads pulse content and writes suggestions across the whole
    // Space, so it requires edit rights on that Space. An unknown or deleted
    // field answers the same 403 as a field the caller can't edit.
    const scope = await resolveFieldSweepScope(fieldContextId)
    initializeDB()
    const permSession = getSession()
    let allowed = false
    try {
      allowed =
        !!scope && (await canEditContent(permSession, userId, scope.spaceId))
    } finally {
      await permSession.close()
    }
    if (!scope || !allowed) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    const claim = await claimManualResonanceSweep(scope.spaceId, userId)
    if (!claim) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }
    if (!claim.claimed) {
      return NextResponse.json(
        {
          success: false,
          error: COOLDOWN_MESSAGES[claim.reason],
          reason: claim.reason,
          retryAfterSeconds: claim.retryAfterSeconds,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(claim.retryAfterSeconds) },
        }
      )
    }

    console.log('[Resonance Discovery API] Manual sweep started', {
      spaceId: scope.spaceId,
      fieldContextId,
    })

    let failed = true
    try {
      const result = await runManualResonanceSweep({
        spaceId: scope.spaceId,
        rootContextId: scope.rootContextId,
        triggerContextId: fieldContextId,
        actorUserId: userId,
        deadline: startedAt + MANUAL_SWEEP_BUDGET_MS,
      })
      failed = false

      console.log('[Resonance Discovery API] Manual sweep finished', {
        spaceId: scope.spaceId,
        durationMs: Date.now() - startedAt,
        ...result,
      })

      return NextResponse.json({
        success: true,
        ...result,
        cooldownSeconds: MANUAL_SWEEP_COOLDOWN_SECONDS,
        timestamp: new Date().toISOString(),
      })
    } finally {
      try {
        // A thrown sweep shrinks the Space's cooldown to a short retry window;
        // a finished one (even cut short by the budget) keeps the full one.
        await finishManualResonanceSweep(scope.spaceId, userId, { failed })
      } catch (finishErr) {
        // Only the "still running" wording and the failed-sweep retry window
        // depend on this; both claims lapse on their own.
        console.warn(
          '[Resonance Discovery API] Could not mark sweep finished:',
          finishErr
        )
      }
    }
  } catch (error: unknown) {
    // Logged in full; the client gets a generic message — Neo4j / OpenAI
    // error text is not for members' eyes.
    console.error('[Resonance Discovery API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Resonance discovery failed.',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
