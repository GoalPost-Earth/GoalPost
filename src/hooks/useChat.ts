import { SEND_MESSAGE_MUTATION } from '@/app/graphql'
import { useMutation } from '@apollo/client'
import { useEffect, useRef, useState } from 'react'

export type Message = {
  role: 'human' | 'ai'
  content: string
}

export default function useChat() {
  const [thinking, setThinking] = useState<boolean>(false)
  const [sessionId, setSessionId] = useState<string | undefined>()
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content:
        process.env.NEXT_PUBLIC_CHATBOT_GREETING || 'How can I help you today?',
    },
  ])
  const container = useRef<HTMLDivElement>(null)
  const [SendMessage] = useMutation(SEND_MESSAGE_MUTATION)

  const generateResponse = async (message: string): Promise<void> => {
    // Append human message
    messages.push({ role: 'human', content: message })

    // Set thinking to true
    setThinking(true)

    try {
      // Send POST message to the API
      const response = await SendMessage({
        variables: {
          message,
          sessionId,
        },
      })
      console.log('🚀 ~ file: useChat.ts:38 ~ sessionId:', sessionId)

      setSessionId(response.data?.sendMessageToChatbot.sessionId)

      messages.push({
        role: 'ai',
        content:
          response.data?.sendMessageToChatbot.message ??
          'Sorry, I did not understand that.',
      })

      setMessages(messages)
    } catch (e) {
      console.error(e)
    } finally {
      setThinking(false)
    }
  }

  // Scroll latest message into view
  useEffect(() => {
    if (container.current) {
      container.current.scrollTop = container.current.scrollHeight
    }
  }, [thinking, messages])

  return {
    thinking,
    messages,
    container,
    generateResponse,
  }
}
