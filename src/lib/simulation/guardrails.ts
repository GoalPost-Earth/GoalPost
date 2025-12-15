import { ChatPromptTemplate } from '@langchain/core/prompts'
import { RunnableSequence } from '@langchain/core/runnables'
import { BaseChatModel } from 'langchain/chat_models/base'
import { StringOutputParser } from '@langchain/core/output_parsers'

/**
 * Guardrails Chain for GoalPost AI
 *
 * Constrains AI responses to GoalPost-related topics including:
 * - Community information and connections
 * - Person profiles and relationships
 * - Goals and aspirations
 * - Resources and care points
 * - Core values and fields of care
 *
 * Rejects off-topic queries with polite redirections.
 */

const GUARDRAIL_PROMPT = `You are a content moderation system for GoalPost, a meta-relational community platform. Your job is to determine if a user's question is appropriate and on-topic.

ALLOWED TOPICS (respond with "ALLOWED"):
- Questions about people/members in the GoalPost community
- Finding or searching for community members
- Information about communities, groups, or organizations
- Goals, aspirations, and motivations
- Resources and care points
- Core values and fields of care
- Relationships and connections between people
- The GoalPost platform itself and how it works
- Meta-relationality concepts and principles
- The Aiden Cinnamon Tea simulation protocol

POSITIVE EXAMPLES (these should be ALLOWED):
- "Tell me about John Smith in the community"
- "Who are the members interested in social justice?"
- "What communities exist in GoalPost?"
- "Find me someone with similar passions to mine"
- "What are the core values of this community?"
- "How does GoalPost work?"
- "What is meta-relationality?"
- "Show me resources about grief and emergence"
- "Who is connected to Sarah Johnson?"
- "What are the goals of the Education Reform community?"

NEGATIVE EXAMPLES (these should be REJECTED):
- "What's the weather like today?"
- "How do I make lasagna?"
- "Who won the Super Bowl?"
- "Tell me a joke"
- "What's the capital of France?"
- "How do I fix my car?"
- "What movies are playing tonight?"
- "Calculate 2+2"

SPECIAL RULES:
1. If a person is mentioned but doesn't exist in the database, still allow the query (the tool will handle the "not found" response)
2. Allow general questions about how to use GoalPost or navigate the platform
3. Reject personal advice, general knowledge, entertainment, or unrelated topics
4. Be strict but not overly restrictive - when in doubt about GoalPost relevance, allow it

USER QUESTION: {question}

Respond with ONLY one word:
- "ALLOWED" if the question is on-topic
- "REJECTED" if the question is off-topic

Your response:`

export async function createGuardrailsChain(llm: BaseChatModel) {
  const prompt = ChatPromptTemplate.fromTemplate(GUARDRAIL_PROMPT)

  const chain = RunnableSequence.from([prompt, llm, new StringOutputParser()])

  return chain
}

/**
 * Validates a user query against GoalPost guardrails
 * @param query The user's question
 * @param llm The language model to use for validation
 * @returns Object with isAllowed boolean and optional rejectionMessage
 */
export async function validateQuery(
  query: string,
  llm: BaseChatModel
): Promise<{ isAllowed: boolean; rejectionMessage?: string }> {
  const chain = await createGuardrailsChain(llm)

  const result = await chain.invoke({ question: query })
  const isAllowed = result.trim().toUpperCase() === 'ALLOWED'

  if (!isAllowed) {
    return {
      isAllowed: false,
      rejectionMessage: `I'm here to help you with questions about the GoalPost community, including finding people, exploring communities, discovering resources, and understanding connections. Your question seems to be outside of my area of focus. Could you ask me something about our community members, goals, or how GoalPost works?`,
    }
  }

  return { isAllowed: true }
}
