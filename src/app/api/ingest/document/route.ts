import { driver } from '@/lib/neo4j/driver'
import { verifyJWT } from '@/app/api/auth/utils'
import { handleIngestDocument } from '@/lib/ingest/handle-ingest-document'
import { createOpenAIExtractionModelClient } from '@/lib/ingest/openai-extraction-model-client'
import { createVercelBlobStore } from '@/lib/ingest/vercel-blob-store'
import { createMemoryBlobStore } from '@/lib/ingest/blob-store'
import { validateUploadDocumentInput } from '@/lib/ingest/upload-document-input'

export const maxDuration = 60

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

function resolveBlobStore() {
  if (process.env.INGEST_BLOB_BACKEND === 'memory') {
    return createMemoryBlobStore()
  }
  return createVercelBlobStore()
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

  // Re-use the GraphQL-side validator so REST and GraphQL share size/mime gates.
  const fileBase64 = Buffer.from(await file.arrayBuffer()).toString('base64')
  const validation = validateUploadDocumentInput({
    fieldContextId: fieldContextId.trim(),
    filename: file.name,
    mimeType: file.type || 'text/plain',
    fileBase64,
    hint: typeof hint === 'string' ? hint : null,
  })
  if (!validation.ok) return badRequest(validation.error)

  const result = await handleIngestDocument(
    {
      driver,
      blobStore: resolveBlobStore(),
      modelClient: createOpenAIExtractionModelClient(),
    },
    {
      currentUserId,
      fieldContextId: validation.parsed.fieldContextId,
      filename: validation.parsed.filename,
      mimeType: validation.parsed.mimeType,
      buffer: validation.parsed.buffer,
      hint: validation.parsed.hint,
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
