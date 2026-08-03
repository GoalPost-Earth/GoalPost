import { after } from 'next/server'
import { z } from 'zod'
import { initGraph } from '@/modules/graph'
import { resolveAuthenticatedUserId } from '@/app/api/auth/utils'
import { rateLimit, rateLimited } from '@/lib/auth/rate-limit'
import { runContextResonanceDiscovery } from '@/lib/resonance/discovery/on-upload-discovery'
import { processArticleImport } from '@/lib/imports/article-import-service'
import {
  ARTICLE_EMAIL_SHAPE,
  ARTICLE_FIELD_LIMITS,
  MAX_ARTICLE_IMPORT_ROWS,
} from '@/lib/imports/article-import'

/**
 * GOAL-317 — spreadsheet-driven bulk upload of articles as pulses.
 *
 *   POST /api/import/articles
 *   { fieldContextId, rows: [{ row, title, author, date, url, ... }] }
 *
 * The client parses the CSV/XLSX locally (preview + confirm step), then
 * submits the typed rows. Each row becomes a pulse in the target
 * FieldContext via the authorized write-tool path — per-row failures are
 * reported without aborting the batch (200 all good / 207 partial / 400
 * nothing imported, mirroring /api/import/xlsx).
 *
 * Batches are capped at MAX_ARTICLE_IMPORT_ROWS and run synchronously
 * under the Pro-plan ceiling. The async-queue path (GOAL-292) does not
 * exist yet; when it lands, oversized batches should enqueue instead.
 */

export const maxDuration = 300

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

  // Bound how often one account can fire 300-row batches (each schedules a
  // post-response embedding sweep with real OpenAI spend).
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

  const graph = await initGraph()
  const result = await processArticleImport({
    graph,
    currentUserId,
    fieldContextId: parsed.data.fieldContextId,
    rows: parsed.data.rows,
  })

  // On-upload resonance discovery (GOAL-294 pattern): embed the new pulses
  // and any new author PersonPulses after the response is sent, so imported
  // articles surface in search/resonance without waiting for the nightly
  // cron. Only when the batch actually minted something.
  if (result.summary.created > 0 || result.summary.createdPeople > 0) {
    after(async () => {
      await runContextResonanceDiscovery({
        contextId: parsed.data.fieldContextId,
        actorUserId: currentUserId,
      })
    })
  }

  const status = result.success
    ? 200
    : result.summary.created + result.summary.skippedExisting > 0
      ? 207
      : 400

  return Response.json(result, { status })
}
