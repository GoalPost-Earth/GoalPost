import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai'
import { BaseChatModel } from 'langchain/chat_models/base'
import { Embeddings } from '@langchain/core/embeddings'
import { Neo4jGraph } from '@langchain/community/graphs/neo4j_graph'
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents'
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts'
import { BufferMemory } from 'langchain/memory'
import initTools from './tools'
import { createPersonSearchTool } from './tools/person-search.tool'
import { validateQuery } from '@/lib/simulation/guardrails'

/**
 * ReAct Agent for GoalPost
 *
 * A Reasoning + Acting agent that:
 * 1. Validates queries against guardrails
 * 2. Uses Neo4j tools to search communities, people, resources
 * 3. Handles person disambiguation
 * 4. Returns structured responses for UI rendering
 */

const REACT_AGENT_SYSTEM_PROMPT = `You are a helpful AI assistant for the GoalPost community platform. GoalPost is a meta-relational community platform that helps people connect through shared values, goals, and fields of care.

Your role is to help users:
- Find and learn about community members
- Discover communities and their goals
- Explore resources and care points
- Understand connections and relationships
- Navigate the platform

IMPORTANT GUIDELINES:
1. When searching for people, use the search_person_by_name tool
2. If multiple people match a name, present the options and ask for clarification
3. If no person is found, clearly state that there is no information about that person in the database
4. When you find a person's profile, respond with their information in a conversational way
5. Use the graph tools to find communities, resources, goals, and relationships
6. Be warm, helpful, and community-focused in your responses
7. If asked about meta-relationality, explain it as a framework for understanding how relationships evolve and transform

TOOL USAGE:
- Use "search_person_by_name" for finding specific people by name
- Use "graph-cypher-retrieval-chain" for complex queries about communities, goals, resources
- Use "graph-vector-retrieval-chain" for similarity-based searches (finding people with similar interests)

Remember: You are part of the GoalPost community. Be empathetic, clear, and focused on connection.`

export interface ReActAgentConfig {
  llm: BaseChatModel
  embeddings: Embeddings
  graph: Neo4jGraph
  sessionId?: string
}

export async function createReActAgent(config: ReActAgentConfig) {
  const { llm, embeddings, graph } = config

  // Initialize all tools
  const baseTools = await initTools(llm, embeddings, graph)
  const personSearchTool = createPersonSearchTool(graph)
  const tools = [...baseTools, personSearchTool]

  // Create the prompt template for ReAct agent
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', REACT_AGENT_SYSTEM_PROMPT],
    new MessagesPlaceholder('chat_history'),
    ['human', '{input}'],
    new MessagesPlaceholder('agent_scratchpad'),
  ])

  // Create memory for conversation history
  const memory = new BufferMemory({
    memoryKey: 'chat_history',
    returnMessages: true,
    inputKey: 'input',
    outputKey: 'output',
  })

  // Create the OpenAI Functions agent
  const agent = await createOpenAIFunctionsAgent({
    llm,
    tools,
    prompt,
  })

  // Create the agent executor
  const executor = new AgentExecutor({
    agent,
    tools,
    memory,
    verbose: true,
    returnIntermediateSteps: true,
  })

  return executor
}

/**
 * Process a query through the ReAct agent with guardrails
 */
export async function processQueryWithAgent(
  executor: AgentExecutor,
  query: string,
  llm: BaseChatModel
): Promise<{
  success: boolean
  output: string
  blocked?: boolean
  intermediateSteps?: unknown[]
}> {
  // Step 1: Validate against guardrails
  const validation = await validateQuery(query, llm)

  if (!validation.isAllowed) {
    return {
      success: false,
      blocked: true,
      output: validation.rejectionMessage || 'Query not allowed',
    }
  }

  // Step 2: Process with ReAct agent
  try {
    const result = await executor.invoke({
      input: query,
    })

    return {
      success: true,
      output: result.output,
      intermediateSteps: result.intermediateSteps,
    }
  } catch (error) {
    console.error('ReAct agent error:', error)
    return {
      success: false,
      output:
        'I encountered an error processing your request. Please try rephrasing your question.',
    }
  }
}

/**
 * Create a ReAct agent instance with default configuration
 */
export async function createDefaultReActAgent(
  graph: Neo4jGraph,
  sessionId?: string
): Promise<AgentExecutor> {
  const llm = new ChatOpenAI({
    modelName: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    temperature: 0.7,
    streaming: false,
  })

  const embeddings = new OpenAIEmbeddings({
    modelName: 'text-embedding-3-small',
  })

  return createReActAgent({
    llm,
    embeddings,
    graph,
    sessionId,
  })
}
