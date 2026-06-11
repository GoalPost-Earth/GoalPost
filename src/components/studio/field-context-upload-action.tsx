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
import { GET_DOCUMENTS_BY_FIELD_CONTEXT } from '@/app/graphql/queries/DOCUMENT_QUERIES'
import { GET_FIELD_CONTEXT_DETAILS } from '@/app/graphql/queries/FIELD_CONTEXT_DETAILS_QUERIES'
import { GET_FIELD_CONTEXT_PEOPLE } from '@/app/graphql/queries/FIELD_CONTEXT_PEOPLE_QUERIES'
import { emitOpenAssistantThread } from '@/lib/simulation/assistant-panel-events'
import { chatApiAuthHeaders } from '@/lib/simulation/conversation-thread-client'

/**
 * Studio-shell entry point for document upload (GOAL-235).
 *
 * Renders only when the focal entity is a FieldContext. The server gates
 * the actual upload on `canEditContent` (see `handleIngestDocument`), so
 * showing the button to a non-editor is acceptable — they get an inline
 * error in the modal rather than a hidden control.
 *
 * On success, fires `emitOpenAssistantThread` with the returned ingest
 * thread id. `StudioShell` listens for this and switches the assistant
 * runtime to the new thread (opening the floating chat panel if needed).
 */
export const FieldContextUploadAction: FC = () => {
  const { focalEntity } = useFocalEntity()
  // pinnedFieldContextId is captured on modal open so a focal-entity change
  // mid-flow can't redirect the upload to a different context (or unmount
  // the modal because the focal type is no longer FieldContext). null until
  // the user opens the modal.
  const [pinnedFieldContextId, setPinnedFieldContextId] = useState<string | null>(
    null
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  if (!focalFieldContextId && !pinnedFieldContextId) return null

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
        throw new Error(errorBody.error ?? `Presign failed (${presignRes.status})`)
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
        throw new Error(errorBody.error ?? `Extraction failed (${processRes.status})`)
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
      <button
        type="button"
        onClick={() => setPinnedFieldContextId(focalFieldContextId)}
        disabled={!focalFieldContextId}
        className="cursor-pointer flex items-center gap-2 px-4 md:px-5 h-10 md:h-11 rounded-full gp-glass dark:gp-glass border border-gp-glass-border hover:bg-gp-ink-strong/10 dark:hover:bg-white/20 hover:border-gp-ink-strong/20 dark:hover:border-white/20 hover:shadow-[0_0_50px_color-mix(in_srgb,var(--gp-primary)_35%,transparent)] transition-all group disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Upload document to FieldContext"
        title="Upload document"
      >
        <FileUp className="w-5 h-5 text-amber-300 group-hover:text-amber-200 transition-colors" />
        <span className="hidden sm:inline text-sm font-semibold text-gp-ink-strong dark:text-gp-ink-strong">
          Upload
        </span>
      </button>

      <UploadDocumentModal
        isOpen={pinnedFieldContextId !== null}
        isSubmitting={isSubmitting}
        onClose={() => setPinnedFieldContextId(null)}
        onSubmit={handleSubmit}
      />
    </>
  )
}
