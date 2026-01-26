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
    console.log('🚀 ~ search-resolver.ts:49 ~ searchTerm:', searchTerm)

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

        // Search MeSpaces by name
        meSpacesSession.executeRead((tx) =>
          tx.run(
            `
            MATCH (s:MeSpace)
            WHERE toLower(s.name) CONTAINS $searchTerm
            RETURN s
            LIMIT 10
            `,
            { searchTerm }
          )
        ),

        // Search WeSpaces by name
        weSpacesSession.executeRead((tx) =>
          tx.run(
            `
            MATCH (s:WeSpace)
            WHERE toLower(s.name) CONTAINS $searchTerm
            RETURN s
            LIMIT 10
            `,
            { searchTerm }
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
            MATCH (p:GoalPulse)
            WHERE toLower(p.content) CONTAINS $searchTerm
            RETURN p
            LIMIT 10
            `,
            { searchTerm }
          )
        ),

        // Search ResourcePulses by content
        resourcePulsesSession.executeRead((tx) =>
          tx.run(
            `
            MATCH (p:ResourcePulse)
            WHERE toLower(p.content) CONTAINS $searchTerm
            RETURN p
            LIMIT 10
            `,
            { searchTerm }
          )
        ),

        // Search StoryPulses by content
        storyPulsesSession.executeRead((tx) =>
          tx.run(
            `
            MATCH (p:StoryPulse)
            WHERE toLower(p.content) CONTAINS $searchTerm
            RETURN p
            LIMIT 10
            `,
            { searchTerm }
          )
        ),
      ])
      console.log('🚀 ~ search-resolver.ts:170 ~ peopleResult:', peopleResult)

      // Extract properties from Neo4j records
      const extractProperties = (
        records: Array<{ get: (key: string) => { properties: EntityRecord } }>,
        key: string
      ): EntityRecord[] => records.map((record) => record.get(key).properties)

      return {
        people: extractProperties(peopleResult.records, 'p'),
        communities: extractProperties(communitiesResult.records, 'c'),
        meSpaces: extractProperties(meSpacesResult.records, 's'),
        weSpaces: extractProperties(weSpacesResult.records, 's'),
        contexts: extractProperties(contextsResult.records, 'f'),
        goalPulses: extractProperties(goalPulsesResult.records, 'p'),
        resourcePulses: extractProperties(resourcePulsesResult.records, 'p'),
        storyPulses: extractProperties(storyPulsesResult.records, 'p'),
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
