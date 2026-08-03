import { graphql } from '@/gql'

/**
 * Create a new FieldContext (field) and optionally link it to a Space (MeSpace or WeSpace)
 *
 * @example
 * // Create field without linking to space
 * createFieldContexts({
 *   variables: {
 *     input: [{
 *       title: "Deep Work",
 *       createdAt: new Date().toISOString()
 *     }]
 *   }
 * })
 *
 * Note: To link to a space, use meSpace or weSpace fields in the input:
 * createFieldContexts({
 *   variables: {
 *     input: [{
 *       title: "Deep Work",
 *       createdAt: new Date().toISOString(),
 *       meSpace: { connect: [{ where: { node: { id_EQ: "space_id" } } }] }
 *     }]
 *   }
 * })
 */
export const CREATE_FIELD_CONTEXT_MUTATION = graphql(`
  mutation CreateFieldContext($input: [FieldContextCreateInput!]!) {
    createFieldContexts(input: $input) {
      fieldContexts {
        id
        title
        emergentName
        createdAt
        meSpace {
          id
          name
          visibility
          createdAt
        }
        weSpace {
          id
          name
          visibility
          createdAt
        }
      }
      info {
        nodesCreated
        relationshipsCreated
      }
    }
  }
`)

/**
 * Update an existing FieldContext
 */
export const UPDATE_FIELD_CONTEXT_MUTATION = graphql(`
  mutation UpdateFieldContext(
    $where: FieldContextWhere!
    $update: FieldContextUpdateInput!
  ) {
    updateFieldContexts(where: $where, update: $update) {
      fieldContexts {
        id
        title
        emergentName
        createdAt
        meSpace {
          id
          name
          visibility
        }
        weSpace {
          id
          name
          visibility
        }
      }
      info {
        nodesCreated
        nodesDeleted
        relationshipsCreated
        relationshipsDeleted
      }
    }
  }
`)

/**
 * Delete a FieldContext by ID (GOAL-319).
 *
 * Cascades: the context and ALL of its pulses are soft deleted together
 * (hidden everywhere immediately, hard-purged with every nested entity by
 * the daily cron after 90 days). The server writes the activity Log inside
 * the same transaction — callers must NOT also fire logFieldActivity for
 * the deletion. Requires Space owner or ADMIN.
 */
export const DELETE_FIELD_CONTEXT_MUTATION = graphql(`
  mutation DeleteFieldContext($id: ID!) {
    deleteFieldContext(contextId: $id) {
      contextId
      deleted
      deletedPulseCount
    }
  }
`)

/**
 * Connect an existing FieldContext to a Space (MeSpace)
 */
export const CONNECT_FIELD_TO_SPACE_MUTATION = graphql(`
  mutation ConnectFieldToSpace($fieldId: ID!, $spaceId: ID!) {
    updateFieldContexts(
      where: { id_EQ: $fieldId }
      update: {
        meSpace: { connect: [{ where: { node: { id_EQ: $spaceId } } }] }
      }
    ) {
      fieldContexts {
        id
        title
        space {
          id
          name
        }
      }
    }
  }
`)
