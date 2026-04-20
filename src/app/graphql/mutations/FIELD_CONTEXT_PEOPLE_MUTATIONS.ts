import gql from 'graphql-tag'

/**
 * Attach an existing person node to a field context so they appear in that field graph.
 */
export const ADD_PERSON_TO_FIELD_CONTEXT_MUTATION = gql`
  mutation AddPersonToFieldContext($contextId: ID!, $personId: ID!) {
    updateFieldContexts(
      where: { id_EQ: $contextId }
      update: {
        people: { connect: [{ where: { node: { id_EQ: $personId } } }] }
      }
    ) {
      fieldContexts {
        id
        people {
          id
          name
          email
        }
      }
    }
  }
`

/**
 * Detach a person node from a field context so they no longer appear in that field graph.
 */
export const REMOVE_PERSON_FROM_FIELD_CONTEXT_MUTATION = gql`
  mutation RemovePersonFromFieldContext($contextId: ID!, $personId: ID!) {
    updateFieldContexts(
      where: { id_EQ: $contextId }
      update: {
        people: { disconnect: [{ where: { node: { id_EQ: $personId } } }] }
      }
    ) {
      fieldContexts {
        id
        people {
          id
          name
          email
        }
      }
    }
  }
`
