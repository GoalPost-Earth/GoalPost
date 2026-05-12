'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type FC,
  type ReactNode,
} from 'react'

interface VoiceContextValue {
  /** Speak the next assistant reply (one-shot). Set by the composer mic button. */
  armVoiceReply: () => void
  /** Returns true and clears the one-shot flag. Used by the controller. */
  consumeVoiceArm: () => boolean
  /** Continuous mode (voice overlay) — every assistant reply is spoken. */
  continuousVoice: boolean
  setContinuousVoice: (value: boolean) => void
}

const VoiceContext = createContext<VoiceContextValue | null>(null)

export const VoiceProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const armedRef = useRef(false)
  const [continuousVoice, setContinuousVoice] = useState(false)

  const armVoiceReply = useCallback(() => {
    armedRef.current = true
  }, [])

  const consumeVoiceArm = useCallback(() => {
    if (!armedRef.current) return false
    armedRef.current = false
    return true
  }, [])

  const value = useMemo(
    () => ({ armVoiceReply, consumeVoiceArm, continuousVoice, setContinuousVoice }),
    [armVoiceReply, consumeVoiceArm, continuousVoice]
  )

  return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>
}

export function useVoiceContext(): VoiceContextValue {
  const ctx = useContext(VoiceContext)
  if (!ctx) {
    throw new Error('useVoiceContext must be used inside <VoiceProvider>')
  }
  return ctx
}
