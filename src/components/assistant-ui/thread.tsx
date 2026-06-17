import {
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useAssistantState,
  useComposerRuntime,
} from '@assistant-ui/react'
import { useCallback, useEffect, type FC } from 'react'
import { useRouter } from 'next/navigation'
import { Headphones, Mic, Paperclip, SendHorizontalIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EnhancedTextPart } from './enhanced-message-text'
import { MessageFeedback } from './message-feedback'
import { VoiceProvider, useVoiceContext } from './voice-context'
import { VoiceController } from './voice-controller'
import { useSpeechRecognition } from '@/hooks/use-speech-recognition'
import { usePreferences } from '@/contexts/preferences-context'
import { AssistantModeIndicator } from '@/components/chat/assistant-mode-selector'
import { WriteApprovalToolPart } from '@/components/chat/write-approval-tool-ui'
import { MODE_METADATA } from '@/lib/simulation'

export const Thread: FC = () => {
  return (
    <VoiceProvider>
      <ThreadInner />
    </VoiceProvider>
  )
}

const ThreadInner: FC = () => {
  return (
    <ThreadPrimitive.Root className="flex h-full flex-col overflow-hidden bg-transparent">
      <VoiceController />

      {/* Messages viewport */}
      <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {/* Welcome empty state */}
        <ThreadPrimitive.Empty>
          <div className="flex flex-col items-center justify-center h-full gap-5 animate-fade-in">
            <div className="flex items-center justify-center size-16 rounded-full bg-gp-primary/10 border border-gp-primary/20">
              <span className="material-symbols-outlined text-3xl text-gp-primary">
                auto_awesome
              </span>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-lg font-semibold text-gp-ink-strong dark:text-white">
                GoalPost AI
              </h2>
              <p className="text-sm text-gp-ink-muted dark:text-white/50 max-w-xs leading-relaxed">
                Ask me about people, spaces, field contexts, and pulses. I can
                search, retrieve semantically, and help edit graph entities.
              </p>
            </div>
          </div>
        </ThreadPrimitive.Empty>

        {/* Messages */}
        <ThreadPrimitive.Messages
          components={{
            UserMessage: UserMessage,
            AssistantMessage: AssistantMessage,
          }}
        />

        <PendingAssistantTurn />
        <div className="h-2" />
      </ThreadPrimitive.Viewport>

      {/* Composer */}
      <div className="px-4 py-3 gp-glass border-t border-gp-glass-border">
        <Composer />
      </div>
    </ThreadPrimitive.Root>
  )
}

const UserMessage: FC = () => {
  return (
    <div className="flex justify-end">
      <div className="max-w-sm bg-gp-primary text-white rounded-2xl rounded-br-md px-4 py-2.5 text-sm shadow-sm">
        <MessagePrimitive.Content />
      </div>
    </div>
  )
}

const AssistantMessage: FC = () => {
  return (
    <div className="flex items-start gap-2.5 justify-start">
      <div className="shrink-0 size-7 rounded-full bg-gp-primary/10 border border-gp-primary/20 flex items-center justify-center mt-0.5">
        <span className="material-symbols-outlined text-[14px] leading-none text-gp-primary">
          auto_awesome
        </span>
      </div>
      <div className="max-w-2xl chat-card text-gp-ink-strong dark:text-white rounded-2xl rounded-tl-md px-4 py-2.5 text-sm space-y-2 min-w-[64px]">
        {/* Error (if the runtime attached one to this message) */}
        <AssistantMessageError />

        <MessagePrimitive.Parts
          components={{
            Text: EnhancedTextPart,
            // Generative HITL approval (GOAL-261): a single Fallback handles
            // every tool-call part. It renders an inline approval card when a
            // write tool returns the pending-approval shape, and nothing
            // otherwise (read tools stay invisible as before).
            tools: { Fallback: WriteApprovalToolPart },
          }}
        />

        {/* Loading dots while this assistant message is empty AND the thread
            is still streaming. Once any text/tool part arrives the indicator
            naturally disappears because hasContent becomes true. */}
        <AssistantMessageLoader />

        {/* Thumbs-up / thumbs-down. Hidden until the assistant turn is
            persisted server-side and the id has streamed back via
            message metadata (see /api/chat/simulation/route.ts). */}
        <AssistantMessageFeedbackFooter />
      </div>
    </div>
  )
}

/**
 * Bridge between assistant-ui's per-message id and the MessageFeedback
 * component. The chat route persists each assistant turn using the AI
 * SDK message id (set on the client via the `start` UIMessageChunk
 * before any content streams), so the client-visible `message.id` is
 * the exact same value as `ConversationTurn.id` in Neo4j. No metadata
 * roundtrip needed.
 *
 * Hidden while the message is still streaming so the user can't rate a
 * mid-stream response.
 */
const AssistantMessageFeedbackFooter: FC = () => {
  const turnId = useAssistantState(({ message }) =>
    typeof message.id === 'string' && message.id.length > 0 ? message.id : null
  )
  const isRunning = useAssistantState(({ thread }) => thread.isRunning)
  const isLast = useAssistantState(({ message }) => message.isLast)
  if (isLast && isRunning) return null
  return <MessageFeedback turnId={turnId} />
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
  // Only TEXT parts count as user-readable content. tool-call and reasoning
  // parts render invisibly by default in assistant-ui — if those exist but
  // there is no text, the bubble would appear blank without this loader
  // taking over. So we still treat the message as empty for UX purposes
  // even when those parts are present, and let isRunning decide between
  // "Thinking…" and "(No response)".
  const hasTextContent = useAssistantState(({ message }) =>
    message.parts.some(
      (p) =>
        p.type === 'text' && typeof p.text === 'string' && p.text.length > 0
    )
  )

  if (hasTextContent) return null
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
    <div className="flex items-start gap-2.5 justify-start">
      <div className="shrink-0 size-7 rounded-full bg-gp-primary/10 border border-gp-primary/20 flex items-center justify-center mt-0.5">
        <span className="material-symbols-outlined text-[14px] leading-none text-gp-primary">
          auto_awesome
        </span>
      </div>
      <div
        className="chat-card text-gp-ink-muted dark:text-white/60 rounded-2xl rounded-tl-md px-4 py-2.5 text-sm flex items-center gap-2"
        aria-live="polite"
        aria-label="Assistant is thinking"
      >
        <span className="inline-flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-gp-primary animate-bounce [animation-delay:-0.3s]" />
          <span className="size-1.5 rounded-full bg-gp-primary animate-bounce [animation-delay:-0.15s]" />
          <span className="size-1.5 rounded-full bg-gp-primary animate-bounce" />
        </span>
        <span className="text-xs">Thinking…</span>
      </div>
    </div>
  )
}

const Composer: FC = () => {
  const composer = useComposerRuntime()
  const router = useRouter()
  const { aiMode } = usePreferences()
  const { armVoiceReply, continuousVoice, setContinuousVoice } =
    useVoiceContext()

  const { isSupported, status, transcript, interimTranscript, start, stop } =
    useSpeechRecognition({
      continuous: false,
      interimResults: true,
      onFinal: (final) => {
        const trimmed = final.trim()
        if (!trimmed) return
        armVoiceReply()
        composer.setText(trimmed)
        composer.send()
      },
    })

  const isListening = status === 'listening'

  // Stream the live transcript into the composer textarea while listening so
  // the user sees their words appear (ChatGPT-style). When recognition ends
  // the `onFinal` callback above takes over and sends the final transcript.
  useEffect(() => {
    if (!isListening) return
    const live = (transcript + ' ' + interimTranscript).trim()
    composer.setText(live)
  }, [isListening, transcript, interimTranscript, composer])

  const handleMicClick = useCallback(() => {
    if (isListening) {
      stop()
    } else {
      start()
    }
  }, [isListening, start, stop])

  // Toggle the mic from the shell's `V` shortcut. Multiple chat panes would
  // each have their own composer, but the browser only allows one active
  // recognizer at a time anyway — duplicate toggles are harmless.
  useEffect(() => {
    const onToggle = () => handleMicClick()
    window.addEventListener('goalpost:voice-mic-toggle', onToggle)
    return () =>
      window.removeEventListener('goalpost:voice-mic-toggle', onToggle)
  }, [handleMicClick])

  const handleContinuousToggle = useCallback(() => {
    setContinuousVoice(!continuousVoice)
  }, [continuousVoice, setContinuousVoice])

  return (
    <ComposerPrimitive.Root className="space-y-2">
      <ComposerPrimitive.Input
        placeholder={
          isListening
            ? 'Listening… speak naturally'
            : continuousVoice
              ? 'Hands-free on — tap mic to talk'
              : 'Ask about a person, pulse, or field context...'
        }
        className="w-full max-h-40 overflow-y-auto px-4 py-3 bg-white/60 dark:bg-white/5 border border-gp-glass-border rounded-xl text-gp-ink-strong dark:text-white placeholder-gp-ink-soft dark:placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-gp-primary/40 resize-none transition-all"
        rows={1}
      />
      <div className="flex items-center justify-between gap-2">
        {/* Active assistant mode — mirrors the mode chosen in Settings and
            updates instantly because aiMode comes from PreferencesContext. */}
        <div
          className="min-w-0 shrink"
          title={`Mode: ${MODE_METADATA[aiMode].label} — ${MODE_METADATA[aiMode].description}`}
        >
          <AssistantModeIndicator mode={aiMode} />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => router.push('/protected/dashboard/import')}
            aria-label="Import CSV"
            title="Import CSV (WeSpace / FieldContext / Pulse)"
            className="border-slate-200 dark:border-white/10"
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          {isSupported && (
            <>
              <Button
                type="button"
                size="sm"
                variant={continuousVoice ? 'default' : 'outline'}
                onClick={handleContinuousToggle}
                aria-pressed={continuousVoice}
                aria-label={
                  continuousVoice
                    ? 'Disable hands-free voice'
                    : 'Enable hands-free voice'
                }
                title={
                  continuousVoice
                    ? 'Hands-free voice on — every reply will be spoken'
                    : 'Turn on hands-free voice'
                }
                className={
                  continuousVoice
                    ? 'bg-gp-primary hover:bg-gp-primary/90 text-white'
                    : 'border-slate-200 dark:border-white/10'
                }
              >
                <Headphones className="w-4 h-4" />
              </Button>
              <div className="relative">
                {isListening && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-md ring-2 ring-gp-primary/60 animate-pulse"
                  />
                )}
                <Button
                  type="button"
                  size="sm"
                  variant={isListening ? 'default' : 'outline'}
                  onClick={handleMicClick}
                  aria-pressed={isListening}
                  aria-label={
                    isListening ? 'Stop listening' : 'Speak to assistant'
                  }
                  title={isListening ? 'Stop listening' : 'Speak to assistant'}
                  className={
                    isListening
                      ? 'bg-gp-primary hover:bg-gp-primary/90 text-white'
                      : 'border-slate-200 dark:border-white/10'
                  }
                >
                  <Mic className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
          <ComposerPrimitive.Send asChild>
            <Button
              size="sm"
              className="bg-gp-primary hover:bg-gp-primary/90 text-white"
            >
              <SendHorizontalIcon className="w-4 h-4" />
            </Button>
          </ComposerPrimitive.Send>
        </div>
      </div>
    </ComposerPrimitive.Root>
  )
}
