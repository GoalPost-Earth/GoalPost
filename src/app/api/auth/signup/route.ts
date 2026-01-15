import { NextRequest, NextResponse } from 'next/server'
import { getSession, initializeDB } from '../neo4j'
import { hashPassword, parseRequestBody } from '../utils'
import { parseError } from '@/utils'
import { z } from 'zod'

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
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

    const parseResult = signupSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseError(parseResult.error) },
        { status: 400 }
      )
    }
    const { email, password, firstName, lastName } = parseResult.data

    initializeDB()
    const session = getSession()

    try {
      // Check if user already exists
      const existingUser = await session.run(
        `MATCH (u:User {email: $email}) RETURN u LIMIT 1`,
        { email }
      )
      if (existingUser.records.length > 0) {
        return NextResponse.json(
          { error: 'A user with this email already exists' },
          { status: 400 }
        )
      }

      const hashed = await hashPassword(password)

      const result = await session.run(
        `MERGE (person:Person {email: $email})
                    SET person:User
                    SET person.password = $password 
                    SET person.id = randomUUID(),
                    person.firstName = $firstName,
                    person.lastName = $lastName,
                    person.createdAt = datetime(),
                    person.updatedAt = datetime()
                
                    WITH person
                    MERGE (person)-[:CREATED_BY]->(person)
                RETURN person`,
        {
          email,
          password: hashed,
          firstName: firstName || '',
          lastName: lastName || '',
        }
      )

      if (result.records.length === 0) {
        return NextResponse.json(
          { error: 'Something went wrong' },
          { status: 400 }
        )
      }

      return NextResponse.json({ message: 'User created' }, { status: 201 })
    } catch (err) {
      return NextResponse.json(
        { error: 'Failed to create user: ' + parseError(err) },
        { status: 500 }
      )
    } finally {
      await session.close()
    }
  } catch (error) {
    return NextResponse.json({ error: parseError(error) }, { status: 500 })
  }
}
