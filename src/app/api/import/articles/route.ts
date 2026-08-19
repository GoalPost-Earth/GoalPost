import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { driver } from '@/lib/neo4j/driver'
import { initGraph } from '@/modules/graph'
import { resolveAuthenticatedUserId } from '@/app/api/auth/utils'
import { rateLimit, rateLimited } from '@/lib/auth/rate-limit'
import { loadEditableContext } from '@/lib/imports/article-import-service'
import {
  IMPORT_FORBIDDEN_MESSAGE,
  createArticleImportJob,
} from '@/lib/imports/article-import-queue'
import {
  ARTICLE_EMAIL_SHAPE,
  ARTICLE_FIELD_LIMITS,
  ARTICLE_IMPORT_STATUS,
  MAX_ARTICLE_IMPORT_ROWS,
} from '@/lib/imports/article-import'

/**
 * GOAL-317 — spreadsheet-driven bulk upload of articles as pulses.
 * GOAL-326 — the batch is queued, not run inline.
 *
 *   POST /api/import/articles
 *   { fieldContextId, rows: [{ row, title, author, date, url, ... }] }
 *   → 202 { jobId, status: 'PENDING', totalRows }
 *
 * The client parses the CSV/XLSX locally (preview + confirm step), then
 * submits the typed rows. This request authenticates, rate-limits, validates,
 * gates on `canEditContent`, and anchors an `:ArticleImportJob` as PENDING.
 * `/api/cron/process-article-imports` mints the pulses; the client polls
 * `GET /api/import/articles/<jobId>` for progress and the per-row result.
 *
 * Previously this route ran the whole row loop inline under `maxDuration = 300`
 * and scheduled the embedding/resonance sweep in a fire-and-forget `after()` —
 * a 300-row batch raced the serverless ceiling, and the sweep (real OpenAI
 * spend) was neither durable, retried, nor observable. Same failure mode
 * GOAL-292 fixed for document ingestion, and the same fix: enqueue + worker.
 * Nothing here is slow any more, so the raised `maxDuration` is gone.
 */

const articleRowSchema = z.object({
  row: z.number().int().min(2),
  title: z.string().trim().min(1).max(ARTICLE_FIELD_LIMITS.title),
  author: z.string().trim().min(1).max(ARTICLE_FIELD_LIMITS.author),
  authorEmail: z
    .string()
    .trim()
    .regex(ARTICLE_EMAIL_SHAPE, 'Invalid author email.')
    .max(ARTICLE_FIELD_LIMITS.authorEmail)
    .optional(),
  date: z.string().trim().min(1).max(ARTICLE_FIELD_LIMITS.date),
  url: z.string().trim().min(1).max(ARTICLE_FIELD_LIMITS.url),
  pulseType: z.enum(['GoalPulse', 'ResourcePulse', 'StoryPulse']),
  description: z
    .string()
    .trim()
    .max(ARTICLE_FIELD_LIMITS.description)
    .optional(),
})

const articleImportSchema = z.object({
  fieldContextId: z.string().trim().min(1),
  rows: z
    .array(articleRowSchema)
    .min(1, 'At least one row is required.')
    .max(
      MAX_ARTICLE_IMPORT_ROWS,
      `A single import is capped at ${MAX_ARTICLE_IMPORT_ROWS} rows — split larger sheets into batches.`
    ),
})

export async function POST(req: Request) {
  const currentUserId = resolveAuthenticatedUserId(req)
  if (!currentUserId) {
    return Response.json({ error: 'Authentication required' }, { status: 401 })
  }

  // Bound how often one account can queue 300-row batches (each ends in an
  // embedding + resonance sweep with real OpenAI spend).
  const { allowed, retryAfter } = await rateLimit({
    policy: 'bulk-import',
    key: currentUserId,
  })
  if (!allowed) return rateLimited(retryAfter)

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Expected JSON body.' }, { status: 400 })
  }

  const parsed = articleImportSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      {
        error: 'Invalid import payload.',
        details: parsed.error.flatten(),
      },
      { status: 400 }
    )
  }

  // Permission gate BEFORE any write. The synchronous path could leave this to
  // `processArticleImport`, which ran in the same request; now the worker acts
  // on the persisted REQUESTED_BY edge, so an unauthorized caller must never
  // get a job at all. Missing and forbidden share one message so the response
  // cannot be used to probe for contexts in other people's Spaces.
  const graph = await initGraph()
  const context = await loadEditableContext(
    graph,
    currentUserId,
    parsed.data.fieldContextId
  )
  if (!context.found || !context.allowed) {
    return Response.json(
      { error: IMPORT_FORBIDDEN_MESSAGE, reason: 'forbidden' },
      { status: 403 }
    )
  }

  // Enqueueing is cheap now, which removes the synchronous design's accidental
  // throttle (the member had to wait for one import before starting another).
  // The `bulk-import` rate limit is the primary bound but fails OPEN when Redis
  // is unreachable, so the in-flight cap is the one that has to hold — which is
  // why it is enforced INSIDE the enqueue write rather than as a read before
  // it. A count-then-create would be a check-then-act, and N concurrent
  // requests would all see zero in flight and all enqueue.
  const jobId = `import_${randomUUID()}`
  const enqueued = await createArticleImportJob(driver, {
    jobId,
    fieldContextId: parsed.data.fieldContextId,
    requesterUserId: currentUserId,
    rows: parsed.data.rows,
  })
  if (!enqueued.created) {
    return Response.json(
      {
        error: `You have ${enqueued.inFlight} imports still being processed. Wait for those to finish before starting another.`,
        reason: 'queue_full',
      },
      { status: 429 }
    )
  }

  // 202 Accepted: the batch is queued, nothing has been written into the field
  // yet. The client polls the job for progress rather than waiting here.
  return Response.json(
    {
      jobId,
      status: ARTICLE_IMPORT_STATUS.pending,
      totalRows: parsed.data.rows.length,
    },
    { status: 202 }
  )
}
