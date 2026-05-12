'use client'

import { useEffect, useRef, type FC } from 'react'
import { Mic, X } from 'lucide-react'
import { useAssistantState, useComposerRuntime } from '@assistant-ui/react'
import { Button } from '@/components/ui/button'
import { useSpeechRecognition } from '@/hooks/use-speech-recognition'
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis'
import { useVoiceContext } from './voice-context'

interface VoiceModeOverlayProps {
  open: boolean
  onClose: () => void
}

/**
 * Hands-free voice mode. Continuously listens, submits each utterance when the
 * recognizer finalises it, then waits for the assistant reply (spoken aloud by
 * VoiceController via the continuousVoice flag) before re-arming the mic.
 */
export const VoiceModeOverlay: FC<VoiceModeOverlayProps> = ({ open, onClose }) => {
  const composer = useComposerRuntime()
  const { setContinuousVoice } = useVoiceContext()
  const { isSpeaking, cancel: cancelTts } = useSpeechSynthesis()
  const isAssistantRunning = useAssistantState(({ thread }) => thread.isRunning)

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

  // Toggle the continuous flag so VoiceController speaks every reply.
  useEffect(() => {
    setContinuousVoice(open)
    return () => setContinuousVoice(false)
  }, [open, setContinuousVoice])

  // Start listening when the overlay opens and the assistant isn't talking.
  // Pause while the assistant is generating or speaking — speaking into the
  // mic while TTS is active would cause feedback and bad transcripts.
  useEffect(() => {
    if (!open || !isSupported) return
    if (isAssistantRunning || isSpeaking) return
    if (status === 'listening') return
    const handle = window.setTimeout(start, 250)
    return () => window.clearTimeout(handle)
  }, [open, isSupported, isAssistantRunning, isSpeaking, status, start])

  // Stop the mic immediately when the assistant starts replying or speaking.
  useEffect(() => {
    if (!open) return
    if (isAssistantRunning || isSpeaking) stop()
  }, [open, isAssistantRunning, isSpeaking, stop])

  const lastOpenRef = useRef(open)
  useEffect(() => {
    if (lastOpenRef.current && !open) {
      stop()
      cancelTts()
    }
    lastOpenRef.current = open
  }, [open, stop, cancelTts])

  if (!open) return null

  const liveTranscript = transcript + (interimTranscript ? ' ' + interimTranscript : '')
  const stateLabel = !isSupported
    ? 'Voice input is not supported in this browser'
    : error
      ? `Error: ${error}`
      : isAssistantRunning
        ? 'Thinking…'
        : isSpeaking
          ? 'Speaking…'
          : status === 'listening'
            ? 'Listening…'
            : 'Ready'

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur"
      role="dialog"
      aria-modal="true"
      aria-label="Voice mode"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-6 right-6 p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition"
        aria-label="Exit voice mode"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="flex flex-col items-center gap-8 max-w-lg w-full px-6">
        <div
          className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all ${
            status === 'listening'
              ? 'bg-gp-primary/20 ring-4 ring-gp-primary/40 animate-pulse'
              : isSpeaking || isAssistantRunning
                ? 'bg-white/10 ring-2 ring-white/30'
                : 'bg-white/5 ring-1 ring-white/20'
          }`}
          aria-hidden="true"
        >
          <Mic
            className={`w-14 h-14 ${
              status === 'listening' ? 'text-gp-primary' : 'text-white/70'
            }`}
          />
        </div>

        <div className="text-sm text-white/60 uppercase tracking-wider">
          {stateLabel}
        </div>

        <div
          className="min-h-[3rem] text-center text-lg text-white/90 leading-relaxed"
          aria-live="polite"
        >
          {liveTranscript || (
            <span className="text-white/40 italic">Speak when ready…</span>
          )}
        </div>

        <Button
          variant="outline"
          onClick={onClose}
          className="mt-4 border-white/20 text-white hover:bg-white/10"
        >
          Exit voice mode
        </Button>
      </div>
    </div>
  )
}
