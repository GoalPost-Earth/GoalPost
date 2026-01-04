import { graphql } from '@/gql'

// Removed: generatePersonEmbeddings mutation not in new schema

export const CREATE_PEOPLE_MUTATION = graphql(`
  mutation CreatePeople($input: [PersonCreateInput!]!) {
    createPeople(input: $input) {
      people {
        id
        name
        email
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
        email
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

export const DELETE_PERSON_MUTATION = graphql(`
  mutation DeletePerson($id: ID!) {
    deletePeople(where: { id_EQ: $id }) {
      nodesDeleted
    }
  }
`)

export const INVITE_PERSON_MUTATION = graphql(`
  mutation InvitePerson($personId: String!) {
    invitePerson(personId: $personId) {
      id
      name
      email
    }
  }
`)

export const CANCEL_INVITE_MUTATION = graphql(`
  mutation CancelInvite($personId: String!) {
    cancelInvite(personId: $personId) {
      id
      name
      email
    }
  }
`)
