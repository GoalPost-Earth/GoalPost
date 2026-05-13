/**
 * GET  /api/chat/simulation/threads  — list thread summaries for the user
 * POST /api/chat/simulation/threads  — create a new empty thread
 */
import { verifyJWT } from '@/app/api/auth/utils'
import {
  listConversationThreadsSummary,
  createConversationThread,
} from '@/lib/simulation/conversation-thread.service'

function getUserId(req: Request): string | null {
  const cookieHeader = req.headers.get('cookie') ?? ''
  const match = cookieHeader.match(/(?:^|;\s*)accessToken=([^;]+)/)
  if (!match) return null
  try {
    const decoded = verifyJWT(decodeURIComponent(match[1])) as {
      user: { id: string }
    }
    return decoded.user.id
  } catch {
    return null
  }
}

export async function GET(req: Request) {
  const userId = getUserId(req)
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
  const userId = getUserId(req)
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
