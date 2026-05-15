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
    retrievalQuery: `
      RETURN
        node.passions AS text,
        score,
        {
          _id: elementid(node),
          firstName: node.firstName,
          lastName: node.lastName,
          avatar: node.avatar,
          favorites: node.favorites,
          passions: node.passions,
          traits: node.traits,
          fieldsOfCare: node.fieldsOfCare,
          interests: node.interests,
          connectedPeople: [(person)-[:CONNECTS_TO]-(node) | [ person.firstName , person.lastName ] ],
          communities: [ (community)<-[:BELONGS_TO]-(node) | community.name ],
          coreValues: [ (coreValue)<-[:EMBRACES]-(node) | coreValue.name ]
        } AS metadata
    `,
  })
  return vectorStore
}
// end::function[]
