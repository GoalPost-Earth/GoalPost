import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import express from 'express'
import http from 'http'
import cors from 'cors'
import { json } from 'body-parser'
import { auth, driver as neo4jDriver } from 'neo4j-driver'
import { Neo4jGraphQL } from '@neo4j/graphql'
import { typeDefs } from './schema/graphql-schema'
import resolvers from './resolvers/resolvers'

const app = express()
const httpServer = http.createServer(app)

const driver = neo4jDriver(
  process.env.NEO4J_URI || 'bolt://localhost:7687/',
  auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD || 'letmein0'
  ),
  {
    encrypted: process.env.NEO4J_ENCRYPTED ? 'ENCRYPTION_ON' : 'ENCRYPTION_OFF',
  }
)

const neoSchema = new Neo4jGraphQL({
  typeDefs,
  resolvers,
  driver,
  // features: {
  //   authorization: {
  //     key: process.env.JWT_SECRET,
  //   },
  // },
})

/*
 * Create a Neo4j driver instance to connect to the database
 * using credentials specified as environment variables
 * with fallback to defaults
 */

/*
 * Create a new ApolloServer instance, serving the GraphQL schema
 * created using makeAugmentedSchema above and injecting the Neo4j driver
 * instance into the context object so it is available in the
 * generated resolvers to connect to the database.
 */

// Specify host, port and path for GraphQL endpoint
const port = process.env.GRAPHQL_SERVER_PORT || 4001
const path = process.env.GRAPHQL_SERVER_PATH || '/graphql'
const host = process.env.GRAPHQL_SERVER_HOST || '0.0.0.0'

/*
 * Optionally, apply Express middleware for authentication, etc
 * This also also allows us to specify a path for the GraphQL endpoint
 */
const startServer = async () => {
  const schema = await neoSchema.getSchema().catch((error) => {
    // eslint-disable-next-line
    console.error(JSON.stringify(error))
    process.exit(1)
  })

  const server = new ApolloServer({
    context: ({ req }) => ({
      req,
      executionContext: driver,
    }),
    introspection: true,
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  })

  await server.start()

  app.use(
    path,
    cors(),
    json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({
        req,
        executionContext: driver,
        token: req.headers.authorization,
      }),
    })
  )

  // eslint-disable-next-line no-promise-executor-return
  await new Promise((resolve) => httpServer.listen({ port }, resolve))
  // eslint-disable-next-line
  console.log(`🚀 GraphQL Server ready at http://${host}:${port}${path}`)
}

startServer()
