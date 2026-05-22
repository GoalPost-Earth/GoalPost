'use client'

import { useState, type FC } from 'react'
import { useMutation } from '@apollo/client/react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SUBMIT_ASSISTANT_FEEDBACK } from '@/app/graphql/mutations'

interface MessageFeedbackProps {
  /**
   * Server-side `ConversationTurn.id` for the assistant message. Streamed
   * from the chat API via AI SDK `messageMetadata` and surfaced here via
   * the parent component. Without it the buttons render disabled — there
   * is no row to attach feedback to.
   */
  turnId: string | null
}

type RatingChoice = 'POSITIVE' | 'NEGATIVE'

/**
 * Per-assistant-message footer: thumbs-up / thumbs-down, plus an inline
 * "what would have been better?" textarea on thumbs-down. Submits via
 * the `submitAssistantFeedback` GraphQL mutation.
 *
 * Once submitted, the buttons collapse to a tiny "Feedback recorded"
 * confirmation. We do NOT support re-rating from the UI — by design,
 * each turn gets one rating. (Phase-3 LLM classification clusters on
 * the question, not the rating, so duplicates would skew downstream
 * analysis.)
 */
export const MessageFeedback: FC<MessageFeedbackProps> = ({ turnId }) => {
  const [submitted, setSubmitted] = useState<RatingChoice | null>(null)
  const [showCommentBox, setShowCommentBox] = useState(false)
  const [comment, setComment] = useState('')

  const [submitFeedback, { loading }] = useMutation(SUBMIT_ASSISTANT_FEEDBACK)

  // Disable the whole footer until the turn is persisted server-side and
  // the id has streamed back — see route.ts `messageMetadata`.
  if (!turnId) return null

  if (submitted === 'POSITIVE') {
    return (
      <div className="text-[11px] text-gp-ink-soft dark:text-white/40 pt-1">
        Thanks for the thumbs-up.
      </div>
    )
  }

  if (submitted === 'NEGATIVE' && !showCommentBox) {
    return (
      <div className="text-[11px] text-gp-ink-soft dark:text-white/40 pt-1">
        Feedback recorded — thank you.
      </div>
    )
  }

  const send = async (rating: RatingChoice, userComment?: string) => {
    try {
      await submitFeedback({
        variables: {
          turnId,
          rating,
          userComment: userComment ?? null,
        },
      })
      setSubmitted(rating)
      if (rating === 'NEGATIVE' && !userComment) {
        // Negative without a comment yet — open the comment box so the
        // user can optionally tell us what would have been better.
        setShowCommentBox(true)
      } else {
        setShowCommentBox(false)
      }
    } catch (error) {
      console.warn(
        '[MessageFeedback] failed to submit:',
        error instanceof Error ? error.message : error
      )
    }
  }

  // Negative submitted, comment box open: render the textarea.
  if (submitted === 'NEGATIVE' && showCommentBox) {
    const handleSubmitComment = async () => {
      const trimmed = comment.trim()
      if (!trimmed) {
        setShowCommentBox(false)
        return
      }
      // Re-submit with the comment attached. The server treats this as
      // a separate row — that's fine; dashboards filter by latest.
      await send('NEGATIVE', trimmed)
      setShowCommentBox(false)
    }
    return (
      <div className="pt-1 space-y-1.5">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What would have been better? (optional)"
          rows={2}
          maxLength={1000}
          className="w-full px-2.5 py-1.5 text-xs bg-white/60 dark:bg-white/5 border border-gp-glass-border rounded-md text-gp-ink-strong dark:text-white placeholder-gp-ink-soft dark:placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-gp-primary/40 resize-none"
        />
        <div className="flex gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="default"
            onClick={handleSubmitComment}
            disabled={loading}
            className="h-6 px-2 text-[11px] bg-gp-primary hover:bg-gp-primary/90 text-white"
          >
            Send
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setShowCommentBox(false)}
            className="h-6 px-2 text-[11px]"
          >
            Skip
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 pt-1 opacity-70 hover:opacity-100 transition-opacity">
      <button
        type="button"
        aria-label="Good response"
        title="Good response"
        disabled={loading}
        onClick={() => send('POSITIVE')}
        className="p-1 rounded hover:bg-gp-primary/10 text-gp-ink-soft dark:text-white/50 hover:text-gp-primary disabled:opacity-50"
      >
        <ThumbsUp className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        aria-label="Bad response"
        title="Bad response"
        disabled={loading}
        onClick={() => send('NEGATIVE')}
        className="p-1 rounded hover:bg-red-500/10 text-gp-ink-soft dark:text-white/50 hover:text-red-500 disabled:opacity-50"
      >
        <ThumbsDown className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
