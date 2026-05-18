import type { Session } from 'neo4j-driver'
import { GraphQLError } from 'graphql'
import { driver } from '@/lib/neo4j/driver'
import { handleIngestDocument } from '@/lib/ingest/handle-ingest-document'
import { handleReExtractDocument } from '@/lib/ingest/handle-reextract-document'
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
      const code = result.reason === 'forbidden' ? 'FORBIDDEN' : 'BAD_USER_INPUT'
      throw new GraphQLError(result.error, {
        extensions: { code, reason: result.reason },
      })
    }

    return {
      documentId: result.documentId,
      threadId: result.threadId,
      pendingApprovalCount: result.pendingApprovals.length,
    }
  },

  reExtractDocument: async (
    _parent: unknown,
    args: { documentId: string },
    context: ResolverContext
  ) => {
    const userId = requireUserId(context)
    const documentId = String(args.documentId ?? '').trim()
    if (!documentId) {
      throw new GraphQLError('documentId is required.', {
        extensions: { code: 'BAD_USER_INPUT' },
      })
    }

    const result = await handleReExtractDocument(
      {
        driver,
        blobStore: resolveBlobStore(),
        modelClient: createOpenAIExtractionModelClient(),
      },
      { currentUserId: userId, documentId }
    )

    if (!result.ok) {
      const code =
        result.reason === 'forbidden'
          ? 'FORBIDDEN'
          : result.reason === 'not_found'
            ? 'NOT_FOUND'
            : 'BAD_USER_INPUT'
      throw new GraphQLError(result.error, {
        extensions: { code, reason: result.reason },
      })
    }

    return {
      documentId: result.documentId,
      threadId: result.threadId,
      pendingApprovalCount: result.pendingApprovals.length,
    }
  },
}

/**
 * Field resolvers on the `Document` type. The list query bypasses
 * neo4j-graphql's OGM with a hand-rolled Cypher projection (so the Space
 * membership gate stays inline), which means relationship fields like
 * `extractedPeople`, `extractedPulses`, and `ingestThreads` need their own
 * resolvers — neo4j-graphql doesn't chain @relationship resolvers onto
 * objects produced by a custom Query resolver.
 *
 * Each resolver re-derives state from the source document id; cost is one
 * Cypher round-trip per field per row, which is acceptable for the < 20
 * documents/list expected in v1.
 */
export const documentTypeResolvers = {
  extractedPeople: async (source: { id?: string }) => {
    if (!source?.id) return []
    const session = driver.session()
    try {
      const result = await session.executeRead(async (tx) =>
        tx.run(
          `
          MATCH (p:Person)-[:EXTRACTED_FROM]->(d:Document {id: $documentId})
          RETURN p.id AS id, p.firstName AS firstName, p.lastName AS lastName
          ORDER BY p.firstName ASC
          `,
          { documentId: source.id }
        )
      )
      return result.records.map((r) => ({
        __typename: 'Person',
        id: r.get('id'),
        firstName: r.get('firstName') ?? '',
        lastName: r.get('lastName') ?? '',
      }))
    } finally {
      await session.close()
    }
  },
  extractedPulses: async (source: { id?: string }) => {
    if (!source?.id) return []
    const session = driver.session()
    try {
      const result = await session.executeRead(async (tx) =>
        tx.run(
          `
          MATCH (p:FieldPulse)-[:EXTRACTED_FROM]->(d:Document {id: $documentId})
          RETURN p.id AS id, p.title AS title, labels(p) AS labels
          ORDER BY p.title ASC
          `,
          { documentId: source.id }
        )
      )
      return result.records.map((r) => {
        const labels = (r.get('labels') as string[] | null) ?? []
        const concrete =
          labels.find((l) =>
            ['GoalPulse', 'ResourcePulse', 'StoryPulse', 'CarePulse', 'CoreValuePulse'].includes(l)
          ) ?? 'StoryPulse'
        return {
          __typename: concrete,
          id: r.get('id'),
          title: r.get('title') ?? '',
        }
      })
    } finally {
      await session.close()
    }
  },
  ingestThreads: async (source: { id?: string }) => {
    if (!source?.id) return []
    const session = driver.session()
    try {
      const result = await session.executeRead(async (tx) =>
        tx.run(
          `
          MATCH (d:Document {id: $documentId})-[:HAS_INGEST_THREAD]->(t:ConversationThread)
          RETURN t.id AS id, t.title AS title, toString(t.createdAt) AS createdAt
          ORDER BY t.createdAt DESC
          `,
          { documentId: source.id }
        )
      )
      return result.records.map((r) => ({
        id: r.get('id'),
        title: r.get('title') ?? '',
        createdAt: r.get('createdAt') ?? '',
      }))
    } finally {
      await session.close()
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
  pageCount: number | null
  blobKey: string | null
  blobUrl: string | null
  userHint: string | null
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
            d.pageCount AS pageCount,
            d.blobKey AS blobKey,
            d.blobUrl AS blobUrl,
            d.userHint AS userHint,
            toString(d.uploadedAt) AS uploadedAt
          ORDER BY d.uploadedAt DESC
          `,
          { fieldContextId: args.fieldContextId, userId }
        )
      )
      return result.records.map((r): DocumentRow => {
        const rawPageCount = r.get('pageCount') as number | bigint | null
        return {
          id: r.get('id') as string,
          filename: r.get('filename') as string,
          mimeType: r.get('mimeType') as string,
          sizeBytes: Number(r.get('sizeBytes') ?? 0),
          pageCount: rawPageCount === null ? null : Number(rawPageCount),
          blobKey: (r.get('blobKey') as string | null) ?? null,
          blobUrl: (r.get('blobUrl') as string | null) ?? null,
          userHint: (r.get('userHint') as string | null) ?? null,
          uploadedAt: (r.get('uploadedAt') as string) ?? '',
        }
      })
    } finally {
      await session.close()
    }
  },
}
