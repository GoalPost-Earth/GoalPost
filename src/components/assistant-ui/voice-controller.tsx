'use client'

import { useAssistantState } from '@assistant-ui/react'
import { useEffect, useRef, type FC } from 'react'
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis'
import { useVoiceContext } from './voice-context'

/**
 * Watches the thread and speaks assistant replies aloud when the preceding
 * user turn originated from voice input. Renders nothing.
 *
 * Activation rules:
 *  - One-shot: the composer mic button calls armVoiceReply() before sending.
 *    The very next assistant turn is spoken; the flag is then cleared.
 *  - Continuous: a caller sets continuousVoice=true, in which case every
 *    assistant turn is spoken until it flips back to false.
 */
export const VoiceController: FC = () => {
  const { consumeVoiceArm, continuousVoice } = useVoiceContext()
  const { speak, cancel } = useSpeechSynthesis()

  const isRunning = useAssistantState(({ thread }) => thread.isRunning)
  const lastUserMessageId = useAssistantState(({ thread }) => {
    for (let i = thread.messages.length - 1; i >= 0; i--) {
      if (thread.messages[i].role === 'user') return thread.messages[i].id
    }
    return null
  })
  const latestAssistantText = useAssistantState(({ thread }) => {
    const last = thread.messages[thread.messages.length - 1]
    if (!last || last.role !== 'assistant') return ''
    return last.parts
      .filter((p) => p.type === 'text')
      .map((p) => ('text' in p && typeof p.text === 'string' ? p.text : ''))
      .join('')
  })
  const latestAssistantMessageId = useAssistantState(({ thread }) => {
    const last = thread.messages[thread.messages.length - 1]
    return last && last.role === 'assistant' ? last.id : null
  })

  // Tracks which assistant message id we have decided to speak.
  const activeAssistantIdRef = useRef<string | null>(null)
  // The user message id whose reply we are currently speaking. Used to
  // ensure we only consume the voice arm once per user turn.
  const claimedUserIdRef = useRef<string | null>(null)

  // Decide whether the current/next assistant turn should be spoken whenever
  // a new user message lands or a new assistant message appears.
  useEffect(() => {
    if (!lastUserMessageId) return
    if (claimedUserIdRef.current === lastUserMessageId) return

    const shouldSpeak = continuousVoice || consumeVoiceArm()
    if (shouldSpeak) {
      claimedUserIdRef.current = lastUserMessageId
      activeAssistantIdRef.current = latestAssistantMessageId
    }
  }, [lastUserMessageId, latestAssistantMessageId, continuousVoice, consumeVoiceArm])

  // If the user turn was claimed before the assistant message materialized,
  // bind to the assistant id once it appears.
  useEffect(() => {
    if (
      claimedUserIdRef.current &&
      latestAssistantMessageId &&
      activeAssistantIdRef.current === null
    ) {
      activeAssistantIdRef.current = latestAssistantMessageId
    }
  }, [latestAssistantMessageId])

  // Stream text into the synthesiser as it grows.
  useEffect(() => {
    if (!activeAssistantIdRef.current) return
    if (activeAssistantIdRef.current !== latestAssistantMessageId) return
    if (!latestAssistantText) return
    speak(latestAssistantText)
  }, [latestAssistantText, latestAssistantMessageId, speak])

  // Cancel speech if a new turn starts while we are still speaking.
  useEffect(() => {
    if (isRunning && activeAssistantIdRef.current === null) {
      cancel()
    }
  }, [isRunning, cancel])

  return null
}
