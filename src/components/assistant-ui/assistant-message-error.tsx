import {
  ErrorPrimitive,
  MessagePrimitive,
  useAssistantState,
} from '@assistant-ui/react'
import type { FC } from 'react'
import { toMemberErrorCopy } from '@/lib/simulation/chat-errors'

/**
 * The chat route hands back member-safe copy for every failure (see
 * classifyChatError). toMemberErrorCopy only passes that copy through, so a
 * raw transport error (timeout page, "Failed to fetch") never reaches the UI.
 */
const AssistantMessageErrorText: FC = () => {
  const error = useAssistantState(({ message }) =>
    message.status?.type === 'incomplete' && message.status.reason === 'error'
      ? message.status.error
      : undefined
  )
  return (
    <ErrorPrimitive.Message>{toMemberErrorCopy(error)}</ErrorPrimitive.Message>
  )
}

/**
 * Renders an error chip inside an assistant bubble when the runtime has
 * attached an error to that message (e.g. the model provider is unavailable,
 * or the streaming connection failed mid-flight).
 */
export const AssistantMessageError: FC = () => {
  return (
    <MessagePrimitive.Error>
      <div
        className="flex items-center gap-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300"
        role="alert"
      >
        <span className="material-symbols-outlined text-base">error</span>
        <AssistantMessageErrorText />
      </div>
    </MessagePrimitive.Error>
  )
}
