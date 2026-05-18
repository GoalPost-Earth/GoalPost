import { randomUUID } from 'node:crypto'
import type { Driver } from 'neo4j-driver'
import type { BlobStore } from './blob-store'
import { uploadDocument } from './document-storage'
import {
  extractDocumentText,
  DocumentTextExtractionError,
} from './document-text-extractor'
import { loadFieldContextRoster } from './field-context-roster'
import {
  extractEntities,
  type ExtractionModelClient,
  type ExtractionResult,
} from './extraction-model-invoker'
import type { SynthesizedToolCall } from './synthesized-turn-appender'
import { buildSynthesizedAssistantTurnParts } from './synthesized-turn-appender'
import { appendConversationTurn } from '@/lib/simulation/conversation-thread.service'

/**
 * Creates a fresh ConversationThread for this ingest run. Intentionally does
 * NOT set the `ownerId` property — the UNIQUE constraint on
 * ConversationThread.ownerId is held by the user's implicit chat thread, and
 * ingest threads must coexist alongside it. `appendConversationTurn(...,
 * threadId)` matches by id, not ownerId, so this is safe.
 *
 * Slice 5 (GOAL-240) — write-time invariant: every ingest thread is born with
 * `kind = 'ingest'` and `mode = 'default'`. Aiden / Braider are non-action
 * modes, so they cannot drive the tool calls the synthesized turn already
 * pre-staged. Forcing `default` at creation guarantees subsequent replies in
 * the thread route through the standard tool-execution path regardless of
 * the user's prior global mode. Also stamps `lastViewedThreadId` so a hard
 * refresh restores the user to the ingest thread the upload just opened.
 */
/**
 * Creates the ingest thread and stamps a HAS_INGEST_THREAD edge from the
 * source Document so slice 6's Document detail view can list every thread
 * the document has been processed in. Both the original upload and every
 * subsequent re-extract land here.
 */
export async function createIngestThread(
  driver: Driver,
  userId: string,
  documentId: string,
  title: string
): Promise<string> {
  const threadId = `thread_${randomUUID()}`
  const session = driver.session()
  try {
    await session.executeWrite(async (tx) =>
      tx.run(
        `
        MATCH (p:Person:User {id: $userId})
        MATCH (d:Document {id: $documentId})
        CREATE (p)-[:HAS_THREAD]->(t:ConversationThread {
          id: $threadId,
          createdAt: datetime(),
          lastTurnAt: datetime(),
          turnCount: 0,
          title: $title,
          mode: 'default',
          kind: 'ingest'
        })
        CREATE (d)-[:HAS_INGEST_THREAD]->(t)
        SET p.lastViewedThreadId = $threadId
        `,
        { userId, documentId, threadId, title }
      )
    )
  } finally {
    await session.close()
  }
  return threadId
}

/**
 * Writes both turns of the synthesized assistant trace into a thread the
 * caller has already created. Shared between the initial upload path and the
 * re-extract path so the turn shape (user "Uploaded X" / "Re-extracted X" +
 * synthesized assistant parts) stays identical across both surfaces.
 *
 * Slice 7 (GOAL-242): each tool call's args are enriched with
 * `conversationThreadId` BEFORE the synthesized parts are built so the
 * approval-hash already reflects the thread context. The per-entity Log row
 * written on approval can then stamp `metadata.conversationThreadId` without
 * a separate lookup — closing the audit loop end-to-end.
 */
export async function appendSynthesizedIngestTurns(
  userId: string,
  threadId: string,
  userTurnContent: string,
  extraction: ExtractionResult
): Promise<SynthesizedToolCall[]> {
  await appendConversationTurn(
    userId,
    {
      role: 'user',
      content: userTurnContent,
      parts: [{ type: 'text', text: userTurnContent }],
    },
    threadId
  )

  const assistantText = extraction.assistantText
  const toolCalls =
    extraction.kind === 'ok'
      ? extraction.toolCalls.map((call) => ({
          ...call,
          args: { ...call.args, conversationThreadId: threadId },
        }))
      : ([] as SynthesizedToolCall[])
  const parts = buildSynthesizedAssistantTurnParts({
    toolCalls,
    assistantText,
  })
  await appendConversationTurn(
    userId,
    { role: 'assistant', content: assistantText, parts },
    threadId
  )
  return toolCalls
}

export interface IngestDocumentDependencies {
  driver: Driver
  blobStore: BlobStore
  modelClient: ExtractionModelClient
}

export interface IngestDocumentInput {
  currentUserId: string
  fieldContextId: string
  filename: string
  mimeType: string
  buffer: Buffer
  hint: string | null
}

export type IngestFailureReason =
  | 'forbidden'
  | 'unsupported_mime'
  | 'oversize_pages'
  | 'oversize_chars'
  | 'parse_failure'

export interface IngestSuccess {
  ok: true
  documentId: string
  threadId: string
  pendingApprovals: SynthesizedToolCall[]
}
export interface IngestFailure {
  ok: false
  error: string
  reason: IngestFailureReason
}
export type IngestDocumentResult = IngestSuccess | IngestFailure

/**
 * Permission gate: caller must hold canEditContent on the FieldContext's
 * parent Space (MeSpace owner OR WeSpace admin/member).
 */
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
): Promise<string | null> {
  const session = driver.session()
  try {
    const result = await session.executeRead(async (tx) =>
      tx.run(
        `MATCH (c:FieldContext {id: $fieldContextId}) RETURN c.title AS title LIMIT 1`,
        { fieldContextId }
      )
    )
    return (result.records[0]?.get('title') as string | null) ?? null
  } finally {
    await session.close()
  }
}

export async function handleIngestDocument(
  deps: IngestDocumentDependencies,
  input: IngestDocumentInput
): Promise<IngestDocumentResult> {
  // Permission gate FIRST so a bad caller never causes a blob put.
  const allowed = await userCanEditContext(
    deps.driver,
    input.currentUserId,
    input.fieldContextId
  )
  if (!allowed) {
    return {
      ok: false,
      reason: 'forbidden',
      error: 'You do not have permission to add documents to this field context.',
    }
  }

  // 1) Extract text FIRST so a bad mime / oversize doc never causes a blob
  // put or a Document node creation. Per slice-3 AC: "No `Document` node
  // persists" on rejection.
  let extracted
  try {
    extracted = await extractDocumentText({
      mimeType: input.mimeType,
      buffer: input.buffer,
      filename: input.filename,
    })
  } catch (err) {
    if (err instanceof DocumentTextExtractionError) {
      return { ok: false, reason: err.kind, error: err.message }
    }
    throw err
  }

  const fieldContextTitle =
    (await getFieldContextTitle(deps.driver, input.fieldContextId)) ?? ''

  // 2) DocumentStorage — graph anchor + blob (only AFTER extraction succeeds)
  const documentId = `document_${randomUUID()}`
  await uploadDocument({
    driver: deps.driver,
    blobStore: deps.blobStore,
    documentId,
    fieldContextId: input.fieldContextId,
    uploaderUserId: input.currentUserId,
    filename: input.filename,
    mimeType: input.mimeType,
    buffer: input.buffer,
    pageCount: extracted.pageCount,
    userHint: input.hint,
  })

  // 3) Load the FieldContext roster so the extractor can emit update_*
  //    for matches against existing persons/pulses (GOAL-239).
  const roster = await loadFieldContextRoster({
    driver: deps.driver,
    fieldContextId: input.fieldContextId,
  })

  // 4) Invoke extraction model
  const extraction = await extractEntities(
    {
      documentText: extracted.text,
      filename: input.filename,
      hint: input.hint,
      roster,
      fieldContextId: input.fieldContextId,
      fieldContextTitle,
      documentId,
    },
    deps.modelClient
  )

  // 5) Fresh ConversationThread + synthesized assistant turn
  const threadId = await createIngestThread(
    deps.driver,
    input.currentUserId,
    documentId,
    `Ingest: ${input.filename}`
  )

  const userTurnContent = input.hint
    ? `Uploaded ${input.filename}. Hint: ${input.hint}`
    : `Uploaded ${input.filename}`
  const toolCalls = await appendSynthesizedIngestTurns(
    input.currentUserId,
    threadId,
    userTurnContent,
    extraction
  )

  return {
    ok: true,
    documentId,
    threadId,
    pendingApprovals: toolCalls,
  }
}
