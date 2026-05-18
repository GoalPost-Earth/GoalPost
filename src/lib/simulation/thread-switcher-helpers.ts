/**
 * Pure helpers for the assistant panel's thread switcher.
 *
 * Extracted from the React component so they can be unit-tested in
 * the node test environment — the rendered switcher itself is covered
 * end-to-end by manual smoke tests since the project's jest preset
 * runs in node, not jsdom.
 */

import type { ThreadSummary } from './conversation-thread-client'

/**
 * Display title for a thread row. Falls back through:
 *   1. Persisted title (`Ingest: <filename>` or any user-named thread)
 *   2. "Ingest" sentinel for ingest threads with no title
 *   3. The first user turn's snippet, trimmed to 60 chars
 *   4. Generic "Conversation"
 *
 * Critically, this function NEVER falls back to thread.id — that would
 * leak a raw entity ID to the user, violating kb/07-ai-assistant-ux.md
 * Rule 1.
 */
export function deriveDisplayTitle(thread: Pick<ThreadSummary, 'title' | 'kind' | 'snippet'>): string {
  const trimmed = (thread.title ?? '').trim()
  if (trimmed.length > 0) return trimmed
  if (thread.kind === 'ingest') return 'Ingest'
  const snippet = (thread.snippet ?? '').trim()
  if (snippet.length > 0) {
    return snippet.length > 60 ? `${snippet.slice(0, 57)}…` : snippet
  }
  return 'Conversation'
}

/**
 * Relative-time formatter used on the switcher list. Returns short labels
 * ("3m ago", "5d ago") suitable for a compact dropdown. Empty string when
 * the input is null or unparseable.
 */
export function formatRelative(value: string | null, now: number = Date.now()): string {
  if (!value) return ''
  const ts = Date.parse(value)
  if (!Number.isFinite(ts)) return ''
  const diffMs = now - ts
  if (diffMs < 60_000) return 'just now'
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks}w ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  const years = Math.floor(days / 365)
  return `${years}y ago`
}

const RAW_ID_PATTERNS: RegExp[] = [
  /\b(?:me_|ws_|ctx_|pulse_|thread_|document_|log_)[A-Za-z0-9-]+/i,
  // bare UUID
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i,
]

/**
 * Conservative check for raw entity-id leakage in user-visible copy.
 * Used by tests to guard the switcher's rendered text.
 */
export function containsRawEntityId(text: string): boolean {
  return RAW_ID_PATTERNS.some((re) => re.test(text))
}
