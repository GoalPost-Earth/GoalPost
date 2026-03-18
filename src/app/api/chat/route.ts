import { NextRequest, NextResponse } from 'next/server'
import { ChatOpenAI } from '@langchain/openai'
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
  BaseMessage,
  ToolMessage,
} from '@langchain/core/messages'
import { createPersonSearchTool } from '@/modules/agent/tools/person-search.tool'
import { createSpaceSearchTool } from '@/modules/agent/tools/space/space-search.tool'
import { createSpaceRenameTool } from '@/modules/agent/tools/space/space-rename.tool'
import {
  searchFieldContexts,
  updateFieldContext,
} from '@/modules/agent/tools/field-context/field-context.service'
import {
  searchPulses,
  updatePulse,
  linkPulseToContext,
  unlinkPulseFromContext,
} from '@/modules/agent/tools/pulse/pulse.service'
import { graphRagSearch } from '@/modules/agent/tools/rag/graph-rag.service'
import { SYSTEM_PROMPTS } from '@/lib/simulation/system-prompts'
import type { AssistantMode } from '@/lib/simulation'
import { DynamicTool } from '@langchain/core/tools'
import { DynamicStructuredTool } from '@langchain/community/tools/dynamic'
import { getLangChainEmbeddings } from '@/lib/llm/adapters/langchain-adapter'
import { initGraph } from '@/modules/graph'
import { z } from 'zod'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

interface ChatRequest {
  messages: Array<{ role: string; content: string }>
  system?: string
  tools?: Record<string, unknown>
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
    const { messages, system, aiMode }: ChatRequest = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    const mode = aiMode || 'default'
    const systemPrompt = system || SYSTEM_PROMPTS[mode]

    // Build streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Initialize tools
          const graph = await initGraph()
          const embeddings = getLangChainEmbeddings()

          const personTool = createPersonSearchTool(graph)
          const spaceSearchTool = createSpaceSearchTool(graph)
          const spaceRenameTool = createSpaceRenameTool(graph)

          const langchainTools = [
            new DynamicStructuredTool({
              name: 'search_person',
              description:
                'Search for a person in GoalPost by exact user-provided name string.',
              schema: z.object({
                name: z.string().describe('Person name to search for.'),
              }) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
              func: async (input: { name: string }) => {
                try {
                  return await personTool.invoke({ name: input.name })
                } catch {
                  return JSON.stringify({
                    found: false,
                    message: `Could not find ${input.name} in GoalPost`,
                  })
                }
              },
            }),
            new DynamicStructuredTool({
              name: 'search_community',
              description:
                'Search for communities in GoalPost by name or description.',
              schema: z.object({
                query: z.string().describe('Community name or keyword.'),
              }) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
              func: async (input: { query: string }) => {
                try {
                  const cypherQuery = `
                    MATCH (c:Community)
                    WHERE toLower(c.name) CONTAINS toLower($query)
                       OR toLower(coalesce(c.description, '')) CONTAINS toLower($query)
                    OPTIONAL MATCH (c)-[:MOTIVATED_BY]->(g:Goal)
                    OPTIONAL MATCH (p:Person)-[:BELONGS_TO]->(c)
                    WITH c,
                         [goal IN collect(DISTINCT g.name) WHERE goal IS NOT NULL][0..3] AS goals,
                         count(DISTINCT p) AS memberCount
                    RETURN c.name AS name, c.description AS description, goals, memberCount
                    LIMIT 8
                  `

                  const results = await graph.query(cypherQuery, {
                    query: input.query,
                  })
                  return JSON.stringify({
                    found: results.length > 0,
                    communities: results,
                    count: results.length,
                  })
                } catch {
                  return JSON.stringify({ found: false, communities: [] })
                }
              },
            }),
            new DynamicStructuredTool({
              name: 'search_space',
              description: 'Search spaces by name.',
              schema: z.object({
                name: z.string().describe('Space name to search for.'),
              }) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
              func: async (input: { name: string }) => {
                try {
                  return await spaceSearchTool.invoke({ name: input.name })
                } catch {
                  return JSON.stringify({
                    found: false,
                    message: `Could not find space ${input.name}`,
                  })
                }
              },
            }),
            new DynamicStructuredTool({
              name: 'rename_space',
              description: 'Rename a space using currentName and newName.',
              schema: z.object({
                currentName: z.string(),
                newName: z.string(),
              }) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
              func: async (input: { currentName: string; newName: string }) => {
                try {
                  return await spaceRenameTool.invoke(input)
                } catch {
                  return JSON.stringify({
                    success: false,
                    message: 'Failed to rename space',
                  })
                }
              },
            }),
            new DynamicStructuredTool({
              name: 'search_field_context',
              description: 'Search field contexts by title or emergent name.',
              schema: z.object({
                query: z.string(),
                spaceName: z.string().optional(),
                limit: z.number().int().positive().max(25).optional(),
              }) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
              func: async (input: {
                query: string
                spaceName?: string
                limit?: number
              }) => {
                try {
                  return JSON.stringify(await searchFieldContexts(graph, input))
                } catch {
                  return JSON.stringify({
                    success: false,
                    message: 'Failed to search field contexts',
                  })
                }
              },
            }),
            new DynamicStructuredTool({
              name: 'update_field_context',
              description: 'Update a field context title and/or emergent name.',
              schema: z.object({
                contextId: z.string().optional(),
                currentTitle: z.string().optional(),
                spaceName: z.string().optional(),
                newTitle: z.string().optional(),
                newEmergentName: z.string().optional(),
              }) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
              func: async (input: {
                contextId?: string
                currentTitle?: string
                spaceName?: string
                newTitle?: string
                newEmergentName?: string
              }) => {
                try {
                  return JSON.stringify(await updateFieldContext(graph, input))
                } catch {
                  return JSON.stringify({
                    success: false,
                    message: 'Failed to update field context',
                  })
                }
              },
            }),
            new DynamicStructuredTool({
              name: 'search_pulse',
              description:
                'Search pulses by title/content with optional context/type filters.',
              schema: z.object({
                query: z.string(),
                contextId: z.string().optional(),
                contextTitle: z.string().optional(),
                pulseType: z
                  .enum([
                    'GoalPulse',
                    'ResourcePulse',
                    'StoryPulse',
                    'CarePulse',
                    'CoreValuePulse',
                    'FieldPulse',
                  ])
                  .optional(),
                limit: z.number().int().positive().max(25).optional(),
              }) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
              func: async (input: {
                query: string
                contextId?: string
                contextTitle?: string
                pulseType?:
                  | 'GoalPulse'
                  | 'ResourcePulse'
                  | 'StoryPulse'
                  | 'CarePulse'
                  | 'CoreValuePulse'
                  | 'FieldPulse'
                limit?: number
              }) => {
                try {
                  return JSON.stringify(await searchPulses(graph, input))
                } catch {
                  return JSON.stringify({
                    success: false,
                    message: 'Failed to search pulses',
                  })
                }
              },
            }),
            new DynamicStructuredTool({
              name: 'update_pulse',
              description:
                'Update pulse properties such as title/content/status/intensity.',
              schema: z.object({
                pulseId: z.string().optional(),
                currentTitle: z.string().optional(),
                contextId: z.string().optional(),
                newTitle: z.string().optional(),
                newContent: z.string().optional(),
                newStatus: z.string().optional(),
                newIntensity: z.number().optional(),
                newHorizon: z.string().optional(),
                newResourceType: z.string().optional(),
                newAvailability: z.number().optional(),
                newWhy: z.string().optional(),
                newLocation: z.string().optional(),
                newTime: z.string().optional(),
              }) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
              func: async (input: {
                pulseId?: string
                currentTitle?: string
                contextId?: string
                newTitle?: string
                newContent?: string
                newStatus?: string
                newIntensity?: number
                newHorizon?: string
                newResourceType?: string
                newAvailability?: number
                newWhy?: string
                newLocation?: string
                newTime?: string
              }) => {
                try {
                  return JSON.stringify(await updatePulse(graph, input))
                } catch {
                  return JSON.stringify({
                    success: false,
                    message: 'Failed to update pulse',
                  })
                }
              },
            }),
            new DynamicStructuredTool({
              name: 'edit_pulse_context_link',
              description: 'Link or unlink a pulse to/from a field context.',
              schema: z.object({
                action: z.enum(['link', 'unlink']),
                pulseId: z.string(),
                contextId: z.string().optional(),
                contextTitle: z.string().optional(),
              }) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
              func: async (input: {
                action: 'link' | 'unlink'
                pulseId: string
                contextId?: string
                contextTitle?: string
              }) => {
                try {
                  const result =
                    input.action === 'link'
                      ? await linkPulseToContext(graph, input)
                      : await unlinkPulseFromContext(graph, input)
                  return JSON.stringify(result)
                } catch {
                  return JSON.stringify({
                    success: false,
                    message: 'Failed to edit pulse/context link',
                  })
                }
              },
            }),
            new DynamicStructuredTool({
              name: 'graph_rag_search',
              description:
                'Run vector + graph retrieval across people and pulses for semantic Graph RAG answers.',
              schema: z.object({
                query: z.string(),
                scope: z.enum(['people', 'pulses', 'all']).optional(),
                contextId: z.string().optional(),
                limit: z.number().int().positive().max(20).optional(),
              }) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
              func: async (input: {
                query: string
                scope?: 'people' | 'pulses' | 'all'
                contextId?: string
                limit?: number
              }) => {
                try {
                  return JSON.stringify(
                    await graphRagSearch(graph, embeddings, input)
                  )
                } catch {
                  return JSON.stringify({
                    success: false,
                    message: 'Failed to run graph rag search',
                  })
                }
              },
            }),
          ]

          // Initialize model
          const model = new ChatOpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            model: 'gpt-4.1',
            temperature: 0.7,
            maxTokens: 2048,
          })

          const modelWithTools = model.bindTools(langchainTools)

          // Convert UI messages to LangChain format
          const messageHistory: BaseMessage[] = [
            new SystemMessage(systemPrompt),
            ...messages.map((msg) => {
              if (msg.role === 'user') {
                return new HumanMessage(msg.content)
              }
              if (msg.role === 'assistant') {
                return new AIMessage(msg.content)
              }
              return new HumanMessage(msg.content)
            }),
          ]

          // First invoke
          let response = await modelWithTools.invoke(messageHistory)

          // Handle tool calls
          if (response.tool_calls && response.tool_calls.length > 0) {
            const toolsMap = Object.fromEntries(
              langchainTools.map((t) => [t.name, t])
            )
            const toolResults: ToolMessage[] = []

            // Execute tools
            for (const toolCall of response.tool_calls) {
              try {
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
                if (!tool) continue

                const result = await tool.invoke(toolCall.args || {})

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

            // Add results and get final response
            messageHistory.push(response)
            messageHistory.push(...toolResults)
            messageHistory.push(
              new HumanMessage(
                'Based on the tool results above, please provide a clear and engaging response.'
              )
            )

            response = await modelWithTools.invoke(messageHistory)
          }

          // Send message event
          const finalText = (response.content as string) || ''
          const messageEvent: StreamEvent = {
            type: 'message',
            content: finalText,
          }
          controller.enqueue(
            encoder.encode(JSON.stringify(messageEvent) + '\n')
          )

          // Send done event
          const doneEvent: StreamEvent = {
            type: 'done',
          }
          controller.enqueue(encoder.encode(JSON.stringify(doneEvent) + '\n'))
        } catch (error) {
          const errorEvent: StreamEvent = {
            type: 'error',
            error:
              error instanceof Error ? error.message : 'Internal server error',
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
    const message =
      error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
