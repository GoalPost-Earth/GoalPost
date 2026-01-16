import { NextRequest, NextResponse } from 'next/server'
import { getSession, initializeDB } from '../../auth/neo4j'
import { parseRequestBody } from '../../auth/utils'
import { parseError } from '@/utils'
import { z } from 'zod'

const getUserMeSpacesSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
})

export async function POST(req: NextRequest) {
  try {
    if (req.method !== 'POST') {
      return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })
    }

    const parseResultBody = await parseRequestBody(req)
    if (!parseResultBody.ok) {
      return NextResponse.json(
        { error: parseResultBody.error },
        { status: parseResultBody.status }
      )
    }
    const body = parseResultBody.body

    const parseResult = getUserMeSpacesSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseError(parseResult.error) },
        { status: 400 }
      )
    }

    const { userId } = parseResult.data

    initializeDB()
    const session = getSession()

    try {
      // Verify user exists
      const userExists = await session.run(
        `MATCH (u:Person {id: $userId}) RETURN u LIMIT 1`,
        { userId }
      )

      if (userExists.records.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Fetch all meSpaces owned by the user
      const result = await session.run(
        `MATCH (person:Person {id: $userId})-[:OWNS]->(ms:MeSpace)
        RETURN ms.id as id, ms.name as name, ms.description as description, ms.createdAt as createdAt
        ORDER BY ms.createdAt DESC`,
        { userId }
      )

      const meSpaces = result.records.map((record) => ({
        id: record.get('id'),
        name: record.get('name'),
        description: record.get('description') || '',
        createdAt: record.get('createdAt'),
      }))

      return NextResponse.json(
        {
          success: true,
          meSpaces,
          count: meSpaces.length,
        },
        { status: 200 }
      )
    } catch (err) {
      return NextResponse.json(
        { error: 'Failed to fetch meSpaces: ' + parseError(err) },
        { status: 500 }
      )
    } finally {
      await session.close()
    }
  } catch (error) {
    return NextResponse.json({ error: parseError(error) }, { status: 500 })
  }
}
