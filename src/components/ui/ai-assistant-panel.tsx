'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { usePreferences } from '@/contexts/preferences-context'
import { useApp } from '@/contexts/AppContext'
import { SendHorizontalIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  PersonCard,
  type PersonProfileData,
} from '@/components/assistant-ui/person-card'

interface AIAssistantPanelProps {
  isOpen: boolean
  onClose: () => void
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  /** Person profiles extracted from PERSON_PROFILE_FOUND markers or tool results */
  personData?: PersonProfileData[]
}

/**
 * Extracts PersonProfileData from PERSON_PROFILE_FOUND markers in AI text output,
 * and returns both the profiles and the cleaned text (markers removed).
 */
function extractPersonProfiles(rawText: string): {
  profiles: PersonProfileData[]
  cleanedText: string
} {
  if (!rawText.includes('PERSON_PROFILE_FOUND:')) {
    return { profiles: [], cleanedText: rawText }
  }

  const profiles: PersonProfileData[] = []
  let cleanedText = rawText
  let markerIndex = cleanedText.indexOf('PERSON_PROFILE_FOUND:')

  while (markerIndex !== -1) {
    const braceStart = cleanedText.indexOf('{', markerIndex)
    if (braceStart === -1) break

    let braceCount = 0
    let braceEnd = -1
    let inString = false
    let escapeNext = false

    for (let i = braceStart; i < cleanedText.length; i++) {
      const char = cleanedText[i]
      if (escapeNext) {
        escapeNext = false
        continue
      }
      if (char === '\\') {
        escapeNext = true
        continue
      }
      if (char === '"') {
        inString = !inString
        continue
      }
      if (!inString) {
        if (char === '{') braceCount++
        else if (char === '}') {
          braceCount--
          if (braceCount === 0) {
            braceEnd = i + 1
            break
          }
        }
      }
    }

    if (braceEnd === -1) break

    const jsonString = cleanedText.substring(braceStart, braceEnd)
    try {
      const profile = JSON.parse(jsonString) as PersonProfileData
      profiles.push(profile)
    } catch {
      // Malformed JSON, skip this marker
    }

    cleanedText =
      cleanedText.substring(0, markerIndex) + cleanedText.substring(braceEnd)
    markerIndex = cleanedText.indexOf('PERSON_PROFILE_FOUND:')
  }

  return { profiles, cleanedText: cleanedText.trim() }
}

export function AIAssistantPanel({ isOpen, onClose }: AIAssistantPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const { aiMode } = usePreferences()
  const { user } = useApp()
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
        credentials: 'include', // Send cookies with the request
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            { role: 'user', content: input },
          ],
          aiMode,
          currentUserId: user?.id, // Pass the current user ID
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
      const capturedPersonProfiles: PersonProfileData[] = []

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
            } else if (event.type === 'tool_result' && event.result) {
              // Capture person data from search_person tool results
              if (
                event.tool === 'search_person' &&
                event.result.found &&
                Array.isArray(event.result.people)
              ) {
                capturedPersonProfiles.push(
                  ...(event.result.people as PersonProfileData[])
                )
              }
            }
          } catch {
            // Skip parse errors on malformed lines
          }
        }
      }

      if (assistantContent) {
        // Extract person profiles from PERSON_PROFILE_FOUND markers in the AI text,
        // and strip those markers so only clean prose is displayed.
        const { profiles: profilesFromText, cleanedText } =
          extractPersonProfiles(assistantContent)

        // Merge with tool_result captures, deduplicating by id
        const allProfiles = [
          ...capturedPersonProfiles,
          ...profilesFromText.filter(
            (p) => !capturedPersonProfiles.some((c) => c.id === p.id)
          ),
        ]

        const assistantMessage: Message = {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: cleanedText,
          timestamp: new Date(),
          personData: allProfiles.length > 0 ? allProfiles : undefined,
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
                Ask me about people, spaces, fields, and pulses. I can search,
                retrieve semantically, and help update graph entities.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' ? (
                  <div className="max-w-xs space-y-3">
                    {/* Render person profile cards when search_person returned data */}
                    {msg.personData?.map((person) => (
                      <PersonCard
                        key={person.id}
                        person={person}
                        className="w-full"
                      />
                    ))}
                    {/* AI narrative text */}
                    <div className="bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white rounded-lg px-4 py-3 text-sm whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <div className="max-w-xs rounded-lg px-4 py-3 text-sm bg-gp-primary text-white">
                    {msg.content}
                  </div>
                )}
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
