import { graphql } from '@/gql'

/**
 * Attach an existing person node to a field context so they appear in that
 * field graph. Uses the custom `addPersonToFieldContext` mutation — the
 * generated nested CONNECT on FieldContext.people is disabled because it let
 * any context editor attach an arbitrary registered User by id (exposing
 * their gated PII to the space). The resolver enforces the edit gate and the
 * `:User` target rule, and writes the activity Log.
 */
export const ADD_PERSON_TO_FIELD_CONTEXT_MUTATION = graphql(`
  mutation AddPersonToFieldContext($contextId: ID!, $personId: ID!) {
    addPersonToFieldContext(contextId: $contextId, personId: $personId) {
      success
      message
      person {
        id
        name
      }
    }
  }
`)

/**
 * Detach a person node from a field context so they no longer appear in that field graph.
 */
export const REMOVE_PERSON_FROM_FIELD_CONTEXT_MUTATION = graphql(`
  mutation RemovePersonFromFieldContext($contextId: ID!, $personId: ID!) {
    updateFieldContexts(
      where: { id_EQ: $contextId }
      update: {
        people: { disconnect: [{ where: { node: { id_EQ: $personId } } }] }
      }
    ) {
      # Only id is read — the caller refetches the people list. Selecting the
      # GOAL-275-gated email here would needlessly AND the Person auth filter
      # onto this write's return for data nobody consumes.
      fieldContexts {
        id
      }
    }
  }
`)
