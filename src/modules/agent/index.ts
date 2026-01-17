import {
  getLangChainChatModel,
  getLangChainEmbeddings,
} from '@/lib/llm/adapters/langchain-adapter'
import initAgent from './agent'
import { initGraph } from '../graph'

// tag::call[]
export async function call(input: string, sessionId: string): Promise<string> {
  const llm = getLangChainChatModel()
  const embeddings = getLangChainEmbeddings()

  // Get Graph Singleton
  const graph = await initGraph()

  const agent = await initAgent(llm, embeddings, graph)
  const res = await agent.invoke({ input }, { configurable: { sessionId } })

  // Extract the output string from the response
  if (typeof res === 'object' && 'output' in res) {
    return res.output as string
  }

  return res as string
}
// end::call[]
