import { randomUUID } from 'node:crypto'
import type { Driver } from 'neo4j-driver'
import {
  anchorDocument,
  attachSourceFileToResource,
} from '@/lib/ingest/document-storage'
import { buildDocumentBlobKey } from '@/lib/ingest/document-blob-key'
import {
  DOCUMENT_INGEST_STATUS,
  INGEST_UNEXPECTED_FAILURE_MESSAGE,
  markDocumentIngestComplete,
  markDocumentIngestFailed,
  memberSafeIngestFailureMessage,
} from '@/lib/ingest/document-ingest-queue'
import {
  countExecutedToolCalls,
  runDocumentIngestPipeline,
  type DocumentIngestPipelineDependencies,
} from '@/lib/ingest/run-document-ingest-pipeline'
import {
  RESOURCE_TYPE_DOCUMENT,
  SOURCE_BACKED_RESOURCE,
} from '@/lib/ingest/source-resource-node'
import type { ExecutedToolCallRecord } from '@/lib/ingest/synthesized-turn-appender'
import {
  type ArticleImportRowInput,
  type ArticleRowExtraction,
  buildArticleRowPlaceholder,
  normalizeArticleUrl,
} from './article-import'
import { extractArticleText, isReadableArticleText } from './article-html-text'
import {
  fetchArticleSource,
  type ArticleFetchResult,
} from './article-url-fetcher'

/**
 * GOAL-344 — read a bulk-import row's article into its FieldContext.
 *
 * Runs AFTER the row's own pulse has landed (created or matched), so the
 * sheet's title / author / date / URL are the floor: whatever happens here,
 * the member keeps the pulse they asked for. On top of that floor this module
 * turns the row's link into the same thing a member gets from uploading the
 * article as a file:
 *
 *   1. Fetch the link (`article-url-fetcher.ts` — SSRF-hardened, member-safe
 *      failures) and reduce it to text (`article-html-text.ts`) or keep the
 *      PDF bytes.
 *   2. Make that the field's stored copy — same blob layout, same `HAS_PULSE` /
 *      `UPLOADED_BY` edges — so it shows in the document list and is
 *      downloadable, re-extractable and deletable like an upload.
 *   3. Run `runDocumentIngestPipeline` against it: entity extraction, summary,
 *      ingest thread, auto-executed create/update tools with EXTRACTED_FROM
 *      provenance and one Log per write. The row's metadata rides in as the
 *      document hint; the row's pulse is normally in the roster the extractor
 *      sees (so it emits an update), and when it is not — the roster is capped
 *      at 100 entries — `create_pulse`'s enrich-don't-duplicate branch still
 *      catches a same-title, same-type proposal.
 *   4. When the pulse's body is still the sheet placeholder (the seeded
 *      "Article by …" sentence or a bare URL), fill it with the document
 *      summary — the deterministic guarantee that the pulse the member sees
 *      carries the article's substance even when the extractor classified the
 *      piece under a different pulse type.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * GOAL-356 — ONE node per row, not two
 * ─────────────────────────────────────────────────────────────────────────────
 * Step 2 used to `anchorDocument` a brand-new node every time. That was
 * invisible while a Document was its own node type, but GOAL-354 made a document
 * *a kind of Resource* — so every document-linked row minted a second
 * `:ResourcePulse` beside the one the row already had: `resourceType: 'document'`,
 * titled "<row title>.pdf", credited by UPLOADED_BY/CREATED_BY to the importer
 * rather than to the author, cross-linked to the real one by EXTRACTED_FROM, and
 * carrying its own ingest thread and its own resonance suggestions. The member
 * saw the same artifact twice in the pulse list, and every affected row doubled
 * the downstream graph structure.
 *
 * So when the row's own pulse IS a Resource — every `ResourcePulse` row, which
 * is the default and the only type that can hold the `source*` properties — the
 * fetched article is attached to THAT node (`attachSourceFileToResource`) and no
 * second node is created. `resourceType` stays what the sheet said, the title
 * stays clean, and the author keeps INITIATED_BY. A goal or story row still
 * anchors a separate document Resource, because a `:GoalPulse` cannot carry the
 * document properties and a goal and its source article are not duplicates of
 * each other — that pair is genuine provenance, which is why the GOAL-354
 * reconcile script only ever matched `ResourcePulse` rows too.
 *
 * The document is anchored PROCESSING, not PENDING, because this run owns the
 * pipeline: a PENDING document is fair game for the document-ingestion cron,
 * which would claim it mid-run and ingest it a second time. If this worker
 * dies mid-row the stale-claim reclaim in that cron turns the document back
 * into PENDING and finishes it — and the row's re-run finds the stored copy
 * instead of fetching again. Two dedupe checks cover that, in order: the row's
 * own pulse already carrying a `sourceBlobKey` (a merged re-run), then any OTHER
 * resource in the field already fetched from this link (a second row pointing at
 * the same file, or a pre-GOAL-356 document node).
 */

export interface ArticleContentIngestDeps extends DocumentIngestPipelineDependencies {
  /** Injectable for tests; production uses `fetchArticleSource`. */
  fetchSource?: (url: string) => Promise<ArticleFetchResult>
  /**
   * Links that already failed to fetch (or had no readable article) during
   * this worker run, keyed by normalized URL — and, for a host that timed out
   * or was unreachable, by `host:<hostname>` so 300 distinct links on one dead
   * or slow host pay the fetch deadline once, not 300 times. A successful read
   * leaves a Document behind and dedupes itself; a failure leaves nothing,
   * which is why this exists. One map per `createArticleContentIngestor`.
   */
  fetchFailureCache?: Map<string, ArticleRowExtraction>
}

export interface ArticleContentIngestInput {
  fieldContextId: string
  contextTitle: string
  /** The persisted requester — every write is attributed to them. */
  requesterUserId: string
  row: ArticleImportRowInput
  /** The row's own pulse, created or matched by the import. */
  rowPulseId: string
  /** Display name the row's author resolved to (for the hint and the Log). */
  authorName: string
}

export type ArticleContentIngestor = (
  input: ArticleContentIngestInput
) => Promise<ArticleRowExtraction>

/** Member-safe copy — raw errors are logged server-side only (kb/07 Rule 1). */
export const ARTICLE_SAVE_FAILED_MESSAGE =
  'The article was fetched but could not be saved to this field, so the row was imported from the sheet details only.'
export const ARTICLE_EXTRACTION_FAILED_MESSAGE =
  "The article was saved to this field's documents, but nothing could be extracted from it. Re-extract it there to try again."
export const ARTICLE_UNREADABLE_PAGE_MESSAGE =
  'The page did not contain readable article text — it may need a login or only render in a browser.'
export const ARTICLE_ALREADY_READ_MESSAGE =
  'This article was already read into the field by an earlier import.'
export const ARTICLE_IN_PROGRESS_MESSAGE =
  'This article is still being read from an earlier import.'
export const ARTICLE_PREVIOUS_FAILURE_MESSAGE =
  "This article was fetched by an earlier import but could not be processed. Re-extract it from the field's documents to try again."

const PULSE_TYPE_LABEL: Record<ArticleImportRowInput['pulseType'], string> = {
  GoalPulse: 'Goal',
  ResourcePulse: 'Resource',
  StoryPulse: 'Story',
}

/** Longest title we fold into a stored filename. */
const MAX_FILENAME_TITLE_CHARS = 120

/**
 * Ceiling on the extraction + summary calls for one article. The worker's row
 * deadline is sized against this plus the fetch cap (`article-url-fetcher.ts`)
 * and the entity writes, so a slow model answer becomes an ordinary
 * `extraction_failed` row instead of a killed function and a stranded claim.
 */
export const ARTICLE_MODEL_CALL_TIMEOUT_MS = 90_000

function extraction(
  status: ArticleRowExtraction['status'],
  message: string | null = null,
  counts: { created: number; updated: number } = { created: 0, updated: 0 }
): ArticleRowExtraction {
  return { status, message, ...counts }
}

/**
 * The document hint the extractor and summarizer read (`USER HINT`). Names the
 * author so the byline rule credits them, and the title so the roster match
 * lands on the row's pulse. Also what the document row shows as its hint.
 */
export function buildArticleDocumentHint(
  row: ArticleImportRowInput,
  authorName: string
): string {
  const date = row.date?.trim() ? `, published ${row.date.trim()}` : ''
  return `Article "${row.title.trim()}" by ${authorName}${date}. Source: ${row.url.trim()}`
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase()
  } catch {
    return url
  }
}

function buildDocumentFilename(title: string, extension: string): string {
  const base = title
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_FILENAME_TITLE_CHARS)
  return `${base || 'article'}${extension}`
}

/** Decode fetched bytes using the declared charset, else a <meta> charset, else UTF-8. */
function decodeText(buffer: Buffer, declaredCharset: string | null): string {
  let charset = declaredCharset
  if (!charset) {
    const head = buffer.subarray(0, 4096).toString('latin1')
    // Matches both `<meta charset=…>` and the http-equiv `content="…; charset=…"` form.
    const meta = /<meta\b[^>]*charset=["']?\s*([a-z0-9_-]+)/i.exec(head)?.[1]
    charset = meta?.toLowerCase() ?? null
  }
  if (charset && charset !== 'utf-8' && charset !== 'utf8') {
    try {
      return new TextDecoder(charset).decode(buffer)
    } catch {
      // Unknown label — fall through to UTF-8.
    }
  }
  return buffer.toString('utf8')
}

interface StoredArticle {
  filename: string
  mimeType: string
  buffer: Buffer
}

/**
 * Reduce a fetched source to what the ingest pipeline stores: text routes
 * become UTF-8 `.txt`, PDFs stay PDFs (the multimodal route reads them
 * directly). Null when an HTML page had no readable article in it.
 */
function toStoredArticle(
  fetched: Extract<ArticleFetchResult, { ok: true }>,
  rowTitle: string
): StoredArticle | null {
  if (fetched.kind === 'pdf') {
    return {
      filename: buildDocumentFilename(rowTitle, '.pdf'),
      mimeType: 'application/pdf',
      buffer: fetched.buffer,
    }
  }
  if (fetched.kind === 'html') {
    const { text } = extractArticleText(
      decodeText(fetched.buffer, fetched.charset)
    )
    if (!isReadableArticleText(text)) return null
    return {
      filename: buildDocumentFilename(rowTitle, '.txt'),
      mimeType: 'text/plain',
      buffer: Buffer.from(text, 'utf8'),
    }
  }
  const text = decodeText(fetched.buffer, fetched.charset).trim()
  if (!isReadableArticleText(text)) return null
  return {
    filename: buildDocumentFilename(rowTitle, '.txt'),
    mimeType: 'text/plain',
    buffer: Buffer.from(text, 'utf8'),
  }
}

interface RowPulseShape {
  /** Can this pulse hold the `source*` properties itself? (GOAL-356) */
  isResource: boolean
  /** Already document-backed — this row has been read before. */
  hasSourceFile: boolean
  /** Its ingest status, when it has a file. */
  status: string
}

/**
 * What the row's own pulse is, decided by the graph rather than by
 * `row.pulseType`: the id came back from `create_pulse`, which may have matched
 * a pre-existing pulse, and everything downstream (the `d:ResourcePulse` gate in
 * every document query) keys off the labels actually on the node. Anchored on
 * the context so a stale id from another Space can never be adopted.
 */
async function findRowPulseShape(
  driver: Driver,
  fieldContextId: string,
  rowPulseId: string
): Promise<RowPulseShape | null> {
  const session = driver.session()
  try {
    const result = await session.executeRead((tx) =>
      tx.run(
        `
        MATCH (c:FieldContext {id: $fieldContextId})-[:HAS_PULSE]->(p:FieldPulse {id: $rowPulseId})
        RETURN p:ResourcePulse AS isResource,
               p.sourceBlobKey IS NOT NULL AS hasSourceFile,
               coalesce(p.ingestStatus, $complete) AS status
        LIMIT 1
        `,
        { fieldContextId, rowPulseId, complete: DOCUMENT_INGEST_STATUS.complete }
      )
    )
    const record = result.records[0]
    if (!record) return null
    return {
      isResource: Boolean(record.get('isResource')),
      hasSourceFile: Boolean(record.get('hasSourceFile')),
      status: record.get('status') as string,
    }
  } finally {
    await session.close()
  }
}

/**
 * Has this link already been read into this field by SOME OTHER resource?
 * Anchored on the context so the check never sees another Space's documents.
 *
 * Two rows of one sheet legitimately point at the same file (a shared PDF
 * described twice), and pre-GOAL-356 imports left standalone document nodes
 * behind; both are matched here so the article is fetched and ingested once and
 * the second row gets provenance instead of a duplicate read.
 *
 * Two narrowings, both GOAL-356 and both guarding the same hazard — `sourceUrl`
 * has been dual-purpose since GOAL-355, meaning either "the link these bytes
 * were fetched from" or "the link the member says they found this at", and only
 * the first is evidence the article was ever read:
 *
 *   - `SOURCE_BACKED_RESOURCE`, so a resource that merely carries a
 *     member-typed `source_url` and has no file cannot answer for one. Without
 *     it, a row whose `url` equals some other row's `source_url` is reported
 *     `already_extracted`, takes a false EXTRACTED_FROM edge to that unrelated
 *     pulse, and its article is silently never fetched.
 *   - the row's own pulse is excluded, which is the same collision within a
 *     single row: a member may put one link in both the `url` and `source_url`
 *     columns.
 */
async function findArticleDocument(
  driver: Driver,
  fieldContextId: string,
  sourceUrl: string,
  excludePulseId: string
): Promise<{ id: string; status: string } | null> {
  const session = driver.session()
  try {
    const result = await session.executeRead((tx) =>
      tx.run(
        `
        MATCH (c:FieldContext {id: $fieldContextId})-[:HAS_PULSE]->(d:ResourcePulse)
        WHERE d.sourceUrl = $sourceUrl
          AND d.id <> $excludePulseId
          AND ${SOURCE_BACKED_RESOURCE}
        RETURN d.id AS id, coalesce(d.ingestStatus, $complete) AS status
        ORDER BY coalesce(d.uploadedAt, d.createdAt) DESC
        LIMIT 1
        `,
        {
          fieldContextId,
          sourceUrl,
          excludePulseId,
          resourceType: RESOURCE_TYPE_DOCUMENT,
          complete: DOCUMENT_INGEST_STATUS.complete,
        }
      )
    )
    const record = result.records[0]
    if (!record) return null
    return {
      id: record.get('id') as string,
      status: record.get('status') as string,
    }
  } finally {
    await session.close()
  }
}

/**
 * Attach the row's pulse to its article document and fill a placeholder body
 * from the document summary. Fill-gaps-only: a body the member wrote in the
 * sheet's description column stays, unless it was nothing but the link
 * itself. Also clears the embedding so the discovery sweep re-embeds the
 * pulse on its real content. One Log, only when the body actually changed.
 *
 * Runs in both shapes (GOAL-356). When the row's pulse IS the document, `d` and
 * `p` bind to the same node and only the fill happens; when the article was
 * stored on a separate node (a goal/story row, or another row's copy of the same
 * file) the provenance edge is written too.
 */
async function attachRowPulseToDocument(
  driver: Driver,
  input: {
    pulseId: string
    documentId: string
    userId: string
    fieldContextId: string
    placeholder: string
    logDescription: string
  }
): Promise<boolean> {
  const session = driver.session()
  try {
    const result = await session.executeWrite((tx) =>
      tx.run(
        `
        // Both ends anchored on the field the import targets, so a stale or
        // mismatched pulse id can never link a pulse to a document elsewhere.
        MATCH (c:FieldContext {id: $fieldContextId})-[:HAS_PULSE]->(p:FieldPulse {id: $pulseId})
        MATCH (c)-[:HAS_PULSE]->(d:FieldPulse {id: $documentId})
          WHERE d:ResourcePulse
        MATCH (u:Person:User {id: $userId})
        // Provenance only when the two are actually different nodes. Since
        // GOAL-356 the row's pulse normally IS the document, and an
        // unconditional MERGE would give it an EXTRACTED_FROM edge to itself —
        // a self-loop that only became expressible once a document became a
        // pulse. Guarding it as a filter instead would drop the row entirely
        // and lose the summary fill with it.
        FOREACH (_ IN CASE WHEN d <> p THEN [1] ELSE [] END |
          MERGE (p)-[:EXTRACTED_FROM]->(d)
        )
        WITH p, d, u,
          (d.sourceSummary IS NOT NULL AND trim(d.sourceSummary) <> ''
            AND (
              p.content IS NULL
              OR trim(p.content) = ''
              OR trim(p.content) = $placeholder
              OR trim(p.content) =~ '(?i)^https?://\\\\S+$'
            )) AS fill
        FOREACH (_ IN CASE WHEN fill THEN [1] ELSE [] END |
          SET p.content = d.sourceSummary,
              p.embedding = null,
              p.updatedAt = datetime(),
              p.modifiedAt = datetime()
          CREATE (log:Log {
            id: $logId,
            description: $logDescription,
            metadata: $metadata,
            createdAt: datetime()
          })
          CREATE (log)-[:CREATED_BY]->(u)
          CREATE (log)-[:LOGGED_FOR]->(p)
        )
        RETURN fill
        `,
        {
          fieldContextId: input.fieldContextId,
          pulseId: input.pulseId,
          documentId: input.documentId,
          userId: input.userId,
          placeholder: input.placeholder,
          logId: `log_${Date.now()}_${randomUUID().slice(0, 8)}`,
          logDescription: input.logDescription,
          metadata: JSON.stringify({
            source: 'article-import',
            fieldContextId: input.fieldContextId,
            documentId: input.documentId,
          }),
        }
      )
    )
    if (result.records.length === 0) {
      // No row means one of the three anchors did not resolve inside this
      // field — nothing was linked or filled. Loud, because the caller has
      // just minted every id involved and a miss here is a bug, not a state.
      console.error(
        `[article-import] attach matched nothing: pulse ${input.pulseId} / document ${input.documentId} in context ${input.fieldContextId}`
      )
      return false
    }
    return Boolean(result.records[0].get('fill'))
  } finally {
    await session.close()
  }
}

/**
 * Created vs updated, on the same rule the ingest thread summary uses: a
 * `create_*` that hit its enrich-don't-duplicate path is an update, and a
 * MENTIONED_IN link is neither.
 */
export function countArticleEntities(executed: ExecutedToolCallRecord[]): {
  created: number
  updated: number
} {
  const landed = executed.filter(
    (call) =>
      call.result.success !== false && call.tool !== 'link_entity_to_pulse'
  )
  const created = landed.filter(
    (call) =>
      call.tool.startsWith('create_') && call.result.alreadyExisted !== true
  ).length
  return { created, updated: landed.length - created }
}

export async function ingestArticleForRow(
  deps: ArticleContentIngestDeps,
  input: ArticleContentIngestInput
): Promise<ArticleRowExtraction> {
  // The same normalized form the row's pulse carries as `location`, so the
  // dedupe key and the fetched URL never disagree with what the member sees.
  //
  // NOTE (GOAL-355): this is deliberately `row.url` — the resource itself —
  // and NOT `row.sourceUrl`, the sheet's new `source_url` column. Despite the
  // name collision with this local, `row.sourceUrl` is store-and-display only
  // and must never be fetched server-side: it is a member-supplied link that
  // has been through no gate but the http(s) scheme check, so fetching it
  // would hand the import worker an SSRF vector.
  const sourceUrl = normalizeArticleUrl(input.row.url) ?? input.row.url.trim()
  const rowTitle = input.row.title.trim()
  const label = PULSE_TYPE_LABEL[input.row.pulseType]
  const where = input.contextTitle.trim() || 'this field'
  const attachRowPulse = (documentId: string) =>
    attachRowPulseToDocument(deps.driver, {
      pulseId: input.rowPulseId,
      documentId,
      userId: input.requesterUserId,
      fieldContextId: input.fieldContextId,
      placeholder: buildArticleRowPlaceholder(input.row),
      logDescription: `Filled in ${label} "${rowTitle}" in ${where} from its article`,
    })

  /**
   * A stored copy of this article already exists — on the row's own pulse or on
   * another node in the field. Never re-fetch; just settle the row's outcome.
   */
  const alreadyRead = async (
    documentId: string,
    status: string
  ): Promise<ArticleRowExtraction> => {
    if (status === DOCUMENT_INGEST_STATUS.failed) {
      return extraction('extraction_failed', ARTICLE_PREVIOUS_FAILURE_MESSAGE)
    }
    if (
      status === DOCUMENT_INGEST_STATUS.pending ||
      status === DOCUMENT_INGEST_STATUS.processing
    ) {
      return extraction('in_progress', ARTICLE_IN_PROGRESS_MESSAGE)
    }
    // Already read — but a row whose first pass died between the anchor and
    // the attach (or a re-upload after a mid-run crash) still owes its pulse
    // the provenance edge and the body fill. Both writes are idempotent.
    let filled = false
    try {
      filled = await attachRowPulse(documentId)
    } catch (error) {
      console.error(
        `[article-import] could not attach row pulse ${input.rowPulseId} to existing document ${documentId}:`,
        error
      )
    }
    return extraction('already_extracted', ARTICLE_ALREADY_READ_MESSAGE, {
      created: 0,
      updated: filled ? 1 : 0,
    })
  }

  // GOAL-356 — the row's own pulse is the article's node whenever it can be.
  // Read from the graph, not from `row.pulseType`: `create_pulse` may have
  // matched a pre-existing pulse, and every document query gates on the labels
  // actually present. A pulse we cannot resolve at all falls through to the
  // separate-node path, which is self-contained and cannot make things worse.
  const rowPulse = await findRowPulseShape(
    deps.driver,
    input.fieldContextId,
    input.rowPulseId
  )
  const mergeIntoRowPulse = rowPulse?.isResource === true

  if (rowPulse?.hasSourceFile) {
    return alreadyRead(input.rowPulseId, rowPulse.status)
  }

  const existing = await findArticleDocument(
    deps.driver,
    input.fieldContextId,
    sourceUrl,
    input.rowPulseId
  )
  if (existing) {
    return alreadyRead(existing.id, existing.status)
  }

  const hostKey = `host:${hostnameOf(sourceUrl)}`
  const cachedFailure =
    deps.fetchFailureCache?.get(sourceUrl) ??
    deps.fetchFailureCache?.get(hostKey)
  if (cachedFailure) return cachedFailure

  const fetched = await (deps.fetchSource ?? fetchArticleSource)(sourceUrl)
  if (!fetched.ok) {
    const failed = extraction('fetch_failed', fetched.message)
    deps.fetchFailureCache?.set(sourceUrl, failed)
    if (fetched.reason === 'timeout' || fetched.reason === 'unreachable') {
      deps.fetchFailureCache?.set(hostKey, failed)
    }
    return failed
  }

  const stored = toStoredArticle(fetched, rowTitle)
  if (!stored) {
    const unreadable = extraction(
      'fetch_failed',
      ARTICLE_UNREADABLE_PAGE_MESSAGE
    )
    deps.fetchFailureCache?.set(sourceUrl, unreadable)
    return unreadable
  }

  // GOAL-356: the row's own Resource holds the file when it can, so no second
  // node is minted. The blob key shape is unchanged either way — it is
  // `documents/<node id>/<filename>`, and every reader derives it from the
  // stored `sourceBlobKey` rather than parsing the id back out of it.
  const documentId = mergeIntoRowPulse
    ? input.rowPulseId
    : `document_${randomUUID()}`
  const blobKey = buildDocumentBlobKey(documentId, stored.filename)
  try {
    await deps.blobStore.put({
      key: blobKey,
      contentType: stored.mimeType,
      buffer: stored.buffer,
    })
    const anchored = {
      fieldContextId: input.fieldContextId,
      filename: stored.filename,
      mimeType: stored.mimeType,
      sizeBytes: stored.buffer.length,
      pageCount: null,
      userHint: buildArticleDocumentHint(input.row, input.authorName),
      blobKey,
      blobUrl: blobKey,
      sourceUrl,
      // Owned by this run — see the module header.
      status: DOCUMENT_INGEST_STATUS.processing,
    }
    if (mergeIntoRowPulse) {
      const attached = await attachSourceFileToResource({
        driver: deps.driver,
        resourceId: documentId,
        uploaderUserId: input.requesterUserId,
        ...anchored,
      })
      if (attached === 'already_source_backed') {
        // Lost the attach race: a concurrent import job (or an upload) got this
        // resource its file first, and that run owns the pipeline. Reported as
        // in-progress rather than as an error — the row's pulse is fine and its
        // article IS being read, just not by us. Our blob is left for S3
        // lifecycle rather than deleted, since the winner's key is the one on
        // the node and deleting by key here would race that too.
        return extraction('in_progress', ARTICLE_IN_PROGRESS_MESSAGE)
      }
      if (attached !== 'attached') {
        // 'not_found' — the pulse resolved as a Resource under this context
        // moments ago, so this is a bug or a vanished uploader, not a
        // member-facing condition. The row keeps the pulse it already has.
        throw new Error(
          `attachSourceFileToResource returned "${attached}" for ${documentId}`
        )
      }
    } else {
      await anchorDocument({
        driver: deps.driver,
        documentId,
        uploaderUserId: input.requesterUserId,
        ...anchored,
      })
    }
  } catch (error) {
    console.error(
      `[article-import] could not store the article for row ${input.row.row} in context ${input.fieldContextId}:`,
      error
    )
    return extraction('extraction_failed', ARTICLE_SAVE_FAILED_MESSAGE)
  }

  let run: Awaited<ReturnType<typeof runDocumentIngestPipeline>>
  try {
    run = await runDocumentIngestPipeline(deps, {
      documentId,
      actingUserId: input.requesterUserId,
      userTurnVerb: 'Imported',
      modelAbortSignal: AbortSignal.timeout(ARTICLE_MODEL_CALL_TIMEOUT_MS),
    })
  } catch (error) {
    console.error(
      `[article-import] ingest pipeline crashed for document ${documentId}:`,
      error
    )
    await markDocumentIngestFailed({
      driver: deps.driver,
      documentId,
      statusMessage: INGEST_UNEXPECTED_FAILURE_MESSAGE,
    }).catch(() => undefined)
    return extraction('extraction_failed', ARTICLE_EXTRACTION_FAILED_MESSAGE)
  }

  if (!run.ok) {
    await markDocumentIngestFailed({
      driver: deps.driver,
      documentId,
      statusMessage: memberSafeIngestFailureMessage(run.reason, run.error),
    })
    return extraction('extraction_failed', ARTICLE_EXTRACTION_FAILED_MESSAGE)
  }

  await markDocumentIngestComplete({
    driver: deps.driver,
    documentId,
    ...countExecutedToolCalls(run.executedToolCalls),
  })

  const counts = countArticleEntities(run.executedToolCalls)
  try {
    const filled = await attachRowPulse(documentId)
    if (filled) counts.updated += 1
  } catch (error) {
    // The document and its extracted entities are already durable; losing
    // the body fill only leaves the placeholder, which the member can edit.
    console.error(
      `[article-import] could not attach row pulse ${input.rowPulseId} to document ${documentId}:`,
      error
    )
  }

  if (run.extractionFailed) {
    return extraction(
      'extraction_failed',
      ARTICLE_EXTRACTION_FAILED_MESSAGE,
      counts
    )
  }
  return counts.created + counts.updated > 0
    ? extraction('extracted', null, counts)
    : extraction('nothing_extracted', null, counts)
}

export function createArticleContentIngestor(
  deps: ArticleContentIngestDeps
): ArticleContentIngestor {
  const runDeps: ArticleContentIngestDeps = {
    ...deps,
    fetchFailureCache: deps.fetchFailureCache ?? new Map(),
  }
  return (input) => ingestArticleForRow(runDeps, input)
}
