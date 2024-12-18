import { graphql } from '@/gql'

export const GET_GOAL = graphql(`
  query getGoal($id: ID!) {
    goals(where: { id_EQ: $id }) {
      id
      name
      type
      description
      caresFor
      successMeasures
      photo
      status
      location
      time
      createdAt
    }
  }
`)
