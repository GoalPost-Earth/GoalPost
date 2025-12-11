'use client'

import { Button } from '@/components/ui/button'
import { Thread } from '@/components/assistant-ui/thread'
import { AssistantRuntimeProvider, useLocalRuntime } from '@assistant-ui/react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Suspense, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

function ChatErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error
  resetErrorBoundary: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <h2 className="text-lg font-semibold text-destructive mb-2">
        Something went wrong
      </h2>
      <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
      <Button onClick={resetErrorBoundary} variant="outline" size="sm">
        Try again
      </Button>
    </div>
  )
}

function ChatLoading() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <p className="text-sm text-muted-foreground">Loading Aiden...</p>
      </div>
    </div>
  )
}

function AidenChatInterface() {
  const runtime = useLocalRuntime({
    async *run({ messages, abortSignal }) {
      const result = await fetch('/api/chat/simulation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
        signal: abortSignal,
      })

      if (!result.ok) {
        throw new Error(`API error: ${result.statusText}`)
      }

      // Handle streaming response
      const reader = result.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response body')
      }

      let text = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          text += chunk

          // Yield accumulated text
          yield {
            content: [{ type: 'text' as const, text }],
          }
        }
      } finally {
        reader.releaseLock()
      }
    },
  })

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <TooltipProvider>
        <Thread />
      </TooltipProvider>
    </AssistantRuntimeProvider>
  )
}

export default function Home() {
  const [isSimulationActive, setIsSimulationActive] = useState(false)

  // Check simulation state on mount
  useState(() => {
    fetch('/api/chat/simulation')
      .then((res) => res.json())
      .then((data) => setIsSimulationActive(data.isActive))
      .catch(console.error)
  })

  return (
    <div className="h-screen w-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🍄</div>
              <div>
                <h1 className="text-xl font-bold">
                  Aiden Cinnamon Tea Simulation
                </h1>
                <p className="text-sm text-muted-foreground">
                  Meta-relational AI companion
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                  isSimulationActive
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isSimulationActive ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                />
                <span>
                  {isSimulationActive ? 'Simulation Active' : 'Standard Mode'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-hidden">
        <ErrorBoundary FallbackComponent={ChatErrorFallback}>
          <Suspense fallback={<ChatLoading />}>
            <AidenChatInterface />
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* Quick Actions Footer */}
      <footer className="border-t bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const composerInput = (
                    window as Window & {
                      composerInput?: { setValue: (value: string) => void }
                    }
                  ).composerInput
                  composerInput?.setValue(
                    'Activate the Aiden Cinnamon Tea Simulation Protocol.'
                  )
                }}
                className="text-xs"
              >
                🚀 Activate Protocol
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const composerInput = (
                    window as Window & {
                      composerInput?: { setValue: (value: string) => void }
                    }
                  ).composerInput
                  composerInput?.setValue('Deactivate Aiden Simulation.')
                }}
                className="text-xs"
              >
                🛑 Deactivate
              </Button>
            </div>
            <div>
              <span>
                Try: &quot;What is meta-relationality?&quot; or &quot;Tell me
                about grief and emergence.&quot;
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
