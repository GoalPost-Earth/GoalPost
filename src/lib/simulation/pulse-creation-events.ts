'use client'

/**
 * Cross-component bus for "open creation modal" requests originating from
 * the studio-shell canvas action bar.
 *
 * The action bar lives above the routed page tree, but creation modals
 * (Add Pulse, Add Field Context) are owned by the route page that has
 * the right mutations, refetch wiring, and validation in scope. Window-
 * scoped custom events keep the action bar decoupled from each page's
 * modal-state shape (same primitive as [assistant-panel-events.ts]).
 *
 * Add-pulse subscribers:
 *   - /protected/dashboard/field-context/[id]/page.tsx
 *   - /protected/spaces/me-space/[id]/fields/[field]/page.tsx
 *   - /protected/spaces/we-space/[id]/fields/[field]/page.tsx
 *
 * Add-field-context subscribers:
 *   - /protected/spaces/me-space/[id]/page.tsx
 *   - /protected/spaces/we-space/[id]/page.tsx
 *
 * Producers:
 *   - StudioCanvasActionBar — picks the appropriate event based on focal.
 */

const OPEN_ADD_PULSE_EVENT = 'gp:open-add-pulse-modal' as const
const OPEN_ADD_FIELD_CONTEXT_EVENT = 'gp:open-add-field-context-modal' as const

export interface OpenAddPulseModalDetail {
  /** FieldContext.id the caller expects the modal to attach to. */
  fieldContextId: string
}

export interface OpenAddFieldContextModalDetail {
  /** MeSpace.id or WeSpace.id the caller expects the modal to attach to. */
  spaceId: string
}

/** Emit a request to open the create-pulse modal for `fieldContextId`. */
export function emitOpenAddPulseModal(fieldContextId: string): void {
  if (typeof window === 'undefined') return
  if (!fieldContextId) return
  window.dispatchEvent(
    new CustomEvent<OpenAddPulseModalDetail>(OPEN_ADD_PULSE_EVENT, {
      detail: { fieldContextId },
    })
  )
}

/** Subscribe to add-pulse requests. Returns an unsubscribe function. */
export function onOpenAddPulseModal(
  handler: (detail: OpenAddPulseModalDetail) => void
): () => void {
  if (typeof window === 'undefined') return () => {}
  const wrapped = (event: Event) => {
    const detail = (event as CustomEvent<OpenAddPulseModalDetail>).detail
    if (!detail || typeof detail.fieldContextId !== 'string') return
    handler(detail)
  }
  window.addEventListener(OPEN_ADD_PULSE_EVENT, wrapped)
  return () => window.removeEventListener(OPEN_ADD_PULSE_EVENT, wrapped)
}

/** Emit a request to open the create-field-context modal for `spaceId`. */
export function emitOpenAddFieldContextModal(spaceId: string): void {
  if (typeof window === 'undefined') return
  if (!spaceId) return
  window.dispatchEvent(
    new CustomEvent<OpenAddFieldContextModalDetail>(
      OPEN_ADD_FIELD_CONTEXT_EVENT,
      { detail: { spaceId } }
    )
  )
}

/** Subscribe to add-field-context requests. Returns an unsubscribe function. */
export function onOpenAddFieldContextModal(
  handler: (detail: OpenAddFieldContextModalDetail) => void
): () => void {
  if (typeof window === 'undefined') return () => {}
  const wrapped = (event: Event) => {
    const detail = (event as CustomEvent<OpenAddFieldContextModalDetail>).detail
    if (!detail || typeof detail.spaceId !== 'string') return
    handler(detail)
  }
  window.addEventListener(OPEN_ADD_FIELD_CONTEXT_EVENT, wrapped)
  return () =>
    window.removeEventListener(OPEN_ADD_FIELD_CONTEXT_EVENT, wrapped)
}
