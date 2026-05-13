/**
 * GET /api/chat/simulation/thread
 *
 * Returns the authenticated user's active ConversationThread so the AI
 * assistant panel can hydrate its chat runtime with prior turns on mount
 * (panel re-open, page reload, multi-device sign-in).
 *
 * Response shape:
 *
 *   { thread: null }                               // user has no thread yet
 *   { thread: { id, createdAt, lastTurnAt,         // active thread
 *               turns: [{ id, role, content,
 *                         parts, order, createdAt }] } }
 *
 * Auth: requires a valid `accessToken` cookie. The handler refuses without
 * one rather than returning an anonymous thread — chat history is private.
 */
import { verifyJWT } from '@/app/api/auth/utils'
import {
  getActiveConversationThread,
  getConversationThread,
} from '@/lib/simulation/conversation-thread.service'

export async function GET(req: Request) {
  let userId: string | null = null
  const cookieHeader = req.headers.get('cookie') || ''
  const tokenMatch = cookieHeader.match(/(?:^|;\s*)accessToken=([^;]+)/)
  if (tokenMatch) {
    try {
      const decoded = verifyJWT(decodeURIComponent(tokenMatch[1])) as {
        user: { id: string }
      }
      userId = decoded.user.id
    } catch (error) {
      console.error(
        '[Chat Simulation Thread] Token verification failed:',
        error
      )
    }
  }

  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const threadId = new URL(req.url).searchParams.get('id')
  const thread = threadId
    ? await getConversationThread(userId, threadId)
    : await getActiveConversationThread(userId)
  return new Response(JSON.stringify({ thread }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      // Hydration is per-request; never cache.
      'Cache-Control': 'no-store',
    },
  })
}
