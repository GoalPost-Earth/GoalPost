import { EmbeddingsInterface } from '@langchain/core/embeddings'
import { Neo4jVectorStore } from '@langchain/community/vectorstores/neo4j_vector'

/**
 * @deprecated Superseded by `searchPeopleByVector` in
 * `src/modules/agent/tools/rag/graph-rag.service.ts` for the active chat
 * surface (`/api/chat/simulation`). Retained only because the legacy
 * agent path (`src/modules/agent/agent.ts` → `chatbot-resolvers.ts`)
 * still imports it. Remove together with the legacy agent path.
 *
 * Both paths read from the same `personBioVectorIndex` — the index is
 * single-role (person bio similarity); this wrapper is the duplicate.
 *
 * Vector-index role separation (see `graph-rag.service.ts` top-level
 * docstring): personBio for people, pulseContent for pulses,
 * conversationChunk for chunk-level moments. This wrapper hits only the
 * person index.
 */
// tag::function[]
export default async function initVectorStore(
  embeddings: EmbeddingsInterface
): Promise<Neo4jVectorStore> {
  const vectorStore = await Neo4jVectorStore.fromExistingIndex(embeddings, {
    url: process.env.NEO4J_URI as string,
    username: process.env.NEO4J_USERNAME as string,
    password: process.env.NEO4J_PASSWORD as string,
    indexName: 'personBioVectorIndex',
    textNodeProperty: 'passions',
    embeddingNodeProperty: 'embedding',
    // GOAL-275: the index spans every Person (including PersonPulses in
    // other users' private Spaces) and this raw path bypasses field-level
    // @authorization — project ONLY directory-safe fields, mirroring
    // searchPeopleByVector in graph-rag.service.ts. No passions / traits /
    // favorites / fieldsOfCare / interests / connections here.
    retrievalQuery: `
      RETURN
        coalesce(node.name, trim(coalesce(node.firstName, '') + ' ' + coalesce(node.lastName, ''))) AS text,
        score,
        {
          _id: elementid(node),
          firstName: node.firstName,
          lastName: node.lastName,
          avatar: node.avatar,
          communities: [ (community)<-[:BELONGS_TO]-(node) | community.name ]
        } AS metadata
    `,
  })
  return vectorStore
}
// end::function[]
