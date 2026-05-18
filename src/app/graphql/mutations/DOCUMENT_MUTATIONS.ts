import { gql } from '@apollo/client'

/**
 * Upload a source document into a FieldContext (slice 1 of GOAL-235).
 *
 * The mutation:
 *   1. Persists a Document node + HAS_DOCUMENT / UPLOADED_BY edges,
 *   2. Stores the file bytes in blob storage,
 *   3. Runs entity extraction in a fresh ConversationThread titled
 *      "Ingest: <filename>",
 *   4. Pre-stages HITL tool calls in that thread for user approval.
 *
 * The returned `threadId` is what the assistant panel should switch to so
 * the user can review and approve the extracted entities.
 */
export const UPLOAD_DOCUMENT_MUTATION = gql`
  mutation UploadDocument($input: UploadDocumentInput!) {
    uploadDocument(input: $input) {
      documentId
      threadId
      pendingApprovalCount
    }
  }
`
