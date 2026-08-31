import { gql } from '@apollo/client'

/**
 * Documents attached to a FieldContext. Slice 1 surfaces them in a small
 * panel on the field detail page so users can see what they've uploaded
 * and which ingest thread each one produced.
 *
 * The resolver enforces space membership before returning rows — non-members
 * get an empty array.
 *
 * GOAL-292: also carries the ingest lifecycle (`status`, `statusMessage`, entity
 * counts) so the list can show a Queued / Extracting / Failed chip per row.
 * Following one upload to completion uses GET_DOCUMENT_INGEST_STATUS instead —
 * see the note on that query.
 */
export const GET_DOCUMENTS_BY_FIELD_CONTEXT = gql`
  query DocumentsByFieldContext($fieldContextId: ID!) {
    documentsByFieldContext(fieldContextId: $fieldContextId) {
      id
      filename
      mimeType
      sizeBytes
      pageCount
      userHint
      summary
      concepts
      uploadedAt
      status
      statusMessage
      ingestCreatedEntityCount
      ingestFailedEntityCount
      extractedPeople {
        id
        firstName
        lastName
      }
      extractedPulses {
        __typename
        id
        title
      }
      ingestThreads {
        id
        title
        createdAt
      }
    }
  }
`

/**
 * Narrow projection for following one document's ingest to a terminal status
 * (GOAL-292). Deliberately NOT the full list query: `watchDocumentIngest` polls
 * every 3s for up to 8 minutes, and each row of the list query costs three
 * extra round-trips (`extractedPeople`, `extractedPulses`, `ingestThreads` are
 * separate resolvers), so polling the list would multiply an existing N+1 by
 * ~160 per upload. This selects only what the watch decides on, plus the ingest
 * thread it needs to open when the run lands.
 */
export const GET_DOCUMENT_INGEST_STATUS = gql`
  query DocumentIngestStatus($fieldContextId: ID!) {
    documentsByFieldContext(fieldContextId: $fieldContextId) {
      id
      status
      statusMessage
      ingestCreatedEntityCount
      ingestFailedEntityCount
      ingestThreads {
        id
        createdAt
      }
    }
  }
`
