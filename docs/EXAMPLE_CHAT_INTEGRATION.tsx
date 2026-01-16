/**
 * Example: Integrating Multi-Mode Assistant into Chat UI
 *
 * This file shows how to add mode selection to an assistant-ui based chat component.
 * Copy and adapt these patterns to your existing chat implementation.
 *
 * Components used:
 * - AssistantModeSelector: Full dropdown with descriptions
 * - AssistantModeIndicator: Compact badge
 * - useChat hook: Your existing chat library (e.g., useChat from @ai-sdk/react)
 */

'use client'

import React, { useState } from 'react'
import {
  AssistantModeSelector,
  AssistantModeIndicator,
  AssistantModeInfo,
} from '@/components/chat/assistant-mode-selector'
import type { AssistantMode } from '@/lib/simulation'

/**
 * EXAMPLE 1: Simple Chat with Mode Selector
 * Minimal integration - just add the selector to your existing chat UI
 */
export function SimpleChatWithMode() {
  const [mode, setMode] = useState<AssistantMode>('default')
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  )
  const [input, setInput] = useState('')

  const handleSend = async () => {
    if (!input.trim()) return

    // Add user message
    const newMessages = [...messages, { role: 'user', content: input }]
    setMessages(newMessages)
    setInput('')

    // Send to API with mode
    try {
      const response = await fetch('/api/chat/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          mode: mode, // ← Pass the mode!
          config: {
            model: 'gpt-4o-mini',
            stream: false, // false for simpler example
          },
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setMessages([
          ...newMessages,
          { role: 'assistant', content: data.content },
        ])
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b bg-white">
        <h1 className="text-xl font-bold">GoalPost Chat</h1>
        <AssistantModeIndicator mode={mode} />
      </div>

      {/* Mode Selector */}
      <div className="p-4 bg-gray-50 border-b">
        <AssistantModeSelector currentMode={mode} onModeChange={setMode} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-900'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything..."
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * EXAMPLE 2: Chat with Streaming (More realistic)
 * Handles streaming responses and mode persistence
 */
export function ChatWithStreaming() {
  const [mode, setMode] = useState<AssistantMode>(() => {
    // Load from localStorage on mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('assistantMode')
      return (saved as AssistantMode) || 'default'
    }
    return 'default'
  })

  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  )
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Save mode to localStorage when it changes
  const handleModeChange = (newMode: AssistantMode) => {
    setMode(newMode)
    localStorage.setItem('assistantMode', newMode)
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input
    setInput('')

    const newMessages = [...messages, { role: 'user', content: userMessage }]
    setMessages(newMessages)
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          mode: mode,
          config: {
            model: 'gpt-4o-mini',
            stream: true, // ← Streaming enabled
          },
        }),
      })

      if (!response.ok) throw new Error('Failed to fetch')

      // Handle streaming
      const reader = response.body?.getReader()
      let assistantMessage = ''

      if (reader) {
        // Add placeholder for assistant message
        setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const text = new TextDecoder().decode(value)
          assistantMessage += text

          // Update last message
          setMessages((prev) => {
            const updated = [...prev]
            updated[updated.length - 1].content = assistantMessage
            return updated
          })
        }
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header with Mode Indicator */}
      <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">GoalPost</h1>
          <p className="text-sm text-gray-600">AI Assistant</p>
        </div>
        <AssistantModeIndicator mode={mode} showLabel={true} />
      </div>

      {/* Mode Selector Panel */}
      <div className="px-4 py-3 bg-gray-50 border-b">
        <AssistantModeSelector
          currentMode={mode}
          onModeChange={handleModeChange}
          disabled={isLoading}
        />
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-4xl mb-4">💬</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Start a conversation
            </h2>
            <p className="text-gray-600">
              Choose a mode above, then ask anything. You can switch modes
              anytime.
            </p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && <div className="text-2xl">🤖</div>}

              <div
                className={`max-w-md px-4 py-3 rounded-lg whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white rounded-bl-none'
                    : 'bg-gray-100 text-gray-900 rounded-tl-none'
                }`}
              >
                {msg.content ||
                  (i === messages.length - 1 ? '✓ Thinking...' : '')}
              </div>

              {msg.role === 'user' && <div className="text-2xl">👤</div>}
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder={
              isLoading
                ? 'Waiting for response...'
                : 'Ask anything in GoalPost...'
            }
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>

        {/* Helper text */}
        <p className="text-xs text-gray-500 mt-2">
          Current mode: <span className="font-semibold">{mode}</span> • Use
          Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}

/**
 * EXAMPLE 3: Chat with Help Panel
 * Shows how to add the mode info panel for user guidance
 */
export function ChatWithHelp() {
  const [mode, setMode] = useState<AssistantMode>('default')
  const [showHelp, setShowHelp] = useState(false)
  const [input, setInput] = useState('')

  // (Same send logic as example 2...)

  return (
    <div className="flex gap-4 h-screen bg-white p-4">
      {/* Main Chat */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">GoalPost Chat</h1>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="text-sm text-blue-500 hover:underline"
          >
            {showHelp ? 'Hide' : 'Show'} Help
          </button>
        </div>

        <AssistantModeSelector currentMode={mode} onModeChange={setMode} />

        <div className="flex-1 overflow-y-auto mt-4 space-y-4">
          {/* Messages here */}
        </div>

        <div className="flex gap-2 mt-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something..."
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <button className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded-lg">
            Send
          </button>
        </div>
      </div>

      {/* Help Panel - shows/hides based on showHelp */}
      {showHelp && (
        <div className="w-80 border-l pl-4 overflow-y-auto">
          <h2 className="text-lg font-bold mb-4">Assistant Modes</h2>
          <AssistantModeInfo />
        </div>
      )}
    </div>
  )
}

/**
 * EXAMPLE 4: Auto-detect Mode Based on Message
 * Suggests mode based on user input
 */
function suggestMode(text: string): AssistantMode {
  const lower = text.toLowerCase()

  // Philosophy/assumption questions
  if (lower.match(/\b(why|how does|what if|assume|frame|perspective)\b/)) {
    return 'aiden'
  }

  // Difficulty/grief/burnout
  if (
    lower.match(
      /\b(struggling|stuck|overwhelmed|burnt|grief|collapse|paralysis)\b/
    )
  ) {
    return 'braider'
  }

  // Default
  return 'default'
}

export function ChatWithAutoMode() {
  const [mode, setMode] = useState<AssistantMode>('default')
  const [suggestedMode, setSuggestedMode] = useState<AssistantMode | null>(null)
  const [input, setInput] = useState('')

  const handleInputChange = (text: string) => {
    setInput(text)
    const suggested = suggestMode(text)
    if (suggested !== mode) {
      setSuggestedMode(suggested)
    } else {
      setSuggestedMode(null)
    }
  }

  const handleAcceptSuggestion = () => {
    if (suggestedMode) {
      setMode(suggestedMode)
      setSuggestedMode(null)
    }
  }

  return (
    <div>
      <AssistantModeSelector currentMode={mode} onModeChange={setMode} />

      <input
        value={input}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder="Type your message..."
      />

      {/* Show suggestion if available */}
      {suggestedMode && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded mt-2">
          <p className="text-sm text-blue-900">
            💡 This sounds like a{' '}
            <span className="font-semibold">{suggestedMode}</span> question.
          </p>
          <button
            onClick={handleAcceptSuggestion}
            className="text-sm text-blue-600 hover:underline mt-1"
          >
            Switch to {suggestedMode} mode →
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * Export types for use in your app
 */
export type { AssistantMode }
