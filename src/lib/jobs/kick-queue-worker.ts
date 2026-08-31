import { after } from 'next/server'

/**
 * Enqueue-time kick for the Neo4j-anchored job queues (GOAL-292 document
 * ingestion, GOAL-326 bulk article imports).
 *
 * The queues were built to be drained by a scheduler: Vercel Cron on
 * production (`vercel.json`, every minute) and the drain-queues GitHub
 * workflow everywhere else. Vercel Cron only ever fires against the
 * production deployment, and GitHub `schedule:` ticks are best-effort —
 * measured 19–94 minutes apart under scheduler throttling (2026-08-24),
 * nowhere near the 5 the cron expression asks for. A job enqueued on dev or
 * demo right after a tick could therefore sit PENDING for well over an hour
 * while the UI promised "importing starts shortly".
 *
 * This makes that promise true by starting a sweep the moment work exists:
 * once the enqueue response is sent (`after()`), call the same worker route
 * the schedulers call, authenticated the same way. The schedulers stay on as
 * the retry / stalled-claim backstop — the kick is a latency optimization,
 * never the delivery guarantee, which is why every failure path here only
 * warns. Overlap between a kick and a scheduled sweep is safe by design:
 * workers claim jobs behind a conditional, lock-forcing transition, so a
 * duplicate invocation finds nothing to claim and exits. One thing kicks DO
 * change about overlap: a burst of N enqueues now starts up to N sweeps at
 * once where the scheduler paced them a minute apart, so LLM/embedding call
 * parallelism rises with burst size — if an OpenAI rate-limit incident ever
 * points here, that is the mechanism (bounded by the same enqueue rate
 * limits and in-flight caps that bound the queues themselves).
 */

const WORKER_PATHS = {
  'document-ingest': '/api/cron/process-document-ingestion',
  'article-imports': '/api/cron/process-article-imports',
} as const

export type QueueWorkerKind = keyof typeof WORKER_PATHS

/**
 * The kick carries CRON_SECRET as a bearer header, and the target origin is
 * derived from the incoming request's own URL — so a kick on dev drains dev,
 * a preview deployment drains itself, and localhost drains localhost. That
 * URL is built from the Host header, which Vercel validates (a request only
 * routes to this deployment for domains assigned to it), but the secret must
 * still never leave hosts we own: apex + subdomains of goalpost.earth, this
 * team's own Vercel deployment URLs, and local dev. A bare `.vercel.app`
 * suffix would trust every Vercel customer's deployment — the team-scoped
 * suffix keeps the allowlist meaningful even without the platform routing
 * guarantee. An origin that fails this check just skips the kick (with a
 * warn); the scheduled sweeps still drain the queue.
 */
function isTrustedKickOrigin(url: URL): boolean {
  const host = url.hostname
  if (host === 'localhost' || host === '127.0.0.1' || host === '[::1]') {
    return true
  }
  if (url.protocol !== 'https:') return false
  return (
    host === 'goalpost.earth' ||
    host.endsWith('.goalpost.earth') ||
    host.endsWith('-codefoundry.vercel.app')
  )
}

export function kickQueueWorker(
  request: Request,
  kind: QueueWorkerKind
): void {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    // The worker routes are fail-closed without it, so there is nothing to
    // call. The scheduled sweeps (which carry their own copy) still run.
    // This is also the branch jest lands in: its dotenv setup has no
    // CRON_SECRET, which keeps route-handler tests off `after()` entirely.
    console.warn(
      `[kick-queue-worker] CRON_SECRET is not set — the ${kind} queue drains on the next scheduled sweep instead.`
    )
    return
  }

  let target: URL
  try {
    target = new URL(WORKER_PATHS[kind], new URL(request.url).origin)
  } catch {
    // Route-handler request URLs are always absolute, so this is near-dead
    // code — but an unparseable origin must fail closed, and quietly failing
    // closed would break this file's "every failure path warns" promise.
    console.warn(
      `[kick-queue-worker] could not derive a kick origin for ${kind} — the queue drains on the next scheduled sweep instead.`
    )
    return
  }
  if (!isTrustedKickOrigin(target)) {
    console.warn(
      `[kick-queue-worker] refusing to send CRON_SECRET to untrusted origin ${target.origin}`
    )
    return
  }

  try {
    after(async () => {
      try {
        // 30s is launch-confirmation, not sweep-duration: long enough to
        // catch the failures worth logging (401 secret mismatch, immediate
        // 5xx, unreachable host), deliberately far below the worker's
        // `maxDuration = 300`. A longer hold cannot work anyway — `after()`
        // runs inside THIS route's function lifetime, and the enqueue routes
        // use the default `maxDuration` — and it is not needed: neither
        // Vercel nor `next dev` cancels an in-flight route handler when the
        // caller disconnects (the workers never read `request.signal`), so
        // an aborted kick leaves the sweep running to completion in its own
        // invocation.
        const response = await fetch(target, {
          headers: { authorization: `Bearer ${cronSecret}` },
          cache: 'no-store',
          signal: AbortSignal.timeout(30_000),
        })
        if (!response.ok) {
          console.warn(
            `[kick-queue-worker] ${kind} kick answered ${response.status} — the queue drains on the next scheduled sweep instead.`
          )
        }
      } catch (error) {
        // The timeout firing is the EXPECTED shape of a healthy long sweep
        // (the worker is busy processing, per above) — stay silent so the
        // common case doesn't read as an error in the logs.
        if (error instanceof Error && error.name === 'TimeoutError') return
        console.warn(`[kick-queue-worker] ${kind} kick failed:`, error)
      }
    })
  } catch (error) {
    // `after()` throws outside a Next request scope (jest invokes route
    // handlers directly). The kick is an optimization on top of a durable
    // queue — losing it must never fail the enqueue.
    console.warn(
      `[kick-queue-worker] could not schedule the ${kind} kick:`,
      error
    )
  }
}
