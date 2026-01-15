'use client'

export const dynamic = 'force-dynamic'

import { Button } from '@/components/ui/button'
import { Thread } from '@/components/assistant-ui/thread'
import { AssistantRuntimeProvider } from '@assistant-ui/react'
import {
  useChatRuntime,
  AssistantChatTransport,
} from '@assistant-ui/react-ai-sdk'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Suspense, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

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
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: '/api/chat/simulation',
    }),
  })

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <TooltipProvider>
        <Thread />
      </TooltipProvider>
    </AssistantRuntimeProvider>
  )
}

export default function AssistantPage() {
  const [isSimulationActive, setIsSimulationActive] = useState(false)

  useState(() => {
    fetch('/api/chat/simulation')
      .then((res) => res.json())
      .then((data) => setIsSimulationActive(data.isActive))
      .catch(console.error)
  })

  return (
    <div className="h-screen w-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <ArrowLeft className="w-5 h-5 text-slate-300" />
              <div>
                <h1 className="text-xl font-bold text-white">
                  Aiden Assistant
                </h1>
                <p className="text-sm text-slate-300">
                  Meta-relational AI companion
                </p>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/protected/graph">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-slate-100 hover:bg-white/10"
                >
                  📊 View Graph
                </Button>
              </Link>
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                  isSimulationActive
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                    : 'bg-slate-700/50 text-slate-300 border border-slate-600'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isSimulationActive ? 'bg-green-400' : 'bg-slate-400'
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

      <main className="flex-1 overflow-hidden">
        <ErrorBoundary FallbackComponent={ChatErrorFallback}>
          <Suspense fallback={<ChatLoading />}>
            <AidenChatInterface />
          </Suspense>
        </ErrorBoundary>
      </main>

      <footer className="border-t border-white/10 bg-slate-900/30 backdrop-blur">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-xs text-slate-300">
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
                className="text-xs hover:bg-white/10"
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
                className="text-xs hover:bg-white/10"
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
