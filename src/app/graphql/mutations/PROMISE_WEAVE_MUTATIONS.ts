import { graphql } from '@/gql'

/**
 * Create a PromiseWeave inside a FieldContext.
 *
 * A weave is a reified connector node (like ResonanceLink, not a pulse): it
 * `WEAVES` one or more FieldPulses, is `WOVEN_FOR` the person it concerns, and
 * is anchored in its FieldContext via `HAS_WEAVE` — that context edge is the
 * visibility anchor, so the weave inherits the parent Space's scope. Writes are
 * gated by the type's `@authorization` validate rules (OWNER / ADMIN / MEMBER).
 *
 * @example
 * await client.mutate({
 *   mutation: CREATE_PROMISE_WEAVE_MUTATION,
 *   variables: {
 *     input: [{
 *       title: 'Caring for the home while we are away',
 *       description: 'Ties the housesitting promise to the people keeping it',
 *       status: 'active',
 *       origin: 'user',
 *       createdAt: new Date().toISOString(),
 *       weaves: { connect: [{ where: { node: { id_IN: ['pulse_123'] } } }] },
 *       wovenFor: { connect: [{ where: { node: { id_EQ: 'person_1' } } }] },
 *       createdBy: { connect: [{ where: { node: { id_EQ: 'person_me' } } }] },
 *       context: { connect: [{ where: { node: { id_EQ: 'ctx_789' } } }] },
 *     }],
 *   },
 * })
 */
export const CREATE_PROMISE_WEAVE_MUTATION = graphql(`
  mutation CreatePromiseWeave($input: [PromiseWeaveCreateInput!]!) {
    createPromiseWeaves(input: $input) {
      promiseWeaves {
        id
        title
        description
        status
        origin
        createdAt
        weaves {
          id
          __typename
          title
        }
        wovenFor {
          id
          name
          firstName
          lastName
        }
        createdBy {
          id
          name
          firstName
          lastName
        }
        context {
          id
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
 * Update a PromiseWeave — its title/description, its lifecycle `status`, or the
 * set of pulses it weaves. Confirming an AI-proposed weave (`proposed` →
 * `active`) and dissolving one both run through here.
 */
export const UPDATE_PROMISE_WEAVE_MUTATION = graphql(`
  mutation UpdatePromiseWeave(
    $where: PromiseWeaveWhere!
    $update: PromiseWeaveUpdateInput!
  ) {
    updatePromiseWeaves(where: $where, update: $update) {
      promiseWeaves {
        id
        title
        description
        status
        origin
        createdAt
        modifiedAt
        weaves {
          id
          __typename
          title
        }
        wovenFor {
          id
          name
          firstName
          lastName
        }
        createdBy {
          id
          name
          firstName
          lastName
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
 * Delete a PromiseWeave by id. Deleting removes the connector node and its
 * edges only — the pulses it wove and the person it was woven for are
 * untouched.
 */
export const DELETE_PROMISE_WEAVE_MUTATION = graphql(`
  mutation DeletePromiseWeave($id: ID!) {
    deletePromiseWeaves(where: { id_EQ: $id }) {
      nodesDeleted
      relationshipsDeleted
    }
  }
`)
