/* eslint-disable indent */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Embeddings } from '@langchain/core/embeddings'
import { Neo4jGraph } from '@langchain/community/graphs/neo4j_graph'
import { pull } from 'langchain/hub'
import initRephraseChain, {
  RephraseQuestionInput,
} from './chains/rephrase-question.chain'
import { BaseChatModel } from 'langchain/chat_models/base'
import { RunnablePassthrough } from '@langchain/core/runnables'
import { getHistory } from './history'
import initTools from './tools'
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents'

// tag::function[]
export default async function initAgent(
  llm: BaseChatModel,
  embeddings: Embeddings,
  graph: Neo4jGraph
) {
  //  Initiate tools
  const tools = await initTools(llm, embeddings, graph)
  //  Pull the prompt from the hub
  const prompt: any = await pull('hwchase17/openai-functions-agent')
  //  Create an agent
  const agent = await createOpenAIFunctionsAgent({
    llm,
    tools: tools as any,
    prompt,
  })
  //  Create an agent executor
  const executor = new AgentExecutor({
    agent,
    tools: tools as any,
    verbose: true, // Verbose output logs the agents _thinking_
  })
  //  Create a rephrase question chain
  const rephraseQuestionChain = await initRephraseChain(llm)
  //  Return a runnable passthrough
  return RunnablePassthrough.assign<{ input: string; sessionId: string }, any>({
    // Get Message History
    history: async (_input, options) => {
      const history = await getHistory(
        (options as any)?.config?.configurable?.sessionId
      )

      return history
    },
  })
    .assign({
      // Use History to rephrase the question
      rephrasedQuestion: (input: RephraseQuestionInput, config: never) =>
        rephraseQuestionChain.invoke(input, config),
    })
    .pipe(executor as any)
    .pick('output')
}
// end::function[]
