import { Embeddings } from '@langchain/core/embeddings'
import { Neo4jGraph } from '@langchain/community/graphs/neo4j_graph'
import initRephraseChain, {
  RephraseQuestionInput,
} from './chains/rephrase-question.chain'
import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { RunnablePassthrough } from '@langchain/core/runnables'
import { getHistory } from './history'
import initTools from './tools'
import { createAgent } from 'langchain'

// tag::function[]
export default async function initAgent(
  llm: BaseChatModel,
  embeddings: Embeddings,
  graph: Neo4jGraph
) {
  // Initiate tools
  const tools = await initTools(llm, embeddings, graph)

  // Create an agent using the new v1 API
  const agent = createAgent({
    model: llm,
    tools,
    systemPrompt: `You are a helpful AI assistant for GoalPost, a meta-relational community platform.
    
Use the available tools to search the Neo4j graph database and answer questions about:
- People and their profiles
- Communities and goals
- Resources and care points
- Relationships and connections

When answering questions:
1. Use the graph tools to retrieve information
2. Provide clear, conversational responses
3. If information is not found, state that clearly
4. Be warm and community-focused`,
  })

  // Create a rephrase question chain
  const rephraseQuestionChain = await initRephraseChain(llm)

  // Return a runnable passthrough that combines history, rephrasing, and agent execution
  return RunnablePassthrough.assign<
    { input: string; sessionId: string },
    Record<string, unknown>
  >({
    // Get Message History
    history: async (_input, options) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sessionId = (options as any)?.config?.configurable?.sessionId as
        | string
        | undefined
      if (!sessionId) return []

      const history = await getHistory(sessionId)
      return history
    },
  })
    .assign({
      // Use History to rephrase the question
      rephrasedQuestion: (input: RephraseQuestionInput, config: never) =>
        rephraseQuestionChain.invoke(input, config),
    })
    .pipe(async (input) => {
      // Invoke the agent with the rephrased question
      const result = await agent.invoke({
        messages: [
          { role: 'user', content: input.rephrasedQuestion || input.input },
        ],
      })

      // Extract the output from the messages
      const messages = result.messages || []
      const lastMessage = messages[messages.length - 1]
      const output = lastMessage?.content || ''

      return { output }
    })
}
// end::function[]
