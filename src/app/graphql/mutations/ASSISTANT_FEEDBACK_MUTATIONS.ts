import { gql } from '@apollo/client'

export const SUBMIT_ASSISTANT_FEEDBACK = gql`
  mutation SubmitAssistantFeedback(
    $turnId: ID!
    $rating: AssistantFeedbackRating!
    $userComment: String
  ) {
    submitAssistantFeedback(
      turnId: $turnId
      rating: $rating
      userComment: $userComment
    ) {
      success
      message
      feedbackId
    }
  }
`
