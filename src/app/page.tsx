'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Thread } from '@/components/assistant-ui/thread'
import { AssistantRuntimeProvider } from '@assistant-ui/react'
import {
  useChatRuntime,
  AssistantChatTransport,
} from '@assistant-ui/react-ai-sdk'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Suspense } from 'react'
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
        <p className="text-sm text-muted-foreground">Loading assistant...</p>
      </div>
    </div>
  )
}

function ChatInterface() {
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: '/api/chat',
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

export default function Home() {
  return (
    <div className="h-screen w-screen bg-background">
      <div className="fixed bottom-4 right-4 z-50">
        <Dialog>
          <DialogTrigger asChild>
            <Button size="lg" className="rounded-full shadow-lg">
              <span className="mr-2">💬</span>
              AI Assistant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl h-[85vh] p-0 gap-0">
            <ErrorBoundary FallbackComponent={ChatErrorFallback}>
              <Suspense fallback={<ChatLoading />}>
                <ChatInterface />
              </Suspense>
            </ErrorBoundary>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
