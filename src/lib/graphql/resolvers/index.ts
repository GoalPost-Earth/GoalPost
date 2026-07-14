import { Person } from '@/gql/graphql'
import { chatbotResolvers } from './chatbot-resolvers'
import { relatedPeopleResolvers } from './related-people-resolver'
import { searchResolvers } from './search-resolver'
import { spaceMembershipResolvers } from './space-membership-resolver'
import { userLookupResolvers } from './user-lookup-resolver'
import { connectionMutations } from './connection-resolver'
import { personPulseMutations } from './person-pulse-resolver'
import { fieldContextPeopleMutations } from './field-context-people-resolver'
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
import {
  notificationMutations,
  notificationQueries,
} from './notification-resolver'
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
    __resolveType: async (obj: Record<string, unknown>) => {
      // The doc-ingestion list resolver already stamps __typename on extracted
      // pulses; respect it before hitting the database.
      if (
        obj.__typename === 'GoalPulse' ||
        obj.__typename === 'ResourcePulse' ||
        obj.__typename === 'StoryPulse' ||
        obj.__typename === 'CarePulse' ||
        obj.__typename === 'CoreValuePulse'
      ) {
        return obj.__typename
      }

      // Library-generated interface paths (PromiseWeave.weaves,
      // FieldContext.pulses, ResonanceLink.source/target, ...) embed the
      // concrete type name as `__resolveType` in every member row —
      // @neo4j/graphql's own generated resolver just reads it, and this
      // custom resolver shadows that. Reading it here keeps those paths
      // zero-cost and consistent with the fragment fields the library
      // actually projected for the row (GOAL-286).
      if (
        obj.__resolveType === 'GoalPulse' ||
        obj.__resolveType === 'ResourcePulse' ||
        obj.__resolveType === 'StoryPulse' ||
        obj.__resolveType === 'CarePulse' ||
        obj.__resolveType === 'CoreValuePulse'
      ) {
        return obj.__resolveType
      }

      // Resolve from node labels — the source of truth for custom resolvers
      // that return raw node properties without stamping a type. Mirrors
      // Space.__resolveType above. Property sniffing is NOT reliable here
      // (GOAL-286): the old sniff defaulted everything without a
      // discriminator field to StoryPulse (how this bug surfaced), and on
      // full-property objects it misfired the other way, because the
      // migration normalized `status` onto every legacy pulse (kb/08),
      // typing migrated Resources/Stories as GoalPulse.
      if (obj.id) {
        const session = driver.session()
        try {
          const result = await session.executeRead(async (tx) => {
            return await tx.run(
              `MATCH (pulse:FieldPulse {id: $pulseId}) RETURN labels(pulse) as labels`,
              { pulseId: obj.id }
            )
          })
          if (result.records.length > 0) {
            const labels: string[] = result.records[0].get('labels')
            if (labels.includes('GoalPulse')) return 'GoalPulse'
            if (labels.includes('ResourcePulse')) return 'ResourcePulse'
            if (labels.includes('CarePulse')) return 'CarePulse'
            // Value-marker before StoryPulse: an un-backfilled env (pre
            // GOAL-287) still holds migrated values as :StoryPulse:CoreValue,
            // and a value merged into story is still a value.
            if (
              labels.includes('CoreValuePulse') ||
              labels.includes('CoreValue')
            ) {
              return 'CoreValuePulse'
            }
            if (labels.includes('StoryPulse')) return 'StoryPulse'
          }
        } finally {
          await session.close()
        }
      }

      // Last resort for objects with no id (should not happen — id is ID!
      // on the interface). resourceType before status: resourceType is
      // Resource-only, while status exists on many migrated pulses.
      if ('resourceType' in obj) return 'ResourcePulse'
      if ('status' in obj) return 'GoalPulse'
      return 'StoryPulse'
    },
  },

  Document: documentTypeResolvers,

  Mutation: {
    ...chatbotResolvers,
    ...connectionMutations,
    ...personPulseMutations,
    ...fieldContextPeopleMutations,
    ...spaceMembershipResolvers,
    ...activityLogMutations,
    ...documentMutations,
    ...assistantFeedbackMutations,
    ...notificationMutations,
  },
  Query: {
    ...relatedPeopleResolvers,
    ...searchResolvers,
    ...userLookupResolvers,
    ...activityLogQueries,
    ...documentQueries,
    ...notificationQueries,
  },
}

export default resolvers
