import { ChatOpenAI } from '@langchain/openai'
import { config } from 'dotenv'
import { BaseChatModel } from 'langchain/chat_models/base'
import { RunnableSequence } from '@langchain/core/runnables'
import { Neo4jGraph } from '@langchain/community/graphs/neo4j_graph'
import initCypherEvaluationChain from './cypher-evaluation.chain'

describe('Cypher Evaluation Chain', () => {
  let graph: Neo4jGraph
  let llm: BaseChatModel
  let chain: RunnableSequence

  beforeAll(async () => {
    config({ path: '.env.local' })

    graph = await Neo4jGraph.initialize({
      url: process.env.NEO4J_URI as string,
      username: process.env.NEO4J_USERNAME as string,
      password: process.env.NEO4J_PASSWORD as string,
      database: process.env.NEO4J_DATABASE as string | undefined,
    })

    llm = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-4',
      temperature: 0,
      configuration: {
        baseURL: process.env.OPENAI_API_BASE,
      },
    })

    chain = await initCypherEvaluationChain(llm)
  })

  afterAll(async () => {
    await graph.close()
  })

  it('should fix a non-existent label', async () => {
    const input = {
      question: 'How many people are in the database?',
      cypher: 'MATCH (m:Peeple) RETURN count(m) AS count',
      schema: graph.getSchema(),
      errors: ['Label Peeple does not exist'],
    }

    const { cypher, errors } = await chain.invoke(input)

    expect(cypher).toContain('MATCH (m:Person) RETURN count(m) AS count')

    expect(errors.length).toBe(1)

    let found = false

    for (const error of errors) {
      if (error.includes('Label Peeple does not exist')) {
        found = true
      }
    }

    expect(found).toBe(true)
  })

  it('should fix a non-existent relationship', async () => {
    const input = {
      question: 'Who belongs to the SeedCoC?',
      cypher:
        'MATCH (m:Peeple)-[:BELONGS]->(a:Community) WHERE a.name = "SeedCoC" RETURN m.firstName + " " + m.lastName AS member',
      schema: graph.getSchema(),
      errors: [
        'Label Peeple does not exist',
        'Relationship type BELONGS does not exist',
      ],
    }

    const { cypher, errors } = await chain.invoke(input)

    expect(cypher).toContain('MATCH (m:Person')
    expect(cypher).toContain(':BELONGS_TO')

    expect(errors.length).toBeGreaterThanOrEqual(2)

    let found = false

    for (const error of errors) {
      if (error.includes('BELONGS')) {
        found = true
      }
    }

    expect(found).toBe(true)
  })

  it('should return no errors if the query is fine', async () => {
    const cypher = 'MATCH (m:Person) RETURN count(m) AS count'
    const input = {
      question: 'How many people are in the database?',
      cypher,
      schema: graph.getSchema(),
      errors: ['Label Peeple does not exist'],
    }

    const { cypher: updatedCypher, errors } = await chain.invoke(input)

    expect(updatedCypher).toContain(cypher)
    expect(errors.length).toBe(0)
  })

  it('should keep variables in relationship', async () => {
    const cypher =
      "MATCH (a:Person {firstName: 'Robert'})-[r:BELONGS_TO]->" +
      "(m:Community {name: 'SeedCoC'}) RETURN r.signupDate AS SignupDate"
    const input = {
      question: "What is Robert's signup date for SeedCoC?",
      cypher,
      schema: graph.getSchema(),
      errors: [],
    }

    const { cypher: updatedCypher, errors } = await chain.invoke(input)

    expect(updatedCypher).toContain(cypher)
    expect(errors.length).toBe(0)
  })
})
