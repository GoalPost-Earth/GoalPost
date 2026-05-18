/**
 * GET   /api/chat/simulation/threads     — list thread summaries for the user
 * POST  /api/chat/simulation/threads     — create a new empty thread
 * PATCH /api/chat/simulation/threads     — record last-viewed thread (Slice 5)
 *
 * Auth: requires a valid `accessToken` cookie. All operations are scoped to
 * the caller's own threads (the service-layer Cypher anchors on
 * `(:Person:User {id: $userId})` so cross-user access is structurally
 * impossible).
 *
 * The list/get responses project `mode` ('default' | 'aiden' | 'braider')
 * and `kind` ('reflective' | 'ingest') so the thread switcher can lock the
 * mode selector on ingest threads (GOAL-240 Slice 5).
 */
import { resolveAuthenticatedUserId } from '@/app/api/auth/utils'
import {
  listConversationThreadsSummary,
  createConversationThread,
  setLastViewedConversationThread,
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

export async function PATCH(req: Request) {
  const userId = getUserId(req)
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  let body: { lastViewedThreadId?: unknown }
  try {
    body = (await req.json()) as { lastViewedThreadId?: unknown }
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  const threadId = body.lastViewedThreadId
  if (typeof threadId !== 'string' || threadId.length === 0) {
    return new Response(
      JSON.stringify({ error: 'lastViewedThreadId is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
  await setLastViewedConversationThread(userId, threadId)
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
