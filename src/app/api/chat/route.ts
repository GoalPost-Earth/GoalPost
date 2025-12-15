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

    if (lastMessage) {
      const commandResult = processSimulationCommand(lastMessage)

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

    if (simulationState.isActive()) {
      // If simulation is active, the system prompts are already in messagesWithSimulation
      systemPrompt = '' // Empty string to avoid overriding protocol messages
      simulationState.incrementMessageCount()
    } else {
      // Use strict GoalPost-focused system prompt with guardrails
      systemPrompt =
        system ||
        `You are a helpful AI assistant for GoalPost, a meta-relational community platform.

IMPORTANT RESTRICTIONS:
- You can ONLY answer questions about the GoalPost community, its members, communities, goals, resources, and values
- You can ONLY provide information about people and entities that exist in the GoalPost database
- If someone asks about a person, you MUST use the search_person tool to check the database
- If the person is not found in the database, clearly state: "I searched the GoalPost database but could not find any person matching [name]. There is no information about such a person in our community database."
- You CANNOT provide information about people who are not in the GoalPost database
- You CANNOT answer questions about topics unrelated to GoalPost (weather, sports, celebrities, general knowledge, etc.)
- If asked something off-topic, politely redirect to GoalPost-related topics

ALLOWED TOPICS:
- Community members and their profiles
- Communities and organizations in GoalPost
- Goals and aspirations
- Resources and care points
- Core values and fields of care
- How GoalPost works
- Meta-relationality concepts

When searching for people, ALWAYS use the search_person tool. Never make up or hallucinate information about people.`
    }

    const result = streamText({
      model: ollama('mistral'),
      system: systemPrompt,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      messages: messagesWithSimulation as any,
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
