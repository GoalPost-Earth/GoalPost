/* eslint-disable @typescript-eslint/no-explicit-any */
import { config } from 'dotenv'
import { BaseChatModel } from 'langchain/chat_models/base'
import { RunnableSequence } from '@langchain/core/runnables'
import { ChatOpenAI } from '@langchain/openai'
import { PromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
import initGenerateAuthoritativeAnswerChain from './authoritative-answer-generation.chain'

describe('Authoritative Answer Generation Chain', () => {
  let llm: BaseChatModel
  let chain: RunnableSequence
  let evalChain: RunnableSequence<any, any>

  beforeAll(async () => {
    config({ path: '.env.local' })

    llm = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-3.5-turbo',
      temperature: 0,
      configuration: {
        baseURL: process.env.OPENAI_API_BASE,
      },
    })

    chain = await initGenerateAuthoritativeAnswerChain(llm)

    // tag::evalchain[]
    evalChain = RunnableSequence.from([
      PromptTemplate.fromTemplate(`
        Does the following response answer the question provided?

        Question: {question}
        Response: {response}

        Respond simply with "yes" or "no".

        If the response answers the question, reply with "yes".
        If the response does not answer the question, reply with "no".
        If the response asks for more information, reply with "no".
      `),
      llm,
      new StringOutputParser(),
    ])
    // end::evalchain[]
  })

  describe('Simple RAG', () => {
    it('should use context to answer the question', async () => {
      const question = 'Who has an avatar of a Golden Retriever?'
      const response = await chain.invoke({
        question,
        context:
          '[{"name": "Robert Damashek", {"avatar": "Golden Retriever"}}]',
      })

      // tag::eval[]
      const evaluation = await evalChain.invoke({ question, response })

      expect(`${evaluation.toLowerCase()} - ${response}`).toContain('yes')
      // end::eval[]
    })

    it('should refuse to answer if information is not in context', async () => {
      const question = 'What is the Seed COC?'
      const response = await chain.invoke({
        question,
        context: '',
      })

      const evaluation = await evalChain.invoke({ question, response })
      expect(`${evaluation.toLowerCase()} - ${response}`).toContain('no')
    })

    it('should answer this one??', async () => {
      const role = 'Community Point of Contact'

      const question = "What is Robert Damashek's role in the SeedCoC??"
      const response = await chain.invoke({
        question,
        context: `{"Role":"${role}"}`,
      })

      expect(response).toContain(role)

      const evaluation = await evalChain.invoke({ question, response })
      expect(`${evaluation.toLowerCase()} - ${response}`).toContain(
        'Point of Contact'
      )
    })
  })
})
