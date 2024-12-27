import { graphql } from '@/gql'

export const CREATE_MEMBER_MUTATION = graphql(`
  mutation CreateMembers($input: [MemberCreateInput!]!) {
    createMembers(input: $input) {
      members {
        id
        firstName
        lastName
        email
      }
    }
  }
`)

export const UPDATE_MEMBER_MUTATION = graphql(`
  mutation UpdateMember($where: MemberWhere!, $update: MemberUpdateInput!) {
    updateMembers(where: $where, update: $update) {
      members {
        id
        authId
        firstName
        lastName
        email
      }
    }
  }
`)
