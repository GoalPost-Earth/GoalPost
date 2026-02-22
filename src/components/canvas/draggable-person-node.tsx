'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { gsap } from 'gsap'
import { PersonNode, type PersonNodeProps } from '@/components/ui/person-node'
import { useAnimations } from '@/contexts/animation-context'
import { cn } from '@/lib/utils'

export interface DraggablePersonNodeProps extends Omit<
  PersonNodeProps,
  'position'
> {
  canvasPosition: { x: number; y: number }
  scale?: number
  onPositionChange?: (x: number, y: number) => void
  isDragging?: boolean
}

export function DraggablePersonNode({
  canvasPosition,
  onPositionChange,
  scale = 1,
  isDragging = false,
  onClick,
  ...nodeProps
}: DraggablePersonNodeProps) {
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
      displayPositionRef.current = { x: nextX, y: nextY }
      setDisplayPosition({ x: nextX, y: nextY })
      onPositionChange?.(nextX, nextY)
    }

    const handleMouseUp = () => {
      setIsLocalDragging(false)
      setDragContext(null)
      // Restart floating animation after drag
      if (animationsEnabled && !isDragging) {
        startFloatingAnimation()
      }
      if (!hasDraggedRef.current && onClick) {
        onClick()
      }
      hasDraggedRef.current = false
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isLocalDragging,
    dragContext,
    onPositionChange,
    scale,
    onClick,
    animationsEnabled,
    isDragging,
  ])

  const startFloatingAnimation = useCallback(() => {
    if (!nodeRef.current || !animationsEnabled) return
    floatingRef.current = gsap.to(nodeRef.current, {
      y: '+=15',
      duration: 2 + Math.random() * 2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    })
  }, [animationsEnabled])

  useEffect(() => {
    if (animationsEnabled && !isLocalDragging) {
      startFloatingAnimation()
    }
    return () => {
      if (floatingRef.current) {
        floatingRef.current.kill()
      }
    }
  }, [animationsEnabled, isLocalDragging, startFloatingAnimation])

  useEffect(() => {
    if (isLocalDragging) return
    const diff = {
      x: canvasPosition.x - displayPositionRef.current.x,
      y: canvasPosition.y - displayPositionRef.current.y,
    }
    const distance = Math.sqrt(diff.x * diff.x + diff.y * diff.y)
    if (distance < 1) {
      displayPositionRef.current = canvasPosition
      setDisplayPosition(canvasPosition)
      return
    }
    if (animationRef.current) {
      animationRef.current.kill()
    }
    if (!nodeRef.current) return
    const duration = Math.min(0.3, distance / 1000)
    animationRef.current = gsap.to(displayPositionRef.current, {
      x: canvasPosition.x,
      y: canvasPosition.y,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        setDisplayPosition({ ...displayPositionRef.current })
      },
    })
  }, [canvasPosition, isLocalDragging])

  return (
    <div
      ref={nodeRef}
      onMouseDown={handleMouseDown}
      className={cn(
        'absolute -translate-x-1/2 -translate-y-1/2 select-none touch-none',
        (isLocalDragging || isDragging) && 'cursor-grabbing z-50',
        !isLocalDragging && !isDragging && 'cursor-grab'
      )}
      style={{
        left: `${displayPosition.x}px`,
        top: `${displayPosition.y}px`,
      }}
    >
      <PersonNode {...nodeProps} position="center" onClick={() => {}} />
    </div>
  )
}
