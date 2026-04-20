import gql from 'graphql-tag'

/**
 * Fetch a field context with people currently attached, plus candidate people from the parent space.
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
        email
        photo
      }
      meSpace {
        id
        owner {
          id
          firstName
          lastName
          name
          email
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
            email
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
          email
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
            email
            photo
          }
        }
      }
    }
  }
`
