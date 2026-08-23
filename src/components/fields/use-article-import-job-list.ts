'use client'

import { useEffect, useRef, useState } from 'react'
import { chatApiAuthHeaders } from '@/lib/simulation/conversation-thread-client'
import {
  isArticleImportInFlight,
  type ArticleImportJobListItem,
} from '@/lib/imports/article-import'

/**
 * GOAL-336 — follow every import job this member has queued for one field.
 *
 * Server-driven counterpart to `use-article-import-job.ts`: where that hook
 * follows the single job the modal just submitted (with sessionStorage as an
 * accelerator), this one asks the server which jobs exist —
 * `GET /api/import/articles?fieldContextId=...` — so a new tab, a fresh
 * session, or another device still finds a running import and its receipts.
 *
 * Fetches once on mount (and whenever `refreshKey` changes — the page bumps it
 * when the import modal closes or reports landed rows), then keeps polling
 * only while at least one job is still PENDING/PROCESSING. A field with only
 * settled receipts costs one request per visit.
 */

const LIST_POLL_INTERVAL_MS = 5_000

/**
 * Consecutive poll failures to absorb before going quiet. This surface is
 * reassurance, not a workflow gate — a flaky connection must not spam errors,
 * so after the budget the hook simply stops until the next refresh.
 */
const MAX_POLL_FAILURES = 5

/** Don't refetch the field more than this often while rows are still landing. */
const REFETCH_THROTTLE_MS = 8_000

interface UseArticleImportJobListOptions {
  fieldContextId: string
  /** Bump to force an immediate refetch (modal closed, rows reported landed). */
  refreshKey: number
  /** Called as rows land, throttled, and once more when a job finishes. */
  onRowsLanded: () => void
}

export interface UseArticleImportJobList {
  jobs: ArticleImportJobListItem[]
}

/** Rows + people a job has landed so far — growth means the field changed. */
function landedCount(job: ArticleImportJobListItem): number {
  return (
    job.summary.created + job.summary.skippedExisting + job.summary.createdPeople
  )
}

export function useArticleImportJobList({
  fieldContextId,
  refreshKey,
  onRowsLanded,
}: UseArticleImportJobListOptions): UseArticleImportJobList {
  const [jobs, setJobs] = useState<ArticleImportJobListItem[]>([])

  // Refs, not state: these drive the polling effect but must never restart it.
  const landedRef = useRef(new Map<string, number>())
  const lastRefetchRef = useRef(0)
  const onRowsLandedRef = useRef(onRowsLanded)
  onRowsLandedRef.current = onRowsLanded
  // The failure path below needs the latest jobs without restarting the effect.
  const jobsRef = useRef(jobs)
  jobsRef.current = jobs
  // Whether ANY fetch has succeeded yet (across refreshes). Until one has,
  // the failure branch keeps retrying within the budget — a member with a
  // running import must not lose the surface to one blip on first load.
  const loadedOnceRef = useRef(false)

  useEffect(() => {
    if (!fieldContextId) return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    let failures = 0

    const poll = async () => {
      let anyInFlight = false
      try {
        const authHeaders = await chatApiAuthHeaders()
        const res = await fetch(
          `/api/import/articles?fieldContextId=${encodeURIComponent(fieldContextId)}`,
          { credentials: 'include', headers: authHeaders }
        )
        if (cancelled) return
        if (!res.ok) throw new Error(`status ${res.status}`)

        const body = (await res.json()) as {
          jobs?: ArticleImportJobListItem[]
        }
        if (cancelled) return
        failures = 0
        const nextJobs = body.jobs ?? []
        setJobs(nextJobs)
        loadedOnceRef.current = true

        // Tell the page when a followed job has landed new rows, so the field
        // fills in while the import runs — throttled, except when the job
        // finishes (the modal hook applies the same rule).
        anyInFlight = nextJobs.some((job) => isArticleImportInFlight(job.status))
        const now = Date.now()
        let grewWhileRunning = false
        let grewAndFinished = false
        for (const job of nextJobs) {
          const landed = landedCount(job)
          const previous = landedRef.current.get(job.jobId)
          landedRef.current.set(job.jobId, landed)
          // An unseen job's rows were counted when they landed — either by the
          // modal hook or by an earlier visit — so only growth this hook has
          // watched happen triggers a refetch.
          if (previous === undefined || landed <= previous) continue
          if (isArticleImportInFlight(job.status)) grewWhileRunning = true
          else grewAndFinished = true
        }
        if (
          grewAndFinished ||
          (grewWhileRunning &&
            now - lastRefetchRef.current > REFETCH_THROTTLE_MS)
        ) {
          lastRefetchRef.current = now
          onRowsLandedRef.current()
        }
      } catch {
        if (cancelled) return
        failures += 1
        // Keep trying within the budget while something is running — or while
        // nothing has EVER loaded, since an unlucky first fetch would
        // otherwise hide a running import for the whole visit.
        anyInFlight =
          !loadedOnceRef.current ||
          jobsRef.current.some((job) => isArticleImportInFlight(job.status))
        if (failures >= MAX_POLL_FAILURES) return
      }
      if (!cancelled && anyInFlight) {
        timer = setTimeout(poll, LIST_POLL_INTERVAL_MS)
      }
    }

    void poll()
    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [fieldContextId, refreshKey])

  return { jobs }
}
