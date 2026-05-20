'use client'

import { useState, type FC } from 'react'
import { useMutation } from '@apollo/client/react'
import { FileUp } from 'lucide-react'
import { toast } from 'sonner'
import { useFocalEntity } from '@/contexts'
import {
  UploadDocumentModal,
  type UploadDocumentSubmitInput,
} from '@/components/ui/upload-document-modal'
import { UPLOAD_DOCUMENT_MUTATION } from '@/app/graphql/mutations/DOCUMENT_MUTATIONS'
import { GET_DOCUMENTS_BY_FIELD_CONTEXT } from '@/app/graphql/queries/DOCUMENT_QUERIES'
import { emitOpenAssistantThread } from '@/lib/simulation/assistant-panel-events'

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

  const focalFieldContextId =
    focalEntity?.type === 'FieldContext' ? focalEntity.id : null

  const [uploadDocument] = useMutation(UPLOAD_DOCUMENT_MUTATION, {
    refetchQueries: pinnedFieldContextId
      ? [
          {
            query: GET_DOCUMENTS_BY_FIELD_CONTEXT,
            variables: { fieldContextId: pinnedFieldContextId },
          },
        ]
      : undefined,
  })

  if (!focalFieldContextId && !pinnedFieldContextId) return null

  const handleSubmit = async (input: UploadDocumentSubmitInput) => {
    if (!pinnedFieldContextId) {
      toast.error('Upload context lost — please reopen the upload dialog.')
      throw new Error('No pinned FieldContext')
    }
    setIsSubmitting(true)
    try {
      const result = await uploadDocument({
        variables: {
          input: {
            fieldContextId: pinnedFieldContextId,
            filename: input.filename,
            mimeType: input.mimeType,
            fileBase64: input.fileBase64,
            hint: input.hint,
          },
        },
      })
      const threadId = (
        result.data as { uploadDocument?: { threadId?: string } } | null | undefined
      )?.uploadDocument?.threadId
      if (threadId) emitOpenAssistantThread(threadId)
      toast.success(
        'Document uploaded. Review the extracted entities in the assistant.'
      )
      setPinnedFieldContextId(null)
    } catch (error) {
      // Inline error rendering is handled by the modal (it catches and
      // sets local error state). The toast is the secondary signal —
      // matches the legacy field-context page handler.
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
