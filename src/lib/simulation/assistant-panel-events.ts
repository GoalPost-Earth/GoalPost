'use client'

/**
 * Slice 5 (GOAL-240) — Tiny client-side event bus for cross-component
 * coordination of the AI assistant panel.
 *
 * The doc-ingestion upload flow lives in the FieldContext page; the
 * assistant panel lives in the studio shell. After an upload completes,
 * the page needs to (a) open the assistant panel and (b) tell it to switch
 * to the freshly-created ingest thread. Threading explicit props through
 * the focal-entity / studio-shell context would force every consumer to
 * adopt a new dependency for a one-shot signal — a window-scoped custom
 * event is the lighter primitive.
 *
 * Subscribers:
 *   - StudioShell                → opens the panel on receipt
 *   - AIAssistantPanel           → re-hydrates with the named thread
 *
 * Producers:
 *   - FieldContext upload handler (after a successful uploadDocument
 *     mutation) → emit with the returned threadId.
 */

const OPEN_THREAD_EVENT = 'gp:open-assistant-thread' as const

export interface OpenAssistantThreadDetail {
  /** ConversationThread.id to switch to once the panel mounts. */
  threadId: string
}

/** Emit a request to open the assistant panel and switch to `threadId`. */
export function emitOpenAssistantThread(threadId: string): void {
  if (typeof window === 'undefined') return
  if (!threadId) return
  window.dispatchEvent(
    new CustomEvent<OpenAssistantThreadDetail>(OPEN_THREAD_EVENT, {
      detail: { threadId },
    })
  )
}

/** Subscribe to open-thread requests. Returns an unsubscribe function. */
export function onOpenAssistantThread(
  handler: (detail: OpenAssistantThreadDetail) => void
): () => void {
  if (typeof window === 'undefined') return () => {}
  const wrapped = (event: Event) => {
    const detail = (event as CustomEvent<OpenAssistantThreadDetail>).detail
    if (!detail || typeof detail.threadId !== 'string') return
    handler(detail)
  }
  window.addEventListener(OPEN_THREAD_EVENT, wrapped)
  return () => window.removeEventListener(OPEN_THREAD_EVENT, wrapped)
}
