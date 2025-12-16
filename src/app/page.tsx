'use client'

import { Button } from '@/components/ui/button'
import { Thread } from '@/components/assistant-ui/thread'
import { AssistantRuntimeProvider } from '@assistant-ui/react'
import { useChatRuntime } from '@assistant-ui/react-ai-sdk'
import { useChat } from '@ai-sdk/react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Suspense, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import Link from 'next/link'

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
  // Use AI SDK's useChat hook for proper streaming
  const chat = useChat({
    api: '/api/chat/simulation',
  })

  // Convert to assistant-ui runtime
  const runtime = useChatRuntime(chat)

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
              <Link href="/graph">
                <Button variant="outline" size="sm">
                  📊 View Graph
                </Button>
              </Link>
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
