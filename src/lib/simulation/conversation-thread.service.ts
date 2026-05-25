import { randomUUID } from 'node:crypto'
import { driver } from '@/lib/neo4j/driver'

/**
 * Server-side persistence for the AI assistant's conversation thread.
 *
 * Each authenticated user has a single rolling `ConversationThread` (the
 * most recent one is treated as "active"). Every user turn and every
 * assistant turn is appended as a `ConversationTurn` linked to the thread,
 * ordered by `order` for deterministic replay.
 *
 * Schema:
 *
 *   (:Person:User {id})-[:HAS_THREAD]->(:ConversationThread {
 *      id, createdAt, lastTurnAt
 *   })-[:HAS_TURN]->(:ConversationTurn {
 *      id, role, content, parts, order, createdAt
 *   })
 *
 *   - `parts` is a JSON-serialised array of AI-SDK `UIMessagePart` objects
 *     (text, tool-call, tool-result, ...). Storing the serialised tree lets
 *     us round-trip tool calls + their results so the chat can be replayed
 *     verbatim on hydration.
 *   - `order` is monotonically increasing within a thread; new turns use
 *     `coalesce(max(existing.order), -1) + 1`.
 *
 * Activity logging: chat turns are intentionally NOT mirrored into the Log
 * stream. The thread itself is the audit trail (every turn is timestamped,
 * ordered, and attributed via the user→thread relationship), and logging
 * every assistant message would swamp the activity feed. This mirrors the
 * existing exemption for `ConversationChunk` writes from
 * `pulse/create-from-conversation`.
 *
 * Authorization: every read/write requires a `userId` argument. The Cypher
 * always anchors via `(p:Person:User {id: $userId})` so a missing or
 * spoofed id can't read or write someone else's thread.
 */

export type ConversationTurnRole = 'user' | 'assistant' | 'system'

export interface ConversationTurnInput {
  role: ConversationTurnRole
  content: string
  /** Serialised AI-SDK UIMessagePart[]. Stored as a JSON string. */
  parts?: unknown
}

export interface ConversationTurnRecord {
  id: string
  role: ConversationTurnRole
  content: string
  /** Parsed UIMessagePart[]. `null` when the row had no parts payload. */
  parts: unknown[] | null
  order: number
  createdAt: string
}

export interface ConversationThreadRecord {
  id: string
  createdAt: string
  lastTurnAt: string | null
  /** Stored AssistantMode. `'default' | 'aiden' | 'braider'`. `'default'` if unset. */
  mode: string
  /** `'ingest'` for doc-ingestion threads; `'reflective'` for the user's normal chat. */
  kind: string
  /** Human-readable title (e.g. "Ingest: meeting-notes.pdf"). Null when unset. */
  title: string | null
  turns: ConversationTurnRecord[]
}

const MAX_REPLAY_TURNS = 200

function parseStoredParts(value: unknown): unknown[] | null {
  if (typeof value !== 'string' || value.length === 0) return null
  try {
    const parsed = JSON.parse(value) as unknown
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

/**
 * Append a single turn to the user's active thread, creating the thread if
 * it doesn't yet exist. Returns the new turn id and the parent thread id.
 *
 * Race-safety:
 *   1. The implicit (no-threadId) fallback MERGEs on a deterministic id
 *      (`thread_default_<userId>`) and relies on the UNIQUE constraint on
 *      `ConversationThread.id` for first-write atomicity. Two concurrent
 *      first-writes can't both CREATE — one wins, the loser retries and
 *      falls into the MATCH branch. The previous design MERGEd on
 *      `ownerId` and required a separate UNIQUE constraint on that
 *      property, which blocked every subsequent thread (sidebar "+",
 *      ingest threads) from being created.
 *   2. We `SET t.turnCount = coalesce(t.turnCount, 0) + 1` BEFORE the
 *      OPTIONAL MATCH for next-order. The SET row-locks `t` for the rest
 *      of the transaction, serialising concurrent appends. `nextOrder`
 *      then derives from the incremented counter rather than a separate
 *      `max(order)` read, which avoids two writers picking the same
 *      ordinal under contention.
 */
export function defaultConversationThreadId(userId: string): string {
  return `thread_default_${userId}`
}

export async function appendConversationTurn(
  userId: string,
  turn: ConversationTurnInput,
  threadId?: string,
  /**
   * Optional pre-generated turn id. The chat route generates the
   * assistant-turn id upfront so it can stream the same id back to the
   * client (via `messageMetadata`) — letting the client attach feedback
   * to the row this function will write a few milliseconds later. Pass
   * undefined to keep the legacy behavior (randomly generated id).
   */
  presetTurnId?: string
): Promise<{ threadId: string; turnId: string; order: number }> {
  if (!userId) throw new Error('appendConversationTurn: userId is required')
  const turnId = presetTurnId ?? randomUUID()
  const partsJson =
    turn.parts === undefined || turn.parts === null
      ? null
      : JSON.stringify(turn.parts)

  const session = driver.session()
  try {
    const result = await session.executeWrite(async (tx) => {
      if (threadId) {
        // Append to a specific named thread (multi-thread support).
        return tx.run(
          `
          MATCH (p:Person:User {id: $userId})-[:HAS_THREAD]->(t:ConversationThread {id: $threadId})
          WITH t
          SET t.turnCount = coalesce(t.turnCount, 0) + 1,
              t.lastTurnAt = datetime()
          WITH t, t.turnCount - 1 AS nextOrder
          CREATE (t)-[:HAS_TURN]->(turn:ConversationTurn {
            id: $turnId,
            role: $role,
            content: $content,
            parts: $partsJson,
            order: nextOrder,
            createdAt: t.lastTurnAt
          })
          RETURN t.id AS threadId, turn.id AS turnId, turn.order AS order
          `,
          { userId, threadId, turnId, role: turn.role, content: turn.content, partsJson }
        )
      }
      // Default: MERGE to the single implicit thread for the user (backward compat).
      return tx.run(
        `
        MATCH (p:Person:User {id: $userId})
        MERGE (p)-[:HAS_THREAD]->(t:ConversationThread {ownerId: $userId})
          ON CREATE SET
            t.id = $newThreadId,
            t.createdAt = datetime(),
            t.lastTurnAt = datetime(),
            t.turnCount = 0,
            t.mode = 'default',
            t.kind = 'reflective'
        WITH t
        SET t.turnCount = coalesce(t.turnCount, 0) + 1,
            t.lastTurnAt = datetime(),
            t.mode = coalesce(t.mode, 'default'),
            t.kind = coalesce(t.kind, 'reflective')
        WITH t, t.turnCount - 1 AS nextOrder
        CREATE (t)-[:HAS_TURN]->(turn:ConversationTurn {
          id: $turnId,
          role: $role,
          content: $content,
          parts: $partsJson,
          order: nextOrder,
          createdAt: t.lastTurnAt
        })
        RETURN t.id AS threadId, turn.id AS turnId, turn.order AS order
        `,
        {
          userId,
          newThreadId: `thread_${randomUUID()}`,
          turnId,
          role: turn.role,
          content: turn.content,
          partsJson,
        }
      )
    })
    const record = result.records[0]
    if (!record) {
      throw new Error(
        `appendConversationTurn: no User/Thread found for userId=${userId}${threadId ? ` threadId=${threadId}` : ''}`
      )
    }
    return {
      threadId: record.get('threadId') as string,
      turnId: record.get('turnId') as string,
      order: Number(record.get('order')),
    }
  } finally {
    await session.close()
  }
}

export interface ConversationThreadSummary {
  id: string
  createdAt: string
  lastTurnAt: string | null
  turnCount: number
  snippet: string
  title: string | null
  mode: string
  kind: string
}

/** Return a lightweight list of all threads for the user, newest first. */
export async function listConversationThreadsSummary(
  userId: string
): Promise<ConversationThreadSummary[]> {
  if (!userId) return []
  const session = driver.session()
  try {
    const result = await session.executeRead(async (tx) =>
      tx.run(
        `
        MATCH (p:Person:User {id: $userId})-[:HAS_THREAD]->(t:ConversationThread)
        CALL (t) {
          OPTIONAL MATCH (t)-[:HAS_TURN]->(turn:ConversationTurn {role: 'user'})
          WITH turn WHERE turn IS NOT NULL
          RETURN turn ORDER BY turn.order ASC LIMIT 1
        }
        WITH t, turn AS firstTurn
        RETURN
          t.id AS id,
          toString(t.createdAt) AS createdAt,
          toString(t.lastTurnAt) AS lastTurnAt,
          coalesce(t.turnCount, 0) AS turnCount,
          substring(coalesce(firstTurn.content, ''), 0, 120) AS snippet,
          t.title AS title,
          coalesce(t.mode, 'default') AS mode,
          coalesce(t.kind, 'reflective') AS kind
        ORDER BY t.lastTurnAt DESC
        LIMIT 50
        `,
        { userId }
      )
    )
    return result.records.map((r) => ({
      id: r.get('id') as string,
      createdAt: (r.get('createdAt') as string) ?? '',
      lastTurnAt: (r.get('lastTurnAt') as string) ?? null,
      turnCount: Number(r.get('turnCount') ?? 0),
      snippet: (r.get('snippet') as string) ?? '',
      title: (r.get('title') as string | null) ?? null,
      mode: (r.get('mode') as string) ?? 'default',
      kind: (r.get('kind') as string) ?? 'reflective',
    }))
  } catch (error) {
    console.warn('[conversation-thread] listSummary failed:', error instanceof Error ? error.message : error)
    return []
  } finally {
    await session.close()
  }
}

/** Fetch a specific thread by id — auth-scoped: user must own it. */
export async function getConversationThread(
  userId: string,
  threadId: string
): Promise<ConversationThreadRecord | null> {
  if (!userId || !threadId) return null
  const session = driver.session()
  try {
    const result = await session.executeRead(async (tx) =>
      tx.run(
        `
        MATCH (p:Person:User {id: $userId})-[:HAS_THREAD]->(t:ConversationThread {id: $threadId})
        CALL (t) {
          OPTIONAL MATCH (t)-[:HAS_TURN]->(turn:ConversationTurn)
          WITH turn WHERE turn IS NOT NULL
          RETURN turn ORDER BY turn.order DESC, turn.createdAt DESC
          LIMIT toInteger($maxTurns)
        }
        WITH t, collect({
          id: turn.id,
          role: turn.role,
          content: turn.content,
          parts: turn.parts,
          order: turn.order,
          createdAt: toString(turn.createdAt)
        }) AS recentTurnsDesc
        RETURN
          t.id AS threadId,
          toString(t.createdAt) AS createdAt,
          toString(t.lastTurnAt) AS lastTurnAt,
          coalesce(t.mode, 'default') AS mode,
          coalesce(t.kind, 'reflective') AS kind,
          t.title AS title,
          reverse(recentTurnsDesc) AS turns
        `,
        { userId, threadId, maxTurns: MAX_REPLAY_TURNS }
      )
    )
    const record = result.records[0]
    if (!record) return null
    const turnsRaw = (record.get('turns') as Array<Record<string, unknown>>) ?? []
    const turns: ConversationTurnRecord[] = turnsRaw
      .filter((row) => row && typeof row.id === 'string')
      .map((row) => ({
        id: row.id as string,
        role: row.role as ConversationTurnRole,
        content: typeof row.content === 'string' ? row.content : '',
        parts: parseStoredParts(row.parts),
        order: Number(row.order ?? 0),
        createdAt: typeof row.createdAt === 'string' ? row.createdAt : '',
      }))
    return {
      id: record.get('threadId') as string,
      createdAt: (record.get('createdAt') as string) ?? '',
      lastTurnAt: (record.get('lastTurnAt') as string) ?? null,
      mode: (record.get('mode') as string) ?? 'default',
      kind: (record.get('kind') as string) ?? 'reflective',
      title: (record.get('title') as string | null) ?? null,
      turns,
    }
  } catch (error) {
    console.warn('[conversation-thread] getThread failed:', error instanceof Error ? error.message : error)
    return null
  } finally {
    await session.close()
  }
}

/**
 * Create a brand-new empty thread for the user.
 *
 * Intentionally does NOT set `ownerId`. The UNIQUE constraint on
 * `ConversationThread.ownerId` (see `scripts/init-db.js`) is held by the
 * user's implicit chat thread — the one MERGEd by `appendConversationTurn`
 * when no `threadId` is supplied. Setting `ownerId` on additional threads
 * would violate that constraint the moment a user already has any prior
 * thread. Listing, fetching, and authorization all flow through the
 * `HAS_THREAD` edge, so the missing property is invisible to callers.
 * (Same trick the ingest thread creator uses — see
 * `src/lib/ingest/handle-ingest-document.ts#createIngestThread`.)
 */
export async function createConversationThread(
  userId: string
): Promise<{ threadId: string }> {
  if (!userId) throw new Error('createConversationThread: userId is required')
  const newId = `thread_${randomUUID()}`
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
          mode: 'default',
          kind: 'reflective'
        })
        `,
        { userId, threadId: newId }
      )
    )
    return { threadId: newId }
  } finally {
    await session.close()
  }
}

/**
 * Record that the user is now viewing a specific thread. Persists
 * `lastViewedThreadId` on the user node so a hard refresh re-opens the same
 * thread instead of falling back to the most-recent-by-lastTurnAt thread.
 *
 * Auth-scoped: the thread must belong to this user, otherwise the write is
 * a no-op.
 */
export async function setLastViewedConversationThread(
  userId: string,
  threadId: string
): Promise<void> {
  if (!userId || !threadId) return
  const session = driver.session()
  try {
    await session.executeWrite(async (tx) =>
      tx.run(
        `
        MATCH (p:Person:User {id: $userId})-[:HAS_THREAD]->(t:ConversationThread {id: $threadId})
        SET p.lastViewedThreadId = t.id
        `,
        { userId, threadId }
      )
    )
  } catch (error) {
    console.warn(
      '[conversation-thread] setLastViewed failed:',
      error instanceof Error ? error.message : error
    )
  } finally {
    await session.close()
  }
}

/** Persist an auto-generated title on a thread. Auth-scoped via userId. */
export async function setConversationThreadTitle(
  userId: string,
  threadId: string | undefined,
  title: string
): Promise<void> {
  if (!userId) return
  const session = driver.session()
  try {
    await session.executeWrite(async (tx) => {
      if (threadId) {
        return tx.run(
          `MATCH (p:Person:User {id: $userId})-[:HAS_THREAD]->(t:ConversationThread {id: $threadId})
           SET t.title = $title`,
          { userId, threadId, title }
        )
      }
      // No explicit threadId — update the most recently active thread.
      return tx.run(
        `MATCH (p:Person:User {id: $userId})-[:HAS_THREAD]->(t:ConversationThread)
         WITH t ORDER BY t.lastTurnAt DESC LIMIT 1
         SET t.title = $title`,
        { userId, title }
      )
    })
  } finally {
    await session.close()
  }
}

/**
 * Read the user's active conversation thread along with up to
 * `MAX_REPLAY_TURNS` of its most recent turns (oldest first within that
 * window). Returns `null` if the user has no thread yet.
 */
export async function getActiveConversationThread(
  userId: string
): Promise<ConversationThreadRecord | null> {
  if (!userId) return null

  const session = driver.session()
  try {
    const result = await session.executeRead(async (tx) => {
      return tx.run(
        `
        // Slice 5: honour the user's last-viewed thread when set. The user
        // might have switched away from the ingest thread back to their
        // reflective chat — that intent must survive a hard refresh.
        // Pinned thread wins; otherwise fall back to most-recent-by-lastTurnAt.
        MATCH (p:Person:User {id: $userId})
        WITH p, p.lastViewedThreadId AS pinnedId
        MATCH (p)-[:HAS_THREAD]->(t:ConversationThread)
        WITH t, pinnedId
        ORDER BY
          CASE WHEN t.id = pinnedId THEN 0 ELSE 1 END,
          t.lastTurnAt DESC
        LIMIT 1
        // Push LIMIT into a subquery so long threads don't materialise every
        // turn before slicing. Returns the most recent N turns descending.
        CALL (t) {
          OPTIONAL MATCH (t)-[:HAS_TURN]->(turn:ConversationTurn)
          WITH turn
          WHERE turn IS NOT NULL
          RETURN turn
          ORDER BY turn.order DESC, turn.createdAt DESC
          LIMIT toInteger($maxTurns)
        }
        WITH t, collect({
          id: turn.id,
          role: turn.role,
          content: turn.content,
          parts: turn.parts,
          order: turn.order,
          createdAt: toString(turn.createdAt)
        }) AS recentTurnsDesc
        RETURN
          t.id AS threadId,
          toString(t.createdAt) AS createdAt,
          toString(t.lastTurnAt) AS lastTurnAt,
          coalesce(t.mode, 'default') AS mode,
          coalesce(t.kind, 'reflective') AS kind,
          t.title AS title,
          reverse(recentTurnsDesc) AS turns
        `,
        { userId, maxTurns: MAX_REPLAY_TURNS }
      )
    })
    const record = result.records[0]
    if (!record) return null

    const turnsRaw = (record.get('turns') as Array<Record<string, unknown>>) ?? []
    const turns: ConversationTurnRecord[] = turnsRaw
      .filter((row) => row && typeof row.id === 'string')
      .map((row) => ({
        id: row.id as string,
        role: row.role as ConversationTurnRole,
        content: typeof row.content === 'string' ? row.content : '',
        parts: parseStoredParts(row.parts),
        order: Number(row.order ?? 0),
        createdAt: typeof row.createdAt === 'string' ? row.createdAt : '',
      }))

    return {
      id: record.get('threadId') as string,
      createdAt: (record.get('createdAt') as string) ?? '',
      lastTurnAt: (record.get('lastTurnAt') as string) ?? null,
      mode: (record.get('mode') as string) ?? 'default',
      kind: (record.get('kind') as string) ?? 'reflective',
      title: (record.get('title') as string | null) ?? null,
      turns,
    }
  } catch (error) {
    console.warn(
      '[conversation-thread] Failed to read active thread:',
      error instanceof Error ? error.message : error
    )
    return null
  } finally {
    await session.close()
  }
}
