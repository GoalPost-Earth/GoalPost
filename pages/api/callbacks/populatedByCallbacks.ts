import { Neo4jGraphQLCallback } from '@neo4j/graphql'

export const authIdCallback: Neo4jGraphQLCallback = (_parent, _args, context) =>
  context.jwt?.sub
