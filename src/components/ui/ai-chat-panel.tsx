'use client'

import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AIChatPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function AIChatPanel({ isOpen, onClose }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hello! I'm your GoalPost AI assistant. I can help you discover patterns, connect your pulses, and gain insights from your field. How can I assist you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const panelRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          "I understand you're working on your field. Based on your pulses, I can help you identify emerging patterns and connections. Would you like me to analyze your recent activity?",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-[60] opacity-0"
        onClick={onClose}
      />

      {/* Chat Panel */}
      <div
        ref={panelRef}
        className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-white/10 shadow-2xl z-[70] flex flex-col translate-x-full"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-gp-primary/10 dark:bg-gp-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-gp-primary text-[24px] fill-1">
                smart_toy
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                AI Assistant
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Always here to help
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer size-10 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-slate-50 dark:bg-slate-900 scrollbar-hide [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-gp-primary text-white rounded-br-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-bl-sm'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <span
                  className={`text-[10px] mt-2 block ${
                    message.role === 'user'
                      ? 'text-white/70'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="size-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="size-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="size-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-slate-200 dark:border-white/10 p-4 bg-white dark:bg-slate-950">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about your field..."
                rows={1}
                className="w-full resize-none rounded-2xl px-4 py-3 pr-12 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 focus:border-gp-primary dark:focus:border-gp-primary focus:ring-2 focus:ring-gp-primary/20 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 text-sm focus:outline-none transition-all max-h-32"
                style={{ minHeight: '48px' }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="cursor-pointer absolute right-2 bottom-2 size-8 rounded-full bg-gp-primary hover:bg-gp-primary/90 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all shadow-sm hover:shadow-md disabled:shadow-none"
              >
                <span className="material-symbols-outlined text-[20px]">
                  arrow_upward
                </span>
              </button>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 text-center">
            AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </>
  )
}
