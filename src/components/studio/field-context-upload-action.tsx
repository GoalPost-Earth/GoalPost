'use client'

import { useCallback, useEffect, useRef, useState, type FC } from 'react'
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
import { GET_DOCUMENTS_BY_FIELD_CONTEXT } from '@/app/graphql/queries/DOCUMENT_QUERIES'
import { GET_FIELD_CONTEXT_DETAILS } from '@/app/graphql/queries/FIELD_CONTEXT_DETAILS_QUERIES'
import { GET_FIELD_CONTEXT_PEOPLE } from '@/app/graphql/queries/FIELD_CONTEXT_PEOPLE_QUERIES'
import { useFieldContextCanEditContent } from '@/hooks/use-field-context-permissions'
import { emitOpenAssistantThread } from '@/lib/simulation/assistant-panel-events'
import {
  emitOpenImportArticlesModal,
  onImportArticlesModalClosed,
} from '@/lib/simulation/pulse-creation-events'
import { chatApiAuthHeaders } from '@/lib/simulation/conversation-thread-client'

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
 * (`handleIngestDocument`, GraphQL `@authorization`).
 *
 * The bulk import modal itself is owned by the field-context page (that's
 * where the post-import refetch wiring lives, and it loads the modal
 * dynamically so SheetJS stays out of the dashboard bundle for members who
 * never import); this component only emits the open request.
 *
 * On upload success, fires `emitOpenAssistantThread` with the returned ingest
 * thread id. `StudioShell` listens for this and switches the assistant
 * runtime to the new thread (opening the floating chat panel if needed).
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
  // Both menu items open a modal that installs its own focus trap. Radix
  // restores focus to this menu's trigger ~300ms after the item is chosen —
  // i.e. *after* the dialog has already focused its first control — which
  // dumps keyboard focus onto the button behind the overlay (GOAL-328).
  // Suppress that restore, but only when an item was actually chosen:
  // dismissing the menu with Escape or an outside click must still return
  // focus to the trigger.
  const restoreFocusOnCloseRef = useRef(true)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Because that restore is suppressed, this component owns putting focus
  // back on the trigger once the dialog goes away — otherwise the dialog's
  // trap has nothing live to restore to and focus lands on <body>. The rAF
  // waits for the dialog's own cleanup to run first, so it can't be undone.
  const refocusTrigger = useCallback(() => {
    requestAnimationFrame(() => triggerRef.current?.focus())
  }, [])

  // The bulk import dialog is owned by the field-context page, so this is the
  // only way to learn it closed. Must sit above the early returns below —
  // hooks cannot be called conditionally.
  useEffect(
    () => onImportArticlesModalClosed(refocusTrigger),
    [refocusTrigger]
  )

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
    setIsSubmitting(true)
    try {
      // Fresh bearer token — cookies alone are not enough; the server route
      // honours Authorization first and a stale cookie will 401 where a
      // refreshed bearer succeeds. Mirrors the chat-thread fetch helpers.
      const authHeaders = await chatApiAuthHeaders()

      // Step 1: ask the server for a presigned PUT URL.
      const presignRes = await fetch('/api/ingest/document/presign', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          fieldContextId: pinnedFieldContextId,
          filename: input.filename,
          mimeType: input.mimeType,
          sizeBytes: input.file.size,
        }),
      })
      if (!presignRes.ok) {
        const errorBody = await presignRes.json().catch(() => ({}))
        throw new Error(
          errorBody.error ?? `Presign failed (${presignRes.status})`
        )
      }
      const presign = (await presignRes.json()) as {
        documentId: string
        blobKey: string
        uploadUrl: string
        contentType: string
      }

      // Step 2: PUT the file straight to S3. The bytes never traverse our
      // server. Content-Type MUST match the value used at presign time —
      // S3 binds it into the signature.
      //
      // A non-ok response (4xx/5xx from S3) and a rejected fetch are two
      // different failures. The PUT carries a non-simple Content-Type, so
      // the browser issues a CORS preflight first; if the bucket lacks a
      // CORS policy for this origin the preflight is blocked and fetch
      // rejects with a bare `TypeError: Failed to fetch`. Translate that
      // into something a user can act on instead of leaking it raw.
      let putRes: Response
      try {
        putRes = await fetch(presign.uploadUrl, {
          method: 'PUT',
          body: input.file,
          headers: { 'Content-Type': presign.contentType },
        })
      } catch {
        throw new Error(
          'Upload to storage failed — the storage bucket is unreachable or misconfigured. Please try again or contact support if it persists.'
        )
      }
      if (!putRes.ok) {
        throw new Error(`Upload to storage failed (${putRes.status}).`)
      }

      // Step 3: tell the server the file is in place; it anchors the
      // Document node and kicks off extraction.
      const processRes = await fetch('/api/ingest/document/process', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          documentId: presign.documentId,
          blobKey: presign.blobKey,
          fieldContextId: pinnedFieldContextId,
          filename: input.filename,
          mimeType: input.mimeType,
          sizeBytes: input.file.size,
          hint: input.hint ?? null,
        }),
      })
      if (!processRes.ok) {
        const errorBody = await processRes.json().catch(() => ({}))
        throw new Error(
          errorBody.error ?? `Extraction failed (${processRes.status})`
        )
      }
      const processResult = (await processRes.json()) as {
        threadId?: string
        createdEntityCount?: number
        failedEntityCount?: number
      }

      if (processResult.threadId) {
        emitOpenAssistantThread(processResult.threadId)
      }

      // Refetch the documents + the field's pulse + people views so the
      // dashboard surfaces newly-created entities without a route change.
      await Promise.all([
        apolloClient.refetchQueries({
          include: [
            GET_DOCUMENTS_BY_FIELD_CONTEXT,
            GET_FIELD_CONTEXT_DETAILS,
            GET_FIELD_CONTEXT_PEOPLE,
          ],
        }),
      ])

      const created = processResult.createdEntityCount ?? 0
      const failed = processResult.failedEntityCount ?? 0
      if (created === 0 && failed === 0) {
        toast.success('Document uploaded. No entities were extracted.')
      } else if (failed === 0) {
        toast.success(
          `Document uploaded. Created ${created} ${created === 1 ? 'entity' : 'entities'} from it.`
        )
      } else {
        toast.success(
          `Document uploaded. Created ${created} of ${created + failed} proposed entities; see the ingest thread for failures.`
        )
      }
      setPinnedFieldContextId(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed'
      toast.error(message)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <DropdownMenu
        onOpenChange={(open) => {
          // Re-arm on every open rather than relying on `onCloseAutoFocus`
          // having fired to reset it — that would make the guard depend on
          // Radix internals to stay in sync.
          if (open) restoreFocusOnCloseRef.current = true
        }}
      >
        <DropdownMenuTrigger asChild>
          <button
            ref={triggerRef}
            type="button"
            disabled={!focalFieldContextId}
            className="cursor-pointer flex items-center gap-1.5 md:gap-2 pl-3 pr-2 md:pl-5 md:pr-3 h-10 md:h-11 rounded-full gp-glass dark:gp-glass border border-gp-glass-border hover:bg-gp-ink-strong/10 dark:hover:bg-white/20 hover:border-gp-ink-strong/20 dark:hover:border-white/20 hover:shadow-[0_0_50px_color-mix(in_srgb,var(--gp-primary)_35%,transparent)] transition-all group disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Upload to this field context"
            title="Upload a document or import articles"
          >
            <FileUp className="w-5 h-5 text-amber-300 group-hover:text-amber-200 transition-colors" />
            <span className="hidden sm:inline text-sm font-semibold text-gp-ink-strong dark:text-gp-ink-strong">
              Upload
            </span>
            <span className="material-symbols-outlined text-[18px] leading-none text-gp-ink-muted dark:text-gp-ink-soft">
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
          onCloseAutoFocus={(event) => {
            if (restoreFocusOnCloseRef.current) return
            restoreFocusOnCloseRef.current = true
            event.preventDefault()
          }}
        >
          <DropdownMenuItem
            onSelect={() => {
              if (!focalFieldContextId) return
              restoreFocusOnCloseRef.current = false
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
            onSelect={() => {
              if (!focalFieldContextId) return
              restoreFocusOnCloseRef.current = false
              emitOpenImportArticlesModal(focalFieldContextId)
            }}
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
        isOpen={pinnedFieldContextId !== null}
        isSubmitting={isSubmitting}
        onClose={() => {
          setPinnedFieldContextId(null)
          refocusTrigger()
        }}
        onSubmit={handleSubmit}
      />
    </>
  )
}
