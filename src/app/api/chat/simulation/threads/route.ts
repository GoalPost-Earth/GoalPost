/**
 * GET  /api/chat/simulation/threads  — list thread summaries for the user
 * POST /api/chat/simulation/threads  — create a new empty thread
 */
import { resolveAuthenticatedUserId } from '@/app/api/auth/utils'
import {
  listConversationThreadsSummary,
  createConversationThread,
} from '@/lib/simulation/conversation-thread.service'

export async function GET(req: Request) {
  const userId = resolveAuthenticatedUserId(req)
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  const threads = await listConversationThreadsSummary(userId)
  return new Response(JSON.stringify({ threads }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}

export async function POST(req: Request) {
  const userId = resolveAuthenticatedUserId(req)
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  const { threadId } = await createConversationThread(userId)
  return new Response(JSON.stringify({ threadId }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  })
}
