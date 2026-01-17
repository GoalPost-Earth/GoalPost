'use client'

import { ReactNode } from 'react'
import { Dialog, DialogContent, DialogPortal } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface OfferingModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  position?: 'top' | 'center' | 'bottom'
}

export function OfferingModal({
  isOpen,
  onClose,
  children,
  position = 'center',
}: OfferingModalProps) {
  const positionClasses = {
    top: 'top-[10%] translate-y-0',
    center: 'top-[50%] translate-y-[-50%]',
    bottom: 'top-[80%] bottom-8 translate-y-0',
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogContent
          showCloseButton={false}
          className={cn(
            'flex justify-center gap-0 border-0 bg-transparent p-0 shadow-none',
            positionClasses[position]
          )}
        >
          <div className="w-full max-w-160 px-4 animate-fade-in-up">
            {children}
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
