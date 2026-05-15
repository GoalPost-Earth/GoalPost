/**
 * Document ingest service.
 *
 * Robert's framing on the May follow-up call: the active conversation
 * thread is the container, not the document. When a user ingests a
 * document inside a chat thread we persist the source as a single
 * `StoryPulse` carrying `sourceUri` / `sourceFilename` / `sourceMimeType`
 * / `sourceUploadedAt`, and we record a `ContextExtraction` event
 * linking the source to the active thread so the assistant can answer
 * "where did this pulse come from?" later.
 *
 * Supported source kinds:
 *
 *   - `text` / `markdown` — content passed inline (paste box or upload
 *     decoded client-side).
 *   - `url` — server fetches, strips HTML tags to text.
 *   - `pdf` — `pdf-parse` extracts text from a base64-encoded buffer.
 *
 * What we DO NOT do here yet (out of scope for this slice):
 *
 *   - LLM-driven extraction of child FieldPulses from the document.
 *     The source StoryPulse is enough for the agent's `graph_rag_search`
 *     to find it via the pulse embedding. Atomic child-pulse extraction
 *     is its own larger ticket.
 *
 * Authorization: caller must `OWNS` the target Space or hold a `MEMBER`
 * / `ADMIN` `SpaceMembership` (Guest cannot ingest) — same rule as the
 * spreadsheet path in `csv-import-service.ts`.
 */

import { randomUUID } from 'node:crypto'
import type { Session } from 'neo4j-driver'
import { PDFParse } from 'pdf-parse'
import { canEditContent } from '@/lib/permissions/space-permissions'
import { generatePulseEmbeddings } from '@/lib/resonance/embeddings/pulse-embedder'
import { createLog } from '@/lib/activity-logs/create-log'
import {
  assertOwnsThread,
  recordContextExtraction,
} from './context-extraction'

export type DocumentIngestKind = 'text' | 'markdown' | 'url' | 'pdf'

export interface DocumentIngestRequest {
  /** Authenticated user driving the ingest. */
  userId: string
  /** What kind of source we're ingesting. */
  kind: DocumentIngestKind
  /**
   * Inline source content — required for `text` / `markdown` / `pdf`.
   * For PDF this would be base64; we currently reject before reading.
   */
  content?: string
  /** Source URL — required for `url` kind. */
  url?: string
  /** Original filename — surfaced as `StoryPulse.sourceFilename`. */
  filename?: string
  /** User-supplied title; falls back to filename / URL / first line. */
  title?: string
  /** Active FieldContext from the chat surface. Required. */
  fieldContextId: string
  /** Optional active thread to scope the extraction event to. */
  conversationThreadId?: string
}

export interface DocumentIngestResult {
  sourcePulseId: string
  extractionId: string | null
  excerpt: string
  embeddingWarning?: string
}

const MAX_INLINE_BYTES = 2 * 1024 * 1024 // 2MB — keep us out of fetch limits
const URL_FETCH_TIMEOUT_MS = 15_000

function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Quick-and-dirty HTML → text. Not a full extractor — strips tags, decodes
 * the most common entities, normalises whitespace. Enough for blog posts /
 * grant documents in the Monday demo. Replace with `@mozilla/readability`
 * + `jsdom` when we install those.
 */
function htmlToText(html: string): string {
  const noScripts = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
  const stripped = noScripts.replace(/<[^>]+>/g, ' ')
  const decoded = stripped
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&hellip;/g, '…')
  return decoded.replace(/\s+/g, ' ').trim()
}

async function fetchUrlContent(url: string): Promise<{
  text: string
  mimeType: string
}> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), URL_FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        // Identify ourselves so Anthony Alcaraz-style hosts that gate
        // unidentified bots return real content. No spoofing.
        'User-Agent': 'GoalPostDocumentIngest/1.0',
        Accept: 'text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5',
      },
      redirect: 'follow',
    })
    if (!res.ok) {
      throw new Error(`Source URL responded ${res.status}.`)
    }
    const mimeType = (res.headers.get('content-type') ?? '').split(';')[0].trim()
    const raw = await res.text()
    if (raw.length > MAX_INLINE_BYTES) {
      throw new Error(
        `Source page exceeded ${Math.round(
          MAX_INLINE_BYTES / 1024
        )} KB; ingest is capped to keep page-load fetches honest.`
      )
    }
    const looksHtml =
      mimeType.includes('html') || /<html\b|<body\b/i.test(raw.slice(0, 256))
    return {
      text: looksHtml ? htmlToText(raw) : raw,
      mimeType: mimeType || (looksHtml ? 'text/html' : 'text/plain'),
    }
  } finally {
    clearTimeout(t)
  }
}

function resolveTitle(input: DocumentIngestRequest, fallback: string): string {
  if (input.title?.trim()) return input.title.trim().slice(0, 200)
  if (input.filename?.trim()) return input.filename.trim().slice(0, 200)
  if (input.kind === 'url' && input.url) {
    try {
      return new URL(input.url).hostname + new URL(input.url).pathname.slice(0, 80)
    } catch {
      return input.url.slice(0, 200)
    }
  }
  const firstLine = fallback.split('\n').find((l) => l.trim().length > 0) ?? ''
  return (firstLine || 'Ingested document').slice(0, 200)
}

function resolveFilename(input: DocumentIngestRequest): string | null {
  if (input.filename?.trim()) return input.filename.trim().slice(0, 200)
  if (input.kind === 'url' && input.url) {
    try {
      const u = new URL(input.url)
      const last = u.pathname.split('/').filter(Boolean).pop()
      return last || u.hostname
    } catch {
      return null
    }
  }
  return null
}

/**
 * Verify the caller can write into the FieldContext's enclosing Space.
 * Throws on deny. Pulse / FieldContext authorization flows up to the
 * Space per kb/02-user-roles.md.
 */
async function assertCanIngestIntoContext(
  session: Session,
  userId: string,
  fieldContextId: string
): Promise<{ spaceId: string }> {
  const rows = await session.run(
    `
    MATCH (ctx:FieldContext {id: $fieldContextId})<-[:HAS_CONTEXT]-(space:Space)
    RETURN space.id AS spaceId LIMIT 1
    `,
    { fieldContextId }
  )
  const spaceId = rows.records[0]?.get('spaceId') as string | undefined
  if (!spaceId) {
    throw new Error(
      'Target FieldContext could not be located. It may have been deleted.'
    )
  }
  const allowed = await canEditContent(session, userId, spaceId)
  if (!allowed) {
    throw new Error(
      'You do not have permission to ingest into that FieldContext. Owners, admins, and members can ingest; guests cannot.'
    )
  }
  return { spaceId }
}

/**
 * Resolve raw text content for the ingest from the supplied source.
 * Centralises the kind-by-kind handling so the main flow stays narrow.
 */
async function resolveSourceContent(
  input: DocumentIngestRequest
): Promise<{ text: string; mimeType: string; sourceUri: string | null }> {
  if (input.kind === 'pdf') {
    if (!input.content?.trim()) {
      throw new Error(
        'PDF ingest requires a base64-encoded file in the `content` field.'
      )
    }
    // Decode base64 to a Buffer. We deliberately check the decoded size
    // (not the base64 length) against the inline cap so the comparison
    // mirrors the URL fetch path.
    let buffer: Buffer
    try {
      buffer = Buffer.from(input.content, 'base64')
    } catch (err) {
      throw new Error(
        `PDF content could not be decoded as base64: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`
      )
    }
    if (buffer.byteLength > MAX_INLINE_BYTES) {
      throw new Error(
        `PDF exceeded ${Math.round(
          MAX_INLINE_BYTES / 1024
        )} KB. Trim or split into separate ingests.`
      )
    }
    // pdf-parse v2 is class-based: construct with the buffer, call
    // getText(), then dispose. The constructor converts Node `Buffer` to
    // `Uint8Array` internally; we still pass `Buffer` for clarity.
    let extracted: string
    const parser = new PDFParse({ data: buffer })
    try {
      const result = await parser.getText()
      extracted = result.text
    } catch (err) {
      throw new Error(
        `Failed to parse PDF: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`
      )
    } finally {
      await parser.destroy().catch(() => {
        /* destroy failures are non-fatal */
      })
    }
    const text = extracted.replace(/\s+\n/g, '\n').replace(/[ \t]+/g, ' ').trim()
    if (!text) {
      throw new Error(
        'The PDF contained no extractable text — it may be scanned images. OCR is not yet supported.'
      )
    }
    return { text, mimeType: 'application/pdf', sourceUri: null }
  }
  if (input.kind === 'url') {
    if (!input.url || !isHttpUrl(input.url)) {
      throw new Error('A valid http(s) URL is required for url ingest.')
    }
    const { text, mimeType } = await fetchUrlContent(input.url)
    if (!text.trim()) {
      throw new Error('The fetched page contained no readable text.')
    }
    return { text, mimeType, sourceUri: input.url }
  }
  // text / markdown
  if (!input.content?.trim()) {
    throw new Error(
      'Content is required for text and markdown ingest. Paste the document body, or pass a URL.'
    )
  }
  if (input.content.length > MAX_INLINE_BYTES) {
    throw new Error(
      `Inline content exceeded ${Math.round(
        MAX_INLINE_BYTES / 1024
      )} KB. Trim it down or split into separate ingests.`
    )
  }
  return {
    text: input.content,
    mimeType: input.kind === 'markdown' ? 'text/markdown' : 'text/plain',
    sourceUri: null,
  }
}

/**
 * Create the source `StoryPulse` carrying the document and link it into
 * the active FieldContext. Returns the new pulse id.
 *
 * The `EXTRACTED_FROM` reverse-edge from child FieldPulses is reserved
 * for the future LLM-extraction pass (separate ticket). For now the
 * source StoryPulse stands on its own.
 */
async function createSourceStoryPulse(
  session: Session,
  params: {
    userId: string
    fieldContextId: string
    title: string
    content: string
    sourceUri: string | null
    sourceMimeType: string
    sourceFilename: string | null
  }
): Promise<string> {
  const pulseId = `pulse_${Date.now()}_${randomUUID().slice(0, 8)}`
  const now = new Date().toISOString()
  await session.run(
    `
    MATCH (user:Person {id: $userId})
    MATCH (ctx:FieldContext {id: $fieldContextId})
    CREATE (sp:FieldPulse:StoryPulse {
      id: $pulseId,
      title: $title,
      content: $content,
      createdAt: datetime($now),
      intensity: 1.0,
      sourceUri: $sourceUri,
      sourceMimeType: $sourceMimeType,
      sourceFilename: $sourceFilename,
      sourceUploadedAt: datetime($now)
    })
    CREATE (sp)-[:CREATED_BY]->(user)
    CREATE (ctx)-[:HAS_PULSE]->(sp)
    `,
    {
      userId: params.userId,
      fieldContextId: params.fieldContextId,
      pulseId,
      title: params.title,
      content: params.content,
      now,
      sourceUri: params.sourceUri,
      sourceMimeType: params.sourceMimeType,
      sourceFilename: params.sourceFilename,
    }
  )
  return pulseId
}

/**
 * Main entry point. Hands back the source pulse id and (if a thread was
 * passed) the extraction event id so the caller can surface "saved to
 * thread X" UX.
 */
export async function ingestDocument(
  session: Session,
  input: DocumentIngestRequest
): Promise<DocumentIngestResult> {
  // 1. Authorize.
  await assertCanIngestIntoContext(session, input.userId, input.fieldContextId)
  if (input.conversationThreadId) {
    await assertOwnsThread(session, input.userId, input.conversationThreadId)
  }

  // 2. Resolve content.
  const { text, mimeType, sourceUri } = await resolveSourceContent(input)
  const title = resolveTitle(input, text)
  const filename = resolveFilename(input)

  // 3. Persist source StoryPulse.
  const sourcePulseId = await createSourceStoryPulse(session, {
    userId: input.userId,
    fieldContextId: input.fieldContextId,
    title,
    content: text,
    sourceUri,
    sourceMimeType: mimeType,
    sourceFilename: filename,
  })

  // 4. Generate embedding — best-effort. Embedding failure must not
  // abandon the document the user just ingested; we surface it as a
  // warning instead.
  let embeddingWarning: string | undefined
  try {
    await generatePulseEmbeddings(sourcePulseId)
  } catch (err) {
    embeddingWarning = `Document saved, but embedding generation failed: ${
      err instanceof Error ? err.message : 'Unknown error'
    }`
  }

  // 5. Record the extraction event (thread-scoped).
  let extractionId: string | null = null
  if (input.conversationThreadId) {
    const sourceLabel = filename ?? sourceUri ?? title
    const extractorKind: 'text' | 'pdf' | 'url' =
      input.kind === 'url' ? 'url' : input.kind === 'pdf' ? 'pdf' : 'text'
    const event = await recordContextExtraction(session, {
      userId: input.userId,
      conversationThreadId: input.conversationThreadId,
      pulseIds: [sourcePulseId],
      sourceLabel,
      extractorKind,
      sourceStoryPulseId: sourcePulseId,
    })
    extractionId = event.extractionId

    await createLog({
      userId: input.userId,
      description: `Ingested "${sourceLabel}" into the active thread.`,
      pulseIds: [sourcePulseId],
      metadata: {
        source: 'document-ingest',
        kind: input.kind,
        conversationThreadId: input.conversationThreadId,
        fieldContextId: input.fieldContextId,
        extractionId,
        sourcePulseId,
      },
    })
  } else {
    // No thread — still log so the activity feed shows the ingest.
    await createLog({
      userId: input.userId,
      description: `Ingested "${filename ?? sourceUri ?? title}".`,
      pulseIds: [sourcePulseId],
      metadata: {
        source: 'document-ingest',
        kind: input.kind,
        fieldContextId: input.fieldContextId,
        sourcePulseId,
      },
    })
  }

  return {
    sourcePulseId,
    extractionId,
    excerpt: text.slice(0, 240),
    embeddingWarning,
  }
}
