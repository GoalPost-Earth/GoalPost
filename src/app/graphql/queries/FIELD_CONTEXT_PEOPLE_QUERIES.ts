import gql from 'graphql-tag'

/**
 * Fetch a field context with people currently attached, plus candidate people from the parent space.
 *
 * GOAL-275: every PII read goes through `privateProfile`, the single
 * type-level gate. It is null for a caller not authorized for that person, and
 * the attach UI falls back to the open directory identity (name / photo).
 */
export const GET_FIELD_CONTEXT_PEOPLE = gql`
  query GetFieldContextPeople($contextId: ID!) {
    fieldContexts(where: { id_EQ: $contextId }) {
      id
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
          privateProfile {
            id
            email
          }
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
            privateProfile {
              id
              email
            }
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
          privateProfile {
            id
            email
          }
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
            privateProfile {
              id
              email
            }
          }
        }
      }
    }
  }
`
