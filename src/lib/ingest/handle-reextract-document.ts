import type { Driver } from 'neo4j-driver'
import type { BlobStore } from './blob-store'
import type { ExtractionModelClient } from './extraction-model-invoker'
import type { SynthesizedToolCall } from './synthesized-turn-appender'
import { loadDocumentRecord } from './document-storage'
import {
  extractDocumentText,
  DocumentTextExtractionError,
} from './document-text-extractor'
import { loadFieldContextRoster } from './field-context-roster'
import { extractEntities } from './extraction-model-invoker'
import {
  appendSynthesizedIngestTurns,
  createIngestThread,
} from './handle-ingest-document'

/**
 * Slice 6 — Re-extract an existing Document.
 *
 * Differences from the initial upload path (handleIngestDocument):
 *   - No blob put. No new Document node. The original blob and metadata are
 *     reused so the user gets a fresh extraction attempt against the *current*
 *     FieldContext roster without re-uploading the file.
 *   - The new ConversationThread title is `Ingest: <filename> (re-extracted)`
 *     so the thread switcher disambiguates attempts on the same source.
 *   - One activity Log row is written with the document's human-readable
 *     filename in the description (kb/07 Rule 1 — no raw IDs in user copy).
 *   - The previously-stored `Document.userHint` is reused — the user does
 *     not re-enter it. (Editing the hint is out of scope per PRD § Out of Scope.)
 */

export interface ReExtractDocumentDependencies {
  driver: Driver
  blobStore: BlobStore
  modelClient: ExtractionModelClient
}

export interface ReExtractDocumentInput {
  currentUserId: string
  documentId: string
}

export type ReExtractFailureReason =
  | 'forbidden'
  | 'not_found'
  | 'blob_missing'
  | 'parse_failure'
  | 'unsupported_mime'
  | 'oversize_pages'
  | 'oversize_chars'

export interface ReExtractSuccess {
  ok: true
  documentId: string
  threadId: string
  pendingApprovals: SynthesizedToolCall[]
}
export interface ReExtractFailure {
  ok: false
  error: string
  reason: ReExtractFailureReason
}
export type ReExtractDocumentResult = ReExtractSuccess | ReExtractFailure

async function userCanEditContext(
  driver: Driver,
  userId: string,
  fieldContextId: string
): Promise<boolean> {
  const session = driver.session()
  try {
    const result = await session.executeRead(async (tx) =>
      tx.run(
        `
        MATCH (space:Space)-[:HAS_CONTEXT]->(c:FieldContext {id: $fieldContextId})
        OPTIONAL MATCH (owner:Person {id: $userId})-[:OWNS]->(space)
        OPTIONAL MATCH (space)-[:HAS_MEMBER]->(sm:SpaceMembership)-[:IS_MEMBER]->(member:Person {id: $userId})
        WHERE sm.role IN ['ADMIN', 'MEMBER']
        RETURN (owner IS NOT NULL OR sm IS NOT NULL) AS allowed
        LIMIT 1
        `,
        { userId, fieldContextId }
      )
    )
    return Boolean(result.records[0]?.get('allowed'))
  } finally {
    await session.close()
  }
}

async function getFieldContextTitle(
  driver: Driver,
  fieldContextId: string
): Promise<string> {
  const session = driver.session()
  try {
    const result = await session.executeRead(async (tx) =>
      tx.run(
        `MATCH (c:FieldContext {id: $fieldContextId}) RETURN c.title AS title LIMIT 1`,
        { fieldContextId }
      )
    )
    return (result.records[0]?.get('title') as string | null) ?? ''
  } finally {
    await session.close()
  }
}

async function writeReExtractLog(
  driver: Driver,
  userId: string,
  filename: string,
  documentId: string,
  threadId: string,
  pendingApprovalCount: number,
  outcome: 'success' | 'failure' | 'empty'
): Promise<void> {
  const session = driver.session()
  try {
    const description = `Re-extracted document "${filename}"`
    const metadata = JSON.stringify({
      documentId,
      conversationThreadId: threadId,
      pendingApprovalCount,
      outcome,
    })
    await session.executeWrite(async (tx) =>
      tx.run(
        `
        MATCH (u:Person:User {id: $userId})
        CREATE (log:Log {
          id: 'log_' + randomUUID(),
          description: $description,
          metadata: $metadata,
          createdAt: datetime()
        })
        CREATE (log)-[:CREATED_BY]->(u)
        `,
        { userId, description, metadata }
      )
    )
  } finally {
    await session.close()
  }
}

export async function handleReExtractDocument(
  deps: ReExtractDocumentDependencies,
  input: ReExtractDocumentInput
): Promise<ReExtractDocumentResult> {
  // 1) Look up the Document with its parent FieldContext id (needed for the
  //    permission gate) and original uploader (needed to anchor the new
  //    ingest thread — the re-extracting user owns the new thread, not the
  //    original uploader, but we still need the FieldContext id either way).
  const record = await loadDocumentRecord(deps.driver, input.documentId)
  if (!record) {
    return {
      ok: false,
      reason: 'not_found',
      error: 'Document not found.',
    }
  }

  // 2) Permission gate — same canEditContent check used by uploadDocument.
  const allowed = await userCanEditContext(
    deps.driver,
    input.currentUserId,
    record.fieldContextId
  )
  if (!allowed) {
    return {
      ok: false,
      reason: 'forbidden',
      error: 'You do not have permission to re-extract this document.',
    }
  }

  // 3) Read the original blob. A missing blob is a hard failure — we cannot
  //    silently fall through to extraction. The Document persists; the user
  //    will see the "blob_missing" message and can decide whether to re-upload.
  if (!record.blobKey) {
    return {
      ok: false,
      reason: 'blob_missing',
      error: 'The original file for this document is no longer available.',
    }
  }
  const blob = await deps.blobStore.get(record.blobKey)
  if (!blob) {
    return {
      ok: false,
      reason: 'blob_missing',
      error: 'The original file for this document is no longer available.',
    }
  }

  // 4) Re-run the same DocumentTextExtractor used at upload time. If the
  //    mime type stored on the Document is one we no longer support (e.g. a
  //    legacy upload from a different format set), this short-circuits with
  //    a clear failure rather than feeding garbage to the model.
  let extracted
  try {
    extracted = await extractDocumentText({
      mimeType: record.mimeType,
      buffer: blob.buffer,
      filename: record.filename,
    })
  } catch (err) {
    if (err instanceof DocumentTextExtractionError) {
      return { ok: false, reason: err.kind, error: err.message }
    }
    throw err
  }

  const fieldContextTitle = await getFieldContextTitle(
    deps.driver,
    record.fieldContextId
  )

  const roster = await loadFieldContextRoster({
    driver: deps.driver,
    fieldContextId: record.fieldContextId,
  })

  const extraction = await extractEntities(
    {
      documentText: extracted.text,
      filename: record.filename,
      hint: record.userHint,
      roster,
      fieldContextId: record.fieldContextId,
      fieldContextTitle,
      documentId: record.id,
    },
    deps.modelClient
  )

  // 5) Fresh ConversationThread + synthesized assistant turn. Title makes
  //    the re-extract origin obvious in the thread switcher.
  const threadId = await createIngestThread(
    deps.driver,
    input.currentUserId,
    record.id,
    `Ingest: ${record.filename} (re-extracted)`
  )

  const userTurnContent = record.userHint
    ? `Re-extracted ${record.filename}. Hint: ${record.userHint}`
    : `Re-extracted ${record.filename}`
  const toolCalls = await appendSynthesizedIngestTurns(
    input.currentUserId,
    threadId,
    userTurnContent,
    extraction
  )

  const outcome: 'success' | 'failure' | 'empty' =
    extraction.kind === 'failure'
      ? 'failure'
      : toolCalls.length === 0
        ? 'empty'
        : 'success'
  await writeReExtractLog(
    deps.driver,
    input.currentUserId,
    record.filename,
    record.id,
    threadId,
    toolCalls.length,
    outcome
  )

  return {
    ok: true,
    documentId: record.id,
    threadId,
    pendingApprovals: toolCalls,
  }
}
