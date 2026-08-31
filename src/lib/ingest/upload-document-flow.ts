import type { ApolloClient } from '@apollo/client'
import { toast } from 'sonner'
import { GET_DOCUMENTS_BY_FIELD_CONTEXT } from '@/app/graphql/queries/DOCUMENT_QUERIES'
import { GET_FIELD_CONTEXT_DETAILS } from '@/app/graphql/queries/FIELD_CONTEXT_DETAILS_QUERIES'
import { GET_FIELD_CONTEXT_PEOPLE } from '@/app/graphql/queries/FIELD_CONTEXT_PEOPLE_QUERIES'
import { chatApiAuthHeaders } from '@/lib/simulation/conversation-thread-client'
import { emitOpenAssistantThread } from '@/lib/simulation/assistant-panel-events'
import { watchDocumentIngest } from './watch-document-ingest'

/**
 * The one client-side upload flow for document ingestion (GOAL-337):
 * presign → direct-to-S3 PUT → enqueue → follow the ingest to a terminal
 * status with a single evolving toast, then open the ingest thread.
 *
 * Extracted verbatim from `field-context-upload-action.tsx` so its second
 * entry point — the Pulses-section empty-state CTA on the field-context page —
 * shares it instead of carrying its own copy. The page's copy had drifted:
 * it still expected a `threadId` in the enqueue response (removed when
 * GOAL-292 made ingestion asynchronous), declared success before anything
 * was extracted, and never followed the document to completion. One module
 * means the two entry points can never drift apart again.
 *
 * Both queries this flow polls/refetches are membership-gated server-side;
 * nothing here widens the authorization surface.
 */

export interface UploadDocumentFlowInput {
  filename: string
  mimeType: string
  /** Raw File PUT directly to S3 — the bytes never traverse our server. */
  file: File
  hint?: string
}

/** Narrow structural slice so tests can stub the client like the watch does. */
type UploadFlowApolloClient = Pick<ApolloClient, 'query' | 'refetchQueries'>

export async function runDocumentUploadFlow(
  apolloClient: UploadFlowApolloClient,
  params: {
    fieldContextId: string
    input: UploadDocumentFlowInput
    /**
     * Called the moment the 202 lands — the upload is durable in the queue
     * from here. Callers release their modal and clear their submitting flag
     * in this callback rather than after the flow resolves: the ingest watch
     * below can run for minutes, and holding the modal open through it would
     * trap the member on a spinner they don't need to watch.
     */
    onQueued: () => void
  }
): Promise<void> {
  const { fieldContextId, input, onQueued } = params

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
        fieldContextId,
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

    // Step 2: PUT the file straight to S3. Content-Type MUST match the value
    // used at presign time — S3 binds it into the signature.
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
        fieldContextId,
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

    // The upload itself is done — the file is stored and queued.
    onQueued()
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
      fieldContextId,
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
  }
}
