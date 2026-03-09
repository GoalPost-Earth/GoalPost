/**
 * GET /api/activity-logs/get-user-logs
 *
 * Fetches recent activity logs for a specific user.
 * Used by the notification panel to display recent activities.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getUserLogs } from '@/lib/activity-logs/create-log'

interface GetUserLogsResponse {
  success: boolean
  logs: Array<{
    id: string
    description: string
    createdAt: string
    createdBy: {
      id: string
      name: string
      photo?: string
    }
    metadata?: Record<string, any>
  }>
  message?: string
  error?: string
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const limitStr = searchParams.get('limit') || '30'
    const limit = Math.min(parseInt(limitStr), 100) // Cap at 100

    if (!userId) {
      return NextResponse.json<GetUserLogsResponse>(
        {
          success: false,
          logs: [],
          error: 'userId query parameter is required',
        },
        { status: 400 }
      )
    }

    // Fetch logs using the service
    const logs = await getUserLogs(userId, limit)

    return NextResponse.json<GetUserLogsResponse>(
      {
        success: true,
        logs: logs.map((log) => ({
          id: log.id,
          description: log.description,
          createdAt: log.createdAt,
          createdBy: log.createdBy,
          metadata: log.metadata,
        })),
        message: `Retrieved ${logs.length} logs`,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching user logs:', error)
    return NextResponse.json<GetUserLogsResponse>(
      {
        success: false,
        logs: [],
        error: error instanceof Error ? error.message : 'Failed to fetch logs',
      },
      { status: 500 }
    )
  }
}
