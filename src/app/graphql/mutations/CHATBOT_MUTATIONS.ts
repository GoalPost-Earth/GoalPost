import { graphql } from '@/gql'

export const SEND_MESSAGE_MUTATION = graphql(`
  mutation SendMessageToChatbot($message: String!) {
    sendMessageToChatbot(message: $message)
  }
`)
