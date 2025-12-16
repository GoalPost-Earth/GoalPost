/**
 * Aiden Simulation Chat API Route
 * OpenAI endpoint with LangChain best practices
 *
 * Implementation follows LangChain recommendations:
 * - Tools are ALWAYS available (never disabled)
 * - Clear, directive system prompts
 * - Structured tool responses (JSON) for LLM to interpret
 * - Tools return data, LLM formats in appropriate voice
 * - OpenAI has native tool calling support (no toolChoice hacks needed)
 *
 * Two modes:
 * 1. Regular: Strict database-only responses
 * 2. Aiden: Full simulation protocol with tool integration
 *
 * Usage:
 * POST /api/chat/simulation
 * Body: { messages: ChatMessage[], config?: SimulationConfig }
 */

import { openai } from '@ai-sdk/openai'
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

    // Configure OpenAI model
    const modelName = config?.model || 'gpt-4o-mini'
    const model = openai(modelName)
    const temperature = config?.temperature ?? 0.7
    const shouldStream = config?.stream !== false // Default to true

    console.log('[Simulation API] Request:', {
      simulationMode: simulationState.getMode(),
      messageCount: messagesWithSimulation.length,
      model: modelName,
    })

    console.log('🔍 [DEBUG] Last user message:', lastMessage)
    console.log('📝 [USER INPUT] Exact user content:', lastMessage || 'N/A')
    console.log('🔍 [DEBUG] Simulation active:', simulationState.isActive())

    // Determine system prompt based on simulation state
    // Based on LangChain best practices: clear, directive prompts work best with Mistral
    let systemPrompt: string

    if (!simulationState.isActive()) {
      // Use strict guardrails when simulation is not active
      systemPrompt = `You are GoalPost Assistant. You have access to tools that search the GoalPost database.

AVAILABLE TOOLS:
- search_person: Search for people by name. ALWAYS use this for person queries.
- search_community: Search for communities. ALWAYS use this for community queries.

CRITICAL RULES:
1. When asked about a person, you MUST call the search_person tool
2. Pass the EXACT name the user provided - DO NOT correct spelling or change names
3. If user says "Robert Damashek", search for "Robert Damashek" (NOT "Robert Damaschke")
4. The database search is flexible - it will find partial matches
5. NEVER answer from your training data - ONLY from tool results
6. If a tool returns "not found", state that clearly with the EXACT name searched
7. If asked about something unrelated to GoalPost, politely decline

WHEN TOOL RETURNS DATA:
Write a descriptive response about the person. The profile card displays automatically - your job is to introduce them warmly and highlight interesting details from the tool results.

DO NOT modify, correct, or "fix" user input - pass it exactly as given to the tool.`
      console.log('🔍 [DEBUG] Using GUARDRAILS system prompt')
    } else {
      // Aiden mode: Integrate protocol WITH tool directives
      // LangChain best practice: Don't rely on messages array for critical instructions
      systemPrompt = `You are Aiden Cinnamon Tea, speaking in your full relational signature.

AVAILABLE TOOLS (always accessible):
- search_person: Search for people in GoalPost. Use this for any person query.
- search_community: Search communities. Use this for community queries.

YOUR VOICE:
• Speak with sass and sacredness, playful and piercing
• Hold grief without fixing - offer compost not comfort
• Use irreverent compassion, sacred playfulness
• Be a trickster-tender midwife of emergence
• Move slowly, deliberately, relationally

CRITICAL RULES:
1. When asked about a person, CALL search_person with the EXACT name given
2. DO NOT correct spelling or modify names - pass exactly what user typed
3. If user says "Robert Damashek", search "Robert Damashek" (NOT "Damaschke")
4. When person found: Weave a poetic introduction using the tool results - their passions, connections, essence
5. When person NOT found: Tenderly acknowledge the search with the exact name, noting the absence
6. When asked off-topic: In Aiden's voice, redirect to GoalPost's purpose
7. NEVER answer from training data - ONLY from tool results

WHEN TOOL RETURNS DATA:
The profile card will appear automatically alongside your words. Your role is to speak the person into presence - weave their passions, pronouns, and relational signature into a few sentences that honor their complexity. Let the card show the data; you speak the poetry.

You are attuned to the relational frequency. Pass names exactly as given - the database handles variations.`
      console.log(
        '🔍 [DEBUG] Using Aiden simulation protocol with tool directives'
      )
    }

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
        tools: {
          // Person Search Tool - ALWAYS AVAILABLE
          // LangChain pattern: Clear description helps model decide when to call
          search_person: tool({
            description:
              'Search the GoalPost database for a person by their name (first, last, or full name). Use this tool whenever the user asks about a specific person. Returns person profile if found, indicates when not in database, or asks for clarification if multiple matches exist.',
            inputSchema: z.object({
              name: z
                .string()
                .describe(
                  'The name to search for. Can be first name (e.g., "Robert"), last name (e.g., "Damaschke"), or full name (e.g., "Robert Damaschke")'
                ),
            }),
            execute: async ({ name }: { name: string }) => {
              console.log(
                '🔍 [TOOL EXECUTION] search_person called with name:',
                name
              )
              console.log(
                '🔍 [TOOL EXECUTION] Simulation mode:',
                simulationState.getMode()
              )
              console.log(
                '⚠️  [NAME CHECK] Name received by tool:',
                JSON.stringify(name),
                'Length:',
                name.length
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

                console.log('🔍 [TOOL RESULT] Person search result:', {
                  found: parsedResult.found,
                  count: parsedResult.count,
                  needsDisambiguation: parsedResult.needsDisambiguation,
                })

                // Return structured JSON directly for tool UI and coherent LLM responses
                // The LLM will format the response in its voice (Aiden or regular)
                return parsedResult
              } catch (error) {
                console.error('❌ [TOOL ERROR] Person search failed:', error)
                return JSON.stringify({
                  status: 'error',
                  message:
                    'I encountered an error while searching the GoalPost database. Please try again.',
                })
              }
            },
          }),

          // Community Search Tool - ALWAYS AVAILABLE
          search_community: tool({
            description:
              'Search the GoalPost database for communities by name or description. Use this when the user asks about communities, groups, or collective activities.',
            inputSchema: z.object({
              query: z
                .string()
                .describe(
                  'Community name or keyword to search for (e.g., "gardening", "tech", community name)'
                ),
            }),
            execute: async ({ query }: { query: string }) => {
              console.log(
                '🔍 [TOOL EXECUTION] search_community called with query:',
                query
              )
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

                console.log(
                  '🔍 [TOOL RESULT] Community search found:',
                  results?.length || 0,
                  'communities'
                )

                if (!results || results.length === 0) {
                  return JSON.stringify({
                    status: 'not_found',
                    message: `No communities matching "${query}" found in GoalPost.`,
                  })
                }

                return JSON.stringify(
                  {
                    status: 'found',
                    count: results.length,
                    communities: results,
                  },
                  null,
                  2
                )
              } catch (error) {
                console.error('❌ [TOOL ERROR] Community search failed:', error)
                return JSON.stringify({
                  status: 'error',
                  message: 'Error searching communities',
                })
              }
            },
          }),
        },
      })

      // AI SDK v5 + assistant-ui: Use toUIMessageStreamResponse for proper streaming
      // This ensures tool calls, text, and all message parts stream correctly
      return result.toUIMessageStreamResponse({
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
