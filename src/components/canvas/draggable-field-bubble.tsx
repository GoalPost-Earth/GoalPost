'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { gsap } from 'gsap'
import {
  FieldBubble,
  type FieldBubbleProps,
} from '@/components/ui/field-bubble'
import { useAnimations } from '@/app/contexts/animation-context'
import { cn } from '@/lib/utils'

export interface DraggableFieldBubbleProps extends Omit<
  FieldBubbleProps,
  'position' | 'animationType'
> {
  canvasPosition: { x: number; y: number }
  radius: number // For collision detection
  scale?: number
  onPositionChange?: (x: number, y: number) => void
  onCollision?: (collidingBubbleId: string) => void
  isDragging?: boolean
}

export function DraggableFieldBubble({
  canvasPosition,
  radius,
  onPositionChange,
  scale = 1,
  isDragging = false,
  ...bubbleProps
}: DraggableFieldBubbleProps) {
  const { animationsEnabled } = useAnimations()
  const bubbleRef = useRef<HTMLDivElement>(null)
  const [isLocalDragging, setIsLocalDragging] = useState(false)
  const hasDraggedRef = useRef(false)
  const animationRef = useRef<gsap.core.Tween | null>(null)
  const floatingRef = useRef<gsap.core.Tween | null>(null)
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
    // Stop floating animation when dragging starts
    if (floatingRef.current) {
      floatingRef.current.kill()
    }
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
      // Restart floating animation after drag ends
      startFloatingAnimation()
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLocalDragging, dragContext, onPositionChange])

  // Start or restart floating animation
  const startFloatingAnimation = useCallback(() => {
    if (!animationsEnabled) return
    if (floatingRef.current) {
      floatingRef.current.kill()
    }
    floatingRef.current = gsap.to(displayPositionRef.current, {
      y: displayPositionRef.current.y - 8,
      duration: 2.5,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      overwrite: false,
      onUpdate: () => setDisplayPosition({ ...displayPositionRef.current }),
    })
  }, [animationsEnabled])

  // Animate to externally imposed positions (e.g., collision resolution) with a soft bounce
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
        onComplete: () => startFloatingAnimation(),
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

  // Initialize floating animation on mount
  useEffect(() => {
    startFloatingAnimation()
    return () => {
      floatingRef.current?.kill()
      animationRef.current?.kill()
    }
  }, [startFloatingAnimation])

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
        transform: `translate(${displayPosition.x}px, ${displayPosition.y}px) translate(-50%, -50%)`,
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
