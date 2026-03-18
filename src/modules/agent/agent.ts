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
- Spaces (personal and collaborative) and space management
- Field contexts (view and edit)
- Pulses (view, update, and context-link edits)
- Graph RAG retrieval across people and pulses

Tool usage guidance:
1. Use 'search_person_by_name' for direct person lookup.
2. Use 'search_space_by_name' and 'rename_space' for space operations.
3. Use 'search_field_context' and 'update_field_context' for field context operations.
4. Use 'search_pulse', 'update_pulse', and 'edit_pulse_context_link' for pulse operations.
5. Use 'graph_rag_search' for semantic/vector retrieval across people and pulses.
6. Use 'graph-cypher-retrieval-chain' for broad read-only graph questions.
7. Use 'graph-vector-retrieval-chain' for person similarity recommendations.

Safety and precision rules:
1. Prefer searching before editing, and confirm the exact entity when multiple matches are returned.
2. Never invent IDs, names, or data that tools did not return.
3. If a write/update tool reports ambiguity, ask the user to pick a specific ID.
4. If information is unavailable, clearly say what could not be found.

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
