import { Neo4jGraphQLCallback } from '@neo4j/graphql'
import { AuthContext } from '../types'

export const authIdCallback: Neo4jGraphQLCallback = (_parent, _context) => {
  const auth: AuthContext = _context.auth
  return auth.jwt.sub
}
