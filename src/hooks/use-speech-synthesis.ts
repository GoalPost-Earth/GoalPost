'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'

const noopSubscribe = () => () => {}

function detectSupport(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

const EMPTY_VOICES: SpeechSynthesisVoice[] = []

// `window.speechSynthesis.getVoices()` returns a fresh array on every call in
// most browsers. Returning that directly from useSyncExternalStore's
// getSnapshot triggers an infinite re-render loop (each render thinks the
// store changed). Cache the array at module scope and only refresh when the
// `voiceschanged` event actually fires.
let voicesCache: SpeechSynthesisVoice[] | null = null

function subscribeToVoices(callback: () => void): () => void {
  if (!detectSupport()) return () => {}
  const handler = () => {
    voicesCache = window.speechSynthesis.getVoices()
    callback()
  }
  window.speechSynthesis.addEventListener('voiceschanged', handler)
  return () => {
    window.speechSynthesis.removeEventListener('voiceschanged', handler)
  }
}

function getVoicesSnapshot(): SpeechSynthesisVoice[] {
  if (!detectSupport()) return EMPTY_VOICES
  if (voicesCache === null) {
    voicesCache = window.speechSynthesis.getVoices()
  }
  return voicesCache
}

export interface UseSpeechSynthesisReturn {
  isSupported: boolean
  isSpeaking: boolean
  voices: SpeechSynthesisVoice[]
  speak: (text: string) => void
  cancel: () => void
}

// Splits streaming text into spoken chunks at sentence boundaries so playback
// can begin before the full response has streamed in.
const SENTENCE_BOUNDARY = /([.!?]+\s+|[\n\r]+)/

function chunkBySentence(text: string): string[] {
  if (!text) return []
  const parts = text.split(SENTENCE_BOUNDARY)
  const chunks: string[] = []
  let current = ''
  for (const part of parts) {
    current += part
    if (SENTENCE_BOUNDARY.test(part)) {
      const trimmed = current.trim()
      if (trimmed) chunks.push(trimmed)
      current = ''
    }
  }
  const tail = current.trim()
  if (tail) chunks.push(tail)
  return chunks
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const isSupported = useSyncExternalStore(
    noopSubscribe,
    detectSupport,
    () => false
  )
  const voices = useSyncExternalStore(
    subscribeToVoices,
    getVoicesSnapshot,
    () => EMPTY_VOICES
  )
  const [isSpeaking, setIsSpeaking] = useState(false)
  // Tracks the last text we asked to speak so re-renders with the same prefix
  // can skip chunks already queued.
  const lastSpokenRef = useRef('')

  const speak = useCallback(
    (text: string) => {
      if (!isSupported || !text) return
      // Only speak what is NEW relative to the previous call so streaming
      // updates don't restart playback from the top each time.
      const previous = lastSpokenRef.current
      const delta = text.startsWith(previous) ? text.slice(previous.length) : text
      if (!delta.trim()) {
        lastSpokenRef.current = text
        return
      }
      lastSpokenRef.current = text

      const chunks = chunkBySentence(delta)
      if (chunks.length === 0) return

      for (const chunk of chunks) {
        const utterance = new SpeechSynthesisUtterance(chunk)
        utterance.onstart = () => setIsSpeaking(true)
        utterance.onend = () => {
          if (!window.speechSynthesis.pending && !window.speechSynthesis.speaking) {
            setIsSpeaking(false)
          }
        }
        utterance.onerror = () => setIsSpeaking(false)
        window.speechSynthesis.speak(utterance)
      }
    },
    [isSupported]
  )

  const cancel = useCallback(() => {
    if (!isSupported) return
    window.speechSynthesis.cancel()
    lastSpokenRef.current = ''
    setIsSpeaking(false)
  }, [isSupported])

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  return { isSupported, isSpeaking, voices, speak, cancel }
}
