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
    const session = context.executionContext.session()
    const searchTerm = `%${args.query}%`.toUpperCase()

    try {
      // Execute all searches in parallel
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
        session.run(
          `
          MATCH (p:Person)
          WHERE 
            UPPER(p.firstName) CONTAINS $searchTerm OR
            UPPER(p.lastName) CONTAINS $searchTerm OR
            UPPER(p.email) CONTAINS $searchTerm
          RETURN p
          LIMIT 10
          `,
          { searchTerm }
        ),

        // Search communities by name
        session.run(
          `
          MATCH (c:Community)
          WHERE UPPER(c.name) CONTAINS $searchTerm
          RETURN c
          LIMIT 10
          `,
          { searchTerm }
        ),

        // Search MeSpaces by name
        session.run(
          `
          MATCH (s:MeSpace)
          WHERE UPPER(s.name) CONTAINS $searchTerm
          RETURN s
          LIMIT 10
          `,
          { searchTerm }
        ),

        // Search WeSpaces by name
        session.run(
          `
          MATCH (s:WeSpace)
          WHERE UPPER(s.name) CONTAINS $searchTerm
          RETURN s
          LIMIT 10
          `,
          { searchTerm }
        ),

        // Search FieldContexts by title
        session.run(
          `
          MATCH (f:FieldContext)
          WHERE UPPER(f.title) CONTAINS $searchTerm
          RETURN f
          LIMIT 10
          `,
          { searchTerm }
        ),

        // Search GoalPulses by content
        session.run(
          `
          MATCH (p:GoalPulse)
          WHERE UPPER(p.content) CONTAINS $searchTerm
          RETURN p
          LIMIT 10
          `,
          { searchTerm }
        ),

        // Search ResourcePulses by content
        session.run(
          `
          MATCH (p:ResourcePulse)
          WHERE UPPER(p.content) CONTAINS $searchTerm
          RETURN p
          LIMIT 10
          `,
          { searchTerm }
        ),

        // Search StoryPulses by content
        session.run(
          `
          MATCH (p:StoryPulse)
          WHERE UPPER(p.content) CONTAINS $searchTerm
          RETURN p
          LIMIT 10
          `,
          { searchTerm }
        ),
      ])

      // Extract properties from Neo4j records
      const extractProperties = (
        records: Array<{ get: (key: string) => { properties: EntityRecord } }>
      ): EntityRecord[] =>
        records.map((record) => record.get(record.keys[0]).properties)

      return {
        people: extractProperties(peopleResult.records),
        communities: extractProperties(communitiesResult.records),
        meSpaces: extractProperties(meSpacesResult.records),
        weSpaces: extractProperties(weSpacesResult.records),
        contexts: extractProperties(contextsResult.records),
        goalPulses: extractProperties(goalPulsesResult.records),
        resourcePulses: extractProperties(resourcePulsesResult.records),
        storyPulses: extractProperties(storyPulsesResult.records),
      }
    } catch (error) {
      console.error('❌ Search error:', error)
      throw error
    }
  },
}
