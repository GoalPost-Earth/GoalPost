import { randomUUID } from 'node:crypto'
import type { Driver } from 'neo4j-driver'
import type { BlobStore } from './blob-store'
import { anchorDocument, setDocumentSummary } from './document-storage'
import { prepareExtractionInputs } from './extraction-input-preparer'
import { loadFieldContextRoster } from './field-context-roster'
import {
  extractEntities,
  type ExtractionModelClient,
  type ExtractionResult,
} from './extraction-model-invoker'
import {
  summarizeDocument,
  type DocumentSummarizerClient,
} from './document-summarizer'
import type {
  ExecutedToolCallRecord,
  ExecutedToolResult,
  SynthesizedToolCall,
} from './synthesized-turn-appender'
import { buildExecutedAssistantTurnParts } from './synthesized-turn-appender'
import { appendConversationTurn } from '@/lib/simulation/conversation-thread.service'
import { executeAuthorizedWriteTool } from '@/lib/chat/hitl'
import { initGraph } from '@/modules/graph'

/**
 * Creates a fresh ConversationThread for this ingest run, plus a
 * HAS_INGEST_THREAD edge from the source Document so slice 6's Document
 * detail view can list every thread the document has been processed in.
 * Both the original upload and every subsequent re-extract land here.
 *
 * Slice 5 (GOAL-240) — write-time invariant: every ingest thread is born with
 * `kind = 'ingest'` and `mode = 'default'`. Aiden / Braider are non-action
 * modes, so they cannot drive the tool calls the synthesized turn already
 * pre-staged. Forcing `default` at creation guarantees subsequent replies in
 * the thread route through the standard tool-execution path regardless of
 * the user's prior global mode. Also stamps `lastViewedThreadId` so a hard
 * refresh restores the user to the ingest thread the upload just opened.
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
 * Auto-executes the proposed tool calls server-side and writes both turns
 * of the synthesized assistant trace into a thread the caller has already
 * created. Shared between the initial upload path and the re-extract path
 * so the turn shape (user "Uploaded X" / "Re-extracted X" + executed
 * assistant parts) stays identical across both surfaces.
 *
 * Auto-approve rationale (see PRD § revised flow): doc ingestion historically
 * pre-staged HITL tool calls and waited for the user to click Approve. That
 * left "I uploaded a document but no pulses appeared" as the most common
 * failure mode — the work was done but invisible. The upload itself already
 * gates on `canEditContent`, so re-asking for approval was a UX wall, not a
 * second security layer. Auto-execute closes the loop while keeping the
 * audit trail (one `:Log` per created entity, written inline by the same
 * `executeAuthorizedWriteTool` path manual creation uses).
 *
 * Each tool call's args are still enriched with `conversationThreadId` so
 * the Log row's metadata can carry both `documentId` and the originating
 * thread — closing the audit loop end-to-end.
 */
export async function appendSynthesizedIngestTurns(
  userId: string,
  threadId: string,
  userTurnContent: string,
  extraction: ExtractionResult
): Promise<ExecutedToolCallRecord[]> {
  await appendConversationTurn(
    userId,
    {
      role: 'user',
      content: userTurnContent,
      parts: [{ type: 'text', text: userTurnContent }],
    },
    threadId
  )

  const toolCalls: SynthesizedToolCall[] =
    extraction.kind === 'ok'
      ? extraction.toolCalls.map((call) => ({
          ...call,
          args: { ...call.args, conversationThreadId: threadId },
        }))
      : []

  // Execute each proposed tool call against the live graph. A failure on
  // one entity does not abort the rest — partial success is recorded in
  // the assistant turn so the user can see which entities landed and
  // which need manual follow-up.
  //
  // Attribution wiring: roster-matched authors already ride in with their
  // live id stamped by the invoker (they may get no person call this run).
  // For persons minted or enriched THIS run, the invoker orders person calls
  // before pulse calls, and the name→id map below closes the loop from their
  // executed results. A failed person call (with no roster id to fall back
  // on) simply leaves the pulse attributed to the uploader.
  const executed: ExecutedToolCallRecord[] = []
  const personIdByName = new Map<string, string>()
  if (toolCalls.length > 0) {
    const graph = await initGraph()
    for (const call of toolCalls) {
      let args = call.args
      if (call.tool === 'create_pulse') {
        const attributedToName =
          typeof args.attributedToName === 'string'
            ? args.attributedToName.trim().toLowerCase()
            : ''
        const attributedToPersonId = attributedToName
          ? personIdByName.get(attributedToName)
          : undefined
        if (attributedToPersonId) {
          args = { ...args, attributedToPersonId }
        }
      }
      let result: ExecutedToolResult
      try {
        result = (await executeAuthorizedWriteTool(
          graph,
          userId,
          call.tool,
          args
        )) as ExecutedToolResult
      } catch (err) {
        result = {
          success: false,
          message:
            err instanceof Error
              ? err.message
              : 'Tool execution failed unexpectedly.',
        }
      }
      if (
        (call.tool === 'create_person' || call.tool === 'update_person') &&
        result.success !== false &&
        typeof result.personId === 'string' &&
        result.personId
      ) {
        // Key by both the graph's canonical name and the extractor's
        // firstName+lastName — the two can differ (e.g. enrich returns the
        // existing node's richer name) and attribution must match either.
        const keys = [
          typeof result.name === 'string' ? result.name : '',
          `${String(args.firstName ?? '')} ${String(args.lastName ?? '')}`,
        ]
        for (const key of keys) {
          const normalized = key.trim().toLowerCase()
          if (normalized) personIdByName.set(normalized, result.personId)
        }
      }
      executed.push({ tool: call.tool, args, result })
    }
  }

  const succeededCalls = executed.filter((e) => e.result.success !== false)
  const failed = executed.length - succeededCalls.length
  // The extractor emits a free-text reply explaining what it proposed.
  // Prepend a one-line execution summary so the thread reads as a record
  // of what happened, not a record of what was proposed. Count creates and
  // updates separately — a roster match that only updated an existing
  // person must not be announced as "created", or the user goes hunting
  // the graph for a new node that was never minted.
  const createdCount = succeededCalls.filter(
    (e) => !e.tool.startsWith('update_')
  ).length
  const updatedCount = succeededCalls.length - createdCount
  const outcome = [
    createdCount > 0
      ? `created ${createdCount} ${createdCount === 1 ? 'entity' : 'entities'}`
      : '',
    updatedCount > 0
      ? `updated ${updatedCount} existing ${updatedCount === 1 ? 'entry' : 'entries'}`
      : '',
  ]
    .filter(Boolean)
    .join(' and ')
  const capitalizedOutcome = outcome.charAt(0).toUpperCase() + outcome.slice(1)
  const summaryLine =
    executed.length === 0
      ? ''
      : failed === 0
        ? `${capitalizedOutcome} from this document.`
        : outcome
          ? `${capitalizedOutcome} from this document; ${failed} of ${executed.length} proposed didn't land — see details above.`
          : `None of the ${executed.length} proposed entities landed — see details above.`
  // Attribution is reported from EXECUTED results, never from the proposal —
  // a pulse only counts as attributed when the write actually linked it to
  // the person (names only in chat copy, per kb/07 Rule 1).
  const pulsesByAuthor = new Map<string, string[]>()
  for (const e of executed) {
    if (e.tool !== 'create_pulse' || e.result.success === false) continue
    const author =
      typeof e.result.attributedTo === 'string' ? e.result.attributedTo.trim() : ''
    const title = typeof e.result.title === 'string' ? e.result.title.trim() : ''
    if (!author || !title) continue
    pulsesByAuthor.set(author, [...(pulsesByAuthor.get(author) ?? []), title])
  }
  const attributionLine = Array.from(pulsesByAuthor.entries())
    .map(
      ([author, titles]) =>
        `${titles.map((t) => `"${t}"`).join(', ')} ${titles.length === 1 ? 'is' : 'are'} attributed to ${author}, so their contributions stay connected to them in the graph.`
    )
    .join(' ')
  const assistantText = [
    [summaryLine, attributionLine].filter((s) => s.length > 0).join(' '),
    extraction.assistantText,
  ]
    .filter((s) => s.length > 0)
    .join('\n\n')

  const parts = buildExecutedAssistantTurnParts({
    toolCalls: executed,
    assistantText,
  })
  await appendConversationTurn(
    userId,
    { role: 'assistant', content: assistantText, parts },
    threadId
  )
  return executed
}

export interface IngestDocumentDependencies {
  driver: Driver
  blobStore: BlobStore
  /**
   * Multimodal extractor (Gemini) used for the `multimodal` route — PDFs and
   * images. Reads the file by presigned URL.
   */
  pdfExtractionClient: ExtractionModelClient
  /**
   * Text extractor (OpenAI) used for the `text` and `office` routes. Reads the
   * document body that was decoded (text) or extracted in-process (office).
   */
  textExtractionClient: ExtractionModelClient
  /**
   * Optional summarizers — one per modality. Failure is non-fatal.
   * Tests can omit both to keep the entity-extraction surface in isolation.
   */
  pdfSummarizerClient?: DocumentSummarizerClient | null
  textSummarizerClient?: DocumentSummarizerClient | null
}

export interface IngestDocumentInput {
  currentUserId: string
  fieldContextId: string
  filename: string
  mimeType: string
  /**
   * Key of the file the browser has already uploaded to S3 via a presigned
   * PUT URL. The orchestrator never holds the bytes.
   */
  blobKey: string
  /** Client-reported size (used to populate Document.sizeBytes). */
  sizeBytes: number
  hint: string | null
}

export type IngestFailureReason =
  | 'forbidden'
  | 'unsupported_mime'
  | 'oversize_pages'
  | 'oversize_chars'
  | 'parse_failure'
  | 'blob_missing'

export interface IngestSuccess {
  ok: true
  documentId: string
  threadId: string
  /**
   * The tool calls the extractor proposed and the orchestrator auto-
   * executed. `result.success === true` means the entity landed in the
   * graph; `false` means execution failed (permission, validation, etc.).
   */
  executedToolCalls: ExecutedToolCallRecord[]
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
  // Permission gate FIRST so a bad caller never causes graph writes.
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

  const fieldContextTitle =
    (await getFieldContextTitle(deps.driver, input.fieldContextId)) ?? ''

  // The browser has already uploaded the file to S3. Prepare extractor +
  // summarizer inputs by route (multimodal / office / text) — shared with the
  // re-extract path so the routing can never drift. See
  // extraction-input-preparer.ts.
  const prepared = await prepareExtractionInputs(deps, {
    mimeType: input.mimeType,
    blobKey: input.blobKey,
    filename: input.filename,
  })
  if (!prepared.ok) {
    return { ok: false, reason: prepared.reason, error: prepared.error }
  }
  const {
    extractionModelInputExtras,
    summarizerExtras,
    modelClient,
    summarizerClient,
    pageCount,
  } = prepared

  // Anchor the Document node in the graph. The blob already lives at
  // input.blobKey; we record both the key and a stable identifier URL.
  const documentId = `document_${randomUUID()}`
  await anchorDocument({
    driver: deps.driver,
    documentId,
    fieldContextId: input.fieldContextId,
    uploaderUserId: input.currentUserId,
    filename: input.filename,
    mimeType: input.mimeType,
    sizeBytes: input.sizeBytes,
    pageCount,
    userHint: input.hint,
    blobKey: input.blobKey,
    // The canonical blob locator is the key — presigned URLs are minted on
    // demand and never persisted.
    blobUrl: input.blobKey,
  })

  // Load roster + run extraction and summarizer concurrently.
  const roster = await loadFieldContextRoster({
    driver: deps.driver,
    fieldContextId: input.fieldContextId,
  })

  const [extraction, summary] = await Promise.all([
    extractEntities(
      {
        ...extractionModelInputExtras,
        filename: input.filename,
        hint: input.hint,
        roster,
        fieldContextId: input.fieldContextId,
        fieldContextTitle,
        documentId,
      },
      modelClient
    ),
    summarizeDocument(summarizerClient, {
      ...summarizerExtras,
      filename: input.filename,
      hint: input.hint,
      fieldContextTitle,
    }),
  ])

  await setDocumentSummary({
    driver: deps.driver,
    documentId,
    summary: summary.summary,
    concepts: summary.concepts,
  })

  const threadId = await createIngestThread(
    deps.driver,
    input.currentUserId,
    documentId,
    `Ingest: ${input.filename}`
  )

  const userTurnContent = input.hint
    ? `Uploaded ${input.filename}. Hint: ${input.hint}`
    : `Uploaded ${input.filename}`
  const executedToolCalls = await appendSynthesizedIngestTurns(
    input.currentUserId,
    threadId,
    userTurnContent,
    extraction
  )

  return {
    ok: true,
    documentId,
    threadId,
    executedToolCalls,
  }
}
