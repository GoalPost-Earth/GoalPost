import { driver } from '@/lib/neo4j/driver'
import { verifyJWT } from '@/app/api/auth/utils'
import { handleIngestDocument } from '@/lib/ingest/handle-ingest-document'
import { createOpenAIExtractionModelClient } from '@/lib/ingest/openai-extraction-model-client'
import { createVercelBlobStore } from '@/lib/ingest/vercel-blob-store'

export const maxDuration = 60

const MAX_BYTES = 50 * 1024 // 50KB cap per PRD scope-limits — slice 3 raises this with proper pagecount calc.
const ALLOWED_MIME = new Set<string>(['text/plain'])

function unauthorized(message = 'Authentication required') {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  })
}

function badRequest(message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  })
}

function resolveCurrentUserId(req: Request): string | null {
  const cookieHeader = req.headers.get('cookie') || ''
  const tokenMatch = cookieHeader.match(/(?:^|;\s*)accessToken=([^;]+)/)
  if (!tokenMatch) return null
  try {
    const decoded = verifyJWT(decodeURIComponent(tokenMatch[1])) as {
      user: { id: string }
    }
    return decoded.user.id || null
  } catch {
    return null
  }
}

export async function POST(req: Request) {
  const currentUserId = resolveCurrentUserId(req)
  if (!currentUserId) return unauthorized()

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return badRequest('Expected multipart/form-data with a file part.')
  }

  const file = formData.get('file')
  const fieldContextId = formData.get('fieldContextId')
  const hint = formData.get('hint')

  if (!(file instanceof File)) return badRequest('Missing "file" form part.')
  if (typeof fieldContextId !== 'string' || !fieldContextId.trim()) {
    return badRequest('Missing "fieldContextId" form value.')
  }
  if (file.size > MAX_BYTES) {
    return badRequest(
      `File is too large (${file.size} bytes). Slice 1 supports up to ${MAX_BYTES} bytes.`
    )
  }
  const mimeType = file.type || 'text/plain'
  const mimeRoot = mimeType.split(';')[0].trim().toLowerCase()
  if (!ALLOWED_MIME.has(mimeRoot)) {
    return badRequest(
      `Unsupported mimeType "${mimeRoot}". Slice 1 supports text/plain only.`
    )
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  const result = await handleIngestDocument(
    {
      driver,
      blobStore: createVercelBlobStore(),
      modelClient: createOpenAIExtractionModelClient(),
    },
    {
      currentUserId,
      fieldContextId: fieldContextId.trim(),
      filename: file.name,
      mimeType: mimeRoot,
      buffer,
      hint: typeof hint === 'string' && hint.trim().length > 0 ? hint.trim() : null,
    }
  )

  if (!result.ok) {
    return new Response(JSON.stringify({ error: result.error }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(
    JSON.stringify({
      documentId: result.documentId,
      threadId: result.threadId,
      pendingApprovalCount: result.pendingApprovals.length,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}
