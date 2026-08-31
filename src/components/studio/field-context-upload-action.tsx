'use client'

import { useState, type FC } from 'react'
import { useApolloClient } from '@apollo/client/react'
import { FileUp } from 'lucide-react'
import { toast } from 'sonner'
import { useFocalEntity } from '@/contexts'
import {
  UploadDocumentModal,
  type UploadDocumentSubmitInput,
} from '@/components/ui/upload-document-modal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useFieldContextCanEditContent } from '@/hooks/use-field-context-permissions'
import { emitOpenImportArticlesModal } from '@/lib/simulation/pulse-creation-events'
import { runDocumentUploadFlow } from '@/lib/ingest/upload-document-flow'

/**
 * Studio-shell entry point for getting source material into a FieldContext.
 *
 * One compact "Upload" affordance offers both ingestion paths (GOAL-327):
 *  - Upload a document — single file, presign → S3 PUT → process (GOAL-235)
 *  - Import articles — bulk CSV/XLSX spreadsheet (GOAL-317)
 *
 * The two are conceptually the same action ("get source material into this
 * field"), so they share one trigger rather than competing for room in a
 * space-constrained floating bar.
 *
 * Renders only when the focal entity is a route-sourced FieldContext *and*
 * the user passes `canEditContent` (kb/02-user-roles.md). The client gate is
 * discoverability hygiene only — the server remains the real boundary
 * (`enqueueDocumentIngest`, GraphQL `@authorization`).
 *
 * The bulk import modal itself is owned by the field-context page (that's
 * where the post-import refetch wiring lives, and it loads the modal
 * dynamically so SheetJS stays out of the dashboard bundle for members who
 * never import); this component only emits the open request.
 *
 * The upload flow itself (presign → S3 PUT → enqueue → ingest watch → toasts
 * → open the ingest thread) lives in `@/lib/ingest/upload-document-flow`,
 * shared with the Pulses-section empty-state entry point on the field-context
 * page (GOAL-337) so the two paths cannot drift.
 */
export const FieldContextUploadAction: FC = () => {
  const { focalEntity } = useFocalEntity()
  // pinnedFieldContextId is captured on modal open so a focal-entity change
  // mid-flow can't redirect the upload to a different context (or unmount
  // the modal because the focal type is no longer FieldContext). null until
  // the user opens the modal.
  const [pinnedFieldContextId, setPinnedFieldContextId] = useState<
    string | null
  >(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Bumped on every open so the modal remounts with clean state. It keeps its
  // file/hint in local state and only clears them via its own close handler —
  // which the queued-upload path deliberately bypasses (it releases the modal
  // directly), so without this the next open would show the previous file.
  const [uploadSessionKey, setUploadSessionKey] = useState(0)

  // Only treat the focal as a live FieldContext when it came from the
  // current route. A 'persisted' source means the user navigated away to
  // a neutral surface; their last FieldContext is still in focal-entity
  // state for assistant context, but the upload button should not appear
  // there — there's no surface mounted to refresh after upload.
  const focalFieldContextId =
    focalEntity?.type === 'FieldContext' && focalEntity.source === 'route'
      ? focalEntity.id
      : null

  const apolloClient = useApolloClient()

  // Client-side mirror of the server's `canEditContent` check. Resolves from
  // the Apollo cache on the field-context page, which already runs this query.
  const canEditContent = useFieldContextCanEditContent(focalFieldContextId)

  if (!focalFieldContextId && !pinnedFieldContextId) return null
  // Hide the control for GUESTs / non-members — but never yank it out from
  // under an upload that is already in flight (pinned id survives that).
  if (!canEditContent && !pinnedFieldContextId) return null

  const handleSubmit = async (input: UploadDocumentSubmitInput) => {
    if (!pinnedFieldContextId) {
      toast.error('Upload context lost — please reopen the upload dialog.')
      throw new Error('No pinned FieldContext')
    }
    // Capture it: the modal is released as soon as the upload is queued, which
    // clears the pinned id while the flow's ingest watch is still running.
    const pinnedContextId = pinnedFieldContextId
    setIsSubmitting(true)
    try {
      // The flow settles its own toasts (including errors) and rethrows, so
      // the modal's catch can render the same message inline.
      await runDocumentUploadFlow(apolloClient, {
        fieldContextId: pinnedContextId,
        input,
        // The upload is durable in the queue — release the modal rather than
        // holding the member on a spinner for the length of an LLM extraction
        // they don't need to watch. `isSubmitting` must drop here too, not in
        // the `finally`: the ingest watch runs for up to eight minutes, and
        // the modal disables Cancel, disables Upload, and early-returns from
        // its close handler while submitting. Left set, reopening the dialog
        // to upload a second file would trap the member with no exit but a
        // page reload.
        onQueued: () => {
          setPinnedFieldContextId(null)
          setIsSubmitting(false)
        },
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            disabled={!focalFieldContextId}
            className="gp-glass-hover cursor-pointer flex items-center gap-1.5 md:gap-2 pl-3 pr-2 md:pl-5 md:pr-3 h-10 md:h-11 rounded-full gp-glass border border-gp-glass-border hover:border-gp-primary/40 hover:shadow-[0_0_50px_color-mix(in_srgb,var(--gp-primary)_35%,transparent)] transition-all group disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Upload to this field context"
            title="Upload a document or import articles"
          >
            <FileUp className="w-5 h-5 text-amber-600 dark:text-amber-300 transition-colors" />
            <span className="hidden sm:inline text-sm font-semibold text-gp-ink-strong">
              Upload
            </span>
            <span className="material-symbols-outlined text-[18px] leading-none text-gp-ink-muted">
              expand_more
            </span>
          </button>
        </DropdownMenuTrigger>

        {/* Opens upward — the bar is pinned to the bottom of the canvas. */}
        <DropdownMenuContent
          side="top"
          align="center"
          sideOffset={10}
          className="gp-glass w-56 rounded-xl border-gp-glass-border p-1.5"
        >
          <DropdownMenuItem
            onSelect={() => {
              setUploadSessionKey((key) => key + 1)
              setPinnedFieldContextId(focalFieldContextId)
            }}
            // `.gp-menu-item` owns the hover/focus highlight (per the design
            // skill), so neutralise the primitive's own `focus:bg-accent` /
            // `focus:text-accent-foreground` — otherwise the label lands on
            // accent-foreground over gp-menu-item's primary tint.
            className="gp-menu-item cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 focus:bg-transparent focus:text-gp-primary"
          >
            <span className="material-symbols-outlined text-[18px]">
              upload_file
            </span>
            <span className="text-sm font-medium">Upload document</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() =>
              focalFieldContextId &&
              emitOpenImportArticlesModal(focalFieldContextId)
            }
            // `.gp-menu-item` owns the hover/focus highlight (per the design
            // skill), so neutralise the primitive's own `focus:bg-accent` /
            // `focus:text-accent-foreground` — otherwise the label lands on
            // accent-foreground over gp-menu-item's primary tint.
            className="gp-menu-item cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 focus:bg-transparent focus:text-gp-primary"
          >
            <span className="material-symbols-outlined text-[18px]">
              newspaper
            </span>
            <span className="text-sm font-medium">Import articles</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UploadDocumentModal
        key={uploadSessionKey}
        isOpen={pinnedFieldContextId !== null}
        isSubmitting={isSubmitting}
        onClose={() => setPinnedFieldContextId(null)}
        onSubmit={handleSubmit}
      />
    </>
  )
}
