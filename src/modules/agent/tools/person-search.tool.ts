import { DynamicStructuredTool } from '@langchain/community/tools/dynamic'
import { z } from 'zod'
import { Neo4jGraph } from '@langchain/community/graphs/neo4j_graph'

/**
 * Person Search Tool Schema
 */
const PersonSearchSchema = z.object({
  name: z
    .string()
    .describe(
      'The first name, last name, or full name of the person to search for'
    ),
})

export interface PersonSearchResult {
  found: boolean
  count: number
  people?: Array<{
    id: string
    firstName: string
    lastName: string
    name: string
    email?: string
    pronouns?: string
    location?: string
    photo?: string
    status: string
    passions?: string
    traits?: string
    interests?: string
    fieldsOfCare?: string
    favorites?: string
    communities?: string[]
    connectionCount?: number
  }>
  message: string
  needsDisambiguation: boolean
}

/**
 * Creates a person search tool that queries Neo4j for people by name
 * and handles disambiguation when multiple matches exist
 */
export function createPersonSearchTool(
  graph: Neo4jGraph
): DynamicStructuredTool {
  return new DynamicStructuredTool({
    name: 'search_person_by_name',
    description: `Search for a specific person in the GoalPost community by their name. 
    Use this tool when the user asks about a specific person, wants to find someone, or requests profile information.
    This tool will return person details if found, indicate when no match exists, or ask for clarification when multiple people match.`,
    schema: PersonSearchSchema as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    func: async (
      input: z.infer<typeof PersonSearchSchema>
    ): Promise<string> => {
      const { name } = input

      // Build a very flexible Cypher query that handles:
      // - Single first name: "Robert" matches "Robert Damaschke"
      // - Single last name: "Damaschke" matches "Robert Damaschke"
      // - Full name: "Robert Damaschke" matches exactly
      // - Partial matches: "Rob" matches "Robert"
      // - Case insensitive matching
      const query = `
        MATCH (p:Person)
        WHERE 
          // Match if search term is contained in first name
          toLower(coalesce(p.firstName, '')) CONTAINS toLower($name)
          // Match if search term is contained in last name
          OR toLower(coalesce(p.lastName, '')) CONTAINS toLower($name)
          // Match if search term matches full name
          OR toLower(coalesce(p.firstName, '') + ' ' + coalesce(p.lastName, '')) CONTAINS toLower($name)
          // Match if first name starts with search term (for "Rob" -> "Robert")
          OR toLower(coalesce(p.firstName, '')) STARTS WITH toLower($name)
          // Match if last name starts with search term
          OR toLower(coalesce(p.lastName, '')) STARTS WITH toLower($name)
        OPTIONAL MATCH (p)-[:BELONGS_TO]->(c:Community)
        OPTIONAL MATCH (p)-[:CONNECTED_TO]-(conn:Person)
        WITH p, 
             collect(DISTINCT c.name) as communities,
             count(DISTINCT conn) as connectionCount
        RETURN 
          elementId(p) as id,
          p.firstName as firstName,
          p.lastName as lastName,
          coalesce(p.firstName, '') + ' ' + coalesce(p.lastName, '') as name,
          p.email as email,
          p.pronouns as pronouns,
          p.location as location,
          p.photo as photo,
          p.status as status,
          p.passions as passions,
          p.traits as traits,
          p.interests as interests,
          p.fieldsOfCare as fieldsOfCare,
          p.favorites as favorites,
          communities,
          connectionCount
        ORDER BY 
          // Prioritize exact first name matches
          CASE WHEN toLower(p.firstName) = toLower($name) THEN 0
               WHEN toLower(p.lastName) = toLower($name) THEN 1
               WHEN toLower(p.firstName) STARTS WITH toLower($name) THEN 2
               ELSE 3 END,
          p.firstName
        LIMIT 10
      `

      console.log('🔍 [DEBUG] Executing person search for:', name)

      try {
        const results = await graph.query(query, { name })
        console.log(
          '🔍 [DEBUG] Query returned',
          results?.length || 0,
          'results'
        )

        if (!results) {
          return JSON.stringify({
            found: false,
            count: 0,
            message: `I encountered an error while searching for "${name}". Please try again.`,
            needsDisambiguation: false,
          })
        }

        const result: PersonSearchResult = {
          found: results.length > 0,
          count: results.length,
          people: results as any, // eslint-disable-line @typescript-eslint/no-explicit-any
          message: '',
          needsDisambiguation: results.length > 1,
        }

        // Case 1: No person found
        if (results.length === 0) {
          console.log('❌ [DEBUG] No person found for:', name)
          result.message = `I searched the GoalPost database but could not find any person matching "${name}". There is no information about such a person in our community database. Would you like me to help you search for someone else, or explore other aspects of the community?`
          return JSON.stringify(result)
        }

        // Case 2: Multiple people found - need disambiguation
        if (results.length > 1) {
          console.log('🔀 [DEBUG] Multiple matches found:', results.length)
          const peopleList = results
            .map((p, idx) => {
              const details = []
              if (p.location) details.push(`from ${p.location}`)
              if (p.pronouns) details.push(`${p.pronouns}`)
              const communityInfo = p.communities?.length
                ? ` (member of ${p.communities.slice(0, 2).join(', ')}${p.communities.length > 2 ? ', ...' : ''})`
                : ''

              return `${idx + 1}. ${p.name}${details.length ? ' - ' + details.join(', ') : ''}${communityInfo}`
            })
            .join('\n')

          result.message = `I found ${results.length} people matching "${name}" in the GoalPost community:\n\n${peopleList}\n\nCould you please clarify which person you're interested in? You can mention their location, community, or any other distinguishing detail.`
          return JSON.stringify(result)
        }

        // Case 3: Exact match - return profile data
        const person = results[0]
        console.log('✅ [DEBUG] Found person:', person.name)
        result.message = `PERSON_PROFILE_FOUND: ${JSON.stringify(person)}`

        return JSON.stringify(result)
      } catch (error) {
        console.error('Error searching for person:', error)
        return JSON.stringify({
          found: false,
          count: 0,
          message: `I encountered an error while searching for "${name}". Please try again or rephrase your question.`,
          needsDisambiguation: false,
        })
      }
    },
  })
}
