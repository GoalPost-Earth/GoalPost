'use client'

import { useState, type FC } from 'react'
import { useApolloClient } from '@apollo/client/react'
import { useFocalEntity } from '@/contexts'
import { CreateNestedFieldModal } from '@/components/fields/create-nested-field-modal'
import { useFieldContextCanEditContent } from '@/hooks/use-field-context-permissions'

/**
 * Studio-shell entry point for creating a nested field inside the focal
 * FieldContext (GOAL-339 — client feedback: nested-field creation used to
 * require a round-trip through the dashboard page and back to the canvas).
 *
 * Unlike Add pulse — which delegates to the routed page via the event bus —
 * this action owns its modal: the dashboard page's copy of the dialog sits
 * under CanvasHost's `visibility:hidden` keep-alive while Bloom is showing,
 * so an event-bus open would paint an invisible dialog. The bar itself is
 * visible in both canvas views.
 *
 * Always mounted (same contract as FieldContextUploadAction) and
 * self-gating, so an open dialog survives a focal change mid-flow: the
 * parent id + title are pinned on open and keep the modal alive until it
 * closes, while the trigger itself disables when the focal moves off a
 * FieldContext.
 *
 * Renders only when the focal entity is a route-sourced FieldContext and
 * the member passes `canEditContent` (kb/02) — a discoverability gate; the
 * `createSubFieldContext` resolver remains the real boundary and writes the
 * activity Log in-transaction.
 */
export const NestedFieldAction: FC = () => {
  const { focalEntity } = useFocalEntity()
  const apolloClient = useApolloClient()
  // Pinned on open so a focal-entity change mid-flow can't retarget the
  // create or unmount the dialog under the member's typing.
  const [pinned, setPinned] = useState<{
    id: string
    label: string | null
  } | null>(null)

  // Only a route-sourced focal implies the member is actually on a
  // FieldContext surface — persisted focals (assistant continuity) must not
  // surface the control on neutral routes.
  const focalFieldContextId =
    focalEntity?.type === 'FieldContext' && focalEntity.source === 'route'
      ? focalEntity.id
      : null

  const canEditContent = useFieldContextCanEditContent(focalFieldContextId)

  if (!focalFieldContextId && !pinned) return null
  // Hide the control for GUESTs / non-members — but never yank it out from
  // under a create that is already in flight (pinned survives that).
  if (!canEditContent && !pinned) return null

  return (
    <>
      <button
        type="button"
        disabled={!focalFieldContextId}
        onClick={() =>
          focalFieldContextId &&
          setPinned({
            id: focalFieldContextId,
            label: focalEntity?.label ?? null,
          })
        }
        aria-label="Add a nested field inside this field context"
        title="Add nested field"
        // `.gp-menu-item` owns the color + hover tint (a themed --gp-primary
        // wash) so the affordance is visible on light glass, dark glass, and
        // every theme variant — same treatment as the bar's other secondary
        // actions.
        className="gp-menu-item cursor-pointer flex items-center gap-2 px-3 md:px-4 h-10 md:h-11 rounded-full disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <span
          className="material-symbols-outlined text-[18px] leading-none"
          aria-hidden="true"
        >
          account_tree
        </span>
        <span className="hidden sm:inline text-sm font-medium">
          Add nested field
        </span>
      </button>
      {pinned && (
        <CreateNestedFieldModal
          isOpen
          parentContextId={pinned.id}
          parentTitle={pinned.label}
          onClose={() => setPinned(null)}
          onCreated={() =>
            // Same background sync assistant writes use (CanvasGraphSync):
            // refetch every active observer — the kept-alive dashboard
            // page's GET_FIELD_CONTEXT_DETAILS / GET_SPACE_DETAILS — so the
            // cache-first Bloom surface re-renders from the shared cache
            // (ADR-011: Bloom never fetches its own data).
            apolloClient.refetchQueries({ include: 'active' })
          }
        />
      )}
    </>
  )
}
