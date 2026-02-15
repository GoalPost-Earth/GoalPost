'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import {
  ResonanceNode,
  type ResonanceNodeProps,
} from '@/components/ui/resonance-node'
import { useAnimations } from '@/contexts/animation-context'
import { cn } from '@/lib/utils'

export interface DraggableResonanceNodeProps extends Omit<
  ResonanceNodeProps,
  'position'
> {
  canvasPosition: { x: number; y: number }
  scale?: number
  onPositionChange?: (x: number, y: number) => void
  isDragging?: boolean
}

export function DraggableResonanceNode({
  canvasPosition,
  onPositionChange,
  scale = 1,
  isDragging = false,
  onClick,
  ...nodeProps
}: DraggableResonanceNodeProps) {
  const { animationsEnabled } = useAnimations()
  const nodeRef = useRef<HTMLDivElement>(null)
  const [isLocalDragging, setIsLocalDragging] = useState(false)
  const [isActiveLocal, setIsActiveLocal] = useState(false)
  const hasDraggedRef = useRef(false)
  const velocityRef = useRef({ x: 0, y: 0 })
  const lastMoveTimeRef = useRef(Date.now())
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

    let lastX = dragContext.startX
    let lastY = dragContext.startY

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragContext.startMouseX
      const deltaY = e.clientY - dragContext.startMouseY

      if (
        !hasDraggedRef.current &&
        (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3)
      ) {
        hasDraggedRef.current = true
      }

      const newX = dragContext.startX + deltaX / scale
      const newY = dragContext.startY + deltaY / scale

      // Track velocity
      const now = Date.now()
      const dt = Math.max(now - lastMoveTimeRef.current, 1) / 16.67 // Normalize to 60fps
      velocityRef.current = {
        x: (newX - lastX) / dt,
        y: (newY - lastY) / dt,
      }
      lastMoveTimeRef.current = now
      lastX = newX
      lastY = newY

      // Cancel any ongoing animation
      if (animationRef.current) {
        animationRef.current.kill()
      }

      // Update visual position immediately while dragging
      displayPositionRef.current = { x: newX, y: newY }
      setDisplayPosition(displayPositionRef.current)

      onPositionChange?.(newX, newY)
    }

    const handleMouseUp = () => {
      setIsLocalDragging(false)
      setDragContext(null)

      // No extra movement on release; rely on last move position already applied

      // Reset velocity
      velocityRef.current = { x: 0, y: 0 }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isLocalDragging, dragContext, onPositionChange, scale])

  const handleClick = () => {
    if (hasDraggedRef.current) {
      hasDraggedRef.current = false
      return
    }
    setIsActiveLocal((prev) => !prev)
    onClick?.()
  }

  // Animate to externally imposed positions (e.g., collision resolution) with a soft bounce
  useEffect(() => {
    const { x, y } = canvasPosition
    const current = displayPositionRef.current

    if (Math.abs(current.x - x) < 0.1 && Math.abs(current.y - y) < 0.1) {
      return
    }

    // During dragging, update display position immediately to reflect collision resolution
    if (isLocalDragging) {
      displayPositionRef.current = { x, y }
      setDisplayPosition({ x, y })
      return
    }

    if (animationRef.current) {
      animationRef.current.kill()
    }

    if (animationsEnabled) {
      // Update display position immediately to reflect the target
      displayPositionRef.current = { x, y }
      setDisplayPosition({ x, y })

      animationRef.current = gsap.to(displayPositionRef.current, {
        x,
        y,
        duration: 0.45,
        ease: 'elastic.out(0.42, 0.8)',
        overwrite: true,
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

  return (
    <div
      ref={nodeRef}
      className={cn(
        'absolute',
        isLocalDragging
          ? 'z-50 cursor-grabbing transition-none'
          : 'cursor-grab transition-transform duration-150 ease-out'
      )}
      style={{
        top: 0,
        left: 0,
        transform: `translate(${displayPosition.x}px, ${displayPosition.y}px) translate(-50%, -50%)`,
        opacity: isDragging ? 0.85 : 1,
        boxShadow:
          ((nodeProps as unknown as { isActive?: boolean }).isActive ??
            false) ||
          isActiveLocal
            ? '0 10px 28px color-mix(in srgb, var(--gp-primary) 40%, transparent)'
            : undefined,
      }}
      onMouseDown={handleMouseDown}
    >
      <ResonanceNode {...nodeProps} onClick={handleClick} />
    </div>
  )
}
