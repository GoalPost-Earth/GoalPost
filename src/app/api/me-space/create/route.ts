import { NextRequest, NextResponse } from 'next/server'
import { getSession, initializeDB } from '../../auth/neo4j'
import { parseRequestBody } from '../../auth/utils'
import { parseError } from '@/utils'
import { z } from 'zod'

const createMeSpaceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
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

    const { name, userId } = parseResult.data

    initializeDB()
    const session = getSession()

    try {
      // Verify user exists. Done separately from the create so a missing
      // user reads as 404 instead of a generic "already has one."
      const userExists = await session.run(
        `MATCH (u:Person {id: $userId}) RETURN u LIMIT 1`,
        { userId }
      )

      if (userExists.records.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Atomic create — single transaction with `WHERE NOT EXISTS` so two
      // concurrent POSTs can never both succeed (closes the prior
      // check-then-create TOCTOU). The `ownerId` denormalization on the
      // node lets the Neo4j UNIQUE constraint added in init-db.js refuse
      // duplicates at the DB layer too. Returns 0 records when the user
      // already has a MeSpace.
      const result = await session.run(
        `MATCH (person:Person {id: $userId})
         WHERE NOT EXISTS { (person)-[:OWNS]->(:MeSpace) }
         CREATE (meSpace:Space:MeSpace {
           id: apoc.create.uuid(),
           name: $name,
           visibility: 'PRIVATE',
           ownerId: $userId,
           createdAt: datetime()
         })
         CREATE (person)-[:OWNS]->(meSpace)
         RETURN meSpace`,
        { userId, name }
      )

      if (result.records.length === 0) {
        // Either the create lost to a concurrent writer, or this user
        // already has a MeSpace. Surface the existing one so the caller
        // can navigate to it.
        const existing = await session.run(
          `MATCH (person:Person {id: $userId})-[:OWNS]->(ms:MeSpace)
           RETURN ms.id as meSpaceId, ms.name as name LIMIT 1`,
          { userId }
        )
        if (existing.records.length > 0) {
          return NextResponse.json(
            {
              error: 'User already has a MeSpace',
              existingMeSpace: {
                id: existing.records[0].get('meSpaceId'),
                name: existing.records[0].get('name'),
              },
            },
            { status: 400 }
          )
        }
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
