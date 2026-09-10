import type { Driver } from 'neo4j-driver'
import type { BlobStore } from './blob-store'
import {
  DOCUMENT_INGEST_STATUS,
  type DocumentIngestStatus,
} from './document-ingest-queue'
import {
  RESOURCE_TYPE_DOCUMENT,
  SOURCE_BACKED_RESOURCE,
} from './source-resource-node'

/**
 * Owns the lifecycle of `Document` nodes and their backing blob. v1 ships
 * with one mimeType (text/plain) and a flat `documents/<docId>/<filename>`
 * blob key; later slices add PDF/MD and size gating, none of which change
 * the (ResourcePulse, HAS_PULSE, UPLOADED_BY) graph contract pinned here.
 *
 * Order of operations on `uploadDocument`:
 *   1. Reserve the graph: MATCH the FieldContext + uploader, then CREATE
 *      the Document node and edges in one transaction. If the FieldContext
 *      doesn't exist the CREATE pattern returns zero rows and we throw
 *      BEFORE touching blob storage — so a bad upload can never leak a
 *      blob without a parent node.
 *   2. PUT the blob.
 *   3. PATCH the Document with the resolved blobKey + blobUrl.
 *
 * Order of operations on `deleteDocument`:
 *   1. Read blobKey off the Document.
 *   2. DETACH DELETE the Document.
 *   3. Best-effort DELETE the blob (idempotent — a missing blob is fine).
 */

export interface UploadDocumentInput {
  driver: Driver
  blobStore: BlobStore
  documentId: string
  fieldContextId: string
  uploaderUserId: string
  filename: string
  mimeType: string
  buffer: Buffer
  /** Pages in the source document. `1` for .txt/.md, real page count for .pdf. */
  pageCount?: number
  /** Optional one-line "What is this?" hint reused on re-extract (GOAL-241). */
  userHint?: string | null
}

export interface UploadedDocument {
  id: string
  filename: string
  mimeType: string
  sizeBytes: number
  pageCount: number | null
  blobKey: string
  blobUrl: string
  userHint: string | null
}

export async function uploadDocument(
  input: UploadDocumentInput
): Promise<UploadedDocument> {
  // Server-side upload path: PUT the blob, then anchor the graph node. Kept
  // for tests and any caller that still streams bytes through this process.
  // The browser-direct-upload flow does not use this — it calls `presignPut`
  // on the BlobStore and then `anchorDocument` after the client has uploaded.
  const blobKey = `documents/${input.documentId}/${input.filename}`
  const ref = await input.blobStore.put({
    key: blobKey,
    contentType: input.mimeType,
    buffer: input.buffer,
  })
  await anchorDocument({
    driver: input.driver,
    documentId: input.documentId,
    fieldContextId: input.fieldContextId,
    uploaderUserId: input.uploaderUserId,
    filename: input.filename,
    mimeType: input.mimeType,
    sizeBytes: input.buffer.length,
    pageCount: input.pageCount ?? null,
    userHint: input.userHint ?? null,
    blobKey: ref.key,
    blobUrl: ref.url,
  })
  return {
    id: input.documentId,
    filename: input.filename,
    mimeType: input.mimeType,
    sizeBytes: input.buffer.length,
    pageCount: input.pageCount ?? null,
    blobKey: ref.key,
    blobUrl: ref.url,
    userHint: input.userHint?.trim() ? input.userHint.trim() : null,
  }
}

export interface AnchorDocumentInput {
  driver: Driver
  documentId: string
  fieldContextId: string
  uploaderUserId: string
  filename: string
  mimeType: string
  sizeBytes: number
  pageCount: number | null
  userHint: string | null
  blobKey: string
  blobUrl: string
  /**
   * Where the bytes came from when the Document was not uploaded by a member
   * but fetched server-side from a link (GOAL-344 bulk article import). Null
   * for uploads. Also the idempotency key that stops the same article being
   * fetched twice into one FieldContext.
   */
  sourceUrl?: string | null
  /**
   * Initial ingest status (GOAL-292). The async upload path anchors PENDING so
   * the cron worker picks the document up. Defaults to COMPLETE for callers
   * that run the pipeline themselves and never enqueue — `uploadDocument`'s
   * server-side path and tests — so those documents are not re-ingested.
   */
  status?: DocumentIngestStatus
}

/**
 * Graph-only anchor for a Document whose bytes already live in blob storage
 * (browser-direct-to-S3 upload). Single CREATE — no follow-up SET, because
 * the blob location is known up front.
 *
 * GOAL-292: the node is born with an ingest `status` (PENDING for the async
 * upload path) so `/api/cron/process-document-ingestion` can find it. The
 * `UPLOADED_BY` edge created here is also what captures the authorization
 * decision — the worker runs under CRON_SECRET with no request context, so
 * this uploader identity is who its entity writes are attributed to.
 *
 * Throws if FieldContext or uploader are missing; the caller surfaces this
 * as a 400/404 to the frontend so the user can retry. The blob is left in
 * place — orphan cleanup is a separate concern handled by S3 lifecycle.
 */
export async function anchorDocument(
  input: AnchorDocumentInput
): Promise<void> {
  const session = input.driver.session()
  try {
    const result = await session.executeWrite(async (tx) =>
      tx.run(
        `
        MATCH (c:FieldContext {id: $fieldContextId})
        MATCH (u:Person:User {id: $uploaderUserId})
        // MERGE, not CREATE: the document id is derived from the server-minted
        // blob key, so a retried /process call must re-anchor the same document
        // rather than create a second one over the same blob (GOAL-292). ON
        // CREATE only, so a retry arriving after the worker has already started
        // cannot reset the status machine or the attempt counter. The
        // document_id uniqueness constraint makes this safe under concurrency.
        // MERGE on :FieldPulse, not :ResourcePulse — pulse_id is the
        // uniqueness constraint that makes this safe under concurrency, and it
        // is declared on :FieldPulse. Merging on the subtype would have no
        // constraint behind it and could mint a duplicate on a retry.
        MERGE (d:FieldPulse {id: $documentId})
        ON CREATE SET
          d:ResourcePulse,
          d.resourceType = $resourceType,
          // The Resource is the focal point for resonance and discussion, so it
          // needs a real title/content from the moment it is anchored — the
          // extractor fills sourceSummary later, and the summarizer may fail.
          // title/content are String! and there is no second chance to
          // populate them before the pulse becomes visible.
          d.title = $filename,
          d.content = coalesce($userHint, $filename),
          d.createdAt = datetime(),
          d.modifiedAt = datetime(),
          d.sourceFilename = $filename,
          d.sourceMimeType = $mimeType,
          d.sourceSizeBytes = toInteger($sizeBytes),
          d.sourcePageCount = $pageCount,
          d.sourceUserHint = $userHint,
          d.sourceBlobKey = $blobKey,
          d.sourceBlobUrl = $blobUrl,
          d.sourceUrl = $sourceUrl,
          // GOAL-356: where the BYTES came from, in a property that means only
          // that. sourceUrl cannot carry it any more — GOAL-355 gave every
          // ResourcePulse a sourceUrl of its own meaning where the MEMBER
          // found the resource, and now that an imported article's file lands
          // on the row's own pulse, both meanings would sit on one node and the
          // import's idempotency key could not tell them apart. Written on this
          // path too, not just the adopt path, so one predicate finds every
          // fetched document.
          d.sourceFetchedFrom = $sourceUrl,
          d.ingestStatus = $status,
          d.ingestStatusMessage = null,
          d.ingestStatusUpdatedAt = datetime(),
          d.ingestAttempts = 0,
          // Retained alongside createdAt as the queue's ordering key, so the
          // drain order survives any later edit to the pulse's createdAt.
          d.uploadedAt = datetime()
        // Guard against adopting an unrelated pulse. The MERGE key is now the
        // shared :FieldPulse id namespace, so a colliding id would MATCH an
        // existing StoryPulse, skip ON CREATE entirely, and then graft document
        // edges onto it — no :ResourcePulse label, no sourceBlobKey, and no
        // error. Impossible while the node was separately typed (:Document).
        // Zero rows here trips the records.length === 0 throw below.
        WITH c, u, d
        WHERE d:ResourcePulse AND ${SOURCE_BACKED_RESOURCE}
        MERGE (c)-[:HAS_PULSE]->(d)
        MERGE (d)-[:UPLOADED_BY]->(u)
        // The uploader is the pulse's displayed author until the extractor
        // credits a byline; resolvePulseAuthor reads initiatedBy[0] then
        // createdBy[0], so without this the resource renders authorless.
        MERGE (d)-[:CREATED_BY]->(u)
        // Activity Log. This was defensible to omit while the node sat outside
        // the pulse activity model as a (:Document), but anchoring now creates
        // a member-visible ResourcePulse in the field's pulse list, and every
        // other pulse-creation path writes one. Delete and re-extract both log;
        // creation was the gap. Guarded on ON CREATE semantics by MERGE-ing the
        // log id, so a retried /process call does not log twice.
        MERGE (log:Log {id: $logId})
        ON CREATE SET
          log.description = 'Added document "' + $filename + '"' +
            CASE WHEN c.title IS NOT NULL AND c.title <> ''
              THEN ' to ' + c.title
              ELSE ''
            END,
          log.createdAt = datetime()
        MERGE (log)-[:CREATED_BY]->(u)
        RETURN d.id AS id
        `,
        {
          fieldContextId: input.fieldContextId,
          uploaderUserId: input.uploaderUserId,
          documentId: input.documentId,
          filename: input.filename,
          mimeType: input.mimeType,
          sizeBytes: input.sizeBytes,
          pageCount: input.pageCount,
          userHint: input.userHint?.trim() ? input.userHint.trim() : null,
          blobKey: input.blobKey,
          blobUrl: input.blobUrl,
          sourceUrl: input.sourceUrl?.trim() || null,
          status: input.status ?? DOCUMENT_INGEST_STATUS.complete,
          resourceType: RESOURCE_TYPE_DOCUMENT,
          // Derived from the document id, not random, so a retry MERGEs the
          // same Log rather than appending a duplicate to the activity feed.
          logId: `log_anchor_${input.documentId}`,
        }
      )
    )
    if (result.records.length === 0) {
      throw new Error(
        `anchorDocument: could not anchor document resource "${input.documentId}" — FieldContext "${input.fieldContextId}" or uploader "${input.uploaderUserId}" not found, or the id collided with an existing non-document pulse.`
      )
    }
  } finally {
    await session.close()
  }
}

/**
 * GOAL-356 — attach a fetched file to a Resource that ALREADY EXISTS, instead
 * of minting a second node beside it.
 *
 * `anchorDocument` above mints the resource and the file together, which is
 * right for an upload: nothing existed before the member picked the file. The
 * bulk article import is the other shape. By the time its worker fetches a
 * row's link, the row's own `:ResourcePulse` is already in the graph — built
 * from the sheet's title / author / date / type, attributed to the real author
 * via INITIATED_BY. Calling `anchorDocument` there minted a SECOND resource for
 * the same artifact: `resourceType: 'document'`, title with the file extension
 * on it, credited to the importer rather than the author. While a document was
 * its own `(:Document)` node that was invisible — one showed in the Pulses
 * list, the other in the Documents list. GOAL-354 made a document a Resource,
 * and the member started seeing the same article twice, each half carrying its
 * own ResonanceSuggestions and ingest ConversationThread.
 *
 * So the file attaches to the resource that is already there. WF-11 is explicit
 * that the fetched document is *enrichment of the row's pulse*, not a peer
 * artifact, and `reconcile-duplicate-document-resources.ts` already produces
 * exactly this end state for the rows imported before this fix — this is the
 * same shape, reached at write time instead of afterwards.
 *
 * What this deliberately does NOT write is the resource's IDENTITY: `title`,
 * `content` and `resourceType` stay as the sheet declared them. That is the
 * whole point — the resource is a `book` / `article` / `event` that happens to
 * have a file behind it, not a `document`. `sourceBlobKey` is what makes it
 * source-backed (see `SOURCE_BACKED_RESOURCE`), so it still lists, downloads,
 * re-extracts and deletes exactly like an upload.
 *
 * `sourceUrl` is coalesced rather than set, because the two writers of that
 * property mean subtly different things and the member's wins: GOAL-355 lets a
 * sheet carry a `source_url` column (where the resource was *found*), while
 * this path would write where the bytes were *fetched from* — which for an
 * imported row is the row's `url`, already on the node as `location`.
 *
 * Refuses a resource that is already source-backed rather than overwriting it:
 * a second blob key would strand the first blob with nothing pointing at it.
 * The caller dedupes before reaching here, so this is a backstop, not a branch —
 * but it is a backstop that has to hold under concurrency, because two import
 * jobs in one field (the per-account in-flight cap is 5) can carry the same row
 * title and therefore adopt the same pulse. Reading `sourceBlobKey` in a WHERE
 * and writing it in a later SET would let both pass the guard and both write:
 * last-writer-wins, the loser's blob stranded, and two ingest pipelines running
 * against one node. So the claim is made by the SET itself —
 * `coalesce(d.sourceBlobKey, $blobKey)` takes the node's write lock and settles
 * the winner atomically, and reading the property back under that lock is what
 * says whether this call won. A retry of the SAME row re-attaches harmlessly:
 * the blob key is derived from the resource id and filename, so it is unchanged
 * and every write below is idempotent.
 */
export interface AttachSourceFileInput {
  driver: Driver
  /** The pulse to attach to — the row's own Resource, created before this. */
  resourceId: string
  /** Anchors the match, so a stale id can never attach a file cross-context. */
  fieldContextId: string
  uploaderUserId: string
  filename: string
  mimeType: string
  sizeBytes: number
  pageCount: number | null
  userHint: string | null
  blobKey: string
  blobUrl: string
  sourceUrl?: string | null
  status?: DocumentIngestStatus
}

export async function attachSourceFileToResource(
  input: AttachSourceFileInput
): Promise<void> {
  const session = input.driver.session()
  try {
    const result = await session.executeWrite(async (tx) =>
      tx.run(
        `
        MATCH (c:FieldContext {id: $fieldContextId})-[:HAS_PULSE]->(d:FieldPulse {id: $resourceId})
        // The subtype assertion is load-bearing twice over: every reader of the
        // source* properties matches :ResourcePulse, and a Goal/Story row must
        // never be grafted into one just because its link was readable. The
        // caller only adopts ResourcePulse rows; this refuses the rest.
        //
        // The resourceType arm is the other half of SOURCE_BACKED_RESOURCE: a
        // legacy document migrated without a blob pointer is source-backed by
        // the project's definition even though sourceBlobKey is null, and
        // guarding on the key alone would let this take over its identity and
        // ingest state. Spelled out rather than using the shared fragment
        // because this needs it NEGATED, and the fragment binds the positive.
        WHERE d:ResourcePulse AND coalesce(d.resourceType, '') <> $resourceType
        MATCH (u:Person:User {id: $uploaderUserId})
        // Claim the resource. This SET is the lock and the decision both — see
        // the header. Nothing else may read sourceBlobKey to decide.
        SET d.sourceBlobKey = coalesce(d.sourceBlobKey, $blobKey)
        WITH c, d, u, d.sourceBlobKey = $blobKey AS won
        WHERE won
        SET d.sourceFilename = $filename,
            d.sourceMimeType = $mimeType,
            d.sourceSizeBytes = toInteger($sizeBytes),
            d.sourcePageCount = $pageCount,
            d.sourceUserHint = $userHint,
            d.sourceBlobUrl = $blobUrl,
            // The fetched link goes in its own property and sourceUrl is left
            // untouched. That separation is the point: on an adopted row
            // sourceUrl is the member's source_url column (where they FOUND
            // the resource, GOAL-355) and this is where we fetched the bytes,
            // which is the row's url — the same value as location. Writing
            // both to one property is what let a row whose source_url matched
            // another row's url read back as an already-fetched document.
            d.sourceFetchedFrom = $sourceUrl,
            d.ingestStatus = $status,
            d.ingestStatusMessage = null,
            d.ingestStatusUpdatedAt = datetime(),
            d.ingestAttempts = 0,
            // The queue orders on this. coalesce is for the retry, not the
            // first pass: create_pulse never writes uploadedAt, so a fresh row
            // takes datetime() here and a re-attach keeps the original.
            d.uploadedAt = coalesce(d.uploadedAt, datetime()),
            // Both halves of the pair: create_pulse and the row-fill statement
            // each write updatedAt on this same node, so setting only
            // modifiedAt would leave the two disagreeing.
            d.updatedAt = datetime(),
            d.modifiedAt = datetime()
        // Who fetched it. INITIATED_BY (the article's real author) is left
        // exactly as the import wrote it — that attribution is the thing the
        // duplicate node was getting wrong, so nothing here may touch it.
        //
        // No CREATED_BY, deliberately, and note this DIFFERS from
        // anchorDocument, which adds one so resolvePulseAuthor has a fallback.
        // An adopted row already has INITIATED_BY to the article's author, so
        // authorship resolves without it, and adding a CREATED_BY to the
        // importer would credit them for someone else's article. UPLOADED_BY is
        // the honest edge: they fetched it, they did not write it. The delete
        // gate in handle-delete-document.ts accepts either edge, so the
        // importer can still remove what they brought in.
        MERGE (d)-[:UPLOADED_BY]->(u)
        // Activity Log, MERGE-d on a derived id so a retried row does not
        // append a second line to the field's activity feed.
        MERGE (log:Log {id: $logId})
        ON CREATE SET
          log.description = 'Attached the source file for "' + coalesce(d.title, $filename) + '"' +
            CASE WHEN c.title IS NOT NULL AND c.title <> ''
              THEN ' in ' + c.title
              ELSE ''
            END,
          log.createdAt = datetime()
        MERGE (log)-[:CREATED_BY]->(u)
        MERGE (log)-[:LOGGED_FOR]->(d)
        RETURN d.id AS id
        `,
        {
          fieldContextId: input.fieldContextId,
          resourceId: input.resourceId,
          uploaderUserId: input.uploaderUserId,
          filename: input.filename,
          mimeType: input.mimeType,
          sizeBytes: input.sizeBytes,
          pageCount: input.pageCount,
          userHint: input.userHint?.trim() ? input.userHint.trim() : null,
          blobKey: input.blobKey,
          blobUrl: input.blobUrl,
          sourceUrl: input.sourceUrl?.trim() || null,
          status: input.status ?? DOCUMENT_INGEST_STATUS.complete,
          resourceType: RESOURCE_TYPE_DOCUMENT,
          logId: `log_attach_${input.resourceId}`,
        }
      )
    )
    if (result.records.length === 0) {
      throw new Error(
        `attachSourceFileToResource: could not attach "${input.filename}" to resource "${input.resourceId}" in context "${input.fieldContextId}" — the resource is missing from that context, is not a :ResourcePulse, is already source-backed (another file, or a concurrent run won the claim), or uploader "${input.uploaderUserId}" was not found.`
      )
    }
  } finally {
    await session.close()
  }
}

export interface DocumentRecord {
  id: string
  filename: string
  mimeType: string
  sizeBytes: number
  pageCount: number | null
  blobKey: string
  blobUrl: string
  userHint: string | null
  /** Link the bytes were fetched from (GOAL-344); null for uploads. */
  sourceUrl: string | null
  fieldContextId: string
  uploaderUserId: string
  /**
   * Ingest lifecycle status (GOAL-292). Documents uploaded before that story
   * carry no `status` property; they read back as COMPLETE so the backlog is
   * never re-ingested.
   */
  status: DocumentIngestStatus
}

/**
 * Loads a Document by id along with the ids needed to re-extract: its parent
 * FieldContext (so the permission gate + roster lookup work) and the original
 * uploader (so the new ingest thread can be anchored back to the right
 * Person:User). Returns `null` if the document doesn't exist — callers
 * surface that as a not-found instead of throwing.
 */
export async function loadDocumentRecord(
  driver: Driver,
  documentId: string,
  /**
   * GOAL-356 — pin the context instead of letting the ORDER BY pick one.
   *
   * The deterministic pick below was adequate while every caller passed an id
   * `anchorDocument` had just minted, which had exactly one HAS_PULSE edge. The
   * bulk article import now points this at a pulse that already existed, and a
   * pulse in several contexts — across Spaces — is a first-class product state
   * (`sharePulseWithContext`). Picking the wrong one would run the whole
   * pipeline against a Space the caller never authorized: the extractor is
   * handed that context's ENTIRE roster (every Person name, pulse title and
   * Organization, up to 100 each, with no caller scoping) and it resurfaces in
   * the ingest thread. Entity writes would still be refused by
   * `executeAuthorizedWriteTool`, but the summary, page count, thread and
   * completion all write regardless.
   *
   * Callers that know which context they authorized MUST pass it; the run fails
   * closed (null) rather than silently choosing when the document is not in it.
   */
  expectedFieldContextId?: string
): Promise<DocumentRecord | null> {
  const session = driver.session()
  try {
    const result = await session.executeRead(async (tx) =>
      tx.run(
        `
        // A :Document had exactly one HAS_DOCUMENT edge, so LIMIT 1 was
        // unambiguous. A ResourcePulse can legitimately sit in several contexts
        // (purge-deleted-field-contexts.ts is built around that case), and the
        // whole pipeline — extraction target, entity writes, discovery sweep —
        // runs against whichever context this returns. An arbitrary pick could
        // land extracted people and pulses in a different Space than the
        // uploader intended, so order deterministically rather than taking
        // whatever the planner yields first.
        MATCH (c:FieldContext)-[:HAS_PULSE]->(d:FieldPulse {id: $documentId})
        WHERE d:ResourcePulse
          AND ($expectedFieldContextId IS NULL OR c.id = $expectedFieldContextId)
        // Collect uploaders rather than OPTIONAL MATCH + LIMIT 1. The cron
        // worker runs AS this user (GOAL-292), so an anomalous document with two
        // UPLOADED_BY edges must not resolve non-deterministically to whichever
        // one the planner happens to return — the caller fails the run instead.
        OPTIONAL MATCH (d)-[:UPLOADED_BY]->(uploader:Person:User)
        WITH c, d, collect(DISTINCT uploader.id) AS uploaderIds
        RETURN
          d.id AS id,
          d.sourceFilename AS filename,
          d.sourceMimeType AS mimeType,
          d.sourceSizeBytes AS sizeBytes,
          d.sourcePageCount AS pageCount,
          d.sourceBlobKey AS blobKey,
          d.sourceBlobUrl AS blobUrl,
          d.sourceUserHint AS userHint,
          // NOTE: no backticks anywhere in this block. The whole query is a
          // template literal, so a backtick in a comment ends the string and
          // the file stops parsing.
          //
          // Prefer the member's found-at link, falling back to the fetched
          // one. This feeds the extractor's location fallback for pulses it
          // pulls out of the article (extraction-model-invoker.ts), and
          // location is a member-facing "where does this live" — so it must be
          // the page a person can actually read, not our copy of the file.
          //
          // The order was the other way round and produced the client-reported
          // bug (2026-09-09): a bulk-import row's url column is typically a
          // OneDrive share of the PDF, that is what gets fetched and therefore
          // what sourceFetchedFrom holds, and preferring it stamped a tokenized
          // share link into location on every extracted pulse — rendered under
          // a map-pin icon as though it were a place.
          //
          // BOTH arms are load-bearing, so do not collapse this to one
          // property. A document anchored before GOAL-356 split the two
          // meanings has only sourceUrl, and for those it still holds the
          // FETCHED link — the fallback is what keeps their behaviour
          // unchanged. An ordinary upload has neither, and the extractor then
          // falls through to the authorized download route.
          //
          // Not the import's idempotency key: findArticleDocument matches on
          // d.sourceFetchedFrom directly, so this ordering cannot re-fetch an
          // article that was already read into the field.
          coalesce(d.sourceUrl, d.sourceFetchedFrom) AS sourceUrl,
          c.id AS fieldContextId,
          uploaderIds,
          coalesce(d.ingestStatus, $completeStatus) AS status
        ORDER BY fieldContextId
        LIMIT 1
        `,
        {
          documentId,
          completeStatus: DOCUMENT_INGEST_STATUS.complete,
          expectedFieldContextId: expectedFieldContextId ?? null,
        }
      )
    )
    const record = result.records[0]
    if (!record) return null
    return {
      id: record.get('id') as string,
      filename: record.get('filename') as string,
      mimeType: record.get('mimeType') as string,
      sizeBytes: Number(record.get('sizeBytes') ?? 0),
      pageCount:
        record.get('pageCount') === null
          ? null
          : Number(record.get('pageCount')),
      blobKey: (record.get('blobKey') as string | null) ?? '',
      blobUrl: (record.get('blobUrl') as string | null) ?? '',
      userHint: (record.get('userHint') as string | null) ?? null,
      sourceUrl: (record.get('sourceUrl') as string | null) ?? null,
      fieldContextId: record.get('fieldContextId') as string,
      // Exactly one uploader, or none. An ambiguous document yields '' so the
      // caller treats it as un-attributable rather than guessing.
      uploaderUserId: (() => {
        const ids = (record.get('uploaderIds') as string[] | null) ?? []
        return ids.length === 1 ? ids[0] : ''
      })(),
      status: record.get('status') as DocumentIngestStatus,
    }
  } finally {
    await session.close()
  }
}

/**
 * Records the page count discovered while preparing extraction inputs.
 *
 * Split out for GOAL-292: page count comes from reading the blob, which now
 * happens in the background worker, while `anchorDocument` runs in the request
 * before any blob has been read. Only paged sources produce a count, so a null
 * simply leaves the property untouched-but-null rather than being an error.
 */
export async function setDocumentPageCount(input: {
  driver: Driver
  documentId: string
  pageCount: number | null
}): Promise<void> {
  if (input.pageCount === null) return
  const session = input.driver.session()
  try {
    await session.executeWrite((tx) =>
      tx.run(
        // toInteger: the driver encodes a plain JS number as a Float64, which
        // would store 3.0 on an int-declared property and render as "3.0".
        `MATCH (d:FieldPulse {id: $documentId}) WHERE d:ResourcePulse
         SET d.sourcePageCount = toInteger($pageCount)`,
        { documentId: input.documentId, pageCount: input.pageCount }
      )
    )
  } finally {
    await session.close()
  }
}

export interface DocumentSummaryInput {
  driver: Driver
  documentId: string
  summary: string | null
  concepts: string[]
}

/**
 * Persists AI-generated summary + concepts on the Document node. Called
 * by the ingest orchestrator after the summarizer model returns. A failed
 * summarizer call is non-fatal — we just skip this write and leave the
 * properties null/empty so the UI degrades gracefully.
 */
export async function setDocumentSummary(
  input: DocumentSummaryInput
): Promise<void> {
  const session = input.driver.session()
  try {
    await session.executeWrite((tx) =>
      tx.run(
        `
        MATCH (d:FieldPulse {id: $documentId})
        WHERE d:ResourcePulse
        SET d.sourceSummary = $summary,
            d.sourceConcepts = $concepts,
            d.modifiedAt = datetime()
        `,
        {
          documentId: input.documentId,
          summary: input.summary?.trim() || null,
          concepts: input.concepts.filter((c) => c?.trim().length > 0),
        }
      )
    )
  } finally {
    await session.close()
  }
}

export interface DeleteDocumentInput {
  driver: Driver
  blobStore: BlobStore
  documentId: string
}

export async function deleteDocument(
  input: DeleteDocumentInput
): Promise<void> {
  const session = input.driver.session()
  let blobKey: string | null = null
  try {
    const lookup = await session.executeRead(async (tx) =>
      tx.run(
        `MATCH (d:FieldPulse {id: $documentId})
         WHERE d:ResourcePulse AND ${SOURCE_BACKED_RESOURCE}
         RETURN d.sourceBlobKey AS blobKey`,
        { documentId: input.documentId, resourceType: RESOURCE_TYPE_DOCUMENT }
      )
    )
    blobKey = (lookup.records[0]?.get('blobKey') as string | null) ?? null

    await session.executeWrite(async (tx) =>
      tx.run(
        // Narrowed to document-backed resources: this helper takes a bare id
        // and applies NO permission gate of its own, so without the predicate
        // it would DETACH DELETE any resource in any Space. The authorized
        // path is handleDeleteDocument.
        `MATCH (d:FieldPulse {id: $documentId})
         WHERE d:ResourcePulse AND ${SOURCE_BACKED_RESOURCE}
         DETACH DELETE d`,
        {
          documentId: input.documentId,
          resourceType: RESOURCE_TYPE_DOCUMENT,
        }
      )
    )
  } finally {
    await session.close()
  }
  if (blobKey) {
    await input.blobStore.delete(blobKey)
  }
}
