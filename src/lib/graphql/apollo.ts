import typeDefs from './schema/schema.gql'
import resolvers from './resolvers'
import { auth, driver as neoDriver } from 'neo4j-driver'
import { Neo4jGraphQL } from '@neo4j/graphql'
import { createYoga } from 'graphql-yoga'
import { verifyJWT } from '@/app/api/auth/utils'
import logger from '@/lib/logger'

export default async function initializeApolloServer() {
  logger.info('🚀 Initializing Apollo Server...')
  logger.info('📊 Neo4j Configuration:', {
    uri: process.env.NEO4J_URI,
    username: process.env.NEO4J_USERNAME,
    database: process.env.NEO4J_DATABASE,
  })

  const driver = neoDriver(
    process.env.NEO4J_URI ?? 'bolt://localhost:7687',
    auth.basic(
      process.env.NEO4J_USERNAME ?? 'neo4j',
      process.env.NEO4J_PASSWORD ?? 'letmein00'
    )
  )

  const neoSchema = new Neo4jGraphQL({
    typeDefs,
    resolvers,
    driver,
    features: {
      authorization: { key: process.env.JWT_SECRET ?? 'jwt' },
      excludeDeprecatedFields: {
        implicitEqualFilters: true,
        implicitSet: true,
        deprecatedOptionsArgument: true,
        directedArgument: true,
        connectOrCreate: true,
      },
    },
  })

  let schema
  try {
    schema = await neoSchema.getSchema()
    logger.info('✅ GraphQL schema built successfully')
  } catch (error) {
    logger.error('❌ Failed to build GraphQL schema', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    throw error
  }

  const isDevelopment = process.env.NODE_ENV === 'development'

  const yogaServer = createYoga({
    schema,
    context: async (req) => {
      // Verify (not just decode) the JWT signature — see apollo-server.ts for
      // why this is load-bearing for every $jwt authorization filter.
      const token = req.request.headers.get('authorization')
      let jwt = null

      if (token) {
        try {
          const jwtString = token.startsWith('Bearer ')
            ? token.substring(7)
            : token
          jwt = verifyJWT(jwtString)
        } catch (error) {
          logger.warn('Invalid JWT token', {
            error: error instanceof Error ? error.message : String(error),
          })
        }
      }

      // Return context with database configuration for Neo4jGraphQL
      return {
        token,
        jwt,
        ...(process.env.NEO4J_DATABASE && {
          sessionConfig: {
            database: process.env.NEO4J_DATABASE,
          },
        }),
      }
    },
    graphqlEndpoint: '/api/graphql',
    cors: isDevelopment
      ? {
          origin: '*',
          credentials: true,
          methods: ['GET', 'POST', 'OPTIONS'],
          allowedHeaders: [
            'Content-Type',
            'Authorization',
            'Apollo-Require-Preflight',
          ],
        }
      : process.env.CORS_ORIGIN
        ? {
            origin: process.env.CORS_ORIGIN,
            credentials: true,
          }
        : undefined,
    logging: {
      debug: (...args) => logger.debug(args.join(' ')),
      info: (...args) => logger.info(args.join(' ')),
      warn: (...args) => logger.warn(args.join(' ')),
      error: (...args) => logger.error(args.join(' ')),
    },
  })

  logger.info('✅ Apollo Server initialized successfully')

  return yogaServer
}
