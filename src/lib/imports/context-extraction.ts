/**
 * Context-scoped extraction event for document ingest.
 *
 * Robert's framing on the May follow-up call: the active conversation
 * thread is the container, not the document. When a user ingests a doc
 * in-thread, we want a clean audit trail:
 *
 *   (:ConversationThread)-[:HAS_EXTRACTION]->(:ContextExtraction)
 *   (:ContextExtraction)-[:PRODUCED]->(:FieldPulse)
 *
 * `ContextExtraction` is event-style — write-once, never edited (matches
 * the `Log` append-only pattern). Re-running ingest from a different thread
 * against the same source creates a new event without touching the
 * previous one.
 *
 * Authorization: we only write the event after the caller-side import has
 * already created pulses inside an authorised Space (csv-import-service.ts
 * enforces `canEditContent` per row). The thread ownership predicate
 * (`Person:User -[:HAS_THREAD]-> ConversationThread`) prevents a caller
 * from attaching an extraction to someone else's thread.
 */

import type { Session } from 'neo4j-driver'
import { randomUUID } from 'node:crypto'

export interface RecordContextExtractionInput {
  /** The authenticated user driving the ingest. */
  userId: string
  /** The active ConversationThread id from the chat surface. */
  conversationThreadId: string
  /** Pulses produced by this run (FieldPulse ids). */
  pulseIds: string[]
  /** Human-readable source name (filename, URL, etc.) for activity log. */
  sourceLabel: string
  /** Tag the extraction with where it came from (`xlsx`, `csv`, `pdf`, …). */
  extractorKind: 'xlsx' | 'csv' | 'pdf' | 'url' | 'text'
  /** Increments when the extraction algorithm changes — useful for re-runs. */
  extractorVersion?: string
  /**
   * When the ingest persists the source as a StoryPulse (the document-
   * ingest path), pass its id here so we can write the
   * `(:ContextExtraction)-[:EXTRACTED_FROM]->(:StoryPulse)` edge. Legacy
   * spreadsheet imports skip this — there's no single source artefact to
   * point at.
   */
  sourceStoryPulseId?: string
}

export interface RecordContextExtractionResult {
  extractionId: string
  pulseCount: number
}

/**
 * Verify that the conversation thread belongs to the caller. Returns the
 * thread id on success; throws if the user has no `HAS_THREAD` edge to it.
 *
 * Mirrors the canonical pattern in `kb/02-user-roles.md` (a thread is a
 * single-owner resource; no membership / role layer).
 */
export async function assertOwnsThread(
  session: Session,
  userId: string,
  conversationThreadId: string
): Promise<void> {
  const result = await session.run(
    `
    MATCH (u:Person:User {id: $userId})-[:HAS_THREAD]->(t:ConversationThread {id: $conversationThreadId})
    RETURN t.id AS id LIMIT 1
    `,
    { userId, conversationThreadId }
  )
  if (result.records.length === 0) {
    throw new Error(
      'Conversation thread not found or you do not own it. Ingest must run inside a thread you started.'
    )
  }
}

/**
 * Write the `ContextExtraction` event and stitch up its relationships.
 *
 * Safe to call from a normal Cypher session — the writes are batched into
 * one query so a single Neo4j round-trip captures the entire event. If the
 * caller passes an empty `pulseIds` array we still create the event so the
 * thread shows "an extraction ran here" — keeps the audit trail honest.
 */
export async function recordContextExtraction(
  session: Session,
  input: RecordContextExtractionInput
): Promise<RecordContextExtractionResult> {
  const extractionId = `extraction_${Date.now()}_${randomUUID().slice(0, 8)}`
  const now = new Date().toISOString()

  await session.run(
    `
    MATCH (t:ConversationThread {id: $conversationThreadId})
    CREATE (ext:ContextExtraction {
      id: $extractionId,
      createdAt: $createdAt,
      pulseCount: $pulseCount,
      sourceLabel: $sourceLabel,
      extractorKind: $extractorKind,
      extractorVersion: $extractorVersion
    })
    CREATE (t)-[:HAS_EXTRACTION]->(ext)
    WITH ext
    // Optional source StoryPulse — when the ingest persisted the file as a
    // StoryPulse, tie the extraction to it. Uses MATCH (not MERGE) so a
    // bad id never silently creates an orphan StoryPulse.
    CALL {
      WITH ext
      UNWIND CASE WHEN $sourceStoryPulseId IS NULL THEN [] ELSE [$sourceStoryPulseId] END AS sourceId
      MATCH (sp:StoryPulse {id: sourceId})
      MERGE (ext)-[:EXTRACTED_FROM]->(sp)
      RETURN count(*) AS _linkedSource
    }
    WITH ext, $pulseIds AS pulseIds
    UNWIND pulseIds AS pulseId
    OPTIONAL MATCH (p:FieldPulse {id: pulseId})
    WITH ext, p
    WHERE p IS NOT NULL
    MERGE (ext)-[:PRODUCED]->(p)
    `,
    {
      conversationThreadId: input.conversationThreadId,
      extractionId,
      createdAt: now,
      pulseCount: input.pulseIds.length,
      sourceLabel: input.sourceLabel,
      extractorKind: input.extractorKind,
      extractorVersion: input.extractorVersion ?? 'v1',
      pulseIds: input.pulseIds,
      sourceStoryPulseId: input.sourceStoryPulseId ?? null,
    }
  )

  return { extractionId, pulseCount: input.pulseIds.length }
}
