import { BaseLanguageModel } from 'langchain/base_language'
import { PromptTemplate } from '@langchain/core/prompts'
import {
  RunnablePassthrough,
  RunnableSequence,
} from '@langchain/core/runnables'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { Neo4jGraph } from '@langchain/community/graphs/neo4j_graph'

// tag::function[]
export default async function initCypherGenerationChain(
  graph: Neo4jGraph,
  llm: BaseLanguageModel
) {
  // Create Prompt Template
  const cypherPrompt = PromptTemplate.fromTemplate(`
  You are a Neo4j Developer translating user questions into Cypher to answer questions
  about people that belong to communities of care focused on deepening relationships.
  Convert the user's question into a Cypher statement based on the schema.

  You must:
  * Only use the nodes, relationships and properties mentioned in the schema.
  * When required, \`IS NOT NULL\` to check for property existence, and not the exists() function.
  * Use the \`elementId()\` function to return the unique identifier for a node or relationship as \`_id\`.
    For example:
    \`\`\`
    MATCH (person:Person)-[:BELONGS_TO]->(community:Community)
    WHERE person.firstName = 'Robert' AND a.lastName = 'Damashek'
    RETURN person.firstName + ' ' + person.lastName AS name, elementId(community) AS _id, person.avatar AS avatar
    \`\`\`
  * Include extra information about the nodes that may help an LLM provide a more informative answer,
    for example the traits, passions, favorites, fieldsOfCare.
  * Limit the maximum number of results to 10.
  * Respond with only a Cypher statement.  No preamble.
  * The use of the term member is synonymous with person.
  * When comparing strings always trim the search term and the comparable name of leading and trailing whitespaces and use the \`toLower()\` function to make the comparison case-insensitive.


  Example Question: Who are the members that belong to the SeedCoC Community ?
  Example Cypher:
  MATCH (community:Community)<-[:BELONGS_TO]-(person:Person) WHERE toLower(trim(community.name)) CONTAINS toLower(trim('SeedCoC'))
  RETURN person.firstName + ' ' + person.lastName AS name, elementId(person) AS _id, person.avatar AS avatar

  Example Question: What can you tell me about the core value of Vulnerability?
  Example Cypher:
  MATCH (coreValue:CoreValue) 
  WHERE toLower(trim(coreValue.name)) CONTAINS toLower(trim('Vulnerability'))
  RETURN coreValue.name AS name, elementId(coreValue) AS _id, coreValue.description AS description

  Schema:
  {schema}

  Question:
  {question}
`)

  return RunnableSequence.from<string, string>([
    {
      // Take the input and assign it to the question key
      question: new RunnablePassthrough(),
      // Get the schema
      schema: () => graph.getSchema(),
    },
    cypherPrompt,
    llm,
    new StringOutputParser(),
  ])
}
// end::function[]
