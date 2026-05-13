'use client'

import { useEffect, useMemo, useRef, useState, type FC } from 'react'
import { Mic, MicOff, Square, AudioLines } from 'lucide-react'
import { useAssistantState, useComposerRuntime } from '@assistant-ui/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useSpeechRecognition } from '@/hooks/use-speech-recognition'
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis'
import { useFocalEntity } from '@/contexts'

interface VoiceModeProps {
  visible: boolean
}

interface RawMessage {
  role?: string
  content?: Array<{ type?: string; text?: string }>
  parts?: Array<{ type?: string; text?: string }>
}

function extractLatestAssistantText(messages: unknown): string {
  const list = (messages as RawMessage[] | undefined) ?? []
  for (let i = list.length - 1; i >= 0; i--) {
    const m = list[i]
    if (m?.role !== 'assistant') continue
    const parts = m.parts ?? m.content ?? []
    const text = parts
      .filter((p) => p?.type === 'text' && typeof p.text === 'string')
      .map((p) => p.text as string)
      .join(' ')
    if (text.trim()) return text
  }
  return ''
}

export const VoiceMode: FC<VoiceModeProps> = ({ visible }) => {
  const composer = useComposerRuntime()
  const { focalEntity } = useFocalEntity()
  const [active, setActive] = useState(false)

  const isAssistantRunning = useAssistantState(({ thread }) => thread.isRunning)
  const messages = useAssistantState(({ thread }) => thread.messages)
  const latestAssistantText = useMemo(
    () => extractLatestAssistantText(messages),
    [messages]
  )

  const { isSpeaking, speak, cancel: cancelTts } = useSpeechSynthesis()

  const {
    isSupported,
    status,
    transcript,
    interimTranscript,
    error,
    start,
    stop,
  } = useSpeechRecognition({
    continuous: false,
    interimResults: true,
    onFinal: (final) => {
      if (!final.trim()) return
      composer.setText(final)
      composer.send()
    },
  })

  // Listening loop: start mic when active and assistant is idle.
  useEffect(() => {
    if (!visible || !active || !isSupported) return
    if (isAssistantRunning || isSpeaking) return
    if (status === 'listening') return
    const handle = window.setTimeout(start, 250)
    return () => window.clearTimeout(handle)
  }, [visible, active, isSupported, isAssistantRunning, isSpeaking, status, start])

  // Stop mic the moment the assistant starts talking.
  useEffect(() => {
    if (!active) return
    if (isAssistantRunning || isSpeaking) stop()
  }, [active, isAssistantRunning, isSpeaking, stop])

  // Speak the latest assistant reply when it finishes. Tracked via a ref so
  // we don't trigger a re-render every time the spoken text updates.
  const lastSpokenRef = useRef('')
  useEffect(() => {
    if (!visible || !active) return
    if (isAssistantRunning) return
    if (!latestAssistantText) return
    if (latestAssistantText === lastSpokenRef.current) return
    lastSpokenRef.current = latestAssistantText
    speak(latestAssistantText)
  }, [visible, active, isAssistantRunning, latestAssistantText, speak])

  // Tearing down: stop everything when leaving the mode or deactivating.
  useEffect(() => {
    if (visible && active) return
    stop()
    cancelTts()
  }, [visible, active, stop, cancelTts])

  const liveTranscript =
    transcript + (interimTranscript ? ' ' + interimTranscript : '')

  const stateLabel = !isSupported
    ? 'Voice input not supported here'
    : error
      ? `Error: ${error}`
      : isAssistantRunning
        ? 'Thinking…'
        : isSpeaking
          ? 'Speaking…'
          : status === 'listening'
            ? 'Listening…'
            : active
              ? 'Waiting…'
              : 'Tap to begin'

  return (
    <div
      className={cn(
        'absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40',
        !visible && 'pointer-events-none'
      )}
      style={{ visibility: visible ? 'visible' : 'hidden' }}
      aria-hidden={!visible}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className={cn(
            'absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] transition-opacity duration-700',
            status === 'listening'
              ? 'bg-amber-400/25 opacity-100'
              : isSpeaking || isAssistantRunning
                ? 'bg-rose-400/20 opacity-100'
                : 'bg-amber-400/10 opacity-60'
          )}
        />
      </div>

      <div className="relative flex flex-col items-center gap-10 max-w-2xl w-full px-6">
        {focalEntity && (
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 backdrop-blur">
            <span className="text-white/40">Talking about </span>
            <span className="font-semibold text-white/90">
              {focalEntity.label ||
                `${focalEntity.type} ${focalEntity.id.slice(0, 6)}`}
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={() => setActive((v) => !v)}
          disabled={!isSupported}
          className={cn(
            'relative w-44 h-44 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer',
            'shadow-[0_0_80px_rgba(245,158,11,0.35)]',
            !isSupported && 'opacity-40 cursor-not-allowed',
            status === 'listening' && active
              ? 'bg-amber-400/20 ring-4 ring-amber-300/50 animate-pulse'
              : isSpeaking
                ? 'bg-rose-400/20 ring-4 ring-rose-300/40'
                : isAssistantRunning
                  ? 'bg-white/10 ring-2 ring-white/30 animate-pulse'
                  : active
                    ? 'bg-white/10 ring-2 ring-white/30'
                    : 'bg-white/5 ring-1 ring-white/15 hover:bg-white/10'
          )}
          aria-label={active ? 'Pause voice mode' : 'Begin voice mode'}
        >
          {!active ? (
            <Mic className="w-16 h-16 text-white/80" />
          ) : isSpeaking ? (
            <AudioLines className="w-16 h-16 text-rose-200" />
          ) : status === 'listening' ? (
            <Mic className="w-16 h-16 text-amber-200" />
          ) : (
            <MicOff className="w-16 h-16 text-white/60" />
          )}
        </button>

        <div className="text-xs uppercase tracking-[0.3em] text-white/55">
          {stateLabel}
        </div>

        <div
          className="min-h-[3.5rem] text-center text-base text-white/90 leading-relaxed"
          aria-live="polite"
        >
          {active
            ? liveTranscript || (
                <span className="text-white/40 italic">
                  Speak when ready…
                </span>
              )
            : latestAssistantText ? (
                <span className="text-white/70 italic line-clamp-3">
                  {latestAssistantText}
                </span>
              ) : (
                <span className="text-white/40 italic">
                  Hands-free conversation. Tap to start.
                </span>
              )}
        </div>

        <div className="flex items-center gap-2">
          {active && (isSpeaking || isAssistantRunning) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                cancelTts()
              }}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Square className="w-3.5 h-3.5 mr-1.5" />
              Stop
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
