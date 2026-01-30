import { NextRequest, NextResponse } from 'next/server'
import { ChatOpenAI } from '@langchain/openai'
import {
  HumanMessage,
  SystemMessage,
  BaseMessage,
  ToolMessage,
} from '@langchain/core/messages'
import { Neo4jGraph } from '@langchain/community/graphs/neo4j_graph'
import { createPersonSearchTool } from '@/modules/agent/tools/person-search.tool'
import { SYSTEM_PROMPTS } from '@/lib/simulation/system-prompts'
import type { AssistantMode } from '@/lib/simulation'
import { DynamicTool } from '@langchain/core/tools'

export const maxDuration = 60

interface ChatRequest {
  message: string
  aiMode?: AssistantMode
}

interface StreamEvent {
  type:
    | 'tool_call'
    | 'tool_result'
    | 'tool_error'
    | 'message'
    | 'done'
    | 'error'
  tool?: string
  args?: unknown
  result?: unknown
  content?: string
  error?: string
}

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder()

  try {
    console.log('[Chat Test] Incoming request')
    const { message, aiMode = 'default' } = (await req.json()) as ChatRequest

    if (!message) {
      console.log('[Chat Test] No message provided')
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    console.log('[Chat Test] Message:', message, 'Mode:', aiMode)

    // Build streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Build tools using LangChain's DynamicTool pattern
          const tools = [
            new DynamicTool({
              name: 'search_person',
              description:
                'Search for a person in GoalPost by name. Use this whenever the user asks about someone specific.',
              func: async (name: string) => {
                try {
                  console.log('[Chat Test] Executing search_person for:', name)
                  const graph = await Neo4jGraph.initialize({
                    url: process.env.NEO4J_URI!,
                    username: process.env.NEO4J_USERNAME!,
                    password: process.env.NEO4J_PASSWORD!,
                  })

                  const personTool = createPersonSearchTool(graph)
                  const result = await personTool.invoke({ name })
                  const parsed = JSON.parse(result)
                  console.log('[Chat Test] Found person:', parsed.found)
                  return JSON.stringify(parsed)
                } catch (error) {
                  console.error('[Chat Test] search_person error:', error)
                  return JSON.stringify({
                    found: false,
                    message: `Could not find ${name} in GoalPost`,
                  })
                }
              },
            }),

            new DynamicTool({
              name: 'search_community',
              description: 'Search for communities in GoalPost',
              func: async (query: string) => {
                try {
                  console.log(
                    '[Chat Test] Executing search_community for:',
                    query
                  )
                  const graph = await Neo4jGraph.initialize({
                    url: process.env.NEO4J_URI!,
                    username: process.env.NEO4J_USERNAME!,
                    password: process.env.NEO4J_PASSWORD!,
                  })

                  const cypherQuery = `
                    MATCH (c:Community)
                    WHERE toLower(c.name) CONTAINS toLower($query)
                    RETURN c.name as name, c.description as description
                    LIMIT 5
                  `

                  const results = await graph.query(cypherQuery, { query })
                  return JSON.stringify({
                    found: results.length > 0,
                    communities: results,
                    count: results.length,
                  })
                } catch (error) {
                  console.error('[Chat Test] search_community error:', error)
                  return JSON.stringify({ found: false, communities: [] })
                }
              },
            }),
          ]

          // Initialize ChatOpenAI model
          console.log('[Chat Test] Initializing ChatOpenAI model')
          const model = new ChatOpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            model: 'gpt-4.1',
            temperature: 0.7,
            maxTokens: 2048,
          })

          // Bind tools to model
          console.log('[Chat Test] Binding tools to model')
          const modelWithTools = model.bindTools(tools)

          // Build message history
          const messageHistory: BaseMessage[] = [
            new SystemMessage(SYSTEM_PROMPTS[aiMode]),
            new HumanMessage(message),
          ]

          console.log('[Chat Test] Starting tool execution loop')
          let response = await modelWithTools.invoke(messageHistory)

          // Handle tool calls
          if (response.tool_calls && response.tool_calls.length > 0) {
            console.log(
              '[Chat Test] Tool calls detected:',
              response.tool_calls.length
            )

            const toolsMap = Object.fromEntries(tools.map((t) => [t.name, t]))
            const toolResults: ToolMessage[] = []

            // Execute tools
            for (const toolCall of response.tool_calls) {
              try {
                console.log('[Chat Test] Executing tool:', toolCall.name)

                // Send tool_call event
                const toolCallEvent: StreamEvent = {
                  type: 'tool_call',
                  tool: toolCall.name,
                  args: toolCall.args,
                }
                controller.enqueue(
                  encoder.encode(JSON.stringify(toolCallEvent) + '\n')
                )

                const tool = toolsMap[toolCall.name]
                if (!tool) {
                  console.log('[Chat Test] Tool not found:', toolCall.name)
                  continue
                }

                const result = await tool.invoke(toolCall.args || {})
                console.log(
                  '[Chat Test] Tool result received for:',
                  toolCall.name
                )

                // Send tool_result event
                const resultEvent: StreamEvent = {
                  type: 'tool_result',
                  tool: toolCall.name,
                  result: JSON.parse(result as string),
                }
                controller.enqueue(
                  encoder.encode(JSON.stringify(resultEvent) + '\n')
                )

                if (toolCall.id) {
                  toolResults.push(
                    new ToolMessage({
                      content: result as string,
                      tool_call_id: toolCall.id,
                      name: toolCall.name,
                    })
                  )
                }
              } catch (error) {
                console.error(
                  '[Chat Test] Tool execution error:',
                  toolCall.name,
                  error
                )

                // Send tool_error event
                const errorEvent: StreamEvent = {
                  type: 'tool_error',
                  tool: toolCall.name,
                  error:
                    error instanceof Error ? error.message : 'Unknown error',
                }
                controller.enqueue(
                  encoder.encode(JSON.stringify(errorEvent) + '\n')
                )

                if (toolCall.id) {
                  toolResults.push(
                    new ToolMessage({
                      content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                      tool_call_id: toolCall.id,
                      name: toolCall.name,
                    })
                  )
                }
              }
            }

            // Add assistant response and tool results to history
            messageHistory.push(response)
            messageHistory.push(...toolResults)

            // Get final response
            console.log(
              '[Chat Test] Getting final response after tool execution'
            )
            messageHistory.push(
              new HumanMessage(
                'Based on the tool results above, please provide a clear and engaging response.'
              )
            )

            response = await modelWithTools.invoke(messageHistory)
            const finalText = (response.content as string) || ''
            console.log(
              '[Chat Test] Final response generated, length:',
              finalText.length
            )

            // Send message event
            const messageEvent: StreamEvent = {
              type: 'message',
              content: finalText,
            }
            controller.enqueue(
              encoder.encode(JSON.stringify(messageEvent) + '\n')
            )
          } else {
            const finalText = (response.content as string) || ''
            console.log('[Chat Test] No tool calls, using direct response')

            // Send message event
            const messageEvent: StreamEvent = {
              type: 'message',
              content: finalText,
            }
            controller.enqueue(
              encoder.encode(JSON.stringify(messageEvent) + '\n')
            )
          }

          // Send done event
          const doneEvent: StreamEvent = {
            type: 'done',
          }
          controller.enqueue(encoder.encode(JSON.stringify(doneEvent) + '\n'))

          console.log('[Chat Test] Stream complete')
        } catch (error) {
          console.error('[Chat Test] Stream error:', error)
          const errorEvent: StreamEvent = {
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          }
          controller.enqueue(encoder.encode(JSON.stringify(errorEvent) + '\n'))
        } finally {
          controller.close()
        }
      },
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('[Chat Test] Fatal error:', error)
    const message =
      error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
