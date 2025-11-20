'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Thread } from '@/components/assistant-ui/thread'
import { AssistantRuntimeProvider } from '@assistant-ui/react'
import { useChatRuntime } from '@assistant-ui/react-ai-sdk'

export default function Home() {
  const runtime = useChatRuntime()

  return (
    <div className="h-screen w-screen bg-background">
      <div className="fixed bottom-4 right-4">
        <h1 className="text-3xl font-bold underline">Hello world!</h1>

        <Dialog>
          <DialogTrigger asChild>
            <Button>AI</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl h-[80vh]">
            <AssistantRuntimeProvider runtime={runtime}>
              <Thread />
            </AssistantRuntimeProvider>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
