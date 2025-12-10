/**
 * Aiden Simulation Chat API Route
 * OpenAI-powered endpoint with full simulation protocol support
 *
 * Usage:
 * POST /api/chat/simulation
 * Body: { messages: ChatMessage[], config?: SimulationConfig }
 */

import { openai } from '@ai-sdk/openai'
import { streamText, generateText } from 'ai'
import {
  simulationState,
  buildMessagePayload,
  processSimulationCommand,
  getLastUserMessage,
} from '@/lib/simulation'
import type { ChatMessage, SimulationConfig } from '@/lib/simulation'

// Allow streaming responses up to 60 seconds (simulation may be verbose)
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
      config,
    }: {
      messages: IncomingMessage[]
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

    // Convert assistant-ui format to AI SDK format
    const convertedMessages = convertToAISDKMessages(messages)

    console.log('[Simulation API] First message sample:', {
      original: messages[0],
      converted: convertedMessages[0],
    })

    // Check for simulation activation/deactivation commands
    const lastMessage = getLastUserMessage(convertedMessages)

    if (lastMessage) {
      const commandResult = processSimulationCommand(lastMessage)

      // If a command was intercepted, return immediate streaming response
      if (commandResult.intercepted && commandResult.responseMessage) {
        // Create a simple text stream for the command response
        const encoder = new TextEncoder()
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode(commandResult.responseMessage))
            controller.close()
          },
        })

        return new Response(stream, {
          status: 200,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'X-Simulation-Mode': commandResult.newMode,
          },
        })
      }
    }

    // Build message payload with simulation prompts if active
    const messagesWithSimulation = buildMessagePayload(convertedMessages)

    // Increment message count if simulation is active
    if (simulationState.isActive()) {
      simulationState.incrementMessageCount()
    }

    // Configure model
    const model = openai(config?.model || 'gpt-4-turbo-preview')
    const temperature = config?.temperature ?? 0.7
    const shouldStream = config?.stream !== false // Default to true

    console.log('[Simulation API] Request:', {
      simulationMode: simulationState.getMode(),
      messageCount: messagesWithSimulation.length,
      model: config?.model || 'gpt-4-turbo-preview',
    })

    // Handle streaming
    if (shouldStream) {
      const result = streamText({
        model,
        messages: messagesWithSimulation,
        temperature,
      })

      return result.toTextStreamResponse({
        headers: {
          'X-Simulation-Mode': simulationState.getMode(),
        },
      })
    }

    // Handle non-streaming response
    const result = await generateText({
      model,
      messages: messagesWithSimulation,
      temperature,
    })

    return new Response(
      JSON.stringify({
        role: 'assistant',
        content: result.text,
        simulationMode: simulationState.getMode(),
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
 * GET endpoint to check simulation state
 */
export async function GET() {
  const state = simulationState.getState()

  return new Response(
    JSON.stringify({
      mode: state.mode,
      isActive: simulationState.isActive(),
      messageCount: state.messageCount,
      activatedAt: state.activatedAt,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}
