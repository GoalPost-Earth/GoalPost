import typeDefs from './schema/schema.gql'
import resolvers from './resolvers'
import { auth, driver as neoDriver } from 'neo4j-driver'
import { Neo4jGraphQL } from '@neo4j/graphql'
import { createYoga } from 'graphql-yoga'
import { jwtDecode } from 'jwt-decode'

export default async function initializeApolloServer() {
  const driver = neoDriver(
    process.env.NEO4J_URI || 'bolt://localhost:7687',
    auth.basic(
      process.env.NEO4J_USER || 'neo4j',
      process.env.NEO4J_PASSWORD || 'neo4j'
    )
  )

  const neoSchema = new Neo4jGraphQL({
    typeDefs,
    resolvers,
    driver,
    features: {
      authorization: {
        key: process.env.JWT_SECRET ?? '',
      },
    },
  })
  const schema = await neoSchema.getSchema()

  const yogaServer = createYoga({
    schema,
    context: async (req) => {
      // decode JWT token
      const token = req.request.headers.get('authorization')
      const jwt = jwtDecode(token ?? '')

      return {
        jwt,
      }
    },
    graphqlEndpoint: '/api/graphql',
  })

  return yogaServer
}
