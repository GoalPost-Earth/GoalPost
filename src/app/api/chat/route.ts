import { createOllama } from 'ollama-ai-provider-v2'
import { streamText, UIMessage, convertToModelMessages, tool } from 'ai'
import { z } from 'zod'
import { frontendTools } from '@assistant-ui/react-ai-sdk'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

// Configure Ollama provider with remote instance
const ollama = createOllama({
  baseURL: 'http://120.238.149.138:57253/api',
  headers: {
    Authorization: `Bearer 54eb0876757612c3716bfae45cd743a2e2a22729934f918393258aab5c57753f`,
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

    const result = streamText({
      model: ollama('mistral'),
      system:
        system ||
        'You are a helpful AI assistant for GoalPost, a platform that helps communities achieve their goals through shared values and collaborative action.',
      messages: convertToModelMessages(messages),
      tools: {
        // Frontend tools forwarded from AssistantChatTransport
        ...frontendTools(tools),
        // Backend tools - Example weather tool
        get_current_weather: tool({
          description: 'Get the current weather for a city',
          inputSchema: z.object({
            city: z.string().describe('The city to get weather for'),
          }),
          execute: async ({ city }) => {
            // Mock implementation - replace with actual weather API
            return {
              city,
              temperature: 72,
              condition: 'sunny',
              humidity: 45,
            }
          },
        }),
        // TODO: Add Neo4j-powered tools here
        // - search_communities
        // - get_core_values
        // - find_members
        // - get_community_details
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
