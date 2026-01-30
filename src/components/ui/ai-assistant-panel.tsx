'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { AssistantRuntimeProvider } from '@assistant-ui/react'
import {
  useChatRuntime,
  AssistantChatTransport,
} from '@assistant-ui/react-ai-sdk'
import { Thread } from '@/components/assistant-ui/thread'
import { usePreferences } from '@/contexts/preferences-context'
import { SYSTEM_PROMPTS } from '@/lib/simulation/system-prompts'

interface AIAssistantPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function AIAssistantPanel({ isOpen, onClose }: AIAssistantPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const { aiMode } = usePreferences()

  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: '/api/chat',
      body: {
        system: SYSTEM_PROMPTS[aiMode],
      },
    }),
  })

  // Slide in/out animation
  useEffect(() => {
    if (panelRef.current && overlayRef.current) {
      if (isOpen) {
        // Overlay fade in
        gsap.to(overlayRef.current, {
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out',
        })

        // Panel slide in from right
        gsap.fromTo(
          panelRef.current,
          {
            x: '100%',
          },
          {
            x: '0%',
            duration: 0.4,
            ease: 'power3.out',
          }
        )
      } else {
        // Overlay fade out
        gsap.to(overlayRef.current, {
          opacity: 0,
          duration: 0.2,
          ease: 'power2.in',
        })

        // Panel slide out to right
        gsap.to(panelRef.current, {
          x: '100%',
          duration: 0.3,
          ease: 'power3.in',
        })
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-[4px] z-[60] opacity-0"
        onClick={onClose}
      />

      {/* Chat Panel */}
      <div
        ref={panelRef}
        className="fixed right-0 top-0 h-full w-full max-w-[480px] bg-white dark:bg-[#121b21] border-l border-slate-200 dark:border-white/10 shadow-[-20px_0_60px_rgba(0,0,0,0.3)] dark:shadow-[-20px_0_60px_rgba(0,0,0,0.6)] z-[70] flex flex-col translate-x-full"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-white/5 bg-white/50 dark:bg-white/5 backdrop-blur-md relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-8 rounded-full bg-gp-primary/20 text-gp-primary border border-gp-primary/20 shadow-[0_0_12px_rgba(19,164,236,0.3)] dark:shadow-[0_0_12px_rgba(19,164,236,0.2)]">
              <span className="material-symbols-outlined text-[18px]">
                smart_toy
              </span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-wide">
                GoalPost AI
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex size-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full size-1.5 bg-green-500" />
                </span>
                <p className="text-[10px] text-slate-500 dark:text-white/50 uppercase tracking-widest font-medium">
                  Active
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="cursor-pointer size-8 flex items-center justify-center rounded-full text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
              <span className="material-symbols-outlined text-lg">history</span>
            </button>
            <button
              onClick={onClose}
              className="cursor-pointer size-8 flex items-center justify-center rounded-full text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        {/* Assistant UI Thread */}
        <div className="flex-1 overflow-hidden bg-gradient-to-b from-white/80 dark:from-[#121b21]/80 to-slate-50 dark:to-[#0a0f14]">
          <AssistantRuntimeProvider runtime={runtime}>
            <Thread />
          </AssistantRuntimeProvider>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-white/5 px-4 py-2 bg-white/50 dark:bg-white/5 backdrop-blur-md">
          <p className="text-[10px] text-slate-500 dark:text-white/40 text-center">
            AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </>
  )
}
