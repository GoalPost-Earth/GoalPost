// import { Context } from '../types'
import { randomUUID } from 'crypto'
import { call } from '../../modules/agent'

function getSessionId(sessionId?: string): string {
  if (typeof sessionId === 'string') {
    return sessionId
  }

  // Assign a new session
  sessionId = randomUUID()

  return sessionId
}

export const chatbotResolvers = {
  sendMessageToChatbot: async (
    _parent: never,
    _args: {
      sessionId?: string
      message: string
    }
    // context: Context
  ) => {
    const { message } = _args
    // Get or assign the Session ID
    const sessionId = getSessionId(_args.sessionId)

    try {
      const result = await call(message, sessionId)

      return { message: result, sessionId }
    } catch (e: unknown) {
      if (e instanceof Error) {
        return {
          message: `I'm suffering from brain fog...\n\n${e.message}`,
          sessionId,
        }
      }

      return {
        message: `I'm suffering from brain fog...`,
        sessionId,
      }
    }
  },
}
