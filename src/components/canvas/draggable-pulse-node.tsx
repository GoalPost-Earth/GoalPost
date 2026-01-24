'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { gsap } from 'gsap'
import { PulseNode, type PulseNodeProps } from '@/components/ui/pulse-node'
import { useAnimations } from '@/app/contexts/animation-context'
import { cn } from '@/lib/utils'

export interface DraggablePulseNodeProps extends Omit<
  PulseNodeProps,
  'position'
> {
  canvasPosition: { x: number; y: number }
  scale?: number
  onPositionChange?: (x: number, y: number) => void
  isDragging?: boolean
}

export function DraggablePulseNode({
  canvasPosition,
  onPositionChange,
  scale = 1,
  isDragging = false,
  onClick,
  ...nodeProps
}: DraggablePulseNodeProps) {
  const { animationsEnabled } = useAnimations()
  const nodeRef = useRef<HTMLDivElement>(null)
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
  }, [isLocalDragging, dragContext, onPositionChange, scale])

  const handleClick = () => {
    if (hasDraggedRef.current) {
      // Skip click that follows a drag
      hasDraggedRef.current = false
      return
    }
    onClick?.()
  }

  // Start or restart floating animation
  const startFloatingAnimation = useCallback(() => {
    if (!animationsEnabled) return
    if (floatingRef.current) {
      floatingRef.current.kill()
    }
    floatingRef.current = gsap.to(displayPositionRef.current, {
      y: displayPositionRef.current.y - 6,
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
        onUpdate: () => setDisplayPosition({ ...displayPositionRef.current }),
      })
    } else {
      // Instantly update position without animation
      displayPositionRef.current = { x, y }
      setDisplayPosition({ x, y })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasPosition.x, canvasPosition.y, isLocalDragging, animationsEnabled])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        animationRef.current.kill()
      }
      if (floatingRef.current) {
        floatingRef.current.kill()
      }
    }
  }, [])

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
        opacity: isDragging ? 0.8 : 1,
      }}
      onMouseDown={handleMouseDown}
    >
      <PulseNode {...nodeProps} position="center" onClick={handleClick} />
    </div>
  )
}
