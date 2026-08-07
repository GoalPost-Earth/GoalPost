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
 * Used by the ingest extractor to populate pulse `location` — ResourcePulse
 * since GOAL-283, GoalPulse/StoryPulse since GOAL-316 — so every pulse
 * extracted from an uploaded document links back to the actual file.
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

/** Matches the durable download path, capturing the documentId. */
const DOCUMENT_DOWNLOAD_PATH_RE =
  /^\/api\/ingest\/document\/([^/]+)\/download\/?$/

/**
 * Recognise a stored `location` value that is one of our durable document
 * download locators (GOAL-283) and return a clean, same-origin relative path
 * plus the documentId. Returns `null` for any other location — a physical
 * place, an external source URL (GOAL-285), free text — which callers render
 * as before.
 *
 * Accepts BOTH the absolute form persisted by `buildDocumentDownloadUrl`
 * (`https://<host>/api/ingest/document/<id>/download`) and a bare relative
 * path, matching on the pathname only. That means a deploy-domain change never
 * strands an old link, and — the point of GOAL-302 — the UI can open the file
 * through an opaque "Open document" affordance rather than printing the full
 * URL string verbatim. The host in the stored value is intentionally dropped;
 * we always route through the current origin's relative path.
 */
export function parseDocumentDownloadLocation(
  location: string | null | undefined
): { documentId: string; path: string } | null {
  const trimmed = location?.trim()
  if (!trimmed) return null

  // Reduce absolute URLs to their pathname; a relative path throws (no base),
  // so fall through and match it directly.
  let pathname = trimmed
  try {
    pathname = new URL(trimmed).pathname
  } catch {
    // not an absolute URL — treat the whole string as the path candidate
  }

  const match = DOCUMENT_DOWNLOAD_PATH_RE.exec(pathname)
  if (!match) return null

  // `[^/]+` can capture a lone `%` (free text, a bad re-encode), on which
  // decodeURIComponent throws URIError. This runs in a render path, so a throw
  // would take down the drawer — treat undecodable ids as "not a document link".
  let documentId: string
  try {
    documentId = decodeURIComponent(match[1]).trim()
  } catch {
    return null
  }
  if (!documentId) return null

  return { documentId, path: documentDownloadPath(documentId) }
}

/**
 * Opaque, model-facing stand-in for a durable document-download locator
 * (GOAL-322). The assistant speaks to humans: a raw
 * `https://<host>/api/ingest/document/<id>/download` in chat prose leaks an
 * internal artifact and a raw document id, which kb/07 Rule 1 forbids.
 */
export const ATTACHED_DOCUMENT_LOCATION = 'has an attached document'

/**
 * Shape a stored pulse `location` for anything that hands it to the assistant
 * model (tool results, prompt blocks).
 *
 * A durable document locator becomes {@link ATTACHED_DOCUMENT_LOCATION} — the
 * chat equivalent of the dashboard's opaque "Open document" action (GOAL-302),
 * so the model can convey the fact without printing the URL. Every OTHER
 * location — a physical place, an external source URL (GOAL-285), free text a
 * member typed — passes through byte-for-byte: those ARE the human-readable
 * value, and blanking them would lose real information.
 *
 * Shaping is display-only and lives at the model boundary. The stored property
 * is never rewritten, so the UI keeps rendering its real affordance. (The one
 * write-back risk — a model echoing this phrase into `update_pulse` — is
 * blocked in `updatePulse`.)
 */
export function toAssistantSafeLocation<T extends string | null | undefined>(
  location: T
): T | typeof ATTACHED_DOCUMENT_LOCATION {
  return parseDocumentDownloadLocation(location)
    ? ATTACHED_DOCUMENT_LOCATION
    : location
}
