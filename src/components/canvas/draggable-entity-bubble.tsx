'use client'

import { useRef, useState, useEffect } from 'react'
import { gsap } from 'gsap'
import {
  EntityBubble,
  type EntityBubbleProps,
} from '@/components/ui/entity-bubble'
import { useAnimations } from '@/contexts/animation-context'
import { cn } from '@/lib/utils'

export interface DraggableEntityBubbleProps extends EntityBubbleProps {
  canvasPosition: { x: number; y: number }
  radius: number
  scale?: number
  onPositionChange?: (x: number, y: number) => void
  isDragging?: boolean
}

export function DraggableEntityBubble({
  canvasPosition,
  radius,
  onPositionChange,
  scale = 1,
  isDragging = false,
  onClick,
  onEditClick,
  ...bubbleProps
}: DraggableEntityBubbleProps) {
  const { animationsEnabled } = useAnimations()
  const bubbleRef = useRef<HTMLDivElement>(null)
  const [isLocalDragging, setIsLocalDragging] = useState(false)
  const hasDraggedRef = useRef(false)
  const animationRef = useRef<gsap.core.Tween | null>(null)
  const displayPositionRef = useRef({
    x: canvasPosition.x,
    y: canvasPosition.y,
  })
  const [displayPosition, setDisplayPosition] = useState(canvasPosition)
  const [dragContext, setDragContext] = useState<null | {
    startMouseX: number
    startMouseY: number
    startX: number
    startY: number
  }>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
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

      const nextX = dragContext.startX + deltaX / scale
      const nextY = dragContext.startY + deltaY / scale

      // Update visual position immediately while dragging
      displayPositionRef.current = { x: nextX, y: nextY }
      setDisplayPosition(displayPositionRef.current)

      onPositionChange?.(nextX, nextY)
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
  }, [isLocalDragging, dragContext, onPositionChange, scale])

  // Animate to externally imposed positions with a soft bounce when not dragging
  useEffect(() => {
    if (isLocalDragging) return

    const { x, y } = canvasPosition
    const current = displayPositionRef.current

    if (Math.abs(current.x - x) < 0.1 && Math.abs(current.y - y) < 0.1) {
      return
    }

    if (animationRef.current) {
      animationRef.current.kill()
    }

    if (animationsEnabled) {
      animationRef.current = gsap.to(displayPositionRef.current, {
        x,
        y,
        duration: 0.45,
        ease: 'elastic.out(0.42, 0.8)',
        overwrite: true,
        onUpdate: () => setDisplayPosition({ ...displayPositionRef.current }),
      })
    } else {
      // Instantly update position without animation
      displayPositionRef.current = { x, y }
      setDisplayPosition({ x, y })
    }

    return () => {
      animationRef.current?.kill()
    }
  }, [canvasPosition, isLocalDragging, animationsEnabled])

  const handleClick = () => {
    if (hasDraggedRef.current) {
      // Skip click that follows a drag
      hasDraggedRef.current = false
      return
    }
    onClick?.()
  }

  return (
    <div
      ref={bubbleRef}
      className={cn(
        'absolute overflow-visible',
        isLocalDragging
          ? 'z-50 cursor-grabbing transition-none'
          : 'cursor-grab transition-transform duration-150 ease-out'
      )}
      style={{
        top: 0,
        left: 0,
        width: radius * 2,
        height: radius * 2,
        transform: `translate(${displayPosition.x}px, ${displayPosition.y}px) translate(-50%, -50%)`,
        opacity: isDragging ? 0.8 : 1,
      }}
      onMouseDown={handleMouseDown}
    >
      <EntityBubble
        {...bubbleProps}
        onClick={handleClick}
        onEditClick={onEditClick}
      />
    </div>
  )
}
