import { Context } from '@/config/types'

type EntityRecord = Record<string, unknown>

interface SearchResults {
  people: EntityRecord[]
  communities: EntityRecord[]
  meSpaces: EntityRecord[]
  weSpaces: EntityRecord[]
  contexts: EntityRecord[]
  goalPulses: EntityRecord[]
  resourcePulses: EntityRecord[]
  storyPulses: EntityRecord[]
}

/**
 * Global search resolver that finds entities by substring matching.
 * Returns up to 10 results of each entity type.
 *
 * Searches:
 * - People: firstName, lastName, email
 * - Communities: name
 * - MeSpaces: name
 * - WeSpaces: name
 * - FieldContexts: title
 * - GoalPulses: content
 * - ResourcePulses: content
 * - StoryPulses: content
 */
export const searchResolvers = {
  searchAll: async (
    _parent: never,
    args: {
      query: string
    },
    context: Context
  ): Promise<SearchResults> => {
    // Extract user ID from context, or null if unauthenticated
    const currentUserId = context.jwt?.user.id || null

    // Require authentication to use search
    if (!currentUserId) {
      throw new Error('Authentication required to search. Please log in.')
    }

    // Create separate sessions for each query to avoid transaction conflicts
    const peopleSession = context.executionContext.session()
    const communitiesSession = context.executionContext.session()
    const meSpacesSession = context.executionContext.session()
    const weSpacesSession = context.executionContext.session()
    const contextsSession = context.executionContext.session()
    const goalPulsesSession = context.executionContext.session()
    const resourcePulsesSession = context.executionContext.session()
    const storyPulsesSession = context.executionContext.session()

    const searchTerm = args.query.toLowerCase()

    try {
      // Execute all searches in parallel using separate sessions
      const [
        peopleResult,
        communitiesResult,
        meSpacesResult,
        weSpacesResult,
        contextsResult,
        goalPulsesResult,
        resourcePulsesResult,
        storyPulsesResult,
      ] = await Promise.all([
        // Search people by firstName, lastName, or email
        peopleSession.executeRead((tx) =>
          tx.run(
            `
            MATCH (p:Person)
            WHERE 
              toLower(p.firstName) CONTAINS $searchTerm OR
              toLower(p.lastName) CONTAINS $searchTerm OR
              toLower(p.email) CONTAINS $searchTerm
            RETURN p
            LIMIT 10
            `,
            { searchTerm }
          )
        ),

        // Search communities by name
        communitiesSession.executeRead((tx) =>
          tx.run(
            `
            MATCH (c:Community)
            WHERE toLower(c.name) CONTAINS $searchTerm
            RETURN c
            LIMIT 10
            `,
            { searchTerm }
          )
        ),

        // Search MeSpaces by name - only if user is owner or member
        meSpacesSession.executeRead((tx) =>
          tx.run(
            `
            MATCH (s:MeSpace)
            WHERE toLower(s.name) CONTAINS $searchTerm
            AND $userId IS NOT NULL
            AND (
              EXISTS {
                MATCH (owner)-[r:OWNS]->(s)
                WHERE owner.id = $userId
              }
              OR
              EXISTS {
                MATCH (s)-[:HAS_MEMBER]->(sm:SpaceMembership)-[:IS_MEMBER]->(member)
                WHERE member.id = $userId
              }
            )
            RETURN s
            LIMIT 10
            `,
            { searchTerm, userId: currentUserId }
          )
        ),

        // Search WeSpaces by name - only if user is owner or member
        weSpacesSession.executeRead((tx) =>
          tx.run(
            `
            MATCH (s:WeSpace)
            WHERE toLower(s.name) CONTAINS $searchTerm
            AND $userId IS NOT NULL
            AND (
              EXISTS {
                MATCH (owner)-[r:OWNS]->(s)
                WHERE owner.id = $userId
              }
              OR
              EXISTS {
                MATCH (s)-[:HAS_MEMBER]->(sm:SpaceMembership)-[:IS_MEMBER]->(member)
                WHERE member.id = $userId
              }
            )
            RETURN s
            LIMIT 10
            `,
            { searchTerm, userId: currentUserId }
          )
        ),

        // Search FieldContexts by title
        contextsSession.executeRead((tx) =>
          tx.run(
            `
            MATCH (f:FieldContext)
            WHERE toLower(f.title) CONTAINS $searchTerm
            RETURN f
            LIMIT 10
            `,
            { searchTerm }
          )
        ),

        // Search GoalPulses by content
        goalPulsesSession.executeRead((tx) =>
          tx.run(
            `
            MATCH (p:GoalPulse)<-[:HAS_PULSE]-(ctx:FieldContext)
            WHERE toLower(p.content) CONTAINS $searchTerm
            RETURN p, ctx
            LIMIT 10
            `,
            { searchTerm }
          )
        ),

        // Search ResourcePulses by content
        resourcePulsesSession.executeRead((tx) =>
          tx.run(
            `
            MATCH (p:ResourcePulse)<-[:HAS_PULSE]-(ctx:FieldContext)
            WHERE toLower(p.content) CONTAINS $searchTerm
            RETURN p, ctx
            LIMIT 10
            `,
            { searchTerm }
          )
        ),

        // Search StoryPulses by content
        storyPulsesSession.executeRead((tx) =>
          tx.run(
            `
            MATCH (p:StoryPulse)<-[:HAS_PULSE]-(ctx:FieldContext)
            WHERE toLower(p.content) CONTAINS $searchTerm
            RETURN p, ctx
            LIMIT 10
            `,
            { searchTerm }
          )
        ),
      ])

      // Extract properties from Neo4j records
      const extractProperties = (
        records: Array<{ get: (key: string) => { properties: EntityRecord } }>,
        key: string
      ): EntityRecord[] => records.map((record) => record.get(key).properties)

      // Extract pulse properties with related context
      const extractPulsesWithContext = (
        records: Array<{ get: (key: string) => { properties: EntityRecord } }>,
        pulseKey: string,
        contextKey: string
      ): EntityRecord[] =>
        records.map((record) => {
          const pulse = record.get(pulseKey).properties
          const context = record.get(contextKey)?.properties
          return {
            ...pulse,
            context: context ? [context] : [],
          }
        })

      return {
        people: extractProperties(peopleResult.records, 'p'),
        communities: extractProperties(communitiesResult.records, 'c'),
        meSpaces: extractProperties(meSpacesResult.records, 's'),
        weSpaces: extractProperties(weSpacesResult.records, 's'),
        contexts: extractProperties(contextsResult.records, 'f'),
        goalPulses: extractPulsesWithContext(
          goalPulsesResult.records,
          'p',
          'ctx'
        ),
        resourcePulses: extractPulsesWithContext(
          resourcePulsesResult.records,
          'p',
          'ctx'
        ),
        storyPulses: extractPulsesWithContext(
          storyPulsesResult.records,
          'p',
          'ctx'
        ),
      }
    } catch (error) {
      console.error('❌ Search error:', error)
      throw error
    } finally {
      // Close all sessions
      await Promise.all([
        peopleSession.close(),
        communitiesSession.close(),
        meSpacesSession.close(),
        weSpacesSession.close(),
        contextsSession.close(),
        goalPulsesSession.close(),
        resourcePulsesSession.close(),
        storyPulsesSession.close(),
      ])
    }
  },
}
