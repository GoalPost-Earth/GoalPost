import { ApolloServer } from 'apollo-server-micro'
import typeDefs from './schema/schema.gql'
import resolvers from './resolvers'
import { auth, driver as neoDriver } from 'neo4j-driver'
import { Neo4jGraphQL } from '@neo4j/graphql'

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
    // features: {
    //   authorization: {
    //     key: process.env.JWT_SECRET ?? '',
    //   },
    // },
  })
  const schema = await neoSchema.getSchema()

  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ event }) => ({ req: event }),
    introspection: true,
    schema,
  })

  await apolloServer.start()

  return apolloServer.createHandler({ path: '/api/graphql' })
}
