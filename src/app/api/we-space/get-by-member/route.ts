import { NextRequest, NextResponse } from 'next/server'
import { initGraph } from '@/modules/graph'

/**
 * GET /api/we-space/get-by-member?userId={userId}
 *
 * Fetches all WeSpaces where the user is a member or owner.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      )
    }

    const graph = await initGraph()

    // Query to get WeSpaces where user is a member OR owner
    // Also fetch member count and context (field) count for each space
    const query = `
      MATCH (person:Person {id: $userId})
      
      // Find spaces where user is a member
      OPTIONAL MATCH (memberSpace:WeSpace)-[:HAS_MEMBER]->(person)
      
      // Find spaces where user is the owner
      OPTIONAL MATCH (ownedSpace:WeSpace)<-[:OWNS]-(person)
      
      // Combine both types of spaces
      WITH collect(DISTINCT memberSpace) + collect(DISTINCT ownedSpace) as allSpaces
      UNWIND allSpaces as space
      WITH space
      WHERE space IS NOT NULL
      
      // Get member count for each space
      OPTIONAL MATCH (space)-[:HAS_MEMBER]->(member)
      WITH DISTINCT space, count(DISTINCT member) as memberCount
      
      // Get context/field count for each space
      OPTIONAL MATCH (space)-[:HAS_CONTEXT]->(context:FieldContext)
      WITH space, memberCount, count(DISTINCT context) as contextCount
      
      RETURN DISTINCT 
        space.id as id,
        space.name as name,
        space.visibility as visibility,
        space.createdAt as createdAt,
        memberCount,
        contextCount
      ORDER BY space.createdAt DESC
    `

    const result = await graph.query<{
      id: string
      name: string
      visibility: string
      createdAt: string
      memberCount: number
      contextCount: number
    }>(query, { userId })

    return NextResponse.json({
      success: true,
      spaces: result,
      count: result.length,
    })
  } catch (error) {
    console.error('Error fetching WeSpaces by member:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
