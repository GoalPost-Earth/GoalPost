import typeDefs from '@/lib/graphql/schema/schema.gql'
import resolvers from '@/lib/graphql/resolvers'
import { auth, driver as neoDriver } from 'neo4j-driver'
import { Neo4jGraphQL } from '@neo4j/graphql'
import { createYoga } from 'graphql-yoga'
import { verifyJWT } from '@/app/api/auth/utils'
import logger from '@/lib/logger'
import { clientIp } from '@/lib/auth/rate-limit'

export async function initializeApolloServer() {
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
      // Extract and VERIFY the JWT from the Authorization header. We must
      // verify the signature (not merely decode it) — Neo4jGraphQL trusts a
      // pre-supplied `jwt` object in context and does not re-verify it, so
      // every `$jwt.user.id` authorization filter is only as trustworthy as
      // this step. `verifyJWT` checks the HS256 signature against JWT_SECRET
      // and throws on a forged/expired token, in which case `jwt` stays null
      // and the request is treated as unauthenticated.
      const authHeader = req.request.headers.get('authorization')

      let jwt = null

      if (authHeader) {
        try {
          // Strip "Bearer " prefix if present
          const jwtString = authHeader.startsWith('Bearer ')
            ? authHeader.substring(7)
            : authHeader

          jwt = verifyJWT(jwtString)
        } catch (error) {
          // Invalid signature, malformed token, or expiry — log without the
          // token contents (no PII) and fall through as unauthenticated.
          logger.warn('[YOGA CONTEXT] JWT verification failed', {
            error: error instanceof Error ? error.message : String(error),
          })
        }
      }

      // Best-effort client IP for resolver-level rate limiting (see
      // src/lib/auth/rate-limit.ts + space-membership-resolver's
      // invite-blast policy). Imported from the helper so the parsing
      // rules (first x-forwarded-for hop is the only trustworthy one)
      // don't drift between contexts.
      const ip = clientIp({ headers: req.request.headers })

      // Neo4jGraphQL expects the jwt in the context for @authentication directive
      return { jwt, clientIp: ip }
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
