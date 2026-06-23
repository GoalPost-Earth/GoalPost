import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { Embeddings } from '@langchain/core/embeddings'
import { Neo4jGraph } from '@langchain/community/graphs/neo4j_graph'
import initCypherRetrievalChain from './cypher/cypher-retrieval.chain'
import initVectorRetrievalChain from './vector-retrieval.chain'
import { createSpaceSearchTool } from './space/space-search.tool'
import { createSpaceRenameTool } from './space/space-rename.tool'
import { createPersonSearchTool } from './person-search.tool'
import { createFieldContextSearchTool } from './field-context/field-context-search.tool'
import { createFieldContextUpdateTool } from './field-context/field-context-update.tool'
import { createPulseSearchTool } from './pulse/pulse-search.tool'
import { createPulseUpdateTool } from './pulse/pulse-update.tool'
import { createPulseContextLinkTool } from './pulse/pulse-context-link.tool'
import { createGraphRagSearchTool } from './rag/graph-rag-search.tool'
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

  // Create entity-specific tools
  const personSearchTool = createPersonSearchTool(graph)
  // Legacy agent path (chatbot-resolvers.ts) does not carry a user identity.
  // Passing null causes the tool to refuse rather than leak every Space in the
  // graph. The active chat surface (src/lib/simulation/chat-tools.ts) passes
  // the resolved userId from the request JWT, which is the path Robert hits.
  const spaceSearchTool = createSpaceSearchTool(graph, null)
  const spaceRenameTool = createSpaceRenameTool(graph)
  // Same rationale as spaceSearchTool above: the legacy path carries no user
  // identity, so we pass null. searchFieldContexts then fails closed and returns
  // no results rather than leaking cross-tenant FieldContexts (GOAL-273).
  const fieldContextSearchTool = createFieldContextSearchTool(graph, null)
  const fieldContextUpdateTool = createFieldContextUpdateTool(graph)
  // Legacy path carries no user identity → pass null so pulse search fails
  // closed instead of leaking every Space's pulses (same rationale as the
  // space/field-context search tools above).
  const pulseSearchTool = createPulseSearchTool(graph, null)
  const pulseUpdateTool = createPulseUpdateTool(graph)
  const pulseContextLinkTool = createPulseContextLinkTool(graph)
  const graphRagSearchTool = createGraphRagSearchTool(graph, embeddings)

  //  Append chains and tools to output
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
    personSearchTool,
    graphRagSearchTool,
    spaceSearchTool,
    spaceRenameTool,
    fieldContextSearchTool,
    fieldContextUpdateTool,
    pulseSearchTool,
    pulseUpdateTool,
    pulseContextLinkTool,
  ]
}
// end::function[]
