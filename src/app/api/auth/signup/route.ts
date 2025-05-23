import { NextRequest, NextResponse } from 'next/server'
import { getSession, initializeDB } from '../neo4j'
import { hashPassword, parseRequestBody } from '../utils'
import { parseError } from '@/utils'
import { z } from 'zod'

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
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
    const { email, password } = parseResult.data

    initializeDB()
    const session = getSession()

    try {
      const hashed = await hashPassword(password)

      const result = await session.run(
        `MATCH (person:Person {email: $email})
                    SET person:User
                    SET person.password = $password 
                RETURN person`,
        { email, password: hashed }
      )

      if (result.records.length === 0) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
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
