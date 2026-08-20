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
import { GET_DOCUMENTS_BY_FIELD_CONTEXT } from '@/app/graphql/queries/DOCUMENT_QUERIES'
import { GET_FIELD_CONTEXT_DETAILS } from '@/app/graphql/queries/FIELD_CONTEXT_DETAILS_QUERIES'
import { GET_FIELD_CONTEXT_PEOPLE } from '@/app/graphql/queries/FIELD_CONTEXT_PEOPLE_QUERIES'
import { useFieldContextCanEditContent } from '@/hooks/use-field-context-permissions'
import { emitOpenAssistantThread } from '@/lib/simulation/assistant-panel-events'
import { emitOpenImportArticlesModal } from '@/lib/simulation/pulse-creation-events'
import { chatApiAuthHeaders } from '@/lib/simulation/conversation-thread-client'
import { watchDocumentIngest } from '@/lib/ingest/watch-document-ingest'

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
    // clears the pinned id while the ingest watch below is still running.
    const pinnedContextId = pinnedFieldContextId
    setIsSubmitting(true)
    // Declared outside the try so the catch can settle the same toast. Left
    // inside, a throw after the watch started (a refetch rejecting on a network
    // blip) would leave its spinner on screen forever beside a second, separate
    // error toast.
    let watchToastId: string | number | undefined
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
          fieldContextId: pinnedContextId,
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

      // Step 3: tell the server the file is in place. It anchors the Document
      // as PENDING and answers 202 — extraction itself runs in the background
      // worker (GOAL-292), so this returns in milliseconds instead of holding
      // the request open through two LLM calls.
      const processRes = await fetch('/api/ingest/document/process', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          // No documentId: the server derives it from the server-minted
          // blobKey, which is what makes a retry idempotent.
          blobKey: presign.blobKey,
          fieldContextId: pinnedContextId,
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
        documentId?: string
        status?: string
      }

      // The upload itself is done — the file is stored and queued. Release the
      // modal now rather than holding the member on a spinner for the length of
      // an LLM extraction they don't need to watch.
      //
      // `isSubmitting` must drop here too, not in the `finally`: the watch below
      // runs for up to eight minutes, and the modal disables Cancel, disables
      // Upload, and early-returns from its close handler while submitting. Left
      // set, reopening the dialog to upload a second file would trap the member
      // with no exit but a page reload — the opposite of what moving ingestion
      // off the request path is for.
      setPinnedFieldContextId(null)
      setIsSubmitting(false)
      // Show the document (as "Queued") on the page straight away.
      await apolloClient.refetchQueries({
        include: [GET_DOCUMENTS_BY_FIELD_CONTEXT],
      })

      if (!processResult.documentId) {
        // Queued, but we can't follow it. The list still tracks it.
        toast.success('Document uploaded. Extraction will start shortly.')
        return
      }

      // Follow the document to a terminal status, keeping one toast updated in
      // place so the member gets a single evolving line instead of a stack.
      watchToastId = toast.loading(
        'Document uploaded. Reading it and extracting entities…'
      )
      const outcome = await watchDocumentIngest(apolloClient, {
        documentId: processResult.documentId,
        fieldContextId: pinnedContextId,
      })

      if (outcome.state === 'failed') {
        toast.error(
          outcome.message ??
            'We could not read this document. Try re-extracting it from the document list.',
          { id: watchToastId }
        )
        return
      }
      if (outcome.state === 'pending') {
        // Not a failure — still queued or running. The status chip on the
        // document list keeps tracking it from here.
        toast.info(
          'Still extracting — this document is taking a while. The document list will update when it finishes.',
          { id: watchToastId }
        )
        return
      }

      // Refetch the field's pulse + people views so newly-extracted entities
      // appear without a route change. (Documents were refetched by the watch.)
      await apolloClient.refetchQueries({
        include: [GET_FIELD_CONTEXT_DETAILS, GET_FIELD_CONTEXT_PEOPLE],
      })
      if (outcome.threadId) emitOpenAssistantThread(outcome.threadId)

      const created = outcome.createdEntityCount
      const failed = outcome.failedEntityCount
      if (created === 0 && failed === 0) {
        toast.success('Document processed. No entities were extracted.', {
          id: watchToastId,
        })
      } else if (failed === 0) {
        toast.success(
          `Document processed. Created ${created} ${created === 1 ? 'entity' : 'entities'} from it.`,
          { id: watchToastId }
        )
      } else {
        toast.success(
          `Document processed. Created ${created} of ${created + failed} proposed entities; see the ingest thread for failures.`,
          { id: watchToastId }
        )
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed'
      // Replace the watch toast when one is showing, rather than stacking.
      toast.error(message, watchToastId ? { id: watchToastId } : undefined)
      throw error
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
