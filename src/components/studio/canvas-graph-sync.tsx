'use client'

import { useEffect, type FC } from 'react'
import { useApolloClient } from '@apollo/client/react'
import { onAssistantGraphDataChanged } from '@/lib/simulation/assistant-panel-events'

/**
 * Keeps the canvas (right side) in sync with writes made through the
 * assistant chat. All assistant writes flow through the one-shot HITL
 * `executeActions` approval path; when such a turn finishes streaming the
 * studio shell emits a `graph-data-changed` event (see
 * `assistant-panel-events`). The server-side Neo4j mutation has already
 * landed by then, but Apollo's cache — which both the Dashboard view and the
 * cache-first Bloom surface read from — is still stale.
 *
 * `refetchQueries({ include: 'active' })` re-runs every query that currently
 * has a live observer. That always includes whatever canvas surface is
 * mounted — the Dashboard route content (kept mounted under
 * `visibility:hidden` by `CanvasHost`, so its queries stay active) and,
 * through the shared cache it populates, the cache-first Bloom surface. It
 * also touches a few non-canvas observers (e.g. the threads sidebar), which
 * is a deliberate trade: assistant writes are rare (one per approved HITL
 * turn), and 'active' stays correct as new canvas queries are added, whereas
 * a named allowlist would silently go stale. The refetch runs in the
 * background — existing data stays on screen until the fresh result swaps in,
 * so the new entity simply appears without a spinner or reload.
 *
 * Mounted once near the top of the studio shell; renders nothing.
 */
export const CanvasGraphSync: FC = () => {
  const client = useApolloClient()

  useEffect(() => {
    return onAssistantGraphDataChanged(() => {
      // A failed background refetch must never surface as an unhandled
      // rejection; log it (a persistent failure usually means an expired
      // token) and let the next write or a manual reload reconcile.
      void client.refetchQueries({ include: 'active' }).catch((err) => {
        console.warn('[canvas-graph-sync] background refetch failed', err)
      })
    })
  }, [client])

  return null
}
