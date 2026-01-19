'use client'

import { useRef, useState, useEffect } from 'react'
import {
  FieldBubble,
  type FieldBubbleProps,
} from '@/components/ui/field-bubble'
import { cn } from '@/lib/utils'

export interface DraggableFieldBubbleProps extends Omit<
  FieldBubbleProps,
  'position' | 'animationType'
> {
  canvasPosition: { x: number; y: number }
  radius: number // For collision detection
  onPositionChange?: (x: number, y: number) => void
  onCollision?: (collidingBubbleId: string) => void
  isDragging?: boolean
}

export function DraggableFieldBubble({
  canvasPosition,
  radius,
  onPositionChange,
  isDragging = false,
  ...bubbleProps
}: DraggableFieldBubbleProps) {
  const bubbleRef = useRef<HTMLDivElement>(null)
  const [isLocalDragging, setIsLocalDragging] = useState(false)
  const hasDraggedRef = useRef(false)
  const [dragContext, setDragContext] = useState<null | {
    startMouseX: number
    startMouseY: number
    startX: number
    startY: number
  }>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    hasDraggedRef.current = false
    setDragContext({
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startX: canvasPosition.x,
      startY: canvasPosition.y,
    })
    setIsLocalDragging(true)
  }

  useEffect(() => {
    if (!isLocalDragging || !dragContext) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragContext.startMouseX
      const deltaY = e.clientY - dragContext.startMouseY
      if (
        !hasDraggedRef.current &&
        (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3)
      ) {
        hasDraggedRef.current = true
      }
      onPositionChange?.(
        dragContext.startX + deltaX,
        dragContext.startY + deltaY
      )
    }

    const handleMouseUp = () => {
      setIsLocalDragging(false)
      setDragContext(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isLocalDragging, dragContext, onPositionChange])

  const handleClick = () => {
    if (hasDraggedRef.current) {
      // Skip click that follows a drag
      hasDraggedRef.current = false
      return
    }
    bubbleProps.onClick?.()
  }

  return (
    <div
      ref={bubbleRef}
      className={cn(
        'absolute',
        isLocalDragging
          ? 'z-50 cursor-grabbing transition-none'
          : 'cursor-grab transition-transform duration-150 ease-out'
      )}
      style={{
        top: 0,
        left: 0,
        width: radius * 2,
        height: radius * 2,
        transform: `translate(${canvasPosition.x}px, ${canvasPosition.y}px) translate(-50%, -50%)`,
        opacity: isDragging ? 0.8 : 1,
      }}
      onMouseDown={handleMouseDown}
    >
      <FieldBubble
        {...bubbleProps}
        position="center"
        animationType="none"
        onClick={handleClick}
      />
    </div>
  )
}
