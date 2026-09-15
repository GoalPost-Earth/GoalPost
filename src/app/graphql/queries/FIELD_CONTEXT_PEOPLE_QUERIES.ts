import gql from 'graphql-tag'

/**
 * Fetch a field context with people currently attached, plus candidate people from the parent space.
 *
 * GOAL-275: every PII read goes through `privateProfile`, the single
 * type-level gate. It is null for a caller not authorized for that person, and
 * the attach UI falls back to the open directory identity (name / photo).
 *
 * GOAL-370: it is selected on `people` — the roster renders their email and
 * relationship (person-panel-member-body, and bloom-view's CONNECTED_TO edges)
 * — and on nothing else. The parent space's owner and members are read for
 * `id` / `role` / display name only, by all three consumers, so selecting PII
 * there bought four more copies of the gate (ADR-010) for unrendered data.
 */
export const GET_FIELD_CONTEXT_PEOPLE = gql`
  query GetFieldContextPeople($contextId: ID!) {
    fieldContexts(where: { id_EQ: $contextId }) {
      id
      # GOAL-346: ids of people a human deliberately put on the roster.
      # Everyone else who is attached but was named by a document is shown
      # under that document instead. Bare ids — see the schema note on why a
      # @cypher field must never project Person here.
      curatedPersonIds
      people {
        id
        firstName
        lastName
        name
        photo
        privateProfile {
          id
          email
          description
          # The current user's relationship to this person lives on the
          # CONNECTED_TO edge; match the edge whose other end is the user.
          connectionEdges {
            connectedPersonId
            why
          }
        }
      }
      meSpace {
        id
        owner {
          id
          firstName
          lastName
          name
          photo
        }
        members {
          id
          role
          member {
            id
            firstName
            lastName
            name
            photo
          }
        }
      }
      weSpace {
        id
        owner {
          id
          firstName
          lastName
          name
          photo
        }
        members {
          id
          role
          member {
            id
            firstName
            lastName
            name
            photo
          }
        }
      }
    }
  }
`
