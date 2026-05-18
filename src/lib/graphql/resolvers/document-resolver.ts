import type { Session } from 'neo4j-driver'
import { GraphQLError } from 'graphql'
import { driver } from '@/lib/neo4j/driver'
import { handleIngestDocument } from '@/lib/ingest/handle-ingest-document'
import { validateUploadDocumentInput } from '@/lib/ingest/upload-document-input'
import { createOpenAIExtractionModelClient } from '@/lib/ingest/openai-extraction-model-client'
import { createVercelBlobStore } from '@/lib/ingest/vercel-blob-store'
import { createMemoryBlobStore } from '@/lib/ingest/blob-store'

/**
 * GraphQL surface for the doc-ingestion epic.
 *
 *   mutation uploadDocument(input: UploadDocumentInput!) -> IngestDocumentResponse
 *   query documentsByFieldContext(fieldContextId: ID!) -> [Document!]!
 *
 * The mutation is a thin shell around `handleIngestDocument` (slice 1) — all
 * orchestration, permission, and shape-contract logic stays in that
 * library. Input validation is delegated to `validateUploadDocumentInput`.
 *
 * Vercel Blob is the production blob backend; until BLOB_READ_WRITE_TOKEN is
 * wired the stub throws on first call. Set INGEST_BLOB_BACKEND=memory to
 * force the in-process store (useful for local end-to-end smoke tests).
 */

interface UploadDocumentArgs {
  input: {
    fieldContextId: string
    filename: string
    mimeType: string
    fileBase64: string
    hint?: string | null
  }
}

interface ResolverContext {
  jwt?: { user?: { id?: string } }
  executionContext?: { session?: () => Session }
}

function resolveBlobStore() {
  if (process.env.INGEST_BLOB_BACKEND === 'memory') {
    return createMemoryBlobStore()
  }
  return createVercelBlobStore()
}

function requireUserId(context: ResolverContext): string {
  const userId = context.jwt?.user?.id?.trim() || ''
  if (!userId) {
    throw new GraphQLError('Authentication required.', {
      extensions: { code: 'UNAUTHENTICATED' },
    })
  }
  return userId
}

export const documentMutations = {
  uploadDocument: async (
    _parent: unknown,
    args: UploadDocumentArgs,
    context: ResolverContext
  ) => {
    const userId = requireUserId(context)

    const validation = validateUploadDocumentInput(args.input)
    if (!validation.ok) {
      throw new GraphQLError(validation.error, {
        extensions: { code: 'BAD_USER_INPUT' },
      })
    }
    const parsed = validation.parsed

    const result = await handleIngestDocument(
      {
        driver,
        blobStore: resolveBlobStore(),
        modelClient: createOpenAIExtractionModelClient(),
      },
      {
        currentUserId: userId,
        fieldContextId: parsed.fieldContextId,
        filename: parsed.filename,
        mimeType: parsed.mimeType,
        buffer: parsed.buffer,
        hint: parsed.hint,
      }
    )

    if (!result.ok) {
      throw new GraphQLError(result.error, {
        extensions: { code: 'FORBIDDEN' },
      })
    }

    return {
      documentId: result.documentId,
      threadId: result.threadId,
      pendingApprovalCount: result.pendingApprovals.length,
    }
  },
}

interface DocumentsByFieldContextArgs {
  fieldContextId: string
}

interface DocumentRow {
  id: string
  filename: string
  mimeType: string
  sizeBytes: number
  blobKey: string | null
  blobUrl: string | null
  uploadedAt: string
}

export const documentQueries = {
  documentsByFieldContext: async (
    _parent: unknown,
    args: DocumentsByFieldContextArgs,
    context: ResolverContext
  ) => {
    const userId = requireUserId(context)

    const session = driver.session()
    try {
      const result = await session.executeRead(async (tx) =>
        tx.run(
          `
          MATCH (space:Space)-[:HAS_CONTEXT]->(c:FieldContext {id: $fieldContextId})
          OPTIONAL MATCH (owner:Person {id: $userId})-[:OWNS]->(space)
          OPTIONAL MATCH (space)-[:HAS_MEMBER]->(:SpaceMembership)-[:IS_MEMBER]->(member:Person {id: $userId})
          WITH c, (owner IS NOT NULL OR member IS NOT NULL) AS allowed
          WHERE allowed
          MATCH (c)-[:HAS_DOCUMENT]->(d:Document)
          RETURN
            d.id AS id,
            d.filename AS filename,
            d.mimeType AS mimeType,
            d.sizeBytes AS sizeBytes,
            d.blobKey AS blobKey,
            d.blobUrl AS blobUrl,
            toString(d.uploadedAt) AS uploadedAt
          ORDER BY d.uploadedAt DESC
          `,
          { fieldContextId: args.fieldContextId, userId }
        )
      )
      return result.records.map(
        (r): DocumentRow => ({
          id: r.get('id') as string,
          filename: r.get('filename') as string,
          mimeType: r.get('mimeType') as string,
          sizeBytes: Number(r.get('sizeBytes') ?? 0),
          blobKey: (r.get('blobKey') as string | null) ?? null,
          blobUrl: (r.get('blobUrl') as string | null) ?? null,
          uploadedAt: (r.get('uploadedAt') as string) ?? '',
        })
      )
    } finally {
      await session.close()
    }
  },
}
