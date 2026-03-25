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
import { searchFieldContexts } from '@/modules/agent/tools/field-context/field-context.service'
import { searchPulses } from '@/modules/agent/tools/pulse/pulse.service'
import { graphRagSearch } from '@/modules/agent/tools/rag/graph-rag.service'
import { SYSTEM_PROMPTS } from '@/lib/simulation/system-prompts'
import type { AssistantMode } from '@/lib/simulation'
import { DynamicStructuredTool } from '@langchain/community/tools/dynamic'
import { getLangChainEmbeddings } from '@/lib/llm/adapters/langchain-adapter'
import { initGraph } from '@/modules/graph'
import { verifyJWT } from '@/app/api/auth/utils'
import {
  type ApprovedAction,
  buildApprovedActionHashSet,
  createApprovalHash,
  describeWriteAction,
  executeAuthorizedWriteTool,
  isWriteToolName,
} from './hitl'
import { z } from 'zod'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

interface ChatRequest {
  messages: Array<{ role: string; content: string }>
  system?: string
  tools?: Record<string, unknown>
  aiMode?: AssistantMode
  currentUserId?: string
  approvedActions?: ApprovedAction[]
}

interface StreamEvent {
  type:
    | 'tool_call'
    | 'tool_result'
    | 'tool_error'
    | 'approval_required'
    | 'message'
    | 'done'
    | 'error'
  tool?: string
  args?: unknown
  result?: unknown
  summary?: string
  approvalHash?: string
  content?: string
  error?: string
}

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder()

  try {
    // Get request body first to potentially get currentUserId from client
    const {
      messages,
      system,
      aiMode,
      currentUserId: clientProvidedUserId,
      approvedActions,
    }: ChatRequest = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    // Determine current user ID from client request or JWT token
    let currentUserId: string | null = clientProvidedUserId || null

    // Fall back to reading from JWT cookie if not provided in request body
    if (!currentUserId) {
      const token = req.cookies.get('accessToken')?.value
      if (token) {
        try {
          const decoded = verifyJWT(token) as { user: { id: string } }
          currentUserId = decoded.user.id
        } catch (error) {
          console.error('Token verification failed:', error)
          // Continue without user - some tools may not be available
        }
      }
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

          const langchainTools = [
            new DynamicStructuredTool({
              name: 'get_my_spaces',
              description:
                'Get all spaces that the current authenticated user is a member of.',
              schema: z.object({}) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
              func: async () => {
                if (!currentUserId) {
                  return JSON.stringify({
                    found: false,
                    spaces: [],
                    message:
                      'Could not identify current user. Please log in and try again.',
                  })
                }
                try {
                  const query = `
                    MATCH (p:Person {id: $userId})-[:BELONGS_TO]->(s:Space)
                    RETURN s.id AS id, s.name AS name, s.description AS description
                    ORDER BY s.name
                  `
                  const results = await graph.query(query, {
                    userId: currentUserId,
                  })
                  if (results.length === 0) {
                    return JSON.stringify({
                      found: false,
                      spaces: [],
                      message: 'You are not currently a member of any spaces.',
                    })
                  }
                  return JSON.stringify({
                    found: true,
                    spaces: results,
                    count: results.length,
                  })
                } catch (error) {
                  return JSON.stringify({
                    found: false,
                    spaces: [],
                    message: `Could not fetch your spaces: ${error instanceof Error ? error.message : 'Unknown error'}`,
                  })
                }
              },
            }),
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
                  return JSON.stringify({
                    success: true,
                    pendingApproval: true,
                    message:
                      'Rename request prepared. Waiting for user approval before execution.',
                    requestedChange: input,
                  })
                } catch {
                  return JSON.stringify({
                    success: false,
                    message: 'Failed to rename space',
                  })
                }
              },
            }),
            new DynamicStructuredTool({
              name: 'create_field_context',
              description:
                'Create a field context (field) in a space you can edit.',
              schema: z.object({
                spaceId: z.string().optional(),
                spaceName: z.string().optional(),
                title: z.string(),
                emergentName: z.string().optional(),
              }) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
              func: async (input: {
                spaceId?: string
                spaceName?: string
                title: string
                emergentName?: string
              }) => {
                return JSON.stringify({
                  success: true,
                  pendingApproval: true,
                  message:
                    'Field context creation prepared. Waiting for user approval before execution.',
                  requestedChange: input,
                })
              },
            }),
            new DynamicStructuredTool({
              name: 'delete_field_context',
              description:
                'Delete a field context you can edit. If it has pulses, set deletePulses true to remove them too.',
              schema: z.object({
                contextId: z.string().optional(),
                contextTitle: z.string().optional(),
                currentTitle: z.string().optional(),
                spaceName: z.string().optional(),
                deletePulses: z.boolean().optional(),
              }) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
              func: async (input: {
                contextId?: string
                contextTitle?: string
                currentTitle?: string
                spaceName?: string
                deletePulses?: boolean
              }) => {
                return JSON.stringify({
                  success: true,
                  pendingApproval: true,
                  message:
                    'Field context deletion prepared. Waiting for user approval before execution.',
                  requestedChange: input,
                })
              },
            }),
            new DynamicStructuredTool({
              name: 'update_my_profile',
              description:
                'Update the current authenticated user profile. Currently supports updating your own display name only.',
              schema: z.object({
                newName: z
                  .string()
                  .min(1)
                  .describe('Your new display name for your own profile.'),
              }) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
              func: async (input: { newName: string }) => {
                return JSON.stringify({
                  success: true,
                  pendingApproval: true,
                  message:
                    'Profile update prepared. Waiting for user approval before execution.',
                  requestedChange: input,
                })
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
                  return JSON.stringify({
                    success: true,
                    pendingApproval: true,
                    message:
                      'Field context update prepared. Waiting for user approval before execution.',
                    requestedChange: input,
                  })
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
              name: 'create_pulse',
              description: 'Create a pulse in a field context you can edit.',
              schema: z.object({
                contextId: z.string().optional(),
                contextTitle: z.string().optional(),
                spaceName: z.string().optional(),
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
                title: z.string(),
                content: z.string(),
                status: z.string().optional(),
                intensity: z.number().optional(),
                horizon: z.string().optional(),
                resourceType: z.string().optional(),
                availability: z.number().optional(),
                why: z.string().optional(),
                location: z.string().optional(),
                time: z.string().optional(),
              }) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
              func: async (input: {
                contextId?: string
                contextTitle?: string
                spaceName?: string
                pulseType?:
                  | 'GoalPulse'
                  | 'ResourcePulse'
                  | 'StoryPulse'
                  | 'CarePulse'
                  | 'CoreValuePulse'
                  | 'FieldPulse'
                title: string
                content: string
                status?: string
                intensity?: number
                horizon?: string
                resourceType?: string
                availability?: number
                why?: string
                location?: string
                time?: string
              }) => {
                return JSON.stringify({
                  success: true,
                  pendingApproval: true,
                  message:
                    'Pulse creation prepared. Waiting for user approval before execution.',
                  requestedChange: input,
                })
              },
            }),
            new DynamicStructuredTool({
              name: 'delete_pulse',
              description: 'Delete a pulse you can edit.',
              schema: z.object({
                pulseId: z.string().optional(),
                currentTitle: z.string().optional(),
                contextId: z.string().optional(),
              }) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
              func: async (input: {
                pulseId?: string
                currentTitle?: string
                contextId?: string
              }) => {
                return JSON.stringify({
                  success: true,
                  pendingApproval: true,
                  message:
                    'Pulse deletion prepared. Waiting for user approval before execution.',
                  requestedChange: input,
                })
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
                  return JSON.stringify({
                    success: true,
                    pendingApproval: true,
                    message:
                      'Pulse update prepared. Waiting for user approval before execution.',
                    requestedChange: input,
                  })
                } catch {
                  return JSON.stringify({
                    success: false,
                    message: 'Failed to update pulse',
                  })
                }
              },
            }),
            new DynamicStructuredTool({
              name: 'delete_my_profile',
              description:
                'Deactivate the current authenticated user profile. Only applies to your own account.',
              schema: z.object({
                confirm: z.boolean().optional(),
              }) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
              func: async (input: { confirm?: boolean }) => {
                return JSON.stringify({
                  success: true,
                  pendingApproval: true,
                  message:
                    'Profile deactivation prepared. Waiting for user approval before execution.',
                  requestedChange: input,
                })
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
                  return JSON.stringify({
                    success: true,
                    pendingApproval: true,
                    message:
                      'Pulse/context link update prepared. Waiting for user approval before execution.',
                    requestedChange: input,
                  })
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
            const approvedActionHashes =
              buildApprovedActionHashSet(approvedActions)
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

                let parsedResult: Record<string, unknown>
                if (isWriteToolName(toolCall.name)) {
                  const args = (toolCall.args || {}) as Record<string, unknown>
                  const approvalHash = createApprovalHash(toolCall.name, args)

                  if (!approvedActionHashes.has(approvalHash)) {
                    const approvalEvent: StreamEvent = {
                      type: 'approval_required',
                      tool: toolCall.name,
                      args,
                      summary: describeWriteAction(toolCall.name, args),
                      approvalHash,
                    }
                    controller.enqueue(
                      encoder.encode(JSON.stringify(approvalEvent) + '\n')
                    )

                    parsedResult = {
                      success: false,
                      approvalRequired: true,
                      approvalHash,
                      message:
                        'This action needs your approval before I can execute it.',
                    }
                  } else {
                    parsedResult = await executeAuthorizedWriteTool(
                      graph,
                      currentUserId,
                      toolCall.name,
                      args
                    )
                  }
                } else {
                  const result = await tool.invoke(toolCall.args || {})
                  parsedResult = JSON.parse(result as string) as Record<
                    string,
                    unknown
                  >
                }

                // Send tool_result event
                const resultEvent: StreamEvent = {
                  type: 'tool_result',
                  tool: toolCall.name,
                  result: parsedResult,
                }
                controller.enqueue(
                  encoder.encode(JSON.stringify(resultEvent) + '\n')
                )

                if (toolCall.id) {
                  toolResults.push(
                    new ToolMessage({
                      content: JSON.stringify(parsedResult),
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
