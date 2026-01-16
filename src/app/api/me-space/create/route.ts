import { NextRequest, NextResponse } from 'next/server'
import { getSession, initializeDB } from '../../auth/neo4j'
import { parseRequestBody } from '../../auth/utils'
import { parseError } from '@/utils'
import { z } from 'zod'

const createMeSpaceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
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

    const parseResult = createMeSpaceSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseError(parseResult.error) },
        { status: 400 }
      )
    }

    const { name, description, userId } = parseResult.data

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

      // Create new MeSpace
      const result = await session.run(
        `MATCH (person:Person {id: $userId})
        CREATE (meSpace:Space:MeSpace {
          id: apoc.create.uuid(),
          name: $name,
          description: $description,
          visibility: 'PRIVATE',
          createdAt: datetime()
        })
        CREATE (person)-[:OWNS]->(meSpace)
        RETURN meSpace`,
        {
          userId,
          name,
          description: description || '',
        }
      )

      if (result.records.length === 0) {
        return NextResponse.json(
          { error: 'Failed to create MeSpace' },
          { status: 500 }
        )
      }

      const meSpace = result.records[0].get('meSpace')

      return NextResponse.json(
        {
          message: 'MeSpace created successfully',
          meSpace: {
            id: meSpace.properties.id,
            name: meSpace.properties.name,
            description: meSpace.properties.description,
          },
        },
        { status: 201 }
      )
    } catch (err) {
      return NextResponse.json(
        { error: 'Failed to create MeSpace: ' + parseError(err) },
        { status: 500 }
      )
    } finally {
      await session.close()
    }
  } catch (error) {
    return NextResponse.json({ error: parseError(error) }, { status: 500 })
  }
}
