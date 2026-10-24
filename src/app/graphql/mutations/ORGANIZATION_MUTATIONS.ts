import { graphql } from '@/gql'

/**
 * GOAL-387 — take an organization out of a field from the Dashboard view.
 * Both are custom resolvers (`organization-resolver.ts`) gated on editing the
 * field; the generated Organization mutations stay disabled.
 */
export const REMOVE_ORGANIZATION_FROM_FIELD_CONTEXT_MUTATION = graphql(`
  mutation RemoveOrganizationFromFieldContext(
    $contextId: ID!
    $organizationId: ID!
  ) {
    removeOrganizationFromFieldContext(
      contextId: $contextId
      organizationId: $organizationId
    ) {
      success
      message
      deleted
    }
  }
`)

export const DELETE_ORGANIZATION_FROM_FIELD_CONTEXT_MUTATION = graphql(`
  mutation DeleteOrganizationFromFieldContext(
    $contextId: ID!
    $organizationId: ID!
  ) {
    deleteOrganizationFromFieldContext(
      contextId: $contextId
      organizationId: $organizationId
    ) {
      success
      message
      deleted
    }
  }
`)
