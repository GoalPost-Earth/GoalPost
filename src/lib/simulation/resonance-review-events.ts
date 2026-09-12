'use client'

/**
 * Cross-component bus for the resonance-suggestion REVIEW step (WF-07).
 *
 * GOAL-348 surfaced the pending count inside the field-context page's
 * Resonances section — which is only reachable in the Dashboard view. In Bloom
 * Exploration the routed page is still mounted but hidden, so that affordance
 * is invisible exactly where a member is most likely to be looking at the
 * field's connections. The studio-shell action bar (visible in BOTH canvas
 * views) therefore carries its own review button, and needs a way to ask the
 * page — which owns `ResonanceSuggestionsModal` and all of its accept/decline
 * wiring — to open it.
 *
 * Same primitive and same reasoning as [pulse-creation-events.ts]: window
 * events keep the action bar decoupled from each page's modal-state shape.
 *
 * Open subscribers:
 *   - /protected/dashboard/field-context/[id]/page.tsx
 *
 * Changed producers:
 *   - the same page, after a discovery sweep or any accept / decline, so the
 *     action bar's independently-fetched count stays honest.
 *
 * Discovery-finished producers:
 *   - `useResonanceDiscovery`, when a manual sweep returns (GOAL-368). The
 *     page listens, re-fetches its count, and emits "changed".
 *
 * Opening the modal must NEVER imply a discovery sweep — `discoverResonances`
 * stays a separate, explicit action (ADR-004, WF-06).
 */

const OPEN_RESONANCE_SUGGESTIONS_EVENT =
  'gp:open-resonance-suggestions-modal' as const
const RESONANCE_SUGGESTIONS_CHANGED_EVENT =
  'gp:resonance-suggestions-changed' as const

export interface OpenResonanceSuggestionsDetail {
  /** FieldContext.id the caller expects to review from. */
  fieldContextId: string
  /**
   * Optional: accept any mounted field page of this Space. The review queue is
   * Space-wide, so a manual sweep's completion toast (GOAL-368) can still open
   * it after the member has moved on to a sibling field.
   */
  spaceId?: string
}

/** Emit a request to open the suggestions review modal for `fieldContextId`. */
export function emitOpenResonanceSuggestions(
  fieldContextId: string,
  options: { spaceId?: string } = {}
): void {
  if (typeof window === 'undefined') return
  if (!fieldContextId) return
  window.dispatchEvent(
    new CustomEvent<OpenResonanceSuggestionsDetail>(
      OPEN_RESONANCE_SUGGESTIONS_EVENT,
      { detail: { fieldContextId, spaceId: options.spaceId } }
    )
  )
}

/** Subscribe to review-modal open requests. Returns an unsubscribe function. */
export function onOpenResonanceSuggestions(
  handler: (detail: OpenResonanceSuggestionsDetail) => void
): () => void {
  if (typeof window === 'undefined') return () => {}
  const wrapped = (event: Event) => {
    const detail = (event as CustomEvent<OpenResonanceSuggestionsDetail>).detail
    if (!detail || typeof detail.fieldContextId !== 'string') return
    handler(detail)
  }
  window.addEventListener(OPEN_RESONANCE_SUGGESTIONS_EVENT, wrapped)
  return () =>
    window.removeEventListener(OPEN_RESONANCE_SUGGESTIONS_EVENT, wrapped)
}

export interface ResonanceSuggestionsChangedDetail {
  /** FieldContext the emitter's count is scoped to. */
  fieldContextId: string
  /** That field's owning Space. */
  spaceId: string
  /**
   * The emitter's freshly-fetched `pending` count for that pair. Listeners
   * scoped to the same field adopt it instead of issuing their own request —
   * the modal fires a refresh after EVERY accept / decline, so a listener that
   * re-fetched each time would double the count queries per reviewed card.
   * Listeners scoped elsewhere must ignore it and re-fetch: it is one field's
   * number, not theirs.
   */
  pendingCount: number
}

/**
 * Announce that the set of `pending` ResonanceSuggestions changed — a sweep
 * minted new ones, or a member confirmed / rejected some.
 *
 * Scoped like the open event above rather than broadcast bare: a Space-level
 * review surface would otherwise make every mounted counter refetch on any
 * field's change.
 */
export function emitResonanceSuggestionsChanged(
  detail: ResonanceSuggestionsChangedDetail
): void {
  if (typeof window === 'undefined') return
  if (!detail?.fieldContextId || !detail?.spaceId) return
  window.dispatchEvent(
    new CustomEvent<ResonanceSuggestionsChangedDetail>(
      RESONANCE_SUGGESTIONS_CHANGED_EVENT,
      { detail }
    )
  )
}

const RESONANCE_DISCOVERY_FINISHED_EVENT =
  'gp:resonance-discovery-finished' as const

export interface ResonanceDiscoveryFinishedDetail {
  /** Space the manual sweep covered — every field in it may have new suggestions. */
  spaceId: string
}

/**
 * Announce that a manual discovery sweep (GOAL-368) finished. The sweep is
 * started from `useResonanceDiscovery`, which may live in the action bar where
 * no count is owned — so this carries no number: the field-context page
 * re-fetches its own count and re-broadcasts it via
 * `emitResonanceSuggestionsChanged`.
 */
export function emitResonanceDiscoveryFinished(
  detail: ResonanceDiscoveryFinishedDetail
): void {
  if (typeof window === 'undefined') return
  if (!detail?.spaceId) return
  window.dispatchEvent(
    new CustomEvent<ResonanceDiscoveryFinishedDetail>(
      RESONANCE_DISCOVERY_FINISHED_EVENT,
      { detail }
    )
  )
}

/** Subscribe to manual-sweep completions. Returns an unsubscribe. */
export function onResonanceDiscoveryFinished(
  handler: (detail: ResonanceDiscoveryFinishedDetail) => void
): () => void {
  if (typeof window === 'undefined') return () => {}
  const wrapped = (event: Event) => {
    const detail = (event as CustomEvent<ResonanceDiscoveryFinishedDetail>)
      .detail
    if (!detail || typeof detail.spaceId !== 'string') return
    handler(detail)
  }
  window.addEventListener(RESONANCE_DISCOVERY_FINISHED_EVENT, wrapped)
  return () =>
    window.removeEventListener(RESONANCE_DISCOVERY_FINISHED_EVENT, wrapped)
}

/** Subscribe to suggestion-set change notifications. Returns an unsubscribe. */
export function onResonanceSuggestionsChanged(
  handler: (detail: ResonanceSuggestionsChangedDetail) => void
): () => void {
  if (typeof window === 'undefined') return () => {}
  const wrapped = (event: Event) => {
    const detail = (event as CustomEvent<ResonanceSuggestionsChangedDetail>)
      .detail
    if (!detail || typeof detail.fieldContextId !== 'string') return
    handler(detail)
  }
  window.addEventListener(RESONANCE_SUGGESTIONS_CHANGED_EVENT, wrapped)
  return () =>
    window.removeEventListener(RESONANCE_SUGGESTIONS_CHANGED_EVENT, wrapped)
}
