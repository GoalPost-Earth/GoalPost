import { EmbeddingsInterface } from '@langchain/core/embeddings'
import { Neo4jVectorStore } from '@langchain/community/vectorstores/neo4j_vector'

/**
 * Create a new vector search index that uses the existing
 * `moviePlots` index.
 *
 * @param {EmbeddingsInterface} embeddings  The embeddings model
 * @returns {Promise<Neo4jVectorStore>}
 */
// tag::function[]
export default async function initVectorStore(
  embeddings: EmbeddingsInterface
): Promise<Neo4jVectorStore> {
  const vectorStore = await Neo4jVectorStore.fromExistingIndex(embeddings, {
    url: process.env.NEO4J_URI as string,
    username: process.env.NEO4J_USER as string,
    password: process.env.NEO4J_PASSWORD as string,
    indexName: 'personBioVectorIndex',
    textNodeProperty: 'plot',
    embeddingNodeProperty: 'embedding',
    retrievalQuery: `
      RETURN
        node.plot AS text,
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
