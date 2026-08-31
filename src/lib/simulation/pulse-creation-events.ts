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
 *
 * Add-field-context subscribers:
 *   - components/dashboard/space-dashboard-view.tsx
 *     (rendered by /protected/dashboard/space/[id] — the canonical
 *     destination of every "open this space" interaction)
 *
 * Import-articles subscribers:
 *   - /protected/dashboard/field-context/[id]/page.tsx
 *     (owns the dynamically-imported ImportArticlesModal, because the
 *     post-import refetch wiring lives there; the dynamic import also keeps
 *     SheetJS out of the bundle for members who never import)
 *
 * Add-space-members subscribers:
 *   - components/dashboard/space-dashboard-view.tsx
 *     (opens the SpacePermissionsModal; for MeSpace, the first member
 *     add auto-converts to a WeSpace per
 *     src/lib/graphql/resolvers/space-membership-resolver.ts)
 *
 * Producers:
 *   - StudioCanvasActionBar — picks the appropriate event based on focal.
 */

const OPEN_ADD_PULSE_EVENT = 'gp:open-add-pulse-modal' as const
const OPEN_ADD_FIELD_CONTEXT_EVENT = 'gp:open-add-field-context-modal' as const
const OPEN_ADD_SPACE_MEMBERS_EVENT = 'gp:open-add-space-members-modal' as const
const OPEN_IMPORT_ARTICLES_EVENT = 'gp:open-import-articles-modal' as const
const CLOSED_IMPORT_ARTICLES_EVENT = 'gp:import-articles-modal-closed' as const

export interface OpenAddPulseModalDetail {
  /** FieldContext.id the caller expects the modal to attach to. */
  fieldContextId: string
}

export interface OpenAddFieldContextModalDetail {
  /** MeSpace.id or WeSpace.id the caller expects the modal to attach to. */
  spaceId: string
}

export interface OpenAddSpaceMembersModalDetail {
  /** MeSpace.id or WeSpace.id the caller expects the modal to attach to. */
  spaceId: string
}

export interface OpenImportArticlesModalDetail {
  /** FieldContext.id the caller expects the import to attach to. */
  fieldContextId: string
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

/** Emit a request to open the bulk import-articles modal for `fieldContextId`. */
export function emitOpenImportArticlesModal(fieldContextId: string): void {
  if (typeof window === 'undefined') return
  if (!fieldContextId) return
  window.dispatchEvent(
    new CustomEvent<OpenImportArticlesModalDetail>(OPEN_IMPORT_ARTICLES_EVENT, {
      detail: { fieldContextId },
    })
  )
}

/** Subscribe to import-articles requests. Returns an unsubscribe function. */
export function onOpenImportArticlesModal(
  handler: (detail: OpenImportArticlesModalDetail) => void
): () => void {
  if (typeof window === 'undefined') return () => {}
  const wrapped = (event: Event) => {
    const detail = (event as CustomEvent<OpenImportArticlesModalDetail>).detail
    if (!detail || typeof detail.fieldContextId !== 'string') return
    handler(detail)
  }
  window.addEventListener(OPEN_IMPORT_ARTICLES_EVENT, wrapped)
  return () => window.removeEventListener(OPEN_IMPORT_ARTICLES_EVENT, wrapped)
}

/**
 * Announce that the bulk import-articles modal closed (GOAL-328).
 *
 * The modal is owned by the field-context page but can be launched from the
 * studio action bar, whose menu suppresses Radix's own focus restore so the
 * dialog can take focus. That leaves the launcher as the only component able
 * to return focus to its trigger — but it has no other way to learn the
 * dialog went away. This is that signal.
 */
export function emitImportArticlesModalClosed(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(CLOSED_IMPORT_ARTICLES_EVENT))
}

/** Subscribe to import-articles close notifications. Returns an unsubscribe. */
export function onImportArticlesModalClosed(handler: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  const wrapped = () => handler()
  window.addEventListener(CLOSED_IMPORT_ARTICLES_EVENT, wrapped)
  return () => window.removeEventListener(CLOSED_IMPORT_ARTICLES_EVENT, wrapped)
}

/** Emit a request to open the add-members modal for `spaceId`. */
export function emitOpenAddSpaceMembersModal(spaceId: string): void {
  if (typeof window === 'undefined') return
  if (!spaceId) return
  window.dispatchEvent(
    new CustomEvent<OpenAddSpaceMembersModalDetail>(
      OPEN_ADD_SPACE_MEMBERS_EVENT,
      { detail: { spaceId } }
    )
  )
}

/** Subscribe to add-members requests. Returns an unsubscribe function. */
export function onOpenAddSpaceMembersModal(
  handler: (detail: OpenAddSpaceMembersModalDetail) => void
): () => void {
  if (typeof window === 'undefined') return () => {}
  const wrapped = (event: Event) => {
    const detail = (event as CustomEvent<OpenAddSpaceMembersModalDetail>).detail
    if (!detail || typeof detail.spaceId !== 'string') return
    handler(detail)
  }
  window.addEventListener(OPEN_ADD_SPACE_MEMBERS_EVENT, wrapped)
  return () =>
    window.removeEventListener(OPEN_ADD_SPACE_MEMBERS_EVENT, wrapped)
}
