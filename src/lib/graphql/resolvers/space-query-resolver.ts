import { driver } from '@/lib/neo4j/driver'

interface Context {
  jwt?: {
    user?: {
      id: string
      email?: string
    }
  }
}

/**
 * Custom resolvers for meSpaces and weSpaces queries.
 * These enforce authorization by filtering spaces based on the current user's permissions.
 */
export const spaceQueryResolvers = {
  /**
   * Fetch all MeSpaces the current user owns.
   * Only the owner can view their MeSpace.
   */
  meSpaces: async (_source: unknown, _args: unknown, context: Context) => {
    if (!context.jwt?.user?.id) {
      throw new Error('Unauthorized: No user ID in JWT')
    }

    const userId = context.jwt.user.id
    const session = driver.session()

    try {
      // Query: Get all MeSpaces owned by the current user only
      const result = await session.executeRead(async (tx) => {
        return await tx.run(
          `
          MATCH (p:Person {id: $userId})-[:OWNS]->(space:MeSpace)
          RETURN space
          ORDER BY space.createdAt DESC
          `,
          { userId }
        )
      })

      return result.records.map((record) => record.get('space').properties)
    } finally {
      await session.close()
    }
  },

  /**
   * Fetch all WeSpaces the current user owns or is a member of.
   * User can access WeSpaces where they are either the owner OR a member (any role).
   */
  weSpaces: async (_source: unknown, _args: unknown, context: Context) => {
    if (!context.jwt?.user?.id) {
      throw new Error('Unauthorized: No user ID in JWT')
    }

    const userId = context.jwt.user.id
    const session = driver.session()

    try {
      // Query: Get WeSpaces where user is owner OR is a member
      const result = await session.executeRead(async (tx) => {
        return await tx.run(
          `
          MATCH (p:Person {id: $userId})
          OPTIONAL MATCH (p)-[:OWNS]->(owned:WeSpace)
          OPTIONAL MATCH (m:SpaceMembership)-[:IS_MEMBER]->(p)
          OPTIONAL MATCH (space:WeSpace)-[:HAS_MEMBER]->(m)
          WITH DISTINCT COALESCE(owned, space) AS space
          WHERE space IS NOT NULL
          RETURN space
          ORDER BY space.createdAt DESC
          `,
          { userId }
        )
      })

      return result.records.map((record) => record.get('space').properties)
    } finally {
      await session.close()
    }
  },
}
