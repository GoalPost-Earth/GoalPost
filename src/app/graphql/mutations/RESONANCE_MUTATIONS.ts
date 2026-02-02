import { graphql } from '@/gql'

/**
 * Create a new ResonanceLink between two pulses within the same FieldContext.
 *
 * A resonance link represents an AI-identified semantic connection between two pulses.
 * The relationship is scoped to a single FieldContext - only pulses in the same context can resonate.
 *
 * @example
 * // Create a resonance link between two pulses
 * const { data } = await client.mutate({
 *   mutation: CREATE_RESONANCE_LINK_MUTATION,
 *   variables: {
 *     input: [{
 *       label: "Complements",
 *       description: "These goals support each other",
 *       confidence: 0.85,
 *       evidence: "Both pulses mention 'team collaboration'",
 *       createdAt: new Date().toISOString(),
 *       source: {
 *         connect: [{ where: { node: { id_EQ: "pulse_123" } } }]
 *       },
 *       target: {
 *         connect: [{ where: { node: { id_EQ: "pulse_456" } } }]
 *       },
 *       context: {
 *         connect: [{ where: { node: { id_EQ: "context_789" } } }]
 *       }
 *     }]
 *   }
 * })
 */
export const CREATE_RESONANCE_LINK_MUTATION = graphql(`
  mutation CreateResonanceLink($input: [ResonanceLinkCreateInput!]!) {
    createResonanceLinks(input: $input) {
      resonanceLinks {
        id
        label
        description
        confidence
        evidence
        createdAt
        source {
          ... on GoalPulse {
            id
            title
            content
            type: __typename
          }
          ... on ResourcePulse {
            id
            title
            content
            type: __typename
          }
          ... on StoryPulse {
            id
            title
            content
            type: __typename
          }
        }
        target {
          ... on GoalPulse {
            id
            title
            content
            type: __typename
          }
          ... on ResourcePulse {
            id
            title
            content
            type: __typename
          }
          ... on StoryPulse {
            id
            title
            content
            type: __typename
          }
        }
        context {
          id
          title
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
 * Update an existing ResonanceLink
 *
 * @example
 * // Update resonance link confidence and description
 * const { data } = await client.mutate({
 *   mutation: UPDATE_RESONANCE_LINK_MUTATION,
 *   variables: {
 *     where: { id_EQ: "resonance_123" },
 *     update: {
 *       confidence: 0.92,
 *       description: "Updated description"
 *     }
 *   }
 * })
 */
export const UPDATE_RESONANCE_LINK_MUTATION = graphql(`
  mutation UpdateResonanceLink(
    $where: ResonanceLinkWhere!
    $update: ResonanceLinkUpdateInput!
  ) {
    updateResonanceLinks(where: $where, update: $update) {
      resonanceLinks {
        id
        label
        description
        confidence
        evidence
        createdAt
        source {
          ... on GoalPulse {
            id
            title
          }
          ... on ResourcePulse {
            id
            title
          }
          ... on StoryPulse {
            id
            title
          }
        }
        target {
          ... on GoalPulse {
            id
            title
          }
          ... on ResourcePulse {
            id
            title
          }
          ... on StoryPulse {
            id
            title
          }
        }
      }
      info {
        relationshipsCreated
        relationshipsDeleted
      }
    }
  }
`)

/**
 * Delete a ResonanceLink by ID
 *
 * @example
 * // Delete a resonance link
 * const { data } = await client.mutate({
 *   mutation: DELETE_RESONANCE_LINK_MUTATION,
 *   variables: {
 *     id: "resonance_123"
 *   }
 * })
 */
export const DELETE_RESONANCE_LINK_MUTATION = graphql(`
  mutation DeleteResonanceLink($id: ID!) {
    deleteResonanceLinks(where: { id_EQ: $id }) {
      nodesDeleted
      relationshipsDeleted
    }
  }
`)
