import { NextRequest, NextResponse } from 'next/server'
import { jwtDecode } from 'jwt-decode'
import { initGraph } from '@/modules/graph'

export async function GET(request: NextRequest) {
  try {
    // Extract JWT token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    let decoded: Record<string, unknown>
    try {
      decoded = jwtDecode(token)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.error('JWT decoding error:', e)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = decoded.sub as string | undefined
    if (!userId) {
      return NextResponse.json(
        { error: 'Token missing user ID' },
        { status: 401 }
      )
    }

    // Query Neo4j for user's onboarding progress
    const graph = await initGraph()
    const result = await graph.query<{
      onboardingCurrentStepIndex: number | null
      onboardingCompletedSteps: string[] | null
      onboardingIsCompleted: boolean | null
      onboardingSkipped: boolean | null
    }>(
      `MATCH (u:User {id: $userId})
       RETURN 
         u.onboardingCurrentStepIndex as onboardingCurrentStepIndex,
         u.onboardingCompletedSteps as onboardingCompletedSteps,
         u.onboardingIsCompleted as onboardingIsCompleted,
         u.onboardingSkipped as onboardingSkipped`,
      { userId }
    )

    if (result.length === 0) {
      // Return default values if user not found
      return NextResponse.json({
        onboardingCurrentStepIndex: 0,
        onboardingCompletedSteps: [],
        onboardingIsCompleted: false,
        onboardingSkipped: false,
      })
    }

    // Handle null/missing fields for existing users without onboarding data
    const data = result[0]
    return NextResponse.json({
      onboardingCurrentStepIndex: data.onboardingCurrentStepIndex ?? 0,
      onboardingCompletedSteps: data.onboardingCompletedSteps ?? [],
      onboardingIsCompleted: data.onboardingIsCompleted ?? false,
      onboardingSkipped: data.onboardingSkipped ?? false,
    })
  } catch (error) {
    console.error('Error fetching onboarding progress:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Extract JWT token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    let decoded: Record<string, unknown>
    try {
      decoded = jwtDecode(token)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.error('JWT decoding error:', e)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = decoded.sub as string | undefined
    if (!userId) {
      return NextResponse.json(
        { error: 'Token missing user ID' },
        { status: 401 }
      )
    }

    const { currentStepIndex, completedSteps, isCompleted, skipped } =
      await request.json()

    // Validate request body
    if (
      typeof currentStepIndex !== 'number' ||
      !Array.isArray(completedSteps) ||
      typeof isCompleted !== 'boolean' ||
      typeof skipped !== 'boolean'
    ) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    // Update Neo4j user with onboarding progress
    const graph = await initGraph()
    await graph.query(
      `MATCH (u:User {id: $userId})
       SET u.onboardingCurrentStepIndex = $currentStepIndex,
           u.onboardingCompletedSteps = $completedSteps,
           u.onboardingIsCompleted = $isCompleted,
           u.onboardingSkipped = $skipped
       RETURN u.id`,
      {
        userId,
        currentStepIndex,
        completedSteps,
        isCompleted,
        skipped,
      }
    )

    return NextResponse.json({
      success: true,
      onboardingProgress: {
        currentStepIndex,
        completedSteps,
        isCompleted,
        skipped,
      },
    })
  } catch (error) {
    console.error('Error updating onboarding progress:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
