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
 * Cascades: the context, its nested sub-contexts (GOAL-295), and ALL of
 * their pulses are soft deleted together (hidden everywhere immediately,
 * hard-purged with every nested entity by the daily cron after 90 days).
 * The server writes the activity Log inside the same transaction — callers
 * must NOT also fire logFieldActivity for the deletion. Requires Space
 * owner or ADMIN.
 */
export const DELETE_FIELD_CONTEXT_MUTATION = graphql(`
  mutation DeleteFieldContext($id: ID!) {
    deleteFieldContext(contextId: $id) {
      contextId
      deleted
      deletedPulseCount
      deletedSubContextCount
    }
  }
`)

/**
 * Create a sub-context nested under an existing FieldContext (GOAL-295).
 *
 * The child lands in the SAME Space as the parent (its own HAS_CONTEXT
 * edge) plus the HAS_SUBCONTEXT overlay edge. Server enforces
 * canEditContent, the depth cap, and writes the activity Log in the same
 * transaction — callers must NOT also fire logFieldActivity.
 */
export const CREATE_SUB_FIELD_CONTEXT_MUTATION = graphql(`
  mutation CreateSubFieldContext(
    $parentContextId: ID!
    $title: String!
    $emergentName: String
  ) {
    createSubFieldContext(
      parentContextId: $parentContextId
      title: $title
      emergentName: $emergentName
    ) {
      contextId
      title
      parentContextId
    }
  }
`)

/**
 * Move a FieldContext under a new parent, or to the top level of its Space
 * when newParentContextId is null (GOAL-295). Same-Space, cycle, and depth
 * invariants are enforced server-side; the activity Log is written in the
 * same transaction.
 */
export const MOVE_FIELD_CONTEXT_MUTATION = graphql(`
  mutation MoveFieldContext($contextId: ID!, $newParentContextId: ID) {
    moveFieldContext(
      contextId: $contextId
      newParentContextId: $newParentContextId
    ) {
      contextId
      newParentContextId
      moved
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
