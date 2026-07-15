import type { Session } from 'neo4j-driver'
import { GraphQLError } from 'graphql'
import { driver } from '@/lib/neo4j/driver'
import { handleReExtractDocument } from '@/lib/ingest/handle-reextract-document'
import { createOpenAIExtractionModelClient } from '@/lib/ingest/openai-extraction-model-client'
import { createGeminiExtractionModelClient } from '@/lib/ingest/gemini-extraction-model-client'
import {
  createOpenAIDocumentSummarizer,
  createGeminiDocumentSummarizer,
} from '@/lib/ingest/document-summarizer'
import { createS3BlobStore } from '@/lib/ingest/s3-blob-store'
import { createMemoryBlobStore } from '@/lib/ingest/blob-store'
import { handleDeleteDocument } from '@/lib/ingest/handle-delete-document'
import { buildDocumentDownloadUrl } from '@/lib/ingest/document-download-url'

/**
 * GraphQL surface for the doc-ingestion epic.
 *
 *   mutation reExtractDocument(documentId: ID!) -> IngestDocumentResponse
 *   mutation deleteDocument(documentId: ID!) -> DocumentDeleted
 *   query documentsByFieldContext(fieldContextId: ID!) -> [Document!]!
 *
 * The initial-upload mutation has been replaced by the REST direct-to-S3
 * flow at POST /api/ingest/document/presign + /process — the browser
 * uploads the file straight to S3 and only then triggers extraction. The
 * GraphQL surface here is for post-upload operations only.
 */

interface ResolverContext {
  jwt?: { user?: { id?: string } }
  executionContext?: { session?: () => Session }
}

function resolveBlobStore() {
  if (process.env.INGEST_BLOB_BACKEND === 'memory') {
    return createMemoryBlobStore()
  }
  return createS3BlobStore()
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
        pdfExtractionClient: createGeminiExtractionModelClient(),
        textExtractionClient: createOpenAIExtractionModelClient(),
        pdfSummarizerClient: createGeminiDocumentSummarizer(),
        textSummarizerClient: createOpenAIDocumentSummarizer(),
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
      createdEntityCount: result.executedToolCalls.filter(
        (c) => c.result.success !== false
      ).length,
      failedEntityCount: result.executedToolCalls.filter(
        (c) => c.result.success === false
      ).length,
    }
  },

  deleteDocument: async (
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

    // Orchestrator does gate + Log + DETACH DELETE in a single
    // transaction, then a best-effort blob cleanup. A missing document and
    // a forbidden access return the same `forbidden` failure to avoid
    // leaking document existence to non-members.
    const result = await handleDeleteDocument(
      { driver, blobStore: resolveBlobStore() },
      { currentUserId: userId, documentId }
    )

    if (!result.ok) {
      const code =
        result.reason === 'forbidden' ? 'FORBIDDEN' : 'BAD_USER_INPUT'
      throw new GraphQLError(result.error, {
        extensions: { code, reason: result.reason },
      })
    }

    return { documentId: result.documentId, deleted: true }
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
  /**
   * GOAL-283: the durable, Space-scoped link to open/download the uploaded
   * file. Computed from the document id — the route re-checks access and mints
   * a fresh presigned URL on every hit, so we never persist an expiring URL.
   * Deriving it (rather than storing an absolute URL on the node) also avoids
   * baking the current deploy domain into the graph.
   */
  downloadUrl: (source: { id?: string }): string | null =>
    source?.id ? buildDocumentDownloadUrl(source.id) : null,
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
  userHint: string | null
  summary: string | null
  concepts: string[]
  uploadedAt: string
  status: string
  failureReason: string | null
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
            d.userHint AS userHint,
            d.summary AS summary,
            d.concepts AS concepts,
            toString(d.uploadedAt) AS uploadedAt,
            coalesce(d.status, 'COMPLETE') AS status,
            d.failureReason AS failureReason
          ORDER BY d.uploadedAt DESC
          `,
          { fieldContextId: args.fieldContextId, userId }
        )
      )
      return result.records.map((r): DocumentRow => {
        const rawPageCount = r.get('pageCount') as number | bigint | null
        const rawConcepts = r.get('concepts') as string[] | null
        return {
          id: r.get('id') as string,
          filename: r.get('filename') as string,
          mimeType: r.get('mimeType') as string,
          sizeBytes: Number(r.get('sizeBytes') ?? 0),
          pageCount: rawPageCount === null ? null : Number(rawPageCount),
          userHint: (r.get('userHint') as string | null) ?? null,
          summary: (r.get('summary') as string | null) ?? null,
          concepts: Array.isArray(rawConcepts) ? rawConcepts : [],
          uploadedAt: (r.get('uploadedAt') as string) ?? '',
          status: (r.get('status') as string) ?? 'COMPLETE',
          failureReason: (r.get('failureReason') as string | null) ?? null,
        }
      })
    } finally {
      await session.close()
    }
  },
}
