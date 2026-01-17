import typeDefs from '@/lib/graphql/schema/schema.gql'
import resolvers from '@/lib/graphql/resolvers'
import { auth, driver as neoDriver } from 'neo4j-driver'
import { Neo4jGraphQL } from '@neo4j/graphql'
import { createYoga } from 'graphql-yoga'
import { jwtDecode } from 'jwt-decode'
import logger from '@/lib/logger'

export default async function initializeApolloServer() {
  logger.info('🚀 Initializing Apollo Server...')

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
      // Extract and decode JWT token from Authorization header
      const authHeader = req.request.headers.get('authorization')

      console.log(
        '🔍 [YOGA CONTEXT] Authorization header:',
        authHeader ? '✓ Present' : '✗ Missing'
      )

      let jwt = null
      let jwtString = null

      if (authHeader) {
        try {
          // Strip "Bearer " prefix if present
          jwtString = authHeader.startsWith('Bearer ')
            ? authHeader.substring(7)
            : authHeader

          // Decode to validate and extract claims
          jwt = jwtDecode(jwtString)

          console.log('✅ [YOGA CONTEXT] JWT decoded successfully:', {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            sub: (jwt as any).sub,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            email: (jwt as any).email,
          })
        } catch (error) {
          console.error(
            '❌ [YOGA CONTEXT] Invalid JWT token:',
            error instanceof Error ? error.message : String(error)
          )
        }
      } else {
        console.warn('⚠️ [YOGA CONTEXT] No Authorization header provided')
      }

      // Neo4jGraphQL expects the jwt in the context for @authentication directive
      return { jwt }
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
      : {
          origin: process.env.CORS_ORIGIN || undefined,
          credentials: true,
        },
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
