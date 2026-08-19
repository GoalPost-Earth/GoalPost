import { driver } from '@/lib/neo4j/driver'
import { resolveAuthenticatedUserId } from '@/app/api/auth/utils'
import { readArticleImportJobForRequester } from '@/lib/imports/article-import-queue'
import {
  ARTICLE_IMPORT_STATUS,
  buildArticleImportMessage,
  isArticleImportInFlight,
  summarizeArticleOutcomes,
  type ArticleImportJobStatus,
  type ArticleRowOutcome,
  type PersistedArticleRowOutcome,
} from '@/lib/imports/article-import'

/**
 * GOAL-326 — progress + result for one queued bulk article import.
 *
 *   GET /api/import/articles/<jobId>
 *   → 200 ArticleImportJobStatus
 *
 * The import modal polls this after `POST /api/import/articles` answers 202,
 * and renders the same per-row result view the synchronous response used to
 * carry. Every count is derived from the durable per-row outcomes rather than
 * stored counters, so a job that was interrupted and resumed reports exactly
 * what a straight-through run would.
 *
 * REST rather than a GraphQL query, deliberately: `:ArticleImportJob` is queue
 * infrastructure, not domain data (same class as `:LlmUsage`, which is also
 * absent from the SDL). Exposing it as a GraphQL type would mean generated CRUD
 * roots over the job's own status machine — precisely the hole GOAL-292 had to
 * close on `Document` with `@mutation(operations: [])`. This sits beside the
 * POST that creates the job, on the existing `/api/import/*` surface.
 */

/**
 * The persisted shape carries `personEvent`, which exists only to make the
 * summary derivable from the outcome list. Project it away rather than widening
 * the public row shape with a field no client reads.
 */
function toClientOutcome(
  outcome: PersistedArticleRowOutcome
): ArticleRowOutcome {
  return {
    row: outcome.row,
    title: outcome.title,
    status: outcome.status,
    message: outcome.message,
    authorName: outcome.authorName,
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const currentUserId = resolveAuthenticatedUserId(req)
  if (!currentUserId) {
    return Response.json({ error: 'Authentication required' }, { status: 401 })
  }

  const { jobId } = await params
  const snapshot = await readArticleImportJobForRequester(
    driver,
    jobId,
    currentUserId
  )
  // The read is scoped to the requester, so "not yours" and "not there" arrive
  // here identically — answer both with the same 404.
  if (!snapshot) {
    return Response.json({ error: 'Import not found.' }, { status: 404 })
  }

  const summary = summarizeArticleOutcomes(
    snapshot.outcomes,
    snapshot.totalRows
  )
  // `success` is about the batch, not the request: true only once the job has
  // finished AND every row landed. An in-flight job is never "successful" yet.
  const success =
    snapshot.status === ARTICLE_IMPORT_STATUS.complete && summary.failed === 0

  const body: ArticleImportJobStatus = {
    jobId,
    status: snapshot.status,
    statusMessage: snapshot.statusMessage,
    processedRows: snapshot.outcomes.length,
    success,
    message: buildArticleImportMessage(summary),
    summary,
    // Per-row detail only once the job is finished. The progress panel reads
    // `processedRows`/`summary`, and the results view renders only at a
    // terminal status — so shipping the full list on every 2s poll was ~60KB
    // × ~30/minute of pure waste on a 300-row import.
    outcomes: isArticleImportInFlight(snapshot.status)
      ? []
      : snapshot.outcomes.map(toClientOutcome),
  }

  // Per-user authenticated payload — never let a shared cache hold it, matching
  // the sibling `ingest/document/[documentId]/download` route.
  return Response.json(body, {
    headers: { 'Cache-Control': 'private, no-store' },
  })
}
