import { Context } from '@/config/types'
import { createAssistantFeedback } from '@/lib/feedback/assistant-feedback.service'

interface SubmitAssistantFeedbackArgs {
  turnId: string
  rating: 'POSITIVE' | 'NEGATIVE'
  userComment?: string | null
}

/**
 * Persist a user-driven thumbs-up/down on a single assistant turn.
 *
 * The underlying service Cypher anchors via
 * `(p:Person:User {id: $userId})-[:HAS_THREAD]->(thread)-[:HAS_TURN]->(turn)`
 * so a user can only attach feedback to a turn in their own thread. A
 * spoofed `turnId` simply yields no rows and the service throws — the
 * resolver catches that and returns a structured success:false rather
 * than surfacing a raw GraphQL error to the chat UI.
 */
export const assistantFeedbackMutations = {
  submitAssistantFeedback: async (
    _parent: never,
    args: SubmitAssistantFeedbackArgs,
    context: Context
  ) => {
    try {
      const userId = context.jwt?.user?.id
      if (!userId) {
        return {
          success: false,
          message: 'Not authenticated',
          feedbackId: null,
        }
      }

      const rating = args.rating === 'POSITIVE' ? 'positive' : 'negative'
      const feedback = await createAssistantFeedback({
        turnId: args.turnId,
        rating,
        source: 'user_thumb',
        userId,
        userComment: args.userComment ?? null,
      })

      return {
        success: true,
        message: 'Feedback recorded',
        feedbackId: feedback.id,
      }
    } catch (error) {
      console.warn(
        '[submitAssistantFeedback] failed:',
        error instanceof Error ? error.message : error
      )
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to record feedback',
        feedbackId: null,
      }
    }
  },
}
