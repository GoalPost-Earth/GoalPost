import { graphql } from '@/gql'

export const SEND_MESSAGE_MUTATION = graphql(`
  mutation SendMessageToChatbot($message: String!, $sessionId: String) {
    sendMessageToChatbot(message: $message, sessionId: $sessionId) {
      sessionId
      message
    }
  }
`)
