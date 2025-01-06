import { BaseChatModel } from 'langchain/chat_models/base'
import { Embeddings } from '@langchain/core/embeddings'
import { Neo4jGraph } from '@langchain/community/graphs/neo4j_graph'
import initCypherRetrievalChain from './cypher/cypher-retrieval.chain'
import initVectorRetrievalChain from './vector-retrieval.chain'
import { DynamicStructuredTool } from '@langchain/community/tools/dynamic'
import { AgentToolInputSchema } from '../agent.types'

// tag::function[]
export default async function initTools(
  llm: BaseChatModel,
  embeddings: Embeddings,
  graph: Neo4jGraph
): Promise<DynamicStructuredTool[]> {
  // Initiate chains
  const cypherChain = await initCypherRetrievalChain(llm, graph)
  const retrievalChain = await initVectorRetrievalChain(llm, embeddings)

  //  Append chains to output
  return [
    new DynamicStructuredTool({
      name: 'graph-cypher-retrieval-chain',
      description:
        'For retrieving information from the database including people recommendations, communities, resources, goals and care points',
      schema: AgentToolInputSchema,
      func: (input, _runManager, config) => cypherChain.invoke(input, config),
    }),
    new DynamicStructuredTool({
      name: 'graph-vector-retrieval-chain',
      description:
        'For finding people, comparing people by their interests, traits, or favorites or recommending a person with similar interests to the user',
      schema: AgentToolInputSchema,
      func: (input, _runManager: unknown, config) =>
        retrievalChain.invoke(input, config),
    }),
  ]
}
// end::function[]
