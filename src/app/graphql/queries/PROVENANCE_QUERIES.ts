import { gql } from '@apollo/client'

/**
 * Slice 7 (GOAL-242) — small raw-`gql` queries that fetch the doc-ingestion
 * provenance edge (`extractedFrom: [Document!]!`) for Person and FieldPulse
 * detail views. Kept as a standalone file (and as raw `gql`, not codegen'd
 * `graphql()`) so adding `extractedFrom` to the entity types doesn't churn
 * the typed query maps in `src/gql/`. Document's `@authorization` directive
 * filters non-member viewers automatically — unauthorized callers get an
 * empty list.
 */

export const GET_PERSON_PROVENANCE = gql`
  query PersonProvenance($personId: ID!) {
    people(where: { id_EQ: $personId }) {
      id
      extractedFrom {
        id
        filename
        uploadedAt
        uploadedBy {
          id
          firstName
          lastName
          name
        }
      }
    }
  }
`

export const GET_GOAL_PULSE_PROVENANCE = gql`
  query GoalPulseProvenance($pulseId: ID!) {
    goalPulses(where: { id_EQ: $pulseId }) {
      id
      extractedFrom {
        id
        filename
        uploadedAt
        uploadedBy {
          id
          firstName
          lastName
          name
        }
      }
    }
  }
`

export const GET_RESOURCE_PULSE_PROVENANCE = gql`
  query ResourcePulseProvenance($pulseId: ID!) {
    resourcePulses(where: { id_EQ: $pulseId }) {
      id
      extractedFrom {
        id
        filename
        uploadedAt
        uploadedBy {
          id
          firstName
          lastName
          name
        }
      }
    }
  }
`

export const GET_STORY_PULSE_PROVENANCE = gql`
  query StoryPulseProvenance($pulseId: ID!) {
    storyPulses(where: { id_EQ: $pulseId }) {
      id
      extractedFrom {
        id
        filename
        uploadedAt
        uploadedBy {
          id
          firstName
          lastName
          name
        }
      }
    }
  }
`
