import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { Embeddings } from '@langchain/core/embeddings'
import { Neo4jGraph } from '@langchain/community/graphs/neo4j_graph'
import initCypherRetrievalChain from './cypher/cypher-retrieval.chain'
import initVectorRetrievalChain from './vector-retrieval.chain'
import { DynamicStructuredTool } from '@langchain/community/tools/dynamic'
import { AgentToolInputSchema } from '../agent.types'
import { z } from 'zod'

// tag::function[]
export default async function initTools(
  llm: BaseChatModel,
  embeddings: Embeddings,
  graph: Neo4jGraph
) {
  // Initiate chains
  const cypherChain = await initCypherRetrievalChain(llm, graph)
  const retrievalChain = await initVectorRetrievalChain(llm, embeddings)

  //  Append chains to output
  return [
    new DynamicStructuredTool({
      name: 'graph-cypher-retrieval-chain',
      description:
        'For retrieving information from the database including people recommendations, communities, resources, goals and care points',
      schema: AgentToolInputSchema as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      func: async (
        input: z.infer<typeof AgentToolInputSchema>,
        _runManager,
        config
      ) => cypherChain.invoke(input, config),
    }),
    new DynamicStructuredTool({
      name: 'graph-vector-retrieval-chain',
      description:
        'For finding people, comparing people by their interests, traits, or favorites or recommending a person with similar interests to the user',
      schema: AgentToolInputSchema as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      func: async (
        input: z.infer<typeof AgentToolInputSchema>,
        _runManager: unknown,
        config
      ) => retrievalChain.invoke(input, config),
    }),
  ]
}
// end::function[]
