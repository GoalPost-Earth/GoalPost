import { DynamicStructuredTool } from '@langchain/community/tools/dynamic'
import { z } from 'zod'
import { Neo4jGraph } from '@langchain/community/graphs/neo4j_graph'

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
 * Creates a space search tool that queries Neo4j for spaces by name.
 *
 * Results are scoped to spaces the authenticated user OWNS or is a MEMBER of,
 * per the Space-based authorization model in `kb/02-user-roles.md`. Passing
 * `userId = null` is treated as an unauthenticated call and returns an error
 * to the agent — the previous behavior of returning every Space in the graph
 * leaked unrelated MeSpaces / WeSpaces and was the root cause of the agent
 * "failing to find spaces" (the user's own space was buried under unrelated
 * matches).
 */
export function createSpaceSearchTool(
  graph: Neo4jGraph,
  userId: string | null
): DynamicStructuredTool {
  return new DynamicStructuredTool({
    name: 'search_space_by_name',
    description: `Search the current user's spaces in GoalPost by name. Only returns spaces the user owns or is a member of (MeSpace or WeSpace). Returns space information if found, indicates when no match exists, or asks for clarification when multiple spaces match.`,
    schema: SpaceSearchSchema as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    func: async (input: z.infer<typeof SpaceSearchSchema>): Promise<string> => {
      const { name } = input

      if (!userId) {
        return JSON.stringify({
          found: false,
          count: 0,
          message:
            'I could not identify the current user, so I cannot search spaces. Please sign in and try again.',
          needsDisambiguation: false,
        })
      }

      // Scope to spaces the user OWNS or is a MEMBER of via SpaceMembership.
      // Pattern mirrors get_my_spaces in src/lib/simulation/chat-tools.ts and
      // the resolvers in src/lib/graphql/resolvers/space-membership-resolver.ts.
      const query = `
        MATCH (user:Person {id: $userId})
        OPTIONAL MATCH (user)-[:OWNS]->(owned:Space)
        OPTIONAL MATCH (user)<-[:IS_MEMBER]-(:SpaceMembership)<-[:HAS_MEMBER]-(member:Space)
        WITH collect(DISTINCT owned) + collect(DISTINCT member) AS userSpaces
        UNWIND userSpaces AS space
        WITH DISTINCT space
        WHERE space IS NOT NULL
          AND (
            toLower(coalesce(space.name, '')) CONTAINS toLower($name)
            OR toLower(coalesce(space.name, '')) STARTS WITH toLower($name)
          )
        WITH space,
             CASE
               WHEN space:MeSpace THEN 'MeSpace'
               WHEN space:WeSpace THEN 'WeSpace'
               ELSE 'Unknown'
             END AS spaceType
        OPTIONAL MATCH (owner:Person)-[:OWNS]->(space)
        WITH space, spaceType, count(DISTINCT owner) AS ownerCount
        OPTIONAL MATCH (space)-[:HAS_MEMBER]->(:SpaceMembership)-[:IS_MEMBER]->(memberPerson:Person)
        WITH space, spaceType, ownerCount, count(DISTINCT memberPerson) AS memberCount
        OPTIONAL MATCH (space)-[:HAS_CONTEXT]->(context:FieldContext)
        WITH space, spaceType, ownerCount, memberCount, count(DISTINCT context) AS contextCount
        RETURN
          space.id AS id,
          space.name AS name,
          spaceType AS type,
          space.visibility AS visibility,
          space.createdAt AS createdAt,
          ownerCount AS ownerCount,
          memberCount AS memberCount,
          contextCount AS contextCount,
          space.description AS description
        ORDER BY
          CASE WHEN toLower(space.name) = toLower($name) THEN 0
               WHEN toLower(space.name) STARTS WITH toLower($name) THEN 1
               ELSE 2 END,
          space.name
        LIMIT 10
      `

      try {
        const results = await graph.query(query, { name, userId })

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

        if (results.length === 0) {
          result.message = `I searched your spaces in GoalPost but could not find any space matching "${name}". Would you like me to list the spaces you do have, or help you create a new one?`
          return JSON.stringify(result)
        }

        if (results.length === 1) {
          const space = results[0]
          result.message = `I found the space: **${space.name}**
- Type: ${space.type === 'MeSpace' ? 'Personal Space' : 'Collaborative Space'}
- Visibility: ${space.visibility}
- Owners: ${space.ownerCount || 0}
- Members: ${space.memberCount || 0}
- Contexts: ${space.contextCount || 0}

Would you like me to rename this space or perform any other action?`
          return JSON.stringify(result)
        }

        const spacesList = results
          .map((s, idx) => {
            const details: string[] = []
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
      } catch (error) {
        console.error('[search_space_by_name] error:', error)
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
