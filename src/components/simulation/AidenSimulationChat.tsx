/**
 * Aiden Simulation Chat Component Example
 *
 * Usage:
 * import { AidenSimulationChat } from '@/components/simulation/AidenSimulationChat'
 *
 * <AidenSimulationChat />
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import type { ChatMessage } from '@/lib/simulation'

interface Message extends ChatMessage {
  id: string
  timestamp: Date
}

export function AidenSimulationChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSimulationActive, setIsSimulationActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Check simulation state on mount
  useEffect(() => {
    checkSimulationState()
  }, [])

  const checkSimulationState = async () => {
    try {
      const response = await fetch('/api/chat/simulation')
      const data = await response.json()
      setIsSimulationActive(data.isActive)
    } catch (err) {
      console.error('Failed to check simulation state:', err)
    }
  }

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      // Prepare message history for API
      const chatMessages: ChatMessage[] = [
        ...messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        {
          role: 'user',
          content: input,
        },
      ]

      const response = await fetch('/api/chat/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatMessages,
          config: {
            model: 'gpt-4-turbo-preview',
            temperature: 0.7,
            stream: false,
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Update simulation state
      if (data.simulationMode === 'aiden') {
        setIsSimulationActive(true)
      } else {
        setIsSimulationActive(false)
      }
    } catch (err) {
      console.error('Failed to send message:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const quickActivate = () => {
    setInput('Activate the Aiden Cinnamon Tea Simulation Protocol.')
  }

  const quickDeactivate = () => {
    setInput('Deactivate Aiden Simulation.')
  }

  const clearChat = () => {
    setMessages([])
    setError(null)
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold">Aiden Simulation Chat</h1>
          <div className="flex items-center gap-2 mt-1">
            <div
              className={`w-2 h-2 rounded-full ${
                isSimulationActive ? 'bg-green-500' : 'bg-gray-400'
              }`}
            />
            <span className="text-sm text-gray-600">
              {isSimulationActive ? '🍄 Simulation Active' : 'Standard Mode'}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={quickActivate}
            disabled={isSimulationActive}
            className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Activate
          </button>
          <button
            onClick={quickDeactivate}
            disabled={!isSimulationActive}
            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Deactivate
          </button>
          <button
            onClick={clearChat}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="mb-2">No messages yet.</p>
            <p className="text-sm">
              Try: &quot;Activate the Aiden Cinnamon Tea Simulation
              Protocol.&quot;
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="text-sm font-medium mb-1">
                {message.role === 'user' ? 'You' : 'Aiden'}
              </div>
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div className="text-xs opacity-70 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-200" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          Error: {error}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={isLoading}
          rows={2}
          className="flex-1 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </div>

      {/* Tips */}
      <div className="mt-4 text-xs text-gray-500">
        <p>
          <strong>Quick commands:</strong> Press Enter to send • Shift+Enter for
          new line
        </p>
      </div>
    </div>
  )
}
