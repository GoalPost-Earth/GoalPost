import { gql } from '@apollo/client'

/**
 * Slice 7 (GOAL-242) — small raw-`gql` queries that fetch the doc-ingestion
 * provenance edge (`extractedFrom: [ResourcePulse!]!`) for Person and
 * FieldPulse detail views.
 *
 * GOAL-354 retired `:Document` — a document IS a ResourcePulse — so this edge
 * now resolves to `ResourcePulse`, where the source file's name is
 * `sourceFilename` and there is no `uploadedAt` (the node's own `createdAt`
 * carries that). These four query blocks still asked for the Document field
 * names, so the whole operation failed GraphQL validation with
 * `Cannot query field "filename" on type "ResourcePulse"` — taking the person
 * and pulse provenance sections down with it, and blocking codegen. GOAL-362
 * caught it while regenerating types.
 *
 * Fixed with ALIASES rather than by renaming downstream: `filename` and
 * `uploadedAt` are the right words for the UI that consumes this
 * (`EntityProvenance` shows a file and when it arrived), and aliasing keeps
 * the repair to this one file instead of churning three components over a
 * storage-layer rename. Kept as a standalone file (and as raw `gql`, not codegen'd
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
        filename: sourceFilename
        uploadedAt: createdAt
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
        filename: sourceFilename
        uploadedAt: createdAt
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
        filename: sourceFilename
        uploadedAt: createdAt
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
        filename: sourceFilename
        uploadedAt: createdAt
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
