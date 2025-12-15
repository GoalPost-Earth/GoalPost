import { createOllama } from 'ollama-ai-provider-v2'
import { streamText, UIMessage, convertToModelMessages, tool } from 'ai'
import { z } from 'zod'
import { frontendTools } from '@assistant-ui/react-ai-sdk'
import {
  simulationState,
  buildMessagePayload,
  processSimulationCommand,
  getLastUserMessage,
} from '@/lib/simulation'
import type { ChatMessage } from '@/lib/simulation'
import { Neo4jGraph } from '@langchain/community/graphs/neo4j_graph'
import { createPersonSearchTool } from '@/modules/agent/tools/person-search.tool'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

/**
 * Detects if the user query is asking about a specific person
 */
function isPersonQuery(message: string): boolean {
  const personPatterns = [
    /\b(who is|tell me about|find|search for|show me|know about|information about)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /\b(does|do you know)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(profile|bio|background|details)/i,
  ]
  return personPatterns.some((pattern) => pattern.test(message))
}

// Configure Ollama provider
const ollama = createOllama({
  baseURL: process.env.OLLAMA_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.OLLAMA_BEARER_TOKEN}`,
  },
})

export async function POST(req: Request) {
  try {
    const {
      messages,
      system,
      tools,
    }: {
      messages: UIMessage[]
      system?: string
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tools?: any
    } = await req.json()

    // Check for simulation activation/deactivation commands
    const lastMessage = getLastUserMessage(messages as unknown as ChatMessage[])
    console.log('🔍 [DEBUG] Last user message:', lastMessage)

    if (lastMessage) {
      const commandResult = processSimulationCommand(lastMessage)
      console.log('🔍 [DEBUG] Command result:', commandResult)

      // If a command was intercepted, return immediate response
      if (commandResult.intercepted && commandResult.responseMessage) {
        return new Response(
          JSON.stringify({
            role: 'assistant',
            content: commandResult.responseMessage,
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }
    }

    // Convert messages and build payload with simulation prompts if active
    const convertedMessages = convertToModelMessages(messages)
    const messagesWithSimulation = buildMessagePayload(
      convertedMessages as ChatMessage[]
    )

    // Determine system prompt based on simulation state
    let systemPrompt: string | undefined

    console.log('🔍 [DEBUG] Simulation active:', simulationState.isActive())

    if (simulationState.isActive()) {
      // If simulation is active, the system prompts are already in messagesWithSimulation
      systemPrompt = '' // Empty string to avoid overriding protocol messages
      simulationState.incrementMessageCount()
      console.log('🔍 [DEBUG] Using simulation protocol (empty system prompt)')
    } else {
      // Use strict GoalPost-focused system prompt with guardrails
      systemPrompt =
        system ||
        `You are a helpful AI assistant for GoalPost, a meta-relational community platform.

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
      console.log(
        '📝 [DEBUG] System prompt preview:',
        systemPrompt.substring(0, 200) + '...'
      )
    }

    console.log(
      '🔍 [DEBUG] Final system prompt length:',
      systemPrompt?.length || 0
    )
    // Detect if query is about a person to force tool usage
    const isAboutPerson = lastMessage
      ? isPersonQuery(lastMessage.content)
      : false
    console.log(
      '🔍 [DEBUG] Is person query:',
      isAboutPerson,
      'Query:',
      lastMessage?.content
    )
    const result = streamText({
      model: ollama('mistral'),
      system: systemPrompt,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      messages: messagesWithSimulation as any,
      toolChoice: isAboutPerson ? 'required' : 'auto',
      tools: {
        // Frontend tools forwarded from AssistantChatTransport
        ...frontendTools(tools),

        // GoalPost Person Search - REQUIRED for person queries
        search_person: tool({
          description:
            'REQUIRED tool for finding people in the GoalPost community database. Use this tool whenever the user asks about a specific person by name. This tool searches the Neo4j database and returns actual person data if found, or clearly states when a person is not in the database. Never provide information about people without using this tool first.',
          inputSchema: z.object({
            name: z.string().describe('The name of the person to search for'),
          }),
          execute: async ({ name }) => {
            console.log('🔍 [DEBUG] search_person tool called with name:', name)
            try {
              // Initialize Neo4j graph connection
              const graph = await Neo4jGraph.initialize({
                url: process.env.NEO4J_URI!,
                username: process.env.NEO4J_USERNAME!,
                password: process.env.NEO4J_PASSWORD!,
              })

              // Create person search tool
              const personTool = createPersonSearchTool(graph)

              // Execute the search
              const result = await personTool.invoke({ name })
              const parsedResult = JSON.parse(result)

              console.log('🔍 [DEBUG] Person search result:', {
                found: parsedResult.found,
                count: parsedResult.count,
                needsDisambiguation: parsedResult.needsDisambiguation,
              })

              // If person found, format for UI rendering
              if (parsedResult.found && parsedResult.count === 1) {
                const person = parsedResult.people[0]
                return `I found ${person.name} in the GoalPost community. PERSON_PROFILE_FOUND: ${JSON.stringify(person)}`
              }

              // Return the message from the tool (handles not found and disambiguation)
              return parsedResult.message
            } catch (error) {
              console.error('Person search error:', error)
              return 'I encountered an error while searching the GoalPost database. Please try again.'
            }
          },
        }),

        // GoalPost Community Search
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

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
