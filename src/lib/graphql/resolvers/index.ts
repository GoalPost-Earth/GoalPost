import { Person } from '@/gql/graphql'
import { chatbotResolvers } from './chatbot-resolvers'
import { inviteMutations } from './invite-resolver'
import { searchResolvers } from './search-resolver'
import { spaceMembershipResolvers } from './space-membership-resolver'
import { driver } from '@/lib/neo4j/driver'

const resolvers = {
  // Resolver Parameters
  // source: the parent result of a previous resolver
  // Args: Field Arguments
  // Context: Context object, database connection, API, etc
  // GraphQLResolveInfo

  Person: {
    name: (source: Person) => `${source.firstName} ${source.lastName}`,
  },

  MeSpace: {
    owner: async (source: Record<string, unknown>) => {
      if (!source.id) return []
      const session = driver.session()
      try {
        const result = await session.executeRead(async (tx) => {
          return await tx.run(
            `
            MATCH (space:MeSpace {id: $spaceId})<-[:OWNS]-(owner:Person)
            RETURN owner
            `,
            { spaceId: source.id }
          )
        })
        return result.records.map((record) => record.get('owner').properties)
      } finally {
        await session.close()
      }
    },
    members: async (source: Record<string, unknown>) => {
      if (!source.id) return []
      const session = driver.session()
      try {
        const result = await session.executeRead(async (tx) => {
          return await tx.run(
            `
            MATCH (space:MeSpace {id: $spaceId})-[:HAS_MEMBER]->(membership:SpaceMembership)
            RETURN membership
            `,
            { spaceId: source.id }
          )
        })
        return result.records.map(
          (record) => record.get('membership').properties
        )
      } finally {
        await session.close()
      }
    },
    contexts: async (source: Record<string, unknown>) => {
      if (!source.id) return []
      const session = driver.session()
      try {
        const result = await session.executeRead(async (tx) => {
          return await tx.run(
            `
            MATCH (space:MeSpace {id: $spaceId})-[:HAS_CONTEXT]->(context:FieldContext)
            RETURN context
            `,
            { spaceId: source.id }
          )
        })
        return result.records.map((record) => record.get('context').properties)
      } finally {
        await session.close()
      }
    },
  },

  WeSpace: {
    owner: async (source: Record<string, unknown>) => {
      if (!source.id) return []
      const session = driver.session()
      try {
        const result = await session.executeRead(async (tx) => {
          return await tx.run(
            `
            MATCH (space:WeSpace {id: $spaceId})<-[:OWNS]-(owner:Person)
            RETURN owner
            `,
            { spaceId: source.id }
          )
        })
        return result.records.map((record) => record.get('owner').properties)
      } finally {
        await session.close()
      }
    },
    members: async (source: Record<string, unknown>) => {
      if (!source.id) return []
      const session = driver.session()
      try {
        const result = await session.executeRead(async (tx) => {
          return await tx.run(
            `
            MATCH (space:WeSpace {id: $spaceId})-[:HAS_MEMBER]->(membership:SpaceMembership)
            RETURN membership
            `,
            { spaceId: source.id }
          )
        })
        return result.records.map(
          (record) => record.get('membership').properties
        )
      } finally {
        await session.close()
      }
    },
    contexts: async (source: Record<string, unknown>) => {
      if (!source.id) return []
      const session = driver.session()
      try {
        const result = await session.executeRead(async (tx) => {
          return await tx.run(
            `
            MATCH (space:WeSpace {id: $spaceId})-[:HAS_CONTEXT]->(context:FieldContext)
            RETURN context
            `,
            { spaceId: source.id }
          )
        })
        return result.records.map((record) => record.get('context').properties)
      } finally {
        await session.close()
      }
    },
  },

  SpaceMembership: {
    member: async (source: Record<string, unknown>) => {
      if (!source.id) return []
      const session = driver.session()
      try {
        const result = await session.executeRead(async (tx) => {
          return await tx.run(
            `
            MATCH (membership:SpaceMembership {id: $membershipId})-[:IS_MEMBER]->(person:Person)
            RETURN person
            `,
            { membershipId: source.id }
          )
        })
        return result.records.map((record) => record.get('person').properties)
      } finally {
        await session.close()
      }
    },
  },

  FieldContext: {
    pulses: async (source: Record<string, unknown>) => {
      if (!source.id) return []
      const session = driver.session()
      try {
        const result = await session.executeRead(async (tx) => {
          return await tx.run(
            `
            MATCH (context:FieldContext {id: $contextId})-[:HAS_PULSE]->(pulse:FieldPulse)
            RETURN pulse
            `,
            { contextId: source.id }
          )
        })
        return (
          result.records.map((record) => record.get('pulse').properties) || []
        )
      } finally {
        await session.close()
      }
    },
    resonances: async (source: Record<string, unknown>) => {
      if (!source.id) return []
      const session = driver.session()
      try {
        const result = await session.executeRead(async (tx) => {
          return await tx.run(
            `
            MATCH (context:FieldContext {id: $contextId})-[:HAS_RESONANCE]->(resonance:ResonanceLink)
            RETURN resonance
            `,
            { contextId: source.id }
          )
        })
        return (
          result.records.map((record) => record.get('resonance').properties) ||
          []
        )
      } finally {
        await session.close()
      }
    },
  },

  FieldPulse: {
    __resolveType: (obj: Record<string, unknown>) => {
      // Check discriminator properties to determine concrete type
      if ('status' in obj) return 'GoalPulse'
      if ('resourceType' in obj) return 'ResourcePulse'
      return 'StoryPulse' // Default fallback
    },
  },

  Mutation: {
    ...chatbotResolvers,
    ...inviteMutations,
    ...spaceMembershipResolvers,
  },
  Query: {
    ...searchResolvers,
  },
}

export default resolvers
