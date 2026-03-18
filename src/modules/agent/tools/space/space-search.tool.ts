import { DynamicStructuredTool } from '@langchain/community/tools/dynamic'
import { z } from 'zod'
import { Neo4jGraph } from '@langchain/community/graphs/neo4j_graph'

/**
 * Space Search Tool Schema
 */
const SpaceSearchSchema = z.object({
  name: z
    .string()
    .describe('The name or partial name of the space to search for'),
})

export interface SpaceSearchResult {
  found: boolean
  count: number
  spaces?: Array<{
    id: string
    name: string
    type: 'MeSpace' | 'WeSpace'
    visibility: string
    createdAt?: string
    ownerCount?: number
    memberCount?: number
    contextCount?: number
    description?: string
  }>
  message: string
  needsDisambiguation: boolean
}

/**
 * Creates a space search tool that queries Neo4j for spaces by name
 * Handles both MeSpace (personal) and WeSpace (collaborative) spaces
 */
export function createSpaceSearchTool(
  graph: Neo4jGraph
): DynamicStructuredTool {
  return new DynamicStructuredTool({
    name: 'search_space_by_name',
    description: `Search for a specific space in GoalPost by its name. 
    Use this tool when the user asks about finding, searching for, or listing spaces.
    This tool will return space details including type (personal or collaborative), visibility, and member information.
    Returns space information if found, indicates when no match exists, or asks for clarification when multiple spaces match.`,
    schema: SpaceSearchSchema as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    func: async (input: z.infer<typeof SpaceSearchSchema>): Promise<string> => {
      const { name } = input

      // Build a flexible Cypher query that searches for spaces by name
      // Matches both MeSpace and WeSpace with case-insensitive search
      const query = `
        MATCH (space:Space)
        WHERE 
          // Match if search term is contained in space name
          toLower(coalesce(space.name, '')) CONTAINS toLower($name)
          // Match if space name starts with search term
          OR toLower(coalesce(space.name, '')) STARTS WITH toLower($name)
        WITH space
        // Get space type (MeSpace or WeSpace)
        OPTIONAL MATCH (space:MeSpace) WHERE space:MeSpace
        WITH space, 
             CASE 
               WHEN space:MeSpace THEN 'MeSpace'
               WHEN space:WeSpace THEN 'WeSpace'
               ELSE 'Unknown'
             END as spaceType
        // Get owner information
        OPTIONAL MATCH (owner:Person)-[:OWNS]->(space)
        WITH space, spaceType, collect(DISTINCT owner.id) as ownerIds, count(DISTINCT owner) as ownerCount
        // Get member information (from SpaceMembership relationships)
        OPTIONAL MATCH (space)-[:SPACE_MEMBERS]->(membership:SpaceMembership)-[:MEMBER]->(member:Person)
        WITH space, spaceType, ownerCount, collect(DISTINCT member.id) as memberIds, count(DISTINCT member) as memberCount
        // Get context information
        OPTIONAL MATCH (space)-[:HAS_CONTEXT]->(context:FieldContext)
        WITH space, spaceType, ownerCount, memberCount, collect(DISTINCT context.id) as contextIds, count(DISTINCT context) as contextCount
        RETURN 
          elementId(space) as id,
          space.name as name,
          spaceType as type,
          space.visibility as visibility,
          space.createdAt as createdAt,
          ownerCount as ownerCount,
          memberCount as memberCount,
          contextCount as contextCount,
          space.description as description
        ORDER BY 
          // Prioritize exact name matches
          CASE WHEN toLower(space.name) = toLower($name) THEN 0
               WHEN toLower(space.name) STARTS WITH toLower($name) THEN 1
               ELSE 2 END,
          space.name
        LIMIT 10
      `

      console.log('🔍 [DEBUG] Executing space search for:', name)

      try {
        const results = await graph.query(query, { name })
        console.log(
          '🔍 [DEBUG] Space search returned',
          results?.length || 0,
          'results'
        )

        if (!results) {
          return JSON.stringify({
            found: false,
            count: 0,
            message: `I encountered an error while searching for spaces named "${name}". Please try again.`,
            needsDisambiguation: false,
          })
        }

        const result: SpaceSearchResult = {
          found: results.length > 0,
          count: results.length,
          spaces: results as any, // eslint-disable-line @typescript-eslint/no-explicit-any
          message: '',
          needsDisambiguation: results.length > 1,
        }

        // Case 1: No space found
        if (results.length === 0) {
          console.log('❌ [DEBUG] No space found for:', name)
          result.message = `I searched GoalPost but could not find any space matching "${name}". There is no space with that name in the system. Would you like me to help you create a new space, or search for a different space?`
          return JSON.stringify(result)
        }

        // Case 2: Single space found
        if (results.length === 1) {
          const space = results[0]
          console.log('✅ [DEBUG] Single space found:', space.name)
          result.message = `I found the space: **${space.name}**
- Type: ${space.type === 'MeSpace' ? 'Personal Space' : 'Collaborative Space'}
- Visibility: ${space.visibility}
- Owners: ${space.ownerCount || 0}
- Members: ${space.memberCount || 0}
- Contexts: ${space.contextCount || 0}

Would you like me to rename this space or perform any other action?`
          return JSON.stringify(result)
        }

        // Case 3: Multiple spaces found - need disambiguation
        if (results.length > 1) {
          console.log(
            '🔀 [DEBUG] Multiple space matches found:',
            results.length
          )
          const spacesList = results
            .map((s, idx) => {
              const details = []
              if (s.type) details.push(`${s.type}`)
              if (s.visibility) details.push(`${s.visibility}`)
              if (s.memberCount) details.push(`${s.memberCount} members`)
              return `${idx + 1}. **${s.name}** (${details.join(', ')})`
            })
            .join('\n')

          result.message = `I found ${results.length} spaces matching "${name}":

${spacesList}

Could you please clarify which space you're referring to by its number or provide a more specific name?`
          return JSON.stringify(result)
        }

        return JSON.stringify(result)
      } catch (error) {
        console.error('❌ [DEBUG] Space search error:', error)
        return JSON.stringify({
          found: false,
          count: 0,
          message: `An error occurred while searching for spaces: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
          needsDisambiguation: false,
        })
      }
    },
  })
}
