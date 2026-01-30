import {
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
} from '@assistant-ui/react'
import type { FC } from 'react'
import { SendHorizontalIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
              Ask me about people and communities in GoalPost. I&apos;ll search
              the database and help you discover connections.
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
      <div className="max-w-xs bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white rounded-lg px-4 py-3 text-sm space-y-2">
        <MessagePrimitive.Content />
      </div>
    </div>
  )
}

const Composer: FC = () => {
  return (
    <ComposerPrimitive.Root className="space-y-2">
      <ComposerPrimitive.Input
        placeholder="Ask about someone..."
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
