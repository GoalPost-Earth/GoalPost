'use client'

import {
  buildFocusParam,
  parseFocusParam,
  type CollectedEntity,
  type PivotEntityType,
} from './entity-collector'

/**
 * sessionStorage handoff between the AI assistant panel's pivot footer and
 * the surfaces that consume `?focus=Type:id,...` URLs (the dashboard "focus"
 * view; the /graph banner).
 *
 * Why sessionStorage instead of just reading names from the URL: the URL
 * carries only ids, but the panel already knows the resolved names (it
 * captured them while the conversation was happening). Stashing names lets
 * the destination render immediately without a follow-up Cypher fetch.
 *
 * Why keyed by the focus param itself: if the user pivots twice with
 * different entity sets, each writes its own entry and consumers read by
 * exact URL match. Avoids the "stale handoff overwrites a fresh one" race.
 *
 * Cross-browser shares (someone else opens the same URL) won't have the
 * matching key in their sessionStorage and will fall back to rendering just
 * the parsed `{type, id}` pairs. Commit 3's server-side ConversationThread
 * persistence supersedes this with a durable, multi-device source of truth.
 */

const STORAGE_KEY_PREFIX = 'gp.focus-entities:'

interface StoredEntry {
  /** ISO timestamp — lets the consumer ignore stale entries if desired. */
  savedAt: string
  entities: CollectedEntity[]
}

function isCollectedEntity(value: unknown): value is CollectedEntity {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return (
    typeof record.type === 'string' &&
    typeof record.id === 'string' &&
    typeof record.name === 'string' &&
    record.id.length > 0 &&
    record.name.length > 0
  )
}

/** Persist the entities under their own focus-param key. */
export function saveFocusEntities(entities: CollectedEntity[]): string {
  const focus = buildFocusParam(entities)
  if (typeof window === 'undefined' || !focus) return focus
  try {
    const entry: StoredEntry = {
      savedAt: new Date().toISOString(),
      entities,
    }
    window.sessionStorage.setItem(STORAGE_KEY_PREFIX + focus, JSON.stringify(entry))
  } catch {
    // sessionStorage can throw on quota / privacy mode; the consumer falls
    // back to id-only rendering, so swallow.
  }
  return focus
}

/**
 * Read entities saved for the given focus param. Returns the URL's parsed
 * pairs (sans names) when there's no matching sessionStorage entry — the
 * caller can render id-only placeholders.
 */
export function loadFocusEntities(
  focus: string | null | undefined
): {
  entities: CollectedEntity[]
  resolved: boolean
  fallback: Array<{ type: PivotEntityType; id: string }>
} {
  const fallback = parseFocusParam(focus)
  if (typeof window === 'undefined' || !focus) {
    return { entities: [], resolved: false, fallback }
  }
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY_PREFIX + focus)
    if (!raw) return { entities: [], resolved: false, fallback }
    const parsed = JSON.parse(raw) as Partial<StoredEntry>
    const entities = Array.isArray(parsed?.entities)
      ? parsed.entities.filter(isCollectedEntity)
      : []
    if (entities.length === 0) {
      return { entities: [], resolved: false, fallback }
    }
    return { entities, resolved: true, fallback }
  } catch {
    return { entities: [], resolved: false, fallback }
  }
}
