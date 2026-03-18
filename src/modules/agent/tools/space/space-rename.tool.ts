import { DynamicStructuredTool } from '@langchain/community/tools/dynamic'
import { z } from 'zod'
import { Neo4jGraph } from '@langchain/community/graphs/neo4j_graph'

/**
 * Space Rename Tool Schema
 */
const SpaceRenameSchema = z.object({
  currentName: z.string().describe('The current name of the space to rename'),
  newName: z.string().describe('The new name for the space'),
})

export interface SpaceRenameResult {
  success: boolean
  spaceId?: string
  oldName?: string
  newName?: string
  message: string
}

/**
 * Creates a space rename tool that updates a space's name in Neo4j
 * Supports both MeSpace (personal) and WeSpace (collaborative) spaces
 */
export function createSpaceRenameTool(
  graph: Neo4jGraph
): DynamicStructuredTool {
  return new DynamicStructuredTool({
    name: 'rename_space',
    description: `Rename a space in GoalPost. 
    Use this tool when the user wants to change the name of a space.
    Provide both the current space name and the desired new name.
    This will update the space name for both personal (MeSpace) and collaborative (WeSpace) spaces.`,
    schema: SpaceRenameSchema as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    func: async (input: z.infer<typeof SpaceRenameSchema>): Promise<string> => {
      const { currentName, newName } = input

      // Validate input
      if (!currentName || !newName) {
        return JSON.stringify({
          success: false,
          message: 'Both current space name and new name are required.',
        })
      }

      if (currentName.trim() === newName.trim()) {
        return JSON.stringify({
          success: false,
          message: `The new name is the same as the current name. Please provide a different name.`,
        })
      }

      if (newName.trim().length === 0) {
        return JSON.stringify({
          success: false,
          message: 'The new space name cannot be empty.',
        })
      }

      console.log(
        `🔄 [DEBUG] Attempting to rename space from "${currentName}" to "${newName}"`
      )

      try {
        // Step 1: Find the space by current name
        const findQuery = `
          MATCH (space:Space)
          WHERE toLower(space.name) = toLower($currentName)
          RETURN 
            elementId(space) as id,
            space.name as name,
            CASE 
              WHEN space:MeSpace THEN 'MeSpace'
              WHEN space:WeSpace THEN 'WeSpace'
              ELSE 'Unknown'
            END as type
          LIMIT 1
        `

        const findResults = await graph.query(findQuery, {
          currentName: currentName.trim(),
        })

        if (!findResults || findResults.length === 0) {
          console.log('❌ [DEBUG] Space not found:', currentName)
          return JSON.stringify({
            success: false,
            message: `I could not find a space named "${currentName}". Please verify the space name and try again.`,
          })
        }

        const spaceInfo = findResults[0]
        const spaceId = spaceInfo.id

        // Step 2: Update the space name
        const updateQuery = `
          MATCH (space:Space)
          WHERE elementId(space) = $spaceId
          SET space.name = $newName,
              space.updatedAt = datetime()
          RETURN 
            elementId(space) as id,
            space.name as name,
            CASE 
              WHEN space:MeSpace THEN 'MeSpace'
              WHEN space:WeSpace THEN 'WeSpace'
              ELSE 'Unknown'
            END as type
        `

        const updateResults = await graph.query(updateQuery, {
          spaceId,
          newName: newName.trim(),
        })

        if (!updateResults || updateResults.length === 0) {
          console.log('❌ [DEBUG] Failed to update space:', spaceId)
          return JSON.stringify({
            success: false,
            message: `An error occurred while renaming the space. Please try again.`,
          })
        }

        const updatedSpace = updateResults[0]
        console.log(`✅ [DEBUG] Space renamed successfully:`, updatedSpace.name)

        return JSON.stringify({
          success: true,
          spaceId: updatedSpace.id,
          oldName: currentName,
          newName: updatedSpace.name,
          message: `✅ Space successfully renamed!

**${currentName}** → **${updatedSpace.name}**

The space "${updatedSpace.name}" is now updated and ready to use.`,
        })
      } catch (error) {
        console.error('❌ [DEBUG] Space rename error:', error)
        return JSON.stringify({
          success: false,
          message: `An error occurred while renaming the space: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        })
      }
    },
  })
}
