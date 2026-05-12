'use client'

import type { UIMessage } from 'ai'

/**
 * Client helpers for hydrating the AI assistant panel from the
 * `GET /api/chat/simulation/thread` endpoint.
 *
 * Conversion target: the AI SDK `UIMessage` shape that `useChatRuntime`
 * accepts as its initial `messages` option. We restore the original `parts`
 * tree verbatim when the server has one (preserving tool calls + results so
 * the chat is replayed faithfully); otherwise we synthesise a single text
 * part from the stored `content` so older or text-only turns still render.
 */

export interface StoredTurn {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  parts: unknown[] | null
  order: number
  createdAt: string
}

export interface HydratedThread {
  id: string
  createdAt: string
  lastTurnAt: string | null
  messages: UIMessage[]
}

interface ThreadFetchResponse {
  thread: {
    id: string
    createdAt: string
    lastTurnAt: string | null
    turns: StoredTurn[]
  } | null
}

function turnToUIMessage(turn: StoredTurn): UIMessage {
  const parts =
    Array.isArray(turn.parts) && turn.parts.length > 0
      ? (turn.parts as UIMessage['parts'])
      : ([{ type: 'text', text: turn.content }] as UIMessage['parts'])
  return {
    id: turn.id,
    role: turn.role,
    parts,
  } as UIMessage
}

/**
 * Fetch the active thread and convert it to the runtime's UIMessage[] shape.
 * Returns `null` when the user has no thread yet OR the fetch failed — the
 * caller should treat both as "start with an empty conversation."
 */
export async function fetchHydratedThread(
  signal?: AbortSignal
): Promise<HydratedThread | null> {
  try {
    const response = await fetch('/api/chat/simulation/thread', {
      method: 'GET',
      credentials: 'include',
      signal,
    })
    if (!response.ok) return null
    const data = (await response.json()) as ThreadFetchResponse
    if (!data.thread) return null
    return {
      id: data.thread.id,
      createdAt: data.thread.createdAt,
      lastTurnAt: data.thread.lastTurnAt,
      messages: data.thread.turns
        .filter((turn) => turn && typeof turn.id === 'string')
        .map(turnToUIMessage),
    }
  } catch (error) {
    if ((error as { name?: string })?.name === 'AbortError') return null
    console.warn(
      '[conversation-thread-client] Hydration failed:',
      error instanceof Error ? error.message : error
    )
    return null
  }
}
