'use client'

import { type FC, useCallback } from 'react'
import { Thread } from '@/components/assistant-ui/thread'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThreadsSidebar } from '@/components/studio/threads-sidebar'
import { createConversationThread } from '@/lib/simulation/conversation-thread-client'
import { cn } from '@/lib/utils'

interface ChatModeProps {
  visible: boolean
  activeThreadId: string | null
  onSelectThread: (id: string) => void
  /** Hide the threads sidebar (e.g. on narrow panes). */
  compact?: boolean
}

export const ChatMode: FC<ChatModeProps> = ({
  visible,
  activeThreadId,
  onSelectThread,
  compact = false,
}) => {
  // Returns the new threadId on success, null on failure. The sidebar's
  // auto-create useEffect uses the return value to decide whether to
  // retry — without it a transient POST failure leaves the user stuck
  // on the placeholder forever.
  const handleNewThread = useCallback(async (): Promise<string | null> => {
    const threadId = await createConversationThread()
    if (threadId) onSelectThread(threadId)
    return threadId
  }, [onSelectThread])

  return (
    <div
      className={cn(
        'relative h-full w-full flex bg-gp-surface dark:bg-gp-surface-dark',
        !visible && 'pointer-events-none'
      )}
      style={{
        visibility: visible ? 'visible' : 'hidden',
        backgroundImage: `
          radial-gradient(at 15% 40%, color-mix(in srgb, var(--gp-primary) 7%, transparent) 0, transparent 55%),
          radial-gradient(at 85% 15%, color-mix(in srgb, var(--gp-accent-glow) 5%, transparent) 0, transparent 50%),
          radial-gradient(at 70% 85%, color-mix(in srgb, var(--gp-coreValue) 6%, transparent) 0, transparent 50%)
        `,
      }}
      aria-hidden={!visible}
    >
      {!compact && (
        <ThreadsSidebar
          activeThreadId={activeThreadId}
          onSelectThread={onSelectThread}
          onNewThread={handleNewThread}
        />
      )}

      <div className="flex-1 overflow-hidden min-w-0">
        <TooltipProvider>
          <Thread />
        </TooltipProvider>
      </div>
    </div>
  )
}
