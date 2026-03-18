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
import { streamText, generateText } from 'ai'
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

// Allow streaming responses up to 60 seconds (different modes may be verbose)
export const maxDuration = 60

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
    const {
      messages,
      mode,
      config,
    }: {
      messages: IncomingMessage[]
      mode?: AssistantMode
      config?: Partial<SimulationConfig>
    } = await req.json()

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

    // Set mode if provided, otherwise use current mode
    if (mode && ['default', 'aiden', 'braider'].includes(mode)) {
      assistantModeManager.setMode(mode)
    }

    // Convert assistant-ui format to AI SDK format
    const convertedMessages = convertToAISDKMessages(messages)

    console.log('[Chat API] Request:', {
      mode: assistantModeManager.getMode(),
      messageCount: convertedMessages.length,
      model: config?.model || 'gpt-4o-mini',
    })

    // Build message payload with mode context
    const messagesWithSimulation = buildMessagePayload(convertedMessages)

    // Increment message count
    assistantModeManager.incrementMessageCount()

    // Configure OpenAI model
    const modelName = config?.model || 'gpt-4o-mini'
    const model = openai(modelName)
    const temperature = config?.temperature ?? 0.7
    const shouldStream = config?.stream !== false // Default to true

    // Get system prompt based on current mode
    const currentMode = assistantModeManager.getMode()
    const systemPrompt = SYSTEM_PROMPTS[currentMode]

    const lastUserMessage = getLastUserMessage(convertedMessages)
    const tools = buildSimulationChatTools()

    console.log('🔍 [DEBUG] Current mode:', currentMode)
    console.log('📝 [DEBUG] Last user message:', lastUserMessage)
    console.log('🔍 [DEBUG] System prompt selected for mode:', currentMode)

    // Handle streaming
    if (shouldStream) {
      // OpenAI has native tool calling support - no toolChoice hacks needed
      // AI SDK v5 automatically handles tool execution in streaming mode
      const result = streamText({
        model: openai('gpt-5'),
        messages: messagesWithSimulation,
        temperature,
        system: systemPrompt,
        // OpenAI intelligently decides when to call tools
        tools,
      })

      // AI SDK v5 + assistant-ui: Use toUIMessageStreamResponse for proper streaming
      // This ensures tool calls, text, and all message parts stream correctly
      return result.toUIMessageStreamResponse({
        headers: {
          'X-Simulation-Mode': assistantModeManager.getMode(),
        },
      })
    }

    // Handle non-streaming response
    const result = await generateText({
      model,
      messages: messagesWithSimulation,
      temperature,
      system: systemPrompt,
      tools,
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
