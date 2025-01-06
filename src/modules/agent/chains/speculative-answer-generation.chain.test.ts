import { config } from 'dotenv'
import initGenerateAnswerChain from './answer-generation.chain'
import { BaseChatModel } from 'langchain/chat_models/base'
import { RunnableSequence } from '@langchain/core/runnables'
import { ChatOpenAI } from '@langchain/openai'
import { PromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'

describe('Speculative Answer Generation Chain', () => {
  let llm: BaseChatModel
  let chain: RunnableSequence
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let evalChain: RunnableSequence<any, any>

  beforeAll(async () => {
    config({ path: '.env.local' })

    llm = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-4',
      temperature: 0,
      configuration: {
        baseURL: process.env.OPENAI_API_BASE,
      },
    })

    chain = await initGenerateAnswerChain(llm)

    // tag::evalchain[]
    evalChain = RunnableSequence.from([
      PromptTemplate.fromTemplate(`
        Does the following response answer the question provided?

        Question: {question}
        Response: {response}

        Respond simply with "yes" or "no".
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
        context:
          'We want to live in a world where our relationships are based on mutual care and support, not competition and individualism. We started the Seed Community of Care as a pilot project aimed at exploring how we can live out these values in our daily lives. The Seed CoC has helped us establish practices and processes to support us in doing that, and now supports the formation and sustainment of other communities embracing similar goals.',
      })

      const evaluation = await evalChain.invoke({ question, response })
      expect(`${evaluation.toLowerCase()} - ${response}`).toContain('no')
    })

    it('should answer this one??', async () => {
      const role = 'Community Point of Contact'

      const question = "What is Robert Damashek's role??"
      const response = await chain.invoke({
        question,
        context: `{"Role":"${role}"}`,
      })

      expect(response).toContain(role)

      const evaluation = await evalChain.invoke({ question, response })
      expect(`${evaluation.toLowerCase()} - ${response}`).toContain('yes')
    })
  })
})
