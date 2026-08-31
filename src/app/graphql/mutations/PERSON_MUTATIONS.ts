import { graphql } from '@/gql'

// Removed: generatePersonEmbeddings mutation not in new schema

export const CREATE_PEOPLE_MUTATION = graphql(`
  mutation CreatePeople($input: [PersonCreateInput!]!) {
    createPeople(input: $input) {
      people {
        id
        name
        privateProfile {
          id
          email
        }
        ownsSpaces {
          id
          name
          visibility
        }
      }
    }
  }
`)

export const UPDATE_PERSON_MUTATION = graphql(`
  mutation UpdatePerson($where: PersonWhere!, $update: PersonUpdateInput!) {
    updatePeople(where: $where, update: $update) {
      people {
        id
        name
        firstName
        lastName
        photo
        # The PII write path is unchanged — these stay settable properties on
        # Person; only the READ moves behind the single GOAL-275 gate. This
        # mutation is self-gated to the caller's own node, so privateProfile
        # always resolves here.
        privateProfile {
          id
          email
          phone
          pronouns
          traits
          location
          passions
          fieldsOfCare
        }
        ownsSpaces {
          id
          name
          visibility
          createdAt
        }
      }
    }
  }
`)

/**
 * Edit a PersonPulse (a non-user :Person:PersonPulse). Unlike updatePeople
 * (self-gated to the caller's own node), this routes through an authorized
 * custom resolver that lets the caller edit people they can reach through a
 * Space they belong to. Folds in the relationship `why` as well.
 */
export const UPDATE_PERSON_PULSE_MUTATION = graphql(`
  mutation UpdatePersonPulse(
    $personId: ID!
    $firstName: String
    $lastName: String
    $description: String
    $relationshipWhy: String
  ) {
    updatePersonPulse(
      personId: $personId
      firstName: $firstName
      lastName: $lastName
      description: $description
      relationshipWhy: $relationshipWhy
    ) {
      success
      message
      # This person comes from a custom resolver (person-pulse-resolver.ts),
      # which returns a plain object rather than going through Cypher
      # translation — so it exposes only the plain scalars. The caller reads
      # success/message and refetches; the updated description arrives with
      # that refetch through the gated privateProfile.
      person {
        id
        firstName
        lastName
        name
      }
    }
  }
`)

export const DELETE_PERSON_MUTATION = graphql(`
  mutation DeletePerson($id: ID!) {
    deletePeople(where: { id_EQ: $id }) {
      nodesDeleted
    }
  }
`)

export const CREATE_PERSON_CONNECTION_MUTATION = graphql(`
  mutation CreatePersonConnection(
    $fromPersonId: ID!
    $toPersonId: ID!
    $why: String
    $interests: String
  ) {
    createPersonConnection(
      fromPersonId: $fromPersonId
      toPersonId: $toPersonId
      why: $why
      interests: $interests
    ) {
      success
      message
      connection {
        connectedPersonId
        why
        interests
      }
    }
  }
`)

export const UPDATE_PERSON_CONNECTION_MUTATION = graphql(`
  mutation UpdatePersonConnection(
    $fromPersonId: ID!
    $toPersonId: ID!
    $why: String
    $interests: String
  ) {
    updatePersonConnection(
      fromPersonId: $fromPersonId
      toPersonId: $toPersonId
      why: $why
      interests: $interests
    ) {
      success
      message
      connection {
        connectedPersonId
        why
        interests
      }
    }
  }
`)

export const DELETE_PERSON_CONNECTION_MUTATION = graphql(`
  mutation DeletePersonConnection($fromPersonId: ID!, $toPersonId: ID!) {
    deletePersonConnection(
      fromPersonId: $fromPersonId
      toPersonId: $toPersonId
    ) {
      success
      message
    }
  }
`)
