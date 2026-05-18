import { randomUUID } from 'node:crypto'
import type { Driver } from 'neo4j-driver'
import type { BlobStore } from './blob-store'
import { uploadDocument } from './document-storage'
import { extractDocumentText } from './document-text-extractor'
import { loadFieldContextRoster } from './field-context-roster'
import {
  extractEntities,
  type ExtractionModelClient,
} from './extraction-model-invoker'
import { buildSynthesizedAssistantTurnParts } from './synthesized-turn-appender'
import type { SynthesizedToolCall } from './synthesized-turn-appender'
import { appendConversationTurn } from '@/lib/simulation/conversation-thread.service'

/**
 * Creates a fresh ConversationThread for this ingest run. Intentionally does
 * NOT set the `ownerId` property — the UNIQUE constraint on
 * ConversationThread.ownerId is held by the user's implicit chat thread, and
 * ingest threads must coexist alongside it. `appendConversationTurn(...,
 * threadId)` matches by id, not ownerId, so this is safe.
 */
async function createIngestThread(
  driver: Driver,
  userId: string,
  title: string
): Promise<string> {
  const threadId = `thread_${randomUUID()}`
  const session = driver.session()
  try {
    await session.executeWrite(async (tx) =>
      tx.run(
        `
        MATCH (p:Person:User {id: $userId})
        CREATE (p)-[:HAS_THREAD]->(t:ConversationThread {
          id: $threadId,
          createdAt: datetime(),
          lastTurnAt: datetime(),
          turnCount: 0,
          title: $title
        })
        `,
        { userId, threadId, title }
      )
    )
  } finally {
    await session.close()
  }
  return threadId
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

export interface IngestSuccess {
  ok: true
  documentId: string
  threadId: string
  pendingApprovals: SynthesizedToolCall[]
}
export interface IngestFailure {
  ok: false
  error: string
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
      error: 'You do not have permission to add documents to this field context.',
    }
  }

  const fieldContextTitle =
    (await getFieldContextTitle(deps.driver, input.fieldContextId)) ?? ''

  // 1) DocumentStorage — graph anchor + blob
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
  })

  // 2) Extract plain text
  const extracted = await extractDocumentText({
    mimeType: input.mimeType,
    buffer: input.buffer,
    filename: input.filename,
  })

  // 3) Load (empty for v1) roster
  const roster = await loadFieldContextRoster({
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
    `Ingest: ${input.filename}`
  )

  // User turn: short upload summary using human-readable filename only.
  const userTurnContent = input.hint
    ? `Uploaded ${input.filename}. Hint: ${input.hint}`
    : `Uploaded ${input.filename}`
  await appendConversationTurn(
    input.currentUserId,
    { role: 'user', content: userTurnContent, parts: [{ type: 'text', text: userTurnContent }] },
    threadId
  )

  // Assistant turn: synthesized parts mirror what live runtime would produce.
  const assistantText = extraction.assistantText
  const toolCalls =
    extraction.kind === 'ok' ? extraction.toolCalls : ([] as SynthesizedToolCall[])
  const parts = buildSynthesizedAssistantTurnParts({
    toolCalls,
    assistantText,
  })
  await appendConversationTurn(
    input.currentUserId,
    { role: 'assistant', content: assistantText, parts },
    threadId
  )

  return {
    ok: true,
    documentId,
    threadId,
    pendingApprovals: toolCalls,
  }
}
