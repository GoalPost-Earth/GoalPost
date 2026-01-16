import { NextRequest, NextResponse } from 'next/server'
import { getSession, initializeDB } from '../../auth/neo4j'
import { parseRequestBody } from '../../auth/utils'
import { parseError } from '@/utils'
import { z } from 'zod'

const createWeSpaceSchema = z.object({
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

    const parseResult = createWeSpaceSchema.safeParse(body)

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

      // Create new WeSpace
      const result = await session.run(
        `MATCH (person:Person {id: $userId})
        CREATE (weSpace:Space:WeSpace {
          id: randomUUID(),
          name: $name,
          description: $description,
          visibility: 'SHARED',
          createdAt: datetime()
        })
        CREATE (person)-[:OWNS]->(weSpace)
        RETURN weSpace`,
        {
          userId,
          name,
          description: description || '',
        }
      )

      if (result.records.length === 0) {
        return NextResponse.json(
          { error: 'Failed to create WeSpace' },
          { status: 500 }
        )
      }

      const weSpace = result.records[0].get('weSpace')

      return NextResponse.json(
        {
          message: 'WeSpace created successfully',
          weSpace: {
            id: weSpace.properties.id,
            name: weSpace.properties.name,
            description: weSpace.properties.description,
          },
        },
        { status: 201 }
      )
    } catch (err) {
      return NextResponse.json(
        { error: 'Failed to create WeSpace: ' + parseError(err) },
        { status: 500 }
      )
    } finally {
      await session.close()
    }
  } catch (error) {
    return NextResponse.json({ error: parseError(error) }, { status: 500 })
  }
}
