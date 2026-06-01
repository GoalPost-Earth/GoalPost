import { NextRequest, NextResponse } from 'next/server'
import { resolveAuthenticatedUserId } from '@/app/api/auth/utils'
import { initGraph } from '@/modules/graph'

export async function GET(request: NextRequest) {
  try {
    // Verify the JWT signature and resolve the caller's own id. Previously this
    // route only *decoded* the token (no signature check), so a forged token
    // could read any user's onboarding state. resolveAuthenticatedUserId
    // verifies via verifyJWT and returns null on any failure.
    const userId = resolveAuthenticatedUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
    // Verify the JWT signature and resolve the caller's own id (see GET). This
    // route WRITES onboarding state, so an unverified token here let a forged
    // `user.id` overwrite any account's onboarding — now closed.
    const userId = resolveAuthenticatedUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
