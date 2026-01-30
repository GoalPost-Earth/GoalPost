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
 * Note: To link to a space, use the CONNECT_FIELD_TO_SPACE_MUTATION or create the relationship
 * through the space's contexts mutation instead.
 */
export const CREATE_FIELD_CONTEXT_MUTATION = graphql(`
  mutation CreateFieldContext($input: [FieldContextCreateInput!]!) {
    createFieldContexts(input: $input) {
      fieldContexts {
        id
        title
        emergentName
        createdAt
        space {
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
        space {
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
 * Delete a FieldContext by ID
 */
export const DELETE_FIELD_CONTEXT_MUTATION = graphql(`
  mutation DeleteFieldContext($id: ID!) {
    deleteFieldContexts(where: { id_EQ: $id }) {
      nodesDeleted
      relationshipsDeleted
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
