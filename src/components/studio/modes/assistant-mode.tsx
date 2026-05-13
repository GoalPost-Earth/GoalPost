'use client'

import { type FC } from 'react'
import { Thread } from '@/components/assistant-ui/thread'
import { TooltipProvider } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface AssistantModeProps {
  visible: boolean
}

export const AssistantMode: FC<AssistantModeProps> = ({ visible }) => {
  return (
    <div
      className={cn(
        'absolute inset-0 flex flex-col bg-white dark:bg-[#121b21]',
        !visible && 'pointer-events-none'
      )}
      style={{ visibility: visible ? 'visible' : 'hidden' }}
      aria-hidden={!visible}
    >
      <TooltipProvider>
        <div className="flex-1 overflow-hidden">
          <Thread />
        </div>
      </TooltipProvider>
    </div>
  )
}
