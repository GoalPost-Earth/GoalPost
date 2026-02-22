import { driver as neoDriver, auth } from 'neo4j-driver'
import logger from '@/lib/logger'

/**
 * Custom resolver to find users by email, bypassing authorization restrictions.
 * This is needed for space member addition where the querying user may not have
 * visibility to the target user through existing space memberships.
 */
export const userLookupResolvers = {
  findUserByEmail: async (
    _parent: unknown,
    args: { email: string },
    context: { jwt?: { user?: { id: string } } }
  ) => {
    // Require authentication
    if (!context?.jwt?.user?.id) {
      throw new Error('Authentication required')
    }

    const driver = neoDriver(
      process.env.NEO4J_URI ?? 'bolt://localhost:7687',
      auth.basic(
        process.env.NEO4J_USERNAME ?? 'neo4j',
        process.env.NEO4J_PASSWORD ?? 'letmein00'
      )
    )

    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'neo4j',
    })

    try {
      const result = await session.run(
        `
        MATCH (u:Person)
        WHERE u.email = $email
        RETURN u.id as id, 
               u.firstName + ' ' + u.lastName as name,
               u.email as email,
               'Person' as __typename
        LIMIT 1
        `,
        { email: args.email }
      )

      if (result.records.length === 0) {
        return null
      }

      const record = result.records[0]
      return {
        id: record.get('id'),
        name: record.get('name'),
        email: record.get('email'),
        __typename: record.get('__typename'),
      }
    } catch (error) {
      logger.error('Error finding user by email', {
        email: args.email,
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    } finally {
      await session.close()
      await driver.close()
    }
  },
}
