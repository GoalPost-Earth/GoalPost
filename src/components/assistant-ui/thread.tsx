import {
  ActionBarPrimitive,
  BranchPickerPrimitive,
  ComposerPrimitive,
  ErrorPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
} from '@assistant-ui/react'
import type { FC } from 'react'
import {
  ArrowDownIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  PencilIcon,
  RefreshCwIcon,
  SendHorizontalIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { EnhancedMessageText } from '@/components/assistant-ui/enhanced-message-text'
import { TooltipIconButton } from '@/components/assistant-ui/tooltip-icon-button'
import { ToolFallback } from './tool-fallback'
import { PersonProfileCardUI } from './person-profile-card'

export const Thread: FC = () => {
  return (
    <ThreadPrimitive.Root
      className="text-foreground bg-background box-border flex h-full flex-col overflow-hidden"
      style={{
        ['--thread-max-width' as string]: '42rem',
      }}
    >
      {/* Register Tool UI for person profile cards */}
      <PersonProfileCardUI />

      {/* Scrollable Messages Area */}
      <ThreadPrimitive.Viewport className="relative flex-1 overflow-y-auto scroll-smooth bg-inherit px-4 pt-4 scrollbar-hide [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Gradient overlay at top */}
        <div className="absolute top-0 inset-x-0 h-8 bg-linear-to-b from-background/80 dark:from-slate-900/80 to-transparent pointer-events-none z-10" />

        <ThreadWelcome />

        {/* Date separator */}
        <ThreadPrimitive.If empty={false}>
          <div className="flex justify-center py-4 first:pt-0">
            <span className="text-[9px] uppercase tracking-widest text-slate-400 dark:text-white/40 font-medium py-1 px-3 rounded-full bg-slate-100 dark:bg-white/5">
              Today
            </span>
          </div>
        </ThreadPrimitive.If>

        <ThreadPrimitive.Messages
          components={{
            UserMessage: UserMessage,
            EditComposer: EditComposer,
            AssistantMessage: AssistantMessage,
          }}
        />

        {/* Padding at bottom to prevent messages from hiding behind composer */}
        <div className="h-8" />
      </ThreadPrimitive.Viewport>

      {/* Fixed Composer at Bottom */}
      <div className="border-t border-slate-200 dark:border-white/5 px-4 py-4 bg-gradient-to-t from-background/95 dark:from-slate-900/95 to-background/50 dark:to-slate-900/50">
        <ThreadScrollToBottom />
        <Composer />
      </div>
    </ThreadPrimitive.Root>
  )
}

const ThreadScrollToBottom: FC = () => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <TooltipIconButton
        tooltip="Scroll to bottom"
        variant="outline"
        className="absolute -top-8 rounded-full disabled:invisible"
      >
        <ArrowDownIcon />
      </TooltipIconButton>
    </ThreadPrimitive.ScrollToBottom>
  )
}

const ThreadWelcome: FC = () => {
  return (
    <ThreadPrimitive.Empty>
      <div className="flex w-full max-w-[var(--thread-max-width)] flex-grow flex-col">
        <div className="flex w-full flex-grow flex-col items-center justify-center py-8">
          <div className="text-4xl mb-4">🍄</div>
          <p className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
            Welcome to GoalPost
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 text-center max-w-md">
            I&apos;ve been monitoring your field. Ask me about patterns,
            connections, or any insights you&apos;d like to explore.
          </p>
        </div>
        <ThreadWelcomeSuggestions />
      </div>
    </ThreadPrimitive.Empty>
  )
}

const ThreadWelcomeSuggestions: FC = () => {
  return (
    <div className="mt-3 flex w-full items-stretch justify-center gap-4">
      <ThreadPrimitive.Suggestion
        className="hover:bg-muted/80 flex max-w-sm grow basis-0 flex-col items-center justify-center rounded-lg border p-3 transition-colors ease-in"
        prompt="Activate the Aiden Cinnamon Tea Simulation Protocol."
        method="replace"
        autoSend
      >
        <span className="line-clamp-2 text-sm font-semibold text-ellipsis">
          🚀 Activate Protocol
        </span>
      </ThreadPrimitive.Suggestion>
      <ThreadPrimitive.Suggestion
        className="hover:bg-muted/80 flex max-w-sm grow basis-0 flex-col items-center justify-center rounded-lg border p-3 transition-colors ease-in"
        prompt="What is meta-relationality?"
        method="replace"
        autoSend
      >
        <span className="line-clamp-2 text-sm font-semibold text-ellipsis">
          What is meta-relationality?
        </span>
      </ThreadPrimitive.Suggestion>
      <ThreadPrimitive.Suggestion
        className="hover:bg-muted/80 flex max-w-sm grow basis-0 flex-col items-center justify-center rounded-lg border p-3 transition-colors ease-in"
        prompt="Tell me about grief and emergence."
        method="replace"
        autoSend
      >
        <span className="line-clamp-2 text-sm font-semibold text-ellipsis">
          Tell me about grief and emergence
        </span>
      </ThreadPrimitive.Suggestion>
    </div>
  )
}

const Composer: FC = () => {
  return (
    <div className="w-full space-y-3">
      {/* Input wrapper with gradient blur */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-gp-primary/30 to-gp-accent-glow/30 dark:from-gp-primary/20 dark:to-gp-accent-glow/20 rounded-2xl blur opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition duration-700" />

        <ComposerPrimitive.Root className="relative flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 group-focus-within:border-gp-primary/30 dark:group-focus-within:border-gp-primary/30 rounded-2xl p-2 pr-2 shadow-lg dark:shadow-none transition-colors">
          <ComposerPrimitive.Input
            rows={1}
            autoFocus
            placeholder="Ask about patterns, entities, or flows..."
            className="flex-1 bg-transparent border-none text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-0 p-1 outline-none disabled:cursor-not-allowed resize-none"
          />
          <ComposerAction />
        </ComposerPrimitive.Root>
      </div>

      {/* Bottom action buttons */}
      <div className="flex justify-center gap-6">
        <button className="cursor-pointer flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-gp-primary dark:hover:text-gp-primary transition-colors font-medium">
          <span className="material-symbols-outlined text-[12px]">delete</span>
          Clear
        </button>
        <button className="cursor-pointer flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-gp-primary dark:hover:text-gp-primary transition-colors font-medium">
          <span className="material-symbols-outlined text-[12px]">tune</span>
          Settings
        </button>
      </div>
    </div>
  )
}

const ComposerAction: FC = () => {
  return (
    <>
      <ThreadPrimitive.If running={false}>
        <ComposerPrimitive.Send asChild>
          <button className="cursor-pointer p-2 bg-slate-100 dark:bg-slate-700 hover:bg-gp-primary dark:hover:bg-gp-primary hover:text-white text-slate-400 dark:text-slate-500 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md">
            <SendHorizontalIcon className="size-5" />
          </button>
        </ComposerPrimitive.Send>
      </ThreadPrimitive.If>
      <ThreadPrimitive.If running>
        <ComposerPrimitive.Cancel asChild>
          <button className="cursor-pointer p-2 bg-slate-100 dark:bg-slate-700 hover:bg-red-500 text-slate-400 dark:text-slate-500 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md">
            <CircleStopIcon />
          </button>
        </ComposerPrimitive.Cancel>
      </ThreadPrimitive.If>
    </>
  )
}

const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="flex flex-col items-end gap-1 my-2">
      {/* Message bubble */}
      <div className="p-4 bg-gradient-to-br from-gp-primary/90 to-blue-600/90 text-white text-sm rounded-2xl rounded-tr-none shadow-md shadow-gp-primary/20 border border-white/10 max-w-[85%] leading-relaxed break-words backdrop-blur-md">
        <MessagePrimitive.Parts />
      </div>

      {/* Timestamp */}
      <span className="text-[9px] text-slate-400 dark:text-white/30 pr-1 font-medium">
        Just now
      </span>

      <UserActionBar />
      <BranchPicker className="hidden" />
    </MessagePrimitive.Root>
  )
}

const UserActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="col-start-1 row-start-2 mt-2.5 mr-3 flex flex-col items-end"
    >
      <ActionBarPrimitive.Edit asChild>
        <TooltipIconButton tooltip="Edit">
          <PencilIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Edit>
    </ActionBarPrimitive.Root>
  )
}

const EditComposer: FC = () => {
  return (
    <ComposerPrimitive.Root className="bg-muted my-4 flex w-full max-w-[var(--thread-max-width)] flex-col gap-2 rounded-xl">
      <ComposerPrimitive.Input className="text-foreground flex h-8 w-full resize-none bg-transparent p-4 pb-0 outline-none" />

      <div className="mx-3 mb-3 flex items-center justify-center gap-2 self-end">
        <ComposerPrimitive.Cancel asChild>
          <Button variant="ghost">Cancel</Button>
        </ComposerPrimitive.Cancel>
        <ComposerPrimitive.Send asChild>
          <Button>Send</Button>
        </ComposerPrimitive.Send>
      </div>
    </ComposerPrimitive.Root>
  )
}

const AssistantMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="flex gap-3 group my-2">
      {/* Avatar */}
      <div className="shrink-0 size-8 rounded-full bg-gp-primary/10 dark:bg-gp-primary/20 border border-gp-primary/20 dark:border-gp-primary/30 flex items-center justify-center mt-1 group-hover:bg-gp-primary/20 dark:group-hover:bg-gp-primary/30 transition-colors">
        <span className="material-symbols-outlined text-sm text-gp-primary dark:text-gp-primary">
          smart_toy
        </span>
      </div>

      {/* Message */}
      <div className="space-y-2 max-w-[85%]">
        <div className="p-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl rounded-tl-none text-sm text-slate-600 dark:text-white/80 leading-relaxed shadow-sm dark:shadow-none">
          <MessagePrimitive.Parts
            components={{
              Text: EnhancedMessageText,
              tools: { Fallback: ToolFallback },
            }}
          />
          <MessageError />
        </div>
        <AssistantActionBar />
      </div>

      <BranchPicker className="hidden" />
    </MessagePrimitive.Root>
  )
}

const MessageError: FC = () => {
  return (
    <MessagePrimitive.Error>
      <ErrorPrimitive.Root className="border-destructive bg-destructive/10 dark:bg-destructive/5 text-destructive mt-2 rounded-md border p-3 text-sm dark:text-red-200">
        <ErrorPrimitive.Message className="line-clamp-2" />
      </ErrorPrimitive.Root>
    </MessagePrimitive.Error>
  )
}

const AssistantActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      autohideFloat="single-branch"
      className="flex gap-1 text-slate-400 dark:text-slate-500 data-[floating]:bg-white dark:data-[floating]:bg-slate-800 data-[floating]:border data-[floating]:border-slate-200 dark:data-[floating]:border-white/10 data-[floating]:rounded-lg data-[floating]:p-1.5 data-[floating]:shadow-md"
    >
      <ActionBarPrimitive.Copy asChild>
        <TooltipIconButton
          tooltip="Copy"
          className="hover:text-gp-primary dark:hover:text-gp-primary"
        >
          <MessagePrimitive.If copied>
            <CheckIcon />
          </MessagePrimitive.If>
          <MessagePrimitive.If copied={false}>
            <CopyIcon />
          </MessagePrimitive.If>
        </TooltipIconButton>
      </ActionBarPrimitive.Copy>
      <ActionBarPrimitive.Reload asChild>
        <TooltipIconButton
          tooltip="Refresh"
          className="hover:text-gp-primary dark:hover:text-gp-primary"
        >
          <RefreshCwIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Reload>
    </ActionBarPrimitive.Root>
  )
}

const BranchPicker: FC<BranchPickerPrimitive.Root.Props> = ({
  className,
  ...rest
}) => {
  return (
    <BranchPickerPrimitive.Root
      hideWhenSingleBranch
      className={cn(
        'text-muted-foreground inline-flex items-center text-xs',
        className
      )}
      {...rest}
    >
      <BranchPickerPrimitive.Previous asChild>
        <TooltipIconButton tooltip="Previous">
          <ChevronLeftIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Previous>
      <span className="font-medium">
        <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
      </span>
      <BranchPickerPrimitive.Next asChild>
        <TooltipIconButton tooltip="Next">
          <ChevronRightIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Next>
    </BranchPickerPrimitive.Root>
  )
}

const CircleStopIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      width="16"
      height="16"
    >
      <rect width="10" height="10" x="3" y="3" rx="2" />
    </svg>
  )
}
