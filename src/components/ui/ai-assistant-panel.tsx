'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { usePreferences } from '@/contexts/preferences-context'
import {
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
} from '@assistant-ui/react'
import { SendHorizontalIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AIAssistantPanelProps {
  isOpen: boolean
  onClose: () => void
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function AIAssistantPanel({ isOpen, onClose }: AIAssistantPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const { aiMode } = usePreferences()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Slide in/out animation
  useEffect(() => {
    if (panelRef.current && overlayRef.current) {
      if (isOpen) {
        gsap.to(overlayRef.current, {
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out',
        })

        gsap.fromTo(
          panelRef.current,
          { x: '100%' },
          {
            x: '0%',
            duration: 0.4,
            ease: 'power3.out',
          }
        )
      } else {
        gsap.to(overlayRef.current, {
          opacity: 0,
          duration: 0.2,
          ease: 'power2.in',
        })

        gsap.to(panelRef.current, {
          x: '100%',
          duration: 0.3,
          ease: 'power3.in',
        })
      }
    }
  }, [isOpen])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            { role: 'user', content: input },
          ],
          aiMode,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      if (!response.body) {
        throw new Error('No response body')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let assistantContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const event = JSON.parse(line)
            if (event.type === 'message' && event.content) {
              assistantContent = event.content
            }
          } catch (e) {
            // Skip parse errors
          }
        }
      }

      if (assistantContent) {
        const assistantMessage: Message = {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: assistantContent,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error('[Chat] Error:', error)
      const errorMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

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
          <button
            onClick={onClose}
            className="cursor-pointer size-8 flex items-center justify-center rounded-full text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="text-5xl">🍄</div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Welcome to GoalPost AI
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs text-center">
                Ask me about people and communities in GoalPost. I&apos;ll
                search the database and help you discover connections.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs rounded-lg px-4 py-3 text-sm ${
                    msg.role === 'user'
                      ? 'bg-gp-primary text-white'
                      : 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white rounded-lg px-4 py-3 text-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Composer */}
        <div className="border-t border-slate-200 dark:border-white/10 px-4 py-3 bg-white/50 dark:bg-white/5 backdrop-blur-sm">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about someone..."
              disabled={loading}
              className="flex-1 px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-gp-primary/50 resize-none"
            />
            <Button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-gp-primary hover:bg-gp-primary/90 text-white"
              size="sm"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <SendHorizontalIcon className="w-4 h-4" />
              )}
            </Button>
          </div>
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
