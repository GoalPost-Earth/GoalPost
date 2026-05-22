import { Person } from '@/gql/graphql'
import { chatbotResolvers } from './chatbot-resolvers'
import { inviteMutations } from './invite-resolver'
import { relatedPeopleResolvers } from './related-people-resolver'
import { searchResolvers } from './search-resolver'
import { spaceMembershipResolvers } from './space-membership-resolver'
import { userLookupResolvers } from './user-lookup-resolver'
import { connectionMutations } from './connection-resolver'
import {
  activityLogMutations,
  activityLogQueries,
} from './activity-log-resolver'
import {
  documentMutations,
  documentQueries,
  documentTypeResolvers,
} from './document-resolver'
import { assistantFeedbackMutations } from './assistant-feedback-resolver'
import { driver } from '@/lib/neo4j/driver'

const resolvers = {
  // Resolver Parameters
  // source: the parent result of a previous resolver
  // Args: Field Arguments
  // Context: Context object, database connection, API, etc
  // GraphQLResolveInfo

  Person: {
    name: (source: Person) => `${source.firstName} ${source.lastName}`,
    ownsSpaces: async (source: Record<string, unknown>) => {
      if (!source.id) return []
      const session = driver.session()
      try {
        const result = await session.executeRead(async (tx) => {
          return await tx.run(
            `
            MATCH (person:Person {id: $personId})-[:OWNS]->(space:Space)
            RETURN space
            `,
            { personId: source.id }
          )
        })
        return result.records.map((record) => {
          const space = record.get('space').properties
          const labels = record.get('space').labels
          return {
            ...space,
            __typename: labels.includes('WeSpace') ? 'WeSpace' : 'MeSpace',
          }
        })
      } finally {
        await session.close()
      }
    },
    memberOf: async (source: Record<string, unknown>) => {
      if (!source.id) return []
      const session = driver.session()
      try {
        const result = await session.executeRead(async (tx) => {
          return await tx.run(
            `
            MATCH (membership:SpaceMembership)-[:IS_MEMBER]->(person:Person {id: $personId})
            RETURN membership
            `,
            { personId: source.id }
          )
        })
        return result.records.map((record) => {
          const membership = record.get('membership').properties
          return {
            ...membership,
            __typename: 'SpaceMembership',
          }
        })
      } finally {
        await session.close()
      }
    },
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
        return result.records.map((record) => {
          const person = record.get('owner').properties
          return {
            ...person,
            __typename: 'Person',
          }
        })
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
        return result.records.map((record) => {
          const membership = record.get('membership').properties
          return {
            ...membership,
            __typename: 'SpaceMembership',
          }
        })
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
        return result.records.map((record) => {
          const context = record.get('context').properties
          return {
            ...context,
            __typename: 'FieldContext',
          }
        })
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
        return result.records.map((record) => {
          const person = record.get('owner').properties
          return {
            ...person,
            __typename: 'Person',
          }
        })
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
        return result.records.map((record) => {
          const membership = record.get('membership').properties
          return {
            ...membership,
            __typename: 'SpaceMembership',
          }
        })
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
        return result.records.map((record) => {
          const context = record.get('context').properties
          return {
            ...context,
            __typename: 'FieldContext',
          }
        })
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
        return result.records.map((record) => {
          const person = record.get('person').properties
          return {
            ...person,
            __typename: 'Person',
          }
        })
      } finally {
        await session.close()
      }
    },
    space: async (source: Record<string, unknown>) => {
      if (!source.id) return []
      const session = driver.session()
      try {
        const result = await session.executeRead(async (tx) => {
          return await tx.run(
            `
            MATCH (membership:SpaceMembership {id: $membershipId})<-[:HAS_MEMBER]-(space:Space)
            RETURN space
            `,
            { membershipId: source.id }
          )
        })
        return result.records.map((record) => {
          const space = record.get('space').properties
          const labels = record.get('space').labels
          return {
            ...space,
            __typename: labels.includes('WeSpace') ? 'WeSpace' : 'MeSpace',
          }
        })
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

  Space: {
    __resolveType: async (obj: Record<string, unknown>) => {
      // If __typename is already set, use it
      if (obj.__typename === 'MeSpace') return 'MeSpace'
      if (obj.__typename === 'WeSpace') return 'WeSpace'

      // Otherwise, query Neo4j to determine the actual type from labels
      if (obj.id) {
        const session = driver.session()
        try {
          const result = await session.executeRead(async (tx) => {
            return await tx.run(
              `MATCH (space:Space {id: $spaceId}) RETURN labels(space) as labels`,
              { spaceId: obj.id }
            )
          })
          if (result.records.length > 0) {
            const labels = result.records[0].get('labels')
            if (labels.includes('WeSpace')) return 'WeSpace'
            if (labels.includes('MeSpace')) return 'MeSpace'
          }
        } finally {
          await session.close()
        }
      }

      // Fallback to MeSpace if unable to determine
      return 'MeSpace'
    },
    owner: async (source: Record<string, unknown>) => {
      if (!source.id) return []
      const session = driver.session()
      try {
        const result = await session.executeRead(async (tx) => {
          return await tx.run(
            `
            MATCH (space:Space {id: $spaceId})<-[:OWNS]-(owner:Person)
            RETURN owner
            `,
            { spaceId: source.id }
          )
        })
        return result.records.map((record) => {
          const person = record.get('owner').properties
          return {
            ...person,
            __typename: 'Person',
          }
        })
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
            MATCH (space:Space {id: $spaceId})-[:HAS_MEMBER]->(membership:SpaceMembership)
            RETURN membership
            `,
            { spaceId: source.id }
          )
        })
        return result.records.map((record) => {
          const membership = record.get('membership').properties
          return {
            ...membership,
            __typename: 'SpaceMembership',
          }
        })
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
            MATCH (space:Space {id: $spaceId})-[:HAS_CONTEXT]->(context:FieldContext)
            RETURN context
            `,
            { spaceId: source.id }
          )
        })
        return result.records.map((record) => {
          const context = record.get('context').properties
          return {
            ...context,
            __typename: 'FieldContext',
          }
        })
      } finally {
        await session.close()
      }
    },
  },

  FieldPulse: {
    __resolveType: (obj: Record<string, unknown>) => {
      // The doc-ingestion list resolver already stamps __typename on extracted
      // pulses; respect it before falling back to property sniffing.
      if (
        obj.__typename === 'GoalPulse' ||
        obj.__typename === 'ResourcePulse' ||
        obj.__typename === 'StoryPulse' ||
        obj.__typename === 'CarePulse' ||
        obj.__typename === 'CoreValuePulse'
      ) {
        return obj.__typename
      }
      // Check discriminator properties to determine concrete type
      if ('status' in obj) return 'GoalPulse'
      if ('resourceType' in obj) return 'ResourcePulse'
      return 'StoryPulse' // Default fallback
    },
  },

  Document: documentTypeResolvers,

  Mutation: {
    ...chatbotResolvers,
    ...inviteMutations,
    ...connectionMutations,
    ...spaceMembershipResolvers,
    ...activityLogMutations,
    ...documentMutations,
    ...assistantFeedbackMutations,
  },
  Query: {
    ...relatedPeopleResolvers,
    ...searchResolvers,
    ...userLookupResolvers,
    ...activityLogQueries,
    ...documentQueries,
  },
}

export default resolvers
