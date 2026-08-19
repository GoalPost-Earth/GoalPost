import type { ApolloClient } from '@apollo/client'
import { GET_DOCUMENT_INGEST_STATUS } from '@/app/graphql/queries/DOCUMENT_QUERIES'

/**
 * Client-side follow-along for asynchronous document ingestion (GOAL-292).
 *
 * `POST /api/ingest/document/process` now answers 202 as soon as the document
 * is queued, so the upload flow has nothing to await. This polls the documents
 * query — the same one the field page renders — until the worker lands the
 * document in COMPLETE or FAILED, and reports what happened so the caller can
 * raise the right toast and open the ingest thread.
 *
 * Polling (rather than a socket) is the story's chosen v1: it reuses the same
 * membership-gated resolver the page uses and keeps the server stateless. It
 * asks for a NARROW projection (GET_DOCUMENT_INGEST_STATUS) rather than the full
 * document list: each row of that list costs three extra resolver round-trips,
 * so polling it ~160 times per upload would multiply an existing N+1 by the
 * poll count. The on-page status chip still advances on its own while this runs,
 * because Apollo normalises both queries onto the same `Document:<id>` cache
 * entry — the list is watching the very `status` field these polls write.
 *
 * Timing out is explicitly NOT an error. A large document can legitimately sit
 * in the queue behind others; the on-page status chip keeps tracking it after
 * this helper gives up, so the caller should say "still working" rather than
 * "failed".
 */

const POLL_INTERVAL_MS = 3000
/**
 * Worst realistic case: up to a minute waiting for the next cron tick, plus a
 * 300s pipeline, plus slack for a document queued behind others.
 */
const POLL_TIMEOUT_MS = 8 * 60 * 1000

export type DocumentIngestWatchOutcome =
  | {
      state: 'complete'
      threadId: string | null
      createdEntityCount: number
      failedEntityCount: number
    }
  | { state: 'failed'; message: string | null }
  /** Still queued or processing when we stopped watching. */
  | { state: 'pending' }

interface WatchedDocument {
  id: string
  status?: string | null
  statusMessage?: string | null
  ingestCreatedEntityCount?: number | null
  ingestFailedEntityCount?: number | null
  ingestThreads?: { id: string; createdAt: string }[] | null
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Newest ingest thread for the document — the one the worker just created. The
 * query already returns them newest-first, but sorting defensively keeps this
 * correct if that ordering ever changes.
 */
function newestThreadId(document: WatchedDocument): string | null {
  const threads = document.ingestThreads ?? []
  if (threads.length === 0) return null
  const sorted = [...threads].sort((a, b) =>
    String(b.createdAt).localeCompare(String(a.createdAt))
  )
  return sorted[0]?.id ?? null
}

export async function watchDocumentIngest(
  apolloClient: Pick<ApolloClient, 'query'>,
  params: {
    documentId: string
    fieldContextId: string
    /** Injectable for tests; defaults to the real timeout. */
    timeoutMs?: number
  }
): Promise<DocumentIngestWatchOutcome> {
  const deadline = Date.now() + (params.timeoutMs ?? POLL_TIMEOUT_MS)

  while (Date.now() < deadline) {
    await sleep(POLL_INTERVAL_MS)

    let documents: WatchedDocument[] = []
    try {
      const result = await apolloClient.query<{
        documentsByFieldContext: WatchedDocument[]
      }>({
        query: GET_DOCUMENT_INGEST_STATUS,
        variables: { fieldContextId: params.fieldContextId },
        // Must hit the network — the point is to observe a server-side change.
        fetchPolicy: 'network-only',
      })
      documents = result.data?.documentsByFieldContext ?? []
    } catch {
      // A transient network/auth blip should not end the watch — the document
      // is queued server-side regardless. Try again on the next tick.
      continue
    }

    const document = documents.find((d) => d.id === params.documentId)
    // The document vanished (deleted mid-ingest, or read access lost). Nothing
    // left to report on.
    if (!document) return { state: 'pending' }

    if (document.status === 'FAILED') {
      return { state: 'failed', message: document.statusMessage ?? null }
    }
    if (document.status === 'COMPLETE') {
      return {
        state: 'complete',
        threadId: newestThreadId(document),
        createdEntityCount: document.ingestCreatedEntityCount ?? 0,
        failedEntityCount: document.ingestFailedEntityCount ?? 0,
      }
    }
  }

  return { state: 'pending' }
}
