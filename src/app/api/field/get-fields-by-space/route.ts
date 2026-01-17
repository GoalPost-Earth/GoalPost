import { NextRequest, NextResponse } from 'next/server'
import { getSession, initializeDB } from '../../auth/neo4j'
import { parseRequestBody } from '../../auth/utils'
import { parseError } from '@/utils'
import { z } from 'zod'

const requestSchema = z.object({
  spaceId: z.string().min(1, 'Space ID is required'),
})

export async function POST(request: NextRequest) {
  try {
    if (request.method !== 'POST') {
      return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })
    }

    const parseResultBody = await parseRequestBody(request)
    if (!parseResultBody.ok) {
      return NextResponse.json(
        { error: parseResultBody.error },
        { status: parseResultBody.status }
      )
    }
    const body = parseResultBody.body

    const parseResult = requestSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseError(parseResult.error) },
        { status: 400 }
      )
    }

    const { spaceId } = parseResult.data

    initializeDB()
    const session = getSession()

    try {
      // Query for FieldContexts in the space
      const result = await session.run(
        `
        MATCH (space:Space {id: $spaceId})-[:HAS_CONTEXT]->(context:FieldContext)
        RETURN context {
          .id,
          .title,
          .emergentName,
          .createdAt
        } AS context
        ORDER BY context.createdAt DESC
        `,
        { spaceId }
      )

      const fields = result.records.map((record) => {
        const context = record.get('context')
        return {
          ...context,
          // Convert Neo4j DateTime to ISO string
          createdAt:
            context.createdAt && typeof context.createdAt === 'object'
              ? context.createdAt.toString()
              : context.createdAt,
        }
      })

      return NextResponse.json(
        {
          success: true,
          fields,
          count: fields.length,
        },
        { status: 200 }
      )
    } catch (err) {
      return NextResponse.json(
        { error: 'Failed to fetch fields: ' + parseError(err) },
        { status: 500 }
      )
    } finally {
      await session.close()
    }
  } catch (error) {
    return NextResponse.json({ error: parseError(error) }, { status: 500 })
  }
}
