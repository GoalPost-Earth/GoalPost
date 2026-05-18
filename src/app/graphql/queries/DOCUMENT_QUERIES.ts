import { gql } from '@apollo/client'

/**
 * Documents attached to a FieldContext. Slice 1 surfaces them in a small
 * panel on the field detail page so users can see what they've uploaded
 * and which ingest thread each one produced.
 *
 * The resolver enforces space membership before returning rows — non-members
 * get an empty array.
 */
export const GET_DOCUMENTS_BY_FIELD_CONTEXT = gql`
  query DocumentsByFieldContext($fieldContextId: ID!) {
    documentsByFieldContext(fieldContextId: $fieldContextId) {
      id
      filename
      mimeType
      sizeBytes
      uploadedAt
    }
  }
`
