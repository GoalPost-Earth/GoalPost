import { NextRequest, NextResponse } from 'next/server'
import { getSession, initializeDB } from '../neo4j'
import { hashPassword, parseRequestBody, signJWT } from '../utils'
import { parseError } from '@/utils'
import { getOrCreateMeSpace } from '@/lib/validation/space-validation'
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
                    person.updatedAt = datetime(),
                    person.onboardingCurrentStepIndex = 0,
                    person.onboardingCompletedSteps = [],
                    person.onboardingIsCompleted = false,
                    person.onboardingSkipped = false,
                    person.inviteTokenHash = NULL,
                    person.inviteTokenExpires = NULL

                RETURN person.id as personId`,
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

      const personId = result.records[0].get('personId')

      // Create MeSpace for the new user with firstName
      const meSpaceName = firstName
        ? `${firstName}'s MeSpace`
        : `${email}'s MeSpace`
      await getOrCreateMeSpace(session, personId, meSpaceName)

      // Fetch the complete user with spaces for response
      const userDataResult = await session.run(
        `MATCH (user:Person {id: $personId})
         OPTIONAL MATCH (user)-[:OWNS]->(space:Space)
         WITH user, collect(DISTINCT {
           id: space.id,
           name: space.name,
           visibility: space.visibility,
           createdAt: space.createdAt,
           __typename: CASE 
             WHEN space:MeSpace THEN 'MeSpace'
             WHEN space:WeSpace THEN 'WeSpace'
             ELSE NULL
           END
         }) as ownsSpaces
         RETURN {
           id: user.id,
           email: user.email,
           firstName: user.firstName,
           lastName: user.lastName,
           roles: user.roles,
           ownsSpaces: ownsSpaces
         } as user`,
        { personId }
      )

      if (userDataResult.records.length === 0) {
        return NextResponse.json(
          { error: 'Failed to fetch user data' },
          { status: 400 }
        )
      }

      const user = userDataResult.records[0].get('user')

      // ownsSpaces is intentionally excluded from the JWT to keep the cookie small.
      // It is still returned in the response body for client-side caching.
      const token = signJWT({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles,
        },
        expiresAt: Math.floor(Date.now() / 1000) + 60 * 30, // 30 minutes
      })

      // Compound format `${userId}.${secret}` — the refresh-token route uses
      // the userId prefix to look up the Person by indexed id rather than
      // bcrypt-scanning every user.
      const refreshToken = `${personId}.${crypto.randomUUID()}`
      const hashedRefreshToken = await hashPassword(refreshToken)

      // Store refresh token in database
      await session.run(
        `MATCH (user:Person {id: $personId})
         SET user.refreshToken = $refreshToken,
             user.refreshTokenExp = $refreshTokenExp,
             user.refreshTokenRevoked = false
         RETURN user`,
        {
          personId,
          refreshToken: hashedRefreshToken,
          refreshTokenExp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days
        }
      )

      const response = NextResponse.json(
        {
          message: 'User created',
          user,
          token,
          refreshToken,
        },
        { status: 201 }
      )

      // Set secure cookies for authentication
      response.cookies.set('accessToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 30, // 30 minutes
        path: '/',
      })

      response.cookies.set('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      })

      return response
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
