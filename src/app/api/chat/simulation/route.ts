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

/**
 * Detects if the user query is asking about a specific person
 * AGGRESSIVE: Treats any query with capitalized names as a person query
 */
function isPersonQuery(message: string | undefined): boolean {
  if (!message) return false
  const trimmed = message.trim()

  // Pattern 1: Explicit person queries
  const explicitPatterns = [
    /\b(who\s+is|who's|tell\s+me\s+about|find|search\s+for|show\s+me|know\s+about|information\s+about)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /\b(does|do\s+you\s+know)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(profile|bio|background|details)/i,
  ]

  if (explicitPatterns.some((pattern) => pattern.test(message))) {
    return true
  }

  // Pattern 2: Just a capitalized name (e.g., "Lina", "Robert Damaschke")
  // Allow 1-3 capitalized words, potentially with common words between
  const justNamePattern =
    /^(?:about\s+)?([A-Z][a-z]+(?:\s+(?:the\s+)?[A-Z][a-z]+)*)(?:\s*\?)?$/i
  if (justNamePattern.test(trimmed)) {
    return true
  }

  return false
}

/**
 * Extract a likely person name from the query
 */
function extractPersonName(message: string | undefined): string | null {
  if (!message) return null
  const trimmed = message.trim()

  // Try explicit patterns first
  const patterns = [
    /\b(?:who\s+is|who's|tell\s+me\s+about|find|search\s+for|show\s+me|know\s+about|information\s+about|about)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /\b(does|do\s+you\s+know)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:profile|bio|background|details)\b/i,
  ]

  for (const re of patterns) {
    const m = trimmed.match(re)
    if (!m) continue
    const candidate = (m[2] || m[1] || '').trim()
    if (candidate) return candidate
  }

  // If query is just capitalized names, return the whole thing
  const justNamePattern =
    /^(?:about\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)(?:\s*\?)?$/i
  const justNameMatch = trimmed.match(justNamePattern)
  if (justNameMatch) {
    return justNameMatch[1].trim()
  }

  // Fallback: extract capitalized words
  const capTokens = trimmed.match(/[A-Z][a-z]+/g)
  if (capTokens && capTokens.length) {
    // Take up to 2 capitalized words
    return capTokens.slice(0, 2).join(' ')
  }

  return null
}

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

    // Detect if query is about a person to force tool usage
    const queryContent = lastMessage?.content || ''
    const isAboutPerson = isPersonQuery(queryContent)
    console.log(
      '🔍 [DEBUG] Is person query:',
      isAboutPerson,
      'Query:',
      queryContent
    )
    console.log('🔍 [DEBUG] Simulation active:', simulationState.isActive())

    // Determine system prompt based on simulation state
    let systemPrompt: string | undefined

    if (!simulationState.isActive()) {
      // Use strict guardrails when simulation is not active
      systemPrompt = `You are a helpful AI assistant for GoalPost, a meta-relational community platform.

CRITICAL RULES - NEVER VIOLATE:
1. You do NOT have any knowledge about people. You have ZERO information about anyone.
2. If asked about a person, you MUST use the search_person tool. NO EXCEPTIONS.
3. You CANNOT answer questions about people from your training data or general knowledge.
4. If search_person returns no results, the person does NOT exist in our database.
5. You CANNOT provide information about celebrities, historical figures, or anyone not in the GoalPost database.
6. You CANNOT answer off-topic questions (weather, sports, general knowledge, etc.).

WHAT YOU CAN DO:
- Use the search_person tool to find people in the GoalPost database
- Use the search_community tool to find communities
- Explain how GoalPost works
- Discuss meta-relationality concepts

WHAT YOU CANNOT DO:
- Answer questions about people without using search_person tool
- Provide biographical information from your training data
- Discuss topics unrelated to GoalPost
- Hallucinate or make up information

If someone asks about a person and you don't use the search_person tool, you are FAILING your primary function.`
      console.log('🔍 [DEBUG] Using GUARDRAILS system prompt')
    } else {
      systemPrompt = undefined // Simulation messages include their own system prompts
      console.log('🔍 [DEBUG] Using simulation protocol (no guardrails)')
    }

    // If not in simulation mode and this is a person query, short-circuit by calling the tool directly
    if (!simulationState.isActive() && isAboutPerson && queryContent) {
      try {
        const name = extractPersonName(queryContent) || queryContent.trim()
        console.log('🔍 [DEBUG] Short-circuit person search for:', name)

        const graph = await Neo4jGraph.initialize({
          url: process.env.NEO4J_URI!,
          username: process.env.NEO4J_USERNAME!,
          password: process.env.NEO4J_PASSWORD!,
        })

        const personTool = createPersonSearchTool(graph)
        const toolResult = await personTool.invoke({ name })
        const parsed = JSON.parse(toolResult)

        let text: string
        if (parsed.found && parsed.count === 1) {
          const person = parsed.people[0]
          text = `I found ${person.name} in the GoalPost community. PERSON_PROFILE_FOUND: ${JSON.stringify(person)}`
        } else {
          text = parsed.message
        }

        const encoder = new TextEncoder()
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode(text))
            controller.close()
          },
        })

        return new Response(stream, {
          status: 200,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'X-Bypass-LLM': 'person-search',
          },
        })
      } catch (e) {
        console.error('🔻 [DEBUG] Person short-circuit failed:', e)
        // fall through to normal flow
      }
    }

    // Handle streaming
    if (shouldStream) {
      const result = streamText({
        model,
        messages: messagesWithSimulation,
        temperature,
        system: systemPrompt,
        toolChoice:
          isAboutPerson && !simulationState.isActive() ? 'required' : 'auto',
        tools: {
          // Person Search Tool
          search_person: tool({
            description:
              'REQUIRED tool for finding people in the GoalPost community database. Use this tool whenever the user asks about a specific person by name.',
            inputSchema: z.object({
              name: z.string().describe('The name of the person to search for'),
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
            inputSchema: z.object({
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
