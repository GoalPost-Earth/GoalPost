/**
 * Simulation Middleware
 * Optional middleware to intercept chat requests and apply simulation mode globally
 *
 * Usage: Import and use in Next.js middleware or API route wrapper
 */

import { NextRequest, NextResponse } from 'next/server'
import { simulationState } from './state'
import { processSimulationCommand, getLastUserMessage } from './helpers'
import type { ChatMessage } from './types'

/**
 * Middleware function to process simulation commands
 * Can be used in Next.js middleware.ts or as a route wrapper
 */
export async function simulationMiddleware(
  request: NextRequest,
  next: () => Promise<NextResponse>
): Promise<NextResponse> {
  // Only process POST requests to chat endpoints
  if (request.method !== 'POST' || !request.url.includes('/api/chat')) {
    return next()
  }

  try {
    // Parse request body
    const body = await request.json()
    const messages = body.messages as ChatMessage[]

    if (!messages || !Array.isArray(messages)) {
      return next()
    }

    // Check for simulation commands
    const lastMessage = getLastUserMessage(messages)

    if (lastMessage) {
      const commandResult = processSimulationCommand(lastMessage)

      // If a command was intercepted, return immediate response
      if (commandResult.intercepted && commandResult.responseMessage) {
        return NextResponse.json({
          role: 'assistant',
          content: commandResult.responseMessage,
          simulationMode: commandResult.newMode,
        })
      }
    }

    // Continue to next handler
    return next()
  } catch (error) {
    console.error('[Simulation Middleware] Error:', error)
    // Continue to next handler on error
    return next()
  }
}

/**
 * Higher-order function to wrap API route handlers with simulation support
 */
export function withSimulation(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    return simulationMiddleware(req, () => handler(req))
  }
}

/**
 * Adds simulation mode header to responses
 */
export function addSimulationHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Simulation-Mode', simulationState.getMode())
  response.headers.set(
    'X-Simulation-Active',
    String(simulationState.isActive())
  )
  return response
}
