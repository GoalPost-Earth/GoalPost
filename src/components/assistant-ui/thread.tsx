import {
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useAssistantState,
} from '@assistant-ui/react'
import type { FC } from 'react'
import { SendHorizontalIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EnhancedTextPart } from './enhanced-message-text'

export const Thread: FC = () => {
  return (
    <ThreadPrimitive.Root className="flex h-full flex-col overflow-hidden bg-white dark:bg-[#121b21]">
      {/* Messages viewport */}
      <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Welcome message when empty */}
        <ThreadPrimitive.Empty>
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="text-5xl">🍄</div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Welcome to GoalPost AI
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs text-center">
              Ask me about people, spaces, field contexts, and pulses. I can
              search, retrieve semantically, and help edit graph entities.
            </p>
          </div>
        </ThreadPrimitive.Empty>

        {/* Messages */}
        <ThreadPrimitive.Messages
          components={{
            UserMessage: UserMessage,
            AssistantMessage: AssistantMessage,
          }}
        />

        {/* Standalone "Thinking…" indicator that appears between sending a user
            message and the assistant message materializing — the AssistantMessage
            inline loader takes over once the bubble exists. */}
        <PendingAssistantTurn />

        {/* Spacing for composer */}
        <div className="h-4" />
      </ThreadPrimitive.Viewport>

      {/* Composer at bottom */}
      <div className="border-t border-slate-200 dark:border-white/10 px-4 py-3 bg-white/50 dark:bg-white/5 backdrop-blur-sm">
        <Composer />
      </div>
    </ThreadPrimitive.Root>
  )
}

const UserMessage: FC = () => {
  return (
    <div className="flex justify-end">
      <div className="max-w-xs bg-gp-primary text-white rounded-lg px-4 py-3 text-sm">
        <MessagePrimitive.Content />
      </div>
    </div>
  )
}

const AssistantMessage: FC = () => {
  return (
    <div className="flex justify-start">
      <div className="max-w-2xl bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white rounded-lg px-4 py-3 text-sm space-y-2 min-w-[64px]">
        {/* Error (if the runtime attached one to this message) */}
        <AssistantMessageError />

        <MessagePrimitive.Parts
          components={{
            Text: EnhancedTextPart,
          }}
        />

        {/* Loading dots while this assistant message is empty AND the thread
            is still streaming. Once any text/tool part arrives the indicator
            naturally disappears because hasContent becomes true. */}
        <AssistantMessageLoader />
      </div>
    </div>
  )
}

/**
 * Renders inside an assistant bubble when the message has not produced any
 * content yet. Distinguishes three states so the user always knows what's
 * happening:
 *
 *  - thread is running → animated dots + "Thinking…"
 *  - thread is NOT running and message is empty (last) → "(No response)" hint
 *  - otherwise (not last) → render nothing
 */
const AssistantMessageLoader: FC = () => {
  const isRunning = useAssistantState(({ thread }) => thread.isRunning)
  const isLastMessage = useAssistantState(({ message }) => message.isLast)
  const hasContent = useAssistantState(({ message }) =>
    message.parts.some(
      (p) =>
        (p.type === 'text' &&
          typeof p.text === 'string' &&
          p.text.length > 0) ||
        p.type === 'tool-call' ||
        p.type === 'reasoning'
    )
  )

  if (hasContent) return null
  if (isRunning) {
    return (
      <div
        className="flex items-center gap-2 text-slate-500 dark:text-white/60"
        aria-live="polite"
        aria-label="Assistant is thinking"
      >
        <span className="inline-flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
          <span className="size-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
          <span className="size-1.5 rounded-full bg-current animate-bounce" />
        </span>
        <span className="text-xs">Thinking…</span>
      </div>
    )
  }
  if (isLastMessage) {
    return (
      <div className="text-xs italic text-slate-500 dark:text-white/50">
        No response — try rephrasing or send again.
      </div>
    )
  }
  return null
}

/**
 * Renders an error chip inside an assistant bubble when the runtime has
 * attached an error to that message (e.g. the streaming connection failed
 * mid-flight, or the model returned a malformed result).
 */
const AssistantMessageError: FC = () => {
  return (
    <MessagePrimitive.Error>
      <div
        className="flex items-center gap-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300"
        role="alert"
      >
        <span className="material-symbols-outlined text-base">error</span>
        <span>Something went wrong while generating the response.</span>
      </div>
    </MessagePrimitive.Error>
  )
}

/**
 * Bottom-of-thread placeholder for the moment between the user submitting and
 * the assistant message bubble being created. The AssistantMessage inline
 * loader handles the bubble-exists-but-empty case; this handles the gap.
 */
const PendingAssistantTurn: FC = () => {
  const isRunning = useAssistantState(({ thread }) => thread.isRunning)
  const lastMessageRole = useAssistantState(({ thread }) => {
    const last = thread.messages[thread.messages.length - 1]
    return last?.role ?? null
  })

  if (!isRunning) return null
  if (lastMessageRole !== 'user') return null

  return (
    <div className="flex justify-start">
      <div
        className="bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-white/60 rounded-lg px-4 py-3 text-sm flex items-center gap-2"
        aria-live="polite"
        aria-label="Assistant is thinking"
      >
        <span className="inline-flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
          <span className="size-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
          <span className="size-1.5 rounded-full bg-current animate-bounce" />
        </span>
        <span className="text-xs">Thinking…</span>
      </div>
    </div>
  )
}

const Composer: FC = () => {
  return (
    <ComposerPrimitive.Root className="space-y-2">
      <ComposerPrimitive.Input
        placeholder="Ask about a person, pulse, or field context..."
        className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-gp-primary/50 resize-none"
        rows={1}
      />
      <div className="flex justify-end">
        <ComposerPrimitive.Send asChild>
          <Button
            size="sm"
            className="bg-gp-primary hover:bg-gp-primary/90 text-white"
          >
            <SendHorizontalIcon className="w-4 h-4" />
          </Button>
        </ComposerPrimitive.Send>
      </div>
    </ComposerPrimitive.Root>
  )
}
