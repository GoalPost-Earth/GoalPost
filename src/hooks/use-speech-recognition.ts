'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'

export type SpeechRecognitionStatus = 'idle' | 'listening' | 'error'

export interface UseSpeechRecognitionOptions {
  /** BCP-47 language tag, e.g. "en-US". Defaults to the browser's UI language. */
  lang?: string
  /** Whether the recognizer keeps running after a pause. Used by voice mode. */
  continuous?: boolean
  /** Whether to emit interim (in-progress) transcripts. */
  interimResults?: boolean
  /** Fired with the full final transcript when the recognizer stops naturally. */
  onFinal?: (transcript: string) => void
}

export interface UseSpeechRecognitionReturn {
  isSupported: boolean
  status: SpeechRecognitionStatus
  /** Latest committed transcript (final results only). */
  transcript: string
  /** Latest interim transcript (may be empty between phrases). */
  interimTranscript: string
  error: string | null
  start: () => void
  stop: () => void
  reset: () => void
}

function pickConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null
}

const noopSubscribe = () => () => {}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
  const { lang, continuous = false, interimResults = true, onFinal } = options

  const isSupported = useSyncExternalStore(
    noopSubscribe,
    () => pickConstructor() !== null,
    () => false
  )

  const [status, setStatus] = useState<SpeechRecognitionStatus>('idle')
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const finalRef = useRef('')
  // onFinal can change between renders; recognition events live longer, so
  // route them through a ref to avoid tearing down the instance on every render.
  const onFinalRef = useRef(onFinal)
  useEffect(() => {
    onFinalRef.current = onFinal
  }, [onFinal])

  const ensureInstance = useCallback((): SpeechRecognition | null => {
    if (recognitionRef.current) return recognitionRef.current
    const Ctor = pickConstructor()
    if (!Ctor) return null

    const recognition = new Ctor()
    recognition.continuous = continuous
    recognition.interimResults = interimResults
    if (lang) recognition.lang = lang

    recognition.onstart = () => {
      setStatus('listening')
      setError(null)
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const text = result[0]?.transcript ?? ''
        if (result.isFinal) {
          finalRef.current = (finalRef.current + ' ' + text).trim()
        } else {
          interim += text
        }
      }
      setTranscript(finalRef.current)
      setInterimTranscript(interim)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // "no-speech" and "aborted" are normal lifecycle signals, not user errors.
      if (event.error === 'no-speech' || event.error === 'aborted') return
      setError(event.error || 'Speech recognition error')
      setStatus('error')
    }

    recognition.onend = () => {
      setStatus('idle')
      setInterimTranscript('')
      const final = finalRef.current.trim()
      if (final && onFinalRef.current) onFinalRef.current(final)
    }

    recognitionRef.current = recognition
    return recognition
  }, [continuous, interimResults, lang])

  const start = useCallback(() => {
    const recognition = ensureInstance()
    if (!recognition) return
    finalRef.current = ''
    setTranscript('')
    setInterimTranscript('')
    setError(null)
    try {
      recognition.start()
    } catch {
      // start() throws InvalidStateError if already running — safe to ignore.
    }
  }, [ensureInstance])

  const stop = useCallback(() => {
    const recognition = recognitionRef.current
    if (!recognition) return
    try {
      recognition.stop()
    } catch {
      // stop() is a no-op if the recognizer never started.
    }
  }, [])

  const reset = useCallback(() => {
    finalRef.current = ''
    setTranscript('')
    setInterimTranscript('')
    setError(null)
  }, [])

  useEffect(() => {
    return () => {
      const recognition = recognitionRef.current
      if (!recognition) return
      recognition.onresult = null
      recognition.onerror = null
      recognition.onend = null
      recognition.onstart = null
      try {
        recognition.abort()
      } catch {
        // ignore
      }
      recognitionRef.current = null
    }
  }, [])

  return {
    isSupported,
    status,
    transcript,
    interimTranscript,
    error,
    start,
    stop,
    reset,
  }
}
