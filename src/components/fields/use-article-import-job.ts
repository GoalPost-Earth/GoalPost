'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { chatApiAuthHeaders } from '@/lib/simulation/conversation-thread-client'
import {
  ARTICLE_IMPORT_STATUS,
  isArticleImportInFlight,
  type ArticleImportJobListItem,
  type ArticleImportJobStatus,
  type ArticleImportRowInput,
} from '@/lib/imports/article-import'

/**
 * GOAL-326 — submit a bulk article import and follow the queued job.
 *
 * `POST /api/import/articles` answers 202 with a job id; the worker mints the
 * pulses a tick later. This hook owns the whole after-202 story: polling,
 * remembering the job across a modal close, telling the page when new pulses
 * have landed, and surfacing a terminal error instead of an endless spinner.
 *
 * The job id is parked in `sessionStorage` per field context, so closing the
 * modal mid-import (or a reload) doesn't strand the member with no way back to
 * their results. It is cleared when they dismiss the finished import.
 *
 * GOAL-357 — that store is an accelerator, not the source of truth. The modal
 * is unmounted while closed, so every reopen starts with no snapshot, and
 * `sessionStorage` is empty in a second tab or on another device. Recovery
 * therefore falls back to the server list (the surface GOAL-336 added) and
 * reports `isRecovering` while it looks, so the modal can hold instead of
 * flashing the file picker over a running import.
 */

const POLL_INTERVAL_MS = 2_000

/**
 * How many consecutive poll failures to absorb before giving up. A queued job
 * survives a flaky connection perfectly well, so a transient fetch error must
 * not be reported as a failed import.
 */
const MAX_POLL_FAILURES = 5

/** Don't refetch the field more than this often while rows are still landing. */
const REFETCH_THROTTLE_MS = 8_000

/**
 * How long to wait for the recovery lookup before giving up and showing the
 * picker. Generous on purpose: the failure it guards against is a *hung*
 * connection, and timing out a request that was merely slow drops the member
 * onto a drop zone over an import that is genuinely running — the thing this
 * lookup exists to prevent. Better to hold the "checking" line a beat too long
 * than to answer the question wrongly.
 */
const RECOVERY_LOOKUP_TIMEOUT_MS = 8_000

/**
 * Turn a `Retry-After` header into copy that names the actual wait. The
 * `bulk-import` window is an hour, so the generic "try again shortly" reads as
 * seconds and sends the member straight back into another 429.
 */
function rateLimitMessage(retryAfterHeader: string | null): string {
  const seconds = Number(retryAfterHeader)
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return 'You have run too many imports recently. Try again later.'
  }
  const minutes = Math.ceil(seconds / 60)
  if (minutes < 60) {
    return `You have run too many imports recently. Try again in about ${minutes} minute${minutes === 1 ? '' : 's'}.`
  }
  const hours = Math.round(minutes / 60)
  return `You have run too many imports recently. Try again in about ${hours} hour${hours === 1 ? '' : 's'}.`
}

function storageKey(fieldContextId: string): string {
  return `gp:article-import-job:${fieldContextId}`
}

function readStoredJobId(fieldContextId: string): string | null {
  try {
    return window.sessionStorage.getItem(storageKey(fieldContextId))
  } catch {
    // Private-mode / blocked storage — the import still works, it just can't
    // be recovered after a close.
    return null
  }
}

function writeStoredJobId(fieldContextId: string, jobId: string | null) {
  try {
    if (jobId === null) {
      window.sessionStorage.removeItem(storageKey(fieldContextId))
    } else {
      window.sessionStorage.setItem(storageKey(fieldContextId), jobId)
    }
  } catch {
    /* see readStoredJobId */
  }
}

interface UseArticleImportJobOptions {
  fieldContextId: string
  /** Called as rows land, throttled, and once more when the job finishes. */
  onRowsLanded: () => void
}

export interface UseArticleImportJob {
  job: ArticleImportJobStatus | null
  /**
   * True while the hook is still working out whether an import is already
   * running for this field — before that answer lands, "no job" and "a job we
   * haven't read yet" are indistinguishable.
   */
  isRecovering: boolean
  isSubmitting: boolean
  error: string | null
  submit: (rows: ArticleImportRowInput[]) => Promise<void>
  /** Forget the finished job so the modal can start a fresh import. */
  clear: () => void
  setError: (message: string | null) => void
}

export function useArticleImportJob({
  fieldContextId,
  onRowsLanded,
}: UseArticleImportJobOptions): UseArticleImportJob {
  const [job, setJob] = useState<ArticleImportJobStatus | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const [isRecovering, setIsRecovering] = useState(true)

  // Refs, not state: these drive the polling effect but must never restart it.
  const landedRef = useRef(0)
  const lastRefetchRef = useRef(0)
  const onRowsLandedRef = useRef(onRowsLanded)
  onRowsLandedRef.current = onRowsLanded
  // Lets the async recovery below check whether a job has been adopted since
  // it started, without making itself depend on `jobId` and re-run. Written
  // imperatively beside every `setJobId`, not during render: the recovery's
  // guard has to see a job the member just submitted even when React has not
  // committed that state yet.
  const jobIdRef = useRef<string | null>(null)

  const adoptJobId = useCallback((next: string | null) => {
    jobIdRef.current = next
    setJobId(next)
  }, [])

  /**
   * Find the import this field already has running, if any.
   *
   * `sessionStorage` answers instantly and covers the common case — same tab,
   * modal closed and reopened. When it is empty the server is asked, because
   * empty has two meanings: nothing is running, or this is a different tab,
   * a different device, or a reload past the end of the session. Guessing the
   * first is what let the picker appear over an import the field-context
   * status section was showing as 30% done.
   *
   * Only an in-flight job is adopted. A finished one the member already
   * dismissed must not drag them back into its receipt on the next open.
   */
  useEffect(() => {
    let cancelled = false
    setIsRecovering(true)

    const stored = readStoredJobId(fieldContextId)
    if (stored) {
      // The polling effect below clears `isRecovering` once it has a snapshot.
      adoptJobId(stored)
      return
    }

    // Abortable and time-boxed: `cancelled` alone only silences the setState,
    // leaving a stalled request to hold the modal on "checking" forever with
    // no way through to the picker.
    const controller = new AbortController()
    const timeout = setTimeout(
      () => controller.abort(),
      RECOVERY_LOOKUP_TIMEOUT_MS
    )

    void (async () => {
      try {
        const authHeaders = await chatApiAuthHeaders()
        const res = await fetch(
          `/api/import/articles?fieldContextId=${encodeURIComponent(fieldContextId)}`,
          {
            credentials: 'include',
            headers: authHeaders,
            signal: controller.signal,
          }
        )
        if (cancelled) return
        if (!res.ok) throw new Error(`status ${res.status}`)
        const body = (await res.json()) as {
          jobs?: ArticleImportJobListItem[]
        }
        if (cancelled) return
        // The member may have submitted a fresh import while this was in the
        // air — that job wins, and adopting an older one would swap the panel
        // out from under them.
        if (jobIdRef.current) return
        const running = (body.jobs ?? []).find((entry) =>
          isArticleImportInFlight(entry.status)
        )
        if (!running) {
          setIsRecovering(false)
          return
        }
        writeStoredJobId(fieldContextId, running.jobId)
        // Paint from the list entry rather than holding the modal for a second
        // round trip: it already carries everything the progress panel reads.
        // `outcomes` is the one thing it omits, and only the terminal results
        // view renders those — which an in-flight job, the only kind adopted
        // here, is by definition not showing. The first poll replaces this.
        setJob({
          jobId: running.jobId,
          status: running.status,
          statusMessage: running.statusMessage,
          processedRows: running.processedRows,
          success: running.success,
          message: running.message,
          summary: running.summary,
          outcomes: [],
        })
        adoptJobId(running.jobId)
        setIsRecovering(false)
      } catch {
        // Recovery is best-effort: a failed, aborted, or timed-out lookup must
        // not block the member from starting an import, so fall through to the
        // picker.
        if (!cancelled) setIsRecovering(false)
      } finally {
        clearTimeout(timeout)
      }
    })()

    return () => {
      cancelled = true
      controller.abort()
      clearTimeout(timeout)
    }
  }, [fieldContextId, adoptJobId])

  useEffect(() => {
    if (!jobId) return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    let failures = 0

    const poll = async () => {
      try {
        const authHeaders = await chatApiAuthHeaders()
        const res = await fetch(
          `/api/import/articles/${encodeURIComponent(jobId)}`,
          { credentials: 'include', headers: authHeaders }
        )
        if (cancelled) return

        if (res.status === 404) {
          // The job is gone (or never belonged to this account). Nothing to
          // wait for — say so rather than spinning.
          writeStoredJobId(fieldContextId, null)
          setError(
            'We lost track of this import. Check the field for imported pulses, then upload any missing rows again.'
          )
          // Drop the snapshot with the id. Recovery and `submit` both seed
          // `job` before the first poll, and the modal picks its step from
          // `job` — leaving one behind here would freeze the panel on a
          // spinning "Importing…" that nothing can ever advance, directly
          // above an error saying the import was lost.
          setJob(null)
          adoptJobId(null)
          setIsRecovering(false)
          return
        }
        if (!res.ok) throw new Error(`status ${res.status}`)

        const body = (await res.json()) as ArticleImportJobStatus
        if (cancelled) return
        failures = 0
        setJob(body)
        // A snapshot is in hand — whatever the modal shows from here on is the
        // real state of this import, not a guess.
        setIsRecovering(false)

        // Tell the page as soon as pulses actually exist, so the field fills in
        // while the import runs instead of only at the end.
        const landed =
          body.summary.created +
          body.summary.skippedExisting +
          body.summary.createdPeople
        const finished = !isArticleImportInFlight(body.status)
        const now = Date.now()
        if (
          landed > landedRef.current &&
          (finished || now - lastRefetchRef.current > REFETCH_THROTTLE_MS)
        ) {
          landedRef.current = landed
          lastRefetchRef.current = now
          onRowsLandedRef.current()
        }
        if (finished) return
      } catch {
        if (cancelled) return
        failures += 1
        if (failures >= MAX_POLL_FAILURES) {
          setError(
            'We could not check on this import. It may still be running — reopen this field in a moment to see the result.'
          )
          // Stop holding the modal on a lookup that has given up — the error
          // above is the answer now.
          setIsRecovering(false)
          return
        }
      }
      if (!cancelled) timer = setTimeout(poll, POLL_INTERVAL_MS)
    }

    void poll()
    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [adoptJobId, fieldContextId, jobId])

  const submit = useCallback(
    async (rows: ArticleImportRowInput[]) => {
      if (rows.length === 0) return
      setIsSubmitting(true)
      setError(null)
      try {
        const authHeaders = await chatApiAuthHeaders()
        const res = await fetch('/api/import/articles', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify({ fieldContextId, rows }),
        })
        const body = (await res.json().catch(() => null)) as
          | { jobId?: string; error?: string }
          | null

        if (res.status === 429) {
          // The shared `rateLimited()` copy says "try again shortly", but the
          // bulk-import window is an hour — so tell the member the real wait
          // rather than letting them retry in ten seconds and fail again.
          throw new Error(rateLimitMessage(res.headers.get('Retry-After')))
        }

        if (res.status === 202 && body?.jobId) {
          landedRef.current = 0
          lastRefetchRef.current = 0
          writeStoredJobId(fieldContextId, body.jobId)
          // Optimistic first frame so the member sees "Queued" immediately
          // rather than a blank panel until the first poll returns.
          setJob({
            jobId: body.jobId,
            status: ARTICLE_IMPORT_STATUS.pending,
            statusMessage: null,
            processedRows: 0,
            success: false,
            message: '',
            summary: {
              totalRows: rows.length,
              created: 0,
              skippedExisting: 0,
              failed: 0,
              createdPeople: 0,
              matchedPeople: 0,
              articlesRead: 0,
              articlesUnread: 0,
              createdFromArticles: 0,
            },
            outcomes: [],
          })
          adoptJobId(body.jobId)
          setIsRecovering(false)
          return
        }
        throw new Error(body?.error ?? `Import failed (${res.status}).`)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Import failed.')
      } finally {
        setIsSubmitting(false)
      }
    },
    [adoptJobId, fieldContextId]
  )

  const clear = useCallback(() => {
    writeStoredJobId(fieldContextId, null)
    adoptJobId(null)
    setJob(null)
    setError(null)
    setIsRecovering(false)
    landedRef.current = 0
    lastRefetchRef.current = 0
  }, [adoptJobId, fieldContextId])

  return { job, isRecovering, isSubmitting, error, submit, clear, setError }
}
