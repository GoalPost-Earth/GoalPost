import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { completedSteps, isCompleted } = await request.json()

    if (!Array.isArray(completedSteps) || typeof isCompleted !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    // Get user ID from GraphQL query or from authenticated client
    // For now, return success since this is called from authenticated client context
    // In production, verify the request is from an authenticated user
    const result = {
      success: true,
      onboardingProgress: {
        completedSteps,
        isCompleted,
        completedAt: new Date().toISOString(),
      },
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating onboarding progress:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
