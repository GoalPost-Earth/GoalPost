import { gql } from '@apollo/client'

/**
 * Re-run extraction against an existing Document (slice 6 of GOAL-235).
 * Reuses the stored blob + original userHint. Produces a fresh ingest thread
 * titled "Ingest: <filename> (re-extracted)". Same permission gate as the
 * initial upload (direct-to-S3 REST flow at /api/ingest/document/{presign,process}).
 */
export const RE_EXTRACT_DOCUMENT_MUTATION = gql`
  mutation ReExtractDocument($documentId: ID!) {
    reExtractDocument(documentId: $documentId) {
      documentId
      threadId
      createdEntityCount
      failedEntityCount
    }
  }
`

/**
 * Delete a Document and its backing blob (PRD § Out of Scope keeps
 * extracted entities — Persons + FieldPulses — alive after the Document
 * goes away). Same permission gate as the upload flow.
 */
export const DELETE_DOCUMENT_MUTATION = gql`
  mutation DeleteDocument($documentId: ID!) {
    deleteDocument(documentId: $documentId) {
      documentId
      deleted
    }
  }
`
