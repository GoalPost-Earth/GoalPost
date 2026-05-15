/**
 * Document Ingest API
 *
 * POST /api/import/document
 *
 * Accepts unstructured text/markdown/URL ingest and persists it as a
 * source `StoryPulse` linked into the user's active FieldContext. When
 * the caller supplies an active `conversationThreadId`, a
 * `ContextExtraction` event ties the source pulse to the thread so the
 * assistant can answer "where did this pulse come from?" later.
 *
 * Authentication is JWT cookie (mirrors `/api/chat/simulation` and the
 * other ingest endpoints). Authorization is delegated to the service —
 * the caller must `OWNS` the enclosing Space or hold a non-Guest
 * `SpaceMembership`.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { initializeDB, getSession } from '@/app/api/auth/neo4j'
import {
  parseRequestBody,
  verifyJWT,
} from '@/app/api/auth/utils'
import { parseError } from '@/utils'
import {
  ingestDocument,
  type DocumentIngestKind,
} from '@/lib/imports/document-import-service'

export const maxDuration = 60

const documentIngestSchema = z
  .object({
    kind: z.enum(['text', 'markdown', 'url', 'pdf']),
    content: z.string().optional(),
    url: z.string().optional(),
    filename: z.string().max(255).optional(),
    title: z.string().max(255).optional(),
    fieldContextId: z.string().min(1),
    conversationThreadId: z.string().min(1).optional(),
  })
  .refine(
    (v) =>
      v.kind === 'url'
        ? !!v.url
        : v.kind === 'pdf'
          ? !!v.content
          : !!v.content,
    {
      message:
        'Provide `content` for text/markdown/pdf ingest, or `url` for url ingest.',
    }
  )

function resolveUserId(req: NextRequest): string | null {
  const cookieHeader = req.headers.get('cookie') || ''
  const tokenMatch = cookieHeader.match(/(?:^|;\s*)accessToken=([^;]+)/)
  if (!tokenMatch) return null
  try {
    const decoded = verifyJWT(decodeURIComponent(tokenMatch[1])) as {
      user: { id: string }
    }
    return decoded.user.id
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = resolveUserId(request)
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required.' },
        { status: 401 }
      )
    }

    const parsed = await parseRequestBody(request)
    if (!parsed.ok) {
      return NextResponse.json(
        { success: false, error: parsed.error },
        { status: parsed.status }
      )
    }

    const validation = documentIngestSchema.safeParse(parsed.body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: parseError(validation.error) },
        { status: 400 }
      )
    }

    const input = validation.data
    initializeDB()
    const session = getSession()

    try {
      const result = await ingestDocument(session, {
        userId,
        kind: input.kind as DocumentIngestKind,
        content: input.content,
        url: input.url,
        filename: input.filename,
        title: input.title,
        fieldContextId: input.fieldContextId,
        conversationThreadId: input.conversationThreadId,
      })
      return NextResponse.json(
        {
          success: true,
          sourcePulseId: result.sourcePulseId,
          extractionId: result.extractionId,
          excerpt: result.excerpt,
          warning: result.embeddingWarning,
        },
        { status: 200 }
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : parseError(err)
      // Authorization failures: 403. Everything else: 400 so the client
      // shows a useful message rather than a generic 500.
      const isAuth =
        typeof message === 'string' &&
        /permission|do not have|cannot ingest|not own|not found/i.test(message)
      return NextResponse.json(
        { success: false, error: message },
        { status: isAuth ? 403 : 400 }
      )
    } finally {
      await session.close()
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: parseError(error) },
      { status: 500 }
    )
  }
}
