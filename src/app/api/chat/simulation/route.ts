/**
 * Aiden Simulation Chat API Route
 * OpenAI-powered endpoint with full simulation protocol support
 *
 * Usage:
 * POST /api/chat/simulation
 * Body: { messages: ChatMessage[], config?: SimulationConfig }
 */

import { createOllama } from 'ollama-ai-provider-v2'
import { streamText, generateText, tool } from 'ai'
import { z } from 'zod'
import {
  simulationState,
  buildMessagePayload,
  processSimulationCommand,
  getLastUserMessage,
} from '@/lib/simulation'
import type { ChatMessage, SimulationConfig } from '@/lib/simulation'
import { Neo4jGraph } from '@langchain/community/graphs/neo4j_graph'
import { createPersonSearchTool } from '@/modules/agent/tools/person-search.tool'

// Allow streaming responses up to 60 seconds (simulation may be verbose)
export const maxDuration = 60

// Configure Ollama provider
const ollama = createOllama({
  baseURL: process.env.OLLAMA_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.OLLAMA_BEARER_TOKEN}`,
  },
})

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
    const model = ollama(config?.model || 'mistral')
    const temperature = config?.temperature ?? 0.7
    const shouldStream = config?.stream !== false // Default to true

    console.log('[Simulation API] Request:', {
      simulationMode: simulationState.getMode(),
      messageCount: messagesWithSimulation.length,
      model: config?.model || 'mistral',
    })

    console.log('🔍 [DEBUG] Last message:', lastMessage?.content)
    console.log('🔍 [DEBUG] Simulation active:', simulationState.isActive())

    // Determine system prompt based on simulation state
    let systemPrompt: string | undefined

    if (!simulationState.isActive()) {
      // Use strict guardrails when simulation is not active
      systemPrompt = `You are GoalPost Assistant. You search the GoalPost database for people and communities.

When asked about a person, use the search_person tool.
When asked about a community, use the search_community tool.

Important: Only share information that comes from the tools. Do not use your training data.`
      console.log('🔍 [DEBUG] Using GUARDRAILS system prompt')
    } else {
      systemPrompt = undefined // Simulation messages include their own system prompts
      console.log('🔍 [DEBUG] Using simulation protocol (no guardrails)')
    }

    // Handle streaming
    if (shouldStream) {
      const result = streamText({
        model,
        messages: messagesWithSimulation,
        temperature,
        system: systemPrompt,
        maxSteps: 5, // Allow automatic multi-step execution
        tools: {
          // Person Search Tool
          search_person: tool({
            description:
              'Search for a person in the GoalPost database by name. Returns profile if found or states not in database.',
            parameters: z.object({
              name: z
                .string()
                .describe('The full name of the person to search for'),
            }),
            execute: async ({ name }) => {
              console.log(
                '🔍 [DEBUG] search_person tool called with name:',
                name
              )
              try {
                const graph = await Neo4jGraph.initialize({
                  url: process.env.NEO4J_URI!,
                  username: process.env.NEO4J_USERNAME!,
                  password: process.env.NEO4J_PASSWORD!,
                })

                const personTool = createPersonSearchTool(graph)
                const result = await personTool.invoke({ name })
                const parsedResult = JSON.parse(result)

                console.log('🔍 [DEBUG] Person search result:', {
                  found: parsedResult.found,
                  count: parsedResult.count,
                  needsDisambiguation: parsedResult.needsDisambiguation,
                })

                if (parsedResult.found && parsedResult.count === 1) {
                  const person = parsedResult.people[0]
                  return `I found ${person.name} in the GoalPost community. PERSON_PROFILE_FOUND: ${JSON.stringify(person)}`
                }

                return parsedResult.message
              } catch (error) {
                console.error('Person search error:', error)
                return 'I encountered an error while searching the GoalPost database. Please try again.'
              }
            },
          }),

          // Community Search Tool
          search_community: tool({
            description: 'Search for communities in GoalPost',
            parameters: z.object({
              query: z
                .string()
                .describe('Community name or description to search for'),
            }),
            execute: async ({ query }) => {
              try {
                const graph = await Neo4jGraph.initialize({
                  url: process.env.NEO4J_URI!,
                  username: process.env.NEO4J_USERNAME!,
                  password: process.env.NEO4J_PASSWORD!,
                })

                const cypherQuery = `
                  MATCH (c:Community)
                  WHERE toLower(c.name) CONTAINS toLower($query)
                    OR toLower(c.description) CONTAINS toLower($query)
                  OPTIONAL MATCH (c)-[:MOTIVATED_BY]->(g:Goal)
                  OPTIONAL MATCH (p:Person)-[:BELONGS_TO]->(c)
                  WITH c, 
                       collect(DISTINCT g.name)[0..3] as goals,
                       count(DISTINCT p) as memberCount
                  RETURN 
                    c.name as name,
                    c.description as description,
                    goals,
                    memberCount
                  LIMIT 5
                `

                const results = await graph.query(cypherQuery, { query })

                if (!results) {
                  return {
                    found: false,
                    message: 'Error searching communities',
                  }
                }

                return {
                  found: results.length > 0,
                  communities: results,
                  count: results.length,
                }
              } catch (error) {
                console.error('Community search error:', error)
                return { found: false, message: 'Error searching communities' }
              }
            },
          }),
        },
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
