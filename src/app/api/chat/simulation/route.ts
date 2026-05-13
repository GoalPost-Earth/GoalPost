/**
 * Multi-Mode Chat API Route
 * Supports: default (Standard), aiden (Inquiry), braider (Presence)
 *
 * OpenAI endpoint with LangChain best practices:
 * - Tools are ALWAYS available (never disabled)
 * - Clear, directive system prompts per mode
 * - Structured tool responses (JSON) for LLM to interpret
 * - Tools return data, LLM formats in appropriate voice
 * - OpenAI has native tool calling support
 *
 * Three modes:
 * 1. default: Get the facts from the database
 * 2. aiden: Question the frame before answering
 * 3. braider: Stay with this instead of fixing it
 *
 * Usage:
 * POST /api/chat/simulation
 * Body: { messages: ChatMessage[], mode?: 'default'|'aiden'|'braider', config?: SimulationConfig }
 */

import { openai } from '@ai-sdk/openai'
import { streamText, generateText, stepCountIs } from 'ai'
import {
  assistantModeManager,
  buildMessagePayload,
  SYSTEM_PROMPTS,
  getLastUserMessage,
} from '@/lib/simulation'
import type {
  ChatMessage,
  SimulationConfig,
  AssistantMode,
} from '@/lib/simulation'
import { buildSimulationChatTools } from '@/lib/simulation/chat-tools'
import { getAssistantModelId } from '@/lib/llm/factory'
import { verifyJWT } from '@/app/api/auth/utils'
import {
  buildApprovedActionHashSet,
  type ApprovedAction,
} from '@/lib/chat/hitl'
import {
  isFocalEntityType,
  type FocalEntityType,
} from '@/lib/focal-entity/types'
import { buildSystemPromptWithSessionContext } from '@/lib/simulation/session-context-prompt'
import { resolveSessionContextNames } from '@/lib/simulation/session-context-resolve'
import {
  appendConversationTurn,
  setConversationThreadTitle,
} from '@/lib/simulation/conversation-thread.service'

// Allow streaming responses up to 60 seconds (different modes may be verbose)
export const maxDuration = 60

interface FocalEntityPayload {
  type: FocalEntityType
  id: string
  label?: string
}

interface MessagePart {
  type: string
  text?: string
}

interface IncomingMessage {
  role: string
  content?: string | MessagePart[]
  parts?: MessagePart[]
  id?: string
}

/**
 * Convert assistant-ui message format to AI SDK format
 * assistant-ui sends: { role, parts: [{ type, text }], id }
 * AI SDK expects: { role, content: string }
 */
function convertToAISDKMessages(messages: IncomingMessage[]): ChatMessage[] {
  return messages.map((msg) => {
    // If message already has content string, return as-is
    if (typeof msg.content === 'string') {
      return msg as ChatMessage
    }

    // If message has parts array, extract text content
    if (msg.parts && Array.isArray(msg.parts)) {
      const textContent = msg.parts
        .filter((part: MessagePart) => part.type === 'text')
        .map((part: MessagePart) => part.text || '')
        .join('')

      return {
        role: msg.role,
        content: textContent,
      } as ChatMessage
    }

    // If message has content array (assistant-ui format), extract text
    if (Array.isArray(msg.content)) {
      const textContent = msg.content
        .filter((part: MessagePart) => part.type === 'text')
        .map((part: MessagePart) => part.text || '')
        .join('')

      return {
        role: msg.role,
        content: textContent,
      } as ChatMessage
    }

    // Fallback: return empty content
    console.warn('[convertToAISDKMessages] Unknown message format:', msg)
    return {
      role: msg.role,
      content: '',
    } as ChatMessage
  })
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      messages: IncomingMessage[]
      mode?: AssistantMode
      config?: Partial<SimulationConfig>
      currentUserId?: string
      spaceId?: string
      fieldContextId?: string
      focalEntity?: FocalEntityPayload | null
      previousFocalEntity?: FocalEntityPayload | null
      approvedActions?: ApprovedAction[]
      threadId?: string
    }
    const {
      messages,
      mode,
      config,
      currentUserId: clientProvidedUserId,
      spaceId,
      fieldContextId,
      approvedActions,
      threadId,
    } = body

    const focalEntity =
      body.focalEntity && isFocalEntityType(body.focalEntity.type)
        ? body.focalEntity
        : null
    const previousFocalEntity =
      body.previousFocalEntity &&
      isFocalEntityType(body.previousFocalEntity.type)
        ? body.previousFocalEntity
        : null

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Resolve current user from request body, falling back to JWT cookie.
    // Mirrors /api/chat/route.ts so tool authorization can attach to a real user.
    let currentUserId: string | null = clientProvidedUserId || null
    if (!currentUserId) {
      const cookieHeader = req.headers.get('cookie') || ''
      const tokenMatch = cookieHeader.match(/(?:^|;\s*)accessToken=([^;]+)/)
      if (tokenMatch) {
        try {
          const decoded = verifyJWT(decodeURIComponent(tokenMatch[1])) as {
            user: { id: string }
          }
          currentUserId = decoded.user.id
        } catch (error) {
          console.error('[Chat Simulation] Token verification failed:', error)
        }
      }
    }

    // Set mode if provided, otherwise use current mode
    if (mode && ['default', 'aiden', 'braider'].includes(mode)) {
      assistantModeManager.setMode(mode)
    }

    // Convert assistant-ui format to AI SDK format
    const convertedMessages = convertToAISDKMessages(messages)

    // Resolve assistant model once. config.model wins (per-mode override),
    // otherwise OPENAI_ASSISTANT_MODEL env, otherwise the project default.
    const modelName = getAssistantModelId(config?.model)

    console.log('[Chat API] Request:', {
      mode: assistantModeManager.getMode(),
      messageCount: convertedMessages.length,
      model: modelName,
      hasUser: !!currentUserId,
      spaceId: spaceId || null,
      fieldContextId: fieldContextId || null,
      focalEntity,
      hasPreviousFocal: !!previousFocalEntity,
      approvedActionCount: approvedActions?.length ?? 0,
    })

    // Build message payload with mode context
    const messagesWithSimulation = buildMessagePayload(convertedMessages)

    // Increment message count
    assistantModeManager.incrementMessageCount()

    // Configure OpenAI model.
    // Note: `config.temperature` is intentionally ignored — gpt-5.x assistant
    // models are reasoning models routed through OpenAI's Responses API, which
    // rejects `temperature` (use `reasoning.effort` to tune output instead).
    const model = openai(modelName)
    const shouldStream = config?.stream !== false // Default to true

    // Get system prompt based on current mode, then append session context so
    // the model knows which Space/FieldContext to scope tool calls to.
    const currentMode = assistantModeManager.getMode()
    const basePrompt = SYSTEM_PROMPTS[currentMode]
    const resolvedNames = await resolveSessionContextNames(
      spaceId || null,
      fieldContextId || null,
      currentUserId
    )
    const systemPrompt = buildSystemPromptWithSessionContext(basePrompt, {
      currentUserId,
      spaceId: spaceId || null,
      fieldContextId: fieldContextId || null,
      spaceName: resolvedNames.activeSpaceName,
      spaceType: resolvedNames.activeSpaceType,
      fieldContextTitle: resolvedNames.activeFieldContextTitle,
      currentUserName: resolvedNames.currentUserName,
      activeSpaceOwnedByCurrentUser:
        resolvedNames.activeSpaceOwnedByCurrentUser,
      focalEntity,
      previousFocalEntity,
    })

    const lastUserMessage = getLastUserMessage(convertedMessages)

    // True when the frontend sent exactly one user message — meaning this is
    // the first exchange in the thread and we should auto-generate a title once
    // the assistant responds. assistant-ui sends the full history every request,
    // so length === 1 reliably identifies the first turn.
    const isFirstExchange = convertedMessages.length === 1

    // Persist the user's turn as soon as we receive it. Fire-and-forget — a
    // Neo4j hiccup must NOT block the assistant response, but we log so
    // ops can catch sustained failures. The matching assistant turn is
    // saved from streamText's onFinish callback below.
    const incomingMessage = body.messages[body.messages.length - 1]
    if (currentUserId && lastUserMessage) {
      void appendConversationTurn(currentUserId, {
        role: 'user',
        content: lastUserMessage,
        parts: incomingMessage?.parts ?? incomingMessage?.content ?? null,
      }, threadId).catch((error) => {
        console.warn(
          '[Chat Simulation] Failed to persist user turn:',
          error instanceof Error ? error.message : error
        )
      })
    }

    const tools = await buildSimulationChatTools({
      currentUserId,
      spaceId: spaceId || null,
      fieldContextId: fieldContextId || null,
      focalEntity,
      approvedActionHashes: buildApprovedActionHashSet(approvedActions),
    })

    console.log('🔍 [DEBUG] Current mode:', currentMode)
    console.log('📝 [DEBUG] Last user message:', lastUserMessage)
    console.log('🔍 [DEBUG] System prompt selected for mode:', currentMode)

    // Handle streaming
    if (shouldStream) {
      // AI SDK v5 defaults `stopWhen` to `stepCountIs(1)`, which means the
      // stream halts after the model emits a single tool call — the model
      // never gets a follow-up step to write the user-visible text response
      // grounded in the tool result. That manifests as a blank assistant
      // bubble. Raise the budget so the model loops: tool-call → tool-result
      // → text (with room for a few sequential tool calls if needed).
      const result = streamText({
        model,
        messages: messagesWithSimulation,
        system: systemPrompt,
        tools,
        stopWhen: stepCountIs(8),
      })

      // AI SDK v5 + assistant-ui: Use toUIMessageStreamResponse for proper streaming
      // This ensures tool calls, text, and all message parts stream correctly.
      // onFinish receives the full UIMessage list; we grab the last assistant
      // message and persist it as the matching turn for the user message saved
      // above. Failure is logged but never propagated — chat UX wins.
      return result.toUIMessageStreamResponse({
        headers: {
          'X-Simulation-Mode': assistantModeManager.getMode(),
        },
        onFinish: ({ messages: finalMessages }) => {
          if (!currentUserId) return
          const lastAssistant = [...finalMessages]
            .reverse()
            .find((m) => m.role === 'assistant')
          if (!lastAssistant) return
          const parts = Array.isArray(lastAssistant.parts)
            ? lastAssistant.parts
            : []
          const textContent = parts
            .filter(
              (part): part is { type: 'text'; text: string } =>
                part?.type === 'text' && typeof part.text === 'string'
            )
            .map((part) => part.text)
            .join('')
          void appendConversationTurn(currentUserId, {
            role: 'assistant',
            content: textContent,
            parts,
          }, threadId).catch((error) => {
            console.warn(
              '[Chat Simulation] Failed to persist assistant turn:',
              error instanceof Error ? error.message : error
            )
          })

          // After the first exchange, auto-generate a title so the sidebar
          // shows something meaningful. Use gpt-4o-mini — cheap and fast.
          if (isFirstExchange && lastUserMessage && textContent) {
            void generateText({
              model: openai('gpt-4o-mini'),
              messages: [
                {
                  role: 'user',
                  content: `Generate a concise title (4–7 words, no quotes, no punctuation, no trailing period) that captures what this conversation is about.

User said: ${lastUserMessage.slice(0, 300)}
Assistant replied: ${textContent.slice(0, 300)}

Title:`,
                },
              ],
            })
              .then(({ text }) => {
                const title = text.trim().replace(/^["'`]|["'`]$/g, '').slice(0, 80)
                if (title) {
                  return setConversationThreadTitle(currentUserId!, threadId, title)
                }
              })
              .catch((err) => {
                console.warn('[Chat Simulation] Title generation failed:', err instanceof Error ? err.message : err)
              })
          }
        },
      })
    }

    // Handle non-streaming response — same multi-step budget as the
    // streaming path so a tool-call-only step doesn't leave us with no text.
    const result = await generateText({
      model,
      messages: messagesWithSimulation,
      system: systemPrompt,
      tools,
      stopWhen: stepCountIs(8),
    })

    return new Response(
      JSON.stringify({
        role: 'assistant',
        content: result.text,
        simulationMode: assistantModeManager.getMode(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('[Simulation API] Error:', error)

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'

    return new Response(
      JSON.stringify({
        error: 'Failed to process simulation chat request',
        details: errorMessage,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

/**
 * GET endpoint to check/set assistant mode
 *
 * GET: Returns current mode and state
 * POST with mode param: Sets new mode (see POST handler above)
 */
export async function GET(req: Request) {
  // Support mode query parameter for setting mode
  const url = new URL(req.url)
  const modeParam = url.searchParams.get('mode') as AssistantMode | null

  if (modeParam && ['default', 'aiden', 'braider'].includes(modeParam)) {
    assistantModeManager.setMode(modeParam)
  }

  const state = assistantModeManager.getState()

  return new Response(
    JSON.stringify({
      mode: state.mode,
      messageCount: state.messageCount,
      activatedAt: state.activatedAt,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}
