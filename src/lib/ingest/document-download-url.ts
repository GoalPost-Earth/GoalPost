/**
 * Durable, auth-scoped reference to an uploaded Document's file.
 *
 * The blob itself only ever has a short-lived presigned GET URL (minted on
 * demand, minutes-long TTL) and an internal `blobKey` — neither is a stable
 * link a member can keep or share. This module builds the ONE durable locator
 * we can safely persist: an app URL keyed on `documentId` that resolves through
 * `GET /api/ingest/document/<id>/download`, which re-checks Space read access on
 * every hit and mints a fresh presigned GET server-side.
 *
 * Used by the ingest extractor to populate `ResourcePulse.location` (GOAL-283)
 * so an uploaded document's Resource always links back to the actual file.
 */

import { resolveAppBaseUrl } from '@/lib/url/app-base-url'

/** Relative app path to the durable download endpoint for a document. */
export function documentDownloadPath(documentId: string): string {
  return `/api/ingest/document/${encodeURIComponent(documentId)}/download`
}

/**
 * Absolute, shareable download URL for a document's file. Persisted into
 * `ResourcePulse.location` at extraction time so the Resource is reachable and
 * shareable long after the upload's presigned PUT URL has expired. Base URL is
 * resolved from server config only (see `resolveAppBaseUrl` — never trusts
 * request headers).
 */
export function buildDocumentDownloadUrl(documentId: string): string {
  return `${resolveAppBaseUrl()}${documentDownloadPath(documentId)}`
}
