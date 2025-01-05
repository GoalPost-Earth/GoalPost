// import { Context } from '../types'

export const chatbotResolvers = {
  sendMessageToChatbot: async (
    _parent: never,
    _args: {
      message: string
    }
    // context: Context
  ) => {
    // wait two seconds and then return the _args.message
    await new Promise((resolve) => setTimeout(resolve, 2000))
    return `Hello, I am a chatbot. You said: ${_args.message}`
  },
}
