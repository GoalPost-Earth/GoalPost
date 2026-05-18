'use client'

import type { UIMessage } from 'ai'

/**
 * Resolve a fresh JWT for authenticated chat-thread API calls. Mirrors the
 * dance in `OnboardingContext.callOnboardingAPI`: hit /access-token first, fall
 * back to /refresh-token, then attach the result as `Authorization: Bearer`.
 *
 * Plain cookie-only fetches stopped being enough once the server route
 * started honouring `Authorization` first — a stale cookie now 401s where
 * a refreshed bearer would have succeeded.
 */
async function getAccessTokenForChatApi(): Promise<string | null> {
  try {
    const tokenRes = await fetch('/api/auth/access-token', {
      credentials: 'include',
    })
    if (tokenRes.ok) {
      const data = (await tokenRes.json()) as { accessToken?: string }
      if (data.accessToken) return data.accessToken
    }
    const refreshRes = await fetch('/api/auth/refresh-token', {
      credentials: 'include',
    })
    if (refreshRes.ok) {
      const data = (await refreshRes.json()) as { accessToken?: string }
      if (data.accessToken) return data.accessToken
    }
  } catch {
    // fall through to null
  }
  return null
}

export async function chatApiAuthHeaders(): Promise<Record<string, string>> {
  const token = await getAccessTokenForChatApi()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Internal alias so the in-module callers stay terse.
const authHeaders = chatApiAuthHeaders

/**
 * Client helpers for hydrating the AI assistant panel from the
 * `/api/chat/simulation/thread(s)` endpoints.
 *
 * Conversion target: the AI SDK `UIMessage` shape that `useChatRuntime`
 * accepts as its initial `messages` option. We restore the original `parts`
 * tree verbatim when the server has one (preserving tool calls + results so
 * the chat is replayed faithfully); otherwise we synthesise a single text
 * part from the stored `content` so older or text-only turns still render.
 *
 * Slice 5 (GOAL-240) adds `mode`, `kind`, and `title` to the hydrated shape
 * so the assistant panel can lock the mode selector on ingest threads and
 * render thread titles in the switcher without exposing raw IDs.
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
  /** 'default' | 'aiden' | 'braider'. Source of truth for which assistant mode this thread runs in. */
  mode: string
  /** 'reflective' | 'ingest'. UI uses this to lock the mode selector on ingest threads. */
  kind: string
  /** Human-readable title (e.g. "Ingest: meeting-notes.pdf"). Null for the implicit reflective thread. */
  title: string | null
  messages: UIMessage[]
}

export interface ThreadSummary {
  id: string
  createdAt: string
  lastTurnAt: string | null
  turnCount: number
  snippet: string
  title: string | null
  mode: string
  kind: string
}

interface ThreadFetchResponse {
  thread: {
    id: string
    createdAt: string
    lastTurnAt: string | null
    mode?: string
    kind?: string
    title?: string | null
    turns: StoredTurn[]
  } | null
}

interface ThreadsListResponse {
  threads: ThreadSummary[]
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
 * Fetch the active thread (or a specific one by id) and convert it to the
 * runtime's UIMessage[] shape. Returns `null` when the user has no thread yet
 * OR the fetch failed — the caller should treat both as "start with an empty
 * conversation."
 */
export async function fetchHydratedThread(
  signal?: AbortSignal,
  threadId?: string
): Promise<HydratedThread | null> {
  try {
    const url = threadId
      ? `/api/chat/simulation/thread?id=${encodeURIComponent(threadId)}`
      : '/api/chat/simulation/thread'
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: await authHeaders(),
      signal,
    })
    if (!response.ok) return null
    const data = (await response.json()) as ThreadFetchResponse
    if (!data.thread) return null
    return {
      id: data.thread.id,
      createdAt: data.thread.createdAt,
      lastTurnAt: data.thread.lastTurnAt,
      mode: typeof data.thread.mode === 'string' ? data.thread.mode : 'default',
      kind: typeof data.thread.kind === 'string' ? data.thread.kind : 'reflective',
      title: typeof data.thread.title === 'string' ? data.thread.title : null,
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

/**
 * List the user's recent threads for the switcher. Newest first. Returns an
 * empty array on auth / network failure so the switcher can render an empty
 * state instead of crashing.
 */
export async function fetchThreadList(
  signal?: AbortSignal
): Promise<ThreadSummary[]> {
  try {
    const response = await fetch('/api/chat/simulation/threads', {
      method: 'GET',
      credentials: 'include',
      headers: await authHeaders(),
      signal,
    })
    if (!response.ok) return []
    const data = (await response.json()) as ThreadsListResponse
    return Array.isArray(data.threads) ? data.threads : []
  } catch (error) {
    if ((error as { name?: string })?.name === 'AbortError') return []
    console.warn(
      '[conversation-thread-client] Thread list fetch failed:',
      error instanceof Error ? error.message : error
    )
    return []
  }
}

/**
 * Create a new empty thread server-side. Returns the new thread id, or `null`
 * if the request failed (e.g. unauthenticated). Callers should treat null as
 * "stay on the current thread."
 */
export async function createConversationThread(): Promise<string | null> {
  try {
    const res = await fetch('/api/chat/simulation/threads', {
      method: 'POST',
      credentials: 'include',
      headers: await authHeaders(),
    })
    if (!res.ok) return null
    const data = (await res.json()) as { threadId?: string }
    return typeof data.threadId === 'string' ? data.threadId : null
  } catch (error) {
    console.warn(
      '[conversation-thread-client] createConversationThread failed:',
      error instanceof Error ? error.message : error
    )
    return null
  }
}

/**
 * Pin a thread as the user's "last viewed" so a hard refresh re-opens it.
 * Fire-and-forget: failures degrade to legacy most-recent-by-lastTurnAt
 * selection on next hydration.
 */
export async function persistLastViewedThread(threadId: string): Promise<void> {
  try {
    await fetch('/api/chat/simulation/threads', {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(await authHeaders()),
      },
      body: JSON.stringify({ lastViewedThreadId: threadId }),
    })
  } catch (error) {
    console.warn(
      '[conversation-thread-client] persistLastViewedThread failed:',
      error instanceof Error ? error.message : error
    )
  }
}
